import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { Role } from '../src/modules/roles/role.schema';
import { User } from '../src/modules/users/user.schema';
import { Branch } from '../src/modules/branches/branch.schema';
import { UserRestriction } from '../src/modules/restrictions/restriction.schema';
import { WorkflowDefinition } from '../src/modules/workflows/workflow-definition.schema';
import { FormDefinition } from '../src/modules/forms/form-definition.schema';
import { ChecklistTemplate } from '../src/modules/checklists/checklist-template.schema';
import { MasterData } from '../src/modules/masters/master-data.schema';
import { MetalRate } from '../src/modules/masters/metal-rate.schema';
import { Setting } from '../src/modules/settings/setting.schema';
import { FeatureFlag } from '../src/modules/feature-flags/feature-flag.schema';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/modules/permissions/catalog';

async function seed() {
  console.log('🌱 Starting comprehensive database seed for Shri Amudha Small Finance...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const roleModel = app.get<Model<Role>>(getModelToken(Role.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const branchModel = app.get<Model<Branch>>(getModelToken(Branch.name));
  const restrictionModel = app.get<Model<UserRestriction>>(getModelToken(UserRestriction.name));
  const workflowDefModel = app.get<Model<WorkflowDefinition>>(getModelToken(WorkflowDefinition.name));
  const formDefModel = app.get<Model<FormDefinition>>(getModelToken(FormDefinition.name));
  const checklistModel = app.get<Model<ChecklistTemplate>>(getModelToken(ChecklistTemplate.name));
  const masterModel = app.get<Model<MasterData>>(getModelToken(MasterData.name));
  const rateModel = app.get<Model<MetalRate>>(getModelToken(MetalRate.name));
  const settingModel = app.get<Model<Setting>>(getModelToken(Setting.name));
  const flagModel = app.get<Model<FeatureFlag>>(getModelToken(FeatureFlag.name));

  // 1. Roles
  console.log('1️⃣ Seeding Roles & Default Permission Matrix...');
  const rolesData = [
    {
      name: 'SUPER_ADMIN',
      displayName: 'Super Admin (Owner)',
      description: 'Full organizational authority, P&L, workflows, settings, and user management.',
      permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
    },
    {
      name: 'MANAGER',
      displayName: 'Branch Manager',
      description: 'Operations lead: loan sanctioning, approvals, collections, and reports.',
      permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
    },
    {
      name: 'SALESPERSON',
      displayName: 'Field Collection Agent',
      description: 'Strictly limited to: (1) Add Customer and (2) Collect Cash.',
      permissions: DEFAULT_ROLE_PERMISSIONS.SALESPERSON,
    },
  ];
  for (const r of rolesData) {
    await roleModel.findOneAndUpdate({ name: r.name }, r, { upsert: true });
  }

  // 2. Main Branch
  console.log('2️⃣ Seeding Headquarter Branch...');
  const mainBranch = await branchModel.findOneAndUpdate(
    { code: 'MAIN' },
    {
      code: 'MAIN',
      name: 'Shri Amudha Main Branch - Coimbatore',
      addressLine1: '124 Cross Cut Road, Gandhipuram',
      addressLine2: 'Opposite City Bus Stand',
      city: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      phone: '+91 98765 43210',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  // 3. Demo Users
  console.log('3️⃣ Seeding Demo Accounts (Super Admin, Managers, Salespersons)...');
  const salt = await bcrypt.genSalt(10);
  const hash = (pwd: string) => bcrypt.hash(pwd, salt);

  const adminUser = await userModel.findOneAndUpdate(
    { username: 'admin' },
    {
      username: 'admin',
      passwordHash: await hash('Admin@12345'),
      pinHash: await hash('1234'),
      fullName: 'Devesh (Super Admin & Owner)',
      mobile: '9876543210',
      role: 'SUPER_ADMIN',
      branchId: mainBranch._id,
      isActive: true,
      permissionsVersion: 1,
    },
    { upsert: true, new: true }
  );

  const manager1 = await userModel.findOneAndUpdate(
    { username: 'manager1' },
    {
      username: 'manager1',
      passwordHash: await hash('Manager@12345'),
      pinHash: await hash('1234'),
      fullName: 'Karthik Raja (Branch Manager)',
      mobile: '9876543211',
      role: 'MANAGER',
      branchId: mainBranch._id,
      isActive: true,
      permissionsVersion: 1,
    },
    { upsert: true, new: true }
  );

  const manager2 = await userModel.findOneAndUpdate(
    { username: 'manager2' },
    {
      username: 'manager2',
      passwordHash: await hash('Manager@12345'),
      pinHash: await hash('1234'),
      fullName: 'Suresh Kumar (Ops Manager - Restricted P&L)',
      mobile: '9876543212',
      role: 'MANAGER',
      branchId: mainBranch._id,
      isActive: true,
      permissionsVersion: 1,
    },
    { upsert: true, new: true }
  );

  // Apply "No P&L and Expenses" preset restriction to manager2
  await restrictionModel.findOneAndUpdate(
    { managerId: manager2._id },
    {
      managerId: manager2._id,
      assignedBy: adminUser._id,
      reason: 'Demo preset: Operations Only (No P&L and Expenses)',
      presetName: 'NO_PNL_EXPENSES',
      blockedModules: ['pnl', 'expenses'],
      blockedActions: [],
      blockedLoanTypes: [],
      maxApprovalAmountPaise: 10000000,
      allowedBranchIds: [mainBranch._id],
    },
    { upsert: true }
  );

  await userModel.findOneAndUpdate(
    { username: 'sales1' },
    {
      username: 'sales1',
      passwordHash: await hash('Sales@12345'),
      pinHash: await hash('1111'),
      fullName: 'Muthuvel (Field Officer - Route 1)',
      mobile: '9876543213',
      role: 'SALESPERSON',
      branchId: mainBranch._id,
      isActive: true,
      permissionsVersion: 1,
    },
    { upsert: true, new: true }
  );

  await userModel.findOneAndUpdate(
    { username: 'sales2' },
    {
      username: 'sales2',
      passwordHash: await hash('Sales@12345'),
      pinHash: await hash('2222'),
      fullName: 'Anbarasu (Field Officer - Route 2)',
      mobile: '9876543214',
      role: 'SALESPERSON',
      branchId: mainBranch._id,
      isActive: true,
      permissionsVersion: 1,
    },
    { upsert: true, new: true }
  );

  // 4. Seed Dynamic Workflows
  console.log('4️⃣ Seeding Dynamic Workflow Definitions...');
  const workflows = [
    {
      entityType: 'CUSTOMER_ONBOARDING',
      title: 'Customer Onboarding Lifecycle',
      initialState: 'DRAFT',
      states: ['DRAFT', 'SUBMITTED', 'KYC_PENDING', 'KYC_VERIFIED', 'ACTIVE'],
      transitions: [
        {
          fromState: 'DRAFT',
          toState: 'SUBMITTED',
          actionLabel: 'Submit Application',
          allowedRoles: ['SALESPERSON', 'MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'SUBMITTED',
          toState: 'KYC_PENDING',
          actionLabel: 'Queue for Verification',
          allowedRoles: ['SALESPERSON', 'MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'KYC_PENDING',
          toState: 'KYC_VERIFIED',
          actionLabel: 'Approve KYC Documents',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'KYC_VERIFIED',
          toState: 'ACTIVE',
          actionLabel: 'Activate Borrower',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
      ],
    },
    {
      entityType: 'LOAN_DAILY',
      title: 'Daily Collection Loan Lifecycle',
      initialState: 'DRAFT',
      states: ['DRAFT', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'APPROVED', 'DISBURSED', 'ACTIVE', 'OVERDUE', 'CLOSED'],
      transitions: [
        {
          fromState: 'DRAFT',
          toState: 'PENDING_VERIFICATION',
          actionLabel: 'Submit for Verification',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'PENDING_VERIFICATION',
          toState: 'PENDING_APPROVAL',
          actionLabel: 'Field Verified',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'PENDING_APPROVAL',
          toState: 'APPROVED',
          actionLabel: 'Sanction Loan',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'APPROVED',
          toState: 'DISBURSED',
          actionLabel: 'Disburse Funds',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'DISBURSED',
          toState: 'ACTIVE',
          actionLabel: 'Activate Schedule',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'ACTIVE',
          toState: 'CLOSED',
          actionLabel: 'Close Loan (Settled)',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
      ],
    },
    {
      entityType: 'LOAN_METAL',
      title: 'Gold & Silver Pawn Loan Lifecycle',
      initialState: 'DRAFT',
      states: ['DRAFT', 'APPRAISED', 'APPROVED', 'PLEDGED', 'DISBURSED', 'ACTIVE', 'SETTLEMENT_PENDING', 'RELEASED'],
      transitions: [
        {
          fromState: 'DRAFT',
          toState: 'APPRAISED',
          actionLabel: 'Record Metal Appraisal',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'APPRAISED',
          toState: 'APPROVED',
          actionLabel: 'Sanction Pawn Loan',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
          guards: { maxLtvPercent: 75 },
        },
        {
          fromState: 'APPROVED',
          toState: 'PLEDGED',
          actionLabel: 'Seal in Safe Custody Bag',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'PLEDGED',
          toState: 'DISBURSED',
          actionLabel: 'Disburse Instant Cash/UPI',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'DISBURSED',
          toState: 'ACTIVE',
          actionLabel: 'Activate Loan',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'ACTIVE',
          toState: 'SETTLEMENT_PENDING',
          actionLabel: 'Verify Full Payment',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
        {
          fromState: 'SETTLEMENT_PENDING',
          toState: 'RELEASED',
          actionLabel: 'Release Ornaments to Customer',
          allowedRoles: ['MANAGER', 'SUPER_ADMIN'],
        },
      ],
    },
  ];

  for (const wf of workflows) {
    await workflowDefModel.findOneAndUpdate({ entityType: wf.entityType }, wf, { upsert: true });
  }

  // 5. Seed Dynamic Form Definitions
  console.log('5️⃣ Seeding Dynamic Form Schemas...');
  const customerForm = {
    formKey: 'customer_onboarding',
    title: 'New Borrower Onboarding Application',
    steps: [
      {
        id: 'step_demographics',
        title: 'Personal & Demographic Details',
        titleTamil: 'தனிநபர் மற்றும் இருப்பிட விவரங்கள்',
        fields: [
          { name: 'fullName', label: 'Full Name (as in Aadhaar)', type: 'text', validation: { required: true, minLength: 3 } },
          { name: 'mobile', label: 'Mobile Number', type: 'number', validation: { required: true, minLength: 10, maxLength: 10 } },
          { name: 'addressLine1', label: 'Door / Flat No & Street', type: 'text', validation: { required: true } },
          { name: 'city', label: 'City / Town', type: 'text', validation: { required: true } },
          { name: 'pincode', label: 'Pincode (6 Digits)', type: 'number', validation: { required: true, minLength: 6, maxLength: 6 } },
        ],
      },
      {
        id: 'step_identity',
        title: 'Identity & Financial Verification',
        titleTamil: 'அடையாள ஆவணங்கள்',
        fields: [
          { name: 'aadhaarNumber', label: 'Aadhaar Number (12 Digits)', type: 'number', validation: { required: true, isAadhaar: true } },
          { name: 'panNumber', label: 'PAN Card Number', type: 'text', validation: { required: true, isPan: true } },
          { name: 'voterId', label: 'Voter ID (EPIC No)', type: 'text' },
          { name: 'chequeNumbers', label: 'Security Cheque Numbers', type: 'text' },
        ],
      },
      {
        id: 'step_nominee',
        title: 'Guarantor / Nominee Information',
        titleTamil: 'ஜாமீன்தாரர் விவரங்கள்',
        fields: [
          { name: 'nomineeName', label: 'Guarantor Full Name', type: 'text', validation: { required: true } },
          { name: 'nomineeRelation', label: 'Relationship', type: 'dropdown', options: [{ label: 'Spouse', value: 'SPOUSE' }, { label: 'Parent', value: 'PARENT' }, { label: 'Sibling', value: 'SIBLING' }, { label: 'Friend', value: 'FRIEND' }] },
          { name: 'nomineeMobile', label: 'Guarantor Mobile', type: 'number', validation: { required: true, minLength: 10, maxLength: 10 } },
        ],
      },
      {
        id: 'step_biometrics',
        title: 'Biometrics & Consent Capture',
        titleTamil: 'பயோமெட்ரிக் மற்றும் புகைப்படங்கள்',
        fields: [
          { name: 'photoUrl', label: 'Applicant Portrait Photo', type: 'photo', validation: { required: true } },
          { name: 'fingerprintTemplate', label: 'OTG Biometric Thumbprint Scan', type: 'fingerprint', validation: { required: true } },
          { name: 'consentSignature', label: 'Borrower Consent Signoff', type: 'signature', validation: { required: true } },
        ],
      },
    ],
  };
  await formDefModel.findOneAndUpdate({ formKey: customerForm.formKey }, customerForm, { upsert: true });

  // 6. Seed Document Checklists
  console.log('6️⃣ Seeding Document Checklists per Loan Product...');
  const checklists = [
    {
      loanType: 'daily',
      title: 'Daily Micro Loan Checklist',
      items: [
        { itemKey: 'app_form', title: 'Signed Application Form', isMandatory: true, allowedFileTypes: ['application/pdf', 'image/jpeg'] },
        { itemKey: 'aadhaar_copy', title: 'Aadhaar Card Front & Back', isMandatory: true, allowedFileTypes: ['image/jpeg', 'image/png'] },
        { itemKey: 'passbook', title: 'Bank Passbook Photo', isMandatory: true, allowedFileTypes: ['image/jpeg'] },
      ],
    },
    {
      loanType: 'metal',
      title: 'Gold / Silver Collateral Checklist',
      items: [
        { itemKey: 'aadhaar_copy', title: 'Aadhaar Copy', isMandatory: true, allowedFileTypes: ['image/jpeg'] },
        { itemKey: 'pan_copy', title: 'PAN Copy', isMandatory: true, allowedFileTypes: ['image/jpeg'] },
        { itemKey: 'ornament_photo', title: 'Collateral Ornaments Photo on Weighing Scale', isMandatory: true, allowedFileTypes: ['image/jpeg'] },
        { itemKey: 'appraisal_sheet', title: 'Appraisal Report Signed by Certified Assayer', isMandatory: true, allowedFileTypes: ['application/pdf', 'image/jpeg'] },
      ],
    },
    {
      loanType: 'two_wheeler',
      title: 'Two Wheeler Vehicle Loan Checklist',
      items: [
        { itemKey: 'dl_copy', title: 'Customer Driving Licence', isMandatory: true, allowedFileTypes: ['image/jpeg', 'application/pdf'] },
        { itemKey: 'vehicle_quote', title: 'Dealer Proforma Invoice / Quotation', isMandatory: true, allowedFileTypes: ['application/pdf'] },
        { itemKey: 'downpayment_receipt', title: 'Customer Down Payment Receipt', isMandatory: true, allowedFileTypes: ['image/jpeg', 'application/pdf'] },
        { itemKey: 'insurance_policy', title: 'Vehicle Comprehensive Insurance (Track Expiry)', isMandatory: true, trackExpiry: true, allowedFileTypes: ['application/pdf'] },
      ],
    },
  ];
  for (const c of checklists) {
    await checklistModel.findOneAndUpdate({ loanType: c.loanType }, c, { upsert: true });
  }

  // 7. Seed Master Data & Daily Metal Rates
  console.log('7️⃣ Seeding Master Data & Today Metal Rates...');
  // Interest rates 0.5% to 10% in 0.5% steps
  for (let rate = 0.5; rate <= 10.0; rate += 0.5) {
    const code = `RATE_${Math.round(rate * 10)}`;
    await masterModel.findOneAndUpdate(
      { category: 'INTEREST_RATES', code },
      { category: 'INTEREST_RATES', code, label: `${rate.toFixed(1)}% per month`, metadata: { ratePercent: rate } },
      { upsert: true }
    );
  }

  // Routes
  const routes = [
    { code: 'RT1', label: 'Route 1 - Gandhipuram & Cross Cut Road', metadata: { agent: 'sales1' } },
    { code: 'RT2', label: 'Route 2 - RS Puram & Town Hall Market', metadata: { agent: 'sales2' } },
    { code: 'RT3', label: 'Route 3 - Singanallur & Peelamedu', metadata: { agent: null } },
  ];
  for (const rt of routes) {
    await masterModel.findOneAndUpdate(
      { category: 'ROUTES', code: rt.code },
      { category: 'ROUTES', code: rt.code, label: rt.label, metadata: rt.metadata },
      { upsert: true }
    );
  }

  // Today Metal Rates
  const today = new Date().toISOString().split('T')[0];
  const metalRates = [
    { metal: 'GOLD', purity: '22K', ratePerGramPaise: 685000, effectiveDate: today, updatedBy: adminUser._id },
    { metal: 'GOLD', purity: '24K', ratePerGramPaise: 747000, effectiveDate: today, updatedBy: adminUser._id },
    { metal: 'GOLD', purity: '18K', ratePerGramPaise: 560000, effectiveDate: today, updatedBy: adminUser._id },
    { metal: 'SILVER', purity: '999', ratePerGramPaise: 9200, effectiveDate: today, updatedBy: adminUser._id },
    { metal: 'SILVER', purity: '925', ratePerGramPaise: 8500, effectiveDate: today, updatedBy: adminUser._id },
  ];
  for (const mr of metalRates) {
    await rateModel.findOneAndUpdate(
      { metal: mr.metal, purity: mr.purity, effectiveDate: mr.effectiveDate },
      mr,
      { upsert: true }
    );
  }

  // 8. Seed Settings & Feature Flags
  console.log('8️⃣ Seeding Global Settings & Feature Flags...');
  await settingModel.findOneAndUpdate(
    { key: 'branding' },
    {
      key: 'branding',
      value: {
        companyName: 'SHRI AMUDHA SMALL FINANCE',
        tagline: 'Trusted Loan Management System',
        primaryHex: '#FFC107',
        primaryDarkHex: '#E0A800',
        address: '124 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
        phone: '+91 98765 43210',
        noGstDefault: true,
      },
      description: 'Global brand tokens and thermal receipt headers',
    },
    { upsert: true }
  );

  await settingModel.findOneAndUpdate(
    { key: 'salesperson.allowedPaymentModes' },
    {
      key: 'salesperson.allowedPaymentModes',
      value: ['CASH'], // Default CASH only; Super Admin can add GPAY/UPI
      description: 'Payment modes permitted for field salesperson cash collections',
    },
    { upsert: true }
  );

  const featureFlags = [
    { flagKey: 'disbursalWithoutFingerprint', isEnabled: false, description: 'Allow loan disbursement without biometric verification' },
    { flagKey: 'requireCibilBeforeApproval', isEnabled: true, description: 'Mandate CIBIL pull before loan approval' },
    { flagKey: 'twoLevelApprovalAboveAmount', isEnabled: true, value: '5000000', description: 'Loans above ₹50,000 require Super Admin secondary sanction' },
    { flagKey: 'manager.pnl.default', isEnabled: true, description: 'Default P&L visibility for Managers' },
  ];
  for (const ff of featureFlags) {
    await flagModel.findOneAndUpdate({ flagKey: ff.flagKey }, ff, { upsert: true });
  }

  console.log('✨ Comprehensive Database Seeding Complete!');
  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
