import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Dimensions,
  RefreshControl,
} from 'react-native';
import { Wallet, Bell, TrendingUp, Calendar } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';
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

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { ownerName, syncStatus, lastSyncAt, businessId } = useBusinessStore();
  const {
    loading, todayTotal, todayCount, weekTotal, weekTrend,
    monthTotal, monthTrend, recentTransactions, weeklyData, refresh,
  } = useDashboard();
  const { sync } = useSmsSync();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (businessId) {
      const { registerForPushNotifications } = require('../lib/notifications');
      registerForPushNotifications(businessId).catch(err => 
        console.error('Push registration failed:', err)
      );
    }
  }, [businessId]);

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

  const chartData = {
    labels: weeklyData.map((d) => d.label),
    datasets: [{
      data: weeklyData.length > 0 ? weeklyData.map((d) => d.value) : [0, 0, 0, 0, 0, 0, 0],
    }],
  };

  const handleHeroPress = () => {
    navigation.navigate('Transactions', { filterToday: true });
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

        {/* Hero Income Card */}
        {loading ? (
          <SkeletonCard height={180} />
        ) : (
          <HeroMetricCard
            title="Today's Income"
            value={formatKES(todayTotal)}
            subtitle={`${todayCount} payment${todayCount !== 1 ? 's' : ''} received today`}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncAt}
            onPress={handleHeroPress}
            onSyncPress={() => navigation.navigate('Settings')}
          />
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
                label="This Week"
                value={formatKES(weekTotal)}
                trend={weekTrend}
                icon={<TrendingUp size={18} color={colors.green} />}
              />
              <View style={{ width: spacing.md }} />
              <SummaryCard
                label="This Month"
                value={formatKES(monthTotal)}
                trend={monthTrend}
                icon={<Calendar size={18} color={colors.green} />}
              />
            </>
          )}
        </View>

        {/* 7-Day Income Trend */}
        {!loading && weeklyData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7-Day Income Trend</Text>
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
                  color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
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

        {/* Recent Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
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
              heading="No payments yet today"
              body="New M-Pesa payments will appear here automatically."
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
    marginBottom: spacing.md,
  },
  viewAll: {
    ...typography.bodyM,
    color: colors.green,
    fontWeight: '600',
    marginBottom: spacing.md,
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
