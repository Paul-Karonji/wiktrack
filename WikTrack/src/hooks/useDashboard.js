import { useState, useEffect, useCallback } from 'react';
import { useBusinessStore } from '../store';
import {
  flushPendingSync,
  getLocalDashboardData,
  pullRemoteTransactionsToLocal,
} from '../lib/smsSyncService';
import { initLocalDatabase } from '../lib/localDatabase';

export function useDashboard() {
  const { businessId } = useBusinessStore();
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [lastWeekTotal, setLastWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const applyDashboardData = useCallback((data) => {
    setTodayTotal(data.todayTotal);
    setTodayCount(data.todayCount);
    setWeekTotal(data.weekTotal);
    setLastWeekTotal(data.lastWeekTotal);
    setMonthTotal(data.monthTotal);
    setLastMonthTotal(data.lastMonthTotal);
    setRecentTransactions(data.recentTransactions);
    setWeeklyData(data.weeklyData);
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    try {
      await initLocalDatabase();
      applyDashboardData(await getLocalDashboardData(businessId));
      setLoading(false);

      try {
        await flushPendingSync(businessId);
        await pullRemoteTransactionsToLocal(businessId);
        applyDashboardData(await getLocalDashboardData(businessId));
      } catch (syncErr) {
        console.error('Dashboard background sync error:', syncErr);
      }
    } catch (err) {
      console.error('Dashboard local fetch error:', err);
      setLoading(false);
    }
  }, [businessId, applyDashboardData]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const weekTrend =
    lastWeekTotal > 0 ? Math.round(((weekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;
  const monthTrend =
    lastMonthTotal > 0 ? Math.round(((monthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  return {
    loading,
    todayTotal,
    todayCount,
    weekTotal,
    weekTrend,
    monthTotal,
    monthTrend,
    recentTransactions,
    weeklyData,
    refresh: fetchDashboard,
  };
}
