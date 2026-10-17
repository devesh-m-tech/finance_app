import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Badge } from './Badge';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import { DynamicFormSchema, FormFieldDefinition } from '@shared/form-engine/schema';
import { validateFormField } from '@shared/form-engine/validator';

export interface DynamicFormRendererProps {
  schema: DynamicFormSchema;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  userRole?: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  schema,
  initialValues = {},
  onSubmit,
  userRole = 'SALESPERSON',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStep = schema.steps[currentStepIndex];

  const handleFieldChange = (name: string, value: any, fieldDef: FormFieldDefinition) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Instant validation check
    const errorMsg = validateFormField(fieldDef, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) next[name] = errorMsg;
      else delete next[name];
      return next;
    });
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};
    for (const field of currentStep.fields) {
      // Check visibility to role
      if (field.visibleToRoles && !field.visibleToRoles.includes(userRole)) {
        continue;
      }
      const val = formData[field.name];
      const errorMsg = validateFormField(field, val);
      if (errorMsg) {
        stepErrors[field.name] = errorMsg;
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      Alert.alert('Incomplete Step', 'Please resolve the highlighted field validation errors before proceeding.');
      return;
    }

    if (currentStepIndex < schema.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Bar Indicator */}
      <View style={styles.stepBarContainer}>
        {schema.steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          return (
            <View key={step.id} style={styles.stepIndicatorCol}>
              <View
                style={[
                  styles.stepBubble,
                  isActive && styles.stepBubbleActive,
                  isDone && styles.stepBubbleDone,
                ]}
              >
                <Text
                  style={[
                    styles.stepBubbleText,
                    (isActive || isDone) && styles.stepBubbleTextActive,
                  ]}
                >
                  {isDone ? '✓' : idx + 1}
                </Text>
              </View>
              <Text style={styles.stepTitle} numberOfLines={1}>
                {step.title.split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.formScroll}>
        <Card variant="hero" style={styles.stepHeaderCard}>
          <Text style={styles.stepHeaderSubtitle}>
            STEP {currentStepIndex + 1} OF {schema.steps.length}
          </Text>
          <Text style={styles.stepHeaderTitle}>{currentStep.title}</Text>
          {currentStep.titleTamil ? (
            <Text style={styles.stepHeaderTamil}>{currentStep.titleTamil}</Text>
          ) : null}
        </Card>

        {currentStep.fields.map((field) => {
          // Check role visibility
          if (field.visibleToRoles && !field.visibleToRoles.includes(userRole)) {
            return null;
          }

          if (field.type === 'photo' || field.type === 'fingerprint' || field.type === 'signature') {
            const isCaptured = !!formData[field.name];
            return (
              <Card key={field.name} style={styles.hardwareCard}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={styles.hardwareRow}>
                  <Text style={styles.hardwareIcon}>
                    {field.type === 'fingerprint' ? '👆' : field.type === 'photo' ? '📷' : '✍️'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hardwareStatus}>
                      {isCaptured ? 'Captured & Template Encrypted' : 'Hardware Ready: Tap to Capture'}
                    </Text>
                    {errors[field.name] ? (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    ) : null}
                  </View>
                  <Button
                    title={isCaptured ? 'Re-scan' : 'Capture'}
                    size="sm"
                    variant={isCaptured ? 'secondary' : 'primary'}
                    onPress={() => {
                      handleFieldChange(field.name, 'MOCK_ENCRYPTED_BIOMETRIC_PAYLOAD', field);
                      Alert.alert('Hardware Capture', `${field.label} captured successfully via OTG sensor.`);
                    }}
                  />
                </View>
              </Card>
            );
          }

          return (
            <Input
              key={field.name}
              label={field.label}
              value={formData[field.name] ? String(formData[field.name]) : ''}
              onChangeText={(text) => handleFieldChange(field.name, text, field)}
              error={errors[field.name]}
              placeholder={field.placeholder || `Enter ${field.label}`}
              keyboardType={field.type === 'number' || field.type === 'currency' ? 'numeric' : 'default'}
              maxLength={field.validation?.maxLength}
            />
          );
        })}

        {/* Action Controls */}
        <View style={styles.actionsRow}>
          {currentStepIndex > 0 ? (
            <Button
              title="← Back"
              variant="secondary"
              onPress={handleBack}
              style={{ flex: 1 }}
            />
          ) : null}
          <Button
            title={currentStepIndex === schema.steps.length - 1 ? 'Submit Application' : 'Next Step →'}
            variant="primary"
            onPress={handleNext}
            style={{ flex: 2 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepIndicatorCol: {
    alignItems: 'center',
  },
  stepBubble: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBubbleActive: {
    backgroundColor: colors.primary,
  },
  stepBubbleDone: {
    backgroundColor: colors.primaryDeep,
  },
  stepBubbleText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepBubbleTextActive: {
    color: colors.textOnPrimary,
  },
  stepTitle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  formScroll: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  stepHeaderCard: {
    marginBottom: spacing[4],
  },
  stepHeaderSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 1,
  },
  stepHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  stepHeaderTamil: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hardwareCard: {
    marginVertical: spacing[2],
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  hardwareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  hardwareIcon: {
    fontSize: 28,
  },
  hardwareStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
  },
});
