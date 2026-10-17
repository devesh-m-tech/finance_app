import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { CountUp } from '../components/CountUp';
import { Skeleton } from '../components/Skeleton';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import { motionTokens } from '@shared/motion/tokens';

export default function DesignSystemScreen() {
  const router = useRouter();

  // Motion playground state
  const [motionBoxScale] = useState(new Animated.Value(1));
  const [countUpValue, setCountUpValue] = useState(12500000); // 1,25,000 INR
  const [testInput, setTestInput] = useState('999988887777');

  const triggerSpring = (preset: 'gentle' | 'snappy' | 'bouncy') => {
    Animated.sequence([
      Animated.timing(motionBoxScale, {
        toValue: 1.25,
        duration: motionTokens.duration.fast,
        useNativeDriver: true,
      }),
      Animated.spring(motionBoxScale, {
        toValue: 1,
        useNativeDriver: true,
        ...motionTokens.spring[preset],
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Design System & Tokens"
        subtitle="Yellow + White Premium Tokens & Motion"
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Section 1: Brand Color Tokens */}
        <Text style={styles.sectionTitle}>1. BRAND COLOR TOKENS</Text>
        <View style={styles.swatchGrid}>
          <View style={[styles.swatch, { backgroundColor: colors.primary }]}>
            <Text style={styles.swatchText}>Primary #FFC107</Text>
          </View>
          <View style={[styles.swatch, { backgroundColor: colors.primaryDark }]}>
            <Text style={styles.swatchText}>Dark #E0A800</Text>
          </View>
          <View style={[styles.swatch, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.swatchText, { color: colors.textPrimary }]}>
              Light #FFF3CD
            </Text>
          </View>
          <View style={[styles.swatch, { backgroundColor: colors.primarySoftest }]}>
            <Text style={[styles.swatchText, { color: colors.textPrimary }]}>
              Softest #FFFBEA
            </Text>
          </View>
        </View>

        {/* Section 2: Motion Playground */}
        <Text style={styles.sectionTitle}>2. MOTION PLAYGROUND</Text>
        <Card variant="hero">
          <Text style={styles.cardHeader}>Physics-Based Spring Presets</Text>
          <View style={styles.playgroundBoxContainer}>
            <Animated.View
              style={[
                styles.playgroundBox,
                { transform: [{ scale: motionBoxScale }] },
              ]}
            >
              <Text style={styles.boxText}>Dynamic Box</Text>
            </Animated.View>
          </View>
          <View style={styles.buttonRow}>
            <Button
              title="Gentle Spring"
              size="sm"
              variant="secondary"
              onPress={() => triggerSpring('gentle')}
            />
            <Button
              title="Snappy Spring"
              size="sm"
              variant="primary"
              onPress={() => triggerSpring('snappy')}
            />
            <Button
              title="Bouncy Spring"
              size="sm"
              variant="outline"
              onPress={() => triggerSpring('bouncy')}
            />
          </View>
        </Card>

        {/* Section 3: Animated CountUp (Paise -> Rupees) */}
        <Text style={styles.sectionTitle}>3. FINANCIAL COUNT-UP</Text>
        <Card>
          <Text style={styles.label}>Integer Paise to Indian Rupee Animation:</Text>
          <CountUp
            endPaise={countUpValue}
            style={styles.countUpDisplay}
          />
          <View style={styles.buttonRow}>
            <Button
              title="₹50,000"
              size="sm"
              variant="secondary"
              onPress={() => setCountUpValue(5000000)}
            />
            <Button
              title="₹1,25,000"
              size="sm"
              variant="secondary"
              onPress={() => setCountUpValue(12500000)}
            />
            <Button
              title="₹5,80,000"
              size="sm"
              variant="secondary"
              onPress={() => setCountUpValue(58000000)}
            />
          </View>
        </Card>

        {/* Section 4: Buttons System */}
        <Text style={styles.sectionTitle}>4. BUTTON COMPONENTS (48px Touch Target)</Text>
        <Button
          title="Primary Yellow CTA (Dark Text)"
          variant="primary"
          onPress={() => {}}
          style={{ marginBottom: spacing[2] }}
        />
        <Button
          title="Secondary White with Border"
          variant="secondary"
          onPress={() => {}}
          style={{ marginBottom: spacing[2] }}
        />
        <Button
          title="Destructive Red Outline"
          variant="destructive"
          onPress={() => {}}
          style={{ marginBottom: spacing[2] }}
        />
        <Button
          title="Loading Spinner State"
          variant="primary"
          loading
          onPress={() => {}}
        />

        {/* Section 5: Cards & Collateral Tints */}
        <Text style={styles.sectionTitle}>5. CARDS & COLLATERAL VARIANTS</Text>
        <Card variant="default">
          <Text style={styles.cardHeader}>Standard Application Card</Text>
          <Text style={styles.cardBody}>
            16px radius with #F1E6B8 subtle border and soft layered shadow.
          </Text>
        </Card>

        <Card variant="gold">
          <Text style={styles.cardHeader}>Gold Loan Appraisal Card</Text>
          <Text style={styles.cardBody}>
            Subtle gold background tint (#FEF9E7) and gold border (#E6C65A).
          </Text>
        </Card>

        <Card variant="silver">
          <Text style={styles.cardHeader}>Silver Pawn Collateral Card</Text>
          <Text style={styles.cardBody}>
            Subtle metallic silver tint (#F3F4F6) with grey border (#D1D5DB).
          </Text>
        </Card>

        {/* Section 6: CIBIL & Status Badges */}
        <Text style={styles.sectionTitle}>6. BADGES & CIBIL SCORE INDICATORS</Text>
        <View style={styles.badgeRow}>
          <Badge label="Active Loan" variant="success" />
          <Badge label="Pending Verification" variant="warning" />
          <Badge label="Overdue" variant="danger" />
          <Badge label="Closed" variant="neutral" />
        </View>
        <View style={[styles.badgeRow, { marginTop: spacing[2] }]}>
          <Badge label="" variant="cibil" cibilScore={780} />
          <Badge label="" variant="cibil" cibilScore={690} />
          <Badge label="" variant="cibil" cibilScore={540} />
        </View>

        {/* Section 7: Form Inputs & Validation */}
        <Text style={styles.sectionTitle}>7. FORM INPUTS & VERHOEFF VALIDATION</Text>
        <Input
          label="Aadhaar Number (12 Digits)"
          value={testInput}
          onChangeText={setTestInput}
          helperText="Verhoeff algorithm validated automatically"
        />

        {/* Section 8: Skeletons */}
        <Text style={styles.sectionTitle}>8. SKELETON SHIMMER</Text>
        <Skeleton height={24} style={{ marginBottom: spacing[2] }} />
        <Skeleton height={48} borderRadius={radii.md} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
    letterSpacing: 1,
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  swatch: {
    flex: 1,
    minWidth: '45%',
    height: 60,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatchText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  cardHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  cardBody: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  playgroundBoxContainer: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  playgroundBox: {
    width: 100,
    height: 100,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  boxText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  countUpDisplay: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
});
