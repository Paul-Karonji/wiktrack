import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share,
} from 'react-native';
import { ArrowLeft, ArrowDownLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows, radius } from '../theme/shadows';
import { formatKES, formatKESWithDecimals } from '../lib/formatCurrency';
import { formatDetailDate, formatTime } from '../lib/formatDate';
import TypeBadge from '../components/badges/TypeBadge';
import { supabase } from '../lib/supabase';

const TYPE_LABELS = {
  till: 'Till / BuyGoods',
  paybill: 'Paybill',
  pochi: 'Pochi la Biashara',
  p2p: 'Personal M-Pesa',
};

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

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || 'Unknown';
  // Format as +254 712 *** ***
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    const prefix = clean.startsWith('254') ? clean.slice(0, 6) : clean.slice(0, 4);
    return `+${clean.slice(0, 3)} ${clean.slice(3, 6)} *** ***`;
  }
  return phone;
}

export default function TransactionDetailScreen({ navigation, route }) {
  const { transaction } = route.params;
  const [note, setNote] = useState(transaction.note || '');
  const [saving, setSaving] = useState(false);

  const txDate = new Date(transaction.timestamp);
  const iconColor = ICON_COLORS[transaction.type] || colors.green;
  const iconBg = ICON_BG[transaction.type] || colors.greenLight;

  const handleSaveNote = async () => {
    if (note === (transaction.note || '')) return;
    setSaving(true);
    try {
      await supabase
        .from('transactions')
        .update({ note })
        .eq('id', transaction.id);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const typeLabel = TYPE_LABELS[transaction.type] || transaction.type;
    const message = [
      `Payment received: ${formatKES(transaction.amount)} from ${transaction.sender_name || 'Unknown'} via ${typeLabel}`,
      `Time: ${formatTime(txDate)}, ${formatDetailDate(txDate)}`,
      transaction.mpesa_code ? `M-Pesa Code: ${transaction.mpesa_code}` : '',
      '',
      'Tracked by WikTrack',
    ].filter(Boolean).join('\n');

    try {
      await Share.share({ message });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const detailRows = [
    { label: 'From', value: transaction.sender_name || 'Unknown sender' },
    { label: 'Phone', value: maskPhone(transaction.sender_phone) },
    { label: 'Date', value: formatDetailDate(txDate) },
    { label: 'Time', value: formatTime(txDate) },
    transaction.mpesa_code && { label: 'M-Pesa Code', value: transaction.mpesa_code, mono: true },
    transaction.account_ref && { label: 'Account Ref', value: transaction.account_ref },
    { label: 'Source', value: transaction.source === 'sms' ? 'SMS (auto-detected)' : 'Daraja API (real-time)' },
    transaction.balance != null && { label: 'Balance after', value: formatKES(transaction.balance) },
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.navy} />
          <Text style={styles.backText}>Payment Detail</Text>
        </TouchableOpacity>

        {/* Top section */}
        <View style={styles.topSection}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <ArrowDownLeft size={28} color={iconColor} />
          </View>
          <Text style={styles.amount}>{formatKESWithDecimals(transaction.amount)}</Text>
          <TypeBadge type={transaction.type} />
          <Text style={styles.typeLabel}>{TYPE_LABELS[transaction.type]}</Text>
        </View>

        {/* Detail Card */}
        <View style={styles.detailCard}>
          {detailRows.map((row, i) => (
            <View key={row.label} style={[styles.detailRow, i > 0 && styles.detailRowBorder]}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={[styles.detailValue, row.mono && styles.mono]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)..."
            placeholderTextColor={colors.grayText}
            value={note}
            onChangeText={setNote}
            onBlur={handleSaveNote}
            multiline
          />
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.shareText}>Share via WhatsApp</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  backText: {
    ...typography.bodyL,
    fontWeight: '600',
    color: colors.navy,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  amount: {
    ...typography.heading1,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  typeLabel: {
    ...typography.bodyM,
    color: colors.grayText,
    marginTop: spacing.sm,
  },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailLabel: {
    ...typography.bodyM,
    color: colors.grayText,
  },
  detailValue: {
    ...typography.bodyM,
    fontWeight: '500',
    color: colors.navy,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.lg,
  },
  mono: {
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  noteContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  noteInput: {
    ...typography.bodyM,
    color: colors.navy,
    minHeight: 44,
  },
  shareButton: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: radius.md + 2,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  shareText: {
    ...typography.bodyL,
    color: colors.green,
    fontWeight: '600',
  },
});
