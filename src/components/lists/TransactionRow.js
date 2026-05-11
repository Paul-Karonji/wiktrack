import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatKES } from '../../lib/formatCurrency';
import { formatTransactionDate } from '../../lib/formatDate';
import TypeBadge from '../badges/TypeBadge';

const ICON_COLORS = {
  till: colors.till,
  paybill: colors.paybill,
  pochi: colors.pochi,
  p2p: colors.p2p,
};

const ICON_BG = {
  till: colors.tillBg,
  paybill: colors.paybillBg,
  pochi: colors.pochiBg,
  p2p: colors.p2pBg,
};

export default function TransactionRow({ transaction, onPress }) {
  const { amount, sender_name, type, timestamp } = transaction;
  const iconColor = ICON_COLORS[type] || colors.green;
  const iconBg = ICON_BG[type] || colors.greenLight;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.92}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <ArrowDownLeft size={20} color={iconColor} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.amount} numberOfLines={1}>
            {formatKES(amount)}
          </Text>
          <Text style={styles.time}>{formatTransactionDate(timestamp)}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.name} numberOfLines={1}>
            {sender_name || 'Unknown sender'}
          </Text>
          <TypeBadge type={type} />
        </View>
      </View>

      <ChevronRight size={16} color={colors.grayText} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 68,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    ...typography.bodyL,
    fontWeight: '700',
    color: colors.navy,
  },
  time: {
    ...typography.bodyS,
    color: colors.grayText,
  },
  name: {
    ...typography.bodyM,
    color: colors.grayText,
    flex: 1,
    marginRight: spacing.sm,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});
