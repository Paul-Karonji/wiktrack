import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react-native';
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
  withdrawal: colors.orange,
  fuliza: colors.red,
  repayment: colors.pochi,
};

const ICON_BG = {
  till: colors.tillBg,
  paybill: colors.paybillBg,
  pochi: colors.pochiBg,
  p2p: colors.p2pBg,
  withdrawal: '#FFEDD5',
  fuliza: colors.redLight,
  repayment: colors.pochiBg,
};

export default function TransactionRow({ transaction, onPress }) {
  const { amount, sender_name, type, timestamp, flow, network, custom_recipient_name } = transaction;
  
  const isOutgoing = flow === 'out';
  const IconComponent = isOutgoing ? ArrowUpRight : ArrowDownLeft;
  
  let iconColor = ICON_COLORS[type] || colors.green;
  let iconBg = ICON_BG[type] || colors.greenLight;

  if (isOutgoing) {
    iconColor = colors.red;
    iconBg = colors.redLight;
  }

  // Display mapped custom name, fallback to sender_name, then raw phone/ref or Unknown
  const displayName = custom_recipient_name || sender_name || 'Unknown';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.92}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <IconComponent size={20} color={iconColor} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.amount, isOutgoing && { color: colors.red }]} numberOfLines={1}>
            {isOutgoing ? '-' : ''}{formatKES(amount)}
          </Text>
          <Text style={styles.time}>{formatTransactionDate(timestamp)}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.badgeRow}>
            {transaction.fuliza_amount > 0 && (
              <View style={styles.fulizaBadge}>
                <Text style={styles.fulizaText}>Fuliza</Text>
              </View>
            )}
            <TypeBadge type={type} />
          </View>
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
    color: colors.navy,
    fontWeight: '500',
    flex: 1,
    marginRight: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fulizaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  fulizaText: {
    ...typography.badge,
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.red,
  },
  networkBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkText: {
    ...typography.badge,
    fontSize: 9,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});
