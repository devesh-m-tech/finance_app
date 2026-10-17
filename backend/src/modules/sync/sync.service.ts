import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Loan, LoanDocument } from '../loans/schemas/loan.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { PaymentsService } from '../payments/payments.service';
import { CollectionsService } from '../collections/collections.service';

export interface SyncPushPayload {
  payments: Array<any>;
  visits: Array<any>;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private paymentsService: PaymentsService,
    private collectionsService: CollectionsService,
  ) {}

  async pull(sinceStr: string, user: any) {
    const since = sinceStr ? new Date(sinceStr) : new Date(0);

    const customerFilter: any = { updatedAt: { $gt: since }, isDeleted: false };
    const loanFilter: any = { updatedAt: { $gt: since }, isDeleted: false };

    if (user.roles?.includes('SALESPERSON')) {
      customerFilter.assignedTo = new Types.ObjectId(user.id);
      loanFilter.assignedTo = new Types.ObjectId(user.id);
    } else if (user.roles?.includes('MANAGER') && user.branchId) {
      customerFilter.branchId = new Types.ObjectId(user.branchId);
      loanFilter.branchId = new Types.ObjectId(user.branchId);
    }

    const [customers, loans] = await Promise.all([
      this.customerModel.find(customerFilter).select('-encryptedAadhaar -encryptedPan').limit(500),
      this.loanModel.find(loanFilter).limit(500),
    ]);

    return {
      syncedAt: new Date().toISOString(),
      counts: {
        customers: customers.length,
        loans: loans.length,
      },
      customers,
      loans,
    };
  }

  async push(payload: SyncPushPayload, user: any) {
    const syncedPayments: Array<{ clientUuid: string; paymentId: string; receiptNo: string }> = [];
    const syncedVisits: Array<{ clientUuid: string; visitId: string; visitCode: string }> = [];
    const errors: Array<{ clientUuid: string; error: string }> = [];

    // Process payments sequentially
    if (payload.payments && Array.isArray(payload.payments)) {
      for (const item of payload.payments) {
        try {
          const result = await this.paymentsService.collectPayment(item, user);
          syncedPayments.push({
            clientUuid: item.clientUuid || item.loanId,
            paymentId: (result.payment as any)._id.toString(),
            receiptNo: (result.payment as any).receiptNo,
          });
        } catch (err: any) {
          this.logger.error(`Offline payment sync error for ${item.clientUuid}: ${err.message}`);
          errors.push({
            clientUuid: item.clientUuid,
            error: err.message,
          });
        }
      }
    }

    // Process visits sequentially
    if (payload.visits && Array.isArray(payload.visits)) {
      for (const item of payload.visits) {
        try {
          const result = await this.collectionsService.recordVisit(item, user);
          syncedVisits.push({
            clientUuid: item.clientUuid,
            visitId: (result as any)._id.toString(),
            visitCode: (result as any).visitCode,
          });
        } catch (err: any) {
          this.logger.error(`Offline visit sync error for ${item.clientUuid}: ${err.message}`);
          errors.push({
            clientUuid: item.clientUuid,
            error: err.message,
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      syncedPayments,
      syncedVisits,
      errors,
      timestamp: new Date().toISOString(),
    };
  }
}
