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

import { useSession } from '@/lib/session/session-context';
import { palette, radius, spacing } from '@/lib/theme';

type LoginType = 'admin' | 'member';

export default function LoginScreen() {
  const router = useRouter();
  const { session, signIn, verifyTwoFactor, changePassword, isBooting } = useSession();

  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');

  const [awaiting2fa, setAwaiting2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Member with a pending password change: signed in but flagged.
  const needsPasswordChange = Boolean(session?.mustChangePassword);

  if (!isBooting && session && !needsPasswordChange) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  async function handleLogin() {
    if (isSubmitting) return;
    setErrorMessage('');
    setNoticeMessage('');
    setIsSubmitting(true);

    try {
      const response = await signIn({
        loginType,
        identifier: identifier.trim(),
        secret: secret.trim(),
      });

      if ('requires2fa' in response) {
        setAwaiting2fa(true);
        setNoticeMessage(response.message ?? 'Enter the 6-digit code from your authenticator app.');
      } else if (!response.user.mustChangePassword) {
        router.replace('/(tabs)/dashboard');
      }
      // mustChangePassword: session now holds the flag → screen switches automatically.
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyTwoFactor() {
    if (isSubmitting) return;
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await verifyTwoFactor(twoFactorCode.trim());
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not verify the code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePassword() {
    if (isSubmitting) return;
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await changePassword(newPassword, confirmPassword);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update your password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetToLogin() {
    setAwaiting2fa(false);
    setTwoFactorCode('');
    setErrorMessage('');
    setNoticeMessage('');
  }

  const isMember = loginType === 'member';

  // ── Forced password change (first login / admin reset / OTP reset) ──────────
  if (needsPasswordChange) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>SECURITY</Text>
            <Text style={styles.title}>Set a New Password</Text>
            <Text style={styles.subtitle}>
              For your security, please set a new password before continuing.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter a new password"
                placeholderTextColor={palette.muted}
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter the new password"
                placeholderTextColor={palette.muted}
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <Text style={styles.helper}>
              At least 8 characters, including a letter and a number.
            </Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable onPress={handleChangePassword} style={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={palette.surface} />
              ) : (
                <Text style={styles.submitText}>Update Password</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Two-factor verification (admin accounts with 2FA enabled) ───────────────
  if (awaiting2fa) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>TWO-FACTOR AUTH</Text>
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code from your authenticator app to finish signing in.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Authentication Code</Text>
              <TextInput
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                placeholder="000000"
                placeholderTextColor={palette.muted}
                keyboardType="number-pad"
                maxLength={6}
                style={[styles.input, styles.codeInput]}
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable onPress={handleVerifyTwoFactor} style={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={palette.surface} />
              ) : (
                <Text style={styles.submitText}>Verify &amp; Sign In</Text>
              )}
            </Pressable>

            <Pressable onPress={resetToLogin} style={styles.linkButton}>
              <Text style={styles.linkText}>&larr; Back to sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Normal credentials login ────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboard}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>ATTENDANCE SYSTEM</Text>
          <Text style={styles.title}>Idara-Mohalla Attendance</Text>
          <Text style={styles.subtitle}>
            Sign in to record and track attendance across events in your assigned Idara and Mohalla scope.
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
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={secret}
              onChangeText={setSecret}
              placeholder={
                isMember ? 'First time? Enter your registered phone number' : 'Enter password'
              }
              placeholderTextColor={palette.muted}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <Text style={styles.helper}>
            {isMember
              ? 'Members sign in with their ITS ID and password. On first login, use your registered phone number, then set a new password.'
              : 'Admins keep the same roles, Idara, and Mohalla access already assigned in the PHP app.'}
          </Text>

          {noticeMessage ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{noticeMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleLogin} style={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={palette.surface} />
            ) : (
              <Text style={styles.submitText}>Sign In</Text>
            )}
          </Pressable>

          {isMember ? (
            <Text style={styles.forgotHint}>
              Forgot your password? Reset it from the web portal at badriattendance.duckdns.org.
            </Text>
          ) : null}
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
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
  },
  helper: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  forgotHint: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
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
  noticeBox: {
    backgroundColor: '#FFF4DC',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeText: {
    color: '#7A5B12',
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
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: palette.pine,
    fontSize: 14,
    fontWeight: '700',
  },
});
