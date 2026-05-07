import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radius, spacing } from '@/lib/theme';

type ScreenShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
};

export function ScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
  refreshing = false,
  onRefresh,
  scrollViewRef,
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 12}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(spacing.lg, insets.top + spacing.sm),
            paddingBottom: Math.max(spacing.xxl, insets.bottom + spacing.xl),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
        }>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    backgroundColor: palette.pine,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: {
    color: '#D4E5DD',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    color: palette.surface,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: '#DAE9E0',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 620,
  },
  body: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
