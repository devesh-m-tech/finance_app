import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChecklistTemplate,
  ChecklistTemplateSchema,
} from './checklist-template.schema';
import { ChecklistsService } from './checklists.service';
import { ChecklistsController } from './checklists.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChecklistTemplate.name, schema: ChecklistTemplateSchema },
    ]),
  ],
  providers: [ChecklistsService],
  controllers: [ChecklistsController],
  exports: [ChecklistsService, MongooseModule],
})
export class ChecklistsModule {}
