import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../features/auth/AuthContext';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export default function ReceiptsScreen() {
  const { user, hasPermission } = useAuth();
  const canCancel = hasPermission('receipts:cancel');

  const demoReceipts = [
    {
      id: 'REC-BR1-000492',
      customer: 'M. Murugan (Daily #D-104)',
      amountPaise: 50000,
      mode: 'CASH',
      date: 'Today, 10:14 AM',
      collectedBy: 'Muthuvel (Sales1)',
      status: 'ISSUED',
    },
    {
      id: 'REC-BR1-000491',
      customer: 'P. Lakshmi (Weekly #W-209)',
      amountPaise: 120000,
      mode: 'GPAY',
      date: 'Today, 09:42 AM',
      collectedBy: 'Muthuvel (Sales1)',
      status: 'ISSUED',
    },
    {
      id: 'REC-BR1-000490',
      customer: 'K. Senthil Kumar (Gold #GL-012)',
      amountPaise: 350000,
      mode: 'BANK',
      date: 'Yesterday, 04:30 PM',
      collectedBy: 'Karthik (Manager)',
      status: 'ISSUED',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Receipts Ledger"
        subtitle={user?.role === 'SALESPERSON' ? 'My Issued Receipts' : 'Branch Receipts'}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {demoReceipts.map((rec) => (
          <Card key={rec.id}>
            <View style={styles.row}>
              <View>
                <Text style={styles.recId}>{rec.id}</Text>
                <Text style={styles.recCust}>{rec.customer}</Text>
                <Text style={styles.recMeta}>
                  {rec.date} • By: {rec.collectedBy}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.recAmount}>₹{rec.amountPaise / 100}.00</Text>
                <Badge label={rec.mode} variant="primary" />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Button
                title="🖨️ Thermal Print"
                size="sm"
                variant="secondary"
                onPress={() => Alert.alert('Printing', `Printing ${rec.id} to Bluetooth printer...`)}
                style={{ flex: 1 }}
              />
              <Button
                title="📲 WhatsApp"
                size="sm"
                variant="outline"
                onPress={() => Alert.alert('Share', `Sharing ${rec.id} via WhatsApp...`)}
                style={{ flex: 1 }}
              />
              {canCancel && (
                <Button
                  title="Cancel"
                  size="sm"
                  variant="destructive"
                  onPress={() => Alert.alert('Cancel Receipt', 'Cancellation requires Super Admin credit-note authorization.')}
                />
              )}
            </View>
          </Card>
        ))}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  recId: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  recCust: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  recMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
  },
});
