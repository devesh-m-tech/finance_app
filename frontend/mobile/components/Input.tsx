import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '@shared/theme/colors';
import { radii, spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string | null;
  helperText?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  input: {
    minHeight: spacing[12], // 48px minimum touch target
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSize.base, // 16px minimum
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary, // Yellow focus ring
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.xs,
    marginTop: spacing[1],
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing[1],
  },
});
