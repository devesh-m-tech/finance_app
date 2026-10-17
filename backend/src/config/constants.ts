export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  SALESPERSON: 'SALESPERSON',
} as const;

export type SystemRoleType = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const DATA_SCOPES = {
  ALL: 'ALL',
  BRANCH: 'BRANCH',
  ASSIGNED_ONLY: 'ASSIGNED_ONLY',
} as const;

export const LOAN_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  TWO_WHEELER: 'two_wheeler',
  FOUR_WHEELER: 'four_wheeler',
  METAL: 'metal',
} as const;

export const PAYMENT_MODES = {
  CASH: 'CASH',
  GPAY: 'GPAY',
  PHONEPE: 'PHONEPE',
  UPI: 'UPI',
  BANK: 'BANK',
  CHEQUE: 'CHEQUE',
} as const;

export const RESTRICTION_PRESETS = {
  NO_PNL_EXPENSES: 'NO_PNL_EXPENSES',
  OPERATIONS_ONLY: 'OPERATIONS_ONLY',
  JUNIOR_MANAGER: 'JUNIOR_MANAGER',
  VIEW_ONLY: 'VIEW_ONLY',
} as const;
