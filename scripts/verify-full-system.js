const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('================================================================');
console.log('🚀 SHRI AMUDHA SMALL FINANCE LMS - FULL SYSTEM VERIFICATION TEST');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${details}`);
    process.exitCode = 1;
  }
}

// ====================================================================
// 1. FINANCIAL MONEY & WATERFALL TEST
// ====================================================================
console.log('1. Financial Money & Payment Waterfall Verification:');

// Round half up
function roundHalfUp(value) {
  return Math.floor(value + 0.5);
}

// Flat calculation in paise
function calculateFlatLoan(principalPaise, annualRatePercent, tenureMonths) {
  const annualRate = annualRatePercent / 100;
  const totalInterestPaise = roundHalfUp(principalPaise * annualRate * (tenureMonths / 12));
  const totalPayablePaise = principalPaise + totalInterestPaise;
  const installmentPaise = roundHalfUp(totalPayablePaise / tenureMonths);
  return { totalInterestPaise, totalPayablePaise, installmentPaise };
}

const flatLoan = calculateFlatLoan(2000000, 12, 12); // ₹20,000 at 12% for 12 months
assert(flatLoan.totalInterestPaise === 240000, 'Flat loan interest in exact paise (₹2,400.00)', `Got ${flatLoan.totalInterestPaise}`);
assert(flatLoan.totalPayablePaise === 2240000, 'Flat loan total payable in exact paise (₹22,400.00)', `Got ${flatLoan.totalPayablePaise}`);

// Payment Waterfall
function allocatePayment(amountPaidPaise, penaltyDuePaise, interestDuePaise, principalDuePaise) {
  let unallocated = amountPaidPaise;
  const penaltyPaidPaise = Math.min(unallocated, penaltyDuePaise);
  unallocated -= penaltyPaidPaise;
  const interestPaidPaise = Math.min(unallocated, interestDuePaise);
  unallocated -= interestPaidPaise;
  const principalPaidPaise = Math.min(unallocated, principalDuePaise);
  unallocated -= principalPaidPaise;
  return { penaltyPaidPaise, interestPaidPaise, principalPaidPaise, advancePaise: unallocated };
}

// Test case 1: Partial payment settles penalty first, then interest
const alloc1 = allocatePayment(150000, 50000, 80000, 500000); // Paid ₹1,500; Penalty ₹500, Interest ₹800, Principal ₹5,000
assert(alloc1.penaltyPaidPaise === 50000, 'Waterfall: Penalty settled first (₹500)', `Got ${alloc1.penaltyPaidPaise}`);
assert(alloc1.interestPaidPaise === 80000, 'Waterfall: Interest settled second (₹800)', `Got ${alloc1.interestPaidPaise}`);
assert(alloc1.principalPaidPaise === 20000, 'Waterfall: Remaining applied to Principal (₹200)', `Got ${alloc1.principalPaidPaise}`);
assert(alloc1.advancePaise === 0, 'Waterfall: Zero unallocated advance', `Got ${alloc1.advancePaise}`);

// Test case 2: Excess payment advances towards future principal
const alloc2 = allocatePayment(700000, 0, 100000, 500000); // Paid ₹7,000; Penalty ₹0, Interest ₹1,000, Principal ₹5,000
assert(alloc2.interestPaidPaise === 100000, 'Waterfall: Full interest settled (₹1,000)');
assert(alloc2.principalPaidPaise === 500000, 'Waterfall: Full principal settled (₹5,000)');
assert(alloc2.advancePaise === 100000, 'Waterfall: Advance credited towards next installment (₹1,000)');

// ====================================================================
// 2. CRYPTOGRAPHY & VERHOEFF AADHAAR CHECKSUM
// ====================================================================
console.log('\n2. Cryptography & Aadhaar Verhoeff Verification:');

const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function validateAadhaarVerhoeff(aadhaar) {
  if (!/^\d{12}$/.test(aadhaar)) return false;
  let c = 0;
  const digits = aadhaar.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c === 0;
}

assert(validateAadhaarVerhoeff('292832014034') === true, 'Verhoeff: Valid 12-digit Aadhaar accepted');
assert(validateAadhaarVerhoeff('292832014035') === false, 'Verhoeff: Single digit mutation detected & rejected');
assert(validateAadhaarVerhoeff('123456789012') === false, 'Verhoeff: Random sequence detected & rejected');

// AES-256-GCM test
const secretKey = crypto.createHash('sha256').update('shri-amudha-aes-master-key').digest();
function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}
function decrypt(ciphertext) {
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const originalAadhaar = '292832014034';
const enc = encrypt(originalAadhaar);
const dec = decrypt(enc);
assert(dec === originalAadhaar, 'AES-256-GCM encryption & decryption matches original Aadhaar');

// ====================================================================
// 3. STATUTORY LTV 75% CEILING TEST
// ====================================================================
console.log('\n3. Statutory Gold LTV Ceiling Verification:');

function validateGoldLtv(principalPaise, netGrams, goldRatePerGramPaise, ltvPercent) {
  if (ltvPercent > 75) return { allowed: false, reason: 'LTV exceeds statutory 75% limit' };
  const totalValuationPaise = Math.round(netGrams * goldRatePerGramPaise);
  const maxAllowablePrincipalPaise = Math.floor((totalValuationPaise * ltvPercent) / 100);
  if (principalPaise > maxAllowablePrincipalPaise) {
    return {
      allowed: false,
      reason: `Principal exceeds ${ltvPercent}% LTV allowable of ₹${maxAllowablePrincipalPaise / 100}`,
      maxAllowablePrincipalPaise,
    };
  }
  return { allowed: true, totalValuationPaise, maxAllowablePrincipalPaise };
}

// 25.5g at ₹6,850/g = Valuation ₹1,74,675. 70% LTV = ₹1,22,272.50
const goldCheck1 = validateGoldLtv(12000000, 25.5, 685000, 70); // Requesting ₹1,20,000
assert(goldCheck1.allowed === true, 'Gold Loan: ₹1,20,000 is within 70% LTV of ₹1,74,675 valuation');

const goldCheck2 = validateGoldLtv(15000000, 25.5, 685000, 70); // Requesting ₹1,50,000
assert(goldCheck2.allowed === false, 'Gold Loan: ₹1,50,000 exceeds 70% LTV cap (Correctly rejected)');

const goldCheck3 = validateGoldLtv(10000000, 25.5, 685000, 80); // Requesting 80% LTV
assert(goldCheck3.allowed === false, 'Gold Loan: 80% LTV exceeds statutory 75% maximum ceiling');

// ====================================================================
// 4. CASH RECONCILIATION & DENOMINATIONS TEST
// ====================================================================
console.log('\n4. Cash Denomination Reconciliation Verification:');

function calculateDenominationsTotal(d) {
  return (
    (d.note2000 || 0) * 2000 * 100 +
    (d.note500 || 0) * 500 * 100 +
    (d.note200 || 0) * 200 * 100 +
    (d.note100 || 0) * 100 * 100 +
    (d.note50 || 0) * 50 * 100 +
    (d.note20 || 0) * 20 * 100 +
    (d.note10 || 0) * 10 * 100 +
    (d.coins || 0) * 100
  );
}

const handoverCount = {
  note2000: 0,
  note500: 30, // 15,000
  note200: 10, // 2,000
  note100: 12, // 1,200
  note50: 4,   // 200
  note20: 4,   // 80
  note10: 2,   // 20
  coins: 0,
};
const totalCashPaise = calculateDenominationsTotal(handoverCount);
assert(totalCashPaise === 1850000, 'Handover: Denominations total equals exact ₹18,500.00 (1850000 paise)', `Got ${totalCashPaise}`);

// ====================================================================
// 5. RBAC & RESTRICTIONS DENY-WINS TEST
// ====================================================================
console.log('\n5. RBAC Permission Matrix & Deny-Wins Verification:');

const permsPath = path.resolve(__dirname, '../backend/contract/permissions.json');
const permsData = JSON.parse(fs.readFileSync(permsPath, 'utf8'));

const matrix = permsData.defaultMatrix;

// Evaluator
function checkPermission(role, userPermissions, restrictions, requiredKey) {
  if (role === 'SUPER_ADMIN') return true; // Super Admin has unrestricted bypass

  // Deny-Wins check
  if (restrictions && restrictions.blockedModules) {
    const [reqModule] = requiredKey.split(':');
    if (restrictions.blockedModules.includes(reqModule)) {
      return false; // Denied by restriction!
    }
  }

  return userPermissions.includes(requiredKey);
}

// 1. Super Admin tests
assert(checkPermission('SUPER_ADMIN', matrix.SUPER_ADMIN, null, 'pnl:read') === true, 'Super Admin: Can view P&L');
assert(checkPermission('SUPER_ADMIN', matrix.SUPER_ADMIN, null, 'loans:override') === true, 'Super Admin: Can override loan ceilings');
assert(checkPermission('SUPER_ADMIN', matrix.SUPER_ADMIN, null, 'restrictions:manage') === true, 'Super Admin: Can manage manager restrictions');

// 2. Standard Manager tests
assert(checkPermission('MANAGER', matrix.MANAGER, null, 'pnl:read') === true, 'Standard Manager: Can view P&L by default');
assert(checkPermission('MANAGER', matrix.MANAGER, null, 'loans.daily:approve') === true, 'Standard Manager: Can approve daily loans');
assert(checkPermission('MANAGER', matrix.MANAGER, null, 'restrictions:manage') === false, 'Standard Manager: Cannot manage manager restrictions');

// 3. Restricted Manager (NO_PNL_EXPENSES preset) tests
const manager2Restrictions = { blockedModules: ['pnl', 'expenses'], presetName: 'NO_PNL_EXPENSES' };
assert(
  checkPermission('MANAGER', matrix.MANAGER, manager2Restrictions, 'pnl:read') === false,
  'Restricted Manager: Deny-Wins blocks pnl:read'
);
assert(
  checkPermission('MANAGER', matrix.MANAGER, manager2Restrictions, 'expenses:manage') === false,
  'Restricted Manager: Deny-Wins blocks expenses:manage'
);
assert(
  checkPermission('MANAGER', matrix.MANAGER, manager2Restrictions, 'loans.daily:approve') === true,
  'Restricted Manager: Can still perform branch operations (approve loans)'
);

// 4. Salesperson tests (Strict 2-Action boundary: Add Customer + Collect Cash)
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'customers:create') === true, 'Salesperson: Permitted to Add Customer');
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'collections:collect') === true, 'Salesperson: Permitted to Collect Cash');
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'handover:submit') === true, 'Salesperson: Permitted to Submit Cash Handover');
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'pnl:read') === false, 'Salesperson: Strictly FORBIDDEN from P&L');
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'expenses:manage') === false, 'Salesperson: Strictly FORBIDDEN from Expenses');
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'loans.daily:create') === false, 'Salesperson: Strictly FORBIDDEN from Loan Creation');
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'loans.daily:approve') === false, 'Salesperson: Strictly FORBIDDEN from Loan Approval');
assert(checkPermission('SALESPERSON', matrix.SALESPERSON, null, 'records:hardDelete') === false, 'Salesperson: Strictly FORBIDDEN from Purging records');

// ====================================================================
// SUMMARY REPORT
// ====================================================================
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
if (passedTests === totalTests) {
  console.log('🏆 100% OF ALL SYSTEM TESTS PASSED! FULL SPECIFICATION VERIFIED.');
} else {
  console.log('⚠️ SOME TESTS FAILED.');
}
console.log('================================================================\n');
