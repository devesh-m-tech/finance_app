import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HandoverController } from './handover.controller';
import { HandoverService } from './handover.service';
import { CashHandover, CashHandoverSchema } from './schemas/cash-handover.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CashHandover.name, schema: CashHandoverSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [HandoverController],
  providers: [HandoverService],
  exports: [HandoverService],
})
export class HandoverModule {}
