import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const TYPE_CONFIG = {
  till: { label: 'Till', color: colors.till, bg: colors.tillBg, border: colors.tillBorder },
  paybill: { label: 'Paybill', color: colors.paybill, bg: colors.paybillBg, border: colors.paybillBorder },
  pochi: { label: 'Pochi', color: colors.pochi, bg: colors.pochiBg, border: colors.pochiBorder },
  p2p: { label: 'P2P', color: colors.p2p, bg: colors.p2pBg, border: colors.p2pBorder },
  withdrawal: { label: 'Withdrawal', color: colors.orange, bg: '#FFEDD5', border: '#FED7AA' },
  fuliza: { label: 'Fuliza', color: colors.red, bg: colors.redLight, border: '#FCA5A5' },
  repayment: { label: 'Fuliza Repay', color: colors.pochi, bg: colors.pochiBg, border: colors.pochiBorder },
};

export default function TypeBadge({ type }) {
  const config = TYPE_CONFIG[type] || { label: type, color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.badge,
  },
});
