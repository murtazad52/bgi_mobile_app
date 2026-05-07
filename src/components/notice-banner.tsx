import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing } from '@/lib/theme';

type NoticeTone = 'info' | 'error' | 'success';

const noticeStyles: Record<NoticeTone, { background: string; text: string }> = {
  info: { background: '#EAF0FA', text: palette.kuwait },
  error: { background: '#FCE8E4', text: palette.danger },
  success: { background: '#E7F5EC', text: palette.success },
};

type NoticeBannerProps = {
  title: string;
  body?: string;
  tone?: NoticeTone;
};

export function NoticeBanner({ title, body, tone = 'info' }: NoticeBannerProps) {
  const colors = noticeStyles[tone];

  return (
    <View style={[styles.banner, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  body: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 20,
  },
});
