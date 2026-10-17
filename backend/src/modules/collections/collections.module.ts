import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { CollectionVisit, CollectionVisitSchema } from './schemas/collection-visit.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CollectionVisit.name, schema: CollectionVisitSchema },
      { name: Loan.name, schema: LoanSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
