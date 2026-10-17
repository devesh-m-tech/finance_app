import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan, LoanDocument, LoanStatus, LoanType } from './schemas/loan.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { CreateLoanDto, PreviewLoanDto, ApproveLoanDto } from './dto/create-loan.dto';
import { CounterService } from '../../database/counters/counter.service';
import { Money } from '../../common/utils/money';

@Injectable()
export class LoansService {
  constructor(
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private counterService: CounterService,
  ) {}

  preview(dto: PreviewLoanDto) {
    let calculationResult: any;

    if (dto.calculationType === 'REDUCING' && dto.tenureUnit === 'MONTHS') {
      calculationResult = Money.calculateReducingLoan(
        dto.principalPaise,
        dto.interestRatePercent,
        dto.tenure
      );
    } else if (dto.loanType === LoanType.DAILY || dto.loanType === LoanType.WEEKLY) {
      calculationResult = Money.calculateMicroLoan(
        dto.principalPaise,
        dto.interestRatePercent,
        dto.tenure
      );
    } else {
      const tenureInMonths =
        dto.tenureUnit === 'DAYS'
          ? dto.tenure / 30
          : dto.tenureUnit === 'WEEKS'
          ? dto.tenure / 4.33
          : dto.tenure;

      calculationResult = Money.calculateFlatLoan(
        dto.principalPaise,
        dto.interestRatePercent,
        tenureInMonths
      );
    }

    const today = new Date();
    const scheduleItems = calculationResult.schedule.map((item: any, index: number) => {
      const dueDate = new Date(today);
      if (dto.repaymentFrequency === 'DAILY') {
        dueDate.setDate(today.getDate() + (index + 1));
      } else if (dto.repaymentFrequency === 'WEEKLY') {
        dueDate.setDate(today.getDate() + (index + 1) * 7);
      } else {
        dueDate.setMonth(today.getMonth() + (index + 1));
      }

      return {
        installmentNo: item.installmentNo,
        dueDate,
        principalDuePaise: item.principalPaise || item.totalDuePaise,
        interestDuePaise: item.interestPaise || item.chargePaise || 0,
        penaltyDuePaise: 0,
        totalDuePaise: item.totalDuePaise,
        paidPaise: 0,
        status: 'PENDING',
      };
    });

    const totalInterestPaise =
      calculationResult.totalInterestPaise || calculationResult.totalChargesPaise || 0;
    const totalPayablePaise = calculationResult.totalPayablePaise;
    const installmentAmountPaise =
      calculationResult.monthlyInstallmentPaise ||
      calculationResult.monthlyEmiPaise ||
      calculationResult.installmentPaise ||
      scheduleItems[0]?.totalDuePaise ||
      0;

    return {
      principalPaise: dto.principalPaise,
      interestRatePercent: dto.interestRatePercent,
      tenure: dto.tenure,
      tenureUnit: dto.tenureUnit,
      calculationType: dto.calculationType,
      repaymentFrequency: dto.repaymentFrequency,
      totalInterestPaise,
      totalPayablePaise,
      installmentAmountPaise,
      schedule: scheduleItems,
    };
  }

  async create(dto: CreateLoanDto, user: any): Promise<Loan> {
    const customer = await this.customerModel.findOne({ _id: dto.customerId, isDeleted: false });
    if (!customer) {
      throw new NotFoundException(`Customer ${dto.customerId} not found`);
    }

    // Gold/Silver LTV statutory ceiling guard
    if (dto.loanType === LoanType.METAL) {
      if (!dto.metalCollateral) {
        throw new BadRequestException('Metal collateral details are required for Gold/Silver loans');
      }
      const maxAllowedPrincipalPaise = Math.floor(
        (dto.metalCollateral.totalValuationPaise * dto.metalCollateral.ltvPercent) / 100
      );
      if (dto.principalPaise > maxAllowedPrincipalPaise) {
        throw new BadRequestException(
          `Loan principal (₹${dto.principalPaise / 100}) exceeds maximum allowed LTV ceiling of ${
            dto.metalCollateral.ltvPercent
          }% (₹${maxAllowedPrincipalPaise / 100})`
        );
      }
    }

    // Vehicle Collateral Check
    if (
      (dto.loanType === LoanType.TWO_WHEELER || dto.loanType === LoanType.FOUR_WHEELER) &&
      !dto.vehicleCollateral
    ) {
      throw new BadRequestException('Vehicle collateral details are required for Vehicle loans');
    }

    const preview = this.preview(dto);
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const loanCode = await this.counterService.generateFormattedCode(
      `LN-${datePrefix}`,
      'loan_code',
      5
    );

    const branchId = customer.branchId || (user.branchId ? new Types.ObjectId(user.branchId) : new Types.ObjectId());
    const assignedTo = customer.assignedTo || new Types.ObjectId(user.id);
    const assignedRouteId = dto.assignedRouteId || customer.assignedRouteId || 'ROUTE-001';

    const loan = new this.loanModel({
      loanCode,
      loanType: dto.loanType,
      customerId: new Types.ObjectId(dto.customerId),
      branchId,
      assignedRouteId,
      assignedTo,
      principalPaise: dto.principalPaise,
      interestRatePercent: dto.interestRatePercent,
      tenure: dto.tenure,
      tenureUnit: dto.tenureUnit,
      calculationType: dto.calculationType,
      repaymentFrequency: dto.repaymentFrequency,
      totalInterestPaise: preview.totalInterestPaise,
      totalPayablePaise: preview.totalPayablePaise,
      installmentAmountPaise: preview.installmentAmountPaise,
      outstandingPrincipalPaise: dto.principalPaise,
      outstandingInterestPaise: preview.totalInterestPaise,
      outstandingPenaltyPaise: 0,
      totalPaidPaise: 0,
      status: LoanStatus.SUBMITTED,
      schedule: preview.schedule,
      vehicleCollateral: dto.vehicleCollateral,
      metalCollateral: dto.metalCollateral,
      createdBy: new Types.ObjectId(user.id),
      rev: 1,
    });

    return loan.save();
  }

  async approve(id: string, dto: ApproveLoanDto, user: any): Promise<Loan> {
    const loan = await this.loanModel.findOne({ _id: id, isDeleted: false });
    if (!loan) {
      throw new NotFoundException(`Loan ${id} not found`);
    }

    if (loan.status !== LoanStatus.SUBMITTED) {
      throw new BadRequestException(`Cannot approve loan with status ${loan.status}`);
    }

    // Maker-Checker Security Rule:
    // Creator cannot approve their own loan application unless user is SUPER_ADMIN
    const isSuperAdmin = user.roles?.includes('SUPER_ADMIN');
    if (loan.createdBy.toString() === user.id && !isSuperAdmin) {
      throw new ForbiddenException(
        'Maker-Checker Policy: You cannot approve a loan application you created.'
      );
    }

    loan.status = LoanStatus.APPROVED;
    loan.approvedBy = new Types.ObjectId(user.id);
    loan.approvedAt = new Date();
    loan.approvalRemarks = dto.remarks || '';
    loan.rev += 1;

    return loan.save();
  }

  async disburse(id: string, user: any): Promise<Loan> {
    const loan = await this.loanModel.findOne({ _id: id, isDeleted: false });
    if (!loan) {
      throw new NotFoundException(`Loan ${id} not found`);
    }

    if (loan.status !== LoanStatus.APPROVED) {
      throw new BadRequestException(`Loan must be in APPROVED status to disburse (Current: ${loan.status})`);
    }

    const now = new Date();
    loan.status = LoanStatus.ACTIVE;
    loan.disbursedAt = now;
    loan.disbursedBy = new Types.ObjectId(user.id);

    // Re-anchor schedule dates starting from today
    loan.schedule.forEach((item, index) => {
      const dueDate = new Date(now);
      if (loan.repaymentFrequency === 'DAILY') {
        dueDate.setDate(now.getDate() + (index + 1));
      } else if (loan.repaymentFrequency === 'WEEKLY') {
        dueDate.setDate(now.getDate() + (index + 1) * 7);
      } else {
        dueDate.setMonth(now.getMonth() + (index + 1));
      }
      item.dueDate = dueDate;
    });

    loan.maturityDate = loan.schedule[loan.schedule.length - 1]?.dueDate || now;
    loan.rev += 1;

    return loan.save();
  }

  async findAll(user: any, query: { page?: number; limit?: number; status?: string; routeId?: string; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };

    if (user.roles?.includes('SALESPERSON')) {
      filter.assignedTo = new Types.ObjectId(user.id);
    } else if (user.roles?.includes('MANAGER') && user.branchId) {
      filter.branchId = new Types.ObjectId(user.branchId);
    }

    if (query.status) {
      filter.status = query.status;
    }
    if (query.routeId) {
      filter.assignedRouteId = query.routeId;
    }
    if (query.search) {
      filter.loanCode = { $regex: query.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.loanModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'customerCode fullName mobile address')
        .populate('assignedTo', 'fullName')
        .exec(),
      this.loanModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: any): Promise<Loan> {
    const loan = await this.loanModel
      .findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'customerCode fullName mobile address maskedAadhaar')
      .populate('assignedTo', 'fullName employeeCode')
      .populate('createdBy', 'fullName role')
      .populate('approvedBy', 'fullName role')
      .exec();

    if (!loan) {
      throw new NotFoundException(`Loan ${id} not found`);
    }

    if (user.roles?.includes('SALESPERSON') && loan.assignedTo?._id?.toString() !== user.id) {
      throw new ForbiddenException('You can only view loans assigned to your route');
    }

    return loan;
  }
}
