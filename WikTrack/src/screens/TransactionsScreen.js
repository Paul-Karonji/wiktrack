import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, StatusBar,
  TouchableOpacity, TextInput,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows, radius } from '../theme/shadows';
import { formatKES } from '../lib/formatCurrency';
import { useTransactions } from '../hooks/useTransactions';
import TransactionRow from '../components/lists/TransactionRow';
import FilterChip from '../components/shared/FilterChip';
import EmptyState from '../components/shared/EmptyState';
import { SkeletonRow } from '../components/shared/SkeletonCard';

const FILTERS = [
  { key: 'all', label: 'All', color: 'gray' },
  { key: 'pochi', label: 'Pochi', color: 'purple' },
  { key: 'p2p', label: 'P2P', color: 'teal' },
  { key: 'till', label: 'Till', color: 'darkgreen' },
  { key: 'paybill', label: 'Paybill', color: 'blue' },
];

export default function TransactionsScreen({ navigation, route }) {
  const [showSearch, setShowSearch] = useState(false);
  const {
    loading, groupedTransactions, totalAmount, totalCount,
    filter, setFilter, searchQuery, setSearchQuery, refresh,
  } = useTransactions();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          style={styles.searchButton}
        >
          {showSearch ? (
            <X size={22} color={colors.navy} />
          ) : (
            <Search size={22} color={colors.navy} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.grayText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, amount..."
            placeholderTextColor={colors.grayText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.grayText} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            color={f.color}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>
          {totalCount} transaction{totalCount !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summaryAmount}>{formatKES(totalAmount)} total</Text>
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : groupedTransactions.length === 0 ? (
        <EmptyState
          heading="No payments found"
          body="Try a different filter or date range."
          ctaText="Clear filters"
          onCtaPress={() => {
            setFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <SectionList
          sections={groupedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              onPress={() =>
                navigation.navigate('TransactionDetail', { transaction: item })
              }
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.heading1,
    color: colors.navy,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyM,
    color: colors.navy,
    paddingVertical: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  summaryText: {
    ...typography.bodyM,
    color: colors.grayText,
  },
  summaryAmount: {
    ...typography.bodyM,
    fontWeight: '700',
    color: colors.navy,
  },
  loadingContainer: {
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    ...typography.badge,
    color: colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 100,
  },
});
