import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export default function CustomersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const isSalesperson = user?.role === 'SALESPERSON';

  // Sample customers matching role scope
  const demoCustomers = [
    {
      id: '1',
      name: 'M. Murugan',
      mobile: '98421-XXXXX',
      maskedAadhaar: 'XXXX-XXXX-4912',
      status: 'ACTIVE',
      loanType: 'Daily Loan #D-104',
      duePaise: 50000, // ₹500
      cibilScore: 740,
    },
    {
      id: '2',
      name: 'P. Lakshmi',
      mobile: '98432-XXXXX',
      maskedAadhaar: 'XXXX-XXXX-8219',
      status: 'KYC_PENDING',
      loanType: 'Weekly Loan #W-209',
      duePaise: 120000, // ₹1,200
      cibilScore: 680,
    },
    {
      id: '3',
      name: 'K. Senthil Kumar',
      mobile: '98433-XXXXX',
      maskedAadhaar: 'XXXX-XXXX-1104',
      status: 'ACTIVE',
      loanType: 'Gold Pledge #GL-2026-0012',
      duePaise: 350000, // ₹3,500
      cibilScore: 790,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isSalesperson ? 'My Customers' : 'Customers Directory'}
        subtitle={isSalesperson ? 'Scoped: Assigned & Created by You' : 'All Branches'}
        rightAction={
          <Button
            title="+ Add"
            size="sm"
            variant="secondary"
            onPress={() => alert('Add Customer Wizard (Opening Phase 3 onboarding flow)')}
          />
        }
      />
      <View style={styles.searchContainer}>
        <Input
          label=""
          placeholder="Search customer by name, mobile, Aadhaar..."
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginVertical: 0 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {demoCustomers.map((cust) => (
          <Card key={cust.id}>
            <View style={styles.row}>
              <View>
                <Text style={styles.custName}>{cust.name}</Text>
                <Text style={styles.custMeta}>Mobile: {cust.mobile}</Text>
                <Text style={styles.custMeta}>Aadhaar: {cust.maskedAadhaar}</Text>
                <Text style={styles.loanBadge}>{cust.loanType}</Text>
              </View>

              <View style={styles.rightCol}>
                <Badge
                  label={cust.status === 'ACTIVE' ? 'Active' : 'KYC Pending'}
                  variant={cust.status === 'ACTIVE' ? 'success' : 'warning'}
                />
                {!isSalesperson && (
                  <View style={{ marginTop: spacing[1] }}>
                    <Badge label="" variant="cibil" cibilScore={cust.cibilScore} />
                  </View>
                )}
                <Text style={styles.dueText}>Due: ₹{cust.duePaise / 100}</Text>
              </View>
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
  searchContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primarySoftest,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  custName: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  custMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loanBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.primaryDeep,
    marginTop: spacing[1],
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dueText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing[1],
  },
});
