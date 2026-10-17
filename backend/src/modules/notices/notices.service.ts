import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notice, NoticeDocument, NoticeType } from './schemas/notice.schema';
import { Loan, LoanDocument } from '../loans/schemas/loan.schema';
import { CounterService } from '../../database/counters/counter.service';

@Injectable()
export class NoticesService {
  constructor(
    @InjectModel(Notice.name) private noticeModel: Model<NoticeDocument>,
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    private counterService: CounterService,
  ) {}

  async generateNotice(loanId: string, noticeType: NoticeType, sentVia = 'WHATSAPP') {
    const loan = await this.loanModel.findOne({ _id: loanId, isDeleted: false });
    if (!loan) throw new NotFoundException(`Loan ${loanId} not found`);

    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const noticeCode = await this.counterService.generateFormattedCode(`NOT-${datePrefix}`, 'notice_code', 5);

    const overdueAmountPaise = loan.outstandingPrincipalPaise + loan.outstandingInterestPaise + loan.outstandingPenaltyPaise;

    const notice = new this.noticeModel({
      noticeCode,
      noticeType,
      loanId: loan._id,
      customerId: loan.customerId,
      overdueDays: 15,
      overdueAmountPaise,
      sentVia,
      dispatchedAt: new Date(),
      status: 'DISPATCHED',
      pdfUrl: `/api/v1/pdf/notice/${noticeCode}`,
    });

    return notice.save();
  }

  async findAll(query: { loanId?: string; customerId?: string }) {
    const filter: any = { isDeleted: false };
    if (query.loanId) filter.loanId = new Types.ObjectId(query.loanId);
    if (query.customerId) filter.customerId = new Types.ObjectId(query.customerId);

    return this.noticeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('customerId', 'fullName mobile address')
      .populate('loanId', 'loanCode loanType')
      .exec();
  }
}
