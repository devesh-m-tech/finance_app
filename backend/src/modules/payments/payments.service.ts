import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Receipt, ReceiptDocument } from '../receipts/schemas/receipt.schema';
import { Loan, LoanDocument, LoanStatus } from '../loans/schemas/loan.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TransactionHelper } from '../../database/transactions/transaction.helper';
import { CounterService } from '../../database/counters/counter.service';
import { Money } from '../../common/utils/money';
import { ThermalPrinterHelper } from '../../common/utils/thermal-printer';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private transactionHelper: TransactionHelper,
    private counterService: CounterService,
  ) {}

  async collectPayment(dto: CreatePaymentDto, user: any) {
    return this.transactionHelper.withTransaction(async (session) => {
      // 1. Fetch loan within transaction session
      const loan = await this.loanModel
        .findOne({ _id: dto.loanId, isDeleted: false })
        .session(session);

      if (!loan) {
        throw new NotFoundException(`Loan ${dto.loanId} not found`);
      }

      const activeStatuses = [LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.OVERDUE];
      if (!activeStatuses.includes(loan.status)) {
        throw new BadRequestException(
          `Cannot collect payment for loan with status ${loan.status}`
        );
      }

      // Check salesperson scope
      if (user.roles?.includes('SALESPERSON') && loan.assignedTo?.toString() !== user.id) {
        throw new ForbiddenException('You are not authorized to collect payments for this loan');
      }

      const customer = await this.customerModel
        .findOne({ _id: loan.customerId, isDeleted: false })
        .session(session);

      if (!customer) {
        throw new NotFoundException(`Customer for loan ${loan.loanCode} not found`);
      }

      // 2. Financial Waterfall Allocation: Penalty -> Interest -> Principal
      const allocation = Money.allocatePayment(
        dto.amountPaise,
        loan.outstandingPenaltyPaise,
        loan.outstandingInterestPaise,
        loan.outstandingPrincipalPaise
      );

      // 3. Update loan balances
      loan.outstandingPenaltyPaise = Math.max(0, loan.outstandingPenaltyPaise - allocation.penaltyPaidPaise);
      loan.outstandingInterestPaise = Math.max(0, loan.outstandingInterestPaise - allocation.interestPaidPaise);
      loan.outstandingPrincipalPaise = Math.max(0, loan.outstandingPrincipalPaise - allocation.principalPaidPaise);
      loan.totalPaidPaise += dto.amountPaise;

      // 4. Update amortization schedule items
      let remainingToSettle = dto.amountPaise;
      for (const item of loan.schedule) {
        if (remainingToSettle <= 0) break;
        const itemUnpaid = item.totalDuePaise - item.paidPaise;
        if (itemUnpaid > 0) {
          const settlePart = Math.min(remainingToSettle, itemUnpaid);
          item.paidPaise += settlePart;
          remainingToSettle -= settlePart;
          item.status = item.paidPaise >= item.totalDuePaise ? 'PAID' : 'PARTIAL';
          item.paidDate = new Date();
        }
      }

      // 5. Check if loan is fully paid off
      if (loan.outstandingPrincipalPaise <= 0 && loan.outstandingInterestPaise <= 0) {
        loan.status = LoanStatus.CLOSED;
      }

      loan.rev += 1;
      await loan.save({ session });

      // 6. Generate sequential payment & receipt numbers
      const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
      const paymentCode = await this.counterService.generateFormattedCode(
        `PAY-${datePrefix}`,
        'payment_code',
        5,
        session
      );
      const receiptNo = await this.counterService.generateFormattedCode(
        'RCP',
        'receipt_code',
        6,
        session
      );

      const remainingBalancePaise =
        loan.outstandingPrincipalPaise +
        loan.outstandingInterestPaise +
        loan.outstandingPenaltyPaise;

      // 7. Generate 58mm thermal layout
      const thermalTextPayload = ThermalPrinterHelper.generateReceiptText({
        receiptNo,
        loanCode: loan.loanCode,
        customerName: customer.fullName,
        customerMobile: customer.mobile,
        collectedByName: user.fullName || 'Authorized Agent',
        amountPaise: dto.amountPaise,
        penaltyPaidPaise: allocation.penaltyPaidPaise,
        interestPaidPaise: allocation.interestPaidPaise,
        principalPaidPaise: allocation.principalPaidPaise,
        remainingBalancePaise,
        date: new Date(),
      });

      // 8. Create Payment document
      const payment = new this.paymentModel({
        paymentCode,
        receiptNo,
        loanId: loan._id,
        customerId: customer._id,
        branchId: loan.branchId,
        assignedRouteId: loan.assignedRouteId,
        collectedBy: new Types.ObjectId(user.id),
        amountPaise: dto.amountPaise,
        penaltyPaidPaise: allocation.penaltyPaidPaise,
        interestPaidPaise: allocation.interestPaidPaise,
        principalPaidPaise: allocation.principalPaidPaise,
        advancePaidPaise: allocation.remainingAmountPaise,
        paymentMode: dto.paymentMode,
        paymentDate: new Date(),
        gpsLocation: dto.gpsLocation,
        status: 'CONFIRMED',
        notes: dto.notes || '',
        receiptThermalPayload: thermalTextPayload,
      });
      await payment.save({ session });

      // 9. Create Receipt document
      const receipt = new this.receiptModel({
        receiptNo,
        paymentId: payment._id,
        loanId: loan._id,
        loanCode: loan.loanCode,
        customerId: customer._id,
        customerName: customer.fullName,
        customerMobile: customer.mobile,
        amountPaise: dto.amountPaise,
        penaltyPaidPaise: allocation.penaltyPaidPaise,
        interestPaidPaise: allocation.interestPaidPaise,
        principalPaidPaise: allocation.principalPaidPaise,
        remainingBalancePaise,
        paymentMode: dto.paymentMode,
        collectedByName: user.fullName || 'Authorized Agent',
        issuedAt: new Date(),
        thermalTextPayload,
      });
      await receipt.save({ session });

      return {
        payment,
        receipt,
        loanBalance: {
          outstandingPrincipalPaise: loan.outstandingPrincipalPaise,
          outstandingInterestPaise: loan.outstandingInterestPaise,
          outstandingPenaltyPaise: loan.outstandingPenaltyPaise,
          totalRemainingPaise: remainingBalancePaise,
          isClosed: loan.status === LoanStatus.CLOSED,
        },
      };
    });
  }

  async findAll(user: any, query: { page?: number; limit?: number; loanId?: string; date?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };

    if (user.roles?.includes('SALESPERSON')) {
      filter.collectedBy = new Types.ObjectId(user.id);
    } else if (user.roles?.includes('MANAGER') && user.branchId) {
      filter.branchId = new Types.ObjectId(user.branchId);
    }

    if (query.loanId) {
      filter.loanId = new Types.ObjectId(query.loanId);
    }

    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      filter.paymentDate = { $gte: start, $lte: end };
    }

    const [items, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'customerCode fullName mobile')
        .populate('loanId', 'loanCode loanType')
        .populate('collectedBy', 'fullName employeeCode')
        .exec(),
      this.paymentModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: any): Promise<Payment> {
    const payment = await this.paymentModel
      .findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'customerCode fullName mobile')
      .populate('loanId', 'loanCode loanType')
      .populate('collectedBy', 'fullName employeeCode')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    if (user.roles?.includes('SALESPERSON') && payment.collectedBy?._id?.toString() !== user.id) {
      throw new ForbiddenException('You can only view your own payments');
    }

    return payment;
  }
}
