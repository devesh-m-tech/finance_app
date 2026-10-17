import { Module } from '@nestjs/common';
import { FingerprintsController } from './fingerprints.controller';

@Module({
  controllers: [FingerprintsController],
})
export class FingerprintsModule {}
