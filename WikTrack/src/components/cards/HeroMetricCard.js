import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows, radius } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import SyncStatusIndicator from '../status/SyncStatusIndicator';

export default function HeroMetricCard({
  title = "Today's Income",
  value = 'KES 0',
  subtitle = '0 payments received today',
  syncStatus = 'idle',
  lastSyncedAt,
  onPress,
  onSyncPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{title}</Text>
        <View style={styles.arrow}>
          <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>

      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.syncRow}>
        <SyncStatusIndicator
          status={syncStatus}
          lastSyncedAt={lastSyncedAt}
          onPress={onSyncPress}
          light
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.greenDark,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    minHeight: 160,
    ...shadows.hero,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodyM,
    color: 'rgba(255,255,255,0.6)',
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.displayXL,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyM,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
  },
  syncRow: {
    marginTop: spacing.xs,
  },
});
