import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Loan, LoanDocument, LoanStatus } from '../loans/schemas/loan.schema';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(@InjectModel(Loan.name) private loanModel: Model<LoanDocument>) {}

  /**
   * Evaluates active loans and marks overdue schedules & overdue loans.
   */
  async processDailyOverdueAndPenalties() {
    this.logger.log('Starting daily overdue scan and penalty accrual...');
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const activeLoans = await this.loanModel.find({
      status: { $in: [LoanStatus.ACTIVE, LoanStatus.DISBURSED] },
      isDeleted: false,
    });

    let overdueCount = 0;
    let penaltyAddedPaise = 0;

    for (const loan of activeLoans) {
      let isOverdue = false;

      for (const item of loan.schedule) {
        if (new Date(item.dueDate) < today && item.status !== 'PAID') {
          item.status = 'OVERDUE';
          isOverdue = true;

          // Default daily penalty: 1000 paise (Rs. 10) per overdue day if not already assessed
          if (item.penaltyDuePaise === 0) {
            item.penaltyDuePaise = 1000;
            loan.outstandingPenaltyPaise += 1000;
            penaltyAddedPaise += 1000;
          }
        }
      }

      if (isOverdue && loan.status !== LoanStatus.OVERDUE) {
        loan.status = LoanStatus.OVERDUE;
        loan.rev += 1;
        await loan.save();
        overdueCount++;
      }
    }

    this.logger.log(`Overdue check complete: ${overdueCount} loans flagged, ₹${penaltyAddedPaise / 100} penalty applied.`);

    return {
      processedDate: today.toISOString().slice(0, 10),
      totalScanned: activeLoans.length,
      overdueLoansUpdated: overdueCount,
      penaltyAddedPaise,
    };
  }
}
