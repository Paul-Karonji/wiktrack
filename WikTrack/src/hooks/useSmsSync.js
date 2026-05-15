import { useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { useBusinessStore } from '../store';
import {
  getLastSyncTime,
  hasFullHistorySynced,
  markFullHistorySynced,
  markLastSyncNow,
} from '../lib/syncState';
import { syncSmsInbox } from '../lib/smsSyncService';

export function useSmsSync(autoSync = true) {
  const { businessId, enabledTypes, setSyncStatus, setLastSync } = useBusinessStore();

  const requestAndSync = useCallback(async (options = {}) => {
    const result = (overrides) => ({
      success: false,
      messagesRead: 0,
      parsedCount: 0,
      failedParseCount: 0,
      insertedCount: 0,
      syncedCount: 0,
      fullHistory: false,
      stage: 'unknown',
      errorMessage: '',
      ...overrides,
    });

    if (Platform.OS !== 'android') {
      return result({ stage: 'platform', errorMessage: 'SMS sync only works on Android.' });
    }
    if (!businessId) {
      return result({ stage: 'business', errorMessage: 'Business profile is missing.' });
    }

    try {
      const hasReadSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
      const hasReceiveSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
      const permissionsGranted = hasReadSms && hasReceiveSms;
      const granted = permissionsGranted
        ? PermissionsAndroid.RESULTS.GRANTED
        : await requestSmsPermissions();

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setSyncStatus('error');
        return result({
          stage: 'permission',
          errorMessage: `READ_SMS permission status: ${granted}`,
        });
      }
    } catch (err) {
      console.error('Permission request failed:', err);
      setSyncStatus('error');
      return result({
        stage: 'permission',
        errorMessage: err.message || 'Permission check failed.',
      });
    }

    setSyncStatus('syncing');

    const fullHistoryAlreadySynced = await hasFullHistorySynced();
    const fullHistory = options.fullHistory || !fullHistoryAlreadySynced;
    const lastSync = fullHistory ? 0 : await getLastSyncTime();

    try {
      const syncResult = await syncSmsInbox({
        businessId,
        enabledTypes,
        fullHistory,
        minDate: lastSync,
        onProgress: options.onProgress,
      });

      if (fullHistory) {
        await markFullHistorySynced();
      }
      await markLastSyncNow();
      setSyncStatus('idle');
      setLastSync();
      return syncResult;
    } catch (err) {
      console.error('Sync processing error:', err);
      setSyncStatus('error');
      return result({
        stage: 'read/process',
        errorMessage: err.message || 'SMS read or processing failed.',
      });
    }
  }, [businessId, enabledTypes, setSyncStatus, setLastSync]);

  useEffect(() => {
    if (autoSync && businessId) {
      requestAndSync();
    }
  }, [autoSync, businessId, requestAndSync]);

  return { sync: requestAndSync };
}

async function requestSmsPermissions() {
  const rationale = {
      title: 'WikTrack needs M-Pesa message access',
      message:
        'We only read messages from MPESA to track your business income and sync new payments in the background.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
  };

  const readStatus = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    rationale
  );

  if (readStatus !== PermissionsAndroid.RESULTS.GRANTED) {
    return readStatus;
  }

  const receiveStatus = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    rationale
  );

  return receiveStatus === PermissionsAndroid.RESULTS.GRANTED
    ? PermissionsAndroid.RESULTS.GRANTED
    : receiveStatus;
}
