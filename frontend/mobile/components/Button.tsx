import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { colors } from '@shared/theme/colors';
import { radii, spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import { motionTokens } from '@shared/motion/tokens';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      ...motionTokens.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...motionTokens.spring.snappy,
    }).start();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'destructive':
        return styles.destructiveContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'destructive':
        return styles.destructiveText;
      case 'outline':
        return styles.outlineText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.baseContainer,
          getContainerStyle(),
          getSizeStyle(),
          (disabled || loading) && styles.disabledContainer,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.textOnPrimary : colors.primaryDark}
            size="small"
          />
        ) : (
          <>
            {icon ? <>{icon}</> : null}
            <Text
              style={[
                styles.baseText,
                getTextStyle(),
                disabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: radii.md, // 12px mandatory
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  sizeSm: {
    minHeight: 36,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  sizeMd: {
    minHeight: spacing[12], // 48px minimum touch target
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  sizeLg: {
    minHeight: 56,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },

  // Primary: Yellow fill, dark text
  primaryContainer: {
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryText: {
    color: colors.textOnPrimary, // ALWAYS dark text on yellow
    fontWeight: '600',
  },

  // Secondary: White surface, yellow border
  secondaryContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // Destructive: Red outline with confirmation
  destructiveContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  destructiveText: {
    color: colors.danger,
    fontWeight: '600',
  },

  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  outlineText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },

  disabledContainer: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  baseText: {
    fontSize: typography.fontSize.base, // 16px minimum
    textAlign: 'center',
  },
  disabledText: {
    color: colors.textMuted,
  },
});
