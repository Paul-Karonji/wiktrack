import { syncIncomingSms } from '../lib/smsSyncService';

export const SMS_RECEIVED_TASK = 'WikTrackSmsReceived';

export async function handleSmsReceivedTask(taskData) {
  try {
    await syncIncomingSms({
      address: taskData.address,
      body: taskData.body,
      date: taskData.date,
    });
  } catch (err) {
    console.error('Background SMS sync failed:', err);
  }
}
