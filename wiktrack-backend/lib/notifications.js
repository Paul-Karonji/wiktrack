// Backend sends push notifications to user phones via Expo's servers.

export async function sendPushNotification(pushToken, title, body, data = {}) {
  if (!pushToken) return null;

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    payload = { error: `Invalid Expo push response: ${error.message}` };
  }

  if (!response.ok) {
    throw new Error(`Expo push HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  const tickets = Array.isArray(payload?.data) ? payload.data : [payload?.data].filter(Boolean);
  const failedTicket = tickets.find((ticket) => ticket.status === 'error');
  if (failedTicket) {
    throw new Error(`Expo push rejected token: ${failedTicket.message || JSON.stringify(failedTicket)}`);
  }

  return payload;
}

export async function sendPaymentAlert(pushToken, tx) {
  const typeLabel = { till: 'Till', paybill: 'Paybill', pochi: 'Pochi', p2p: 'M-Pesa' }[tx.type];
  return sendPushNotification(
    pushToken,
    `New ${typeLabel} payment`,
    `KES ${Number(tx.amount).toLocaleString()} from ${tx.sender_name || tx.sender_phone}`,
    { type: 'payment', transactionId: tx.id }
  );
}

export async function sendDailySummary(pushToken, summary) {
  return sendPushNotification(
    pushToken,
    'WikTrack Daily Report',
    `Today - Income: KES ${summary.totalIncome.toLocaleString()}, Expenses: KES ${summary.totalExpense.toLocaleString()} (${summary.txCount} transactions)`,
    { type: 'daily_summary', date: summary.date }
  );
}
