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
  
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayIncomeCount, setTodayIncomeCount] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [todayExpenseCount, setTodayExpenseCount] = useState(0);
  
  const [weekIncome, setWeekIncome] = useState(0);
  const [weekExpense, setWeekExpense] = useState(0);
  const [lastWeekIncome, setLastWeekIncome] = useState(0);
  const [lastWeekExpense, setLastWeekExpense] = useState(0);
  
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [lastMonthIncome, setLastMonthIncome] = useState(0);
  const [lastMonthExpense, setLastMonthExpense] = useState(0);
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [weeklyIncomeData, setWeeklyIncomeData] = useState([]);
  const [weeklyExpenseData, setWeeklyExpenseData] = useState([]);

  const applyDashboardData = useCallback((data) => {
    setTodayIncome(data.todayIncome);
    setTodayIncomeCount(data.todayIncomeCount);
    setTodayExpense(data.todayExpense);
    setTodayExpenseCount(data.todayExpenseCount);
    
    setWeekIncome(data.weekIncome);
    setWeekExpense(data.weekExpense);
    setLastWeekIncome(data.lastWeekIncome);
    setLastWeekExpense(data.lastWeekExpense);
    
    setMonthIncome(data.monthIncome);
    setMonthExpense(data.monthExpense);
    setLastMonthIncome(data.lastMonthIncome);
    setLastMonthExpense(data.lastMonthExpense);
    
    setRecentTransactions(data.recentTransactions);
    setWeeklyIncomeData(data.weeklyIncomeData);
    setWeeklyExpenseData(data.weeklyExpenseData);
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

  const weekIncomeTrend =
    lastWeekIncome > 0 ? Math.round(((weekIncome - lastWeekIncome) / lastWeekIncome) * 100) : 0;
  const weekExpenseTrend =
    lastWeekExpense > 0 ? Math.round(((weekExpense - lastWeekExpense) / lastWeekExpense) * 100) : 0;

  const monthIncomeTrend =
    lastMonthIncome > 0 ? Math.round(((monthIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0;
  const monthExpenseTrend =
    lastMonthExpense > 0 ? Math.round(((monthExpense - lastMonthExpense) / lastMonthExpense) * 100) : 0;

  return {
    loading,
    
    // Income metrics
    todayTotal: todayIncome,
    todayCount: todayIncomeCount,
    todayIncome,
    todayIncomeCount,
    weekTotal: weekIncome,
    weekTrend: weekIncomeTrend,
    weekIncome,
    weekIncomeTrend,
    monthTotal: monthIncome,
    monthTrend: monthIncomeTrend,
    monthIncome,
    monthIncomeTrend,
    
    // Expense metrics
    todayExpense,
    todayExpenseCount,
    weekExpense,
    weekExpenseTrend,
    monthExpense,
    monthExpenseTrend,
    
    recentTransactions,
    weeklyIncomeData,
    weeklyExpenseData,
    
    // Keep weeklyData as weeklyIncomeData for backward compatibility
    weeklyData: weeklyIncomeData,
    
    refresh: fetchDashboard,
  };
}

