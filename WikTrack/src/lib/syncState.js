import AsyncStorage from '@react-native-async-storage/async-storage';

export const LAST_SYNC_KEY = '@wiktrack_last_sync';
export const FULL_HISTORY_SYNC_KEY = '@wiktrack_full_history_synced';

export async function hasFullHistorySynced() {
  return (await AsyncStorage.getItem(FULL_HISTORY_SYNC_KEY)) === 'true';
}

export async function markFullHistorySynced() {
  await AsyncStorage.setItem(FULL_HISTORY_SYNC_KEY, 'true');
}

export async function getLastSyncTime() {
  return parseInt((await AsyncStorage.getItem(LAST_SYNC_KEY)) || '0', 10);
}

export async function markLastSyncNow() {
  await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
}
