import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receipt, ReceiptDocument } from './schemas/receipt.schema';
import { ThermalPrinterHelper } from '../../common/utils/thermal-printer';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
  ) {}

  async findAll(user: any, query: { page?: number; limit?: number; customerId?: string; loanId?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.customerId) filter.customerId = new Types.ObjectId(query.customerId);
    if (query.loanId) filter.loanId = new Types.ObjectId(query.loanId);

    const [items, total] = await Promise.all([
      this.receiptModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.receiptModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Receipt> {
    const receipt = await this.receiptModel.findOne({ _id: id });
    if (!receipt) {
      throw new NotFoundException(`Receipt ${id} not found`);
    }
    return receipt;
  }

  async getPrintPayload(id: string) {
    const receipt = await this.findOne(id);
    const escPosBuffer = ThermalPrinterHelper.generateEscPosBuffer(receipt.thermalTextPayload);

    return {
      receiptNo: receipt.receiptNo,
      loanCode: receipt.loanCode,
      customerName: receipt.customerName,
      amountPaise: receipt.amountPaise,
      remainingBalancePaise: receipt.remainingBalancePaise,
      thermalTextPayload: receipt.thermalTextPayload,
      escPosBase64: escPosBuffer.toString('base64'),
    };
  }

  async cancelReceipt(id: string, reason: string, user: any) {
    const receipt = await this.findOne(id);
    if (receipt.isCancelled) {
      throw new BadRequestException('Receipt is already cancelled');
    }

    receipt.isCancelled = true;
    receipt.cancellationReason = reason || 'Admin reversal';
    return receipt.save();
  }
}
