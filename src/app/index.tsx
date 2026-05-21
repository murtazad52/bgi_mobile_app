import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/lib/session/session-context';
import { palette, radius, spacing } from '@/lib/theme';

export default function IndexScreen() {
  const { isBooting, session } = useSession();

  if (isBooting) {
    return (
      <View style={styles.container}>
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>MOBILE APP</Text>
          <Text style={styles.title}>Idara-Mohalla Attendance</Text>
          <Text style={styles.subtitle}>Connecting to the mobile session and loading your access.</Text>
          <ActivityIndicator color={palette.gold} size="large" />
        </View>
      </View>
    );
  }

  const canEnterApp = session && !session.mustChangePassword;
  return <Redirect href={canEnterApp ? '/(tabs)/dashboard' : '/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.xl,
    padding: spacing.xl,
    backgroundColor: palette.surface,
    gap: spacing.md,
  },
  eyebrow: {
    color: palette.pine,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
