import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan, LoanDocument, LoanStatus } from '../loans/schemas/loan.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async getPortfolioSummary(branchId?: string) {
    const filter: any = { isDeleted: false };
    if (branchId) filter.branchId = new Types.ObjectId(branchId);

    const loans = await this.loanModel.find(filter).exec();

    let activeLoansCount = 0;
    let closedLoansCount = 0;
    let overdueLoansCount = 0;
    let totalPrincipalDisbursedPaise = 0;
    let totalOutstandingPrincipalPaise = 0;
    let totalOutstandingInterestPaise = 0;
    let totalOutstandingPenaltyPaise = 0;
    let totalCollectedPaise = 0;

    for (const l of loans) {
      if (l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DISBURSED) {
        activeLoansCount++;
      } else if (l.status === LoanStatus.CLOSED) {
        closedLoansCount++;
      } else if (l.status === LoanStatus.OVERDUE) {
        overdueLoansCount++;
      }

      totalPrincipalDisbursedPaise += l.principalPaise;
      totalOutstandingPrincipalPaise += l.outstandingPrincipalPaise;
      totalOutstandingInterestPaise += l.outstandingInterestPaise;
      totalOutstandingPenaltyPaise += l.outstandingPenaltyPaise;
      totalCollectedPaise += l.totalPaidPaise;
    }

    const totalPortfolioOutstandingPaise =
      totalOutstandingPrincipalPaise +
      totalOutstandingInterestPaise +
      totalOutstandingPenaltyPaise;

    const totalCommitment = totalPrincipalDisbursedPaise;
    const recoveryRate =
      totalCommitment > 0 ? Number(((totalCollectedPaise / totalCommitment) * 100).toFixed(2)) : 0;

    return {
      activeLoansCount,
      closedLoansCount,
      overdueLoansCount,
      totalLoansCount: loans.length,
      totalPrincipalDisbursedPaise,
      totalOutstandingPrincipalPaise,
      totalOutstandingInterestPaise,
      totalOutstandingPenaltyPaise,
      totalPortfolioOutstandingPaise,
      totalCollectedPaise,
      recoveryRatePercent: recoveryRate,
    };
  }

  async getParReport(branchId?: string) {
    const filter: any = {
      status: { $in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] },
      isDeleted: false,
    };
    if (branchId) filter.branchId = new Types.ObjectId(branchId);

    const loans = await this.loanModel.find(filter).exec();
    const today = new Date();

    let currentPaise = 0;
    let par1To30Paise = 0;
    let par31To60Paise = 0;
    let par61To90Paise = 0;
    let npaOver90Paise = 0;

    for (const loan of loans) {
      const outstanding =
        loan.outstandingPrincipalPaise + loan.outstandingInterestPaise + loan.outstandingPenaltyPaise;

      // Find oldest unpaid overdue installment
      const overdueItem = loan.schedule.find(
        (s) => s.status === 'OVERDUE' || (s.status === 'PENDING' && new Date(s.dueDate) < today)
      );

      if (!overdueItem) {
        currentPaise += outstanding;
      } else {
        const daysOverdue = Math.floor(
          (today.getTime() - new Date(overdueItem.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysOverdue <= 30) par1To30Paise += outstanding;
        else if (daysOverdue <= 60) par31To60Paise += outstanding;
        else if (daysOverdue <= 90) par61To90Paise += outstanding;
        else npaOver90Paise += outstanding;
      }
    }

    const totalPortfolio =
      currentPaise + par1To30Paise + par31To60Paise + par61To90Paise + npaOver90Paise;

    return {
      totalPortfolioPaise: totalPortfolio,
      currentPaise,
      par1To30Paise,
      par31To60Paise,
      par61To90Paise,
      npaOver90Paise,
      npaRatioPercent:
        totalPortfolio > 0 ? Number(((npaOver90Paise / totalPortfolio) * 100).toFixed(2)) : 0,
    };
  }

  async getRoutePerformance(branchId?: string) {
    const filter: any = { isDeleted: false };
    if (branchId) filter.branchId = new Types.ObjectId(branchId);

    const loans = await this.loanModel.find(filter).exec();
    const routeMap: Record<
      string,
      { routeId: string; totalLoans: number; totalDuePaise: number; totalCollectedPaise: number }
    > = {};

    for (const l of loans) {
      const rId = l.assignedRouteId || 'ROUTE-001';
      if (!routeMap[rId]) {
        routeMap[rId] = {
          routeId: rId,
          totalLoans: 0,
          totalDuePaise: 0,
          totalCollectedPaise: 0,
        };
      }
      routeMap[rId].totalLoans++;
      routeMap[rId].totalDuePaise += l.totalPayablePaise;
      routeMap[rId].totalCollectedPaise += l.totalPaidPaise;
    }

    return Object.values(routeMap).map((r) => ({
      ...r,
      efficiencyPercent:
        r.totalDuePaise > 0
          ? Number(((r.totalCollectedPaise / r.totalDuePaise) * 100).toFixed(2))
          : 0,
    }));
  }
}
