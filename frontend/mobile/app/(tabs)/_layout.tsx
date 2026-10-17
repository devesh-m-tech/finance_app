import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { colors } from '@shared/theme/colors';
import { radii, spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export default function TabsLayout() {
  const { user, hasPermission } = useAuth();
  const isSalesperson = user?.role === 'SALESPERSON';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.textOnPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconPill, focused && styles.activePill]}>
              <Text style={styles.iconText}>🏠</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: isSalesperson ? 'My Customers' : 'Customers',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconPill, focused && styles.activePill]}>
              <Text style={styles.iconText}>👥</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="collect"
        options={{
          title: isSalesperson ? 'Collect Cash' : 'Collections',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconPill, focused && styles.activePill]}>
              <Text style={styles.iconText}>💵</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="receipts"
        options={{
          title: isSalesperson ? 'My Receipts' : 'Receipts',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconPill, focused && styles.activePill]}>
              <Text style={styles.iconText}>🧾</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconPill, focused && styles.activePill]}>
              <Text style={styles.iconText}>👤</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface, // White bottom tab bar
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: spacing[2],
    paddingTop: spacing[2],
    elevation: 8,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  iconPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  activePill: {
    backgroundColor: colors.primary, // Yellow active pill
  },
  iconText: {
    fontSize: 18,
  },
});
