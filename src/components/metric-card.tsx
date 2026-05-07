import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing } from '@/lib/theme';

type MetricTone = 'pine' | 'gold' | 'danger' | 'success' | 'neutral' | 'late' | 'kuwait';

const toneColors: Record<MetricTone, { background: string; text: string; accent: string }> = {
  pine: { background: '#E7F3EE', text: palette.pine, accent: '#8FC4AE' },
  gold: { background: '#FAF4DF', text: '#8C6710', accent: '#E9D07A' },
  danger: { background: '#FCEAE7', text: palette.danger, accent: '#E6A69B' },
  success: { background: '#E9F6EF', text: palette.success, accent: '#89C7A7' },
  neutral: { background: '#EFF3F1', text: palette.ink, accent: '#C5D2CC' },
  late: { background: '#FFF1E3', text: palette.late, accent: '#F0B06F' },
  kuwait: { background: '#EAF0FA', text: palette.kuwait, accent: '#9AB7E2' },
};

type MetricCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: MetricTone;
};

export function MetricCard({ label, value, subtitle, tone = 'neutral' }: MetricCardProps) {
  const colors = toneColors[tone];

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={[styles.accent, { backgroundColor: colors.accent }]} />
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    minWidth: 150,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  label: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
