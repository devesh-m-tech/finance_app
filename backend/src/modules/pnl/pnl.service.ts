import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Expense, ExpenseDocument } from '../expenses/schemas/expense.schema';

@Injectable()
export class PnlService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async calculatePnl(startDateStr?: string, endDateStr?: string, branchId?: string) {
    const end = endDateStr ? new Date(endDateStr) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDateStr
      ? new Date(startDateStr)
      : new Date(end.getFullYear(), end.getMonth(), 1); // Default first day of current month
    start.setHours(0, 0, 0, 0);

    const paymentFilter: any = {
      paymentDate: { $gte: start, $lte: end },
      status: 'CONFIRMED',
      isDeleted: false,
    };
    const expenseFilter: any = {
      expenseDate: { $gte: start, $lte: end },
      isDeleted: false,
    };

    if (branchId) {
      paymentFilter.branchId = new Types.ObjectId(branchId);
      expenseFilter.branchId = new Types.ObjectId(branchId);
    }

    const [payments, expenses] = await Promise.all([
      this.paymentModel.find(paymentFilter).exec(),
      this.expenseModel.find(expenseFilter).exec(),
    ]);

    let interestRevenuePaise = 0;
    let penaltyRevenuePaise = 0;
    let principalCollectedPaise = 0;

    for (const p of payments) {
      interestRevenuePaise += p.interestPaidPaise || 0;
      penaltyRevenuePaise += p.penaltyPaidPaise || 0;
      principalCollectedPaise += p.principalPaidPaise || 0;
    }

    const processingFeesPaise = Math.round(interestRevenuePaise * 0.05); // Estimated 5% doc charge
    const totalRevenuePaise = interestRevenuePaise + penaltyRevenuePaise + processingFeesPaise;

    let totalExpensesPaise = 0;
    const expenseByCategory: Record<string, number> = {};

    for (const e of expenses) {
      totalExpensesPaise += e.amountPaise;
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amountPaise;
    }

    const netProfitPaise = totalRevenuePaise - totalExpensesPaise;
    const profitMarginPercent =
      totalRevenuePaise > 0 ? Number(((netProfitPaise / totalRevenuePaise) * 100).toFixed(2)) : 0;

    return {
      period: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      },
      revenue: {
        interestRevenuePaise,
        penaltyRevenuePaise,
        processingFeesPaise,
        totalRevenuePaise,
        principalCollectedPaise, // Cash flow reference
      },
      expenses: {
        totalExpensesPaise,
        byCategory: expenseByCategory,
      },
      profitability: {
        netProfitPaise,
        profitMarginPercent,
        isProfitable: netProfitPaise >= 0,
      },
    };
  }
}
