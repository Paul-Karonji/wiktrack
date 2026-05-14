import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useBusinessStore } from '../store';

export function useTransactions() {
  const { businessId } = useBusinessStore();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all','pochi','p2p','till','paybill'
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null); // { start, end }

  const fetchTransactions = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('timestamp', { ascending: false });

      // Type filter
      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      // Date range
      if (dateRange?.start) {
        query = query.gte('timestamp', dateRange.start);
      }
      if (dateRange?.end) {
        query = query.lte('timestamp', dateRange.end);
      }

      // Search
      if (searchQuery.trim()) {
        query = query.or(
          `sender_name.ilike.%${searchQuery}%,sender_phone.ilike.%${searchQuery}%,account_ref.ilike.%${searchQuery}%,mpesa_code.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Transactions fetch error:', error);
        return;
      }

      const txList = data || [];
      setTransactions(txList);
      setTotalCount(txList.length);
      setTotalAmount(txList.reduce((s, t) => s + Number(t.amount), 0));
    } catch (err) {
      console.error('Transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, filter, searchQuery, dateRange]);

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
