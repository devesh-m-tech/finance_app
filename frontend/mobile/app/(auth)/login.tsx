import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [authMode, setAuthMode] = useState<'password' | 'pin'>('password');
  const [username, setUsername] = useState('sales1');
  const [password, setPassword] = useState('Sales@12345');
  const [pin, setPin] = useState('1111');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    const res = await login(
      username,
      authMode === 'password' ? password : undefined,
      authMode === 'pin' ? pin : undefined
    );

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setErrorMsg(res.error || 'Authentication failed');
    }
  };

  const fillCredentials = (
    u: string,
    p: string,
    pn: string
  ) => {
    setUsername(u);
    setPassword(p);
    setPin(pn);
    setErrorMsg(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Yellow Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>MICRO-LENDING & GOLD LOANS</Text>
          </View>
          <Text style={styles.heroTitle}>SHRI AMUDHA</Text>
          <Text style={styles.heroSubtitle}>SMALL FINANCE</Text>
          <Text style={styles.heroTagline}>Enterprise Loan Management System</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Mode Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                authMode === 'password' && styles.tabButtonActive,
              ]}
              onPress={() => setAuthMode('password')}
            >
              <Text
                style={[
                  styles.tabText,
                  authMode === 'password' && styles.tabTextActive,
                ]}
              >
                Password Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                authMode === 'pin' && styles.tabButtonActive,
              ]}
              onPress={() => setAuthMode('pin')}
            >
              <Text
                style={[
                  styles.tabText,
                  authMode === 'pin' && styles.tabTextActive,
                ]}
              >
                4-Digit PIN Login
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Input
            label="Username / Agent ID"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Enter username"
          />

          {authMode === 'password' ? (
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
            />
          ) : (
            <Input
              label="4-Digit Field PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              placeholder="e.g. 1111"
            />
          )}

          <Button
            title={isLoading ? 'Authenticating...' : 'Sign In'}
            onPress={handleLogin}
            loading={isLoading}
            style={{ marginTop: spacing[3] }}
          />

          {/* Demo User Shortcuts */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Fill Demo Roles:</Text>
            <View style={styles.demoGrid}>
              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => fillCredentials('sales1', 'Sales@12345', '1111')}
              >
                <Text style={styles.demoPillText}>Salesperson (Field)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => fillCredentials('manager1', 'Manager@12345', '1234')}
              >
                <Text style={styles.demoPillText}>Manager (Full)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => fillCredentials('manager2', 'Manager@12345', '1234')}
              >
                <Text style={styles.demoPillText}>Manager (No P&L)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => fillCredentials('admin', 'Admin@12345', '1234')}
              >
                <Text style={styles.demoPillText}>Super Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Design System Preview Link */}
          <TouchableOpacity
            style={styles.dsLink}
            onPress={() => router.push('/design-system')}
          >
            <Text style={styles.dsLinkText}>
              🎨 View Design System & Motion Tokens Playground →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    borderBottomLeftRadius: radii['2xl'],
    borderBottomRightRadius: radii['2xl'],
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  brandBadge: {
    backgroundColor: colors.primarySoftest,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radii.full,
    marginBottom: spacing[2],
  },
  brandBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '800',
    color: colors.textOnPrimary,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textOnPrimary,
    marginTop: -4,
  },
  heroTagline: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    opacity: 0.85,
    marginTop: spacing[2],
  },
  formContainer: {
    padding: spacing[6],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoftest,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: spacing[4],
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textOnPrimary,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: spacing[3],
    borderRadius: radii.xs,
    marginBottom: spacing[3],
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  demoSection: {
    marginTop: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  demoPill: {
    backgroundColor: colors.primarySoftest,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
  },
  demoPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dsLink: {
    marginTop: spacing[8],
    alignItems: 'center',
  },
  dsLinkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primaryDeep,
  },
});
