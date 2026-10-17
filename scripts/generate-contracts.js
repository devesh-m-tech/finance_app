const fs = require('fs');
const path = require('path');

const contractDir = path.resolve(__dirname, '../backend/contract');
if (!fs.existsSync(contractDir)) {
  fs.mkdirSync(contractDir, { recursive: true });
}

// 1. Complete Permission Catalog
const catalog = [
  { key: 'dashboard:portfolio', module: 'dashboard', action: 'portfolio', description: 'View company portfolio metrics & KPIs' },
  { key: 'dashboard:own', module: 'dashboard', action: 'own', description: 'View personal summary and performance targets' },
  { key: 'customers:create', module: 'customers', action: 'create', description: 'Onboard new customer application' },
  { key: 'customers:read', module: 'customers', action: 'read', description: 'View customer demographic profiles' },
  { key: 'customers:update', module: 'customers', action: 'update', description: 'Edit customer profile information' },
  { key: 'customers:delete', module: 'customers', action: 'delete', description: 'Soft delete customer records' },
  { key: 'customers:export', module: 'customers', action: 'export', description: 'Export customer list to Excel/CSV' },
  { key: 'guarantors:manage', module: 'guarantors', action: 'manage', description: 'Add, edit, and review guarantor details' },
  { key: 'documents:upload', module: 'documents', action: 'upload', description: 'Upload KYC, collateral, and agreement documents' },
  { key: 'documents:verify', module: 'documents', action: 'verify', description: 'Approve or reject uploaded documents' },
  { key: 'documents:delete', module: 'documents', action: 'delete', description: 'Delete attached customer documents' },
  { key: 'fingerprints:capture', module: 'fingerprints', action: 'capture', description: 'Capture biometric thumbprint template' },
  { key: 'fingerprints:verify', module: 'fingerprints', action: 'verify', description: 'Verify biometric template match' },
  { key: 'kyc:run', module: 'kyc', action: 'run', description: 'Run Aadhaar / PAN / Voter KYC verification' },
  { key: 'credit:run', module: 'credit', action: 'run', description: 'Perform CIBIL / Experian credit score pull' },
  { key: 'loans.daily:create', module: 'loans.daily', action: 'create', description: 'Create daily collection loan application' },
  { key: 'loans.daily:read', module: 'loans.daily', action: 'read', description: 'View daily loans' },
  { key: 'loans.daily:update', module: 'loans.daily', action: 'update', description: 'Edit daily loan parameters' },
  { key: 'loans.daily:delete', module: 'loans.daily', action: 'delete', description: 'Soft delete daily loan' },
  { key: 'loans.daily:approve', module: 'loans.daily', action: 'approve', description: 'Approve daily loan application' },
  { key: 'loans.daily:disburse', module: 'loans.daily', action: 'disburse', description: 'Disburse daily loan' },
  { key: 'loans.weekly:create', module: 'loans.weekly', action: 'create', description: 'Create weekly loan application' },
  { key: 'loans.weekly:read', module: 'loans.weekly', action: 'read', description: 'View weekly loans' },
  { key: 'loans.weekly:update', module: 'loans.weekly', action: 'update', description: 'Edit weekly loan parameters' },
  { key: 'loans.weekly:delete', module: 'loans.weekly', action: 'delete', description: 'Soft delete weekly loan' },
  { key: 'loans.weekly:approve', module: 'loans.weekly', action: 'approve', description: 'Approve weekly loan' },
  { key: 'loans.weekly:disburse', module: 'loans.weekly', action: 'disburse', description: 'Disburse weekly loan' },
  { key: 'loans.monthly:create', module: 'loans.monthly', action: 'create', description: 'Create monthly EMI loan application' },
  { key: 'loans.monthly:read', module: 'loans.monthly', action: 'read', description: 'View monthly loans' },
  { key: 'loans.monthly:update', module: 'loans.monthly', action: 'update', description: 'Edit monthly loan parameters' },
  { key: 'loans.monthly:delete', module: 'loans.monthly', action: 'delete', description: 'Soft delete monthly loan' },
  { key: 'loans.monthly:approve', module: 'loans.monthly', action: 'approve', description: 'Approve monthly loan' },
  { key: 'loans.monthly:disburse', module: 'loans.monthly', action: 'disburse', description: 'Disburse monthly loan' },
  { key: 'loans.two_wheeler:create', module: 'loans.two_wheeler', action: 'create', description: 'Create two wheeler loan' },
  { key: 'loans.two_wheeler:read', module: 'loans.two_wheeler', action: 'read', description: 'View two wheeler loans' },
  { key: 'loans.two_wheeler:update', module: 'loans.two_wheeler', action: 'update', description: 'Edit two wheeler loan' },
  { key: 'loans.two_wheeler:delete', module: 'loans.two_wheeler', action: 'delete', description: 'Delete two wheeler loan' },
  { key: 'loans.two_wheeler:approve', module: 'loans.two_wheeler', action: 'approve', description: 'Approve two wheeler loan' },
  { key: 'loans.two_wheeler:disburse', module: 'loans.two_wheeler', action: 'disburse', description: 'Disburse two wheeler loan' },
  { key: 'loans.four_wheeler:create', module: 'loans.four_wheeler', action: 'create', description: 'Create four wheeler loan' },
  { key: 'loans.four_wheeler:read', module: 'loans.four_wheeler', action: 'read', description: 'View four wheeler loans' },
  { key: 'loans.four_wheeler:update', module: 'loans.four_wheeler', action: 'update', description: 'Edit four wheeler loan' },
  { key: 'loans.four_wheeler:delete', module: 'loans.four_wheeler', action: 'delete', description: 'Delete four wheeler loan' },
  { key: 'loans.four_wheeler:approve', module: 'loans.four_wheeler', action: 'approve', description: 'Approve four wheeler loan' },
  { key: 'loans.four_wheeler:disburse', module: 'loans.four_wheeler', action: 'disburse', description: 'Disburse four wheeler loan' },
  { key: 'loans.metal:create', module: 'loans.metal', action: 'create', description: 'Create gold/silver loan' },
  { key: 'loans.metal:read', module: 'loans.metal', action: 'read', description: 'View gold/silver loans' },
  { key: 'loans.metal:update', module: 'loans.metal', action: 'update', description: 'Edit gold/silver loan' },
  { key: 'loans.metal:delete', module: 'loans.metal', action: 'delete', description: 'Delete gold/silver loan' },
  { key: 'loans.metal:approve', module: 'loans.metal', action: 'approve', description: 'Approve gold/silver loan' },
  { key: 'loans.metal:disburse', module: 'loans.metal', action: 'disburse', description: 'Disburse gold/silver loan' },
  { key: 'loans:override', module: 'loans', action: 'override', description: 'Override LTV, credit floor, or disbursal checks' },
  { key: 'collections:collect', module: 'collections', action: 'collect', description: 'Record payment collection from customer' },
  { key: 'collections:visit', module: 'collections', action: 'visit', description: 'Record GPS visit outcome (PTP, absent, etc)' },
  { key: 'collections:assign', module: 'collections', action: 'assign', description: 'Assign routes and customers to agents' },
  { key: 'payments:read', module: 'payments', action: 'read', description: 'View payments transaction history' },
  { key: 'receipts:read', module: 'receipts', action: 'read', description: 'View payment receipts' },
  { key: 'receipts:reprint', module: 'receipts', action: 'reprint', description: 'Reprint or share receipts via thermal/WhatsApp' },
  { key: 'receipts:cancel', module: 'receipts', action: 'cancel', description: 'Cancel receipt and issue credit note' },
  { key: 'handover:submit', module: 'handover', action: 'submit', description: 'Submit end-of-day cash handover' },
  { key: 'handover:accept', module: 'handover', action: 'accept', description: 'Verify and accept cash handover from agent' },
  { key: 'rates:manage', module: 'rates', action: 'manage', description: 'Update daily gold and silver market rates' },
  { key: 'notices:manage', module: 'notices', action: 'manage', description: 'Generate and serve legal overdue notices' },
  { key: 'messages:manage', module: 'messages', action: 'manage', description: 'Send SMS and WhatsApp notifications' },
  { key: 'pnl:read', module: 'pnl', action: 'read', description: 'View monthly and overall Profit & Loss statements' },
  { key: 'expenses:manage', module: 'expenses', action: 'manage', description: 'Record and approve branch expenses' },
  { key: 'reports:read', module: 'reports', action: 'read', description: 'View operational reports' },
  { key: 'reports:export', module: 'reports', action: 'export', description: 'Export reports in PDF/Excel' },
  { key: 'users:salespersons', module: 'users', action: 'salespersons', description: 'Create and manage Salesperson accounts' },
  { key: 'users:managers', module: 'users', action: 'managers', description: 'Create and manage Manager accounts' },
  { key: 'restrictions:manage', module: 'restrictions', action: 'manage', description: 'Configure and assign manager restrictions' },
  { key: 'settings:manage', module: 'settings', action: 'manage', description: 'Manage global system settings and branding' },
  { key: 'workflows:manage', module: 'workflows', action: 'manage', description: 'Design and publish dynamic workflows' },
  { key: 'forms:manage', module: 'forms', action: 'manage', description: 'Design dynamic forms and custom fields' },
  { key: 'masters:manage', module: 'masters', action: 'manage', description: 'Manage branch, route, and product master data' },
  { key: 'audit:read', module: 'audit', action: 'read', description: 'Inspect audit logs and security activity' },
  { key: 'backup:run', module: 'backup', action: 'run', description: 'Execute database backups and restore drills' },
  { key: 'records:hardDelete', module: 'records', action: 'hardDelete', description: 'Permanently purge deleted records' }
];

const defaultMatrix = {
  SUPER_ADMIN: catalog.map(p => p.key),
  MANAGER: catalog.filter(p =>
    p.key !== 'loans:override' &&
    p.key !== 'users:managers' &&
    p.key !== 'restrictions:manage' &&
    p.key !== 'backup:run' &&
    p.key !== 'records:hardDelete'
  ).map(p => p.key),
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
    'handover:submit'
  ]
};

fs.writeFileSync(path.join(contractDir, 'permissions.json'), JSON.stringify({ version: '1.0.0', catalog, defaultMatrix }, null, 2), 'utf8');
console.log('✅ Updated backend/contract/permissions.json');

// 2. Comprehensive OpenAPI 3.0 Contract Specification
const openapi = {
  openapi: '3.0.0',
  info: {
    title: 'Shri Amudha Small Finance - LMS API',
    description: 'Enterprise Micro-Finance & Collateral Lending LMS API Contract',
    version: '1.0.0'
  },
  servers: [{ url: '/api/v1' }],
  paths: {
    '/auth/login': { post: { summary: 'Login with username & password', tags: ['Auth'] } },
    '/auth/pin-login': { post: { summary: 'Fast field login with 4-digit PIN', tags: ['Auth'] } },
    '/auth/refresh': { post: { summary: 'Refresh JWT access token', tags: ['Auth'] } },
    '/me/permissions': { get: { summary: 'Get current user permissions & restrictions', tags: ['Permissions'] } },
    '/users': { get: { summary: 'List users', tags: ['Users'] }, post: { summary: 'Create user', tags: ['Users'] } },
    '/restrictions/{managerId}': {
      get: { summary: 'Get active restrictions', tags: ['Restrictions'] },
      put: { summary: 'Set restrictions', tags: ['Restrictions'] },
      delete: { summary: 'Remove restrictions', tags: ['Restrictions'] }
    },
    '/branches': { get: { summary: 'List branches', tags: ['Branches'] }, post: { summary: 'Create branch', tags: ['Branches'] } },
    '/workflows/definitions': { get: { summary: 'List workflow definitions', tags: ['Workflows'] } },
    '/workflows/{entityType}/{entityId}/transitions': { get: { summary: 'Allowed transitions', tags: ['Workflows'] } },
    '/workflows/{entityType}/{entityId}/transition': { post: { summary: 'Execute transition', tags: ['Workflows'] } },
    '/forms/{formKey}': { get: { summary: 'Get dynamic form schema', tags: ['Forms'] }, put: { summary: 'Save dynamic form schema', tags: ['Forms'] } },
    '/checklists': { get: { summary: 'Get checklist templates', tags: ['Checklists'] } },
    '/checklists/{loanType}': { get: { summary: 'Get checklist by loan type', tags: ['Checklists'] } },
    '/masters/rates/latest': { get: { summary: 'Get latest metal bullion rates', tags: ['Masters'] } },
    '/masters/rates': { post: { summary: 'Publish daily metal rate', tags: ['Masters'] } },
    '/masters/{category}': { get: { summary: 'Get master items by category', tags: ['Masters'] } },
    '/settings/branding': { get: { summary: 'Get branding tokens', tags: ['Settings'] } },
    '/feature-flags': { get: { summary: 'List feature flags', tags: ['FeatureFlags'] } },
    '/realtime/stream': { get: { summary: 'SSE event stream', tags: ['Realtime'] } },

    // Customers & KYC
    '/customers': {
      get: { summary: 'List customers with pagination & search', tags: ['Customers'] },
      post: { summary: 'Onboard new customer application', tags: ['Customers'] }
    },
    '/customers/verification-queue': { get: { summary: 'Get pending customer verification queue', tags: ['Customers'] } },
    '/customers/{id}': { get: { summary: 'Get customer profile', tags: ['Customers'] } },
    '/customers/{id}/verify': { post: { summary: 'Approve or reject customer verification', tags: ['Customers'] } },
    '/customers/{id}/documents': { post: { summary: 'Attach document/photo to customer', tags: ['Customers'] } },
    '/customers/{id}/documents/{docType}/verify': { post: { summary: 'Verify or reject document', tags: ['Customers'] } },
    '/credit/cibil': { post: { summary: 'Pull CIBIL credit score and report', tags: ['Credit'] } },
    '/kyc/verify-pan': { post: { summary: 'Verify PAN format and registry match', tags: ['KYC'] } },
    '/kyc/verify-aadhaar': { post: { summary: 'Verify Aadhaar Verhoeff checksum and e-KYC', tags: ['KYC'] } },
    '/fingerprints/verify': { post: { summary: 'Verify live biometric capture with ISO template', tags: ['Fingerprints'] } },

    // Loans & Collateral
    '/loans/preview': { post: { summary: 'Calculate repayment preview and schedule', tags: ['Loans'] } },
    '/loans': {
      get: { summary: 'List loans directory', tags: ['Loans'] },
      post: { summary: 'Create loan application (Daily, Weekly, Monthly, Vehicle, Metal)', tags: ['Loans'] }
    },
    '/loans/{id}': { get: { summary: 'Get full loan details and schedule', tags: ['Loans'] } },
    '/loans/{id}/approve': { post: { summary: 'Approve loan (Maker-Checker enforced)', tags: ['Loans'] } },
    '/loans/{id}/disburse': { post: { summary: 'Disburse approved loan', tags: ['Loans'] } },

    // Payments & Receipts
    '/payments': {
      get: { summary: 'List payment collection transactions', tags: ['Payments'] },
      post: { summary: 'Record payment collection (ACID Waterfall)', tags: ['Payments'] }
    },
    '/payments/{id}': { get: { summary: 'Get payment details', tags: ['Payments'] } },
    '/receipts': { get: { summary: 'List payment receipts', tags: ['Receipts'] } },
    '/receipts/{id}': { get: { summary: 'Get receipt details', tags: ['Receipts'] } },
    '/receipts/{id}/print': { get: { summary: 'Get 58mm ESC/POS print payload and text', tags: ['Receipts'] } },
    '/receipts/{id}/cancel': { post: { summary: 'Cancel receipt', tags: ['Receipts'] } },

    // Field Collections, GPS & Cash Handover
    '/collections/visit': { post: { summary: 'Record field GPS visit (PTP, absent, locked)', tags: ['Collections'] } },
    '/collections/sheet': { get: { summary: 'Get daily collection route sheet', tags: ['Collections'] } },
    '/collections/visits': { get: { summary: 'List collection visits', tags: ['Collections'] } },
    '/handover/summary': { get: { summary: 'Get today cash/UPI collection totals', tags: ['Handover'] } },
    '/handover/submit': { post: { summary: 'Submit end-of-day cash handover with denominations', tags: ['Handover'] } },
    '/handover': { get: { summary: 'List handovers for manager verification', tags: ['Handover'] } },
    '/handover/{id}/accept': { post: { summary: 'Accept and verify cash handover', tags: ['Handover'] } },

    // Offline Sync
    '/sync/pull': { get: { summary: 'Pull delta updates since timestamp', tags: ['Sync'] } },
    '/sync/push': { post: { summary: 'Batch push offline collection payments and visits', tags: ['Sync'] } },

    // Messages, Expenses, P&L, Reports & Cron
    '/messages/sms': { post: { summary: 'Send SMS transaction notification', tags: ['Messages'] } },
    '/messages/whatsapp': { post: { summary: 'Send WhatsApp receipt payload', tags: ['Messages'] } },
    '/expenses': {
      get: { summary: 'List branch operational expenses', tags: ['Expenses'] },
      post: { summary: 'Record branch operational expense', tags: ['Expenses'] }
    },
    '/expenses/{id}': { get: { summary: 'Get expense voucher', tags: ['Expenses'] } },
    '/pnl': { get: { summary: 'Get Profit & Loss statement', tags: ['P&L'] } },
    '/reports/portfolio': { get: { summary: 'Get overall portfolio health summary', tags: ['Reports'] } },
    '/reports/par': { get: { summary: 'Get Portfolio at Risk aging buckets', tags: ['Reports'] } },
    '/reports/route-performance': { get: { summary: 'Get route recovery performance', tags: ['Reports'] } },
    '/cron/run-overdue': { post: { summary: 'Trigger daily overdue scan and penalty accrual', tags: ['Cron'] } },

    // Routes, Notices, Notifications, PDF, Backup & Dashboard
    '/routes': {
      get: { summary: 'List all field collection routes', tags: ['Routes'] },
      post: { summary: 'Create a new field collection route', tags: ['Routes'] }
    },
    '/routes/{id}/assign': { put: { summary: 'Assign a salesperson to a route', tags: ['Routes'] } },
    '/notices/generate': { post: { summary: 'Generate and serve legal overdue recovery notice', tags: ['Notices'] } },
    '/notices': { get: { summary: 'List generated legal recovery notices', tags: ['Notices'] } },
    '/notifications/push': { post: { summary: 'Dispatch FCM push notification to agent device', tags: ['Notifications'] } },
    '/pdf/receipt/{receiptNo}': { get: { summary: 'Stream printable HTML / PDF receipt', tags: ['PDF'] } },
    '/backup/run': { post: { summary: 'Execute manual database backup archive', tags: ['Backup'] } },
    '/backup/status': { get: { summary: 'Get backup health and retention status', tags: ['Backup'] } },
    '/dashboard/portfolio': { get: { summary: 'Company-wide active loan portfolio and metrics', tags: ['Dashboard'] } },
    '/dashboard/own': { get: { summary: "Field agent's personal summary and daily performance", tags: ['Dashboard'] } }
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  }
};

fs.writeFileSync(path.join(contractDir, 'openapi.json'), JSON.stringify(openapi, null, 2), 'utf8');
console.log('✅ Updated backend/contract/openapi.json');
