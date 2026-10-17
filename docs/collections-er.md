# SHRI AMUDHA SMALL FINANCE - DATABASE COLLECTIONS & ER DIAGRAM

## 1. Mongoose Schema Design Principles
1. **Bounded vs Unbounded**:
   - **Embedded**: Bounded items read alongside parent entity (e.g., guarantor snapshots, document versions array, custom fields object, workflow history records).
   - **Referenced (ObjectId)**: High-velocity unbounded collections (payments, receipts, repayment installments, audit logs, ledger entries, collection visits).
2. **Financial Integrity**:
   - All money is stored as integer paise (`*Paise`), never floats.
   - Sequence generation (receipts, loan account numbers) uses an atomic `counters` collection inside MongoDB transactions.
   - Soft-delete pattern (`deletedAt`, `deletedBy`, `deleteReason`) default filtered by a query plugin.
3. **Security**:
   - AES-256-GCM field-level encryption for Aadhaar, fingerprint templates, raw CIBIL scores, and bank account numbers.
   - Deterministic HMAC-SHA256 hashes (`aadhaarHash`, `panHash`) with unique partial indexes for duplicate detection.

---

## 2. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    BRANCHES ||--o{ USERS : "employs"
    BRANCHES ||--o{ ROUTES : "contains"
    BRANCHES ||--o{ LOANS : "issues"
    BRANCHES ||--o{ RECEIPTS : "sequences"

    USERS ||--o| USER_RESTRICTIONS : "configured_with"
    USERS ||--o{ COLLECTION_VISITS : "executes"
    USERS ||--o{ CASH_HANDOVERS : "submits_or_accepts"
    USERS ||--o{ AUDIT_LOGS : "triggers"

    ROUTES ||--o{ ROUTE_ASSIGNMENTS : "assigned_to"
    USERS ||--o{ ROUTE_ASSIGNMENTS : "operates"

    CUSTOMERS ||--o{ CUSTOMER_DOCUMENTS : "owns"
    CUSTOMERS ||--o| FINGERPRINTS : "biometric_data"
    CUSTOMERS ||--o{ KYC_VERIFICATIONS : "undergoes"
    CUSTOMERS ||--o{ CREDIT_CHECKS : "evaluates"
    CUSTOMERS ||--o{ LOANS : "borrows"
    CUSTOMERS ||--o{ GUARANTORS : "sponsored_by"

    LOANS ||--o{ REPAYMENT_SCHEDULE : "amortized_into"
    LOANS ||--o{ PAYMENTS : "receives"
    LOANS ||--o{ RECEIPTS : "issues"
    LOANS ||--o{ NOTICES : "served"
    LOANS ||--o{ PENALTIES : "accrues"
    LOANS ||--o| METAL_ITEMS : "secures_gold_loan"

    PAYMENTS ||--|| RECEIPTS : "generates"
    RECEIPTS ||--o| CREDIT_NOTES : "reversed_by"

    WORKFLOW_DEFINITIONS ||--o{ WORKFLOW_INSTANCES : "defines"
    WORKFLOW_INSTANCES ||--o{ WORKFLOW_HISTORY : "tracks"

    USERS {
        ObjectId _id PK
        string username UK
        string passwordHash
        string fullName
        string mobile
        string role "SUPER_ADMIN | MANAGER | SALESPERSON"
        ObjectId branchId FK
        int permissionsVersion
        boolean isActive
    }

    CUSTOMERS {
        ObjectId _id PK
        string customerCode UK
        string fullName
        string mobile
        string aadhaarHash UK
        string encryptedAadhaar
        string maskedAadhaar
        string panHash UK
        string encryptedPan
        string status "DRAFT | KYC_PENDING | ACTIVE | INACTIVE"
        ObjectId assignedTo FK
        ObjectId createdBy FK
        json customFields
    }

    LOANS {
        ObjectId _id PK
        string loanAccountNo UK
        ObjectId customerId FK
        ObjectId branchId FK
        string loanType "daily | weekly | monthly | vehicle | metal"
        int principalAmountPaise
        int rateBasisPoints
        int tenureMonthsOrDays
        int emiAmountPaise
        int outstandingPrincipalPaise
        int outstandingInterestPaise
        int outstandingPenaltyPaise
        string status "DRAFT | PENDING_APPROVAL | APPROVED | DISBURSED | ACTIVE | CLOSED"
        ObjectId approvedBy FK
        ObjectId disbursedBy FK
        int rev
    }

    REPAYMENT_SCHEDULE {
        ObjectId _id PK
        ObjectId loanId FK
        int installmentNo
        date dueDate
        int principalDuePaise
        int interestDuePaise
        int totalDuePaise
        int principalPaidPaise
        int interestPaidPaise
        int penaltyPaidPaise
        string status "PENDING | PARTIALLY_PAID | PAID | OVERDUE"
    }

    PAYMENTS {
        ObjectId _id PK
        ObjectId loanId FK
        int amountPaidPaise
        string paymentMode "CASH | GPAY | PHONEPE | UPI | BANK | CHEQUE"
        string transactionRef
        ObjectId collectedBy FK
        date paidAt
        int rev
    }

    RECEIPTS {
        ObjectId _id PK
        ObjectId branchId FK
        string receiptNo UK
        ObjectId loanId FK
        ObjectId paymentId FK
        int amountPaise
        boolean noGst
        string thermalPayload
        ObjectId issuedBy FK
        date issuedAt
    }
```
