import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';

// Global Core Modules
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RestrictionsModule } from './modules/restrictions/restrictions.module';
import { AuditModule } from './modules/audit/audit.module';
import { BranchesModule } from './modules/branches/branches.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

// Dynamic Engine Modules (Phase 2)
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { FormsModule } from './modules/forms/forms.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { MastersModule } from './modules/masters/masters.module';
import { SettingsModule } from './modules/settings/settings.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

// Business & Operations Modules (Phase 3-8)
import { FilesModule } from './modules/files/files.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LoansModule } from './modules/loans/loans.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { HandoverModule } from './modules/handover/handover.module';
import { SyncModule } from './modules/sync/sync.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CreditModule } from './modules/credit/credit.module';
import { KycModule } from './modules/kyc/kyc.module';
import { FingerprintsModule } from './modules/fingerprints/fingerprints.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CronModule } from './modules/cron/cron.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PnlModule } from './modules/pnl/pnl.module';
import { ReportsModule } from './modules/reports/reports.module';

// Guards, Filters & Interceptors
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    RolesModule,
    PermissionsModule,
    RestrictionsModule,
    AuditModule,
    BranchesModule,
    UsersModule,
    AuthModule,
    WorkflowsModule,
    FormsModule,
    ChecklistsModule,
    MastersModule,
    SettingsModule,
    FeatureFlagsModule,
    RealtimeModule,
    FilesModule,
    CustomersModule,
    LoansModule,
    PaymentsModule,
    ReceiptsModule,
    CollectionsModule,
    HandoverModule,
    SyncModule,
    IntegrationsModule,
    CreditModule,
    KycModule,
    FingerprintsModule,
    MessagesModule,
    CronModule,
    ExpensesModule,
    PnlModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
