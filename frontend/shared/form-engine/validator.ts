import { FormFieldDefinition } from './schema';

/**
 * Verhoeff checksum algorithm for client-side instant validation.
 */
function validateVerhoeff(numStr: string): boolean {
  const clean = numStr.replace(/\D/g, '');
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

export function validateFormField(
  field: FormFieldDefinition,
  value: any
): string | null {
  const v = field.validation;
  if (!v) return null;

  // Required check
  if (v.required && (value === undefined || value === null || value === '')) {
    return v.message || `${field.label} is required`;
  }

  if (value === undefined || value === null || value === '') {
    return null; // Empty optional field
  }

  // Aadhaar format & Verhoeff check
  if (v.isAadhaar) {
    const clean = String(value).replace(/\D/g, '');
    if (clean.length !== 12) {
      return 'Aadhaar must be exactly 12 digits';
    }
    if (!validateVerhoeff(clean)) {
      return 'Invalid Aadhaar checksum (Verhoeff failed)';
    }
  }

  // PAN check
  if (v.isPan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(String(value).trim().toUpperCase())) {
      return 'Invalid PAN format (e.g., ABCDE1234F)';
    }
  }

  // Length checks
  if (v.minLength && String(value).length < v.minLength) {
    return `${field.label} must be at least ${v.minLength} characters`;
  }
  if (v.maxLength && String(value).length > v.maxLength) {
    return `${field.label} cannot exceed ${v.maxLength} characters`;
  }

  // Pattern check
  if (v.pattern && !new RegExp(v.pattern).test(String(value))) {
    return v.message || `${field.label} has an invalid format`;
  }

  return null;
}
