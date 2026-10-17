import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../features/auth/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="design-system"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="no-access"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
