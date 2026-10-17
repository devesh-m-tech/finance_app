# SHRI AMUDHA SMALL FINANCE - ROLE-WISE USER MANUAL

## 1. SUPER ADMIN MANUAL (Organization Owner)

### Responsibilities
- Complete organizational oversight across branches, managers, portfolios, and financial statements.
- System configuration: Workflows, dynamic form fields, checklist requirements, branding, and daily gold/silver rates.
- Security administration: Manager account creation, role assignment, and granular manager restrictions.

### Key Workflows
1. **Managing Manager Restrictions**:
   - Navigate to **Settings > Manager Restrictions**.
   - Select a Manager.
   - Choose a preset (e.g., "No P&L and Expenses") or toggle individual module blocks, action blocks, or set an approval limit (e.g., max ₹1,00,000).
   - Enter an optional reason and expiry date. Click **Save & Apply**.
   - Changes take effect immediately without requiring the manager to log out.
2. **Reviewing Profit & Loss**:
   - Access **Financials > Profit & Loss**.
   - Filter by Month, Financial Year, or Branch.
   - Inspect breakdown: Interest Income + Processing Charges + Penalties - Operating Expenses - Written-off Bad Debts = Net Margin.
   - Export official P&L statement as PDF/Excel.
3. **High-Value Loan Approval & Overrides**:
   - Loans exceeding manager ceiling amounts appear in the **Super Admin Approvals Queue**.
   - Review applicant CIBIL score, Aadhaar KYC, guarantor details, and loan valuation.
   - For Gold/Silver loans exceeding 75% LTV, enter a mandatory justification remark to approve the override.

---

## 2. MANAGER MANUAL (Branch & Credit Operations)

### Responsibilities
- Credit appraisal, KYC review, loan verification, and loan sanctioning (up to assigned approval ceiling).
- Daily field operations: Route assignment, monitoring salesperson collection routes, and accepting cash handovers.
- Issuing customer payment receipts, credit notes (receipt cancellations with remark), and legal overdue notices.

### Key Workflows
1. **Loan Creation & Disbursement**:
   - Navigate to **Loans > New Loan** and select product type (Daily, Weekly, Monthly, Two Wheeler, Four Wheeler, Gold/Silver).
   - Search for an existing customer or onboard a new applicant.
   - The interactive loan calculator displays real-time EMI previews calculated directly by the backend engine.
   - Attach mandatory checklist documents (Income proof, vehicle RC, gold appraisal photo).
   - Maker-checker rule: A manager who created an application cannot approve their own application. Another manager or Super Admin must approve.
   - Once approved, proceed to **Disbursement**: record payment mode (Cash/Bank/UPI), voucher reference, and generate the signed agreement PDF.
2. **Route Assignment & Route Monitoring**:
   - Go to **Collections > Route Management**.
   - Assign designated customers and geographic clusters to field salespersons.
   - View real-time GPS collection stamps and track promise-to-pay commitments.
3. **End-of-Day Cash Handover Acceptance**:
   - Field salespersons submit their collected cash summary upon returning to the branch.
   - In **Collections > Cash Handover**, compare the physical cash received against the system total.
   - Accept the handover to balance the daily cash book, or flag a discrepancy with an explanatory note.

---

## 3. SALESPERSON MANUAL (Field Collection Agent)

### Responsibilities
- The salesperson mobile interface is purpose-built for field simplicity with high-contrast, large-button navigation.
- **Strictly limited to exactly two functions**:
  1. **Add New Customer**
  2. **Collect Cash & Record Visits**

### Key Workflows
1. **Collecting Cash in the Field**:
   - Tap the large primary yellow button **"Collect Cash"** on the home screen.
   - Search or select an assigned customer from today's collection route.
   - View the active loan, total due installment, and overdue penalty.
   - Enter the collected amount (supports Full, Partial, or Advance payment).
   - Select the payment mode (Cash, UPI, GPay, PhonePe based on branch settings) and upload an optional payment screenshot.
   - Tap **"Confirm & Issue Receipt"**.
   - Instant action: Print the receipt on a Bluetooth 58mm/80mm thermal printer, or tap **"Share Receipt"** to send the PDF via WhatsApp or SMS to the customer.
   - Works seamlessly offline! If out of cellular range, the receipt is stored in the local SQLite queue and automatically syncs once internet connectivity is restored.
2. **Onboarding a New Customer**:
   - Tap **"Add Customer"** on the home screen.
   - Complete the animated step-by-step wizard:
     1. Demographics: Full name, mobile number, address, pincode.
     2. Identity: Aadhaar (12 digits with real-time Verhoeff checksum validation), PAN, Voter ID, Cheque numbers.
     3. Nominee / Guarantor: Name, relation, phone, address.
     4. Biometric: Connect OTG fingerprint scanner (Mantra/Morpho) and capture applicant thumbprint.
     5. Photos & Docs: Capture applicant portrait, bank passbook, and signed consent form.
   - Tap **"Submit Customer"**. The profile is queued for manager verification.
3. **End-of-Day Handover**:
   - Tap **"My Collections"** on the bottom navigation bar.
   - Review today's total cash collected.
   - Tap **"Submit Cash Handover"** to present the collected cash to the branch manager for verification.
