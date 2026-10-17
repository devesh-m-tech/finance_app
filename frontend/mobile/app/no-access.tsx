import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import { t } from '@shared/i18n';

export default function NoAccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Restricted Area" onBack={() => router.replace('/(tabs)')} />
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        <Text style={styles.title}>{t('app.noAccessTitle')}</Text>
        <Text style={styles.desc}>{t('app.noAccessDesc')}</Text>

        <Card variant="hero" style={styles.infoCard}>
          <Text style={styles.infoTitle}>Role-Based Boundary</Text>
          <Text style={styles.infoText}>
            Your assigned role does not grant permission to view or execute this resource.
            Any unauthorized attempt has been logged in the audit ledger.
          </Text>
        </Card>

        <Button
          title="Return to Home"
          variant="primary"
          onPress={() => router.replace('/(tabs)')}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.warning,
  },
  lockIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  desc: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  infoCard: {
    width: '100%',
    marginBottom: spacing[6],
  },
  infoTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
    marginBottom: spacing[1],
  },
  infoText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  actionBtn: {
    width: '100%',
  },
});
