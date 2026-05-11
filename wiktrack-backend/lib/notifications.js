// Backend sends push notifications to user phones via Expo's servers
// Cost: FREE. No limits.

export async function sendPushNotification(pushToken, title, body, data = {}) {
  if (!pushToken) return;

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// Specific notification formatters
export async function sendPaymentAlert(pushToken, tx) {
  const typeLabel = { till: 'Till', paybill: 'Paybill', pochi: 'Pochi', p2p: 'M-Pesa' }[tx.type];
  await sendPushNotification(
    pushToken,
    `💰 New ${typeLabel} payment`,
    `KES ${Number(tx.amount).toLocaleString()} from ${tx.sender_name || tx.sender_phone}`,
    { type: 'payment', transactionId: tx.id }
  );
}

export async function sendDailySummary(pushToken, summary) {
  await sendPushNotification(
    pushToken,
    '📊 WikTrack Daily Report',
    `Today: KES ${summary.totalIncome.toLocaleString()} · ${summary.txCount} payments`,
    { type: 'daily_summary', date: summary.date }
  );
}
