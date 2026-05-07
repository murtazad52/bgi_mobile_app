import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { mobileConfig } from '@/lib/config';
import { useSession } from '@/lib/session/session-context';
import { palette, radius, spacing } from '@/lib/theme';

type LoginType = 'admin' | 'member';

export default function LoginScreen() {
  const router = useRouter();
  const { session, signIn, isBooting } = useSession();
  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isBooting && session) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signIn({
        loginType,
        identifier: identifier.trim(),
        secret: secret.trim(),
      });
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isMember = loginType === 'member';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboard}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>EXPO + TYPESCRIPT</Text>
          <Text style={styles.title}>Idara-Mohalla Attendance</Text>
          <Text style={styles.subtitle}>
            This mobile app connects to your existing PHP system and uses the current network
            server at {mobileConfig.networkHost}.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.segmentRow}>
            <Pressable
              onPress={() => setLoginType('admin')}
              style={[styles.segment, loginType === 'admin' && styles.segmentActive]}>
              <Text style={[styles.segmentText, loginType === 'admin' && styles.segmentTextActive]}>
                Admin
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLoginType('member')}
              style={[styles.segment, loginType === 'member' && styles.segmentActive]}>
              <Text style={[styles.segmentText, loginType === 'member' && styles.segmentTextActive]}>
                Member
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{isMember ? 'ITS ID' : 'Username'}</Text>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={isMember ? 'Enter 8-digit ITS ID' : 'Enter admin username'}
              placeholderTextColor={palette.muted}
              keyboardType={isMember ? 'number-pad' : 'default'}
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{isMember ? 'Phone Number' : 'Password'}</Text>
            <TextInput
              value={secret}
              onChangeText={setSecret}
              placeholder={isMember ? 'Enter registered phone number' : 'Enter password'}
              placeholderTextColor={palette.muted}
              secureTextEntry={!isMember}
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <Text style={styles.helper}>
            {isMember
              ? 'Members sign in using ITS ID and the saved phone number from the current system.'
              : 'Admins keep the same roles, Idara, and Mohalla access already assigned in the PHP app.'}
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleSubmit} style={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={palette.surface} />
            ) : (
              <Text style={styles.submitText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.footerNote}>
            <Text style={styles.footerLabel}>Backend URL</Text>
            <Text style={styles.footerValue}>{mobileConfig.apiBaseUrl}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
    justifyContent: 'center',
  },
  hero: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: palette.pine,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  title: {
    color: palette.surface,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  subtitle: {
    color: '#D8E4DE',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 500,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: palette.mist,
    borderRadius: radius.full,
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: palette.pine,
  },
  segmentText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: palette.surface,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#FBFCFB',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: palette.ink,
    fontSize: 16,
  },
  helper: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#FCE8E4',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: palette.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  footerNote: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  footerLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerValue: {
    color: palette.ink,
    fontSize: 13,
  },
});
