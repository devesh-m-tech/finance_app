import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkflowDefinition,
  WorkflowDefinitionSchema,
} from './workflow-definition.schema';
import {
  WorkflowInstance,
  WorkflowInstanceSchema,
} from './workflow-instance.schema';
import {
  WorkflowHistory,
  WorkflowHistorySchema,
} from './workflow-history.schema';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkflowDefinition.name, schema: WorkflowDefinitionSchema },
      { name: WorkflowInstance.name, schema: WorkflowInstanceSchema },
      { name: WorkflowHistory.name, schema: WorkflowHistorySchema },
    ]),
  ],
  providers: [WorkflowsService],
  controllers: [WorkflowsController],
  exports: [WorkflowsService, MongooseModule],
})
export class WorkflowsModule {}
