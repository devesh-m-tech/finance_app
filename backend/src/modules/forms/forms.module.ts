import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormDefinition, FormDefinitionSchema } from './form-definition.schema';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormDefinition.name, schema: FormDefinitionSchema },
    ]),
  ],
  providers: [FormsService],
  controllers: [FormsController],
  exports: [FormsService, MongooseModule],
})
export class FormsModule {}
