export const colors = {
  // Brand Yellow Palette (Mandatory Theme)
  primary: '#FFC107',
  primaryDark: '#E0A800',
  primaryDeep: '#B8860B',
  primaryLight: '#FFF3CD',
  primarySoftest: '#FFFBEA',

  // Gradients
  premiumGradient: ['#FFD54F', '#FFC107', '#FFB300'] as const,
  premiumGradientString: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 50%, #FFB300 100%)',

  // Surfaces & Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#FAF8F0',
  border: '#F1E6B8',
  divider: '#EFE7C8',

  // Typography Tokens
  textPrimary: '#1F2937',      // Primary body and headings
  textSecondary: '#6B7280',    // Subtitles, metadata, captions
  textMuted: '#9CA3AF',        // Placeholders, disabled text
  textOnPrimary: '#1F2937',    // ALWAYS dark text on yellow fill (never white)
  textInverse: '#FFFFFF',

  // Collateral Accents
  goldCardBg: '#FEF9E7',
  goldCardBorder: '#E6C65A',
  silverCardBg: '#F3F4F6',
  silverCardBorder: '#D1D5DB',

  // Semantic States (distinct from brand yellow)
  success: '#16A34A',
  successLight: '#DCFCE7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  neutral: '#9CA3AF',
  neutralLight: '#F3F4F6',

  // Dark Mode Overrides (Optional High Contrast)
  dark: {
    background: '#111827',
    surface: '#1F2937',
    surfaceAlt: '#374151',
    border: '#4B5563',
    divider: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textOnPrimary: '#1F2937', // Yellow CTA retains dark text in dark mode
  }
} as const;

/**
 * Returns color-coding and label for CIBIL scores.
 * Rule: 750+ green, 650-749 amber with dark text, below 650 red.
 */
export function getCibilScoreColor(score: number): {
  color: string;
  bg: string;
  textColor: string;
  label: string;
} {
  if (score >= 750) {
    return {
      color: colors.success,
      bg: colors.successLight,
      textColor: '#15803D',
      label: 'Excellent',
    };
  }
  if (score >= 650) {
    return {
      color: colors.warning,
      bg: colors.warningLight,
      textColor: '#92400E',
      label: 'Good / Moderate',
    };
  }
  return {
    color: colors.danger,
    bg: colors.dangerLight,
    textColor: '#B91C1C',
    label: 'Needs Attention',
  };
}
