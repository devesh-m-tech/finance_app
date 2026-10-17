import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterData, MasterDataSchema } from './master-data.schema';
import { MetalRate, MetalRateSchema } from './metal-rate.schema';
import { MastersService } from './masters.service';
import { MastersController } from './masters.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MasterData.name, schema: MasterDataSchema },
      { name: MetalRate.name, schema: MetalRateSchema },
    ]),
  ],
  providers: [MastersService],
  controllers: [MastersController],
  exports: [MastersService, MongooseModule],
})
export class MastersModule {}
