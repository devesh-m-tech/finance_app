import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Loan.name, schema: LoanSchema }]),
  ],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
