import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useSession } from '@/lib/session/session-context';
import { palette } from '@/lib/theme';

export default function TabsLayout() {
  const { session, isBooting } = useSession();

  if (!isBooting && !session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.canvas },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen
        name="attendance"
        options={{
          title: 'Attendance',
        }}
      />
    </Stack>
  );
}
