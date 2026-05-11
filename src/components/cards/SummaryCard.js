import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows, radius } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

export default function SummaryCard({ label, value, trend, icon }) {
  const trendDirection = trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
  const trendColor =
    trendDirection === 'up' ? colors.green : trendDirection === 'down' ? colors.red : colors.grayText;

  const TrendIcon =
    trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  const trendLabel =
    trendDirection === 'up'
      ? `\u2191 ${Math.abs(trend)}% vs last`
      : trendDirection === 'down'
        ? `\u2193 ${Math.abs(trend)}% vs last`
        : '= Same as last';

  return (
    <View style={styles.card}>
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend !== undefined && trend !== null && (
        <View style={styles.trendRow}>
          <TrendIcon size={14} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>{trendLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodyS,
    color: colors.grayText,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.heading3,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    ...typography.bodyS,
  },
});
