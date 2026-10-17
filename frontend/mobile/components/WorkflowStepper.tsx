import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export interface WorkflowStepperProps {
  states: string[];
  currentState: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  states,
  currentState,
}) => {
  const currentIndex = states.indexOf(currentState);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {states.map((state, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <React.Fragment key={state}>
              {idx > 0 && (
                <View
                  style={[
                    styles.connectorLine,
                    idx <= currentIndex && styles.connectorLineActive,
                  ]}
                />
              )}
              <View style={styles.nodeColumn}>
                <View
                  style={[
                    styles.circleNode,
                    isDone && styles.circleDone,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.nodeText,
                      (isDone || isCurrent) && styles.nodeTextActive,
                    ]}
                  >
                    {isDone ? '✓' : idx + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.stateLabel, isCurrent && styles.stateLabelActive]}
                  numberOfLines={1}
                >
                  {state.replace(/_/g, ' ')}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
    marginVertical: spacing[2],
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 64,
  },
  connectorLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  connectorLineActive: {
    backgroundColor: colors.primaryDeep,
  },
  circleNode: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  circleDone: {
    backgroundColor: colors.primaryDeep,
  },
  circleCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  nodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  nodeTextActive: {
    color: colors.textOnPrimary,
  },
  stateLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stateLabelActive: {
    fontWeight: '700',
    color: colors.primaryDeep,
  },
});
