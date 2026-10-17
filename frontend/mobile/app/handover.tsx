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
import { Button } from '../components/ui/Button';

export default function CashHandoverScreen() {
  const router = useRouter();

  // Simulated today's collection summary
  const totalCollectedCashRupees = 18500;
  const totalCollectedUpiRupees = 4200;

  // Denominations count
  const [counts, setCounts] = useState({
    note2000: '0',
    note500: '30', // 15,000
    note200: '10',  // 2,000
    note100: '12',  // 1,200
    note50: '4',    // 200
    note20: '4',    // 80
    note10: '2',    // 20
    coins: '0',
  });

  const [notes, setNotes] = useState('');

  const updateCount = (key: keyof typeof counts, value: string) => {
    setCounts((prev) => ({ ...prev, [key]: value.replace(/[^0-9]/g, '') }));
  };

  const totalSubmittedCashRupees = useMemo(() => {
    return (
      (parseInt(counts.note2000, 10) || 0) * 2000 +
      (parseInt(counts.note500, 10) || 0) * 500 +
      (parseInt(counts.note200, 10) || 0) * 200 +
      (parseInt(counts.note100, 10) || 0) * 100 +
      (parseInt(counts.note50, 10) || 0) * 50 +
      (parseInt(counts.note20, 10) || 0) * 20 +
      (parseInt(counts.note10, 10) || 0) * 10 +
      (parseInt(counts.coins, 10) || 0)
    );
  }, [counts]);

  const discrepancyRupees = totalSubmittedCashRupees - totalCollectedCashRupees;

  const handleSubmit = () => {
    Alert.alert(
      'Confirm Cash Handover',
      `Submitted Cash: ₹${totalSubmittedCashRupees.toLocaleString('en-IN')}\nExpected Cash: ₹${totalCollectedCashRupees.toLocaleString(
        'en-IN'
      )}\nDiscrepancy: ₹${discrepancyRupees}\n\nSubmit handover to Branch Manager?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Submit',
          onPress: () => {
            Alert.alert(
              'Handover Submitted',
              `Reference: HND-202610-00042\nStatus: ${
                discrepancyRupees === 0 ? 'SUBMITTED' : 'DISCREPANCY_FLAGGED'
              }\nPlease hand physical cash over to Branch Manager.`,
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
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
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Daily Cash Handover</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[4], paddingBottom: 100 }}>
        {/* Today's Expected Collection Summary Card */}
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
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            TODAY'S FIELD COLLECTION (EXPECTED)
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginVertical: 4 }}>
            ₹{totalCollectedCashRupees.toLocaleString('en-IN')}{' '}
            <Text style={{ fontSize: 14, fontWeight: 'normal', color: colors.textSecondary }}>Cash</Text>
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            + ₹{totalCollectedUpiRupees.toLocaleString('en-IN')} UPI directly settled to branch account
          </Text>
        </View>

        {/* Denomination Counter Section */}
        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing[2] }]}>
          Cash Count by Denomination
        </Text>

        {[
          { label: '₹2,000 Notes', key: 'note2000', multiplier: 2000 },
          { label: '₹500 Notes', key: 'note500', multiplier: 500 },
          { label: '₹200 Notes', key: 'note200', multiplier: 200 },
          { label: '₹100 Notes', key: 'note100', multiplier: 100 },
          { label: '₹50 Notes', key: 'note50', multiplier: 50 },
          { label: '₹20 Notes', key: 'note20', multiplier: 20 },
          { label: '₹10 Notes', key: 'note10', multiplier: 10 },
          { label: 'Coins (₹)', key: 'coins', multiplier: 1 },
        ].map((item) => {
          const count = parseInt(counts[item.key as keyof typeof counts], 10) || 0;
          const subtotal = count * item.multiplier;

          return (
            <View
              key={item.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                marginBottom: spacing[2],
              }}
            >
              <Text style={{ flex: 2, fontWeight: '600', color: colors.textPrimary }}>{item.label}</Text>
              <TextInput
                value={counts[item.key as keyof typeof counts]}
                onChangeText={(v) => updateCount(item.key as keyof typeof counts, v)}
                keyboardType="number-pad"
                placeholder="0"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing[2],
                  paddingVertical: 4,
                  textAlign: 'center',
                  fontSize: 16,
                  backgroundColor: colors.background,
                }}
              />
              <Text
                style={{
                  flex: 2,
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: subtotal > 0 ? colors.textPrimary : colors.textSecondary,
                }}
              >
                ₹{subtotal.toLocaleString('en-IN')}
              </Text>
            </View>
          );
        })}

        {/* Reconciliation Status Card */}
        <View
          style={{
            backgroundColor:
              discrepancyRupees === 0
                ? colors.primarySoftest
                : discrepancyRupees < 0
                ? '#FEE2E2'
                : '#FEF3C7',
            borderWidth: 1,
            borderColor:
              discrepancyRupees === 0
                ? colors.success
                : discrepancyRupees < 0
                ? colors.danger
                : colors.warning,
            borderRadius: radius.lg,
            padding: spacing[4],
            marginTop: spacing[3],
            marginBottom: spacing[4],
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>
              Total Counted:
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }}>
              ₹{totalSubmittedCashRupees.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing[2] }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Discrepancy:</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color:
                  discrepancyRupees === 0
                    ? colors.success
                    : discrepancyRupees < 0
                    ? colors.danger
                    : colors.warning,
              }}
            >
              {discrepancyRupees === 0
                ? '₹0 (Exact Match ✓)'
                : discrepancyRupees < 0
                ? `- ₹${Math.abs(discrepancyRupees)} (Shortage)`
                : `+ ₹${discrepancyRupees} (Excess)`}
            </Text>
          </View>
        </View>

        <Text style={[typography.label, { marginBottom: spacing[1] }]}>Notes / Remarks (Optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. ₹500 note was slightly soiled but accepted"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing[3],
            fontSize: 15,
            backgroundColor: colors.surface,
            marginBottom: spacing[4],
          }}
        />

        <Button title="Submit Cash Handover to Manager" onPress={handleSubmit} />
      </ScrollView>
    </View>
  );
}
