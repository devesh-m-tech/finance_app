# SHRI AMUDHA SMALL FINANCE - PERMISSION CATALOG & RBAC MATRIX

## 1. Role Definitions

| Role | Hierarchy | Description & Scope |
|---|---|---|
| **`SUPER_ADMIN`** | Tier 1 (Owner) | Unrestricted access across the entire organization. Can manage managers, assign restrictions, configure workflows, view P&L, override credit/LTV limits, and perform backups. At least one active Super Admin must always exist. |
| **`MANAGER`** | Tier 2 (Operations) | Operational lead. Full access to customers, loans, approvals (within limits), disbursement, collections, and reports by default. Subject to Super Admin-assigned restrictions (e.g., P&L block, ceiling amounts, branch scope). Maker-checker enforced. |
| **`SALESPERSON`** | Tier 3 (Field Agent) | Restricted to **exactly two actions**: (1) Add New Customer, and (2) Collect Cash. Read-only access to assigned customers/loans. Offline sync enabled. Cannot create, edit, or approve loans, view P&L, or access reports. |

---

## 2. Default Permission Matrix

| Module / Action Key | Description | SUPER_ADMIN | MANAGER (Default) | SALESPERSON |
|---|---|:---:|:---:|:---:|
| `dashboard:portfolio` | View complete company portfolio metrics & KPIs | YES | YES | NO |
| `dashboard:own` | View personal daily summary & targets | YES | YES | YES |
| `customers:create` | Onboard new customer application | YES | YES | YES |
| `customers:read` | View customer profile and documents | YES (All) | YES (All / Branch) | YES (Own / Assigned) |
| `customers:update` | Edit existing customer demographic data | YES | YES | NO |
| `customers:delete` | Soft-delete customer profile | YES | YES | NO |
| `customers:export` | Export customer lists to Excel/CSV | YES | YES | NO |
| `guarantors:manage` | Add / Edit / Remove guarantors | YES | YES | NO (Add during onboarding only) |
| `documents:upload` | Upload customer & collateral documents | YES | YES | YES (Onboarding only) |
| `documents:verify` | Mark documents as verified / rejected | YES | YES | NO |
| `documents:delete` | Remove uploaded documents | YES | YES | NO |
| `fingerprints:capture`| Capture biometric template & image | YES | YES | YES (Onboarding only) |
| `fingerprints:verify` | Match biometric scan against stored template | YES | YES | NO |
| `kyc:run` | Perform PAN / Aadhaar / Voter verification | YES | YES | NO |
| `credit:run` | Execute CIBIL / Experian credit pulls | YES | YES | NO |
| `loans.daily:create` | Initiate daily collection loan | YES | YES | NO |
| `loans.daily:approve` | Approve daily collection loan | YES | YES (Up to ceiling) | NO |
| `loans.daily:disburse`| Disburse funds and generate schedule | YES | YES | NO |
| `loans.weekly:*` | Weekly loan lifecycle (create, approve, disburse) | YES | YES | NO |
| `loans.monthly:*` | Monthly EMI loan lifecycle | YES | YES | NO |
| `loans.vehicle:*` | Two & Four Wheeler vehicle loans | YES | YES | NO |
| `loans.metal:*` | Gold & Silver pawn / pledge loans | YES | YES | NO |
| `loans:override` | Override LTV, credit floor, or disbursal checks | YES | NO | NO |
| `collections:collect` | Collect installment cash / online payment | YES | YES | YES (Assigned only) |
| `collections:visit` | Log GPS visit outcome (PTP, absent, refused)| YES | YES | YES |
| `collections:assign` | Assign routes & customers to field agents | YES | YES | NO |
| `payments:read` | View transaction history & ledger | YES (All) | YES (All) | YES (Own collections) |
| `receipts:read` | View issued payment receipts | YES (All) | YES (All) | YES (Own receipts) |
| `receipts:reprint` | Print thermal receipt via Bluetooth | YES | YES | YES (Own receipts) |
| `receipts:cancel` | Cancel receipt and issue Credit Note | YES | YES (Unless restricted)| NO |
| `handover:submit` | Submit collected cash at end of day | YES | YES | YES |
| `handover:accept` | Verify and acknowledge agent cash handover | YES | YES | NO |
| `rates:manage` | Update daily Gold/Silver market rates | YES | YES (Unless restricted)| NO |
| `notices:manage` | Draft, approve, and dispatch legal notices | YES | YES | NO |
| `messages:manage` | Send manual SMS / WhatsApp notifications | YES | YES | NO |
| `pnl:read` | View Profit & Loss statements & margins | YES | YES (Default; restrictable)| NO |
| `expenses:manage` | Log and approve operating expenses | YES | YES (Unless restricted)| NO |
| `reports:read` | View operational & financial reports | YES | YES | NO |
| `reports:export` | Export reports (PDF / Excel / CSV) | YES | YES (Unless restricted)| NO |
| `users:salespersons`| Create, edit, reset Salesperson accounts | YES | YES | NO |
| `users:managers` | Create, edit, deactivate Manager accounts | YES | NO | NO |
| `restrictions:manage`| Assign or remove Manager restrictions | YES | NO | NO |
| `settings:manage` | Configure global system parameters & branding| YES | NO | NO |
| `workflows:manage` | Design and publish dynamic workflows | YES | NO | NO |
| `forms:manage` | Build dynamic forms and custom fields | YES | NO | NO |
| `audit:read` | Inspect system-wide audit and security logs| YES | YES (Read-only) | NO |
| `backup:run` | Trigger on-demand backup / restore drill | YES | NO | NO |
| `records:hardDelete`| Permanently purge records from database | YES | NO | NO |

---

## 3. Effective Permission Calculation & Enforcement

The permission engine runs as a central NestJS Guard (`PermissionsGuard`):
```typescript
effectivePermissions = rolePermissions.filter(p => !userRestrictions.has(p));
```

### Decision Rules
1. **Deny Wins**: If any active restriction matches the requested module or action, the request is immediately denied (HTTP 403 Forbidden).
2. **Versioned Invalidation**: Each modification to a role or manager restriction increments `permissionsVersion`. Active sessions are updated via Redis and push-notified over WebSockets/SSE.
3. **Audit Logging**: Every denied attempt records `userId`, `targetRoute`, `ipAddress`, and `timestamp` into the `permission_audit` collection.
