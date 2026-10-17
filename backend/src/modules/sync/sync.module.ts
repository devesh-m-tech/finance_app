import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { PaymentsModule } from '../payments/payments.module';
import { CollectionsModule } from '../collections/collections.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Loan.name, schema: LoanSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    PaymentsModule,
    CollectionsModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
