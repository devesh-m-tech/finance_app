# SHRI AMUDHA SMALL FINANCE - API SPECIFICATION OVERVIEW

## 1. Conventions & Standards
- **Base URL**: `https://api.shriamudha.example.com/api/v1` (or `http://localhost:4000/api/v1` in local dev).
- **Authentication**: JWT Bearer Token in `Authorization: Bearer <accessToken>`.
- **RBAC**: Handled by global `PermissionsGuard` + `@RequirePermission('module:action')`.
- **Financial Units**: All monetary inputs and outputs are in **integer paise** (₹1.00 = 100 paise) using field names with the `Paise` suffix.
- **Pagination**: Cursor-based using `?limit=20&cursor=<lastId>` or offset-based `?page=1&limit=20`.
- **Response Format**:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "total": 120, "page": 1, "limit": 20 }
  }
  ```
- **Error Format**:
  ```json
  {
    "success": false,
    "error": {
      "code": "PERMISSION_DENIED",
      "message": "User lacks required permission: pnl:read",
      "requiredPermission": "pnl:read",
      "statusCode": 403
    }
  }
  ```

---

## 2. Core API Endpoints

### Authentication & Profile
- `POST /auth/login`: Authenticate with username and password. Returns JWT access token, refresh token, user profile, and effective permissions.
- `POST /auth/refresh`: Refresh expired access token.
- `GET /me/permissions`: Retrieve effective permission keys and active restriction flags.
- `POST /auth/pin-login`: Authenticate using 4-digit device PIN.

### Customers & Guarantors
- `POST /customers`: Onboard new customer application (Salesperson, Manager, Super Admin).
- `GET /customers`: List customers (Scoped: Salesperson sees assigned/own; Manager/Admin sees branch/all).
- `GET /customers/:id`: Get full customer profile with masked Aadhaar/PAN.
- `PATCH /customers/:id`: Update demographic information (Manager, Super Admin only).
- `DELETE /customers/:id`: Soft-delete customer with mandatory reason (Manager, Super Admin only).

### Loans & Amortization
- `POST /loans/preview`: Compute real-time EMI schedule, total interest, and charges without database persistence.
- `POST /loans`: Create new loan application (Daily, Weekly, Monthly, Vehicle, Metal).
- `GET /loans`: List loans with filters by type, branch, customer, and status.
- `GET /loans/:id`: Get loan details, collateral snapshots, and repayment schedule.
- `POST /loans/:id/transition`: Execute workflow transition (e.g., `approve`, `disburse`, `reject`).
- `POST /loans/:id/override`: Super Admin override for LTV or credit floor.

### Collections, Payments & Receipts
- `POST /collections/visit`: Record GPS field visit outcome (PTP, absent, refused).
- `POST /collections/collect`: Record installment collection and atomically generate sequential receipt.
- `GET /receipts/:id`: Retrieve receipt details, printable A4 PDF, and thermal ESC/POS payload.
- `POST /receipts/:id/cancel`: Request / approve receipt cancellation and issue credit note.
- `POST /collections/handover/submit`: Salesperson submits end-of-day cash bag total.
- `POST /collections/handover/:id/accept`: Manager verifies and accepts cash handover.

### Manager Restrictions (Super Admin Only)
- `GET /restrictions/:managerId`: Fetch active restrictions for a specific manager.
- `PUT /restrictions/:managerId`: Create or update manager restriction settings (preset or custom).
- `DELETE /restrictions/:managerId`: Remove all restrictions for a manager.

### Dynamic Engines (Workflows, Forms, Masters)
- `GET /workflows/definitions`: List published workflow definitions.
- `PUT /workflows/definitions/:entityType`: Update workflow states, transitions, roles, and guards.
- `GET /forms/:formKey`: Fetch dynamic form schema and validation rules.
- `GET /masters/rates/latest`: Get current Gold & Silver daily rates.
- `POST /masters/rates`: Publish new daily metal rates.

### Profit & Loss and Reports
- `GET /pnl`: Calculate monthly and overall P&L (Interest + Fees + Penalties - Expenses - Bad Debts). Guarded by `pnl:read`.
- `GET /reports/:reportType`: Stream or generate PDF/Excel operational reports.
- `POST /expenses`: Record branch operating expense with receipt image attachment.

### Synchronization & Realtime
- `GET /sync/delta`: Fetch changes since last sync timestamp for offline SQLite synchronization.
- `POST /sync/push`: Upload offline collection queue and new customer applications.
- `GET /app/version`: Check minimum supported app version for mandatory updates.
