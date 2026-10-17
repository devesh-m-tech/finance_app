import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan, LoanDocument, LoanStatus } from '../loans/schemas/loan.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async getPortfolioMetrics() {
    const activeLoans = await this.loanModel.find({
      status: { $in: [LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.OVERDUE] },
      isDeleted: false,
    });

    let totalPortfolioPaise = 0;
    let totalDisbursedPaise = 0;
    for (const l of activeLoans) {
      totalPortfolioPaise += l.outstandingPrincipalPaise + l.outstandingInterestPaise;
      totalDisbursedPaise += l.principalPaise;
    }

    return {
      activeLoansCount: activeLoans.length,
      totalPortfolioPaise,
      totalDisbursedPaise,
      todayCollectionEfficiency: 96.4,
      overdueLoansCount: activeLoans.filter((l) => l.status === LoanStatus.OVERDUE).length,
    };
  }

  async getPersonalSummary(user: any) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const paymentsToday = await this.paymentModel.find({
      collectedBy: new Types.ObjectId(user.id),
      paymentDate: { $gte: startOfDay },
      status: 'CONFIRMED',
    });

    let collectedTodayPaise = 0;
    for (const p of paymentsToday) {
      collectedTodayPaise += p.amountPaise;
    }

    return {
      agentId: user.id,
      agentName: user.fullName,
      collectedTodayPaise,
      dailyTargetPaise: 6000000, // ₹60,000 target
      achievedPercent: Number(((collectedTodayPaise / 6000000) * 100).toFixed(1)),
      transactionsCount: paymentsToday.length,
    };
  }
}
