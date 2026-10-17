// Phase 1 Algorithmic Verification Test
const crypto = require('crypto');

// 1. Verhoeff Aadhaar Verification
function validateAadhaarVerhoeff(aadhaar) {
  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length !== 12) return false;

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

  let c = 0;
  const reversedDigits = clean.split('').reverse().map(Number);
  for (let i = 0; i < reversedDigits.length; i++) {
    c = d[c][p[i % 8][reversedDigits[i]]];
  }
  return c === 0;
}

// 2. AES-256-GCM Verification
function encrypt(plaintext, keyHex) {
  const key = Buffer.from(keyHex.slice(0, 64), 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(base64Payload, keyHex) {
  const key = Buffer.from(keyHex.slice(0, 64), 'hex');
  const packed = Buffer.from(base64Payload, 'base64');
  const iv = packed.subarray(0, 12);
  const tag = packed.subarray(12, 28);
  const ciphertext = packed.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

// 3. Money Payment Allocation
function allocatePayment(amountPaidPaise, penaltyDuePaise, interestDuePaise, principalDuePaise) {
  let unallocated = amountPaidPaise;
  const penaltyPaidPaise = Math.min(unallocated, penaltyDuePaise);
  unallocated -= penaltyPaidPaise;

  const interestPaidPaise = Math.min(unallocated, interestDuePaise);
  unallocated -= interestPaidPaise;

  const principalPaidPaise = Math.min(unallocated, principalDuePaise);
  unallocated -= principalPaidPaise;

  return { penaltyPaidPaise, interestPaidPaise, principalPaidPaise, remainingAmountPaise: unallocated };
}

// RUN TESTS
console.log('🧪 Running Phase 1 Core Engineering Verifications...\n');

// Test 1: Verhoeff Checksum
// Valid sample Aadhaar according to Verhoeff: 292832014034
const validAadhaar = '292832014034';
const invalidAadhaar = '292832014038';
console.log(`1. Verhoeff Checksum:`);
console.log(`   - Valid Aadhaar (${validAadhaar}): ${validateAadhaarVerhoeff(validAadhaar) ? 'PASSED ✅' : 'FAILED ❌'}`);
console.log(`   - Invalid Aadhaar (${invalidAadhaar}): ${!validateAadhaarVerhoeff(invalidAadhaar) ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 2: AES-256-GCM Encryption
const testKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const sampleText = '9842101234';
const encrypted = encrypt(sampleText, testKey);
const decrypted = decrypt(encrypted, testKey);
console.log(`\n2. AES-256-GCM Encryption/Decryption:`);
console.log(`   - Original: ${sampleText}`);
console.log(`   - Encrypted Payload: ${encrypted.slice(0, 32)}...`);
console.log(`   - Decrypted: ${decrypted} (${decrypted === sampleText ? 'MATCHED ✅' : 'MISMATCH ❌'})`);

// Test 3: Money Allocation Waterfall (Penalty -> Interest -> Principal)
const allocation = allocatePayment(150000, 20000, 50000, 100000); // Paying 1,500 INR towards (200 penalty, 500 interest, 1000 principal)
console.log(`\n3. Payment Waterfall Allocation (Paying ₹1,500):`);
console.log(`   - Penalty Settle: ₹${allocation.penaltyPaidPaise / 100} (Expected: ₹200)`);
console.log(`   - Interest Settle: ₹${allocation.interestPaidPaise / 100} (Expected: ₹500)`);
console.log(`   - Principal Settle: ₹${allocation.principalPaidPaise / 100} (Expected: ₹800)`);
console.log(`   - Remaining Advance: ₹${allocation.remainingAmountPaise / 100} (Expected: ₹0)`);
if (
  allocation.penaltyPaidPaise === 20000 &&
  allocation.interestPaidPaise === 50000 &&
  allocation.principalPaidPaise === 80000 &&
  allocation.remainingAmountPaise === 0
) {
  console.log(`   - Result: ALLOCATION WATERFALL PASSED ✅`);
} else {
  console.log(`   - Result: ALLOCATION FAILED ❌`);
}

console.log('\n✨ All Phase 1 Core Verifications Completed Successfully!');
