import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CashHandover, CashHandoverDocument, HandoverStatus } from './schemas/cash-handover.schema';
import { Payment, PaymentDocument, PaymentMode } from '../payments/schemas/payment.schema';
import { SubmitHandoverDto, AcceptHandoverDto } from './dto/submit-handover.dto';
import { CounterService } from '../../database/counters/counter.service';

@Injectable()
export class HandoverService {
  constructor(
    @InjectModel(CashHandover.name) private handoverModel: Model<CashHandoverDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private counterService: CounterService,
  ) {}

  async getTodaySummary(user: any) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await this.paymentModel.find({
      collectedBy: new Types.ObjectId(user.id),
      paymentDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'CONFIRMED',
    });

    let totalCollectedCashPaise = 0;
    let totalCollectedUpiPaise = 0;

    for (const p of payments) {
      if (p.paymentMode === PaymentMode.CASH) {
        totalCollectedCashPaise += p.amountPaise;
      } else {
        totalCollectedUpiPaise += p.amountPaise;
      }
    }

    return {
      agentId: user.id,
      agentName: user.fullName,
      date: startOfDay.toISOString().slice(0, 10),
      totalCollectedCashPaise,
      totalCollectedUpiPaise,
      totalPaymentsCount: payments.length,
    };
  }

  async submit(dto: SubmitHandoverDto, user: any): Promise<CashHandover> {
    const summary = await this.getTodaySummary(user);

    const d = dto.denominations;
    const totalSubmittedCashPaise =
      (d.note2000 || 0) * 2000 * 100 +
      (d.note500 || 0) * 500 * 100 +
      (d.note200 || 0) * 200 * 100 +
      (d.note100 || 0) * 100 * 100 +
      (d.note50 || 0) * 50 * 100 +
      (d.note20 || 0) * 20 * 100 +
      (d.note10 || 0) * 10 * 100 +
      (d.coins || 0) * 100;

    const discrepancyPaise = totalSubmittedCashPaise - summary.totalCollectedCashPaise;
    const status =
      discrepancyPaise === 0 ? HandoverStatus.SUBMITTED : HandoverStatus.DISCREPANCY_FLAGGED;

    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const handoverCode = await this.counterService.generateFormattedCode(
      `HND-${datePrefix}`,
      'handover_code',
      5
    );

    const branchId = user.branchId ? new Types.ObjectId(user.branchId) : new Types.ObjectId();

    const handover = new this.handoverModel({
      handoverCode,
      agentId: new Types.ObjectId(user.id),
      branchId,
      handoverDate: new Date(),
      totalCollectedCashPaise: summary.totalCollectedCashPaise,
      totalCollectedUpiPaise: summary.totalCollectedUpiPaise,
      denominations: dto.denominations,
      totalSubmittedCashPaise,
      discrepancyPaise,
      status,
      notes: dto.notes || '',
    });

    return handover.save();
  }

  async accept(id: string, dto: AcceptHandoverDto, user: any): Promise<CashHandover> {
    const handover = await this.handoverModel.findOne({ _id: id, isDeleted: false });
    if (!handover) {
      throw new NotFoundException(`Handover ${id} not found`);
    }

    if (handover.status === HandoverStatus.ACCEPTED) {
      throw new BadRequestException('Handover is already accepted');
    }

    handover.status = HandoverStatus.ACCEPTED;
    handover.acceptedBy = new Types.ObjectId(user.id);
    handover.acceptedAt = new Date();
    if (dto.remarks) {
      handover.notes += ` [Manager: ${dto.remarks}]`;
    }

    return handover.save();
  }

  async findAll(user: any, query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };
    if (user.roles?.includes('SALESPERSON')) {
      filter.agentId = new Types.ObjectId(user.id);
    } else if (user.roles?.includes('MANAGER') && user.branchId) {
      filter.branchId = new Types.ObjectId(user.branchId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.handoverModel
        .find(filter)
        .sort({ handoverDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('agentId', 'fullName employeeCode mobile')
        .populate('acceptedBy', 'fullName role')
        .exec(),
      this.handoverModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
