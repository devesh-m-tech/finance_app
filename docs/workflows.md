# SHRI AMUDHA SMALL FINANCE - DEFAULT WORKFLOWS (MERMAID STATE DIAGRAMS)

## 1. Customer Onboarding Workflow (`CUSTOMER_ONBOARDING`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Field Agent or Manager Initiates
    DRAFT --> SUBMITTED: Complete Demographic & KYC Upload
    SUBMITTED --> KYC_PENDING: Auto Duplicate & Verhoeff Check Passed
    KYC_PENDING --> KYC_REJECTED: Verification Failed / Invalid Document
    KYC_REJECTED --> DRAFT: Send Back for Correction
    KYC_PENDING --> KYC_VERIFIED: Manager or Super Admin Approves
    KYC_VERIFIED --> ACTIVE: Biometric Captured & Customer Activated
    ACTIVE --> [*]
```

---

## 2. Unsecured Loans Workflow (`LOAN_DAILY`, `LOAN_WEEKLY`, `LOAN_MONTHLY`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Created by Manager or Super Admin
    DRAFT --> PENDING_VERIFICATION: Documents & Guarantor Attached
    PENDING_VERIFICATION --> PENDING_APPROVAL: Field Verification Verified
    PENDING_APPROVAL --> REJECTED: Ineligible / High Risk
    REJECTED --> DRAFT: Re-work Application
    PENDING_APPROVAL --> APPROVED: Approved (Manager <= Ceiling; Super Admin > Ceiling)
    APPROVED --> DISBURSED: Payment Made, Agreement Signed, Schedule Generated
    DISBURSED --> ACTIVE: First Due Date Reached
    ACTIVE --> OVERDUE: Grace Days Expired (Cron Job)
    OVERDUE --> ACTIVE: Installment Recovered
    ACTIVE --> CLOSED: All Installments Cleared
    ACTIVE --> FORECLOSED: Early Pre-closure Settlement
    OVERDUE --> WRITTEN_OFF: Bad Debt Approved by Super Admin
    CLOSED --> [*]
    FORECLOSED --> [*]
    WRITTEN_OFF --> [*]
```

---

## 3. Vehicle Loan Workflow (`LOAN_TWO_WHEELER`, `LOAN_FOUR_WHEELER`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Vehicle Quote & Application
    DRAFT --> DOCS_COLLECTED: Driving License, RC, Income Proofs Uploaded
    DOCS_COLLECTED --> VERIFICATION: Field & Vehicle Inspection
    VERIFICATION --> CREDIT_CHECK: CIBIL / Experian Pull Completed
    CREDIT_CHECK --> APPROVAL_L1: Manager Review
    APPROVAL_L1 --> APPROVAL_L2: Amount > Limit (Routes to Super Admin)
    APPROVAL_L1 --> AGREEMENT_PENDING: Amount <= Limit
    APPROVAL_L2 --> AGREEMENT_PENDING: Super Admin Sanctions
    AGREEMENT_PENDING --> DOWN_PAYMENT_COLLECTED: Down Payment Receipt Issued
    DOWN_PAYMENT_COLLECTED --> DISBURSED: NACH/ECS Mandate Registered
    DISBURSED --> HYPOTHECATED: RTO Hypothecation & Insurance Endorsed
    HYPOTHECATED --> ACTIVE: Regular Repayment
    ACTIVE --> CLOSED: Loan Fully Repaid
    CLOSED --> NOC_ISSUED: Hypothecation Removal NOC Dispatched
    NOC_ISSUED --> [*]
```

---

## 4. Gold & Silver Collateral Loan Workflow (`LOAN_METAL`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Customer Presents Metal Ornaments
    DRAFT --> APPRAISED: Purity Tested (Karat/Purity & Net Weight Recorded)
    APPRAISED --> VERIFICATION: Metal Valuation & LTV Guard (<= 75% or SA Override)
    VERIFICATION --> APPROVED: Appraisal Sheet & Photos Locked
    APPROVED --> PLEDGED: Gold/Silver Sealed in Safe Custody Bag
    PLEDGED --> DISBURSED: Instant Cash / UPI Disbursal
    DISBURSED --> ACTIVE: Monthly Interest Accrual
    ACTIVE --> OVERDUE: Default After Grace Period
    OVERDUE --> AUCTION_NOTICE: Legal Default Notice Dispatched
    AUCTION_NOTICE --> AUCTIONED: Public Auction Executed
    ACTIVE --> SETTLEMENT_PENDING: Full Principal & Interest Paid
    SETTLEMENT_PENDING --> VERIFY_RELEASE: Manager Custody Bag Verification
    VERIFY_RELEASE --> RELEASED: Customer Signoff & Ornaments Handed Over
    RELEASED --> [*]
    AUCTIONED --> [*]
```

---

## 5. Field Collection & Cash Handover Workflow (`COLLECTION_VISIT` & `CASH_HANDOVER`)

```mermaid
stateDiagram-v2
    [*] --> ROUTE_ASSIGNED: Manager Assigns Route to Salesperson
    ROUTE_ASSIGNED --> CUSTOMER_VISIT: GPS Check-in at Customer Location
    
    state Customer_Interaction {
        CUSTOMER_VISIT --> COLLECTED: Full / Partial / Advance Paid
        CUSTOMER_VISIT --> PROMISE_TO_PAY: Customer Agrees on Future Date
        CUSTOMER_VISIT --> NOT_AVAILABLE: Premises Locked / Unavailable
        CUSTOMER_VISIT --> REFUSED: Customer Refuses (Escalate to Manager)
    }

    COLLECTED --> INSTANT_RECEIPT: Atomic DB Transaction + Print / WhatsApp
    INSTANT_RECEIPT --> END_OF_DAY: Daily Field Run Completed
    END_OF_DAY --> HANDOVER_SUBMITTED: Salesperson Submits Cash Total
    HANDOVER_SUBMITTED --> HANDOVER_ACCEPTED: Manager Counts & Reconciles Cash
    HANDOVER_SUBMITTED --> DISCREPANCY_FLAGGED: Shortage / Excess Detected
    DISCREPANCY_FLAGGED --> HANDOVER_ACCEPTED: Discrepancy Adjusted with Audit Note
    HANDOVER_ACCEPTED --> [*]
```

---

## 6. Payment Allocation & Sequential Receipt Workflow (`PAYMENT`)

```mermaid
stateDiagram-v2
    [*] --> INITIATED: Payment Payload Received
    INITIATED --> ATOMIC_ALLOCATION: Multi-Document ACID Transaction
    
    state Waterfall_Allocation {
        ATOMIC_ALLOCATION --> ALLOCATE_PENALTY: Settle Overdue Penalties First
        ALLOCATE_PENALTY --> ALLOCATE_INTEREST: Settle Accrued Interest Second
        ALLOCATE_INTEREST --> ALLOCATE_PRINCIPAL: Settle Due Principal Third
    }

    ALLOCATE_PRINCIPAL --> COUNTER_INCREMENT: Sequential Receipt Number Generated
    COUNTER_INCREMENT --> RECEIPT_ISSUED: Immutable Receipt Stored
    RECEIPT_ISSUED --> [*]
    
    RECEIPT_ISSUED --> CANCEL_REQUESTED: Manager Identifies Clerical Error
    CANCEL_REQUESTED --> CREDIT_NOTE_ISSUED: Super Admin Approves Cancellation
    CREDIT_NOTE_ISSUED --> REVERSED: Outstanding Balance Restored
    REVERSED --> [*]
```
