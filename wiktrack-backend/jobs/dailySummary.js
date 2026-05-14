import cron from 'node-cron';
import supabase from '../lib/supabase.js';
import { sendDailySummary } from '../lib/notifications.js';
import { getNairobiDayWindow } from '../lib/time.js';

// Runs every day at 17:00 UTC = 20:00 EAT (Kenya time)
export function startDailySummaryCron() {
  cron.schedule('0 17 * * *', async () => {
    console.log('[CRON] Running daily summary job...');

    const today = getNairobiDayWindow();

    // Get all businesses with notifications enabled
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, owner_phone, push_token')
      .eq('notifications', true)
      .not('push_token', 'is', null);

    let sentCount = 0;

    for (const biz of businesses || []) {
      try {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, sender_name')
          .eq('business_id', biz.id)
          .gte('timestamp', today.start)
          .lt('timestamp', today.end);

        if (!transactions || transactions.length === 0) continue;

        // Find top sender
        const counts = {};
        transactions.forEach((t) => {
          if (t.sender_name) counts[t.sender_name] = (counts[t.sender_name] || 0) + 1;
        });
        const topSender = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

        const summary = {
          date: today.date,
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
            date: today.date,
            total_income: summary.totalIncome,
            tx_count: summary.txCount,
            top_sender: summary.topSender,
          }, { onConflict: 'business_id,date' });
      } catch (err) {
        console.error(`[CRON] Failed for business ${biz.id}:`, err);
      }
    }

    console.log(`[CRON] Daily summary sent to ${sentCount} businesses.`);
  });

  console.log('[CRON] Daily summary cron scheduled for 17:00 UTC (20:00 EAT)');
}
