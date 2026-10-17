import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CollectionVisit, CollectionVisitDocument } from './schemas/collection-visit.schema';
import { Loan, LoanDocument, LoanStatus } from '../loans/schemas/loan.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { CreateVisitDto } from './dto/create-visit.dto';
import { CounterService } from '../../database/counters/counter.service';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(CollectionVisit.name) private visitModel: Model<CollectionVisitDocument>,
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private counterService: CounterService,
  ) {}

  async recordVisit(dto: CreateVisitDto, user: any): Promise<CollectionVisit> {
    const loan = await this.loanModel.findOne({ _id: dto.loanId, isDeleted: false });
    if (!loan) {
      throw new NotFoundException(`Loan ${dto.loanId} not found`);
    }

    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const visitCode = await this.counterService.generateFormattedCode(
      `VST-${datePrefix}`,
      'visit_code',
      5
    );

    const visit = new this.visitModel({
      visitCode,
      loanId: new Types.ObjectId(dto.loanId),
      customerId: new Types.ObjectId(dto.customerId),
      agentId: new Types.ObjectId(user.id),
      routeId: loan.assignedRouteId || 'ROUTE-001',
      outcome: dto.outcome,
      ptpDate: dto.ptpDate,
      ptpAmountPaise: dto.ptpAmountPaise || 0,
      collectedAmountPaise: dto.collectedAmountPaise || 0,
      gpsLocation: dto.gpsLocation,
      notes: dto.notes || '',
      visitTimestamp: new Date(),
    });

    return visit.save();
  }

  async getCollectionSheet(routeId: string, dateStr: string, user: any) {
    const queryDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const loanFilter: any = {
      status: { $in: [LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.OVERDUE] },
      isDeleted: false,
    };

    if (routeId) {
      loanFilter.assignedRouteId = routeId;
    }

    if (user.roles?.includes('SALESPERSON')) {
      loanFilter.assignedTo = new Types.ObjectId(user.id);
    }

    const loans = await this.loanModel
      .find(loanFilter)
      .populate('customerId', 'customerCode fullName mobile address maskedAadhaar')
      .populate('assignedTo', 'fullName')
      .exec();

    // Fetch today's payments and visits for these loans
    const loanIds = loans.map((l) => l._id);
    const [todaysPayments, todaysVisits] = await Promise.all([
      this.paymentModel.find({
        loanId: { $in: loanIds },
        paymentDate: { $gte: startOfDay, $lte: endOfDay },
      }),
      this.visitModel.find({
        loanId: { $in: loanIds },
        visitTimestamp: { $gte: startOfDay, $lte: endOfDay },
      }),
    ]);

    let totalDueTodayPaise = 0;
    let totalCollectedTodayPaise = 0;

    const items = loans.map((loan) => {
      // Find installment due on or before today
      const pendingSchedule = loan.schedule.find(
        (s) => s.status === 'PENDING' || s.status === 'PARTIAL'
      );
      const installmentDuePaise = pendingSchedule
        ? pendingSchedule.totalDuePaise - pendingSchedule.paidPaise
        : loan.installmentAmountPaise;

      totalDueTodayPaise += installmentDuePaise;

      const paymentToday = todaysPayments.find((p) => p.loanId.toString() === loan._id.toString());
      const visitToday = todaysVisits.find((v) => v.loanId.toString() === loan._id.toString());

      if (paymentToday) {
        totalCollectedTodayPaise += paymentToday.amountPaise;
      }

      return {
        loanId: loan._id,
        loanCode: loan.loanCode,
        loanType: loan.loanType,
        customer: loan.customerId,
        installmentAmountPaise: loan.installmentAmountPaise,
        dueTodayPaise: installmentDuePaise,
        totalOutstandingPaise:
          loan.outstandingPrincipalPaise +
          loan.outstandingInterestPaise +
          loan.outstandingPenaltyPaise,
        status: loan.status,
        collectionStatus: paymentToday
          ? 'PAID'
          : visitToday
          ? visitToday.outcome
          : 'PENDING',
        paidTodayPaise: paymentToday ? paymentToday.amountPaise : 0,
        lastReceiptNo: paymentToday?.receiptNo || null,
        visitNote: visitToday?.notes || null,
      };
    });

    return {
      routeId: routeId || 'ALL',
      date: startOfDay.toISOString().slice(0, 10),
      totalCustomers: items.length,
      totalDueTodayPaise,
      totalCollectedTodayPaise,
      items,
    };
  }

  async getVisits(user: any, query: { page?: number; limit?: number; date?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };
    if (user.roles?.includes('SALESPERSON')) {
      filter.agentId = new Types.ObjectId(user.id);
    }

    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      filter.visitTimestamp = { $gte: start, $lte: end };
    }

    const [items, total] = await Promise.all([
      this.visitModel
        .find(filter)
        .sort({ visitTimestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'fullName mobile')
        .populate('loanId', 'loanCode')
        .populate('agentId', 'fullName')
        .exec(),
      this.visitModel.countDocuments(filter),
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
