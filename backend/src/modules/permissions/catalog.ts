export interface PermissionItem {
  key: string;
  module: string;
  action: string;
  description: string;
}

export const PERMISSION_CATALOG: PermissionItem[] = [
  // Dashboard
  { key: 'dashboard:portfolio', module: 'dashboard', action: 'portfolio', description: 'View company portfolio metrics & KPIs' },
  { key: 'dashboard:own', module: 'dashboard', action: 'own', description: 'View personal summary and performance targets' },

  // Customers & Demographics
  { key: 'customers:create', module: 'customers', action: 'create', description: 'Onboard new customer application' },
  { key: 'customers:read', module: 'customers', action: 'read', description: 'View customer demographic profiles' },
  { key: 'customers:update', module: 'customers', action: 'update', description: 'Edit customer profile information' },
  { key: 'customers:delete', module: 'customers', action: 'delete', description: 'Soft delete customer records' },
  { key: 'customers:export', module: 'customers', action: 'export', description: 'Export customer list to Excel/CSV' },

  // Guarantors & Documents
  { key: 'guarantors:manage', module: 'guarantors', action: 'manage', description: 'Add, edit, and review guarantor details' },
  { key: 'documents:upload', module: 'documents', action: 'upload', description: 'Upload KYC, collateral, and agreement documents' },
  { key: 'documents:verify', module: 'documents', action: 'verify', description: 'Approve or reject uploaded documents' },
  { key: 'documents:delete', module: 'documents', action: 'delete', description: 'Delete attached customer documents' },

  // Biometrics & Verifications
  { key: 'fingerprints:capture', module: 'fingerprints', action: 'capture', description: 'Capture biometric thumbprint template' },
  { key: 'fingerprints:verify', module: 'fingerprints', action: 'verify', description: 'Verify biometric template match' },
  { key: 'kyc:run', module: 'kyc', action: 'run', description: 'Run Aadhaar / PAN / Voter KYC verification' },
  { key: 'credit:run', module: 'credit', action: 'run', description: 'Perform CIBIL / Experian credit score pull' },

  // Daily Loans
  { key: 'loans.daily:create', module: 'loans.daily', action: 'create', description: 'Create daily collection loan application' },
  { key: 'loans.daily:read', module: 'loans.daily', action: 'read', description: 'View daily loans' },
  { key: 'loans.daily:update', module: 'loans.daily', action: 'update', description: 'Edit daily loan parameters' },
  { key: 'loans.daily:delete', module: 'loans.daily', action: 'delete', description: 'Soft delete daily loan' },
  { key: 'loans.daily:approve', module: 'loans.daily', action: 'approve', description: 'Approve daily loan application' },
  { key: 'loans.daily:disburse', module: 'loans.daily', action: 'disburse', description: 'Disburse daily loan' },

  // Weekly Loans
  { key: 'loans.weekly:create', module: 'loans.weekly', action: 'create', description: 'Create weekly loan application' },
  { key: 'loans.weekly:read', module: 'loans.weekly', action: 'read', description: 'View weekly loans' },
  { key: 'loans.weekly:update', module: 'loans.weekly', action: 'update', description: 'Edit weekly loan parameters' },
  { key: 'loans.weekly:delete', module: 'loans.weekly', action: 'delete', description: 'Soft delete weekly loan' },
  { key: 'loans.weekly:approve', module: 'loans.weekly', action: 'approve', description: 'Approve weekly loan' },
  { key: 'loans.weekly:disburse', module: 'loans.weekly', action: 'disburse', description: 'Disburse weekly loan' },

  // Monthly Loans
  { key: 'loans.monthly:create', module: 'loans.monthly', action: 'create', description: 'Create monthly EMI loan application' },
  { key: 'loans.monthly:read', module: 'loans.monthly', action: 'read', description: 'View monthly loans' },
  { key: 'loans.monthly:update', module: 'loans.monthly', action: 'update', description: 'Edit monthly loan parameters' },
  { key: 'loans.monthly:delete', module: 'loans.monthly', action: 'delete', description: 'Soft delete monthly loan' },
  { key: 'loans.monthly:approve', module: 'loans.monthly', action: 'approve', description: 'Approve monthly loan' },
  { key: 'loans.monthly:disburse', module: 'loans.monthly', action: 'disburse', description: 'Disburse monthly loan' },

  // Two Wheeler Loans
  { key: 'loans.two_wheeler:create', module: 'loans.two_wheeler', action: 'create', description: 'Create two wheeler loan' },
  { key: 'loans.two_wheeler:read', module: 'loans.two_wheeler', action: 'read', description: 'View two wheeler loans' },
  { key: 'loans.two_wheeler:update', module: 'loans.two_wheeler', action: 'update', description: 'Edit two wheeler loan' },
  { key: 'loans.two_wheeler:delete', module: 'loans.two_wheeler', action: 'delete', description: 'Delete two wheeler loan' },
  { key: 'loans.two_wheeler:approve', module: 'loans.two_wheeler', action: 'approve', description: 'Approve two wheeler loan' },
  { key: 'loans.two_wheeler:disburse', module: 'loans.two_wheeler', action: 'disburse', description: 'Disburse two wheeler loan' },

  // Four Wheeler Loans
  { key: 'loans.four_wheeler:create', module: 'loans.four_wheeler', action: 'create', description: 'Create four wheeler loan' },
  { key: 'loans.four_wheeler:read', module: 'loans.four_wheeler', action: 'read', description: 'View four wheeler loans' },
  { key: 'loans.four_wheeler:update', module: 'loans.four_wheeler', action: 'update', description: 'Edit four wheeler loan' },
  { key: 'loans.four_wheeler:delete', module: 'loans.four_wheeler', action: 'delete', description: 'Delete four wheeler loan' },
  { key: 'loans.four_wheeler:approve', module: 'loans.four_wheeler', action: 'approve', description: 'Approve four wheeler loan' },
  { key: 'loans.four_wheeler:disburse', module: 'loans.four_wheeler', action: 'disburse', description: 'Disburse four wheeler loan' },

  // Gold & Silver Metal Loans
  { key: 'loans.metal:create', module: 'loans.metal', action: 'create', description: 'Create gold/silver loan' },
  { key: 'loans.metal:read', module: 'loans.metal', action: 'read', description: 'View gold/silver loans' },
  { key: 'loans.metal:update', module: 'loans.metal', action: 'update', description: 'Edit gold/silver loan' },
  { key: 'loans.metal:delete', module: 'loans.metal', action: 'delete', description: 'Delete gold/silver loan' },
  { key: 'loans.metal:approve', module: 'loans.metal', action: 'approve', description: 'Approve gold/silver loan' },
  { key: 'loans.metal:disburse', module: 'loans.metal', action: 'disburse', description: 'Disburse gold/silver loan' },

  // Loan Super Admin Overrides
  { key: 'loans:override', module: 'loans', action: 'override', description: 'Override LTV, credit floor, or disbursal checks' },

  // Field Collections & Visits
  { key: 'collections:collect', module: 'collections', action: 'collect', description: 'Record payment collection from customer' },
  { key: 'collections:visit', module: 'collections', action: 'visit', description: 'Record GPS visit outcome (PTP, absent, etc)' },
  { key: 'collections:assign', module: 'collections', action: 'assign', description: 'Assign routes and customers to agents' },

  // Payments & Receipts
  { key: 'payments:read', module: 'payments', action: 'read', description: 'View payments transaction history' },
  { key: 'receipts:read', module: 'receipts', action: 'read', description: 'View payment receipts' },
  { key: 'receipts:reprint', module: 'receipts', action: 'reprint', description: 'Reprint or share receipts via thermal/WhatsApp' },
  { key: 'receipts:cancel', module: 'receipts', action: 'cancel', description: 'Cancel receipt and issue credit note' },

  // Cash Handover
  { key: 'handover:submit', module: 'handover', action: 'submit', description: 'Submit end-of-day cash handover' },
  { key: 'handover:accept', module: 'handover', action: 'accept', description: 'Verify and accept cash handover from agent' },

  // Masters, Notices & Messages
  { key: 'rates:manage', module: 'rates', action: 'manage', description: 'Update daily gold and silver market rates' },
  { key: 'notices:manage', module: 'notices', action: 'manage', description: 'Generate and serve legal overdue notices' },
  { key: 'messages:manage', module: 'messages', action: 'manage', description: 'Send SMS and WhatsApp notifications' },

  // Financials & P&L
  { key: 'pnl:read', module: 'pnl', action: 'read', description: 'View monthly and overall Profit & Loss statements' },
  { key: 'expenses:manage', module: 'expenses', action: 'manage', description: 'Record and approve branch expenses' },
  { key: 'reports:read', module: 'reports', action: 'read', description: 'View operational reports' },
  { key: 'reports:export', module: 'reports', action: 'export', description: 'Export reports in PDF/Excel' },

  // User Management & Security
  { key: 'users:salespersons', module: 'users', action: 'salespersons', description: 'Create and manage Salesperson accounts' },
  { key: 'users:managers', module: 'users', action: 'managers', description: 'Create and manage Manager accounts' },
  { key: 'restrictions:manage', module: 'restrictions', action: 'manage', description: 'Configure and assign manager restrictions' },

  // System Configuration & Auditing
  { key: 'settings:manage', module: 'settings', action: 'manage', description: 'Manage global system settings and branding' },
  { key: 'workflows:manage', module: 'workflows', action: 'manage', description: 'Design and publish dynamic workflows' },
  { key: 'forms:manage', module: 'forms', action: 'manage', description: 'Design dynamic forms and custom fields' },
  { key: 'masters:manage', module: 'masters', action: 'manage', description: 'Manage branch, route, and product master data' },
  { key: 'audit:read', module: 'audit', action: 'read', description: 'Inspect audit logs and security activity' },
  { key: 'backup:run', module: 'backup', action: 'run', description: 'Execute database backups and restore drills' },
  { key: 'records:hardDelete', module: 'records', action: 'hardDelete', description: 'Permanently purge deleted records' },
];

export const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN: PERMISSION_CATALOG.map((p) => p.key),

  // Manager: All features by default, except protected Super Admin actions
  MANAGER: PERMISSION_CATALOG.filter(
    (p) =>
      p.key !== 'loans:override' &&
      p.key !== 'users:managers' &&
      p.key !== 'restrictions:manage' &&
      p.key !== 'backup:run' &&
      p.key !== 'records:hardDelete'
  ).map((p) => p.key),

  // Salesperson: Strictly allowed only two actions: Add Customer & Collect Cash (plus personal summary)
  SALESPERSON: [
    'dashboard:own',
    'customers:create',
    'customers:read',
    'documents:upload',
    'fingerprints:capture',
    'collections:collect',
    'collections:visit',
    'payments:read',
    'receipts:read',
    'receipts:reprint',
    'handover:submit',
  ],
};
