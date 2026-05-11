import { Router } from 'express';
import supabase from '../lib/supabase.js';

const router = Router();

// GET /api/dashboard/:businessId — get dashboard summary
router.get('/:businessId', async (req, res) => {
  const { businessId } = req.params;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const { data: todayTx, error } = await supabase
      .from('transactions')
      .select('amount, type, sender_name')
      .eq('business_id', businessId)
      .gte('timestamp', todayStart);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const transactions = todayTx || [];
    const totalIncome = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const txCount = transactions.length;

    // Type breakdown
    const byType = {};
    transactions.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + Number(t.amount);
    });

    // Top sender
    const senderCounts = {};
    transactions.forEach((t) => {
      if (t.sender_name) senderCounts[t.sender_name] = (senderCounts[t.sender_name] || 0) + 1;
    });
    const topSender = Object.entries(senderCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      date: todayStart.slice(0, 10),
      totalIncome,
      txCount,
      byType,
      topSender,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
