import express from 'express';
import supabase from '../lib/supabase.js';
import { sendDailySummary } from '../lib/notifications.js';
import { getNairobiDayWindow } from '../lib/time.js';

const router = express.Router();

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function authorizeCronRequest(req, res) {
  if (!isProduction()) return true;

  if (!process.env.CRON_SECRET) {
    console.error('[CRON] CRON_SECRET is missing in production.');
    res.status(500).json({
      success: false,
      error: 'Cron is not configured: CRON_SECRET is missing.',
    });
    return false;
  }

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return false;
  }

  return true;
}

function getTopSender(transactions) {
  const counts = {};
  transactions.forEach((transaction) => {
    if (transaction.sender_name) {
      counts[transaction.sender_name] = (counts[transaction.sender_name] || 0) + 1;
    }
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

// Triggered by Vercel Cron at 17:00 UTC, which is 20:00 EAT.
router.get('/daily-summary', async (req, res) => {
  if (!authorizeCronRequest(req, res)) return;

  const dryRun = req.query.dryRun === '1' || req.query.dryRun === 'true';
  const today = getNairobiDayWindow();
  const stats = {
    success: true,
    dryRun,
    date: today.date,
    eligibleBusinesses: 0,
    noTransactionCount: 0,
    sentCount: 0,
    failedCount: 0,
    errors: [],
  };

  console.log(`[CRON] Daily summary started for ${today.date}. dryRun=${dryRun}`);

  try {
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id, owner_phone, push_token')
      .eq('notifications', true)
      .not('push_token', 'is', null);

    if (bizError) throw bizError;

    stats.eligibleBusinesses = businesses?.length || 0;

    for (const biz of businesses || []) {
      try {
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('amount, sender_name')
          .eq('business_id', biz.id)
          .gte('timestamp', today.start)
          .lt('timestamp', today.end);

        if (txError) throw txError;

        if (!transactions || transactions.length === 0) {
          stats.noTransactionCount += 1;
          continue;
        }

        const summary = {
          date: today.date,
          totalIncome: transactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
          txCount: transactions.length,
          topSender: getTopSender(transactions),
        };

        if (!dryRun) {
          await sendDailySummary(biz.push_token, summary);

          const { error: summaryError } = await supabase
            .from('daily_summaries')
            .upsert({
              business_id: biz.id,
              date: today.date,
              total_income: summary.totalIncome,
              tx_count: summary.txCount,
              top_sender: summary.topSender,
            }, { onConflict: 'business_id,date' });

          if (summaryError) throw summaryError;
        }

        stats.sentCount += 1;
      } catch (error) {
        stats.failedCount += 1;
        const message = error.message || String(error);
        stats.errors.push({ businessId: biz.id, message });
        console.error(`[CRON] Failed for business ${biz.id}:`, error);
      }
    }

    console.log('[CRON] Daily summary finished:', stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('[CRON] Overall job failure:', error);
    res.status(500).json({
      ...stats,
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
});

export default router;
