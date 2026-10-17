import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@shared/theme/colors';
import { radii, spacing } from '@shared/theme/spacing';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'silver' | 'hero';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'gold':
        return styles.goldCard;
      case 'silver':
        return styles.silverCard;
      case 'hero':
        return styles.heroCard;
      case 'default':
      default:
        return styles.defaultCard;
    }
  };

  return <View style={[styles.baseCard, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: radii.lg, // 16px - 20px
    padding: spacing[4],
    marginVertical: spacing[2],
  },
  defaultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border, // 1px border #F1E6B8
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  goldCard: {
    backgroundColor: colors.goldCardBg,
    borderWidth: 1,
    borderColor: colors.goldCardBorder,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  silverCard: {
    backgroundColor: colors.silverCardBg,
    borderWidth: 1,
    borderColor: colors.silverCardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  heroCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
});
