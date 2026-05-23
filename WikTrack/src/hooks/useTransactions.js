import { useState, useEffect, useCallback } from 'react';
import { useBusinessStore } from '../store';
import {
  flushPendingSync,
  pullRemoteTransactionsToLocal,
  queryLocalTransactions,
} from '../lib/smsSyncService';
import { initLocalDatabase } from '../lib/localDatabase';

export function useTransactions() {
  const { businessId } = useBusinessStore();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Custom Flow and Category / Type Filtering
  const [flow, setFlow] = useState('all'); // 'all', 'in', 'out'
  const [filter, setFilter] = useState('all'); // 'all','pochi','p2p','till','paybill','withdrawal','fuliza','repayment'
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null); // { start, end }

  // Flow aggregates
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  const fetchTransactions = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    try {
      await initLocalDatabase();
      const txList = await queryLocalTransactions({
        businessId,
        filter,
        flow,
        searchQuery,
        dateRange,
      });
      setTransactions(txList);
      setTotalCount(txList.length);
      
      const inc = txList.filter(t => t.flow === 'in').reduce((s, t) => s + Number(t.amount), 0);
      const exp = txList.filter(t => t.flow === 'out').reduce((s, t) => s + Number(t.amount), 0);
      setTotalIncome(inc);
      setTotalExpense(exp);
      setNetBalance(inc - exp);
      setTotalAmount(txList.reduce((s, t) => s + Number(t.amount), 0));
      
      setLoading(false);

      try {
        await flushPendingSync(businessId);
        await pullRemoteTransactionsToLocal(businessId);
        const refreshed = await queryLocalTransactions({
          businessId,
          filter,
          flow,
          searchQuery,
          dateRange,
        });
        setTransactions(refreshed);
        setTotalCount(refreshed.length);
        
        const rInc = refreshed.filter(t => t.flow === 'in').reduce((s, t) => s + Number(t.amount), 0);
        const rExp = refreshed.filter(t => t.flow === 'out').reduce((s, t) => s + Number(t.amount), 0);
        setTotalIncome(rInc);
        setTotalExpense(rExp);
        setNetBalance(rInc - rExp);
        setTotalAmount(refreshed.reduce((s, t) => s + Number(t.amount), 0));
      } catch (syncErr) {
        console.error('Transactions background sync error:', syncErr);
      }
    } catch (err) {
      console.error('Transactions error:', err);
      setLoading(false);
    }
  }, [businessId, filter, flow, searchQuery, dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Group transactions by date for section list
  const groupedTransactions = groupByDate(transactions);

  return {
    loading,
    transactions,
    groupedTransactions,
    totalAmount,
    totalCount,
    
    // Flow filters & aggregates
    flow,
    setFlow,
    totalIncome,
    totalExpense,
    netBalance,
    
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    refresh: fetchTransactions,
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function groupByDate(transactions) {
  const groups = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  transactions.forEach((tx) => {
    const txDate = new Date(tx.timestamp);
    const txDateStr = txDate.toDateString();

    let groupKey;
    if (txDateStr === todayStr) {
      groupKey = 'Today';
    } else if (txDateStr === yesterdayStr) {
      groupKey = 'Yesterday';
    } else if (txDate >= startOfWeek) {
      groupKey = 'This Week';
    } else {
      const yearSuffix = txDate.getFullYear() === currentYear ? '' : `, ${txDate.getFullYear()}`;
      groupKey = `${MONTHS[txDate.getMonth()]} ${txDate.getDate()}${yearSuffix}`;
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(tx);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

