import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { CountUp } from '../../components/CountUp';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isModuleBlocked, hasPermission } = useAuth();

  const role = user?.role || 'SALESPERSON';

  // Demo dynamic figures in paise
  const [collectedTodayPaise] = useState(4850000); // ₹48,500
  const [targetPaise] = useState(6000000); // ₹60,000
  const [portfolioTotalPaise] = useState(1485000000); // ₹1,48,50,000

  // 1. SALESPERSON HERO
  if (role === 'SALESPERSON') {
    const progressPercent = Math.min(
      Math.round((collectedTodayPaise / targetPaise) * 100),
      100
    );

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
        {/* Yellow Header */}
        <View style={styles.heroHeader}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingTitle}>Vanakkam, {user?.fullName?.split(' ')[0] || 'Agent'}!</Text>
              <Text style={styles.dateText}>Today: {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
            </View>
            <Badge label="FIELD AGENT" variant="primary" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Animated Collected Today Ring / Card */}
          <Card variant="hero" style={styles.salesHeroCard}>
            <Text style={styles.kpiLabel}>COLLECTED TODAY</Text>
            <CountUp endPaise={collectedTodayPaise} style={styles.bigAmount} />

            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressSub}>Target: ₹60,000</Text>
              <Text style={styles.progressPercent}>{progressPercent}% Achieved</Text>
            </View>
          </Card>

          {/* TWO PRIMARY MANDATORY BUTTONS FOR SALESPERSON */}
          <Text style={styles.sectionHeader}>QUICK FIELD ACTIONS</Text>
          <View style={styles.bigButtonsRow}>
            <TouchableOpacity
              style={[styles.hugeButton, styles.hugeButtonPrimary]}
              onPress={() => router.push('/new-customer')}
              activeOpacity={0.85}
            >
              <Text style={styles.hugeButtonIcon}>➕</Text>
              <Text style={styles.hugeButtonTitle}>ADD CUSTOMER</Text>
              <Text style={styles.hugeButtonSub}>Full KYC & Biometric</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hugeButton, styles.hugeButtonSecondary]}
              onPress={() => router.push('/(tabs)/collect')}
              activeOpacity={0.85}
            >
              <Text style={styles.hugeButtonIcon}>💵</Text>
              <Text style={styles.hugeButtonTitle}>COLLECT CASH</Text>
              <Text style={styles.hugeButtonSub}>Instant Print Receipt</Text>
            </TouchableOpacity>
          </View>

          {/* End-of-Day Handover Quick Action */}
          <TouchableOpacity
            onPress={() => router.push('/handover')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              padding: spacing[3],
              marginBottom: spacing[4],
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: spacing[2] }}>💼</Text>
              <View>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>Daily Cash Handover</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Submit counted cash denominations to manager</Text>
              </View>
            </View>
            <Text style={{ color: colors.primaryDark, fontWeight: 'bold' }}>Submit →</Text>
          </TouchableOpacity>

          {/* Today's Assigned Collection Sheet */}
          <Text style={styles.sectionHeader}>TODAY'S ASSIGNED COLLECTION (ROUTE 1)</Text>
          <Card>
            <View style={styles.customerRow}>
              <View>
                <Text style={styles.custName}>M. Murugan (Daily #D-104)</Text>
                <Text style={styles.custLoc}>Town Hall, Cross 3 • Phone: 98421-XXXXX</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.dueAmt}>₹500 due</Text>
                <Badge label="Pending" variant="warning" />
              </View>
            </View>
          </Card>

          <Card>
            <View style={styles.customerRow}>
              <View>
                <Text style={styles.custName}>P. Lakshmi (Weekly #W-209)</Text>
                <Text style={styles.custLoc}>RS Puram Flower Market • Phone: 98432-XXXXX</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.dueAmt}>₹1,200 due</Text>
                <Badge label="Paid" variant="success" />
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. MANAGER HERO
  if (role === 'MANAGER') {
    const isPnlBlocked = isModuleBlocked('pnl');

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
        <View style={styles.heroHeader}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingTitle}>Manager: {user?.fullName}</Text>
              <Text style={styles.dateText}>{user?.branch?.name || 'Main Branch - Coimbatore'}</Text>
            </View>
            <Badge label="BRANCH OPS" variant="primary" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Pending Approvals Queue Pulse */}
          <Card variant="hero" style={styles.pulseCard}>
            <View style={styles.pulseRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.pulseTitle}>APPROVALS QUEUE (3 PENDING)</Text>
            </View>
            <Text style={styles.pulseSub}>
              2 Daily Loans & 1 Gold Collateral Loan awaiting credit verification.
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] }}>
              <Button
                title="Review Queue →"
                size="sm"
                variant="primary"
                onPress={() => router.push('/(tabs)/customers')}
                style={{ flex: 1 }}
              />
              <Button
                title="New Loan +"
                size="sm"
                variant="secondary"
                onPress={() => router.push('/loans')}
                style={{ flex: 1 }}
              />
            </View>
          </Card>

          {/* Branch Portfolio KPI */}
          <Text style={styles.sectionHeader}>BRANCH PERFORMANCE</Text>
          <View style={styles.kpiGrid}>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>TODAY'S COLLECTION</Text>
              <Text style={styles.kpiValue}>₹1,84,500</Text>
              <Badge label="12 Field Agents" variant="neutral" />
            </Card>

            <Card style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>ACTIVE BORROWERS</Text>
              <Text style={styles.kpiValue}>418</Text>
              <Badge label="98.2% Recovery" variant="success" />
            </Card>
          </View>

          {/* Conditional P&L preview or Restricted badge */}
          {isPnlBlocked ? (
            <Card style={styles.restrictedCard}>
              <Text style={styles.restrictedTitle}>🔒 Financial P&L Blocked</Text>
              <Text style={styles.restrictedSub}>
                Branch net profit margins have been restricted for your manager account by the Super Admin.
              </Text>
            </Card>
          ) : (
            <Card variant="gold">
              <Text style={styles.kpiLabel}>BRANCH NET PROFIT (THIS MONTH)</Text>
              <Text style={styles.kpiValue}>₹2,42,800</Text>
              <Badge label="P&L Permitted" variant="success" />
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. SUPER ADMIN HERO
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <View style={styles.heroHeader}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingTitle}>Organization Portfolio</Text>
            <Text style={styles.dateText}>Owner & Super Admin Overview</Text>
          </View>
          <Badge label="SUPER ADMIN" variant="primary" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Card variant="hero">
          <Text style={styles.kpiLabel}>TOTAL ACTIVE PORTFOLIO</Text>
          <CountUp endPaise={portfolioTotalPaise} style={styles.bigAmount} />
          <Text style={styles.kpiSub}>Across 7 Product Lines in 4 Branches</Text>
        </Card>

        <Text style={styles.sectionHeader}>SYSTEM ADMINISTRATION</Text>
        <Card>
          <Text style={styles.adminCardTitle}>Manager Restrictions & Security</Text>
          <Text style={styles.adminCardDesc}>
            Configure fine-grained module locks, approval ceilings, or loan-type blocks for branch managers.
          </Text>
          <Button
            title="Manage Branch Restrictions →"
            variant="secondary"
            onPress={() => router.push('/(tabs)/profile')}
            style={{ marginTop: spacing[3] }}
          />
        </Card>

        <Card variant="gold">
          <Text style={styles.adminCardTitle}>Gold & Silver Collateral Vault</Text>
          <Text style={styles.adminCardDesc}>
            Current gold reserve: 1,840.50 grams • Market Valuation: ₹1,24,50,000
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    opacity: 0.85,
    marginTop: 2,
  },
  container: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  salesHeroCard: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  kpiLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
    letterSpacing: 1,
  },
  bigAmount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900',
    color: colors.textPrimary,
    marginVertical: spacing[2],
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    marginTop: spacing[2],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryDeep,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing[2],
  },
  progressSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  progressPercent: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  sectionHeader: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  bigButtonsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  hugeButton: {
    flex: 1,
    height: 120,
    borderRadius: radii.lg,
    padding: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  hugeButtonPrimary: {
    backgroundColor: colors.primary,
  },
  hugeButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  hugeButtonIcon: {
    fontSize: 28,
    marginBottom: spacing[1],
  },
  hugeButtonTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textOnPrimary,
    textAlign: 'center',
  },
  hugeButtonSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    opacity: 0.75,
    textAlign: 'center',
    marginTop: 2,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  custName: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  custLoc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dueAmt: {
    fontSize: typography.fontSize.base,
    fontWeight: '800',
    color: colors.primaryDeep,
    marginBottom: 4,
  },
  pulseCard: {
    borderColor: colors.warning,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.warning,
  },
  pulseTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: '#92400E',
  },
  pulseSub: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginTop: spacing[2],
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  kpiCard: {
    flex: 1,
  },
  kpiValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: spacing[1],
  },
  kpiSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  restrictedCard: {
    backgroundColor: colors.neutralLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  restrictedTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  restrictedSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  adminCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  adminCardDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
});
