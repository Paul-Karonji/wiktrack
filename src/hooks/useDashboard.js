import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useBusinessStore } from '../store';

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

  const fetchDashboard = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Start of this week (Monday)
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      const weekStartISO = weekStart.toISOString();

      // Start of last week
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekStartISO = lastWeekStart.toISOString();

      // Start of this month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Start of last month
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      // 7 days ago for chart
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Fetch all in parallel
      const [todayRes, weekRes, lastWeekRes, monthRes, lastMonthRes, recentRes, chartRes] =
        await Promise.all([
          // Today's transactions
          supabase
            .from('transactions')
            .select('amount')
            .eq('business_id', businessId)
            .gte('timestamp', todayStart),

          // This week
          supabase
            .from('transactions')
            .select('amount')
            .eq('business_id', businessId)
            .gte('timestamp', weekStartISO),

          // Last week
          supabase
            .from('transactions')
            .select('amount')
            .eq('business_id', businessId)
            .gte('timestamp', lastWeekStartISO)
            .lt('timestamp', weekStartISO),

          // This month
          supabase
            .from('transactions')
            .select('amount')
            .eq('business_id', businessId)
            .gte('timestamp', monthStart),

          // Last month
          supabase
            .from('transactions')
            .select('amount')
            .eq('business_id', businessId)
            .gte('timestamp', lastMonthStart)
            .lte('timestamp', lastMonthEnd),

          // Recent 5 transactions
          supabase
            .from('transactions')
            .select('*')
            .eq('business_id', businessId)
            .order('timestamp', { ascending: false })
            .limit(5),

          // 7-day chart data
          supabase
            .from('transactions')
            .select('amount, timestamp')
            .eq('business_id', businessId)
            .gte('timestamp', sevenDaysAgoISO)
            .order('timestamp', { ascending: true }),
        ]);

      // Today
      const todayData = todayRes.data || [];
      setTodayTotal(todayData.reduce((s, t) => s + Number(t.amount), 0));
      setTodayCount(todayData.length);

      // Week
      const weekData = weekRes.data || [];
      setWeekTotal(weekData.reduce((s, t) => s + Number(t.amount), 0));
      const lwData = lastWeekRes.data || [];
      setLastWeekTotal(lwData.reduce((s, t) => s + Number(t.amount), 0));

      // Month
      const monthData = monthRes.data || [];
      setMonthTotal(monthData.reduce((s, t) => s + Number(t.amount), 0));
      const lmData = lastMonthRes.data || [];
      setLastMonthTotal(lmData.reduce((s, t) => s + Number(t.amount), 0));

      // Recent
      setRecentTransactions(recentRes.data || []);

      // Build 7-day chart data
      const chartTx = chartRes.data || [];
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dailyTotals = new Array(7).fill(0);

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(sevenDaysAgo);
        dayDate.setDate(sevenDaysAgo.getDate() + i);
        const dayStr = dayDate.toISOString().slice(0, 10);

        chartTx.forEach((tx) => {
          if (tx.timestamp.slice(0, 10) === dayStr) {
            dailyTotals[i] += Number(tx.amount);
          }
        });
      }

      setWeeklyData(
        dailyTotals.map((total, i) => ({
          label: dayLabels[(sevenDaysAgo.getDay() + i - 1 + 7) % 7] || dayLabels[i],
          value: total,
        }))
      );
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Calculate trend percentages
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
