import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Counter, CounterSchema } from './counters/counter.schema';
import { CounterService } from './counters/counter.service';
import { TransactionHelper } from './transactions/transaction.helper';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
      }),
    }),
    MongooseModule.forFeature([
      { name: Counter.name, schema: CounterSchema },
    ]),
  ],
  providers: [CounterService, TransactionHelper],
  exports: [CounterService, TransactionHelper, MongooseModule],
})
export class DatabaseModule {}
