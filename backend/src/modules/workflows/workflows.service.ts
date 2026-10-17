import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkflowDefinition } from './workflow-definition.schema';
import { WorkflowInstance } from './workflow-instance.schema';
import { WorkflowHistory } from './workflow-history.schema';
import { TransactionHelper } from '../../database/transactions/transaction.helper';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

export interface TransitionPayload {
  toState: string;
  remark?: string;
  deviceId?: string;
  gpsCoordinates?: { lat: number; lng: number };
  contextData?: {
    createdBy?: string;
    amountPaise?: number;
    ltvPercent?: number;
    cibilScore?: number;
    isKycVerified?: boolean;
    isFingerprintCaptured?: boolean;
    mandatoryDocsVerified?: boolean;
  };
}

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectModel(WorkflowDefinition.name)
    private definitionModel: Model<WorkflowDefinition>,
    @InjectModel(WorkflowInstance.name)
    private instanceModel: Model<WorkflowInstance>,
    @InjectModel(WorkflowHistory.name)
    private historyModel: Model<WorkflowHistory>,
    private transactionHelper: TransactionHelper
  ) {}

  async getDefinition(entityType: string): Promise<WorkflowDefinition> {
    const def = await this.definitionModel.findOne({ entityType }).exec();
    if (!def) {
      throw new NotFoundException(`Workflow definition for '${entityType}' not found`);
    }
    return def;
  }

  async getAllDefinitions(): Promise<WorkflowDefinition[]> {
    return this.definitionModel.find({ isActive: true }).exec();
  }

  async saveDefinition(entityType: string, dto: any): Promise<WorkflowDefinition> {
    // Basic validation: ensure states and initialState exist
    if (!dto.states || dto.states.length === 0) {
      throw new BadRequestException('Workflow must have at least one state');
    }
    if (!dto.states.includes(dto.initialState)) {
      throw new BadRequestException('Initial state must be included in the states list');
    }

    const existing = await this.definitionModel.findOne({ entityType }).exec();
    const newVersion = existing ? existing.version + 1 : 1;

    return this.definitionModel.findOneAndUpdate(
      { entityType },
      {
        entityType,
        title: dto.title || entityType,
        version: newVersion,
        initialState: dto.initialState,
        states: dto.states,
        transitions: dto.transitions || [],
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }

  async getOrCreateInstance(
    entityType: string,
    entityId: string,
    initialStateOverride?: string
  ): Promise<WorkflowInstance> {
    let instance = await this.instanceModel.findOne({ entityType, entityId }).exec();
    if (!instance) {
      const def = await this.getDefinition(entityType);
      instance = await this.instanceModel.create({
        entityType,
        entityId,
        currentState: initialStateOverride || def.initialState,
        definitionVersion: def.version,
        rev: 0,
      });
    }
    return instance;
  }

  async getAllowedTransitions(
    entityType: string,
    entityId: string,
    user: AuthenticatedUser,
    contextData: any = {}
  ) {
    const [def, instance] = await Promise.all([
      this.getDefinition(entityType),
      this.getOrCreateInstance(entityType, entityId),
    ]);

    const potentialTransitions = def.transitions.filter(
      (t) => t.fromState === instance.currentState
    );

    const allowed = [];
    for (const t of potentialTransitions) {
      // 1. Check Role Authorization
      if (!t.allowedRoles.includes(user.role)) {
        continue;
      }

      // 2. Maker-Checker Rule: Manager cannot approve their own created loan
      if (
        user.role === 'MANAGER' &&
        contextData.createdBy &&
        contextData.createdBy === user.userId &&
        t.toState.toUpperCase().includes('APPROV')
      ) {
        continue; // Blocked: Maker cannot be checker
      }

      // 3. Declarative Guard Evaluations
      const g = t.guards;
      if (g) {
        if (g.minAmountPaise && (contextData.amountPaise || 0) < g.minAmountPaise) continue;
        if (g.maxAmountPaise && (contextData.amountPaise || 0) > g.maxAmountPaise) continue;
        if (g.maxLtvPercent && (contextData.ltvPercent || 0) > g.maxLtvPercent) continue;
        if (g.minCibilScore && (contextData.cibilScore || 0) < g.minCibilScore) continue;
        if (g.requireKycVerified && !contextData.isKycVerified) continue;
        if (g.requireFingerprint && !contextData.isFingerprintCaptured) continue;
        if (g.requireMandatoryDocsVerified && !contextData.mandatoryDocsVerified) continue;
      }

      allowed.push(t);
    }

    return {
      currentState: instance.currentState,
      definitionVersion: instance.definitionVersion,
      allowedTransitions: allowed,
    };
  }

  async executeTransition(
    entityType: string,
    entityId: string,
    payload: TransitionPayload,
    user: AuthenticatedUser
  ) {
    return this.transactionHelper.withTransaction(async (session) => {
      const def = await this.getDefinition(entityType);
      const instance = await this.instanceModel
        .findOne({ entityType, entityId })
        .session(session)
        .exec();

      if (!instance) {
        throw new NotFoundException(`Workflow instance for ${entityType} ${entityId} not found`);
      }

      const transition = def.transitions.find(
        (t) => t.fromState === instance.currentState && t.toState === payload.toState
      );

      if (!transition) {
        throw new BadRequestException(
          `Invalid transition from '${instance.currentState}' to '${payload.toState}' for ${entityType}`
        );
      }

      // Check role
      if (!transition.allowedRoles.includes(user.role)) {
        throw new ForbiddenException(
          `Role '${user.role}' is not authorized to execute transition to '${payload.toState}'`
        );
      }

      // Maker-checker check
      if (
        user.role === 'MANAGER' &&
        payload.contextData?.createdBy &&
        payload.contextData.createdBy === user.userId &&
        payload.toState.toUpperCase().includes('APPROV')
      ) {
        throw new ForbiddenException(
          'Maker-Checker Violation: You cannot approve a loan application you created yourself.'
        );
      }

      // Guard check
      const g = transition.guards;
      if (g && user.role !== 'SUPER_ADMIN') {
        if (g.maxLtvPercent && (payload.contextData?.ltvPercent || 0) > g.maxLtvPercent) {
          throw new BadRequestException(
            `LTV (${payload.contextData?.ltvPercent}%) exceeds permitted threshold (${g.maxLtvPercent}%). Super Admin override required.`
          );
        }
        if (g.requireKycVerified && !payload.contextData?.isKycVerified) {
          throw new BadRequestException('Transition blocked: KYC verification is pending.');
        }
        if (g.requireMandatoryDocsVerified && !payload.contextData?.mandatoryDocsVerified) {
          throw new BadRequestException('Transition blocked: Mandatory document checklist is incomplete.');
        }
      }

      // Optimistic concurrency update
      const updated = await this.instanceModel
        .findOneAndUpdate(
          { _id: instance._id, rev: instance.rev },
          {
            currentState: payload.toState,
            $inc: { rev: 1 },
          },
          { session, new: true }
        )
        .exec();

      if (!updated) {
        throw new BadRequestException(
          'Concurrent transition detected! The workflow state was modified by another operator. Please refresh.'
        );
      }

      // Write immutable history record
      await this.historyModel.create(
        [
          {
            entityType,
            entityId,
            fromState: instance.currentState,
            toState: payload.toState,
            actionLabel: transition.actionLabel,
            performedBy: user.userId,
            remark: payload.remark || '',
            deviceId: payload.deviceId || '',
            gpsCoordinates: payload.gpsCoordinates || null,
          },
        ],
        { session }
      );

      return {
        success: true,
        entityType,
        entityId,
        previousState: instance.currentState,
        currentState: payload.toState,
        actionLabel: transition.actionLabel,
      };
    });
  }

  async getHistory(entityType: string, entityId: string): Promise<WorkflowHistory[]> {
    return this.historyModel
      .find({ entityType, entityId })
      .sort({ createdAt: 1 })
      .populate('performedBy', 'username fullName role')
      .exec();
  }
}
