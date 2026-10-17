import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../shared/theme/colors';
import { spacing, radius, typography } from '../../shared/theme';
import { Money } from '../../shared/theme/money';
import { Button } from '../components/ui/Button';

export default function LoansScreen() {
  const router = useRouter();

  const [loanType, setLoanType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'TWO_WHEELER' | 'METAL'>('DAILY');
  const [principalRupees, setPrincipalRupees] = useState('20000');
  const [interestPercent, setInterestPercent] = useState('12');
  const [tenure, setTenure] = useState('100');
  const [tenureUnit, setTenureUnit] = useState<'DAYS' | 'WEEKS' | 'MONTHS'>('DAYS');
  const [calculationType, setCalculationType] = useState<'FLAT' | 'REDUCING'>('FLAT');

  // Metal Appraisal State
  const [metalGrams, setMetalGrams] = useState('25.5');
  const [goldRatePerGram, setGoldRatePerGram] = useState('6850');
  const [ltvPercent, setLtvPercent] = useState('75'); // Statutory max 75%

  // Vehicle State
  const [vehicleReg, setVehicleReg] = useState('TN 58 AB 1234');
  const [vehicleModel, setVehicleModel] = useState('Honda Activa 6G');

  // Compute live preview
  const preview = useMemo(() => {
    const pRupees = parseFloat(principalRupees) || 0;
    const pPaise = Math.round(pRupees * 100);
    const rate = parseFloat(interestPercent) || 0;
    const t = parseInt(tenure, 10) || 1;

    let totalInterestRupees = 0;
    let totalPayableRupees = 0;
    let installmentRupees = 0;

    if (loanType === 'DAILY') {
      // 100 days micro collection
      totalInterestRupees = (pRupees * rate) / 100;
      totalPayableRupees = pRupees + totalInterestRupees;
      installmentRupees = Math.round(totalPayableRupees / t);
    } else if (calculationType === 'REDUCING') {
      const monthlyRate = rate / 12 / 100;
      const factor = Math.pow(1 + monthlyRate, t);
      installmentRupees = Math.round((pRupees * monthlyRate * factor) / (factor - 1));
      totalPayableRupees = installmentRupees * t;
      totalInterestRupees = totalPayableRupees - pRupees;
    } else {
      totalInterestRupees = Math.round((pRupees * (rate / 100) * (t / 12)));
      totalPayableRupees = pRupees + totalInterestRupees;
      installmentRupees = Math.round(totalPayableRupees / t);
    }

    return {
      pPaise,
      totalInterestRupees: Math.max(0, totalInterestRupees),
      totalPayableRupees: Math.max(0, totalPayableRupees),
      installmentRupees: Math.max(0, installmentRupees),
    };
  }, [principalRupees, interestPercent, tenure, loanType, calculationType]);

  // Gold Valuation
  const goldValuation = useMemo(() => {
    const grams = parseFloat(metalGrams) || 0;
    const rate = parseFloat(goldRatePerGram) || 0;
    const totalVal = Math.round(grams * rate);
    const maxLoanAllowed = Math.round((totalVal * Math.min(75, parseFloat(ltvPercent) || 75)) / 100);
    return {
      totalValuationRupees: totalVal,
      maxLoanAllowedRupees: maxLoanAllowed,
    };
  }, [metalGrams, goldRatePerGram, ltvPercent]);

  const handleApply = () => {
    if (loanType === 'METAL') {
      const p = parseFloat(principalRupees) || 0;
      if (p > goldValuation.maxLoanAllowedRupees) {
        Alert.alert(
          'LTV Ceiling Exceeded',
          `Principal ₹${p} exceeds maximum 75% LTV allowable loan of ₹${goldValuation.maxLoanAllowedRupees}.`
        );
        return;
      }
    }

    Alert.alert(
      'Loan Application Submitted',
      `Application for ₹${principalRupees} (${loanType}) submitted.\nUnder Maker-Checker policy, it requires Branch Manager approval before disbursal.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 50,
          paddingBottom: spacing[4],
          paddingHorizontal: spacing[4],
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Loan Calculator & Apply</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[4], paddingBottom: 100 }}>
        {/* Loan Product Category Tabs */}
        <Text style={[typography.label, { marginBottom: spacing[2] }]}>Select Loan Product</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[4] }}>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {[
              { id: 'DAILY', label: 'Daily Micro', icon: 'today-outline' },
              { id: 'WEEKLY', label: 'Weekly', icon: 'calendar-outline' },
              { id: 'MONTHLY', label: 'Monthly EMI', icon: 'business-outline' },
              { id: 'TWO_WHEELER', label: 'Two Wheeler', icon: 'bicycle-outline' },
              { id: 'METAL', label: 'Gold Loan', icon: 'diamond-outline' },
            ].map((p) => {
              const active = loanType === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => {
                    setLoanType(p.id as any);
                    if (p.id === 'DAILY') {
                      setTenure('100');
                      setTenureUnit('DAYS');
                      setInterestPercent('12');
                    } else if (p.id === 'WEEKLY') {
                      setTenure('25');
                      setTenureUnit('WEEKS');
                      setInterestPercent('14');
                    } else if (p.id === 'METAL') {
                      setTenure('12');
                      setTenureUnit('MONTHS');
                      setInterestPercent('11');
                    } else {
                      setTenure('24');
                      setTenureUnit('MONTHS');
                      setInterestPercent('15');
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                    borderRadius: radius.full,
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: active ? colors.primaryDark : colors.border,
                  }}
                >
                  <Ionicons
                    name={p.icon as any}
                    size={16}
                    color={active ? colors.textOnPrimary : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontWeight: '600', color: active ? colors.textOnPrimary : colors.textPrimary }}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Live Calculation Preview Hero Card */}
        <View
          style={{
            backgroundColor: colors.primaryLight,
            borderRadius: radius.lg,
            borderColor: colors.border,
            borderWidth: 1,
            padding: spacing[4],
            marginBottom: spacing[4],
          }}
        >
          <Text style={[typography.caption, { color: colors.textSecondary }]}>ESTIMATED INSTALLMENT</Text>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.textPrimary, marginVertical: 4 }}>
            ₹{preview.installmentRupees.toLocaleString('en-IN')}{' '}
            <Text style={{ fontSize: 14, fontWeight: 'normal', color: colors.textSecondary }}>
              / {tenureUnit === 'DAYS' ? 'day' : tenureUnit === 'WEEKS' ? 'week' : 'month'}
            </Text>
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[3] }}>
            <View>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Principal</Text>
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>
                ₹{Number(principalRupees || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Interest</Text>
              <Text style={{ fontWeight: 'bold', color: colors.primaryDeep }}>
                ₹{preview.totalInterestRupees.toLocaleString('en-IN')}
              </Text>
            </View>
            <View>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Payable</Text>
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>
                ₹{preview.totalPayableRupees.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Inputs */}
        <Text style={[typography.label, { marginBottom: spacing[1] }]}>Loan Principal Amount (₹)</Text>
        <TextInput
          value={principalRupees}
          onChangeText={setPrincipalRupees}
          keyboardType="number-pad"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing[3],
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: colors.surface,
            marginBottom: spacing[3],
          }}
        />

        <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[3] }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Tenure ({tenureUnit})</Text>
            <TextInput
              value={tenure}
              onChangeText={setTenure}
              keyboardType="number-pad"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Interest Rate (% p.a.)</Text>
            <TextInput
              value={interestPercent}
              onChangeText={setInterestPercent}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
              }}
            />
          </View>
        </View>

        {/* Collateral Details for Vehicle Loans */}
        {loanType === 'TWO_WHEELER' && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing[4],
              marginBottom: spacing[4],
            }}
          >
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing[3] }]}>
              Vehicle Collateral (Hypothecation)
            </Text>
            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Registration Number *</Text>
            <TextInput
              value={vehicleReg}
              onChangeText={setVehicleReg}
              autoCapitalize="characters"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                marginBottom: spacing[3],
              }}
            />
            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Make & Model</Text>
            <TextInput
              value={vehicleModel}
              onChangeText={setVehicleModel}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
              }}
            />
          </View>
        )}

        {/* Metal Collateral Appraisal for Gold Loans */}
        {loanType === 'METAL' && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing[4],
              marginBottom: spacing[4],
            }}
          >
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing[2] }]}>
              Gold Bullion Appraisal & 75% LTV
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[3] }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: spacing[1] }]}>Net Weight (Grams)</Text>
                <TextInput
                  value={metalGrams}
                  onChangeText={setMetalGrams}
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing[3],
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: spacing[1] }]}>Gold Rate (₹/g 22K)</Text>
                <TextInput
                  value={goldRatePerGram}
                  onChangeText={setGoldRatePerGram}
                  keyboardType="number-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing[3],
                    fontSize: 16,
                  }}
                />
              </View>
            </View>

            <View
              style={{
                backgroundColor: colors.primarySoftest,
                padding: spacing[3],
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Gold Valuation: ₹{goldValuation.totalValuationRupees.toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginTop: 2 }}>
                Max Allowed Loan (75% LTV): ₹{goldValuation.maxLoanAllowedRupees.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        )}

        <Button title="Apply for Loan Application" onPress={handleApply} />
      </ScrollView>
    </View>
  );
}
