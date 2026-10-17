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
import { useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors } from '@shared/theme/colors';
import { spacing, radii } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import { getLanguage, setLanguage, SupportedLanguage } from '@shared/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, permissions, restrictions, logout } = useAuth();
  const [lang, setLang] = useState<SupportedLanguage>(getLanguage());

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setLang(newLang);
    Alert.alert('Language Updated', newLang === 'ta' ? 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது' : 'English language selected');
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Profile & Settings" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Badge Card */}
        <Card variant="hero" style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userRole}>Role: {user?.role}</Text>
          <Badge
            label={user?.branch?.name || 'Main Branch - Coimbatore'}
            variant="primary"
            style={{ marginTop: spacing[2] }}
          />
        </Card>

        {/* Security & Restrictions Status */}
        <Text style={styles.sectionTitle}>SECURITY & PERMISSIONS</Text>
        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active Permissions:</Text>
            <Text style={styles.infoValue}>{permissions.length} actions granted</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permissions Version:</Text>
            <Text style={styles.infoValue}>v{user?.permissionsVersion || 1}</Text>
          </View>
          {restrictions?.presetName ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Active Restriction Preset:</Text>
              <Badge label={restrictions.presetName} variant="danger" />
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Restrictions Status:</Text>
              <Badge label="Unrestricted" variant="success" />
            </View>
          )}
        </Card>

        {/* Language Selector */}
        <Text style={styles.sectionTitle}>LANGUAGE / மொழி</Text>
        <Card>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langBtn, lang === 'ta' && styles.langBtnActive]}
              onPress={() => handleLanguageChange('ta')}
            >
              <Text style={[styles.langText, lang === 'ta' && styles.langTextActive]}>
                தமிழ் (Tamil)
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Design System & Playground */}
        <Text style={styles.sectionTitle}>DEVELOPER TOOLS</Text>
        <Card>
          <Button
            title="🎨 Open Design System & Motion Tokens"
            variant="secondary"
            onPress={() => router.push('/design-system')}
          />
        </Card>

        {/* Logout */}
        <Button
          title="Sign Out"
          variant="destructive"
          onPress={handleLogout}
          style={{ marginTop: spacing[6] }}
        />
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
    paddingBottom: spacing[12],
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  langBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  langText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.textOnPrimary,
  },
});
