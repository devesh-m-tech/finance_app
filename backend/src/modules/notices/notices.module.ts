import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { Notice, NoticeSchema } from './schemas/notice.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notice.name, schema: NoticeSchema },
      { name: Loan.name, schema: LoanSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [NoticesController],
  providers: [NoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}
