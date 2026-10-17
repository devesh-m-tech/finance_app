import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

import { OfflineSyncQueue } from '../../db/sync-queue';

export default function CollectScreen() {
  const [selectedCustomer, setSelectedCustomer] = useState('M. Murugan (Daily #D-104)');
  const [amountRupees, setAmountRupees] = useState('500');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'GPAY' | 'UPI'>('CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [issuedReceipt, setIssuedReceipt] = useState<any | null>(null);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  const handleCollect = async () => {
    if (!amountRupees || Number(amountRupees) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid collection amount');
      return;
    }

    const receiptNo = `RCP-BR1-${Math.floor(100000 + Math.random() * 900000)}`;

    // Queue in offline storage
    await OfflineSyncQueue.enqueue('PAYMENT', {
      customer: selectedCustomer,
      amountPaise: Math.round(parseFloat(amountRupees) * 100),
      paymentMode,
      receiptNo,
      collectedAt: new Date().toISOString(),
    });

    setIsOfflineSaved(true);
    setIssuedReceipt({
      receiptNo,
      customer: selectedCustomer,
      amount: amountRupees,
      mode: paymentMode,
      date: new Date().toLocaleTimeString(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Collect Payment" subtitle="Instant Field Collection & Thermal Receipt" />
      <ScrollView contentContainerStyle={styles.container}>
        {issuedReceipt ? (
          /* Celebratory Receipt Card */
          <Card variant="hero" style={styles.receiptCard}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.receiptHeader}>PAYMENT COLLECTED!</Text>
            <Text style={styles.receiptNo}>Receipt: {issuedReceipt.receiptNo}</Text>
            <Text style={styles.receiptAmount}>₹{issuedReceipt.amount}.00</Text>

            <View style={styles.receiptMetaRow}>
              <Text style={styles.metaLabel}>Customer:</Text>
              <Text style={styles.metaVal}>{issuedReceipt.customer}</Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.metaLabel}>Mode:</Text>
              <Text style={styles.metaVal}>{issuedReceipt.mode}</Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.metaLabel}>Time:</Text>
              <Text style={styles.metaVal}>{issuedReceipt.date}</Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.metaLabel}>Tax Note:</Text>
              <Text style={styles.metaVal}>No GST Applicable</Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.metaLabel}>Sync State:</Text>
              <Badge label="Saved to Device Queue (Auto-Syncing)" variant="success" />
            </View>

            <View style={styles.receiptActions}>
              <Button
                title="🖨️ Print 58mm Receipt"
                variant="primary"
                onPress={() => Alert.alert('Printing', `Transmitting ESC/POS payload to paired thermal printer...`)}
                style={{ flex: 1 }}
              />
              <Button
                title="📲 WhatsApp"
                variant="secondary"
                onPress={() => Alert.alert('Share', 'Sharing PDF receipt via WhatsApp...')}
                style={{ flex: 1 }}
              />
            </View>

            <Button
              title="Collect Next Installment"
              variant="outline"
              size="sm"
              onPress={() => setIssuedReceipt(null)}
              style={{ marginTop: spacing[3] }}
            />
          </Card>
        ) : (
          <>
            <Card>
              <Text style={styles.label}>Selected Borrower:</Text>
              <Text style={styles.customerName}>{selectedCustomer}</Text>
              <Text style={styles.customerDue}>Scheduled Due: ₹500.00 • Overdue Penalty: ₹0.00</Text>
            </Card>

            <Card>
              <Input
                label="Collection Amount (₹)"
                value={amountRupees}
                onChangeText={setAmountRupees}
                keyboardType="numeric"
                placeholder="Enter amount"
              />

              <Text style={styles.label}>Payment Mode:</Text>
              <View style={styles.modeRow}>
                {(['CASH', 'GPAY', 'UPI'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.modeButton,
                      paymentMode === m && styles.modeButtonActive,
                    ]}
                    onPress={() => setPaymentMode(m)}
                  >
                    <Text
                      style={[
                        styles.modeText,
                        paymentMode === m && styles.modeTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {paymentMode !== 'CASH' && (
                <Input
                  label="UPI / UTR Transaction Reference"
                  value={referenceNo}
                  onChangeText={setReferenceNo}
                  placeholder="e.g. UPI-1234567890"
                />
              )}

              <Button
                title="Confirm & Issue Receipt"
                variant="primary"
                onPress={handleCollect}
                style={{ marginTop: spacing[4] }}
              />
            </Card>
          </>
        )}
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
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  customerName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerDue: {
    fontSize: typography.fontSize.xs,
    color: colors.primaryDeep,
    marginTop: 2,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginVertical: spacing[2],
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  modeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.textOnPrimary,
  },
  receiptCard: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  checkIcon: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '800',
  },
  receiptHeader: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  receiptNo: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900',
    color: colors.textPrimary,
    marginVertical: spacing[2],
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  metaVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
    width: '100%',
  },
});
