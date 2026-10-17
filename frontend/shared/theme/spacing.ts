// Strict 8-point spatial grid
export const spacing = {
  0: 0,
  1: 4,   // 0.5 unit
  2: 8,   // 1 unit
  3: 12,  // 1.5 units
  4: 16,  // 2 units
  5: 20,  // 2.5 units
  6: 24,  // 3 units
  8: 32,  // 4 units
  10: 40, // 5 units
  12: 48, // Minimum touch target 48px
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,   // Primary buttons (12px)
  lg: 16,   // Standard cards (16px)
  xl: 20,   // Hero cards & bottom sheets (20px)
  '2xl': 24,
  full: 9999, // Pills, circular badges
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(184, 134, 11, 0.05)',
  base: '0 2px 4px 0 rgba(184, 134, 11, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(184, 134, 11, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(184, 134, 11, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(184, 134, 11, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  card: '0 4px 20px -2px rgba(224, 168, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
} as const;
