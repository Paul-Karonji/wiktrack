import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Dimensions,
  RefreshControl,
} from 'react-native';
import { Wallet, Bell, TrendingUp, Calendar } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { formatKES } from '../lib/formatCurrency';
import { getGreeting } from '../lib/formatDate';
import { useBusinessStore } from '../store';
import { useDashboard } from '../hooks/useDashboard';
import { useSmsSync } from '../hooks/useSmsSync';
import HeroMetricCard from '../components/cards/HeroMetricCard';
import SummaryCard from '../components/cards/SummaryCard';
import TransactionRow from '../components/lists/TransactionRow';
import EmptyState from '../components/shared/EmptyState';
import SkeletonCard, { SkeletonRow } from '../components/shared/SkeletonCard';
import SyncStatusIndicator from '../components/status/SyncStatusIndicator';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { ownerName, syncStatus, lastSyncAt, businessId } = useBusinessStore();
  const {
    loading,
    todayIncome, todayIncomeCount, todayExpense, todayExpenseCount,
    weekIncome, weekExpense, weekIncomeTrend, weekExpenseTrend,
    monthIncome, monthExpense, monthIncomeTrend, monthExpenseTrend,
    recentTransactions, weeklyIncomeData, weeklyExpenseData, refresh,
  } = useDashboard();
  const { sync } = useSmsSync();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedMetric, setSelectedMetric] = React.useState('income'); // 'income' or 'expense'


  React.useEffect(() => {
    if (businessId) {
      const { registerForPushNotifications } = require('../lib/notifications');
      registerForPushNotifications(businessId).catch(err => 
        console.error('Push registration failed:', err)
      );
    }
  }, [businessId]);

  useFocusEffect(
    React.useCallback(() => {
      if (businessId) {
        refresh();
      }
    }, [businessId, refresh])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await sync(); // Trigger SMS Sync
      await refresh(); // Refresh Dashboard Data
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [sync, refresh]);

  const firstName = ownerName ? ownerName.split(' ')[0] : '';

  const activeWeeklyData = selectedMetric === 'income' ? weeklyIncomeData : weeklyExpenseData;

  const chartData = {
    labels: activeWeeklyData.map((d) => d.label),
    datasets: [{
      data: activeWeeklyData.length > 0 ? activeWeeklyData.map((d) => d.value) : [0, 0, 0, 0, 0, 0, 0],
    }],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Wallet size={18} color={colors.green} />
            </View>
            <Text style={styles.greeting}>
              {getGreeting()}, {firstName}
            </Text>
          </View>
          <TouchableOpacity style={styles.bellContainer}>
            <Bell size={22} color={colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Hero Cards Row */}
        {loading ? (
          <SkeletonCard height={180} />
        ) : (
          <View>
            <View style={styles.heroRow}>
              <TouchableOpacity
                style={[styles.heroCard, { backgroundColor: colors.greenDark }]}
                onPress={() => navigation.navigate('Transactions', { filterToday: true, flow: 'in' })}
                activeOpacity={0.92}
              >
                <View style={styles.heroHeader}>
                  <Text style={styles.heroLabel}>TODAY'S INCOME</Text>
                  <View style={styles.heroArrow}>
                    <Wallet size={15} color="rgba(255,255,255,0.8)" />
                  </View>
                </View>
                <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
                  {formatKES(todayIncome)}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {todayIncomeCount} payment{todayIncomeCount !== 1 ? 's' : ''} received
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroCard, { backgroundColor: '#B91C1C' }]}
                onPress={() => navigation.navigate('Transactions', { filterToday: true, flow: 'out' })}
                activeOpacity={0.92}
              >
                <View style={styles.heroHeader}>
                  <Text style={styles.heroLabel}>TODAY'S EXPENSES</Text>
                  <View style={styles.heroArrow}>
                    <TrendingUp size={15} color="rgba(255,255,255,0.8)" />
                  </View>
                </View>
                <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
                  {formatKES(todayExpense)}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {todayExpenseCount} expense{todayExpenseCount !== 1 ? 's' : ''} sent
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.syncStrip}>
              <SyncStatusIndicator
                status={syncStatus}
                lastSyncedAt={lastSyncAt}
                onPress={() => navigation.navigate('Settings')}
              />
            </View>
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {loading ? (
            <>
              <SkeletonCard height={100} style={{ flex: 1, marginRight: spacing.md }} />
              <SkeletonCard height={100} style={{ flex: 1 }} />
            </>
          ) : (
            <>
              <SummaryCard
                label={`Week (${selectedMetric === 'income' ? 'Income' : 'Expenses'})`}
                value={formatKES(selectedMetric === 'income' ? weekIncome : weekExpense)}
                trend={selectedMetric === 'income' ? weekIncomeTrend : weekExpenseTrend}
                icon={<TrendingUp size={18} color={selectedMetric === 'income' ? colors.green : colors.red} />}
              />
              <View style={{ width: spacing.md }} />
              <SummaryCard
                label={`Month (${selectedMetric === 'income' ? 'Income' : 'Expenses'})`}
                value={formatKES(selectedMetric === 'income' ? monthIncome : monthExpense)}
                trend={selectedMetric === 'income' ? monthIncomeTrend : monthExpenseTrend}
                icon={<Calendar size={18} color={selectedMetric === 'income' ? colors.green : colors.red} />}
              />
            </>
          )}
        </View>

        {/* Weekly Trend with Dynamic Toggle */}
        {!loading && activeWeeklyData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Weekly Trend</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    selectedMetric === 'income' && styles.toggleButtonActiveIncome,
                  ]}
                  onPress={() => setSelectedMetric('income')}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      selectedMetric === 'income' && styles.toggleButtonTextActive,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    selectedMetric === 'expense' && styles.toggleButtonActiveExpense,
                  ]}
                  onPress={() => setSelectedMetric('expense')}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      selectedMetric === 'expense' && styles.toggleButtonTextActive,
                    ]}
                  >
                    Expenses
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <BarChart
                data={chartData}
                width={screenWidth - spacing.xl * 2 - 8}
                height={180}
                yAxisLabel="KES "
                yAxisSuffix=""
                fromZero
                showValuesOnTopOfBars={false}
                withInnerLines
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) =>
                    selectedMetric === 'income'
                      ? `rgba(22, 163, 74, ${opacity})`
                      : `rgba(220, 38, 38, ${opacity})`,
                  labelColor: () => colors.grayText,
                  barPercentage: 0.6,
                  propsForBackgroundLines: {
                    strokeDasharray: '4 4',
                    stroke: colors.border,
                  },
                }}
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : recentTransactions.length === 0 ? (
            <EmptyState
              heading="No transactions found"
              body="Synced M-Pesa transactions will appear here automatically."
              ctaText="Check sync settings"
              onCtaPress={() => navigation.navigate('Settings')}
            />
          ) : (
            recentTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onPress={() =>
                  navigation.navigate('TransactionDetail', { transaction: tx })
                }
              />
            ))
          )}
        </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    ...typography.bodyL,
    color: colors.navy,
    fontWeight: '600',
  },
  bellContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
    ...shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroLabel: {
    ...typography.bodyXS,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  heroArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroValue: {
    ...typography.heading2,
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: spacing.xs,
  },
  heroSubtitle: {
    ...typography.bodyXS,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
  },
  syncStrip: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.navy,
    marginVertical: 0,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActiveIncome: {
    backgroundColor: colors.green,
  },
  toggleButtonActiveExpense: {
    backgroundColor: colors.red,
  },
  toggleButtonText: {
    ...typography.bodyS,
    color: colors.grayText,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: colors.white,
  },
  viewAll: {
    ...typography.bodyM,
    color: colors.green,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.sm,
    ...shadows.card,
  },
  chart: {
    borderRadius: 16,
  },
});

