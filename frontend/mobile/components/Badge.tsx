import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, getCibilScoreColor } from '@shared/theme/colors';
import { radii, spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'cibil';
  cibilScore?: number;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  cibilScore,
  style,
}) => {
  if (variant === 'cibil' && cibilScore !== undefined) {
    const cibilInfo = getCibilScoreColor(cibilScore);
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: cibilInfo.bg, borderColor: cibilInfo.color },
          style,
        ]}
      >
        <Text style={[styles.badgeText, { color: cibilInfo.textColor }]}>
          CIBIL {cibilScore} • {cibilInfo.label}
        </Text>
      </View>
    );
  }

  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: '#92400E' };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'neutral':
        return { bg: colors.neutralLight, text: colors.textSecondary };
      case 'primary':
      default:
        return { bg: colors.primaryLight, text: colors.textOnPrimary };
    }
  };

  const currentVariant = getVariantStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: currentVariant.bg },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: currentVariant.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radii.full, // Pill shape
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
});
