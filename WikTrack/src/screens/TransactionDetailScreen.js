import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share,
  Modal, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Edit2, Tag } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows, radius } from '../theme/shadows';
import { formatKES, formatKESWithDecimals } from '../lib/formatCurrency';
import { formatDetailDate, formatTime } from '../lib/formatDate';
import TypeBadge from '../components/badges/TypeBadge';
import { supabase } from '../lib/supabase';
import { saveLocalRecipientMapping } from '../lib/localDatabase';
import { flushPendingSync } from '../lib/smsSyncService';

const TYPE_LABELS = {
  till: 'Till / BuyGoods',
  paybill: 'Paybill',
  pochi: 'Pochi la Biashara',
  p2p: 'Personal Transfer',
  withdrawal: 'Withdrawal',
  fuliza: 'Fuliza Overdraft',
  repayment: 'Fuliza Repayment',
};

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

const STANDARD_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transport',
  'Utilities & Bills',
  'Rent & Housing',
  'Salary & Income',
  'Business Expense',
  'Business Income',
  'Other',
];

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || 'Unknown';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `+${clean.slice(0, 3)} ${clean.slice(3, 6)} *** ***`;
  }
  return phone;
}

export default function TransactionDetailScreen({ navigation, route }) {
  const { transaction } = route.params;
  const [note, setNote] = useState(transaction.note || '');
  const [saving, setSaving] = useState(false);

  // Recipient Mapping State
  const [customName, setCustomName] = useState(transaction.custom_recipient_name || '');
  const [customCategory, setCustomCategory] = useState(transaction.custom_category || '');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editName, setEditName] = useState(transaction.custom_recipient_name || '');
  const [editCategory, setEditCategory] = useState(transaction.custom_category || '');
  const [savingMapping, setSavingMapping] = useState(false);

  const txDate = new Date(transaction.timestamp);
  const isOutgoing = transaction.flow === 'out';
  const IconComponent = isOutgoing ? ArrowUpRight : ArrowDownLeft;
  
  let iconColor = isOutgoing ? colors.red : (ICON_COLORS[transaction.type] || colors.green);
  let iconBg = isOutgoing ? colors.redLight : (ICON_BG[transaction.type] || colors.greenLight);

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

  const handleSaveMapping = async () => {
    if (!editName.trim()) {
      return;
    }
    setSavingMapping(true);
    const recipientKey = transaction.sender_phone || transaction.account_ref || transaction.sender_name || '';
    if (!recipientKey) {
      setSavingMapping(false);
      return;
    }

    try {
      await saveLocalRecipientMapping({
        businessId: transaction.business_id,
        recipient: recipientKey,
        customName: editName.trim(),
        category: editCategory || null,
      });

      setCustomName(editName.trim());
      setCustomCategory(editCategory);
      setIsModalVisible(false);

      flushPendingSync(transaction.business_id).catch((err) => {
        console.error('Background sync failed:', err);
      });
    } catch (err) {
      console.error('Failed to save mapping:', err);
    } finally {
      setSavingMapping(false);
    }
  };

  const handleClearMapping = async () => {
    setSavingMapping(true);
    const recipientKey = transaction.sender_phone || transaction.account_ref || transaction.sender_name || '';
    try {
      await saveLocalRecipientMapping({
        businessId: transaction.business_id,
        recipient: recipientKey,
        customName: null,
        category: null,
      });
      setCustomName('');
      setCustomCategory('');
      setEditName('');
      setEditCategory('');
      setIsModalVisible(false);
      flushPendingSync(transaction.business_id).catch((err) => {
        console.error('Background sync failed:', err);
      });
    } catch (err) {
      console.error('Failed to clear mapping:', err);
    } finally {
      setSavingMapping(false);
    }
  };

  const handleShare = async () => {
    const typeLabel = TYPE_LABELS[transaction.type] || transaction.type;
    const actionWord = isOutgoing ? 'sent' : 'received';
    const recipientInfo = isOutgoing 
      ? `to ${customName || transaction.sender_name || 'Unknown'}`
      : `from ${customName || transaction.sender_name || 'Unknown'}`;

    const message = [
      `Payment ${actionWord}: ${formatKES(transaction.amount)} ${recipientInfo} via ${typeLabel}`,
      `Time: ${formatTime(txDate)}, ${formatDetailDate(txDate)}`,
      transaction.mpesa_code ? `Ref Code: ${transaction.mpesa_code}` : '',
      transaction.network ? `Network: ${transaction.network.toUpperCase()}` : '',
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
    { label: isOutgoing ? 'Paid To' : 'Received From', value: transaction.sender_name || 'Unknown' },
    transaction.sender_phone && { label: 'Phone', value: maskPhone(transaction.sender_phone) },
    transaction.account_ref && { label: isOutgoing ? 'Account / Paybill' : 'Account Ref', value: transaction.account_ref },
    { label: 'Date', value: formatDetailDate(txDate) },
    { label: 'Time', value: formatTime(txDate) },
    transaction.mpesa_code && { label: 'M-Pesa Code', value: transaction.mpesa_code, mono: true },
    { label: 'Source', value: transaction.source === 'sms' ? 'SMS (auto-detected)' : 'Imported transaction' },
    transaction.balance != null && { label: 'Balance after', value: formatKES(transaction.balance) },
  ].filter(Boolean);

  const showFuliza = transaction.type === 'fuliza' || transaction.type === 'repayment' || transaction.fuliza_amount > 0 || transaction.outstanding_fuliza > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.navy} />
          <Text style={styles.backText}>Transaction Details</Text>
        </TouchableOpacity>

        {/* Top section */}
        <View style={styles.topSection}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <IconComponent size={28} color={iconColor} />
          </View>
          <Text style={[styles.amount, isOutgoing && { color: colors.red }]}>
            {isOutgoing ? '-' : ''}{formatKESWithDecimals(transaction.amount)}
          </Text>
          <View style={styles.badgeRow}>
            <TypeBadge type={transaction.type} />
          </View>
          <Text style={styles.typeLabel}>{TYPE_LABELS[transaction.type]}</Text>
        </View>

        {/* Recipient Mapping Section */}
        <View style={styles.mappingCard}>
          <View style={styles.mappingHeader}>
            <Text style={styles.mappingTitle}>Recipient Info & Category</Text>
            <TouchableOpacity 
              style={[styles.mappingEditBtn, { backgroundColor: customName ? colors.greenLight : colors.border }]} 
              onPress={() => {
                setEditName(customName || transaction.sender_name || '');
                setEditCategory(customCategory || '');
                setIsModalVisible(true);
              }}
            >
              <Edit2 size={14} color={customName ? colors.greenDark : colors.navy} />
              <Text style={[styles.mappingEditText, { color: customName ? colors.greenDark : colors.navy }]}>
                {customName ? 'Edit Mapping' : 'Assign Name'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mappingBody}>
            <View style={styles.mappingRow}>
              <Text style={styles.mappingLabel}>Custom Name</Text>
              <Text style={[styles.mappingValue, !customName && { color: colors.grayText, fontStyle: 'italic' }]}>
                {customName || 'Not assigned'}
              </Text>
            </View>
            <View style={[styles.mappingRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.sm }]}>
              <Text style={styles.mappingLabel}>Category</Text>
              {customCategory ? (
                <View style={styles.categoryChip}>
                  <Tag size={12} color={colors.white} style={{ marginRight: 4 }} />
                  <Text style={styles.categoryChipText}>{customCategory}</Text>
                </View>
              ) : (
                <Text style={[styles.mappingValue, { color: colors.grayText, fontStyle: 'italic' }]}>Uncategorized</Text>
              )}
            </View>
          </View>
        </View>

        {/* Fuliza Overdraft Details Card */}
        {showFuliza && (
          <View style={styles.fulizaCard}>
            <Text style={styles.fulizaTitle}>Fuliza Overdraft Info</Text>
            <View style={styles.fulizaBody}>
              {transaction.fuliza_amount > 0 && (
                <View style={styles.fulizaRow}>
                  <Text style={styles.fulizaLabel}>Shortfall Covered</Text>
                  <Text style={styles.fulizaValue}>{formatKES(transaction.fuliza_amount)}</Text>
                </View>
              )}
              {transaction.type === 'fuliza' && (
                <View style={[styles.fulizaRow, { borderTopWidth: 1, borderTopColor: '#FEE2E2', paddingTop: spacing.sm, marginTop: spacing.xs }]}>
                  <Text style={styles.fulizaLabel}>Access Fee Charged</Text>
                  <Text style={styles.fulizaValue}>{formatKES(transaction.amount)}</Text>
                </View>
              )}
              {transaction.outstanding_fuliza != null && (
                <View style={[styles.fulizaRow, { borderTopWidth: 1, borderTopColor: '#FEE2E2', paddingTop: spacing.sm, marginTop: spacing.xs }]}>
                  <Text style={[styles.fulizaLabel, { fontWeight: '700' }]}>Outstanding Fuliza Debt</Text>
                  <Text style={[styles.fulizaValue, { color: colors.red, fontWeight: '800' }]}>
                    {formatKES(transaction.outstanding_fuliza)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

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
          <Text style={styles.noteTitle}>Personal Notes</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Tap to add custom notes/descriptions..."
            placeholderTextColor={colors.grayText}
            value={note}
            onChangeText={setNote}
            onBlur={handleSaveNote}
            multiline
          />
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.shareText}>Share Transaction Info</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Recipient Mapping Bottom Sheet Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalDismissBg} 
            activeOpacity={1} 
            onPress={() => setIsModalVisible(false)} 
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recipient Mappings</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                Assign a custom name and category to make it easier to track transactions involving this phone number or account.
              </Text>

              {/* Recipient Identifier indicator */}
              <View style={styles.recipientIndicator}>
                <Text style={styles.indicatorLabel}>RECIPIENT VALUE:</Text>
                <Text style={styles.indicatorValue}>
                  {transaction.sender_phone || transaction.account_ref || transaction.sender_name}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Custom Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter friendly business or personal name"
                placeholderTextColor={colors.grayText}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.inputLabel}>Select Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsScroll}
              >
                {STANDARD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChipBtn,
                      editCategory === cat && styles.catChipBtnActive,
                    ]}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={[
                      styles.catChipText,
                      editCategory === cat && styles.catChipTextActive,
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                {customName ? (
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.modalBtnDanger]} 
                    onPress={handleClearMapping}
                    disabled={savingMapping}
                  >
                    {savingMapping ? (
                      <ActivityIndicator size="small" color={colors.red} />
                    ) : (
                      <Text style={[styles.modalBtnText, { color: colors.red }]}>Clear Mapping</Text>
                    )}
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalBtnPrimary, !editName.trim() && styles.modalBtnDisabled]} 
                  onPress={handleSaveMapping}
                  disabled={savingMapping || !editName.trim()}
                >
                  {savingMapping ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={[styles.modalBtnText, { color: colors.white }]}>Save & Sync</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  networkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkText: {
    ...typography.badge,
    fontWeight: 'bold',
  },
  typeLabel: {
    ...typography.bodyM,
    color: colors.grayText,
    marginTop: spacing.xs,
  },
  mappingCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  mappingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mappingTitle: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.navy,
  },
  mappingEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mappingEditText: {
    ...typography.bodyXS,
    fontWeight: '600',
  },
  mappingBody: {
    marginTop: spacing.xs,
  },
  mappingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mappingLabel: {
    ...typography.bodyM,
    color: colors.grayText,
  },
  mappingValue: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.navy,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    ...typography.bodyXS,
    color: colors.white,
    fontWeight: 'bold',
  },
  fulizaCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  fulizaTitle: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.red,
    marginBottom: spacing.sm,
  },
  fulizaBody: {
    marginTop: spacing.xs,
  },
  fulizaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  fulizaLabel: {
    ...typography.bodyM,
    color: '#7F1D1D',
  },
  fulizaValue: {
    ...typography.bodyM,
    fontWeight: '700',
    color: '#7F1D1D',
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  noteContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  noteTitle: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.xs,
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
    marginBottom: 20,
  },
  shareText: {
    ...typography.bodyL,
    color: colors.green,
    fontWeight: '600',
  },
  // Modal Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissBg: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.navy,
    marginVertical: 0,
  },
  modalCancel: {
    ...typography.bodyM,
    color: colors.grayText,
  },
  modalContent: {
    paddingBottom: 20,
  },
  modalDescription: {
    ...typography.bodyM,
    color: colors.grayText,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  recipientIndicator: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  indicatorLabel: {
    ...typography.bodyXS,
    color: colors.grayText,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  indicatorValue: {
    ...typography.bodyM,
    fontWeight: 'bold',
    color: colors.navy,
  },
  inputLabel: {
    ...typography.bodyM,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.bodyM,
    color: colors.navy,
    marginBottom: spacing.xl,
  },
  categoryChipsScroll: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  catChipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  catChipBtnActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  catChipText: {
    ...typography.bodyS,
    color: colors.navy,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  modalBtnPrimary: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  modalBtnDanger: {
    backgroundColor: colors.white,
    borderColor: colors.red,
  },
  modalBtnDisabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.7,
  },
  modalBtnText: {
    ...typography.bodyL,
    fontWeight: 'bold',
  },
});

