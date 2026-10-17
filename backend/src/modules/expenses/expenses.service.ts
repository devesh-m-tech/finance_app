import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CounterService } from '../../database/counters/counter.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    private counterService: CounterService,
  ) {}

  async create(dto: CreateExpenseDto, user: any): Promise<Expense> {
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const expenseCode = await this.counterService.generateFormattedCode(
      `EXP-${datePrefix}`,
      'expense_code',
      5
    );

    const branchId = user.branchId ? new Types.ObjectId(user.branchId) : new Types.ObjectId();

    const expense = new this.expenseModel({
      expenseCode,
      branchId,
      category: dto.category,
      amountPaise: dto.amountPaise,
      paymentMode: dto.paymentMode,
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
      spentBy: new Types.ObjectId(user.id),
      approvedBy: new Types.ObjectId(user.id),
      receiptUrl: dto.receiptUrl || '',
      notes: dto.notes || '',
    });

    return expense.save();
  }

  async findAll(user: any, query: { page?: number; limit?: number; category?: string; month?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };
    if (user.roles?.includes('MANAGER') && user.branchId) {
      filter.branchId = new Types.ObjectId(user.branchId);
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.month) {
      const start = new Date(`${query.month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.expenseDate = { $gte: start, $lt: end };
    }

    const [items, total] = await Promise.all([
      this.expenseModel
        .find(filter)
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('spentBy', 'fullName employeeCode')
        .exec(),
      this.expenseModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseModel
      .findOne({ _id: id, isDeleted: false })
      .populate('spentBy', 'fullName employeeCode')
      .exec();

    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found`);
    }

    return expense;
  }
}
