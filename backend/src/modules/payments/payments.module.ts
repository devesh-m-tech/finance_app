import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Receipt, ReceiptSchema } from '../receipts/schemas/receipt.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: Loan.name, schema: LoanSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
