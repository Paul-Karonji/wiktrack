import express from 'express';
import supabase from '../lib/supabase.js';
import { sendDailySummary } from '../lib/notifications.js';

const router = express.Router();

// This route will be triggered by Vercel Cron at 20:00 EAT
router.get('/daily-summary', async (req, res) => {
  // Security check: ensure the request is from Vercel Cron
  // Only check in production, allow testing in development without secret
  if (process.env.NODE_ENV === 'production') {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  console.log('[CRON] Running daily summary job from Vercel trigger...');

  try {
    const today = new Date().toISOString().slice(0, 10);
    const todayStart = `${today}T00:00:00.000Z`;

    // Get all businesses with notifications enabled
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id, owner_phone, push_token')
      .eq('notifications', true)
      .not('push_token', 'is', null);

    if (bizError) throw bizError;

    let sentCount = 0;

    for (const biz of businesses || []) {
      try {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, sender_name')
          .eq('business_id', biz.id)
          .gte('timestamp', todayStart);

        if (!transactions || transactions.length === 0) continue;

        // Find top sender
        const counts = {};
        transactions.forEach((t) => {
          if (t.sender_name) counts[t.sender_name] = (counts[t.sender_name] || 0) + 1;
        });
        const topSender = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

        const summary = {
          date: today,
          totalIncome: transactions.reduce((s, t) => s + Number(t.amount), 0),
          txCount: transactions.length,
          topSender,
        };

        await sendDailySummary(biz.push_token, summary);
        sentCount++;

        // Also update daily_summaries cache
        await supabase
          .from('daily_summaries')
          .upsert({
            business_id: biz.id,
            date: today,
            total_income: summary.totalIncome,
            tx_count: summary.txCount,
            top_sender: summary.topSender,
          }, { onConflict: 'business_id,date' });
      } catch (err) {
        console.error(`[CRON] Failed for business ${biz.id}:`, err);
      }
    }

    console.log(`[CRON] Daily summary sent to ${sentCount} businesses.`);
    res.status(200).json({ success: true, sentCount });
  } catch (error) {
    console.error('[CRON] Overall job failure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
