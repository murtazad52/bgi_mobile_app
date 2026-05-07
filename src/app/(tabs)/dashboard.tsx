import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { NoticeBanner } from '@/components/notice-banner';
import { ScreenShell } from '@/components/screen-shell';
import { useSession } from '@/lib/session/session-context';
import { palette, radius, spacing } from '@/lib/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { session, signOut } = useSession();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign out right now.');
      setIsSigningOut(false);
    }
  }

  return (
    <ScreenShell
      eyebrow="DASHBOARD"
      title={`Salaam, ${session?.username ?? 'User'}`}
      subtitle="Keep it simple: open attendance, select the event, and start recording.">
      {errorMessage ? <NoticeBanner tone="error" title="Sign out failed" body={errorMessage} /> : null}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>CURRENT ACCESS</Text>
        <Text style={styles.roleText}>{session?.roleLabel ?? 'User'}</Text>
        <Text style={styles.scopeText}>{session?.scopeLabel ?? 'Current scope'}</Text>
      </View>

      {session?.canTakeAttendance ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ready for Attendance</Text>
          <Text style={styles.cardBody}>
            Open the attendance screen to choose an event and start marking ITS IDs right away.
          </Text>

          <Pressable onPress={() => router.push('/(tabs)/attendance')} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>Open Attendance</Text>
          </Pressable>
        </View>
      ) : (
        <NoticeBanner
          title="Attendance not available"
          body="This login can open the mobile app, but attendance recording is not enabled for the current role."
        />
      )}

      <Pressable onPress={handleSignOut} style={styles.secondaryAction}>
        <Text style={styles.secondaryActionText}>{isSigningOut ? 'Signing out...' : 'Log Out'}</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  roleText: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  scopeText: {
    color: palette.pine,
    fontSize: 16,
    fontWeight: '700',
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryAction: {
    marginTop: spacing.xs,
    backgroundColor: palette.gold,
    borderRadius: radius.lg,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryActionText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryAction: {
    backgroundColor: '#EFF3F1',
    borderRadius: radius.full,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
});
