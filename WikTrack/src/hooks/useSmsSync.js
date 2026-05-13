import { useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { readSmsMessages } from '../lib/smsReader';
import { parseMpesaSMS } from '../lib/smsParser';
import { supabase } from '../lib/supabase';
import { useBusinessStore } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SYNC_KEY = '@wiktrack_last_sync';

export function useSmsSync() {
  const { businessId, enabledTypes, setSyncStatus, setLastSync } = useBusinessStore();

  const requestAndSync = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    if (!businessId) return;

    // Request SMS permission
    try {
      const granted = await PermissionsAndroid.request(
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
        return;
      }
    } catch (err) {
      console.error('Permission request failed:', err);
      setSyncStatus('error');
      return;
    }

    setSyncStatus('syncing');

    const lastSync = parseInt((await AsyncStorage.getItem(SYNC_KEY)) || '0');

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
        setSyncStatus('idle');
        setLastSync();
        return;
      }

      const transactions = await Promise.all(
        parsed.map(async (tx) => ({
          business_id: businessId,
          type: tx.type,
          amount: tx.amount,
          sender_name: tx.senderName,
          sender_phone: tx.senderPhone,
          account_ref: tx.accountRef,
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
      } else {
        await AsyncStorage.setItem(SYNC_KEY, Date.now().toString());
        setSyncStatus('idle');
        setLastSync();
      }
    } catch (err) {
      console.error('Sync processing error:', err);
      setSyncStatus('error');
    }
  }, [businessId, enabledTypes, setSyncStatus, setLastSync]);

  useEffect(() => {
    if (businessId) {
      requestAndSync();
    }
  }, [businessId, requestAndSync]);

  return { sync: requestAndSync };
}
