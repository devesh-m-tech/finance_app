export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    tamil: 'Noto Sans Tamil, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
    tabular: 'Inter, system-ui, sans-serif', // For financial figures
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16, // Minimum body text 16px
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 38,
    '4xl': 44,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

/**
 * Format integer paise into Indian Rupee string (e.g. 12500000 -> ₹1,25,000.00).
 * Display layer ONLY: backend stores pure integer paise.
 */
export function formatPaiseToRupees(
  paise: number | null | undefined,
  includeDecimals = true
): string {
  if (paise === null || paise === undefined || isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Parses user rupee input into integer paise for backend submission.
 */
export function parseRupeesToPaise(input: string | number): number {
  if (typeof input === 'number') return Math.round(input * 100);
  const clean = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}
