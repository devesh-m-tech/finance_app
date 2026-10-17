import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PnlController } from './pnl.controller';
import { PnlService } from './pnl.service';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Expense, ExpenseSchema } from '../expenses/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  controllers: [PnlController],
  providers: [PnlService],
  exports: [PnlService],
})
export class PnlModule {}
