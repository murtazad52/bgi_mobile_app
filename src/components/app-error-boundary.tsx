import React, { type ErrorInfo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing } from '@/lib/theme';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>STARTUP ERROR</Text>
            <Text style={styles.title}>The mobile app hit an error while opening.</Text>
            <Text style={styles.body}>
              This screen is shown so the app does not close silently. If you still see this
              after reinstalling the latest APK, share the message below and I will fix the next
              build from it.
            </Text>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{this.state.error.message || 'Unknown error'}</Text>
            </View>
            <Pressable onPress={this.handleRetry} style={styles.button}>
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  eyebrow: {
    color: palette.pine,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  body: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: '#FCE8E4',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  errorText: {
    color: palette.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: palette.gold,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
});
