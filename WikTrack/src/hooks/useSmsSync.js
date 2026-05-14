import { useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { readSmsMessages } from '../lib/smsReader';
import { parseMpesaSMS } from '../lib/smsParser';
import { supabase } from '../lib/supabase';
import { useBusinessStore } from '../store';
import * as Crypto from 'expo-crypto';
import {
  getLastSyncTime,
  hasFullHistorySynced,
  markFullHistorySynced,
  markLastSyncNow,
} from '../lib/syncState';

export function useSmsSync(autoSync = true) {
  const { businessId, enabledTypes, setSyncStatus, setLastSync } = useBusinessStore();

  const requestAndSync = useCallback(async (options = {}) => {
    const result = (overrides) => ({
      success: false,
      messagesRead: 0,
      parsedCount: 0,
      insertedCount: 0,
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

    // Request SMS permission
    try {
      const hasReadSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
      const granted = hasReadSms
        ? PermissionsAndroid.RESULTS.GRANTED
        : await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            {
              title: 'WikTrack needs to read your M-Pesa messages',
              message:
                'We only read messages from MPESA to track your business income. We never read personal messages.',
              buttonPositive: 'Allow',
              buttonNegative: 'Cancel',
            }
          );

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

    const filter = {
      box: 'inbox',
      address: 'MPESA', // ONLY M-Pesa messages — never reads personal SMS
      minDate: lastSync,
    };

    try {
      const messages = await readSmsMessages(filter);
      
      const parsed = messages
        .map((sms) => parseMpesaSMS(sms.body, enabledTypes))
        .filter(Boolean);

      if (parsed.length === 0) {
        if (fullHistory && messages.length > 0) {
          await markFullHistorySynced();
        }
        if (!fullHistory || messages.length > 0) {
          await markLastSyncNow();
        }
        setSyncStatus('idle');
        setLastSync();
        return {
          success: true,
          messagesRead: messages.length,
          parsedCount: 0,
          insertedCount: 0,
          fullHistory,
          stage: 'parse',
        };
      }

      const transactions = await Promise.all(
        parsed.map(async (tx) => ({
          business_id: businessId,
          type: tx.type,
          amount: tx.amount,
          sender_name: tx.senderName,
          sender_phone: tx.senderPhone,
          account_ref: tx.accountRef,
          mpesa_code: tx.mpesaCode,
          timestamp: tx.timestamp.toISOString(),
          balance: tx.balance,
          source: 'sms',
          // Hash the raw SMS for deduplication
          sms_hash: await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            tx.rawSms
          ),
        }))
      );

      const { error } = await supabase
        .from('transactions')
        .upsert(transactions, { onConflict: 'sms_hash' });

      if (error) {
        console.error('Sync error:', error);
        setSyncStatus('error');
        return result({
          messagesRead: messages.length,
          parsedCount: parsed.length,
          insertedCount: 0,
          fullHistory,
          stage: 'supabase',
          errorMessage: error.message || JSON.stringify(error),
        });
      } else {
        if (fullHistory) {
          await markFullHistorySynced();
        }
        await markLastSyncNow();
        setSyncStatus('idle');
        setLastSync();
        return {
          success: true,
          messagesRead: messages.length,
          parsedCount: parsed.length,
          insertedCount: transactions.length,
          fullHistory,
          stage: 'complete',
        };
      }
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
