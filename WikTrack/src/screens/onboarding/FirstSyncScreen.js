import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { readSmsMessages } from '../../lib/smsReader';
import { parseMpesaSMS } from '../../lib/smsParser';
import { supabase } from '../../lib/supabase';
import { useBusinessStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';
import { markFullHistorySynced, markLastSyncNow } from '../../lib/syncState';
import * as Crypto from 'expo-crypto';

export default function FirstSyncScreen({ navigation, route }) {
  const permissionGranted = route?.params?.permissionGranted ?? false;
  const { businessId, enabledTypes, completeOnboarding, setLastSync } = useBusinessStore();
  const [messageCount, setMessageCount] = useState(0);
  const [importing, setImporting] = useState(true);
  const [imported, setImported] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permissionGranted && Platform.OS === 'android') {
      runInitialSync();
    } else {
      // No permission — skip to dashboard after brief delay
      setTimeout(() => {
        finishOnboarding();
      }, 1500);
    }
  }, []);

  const runInitialSync = async () => {
    const filter = {
      box: 'inbox',
      address: 'MPESA',
      minDate: 0, // Read all history
    };

    try {
      // Register for push notifications during initial sync
      if (businessId) {
        const { registerForPushNotifications } = require('../../lib/notifications');
        registerForPushNotifications(businessId).catch(err => 
          console.error('Push registration failed:', err)
        );
      }

      const messages = await readSmsMessages(filter);
      setMessageCount(messages.length);

      const parsed = messages
        .map((sms) => parseMpesaSMS(sms.body, enabledTypes))
        .filter(Boolean);

      if (parsed.length === 0) {
        await markFullHistorySynced();
        await markLastSyncNow();
        finishOnboarding();
        return;
      }

      // Animate progress
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: Math.min(parsed.length * 50, 3000), // At least 3s for the wow moment
        useNativeDriver: false,
      }).start();

      // Process in batches of 50
      const batchSize = 50;
      let processedCount = 0;

      for (let i = 0; i < parsed.length; i += batchSize) {
        const batch = parsed.slice(i, i + batchSize);
        const transactions = await Promise.all(
          batch.map(async (tx) => ({
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
          throw error;
        }

        processedCount += batch.length;
        setImported(processedCount);
      }

      setLastSync();
      await markFullHistorySynced();
      await markLastSyncNow();
    } catch (err) {
      console.error('Initial sync error:', err);
      setErrorMessage('SMS import could not start on this build. You can continue and sync again after the Android build is updated.');
      setImporting(false);
      return;
    }

    setImporting(false);
    setTimeout(() => finishOnboarding(), 1500);
  };

  const finishOnboarding = () => {
    completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {permissionGranted ? 'Importing your M-Pesa history...' : 'Setting up WikTrack...'}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      {permissionGranted && messageCount > 0 && (
        <Text style={styles.count}>
          Found {messageCount} M-Pesa messages.
        </Text>
      )}

      {permissionGranted && imported > 0 && (
        <Text style={styles.importing}>
          Importing your income history...{'\n'}
          {imported} payments imported.
        </Text>
      )}

      {errorMessage ? (
        <>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.continueButton} onPress={finishOnboarding}>
            <Text style={styles.continueText}>Continue to dashboard</Text>
          </TouchableOpacity>
        </>
      ) : null}

      {!permissionGranted && (
        <Text style={styles.importing}>
          You can enable SMS access later in Settings.
        </Text>
      )}

      {!errorMessage && <Text style={styles.hint}>This only takes a few seconds.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.heading2,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: radius.pill,
  },
  count: {
    ...typography.bodyL,
    color: colors.navy,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  importing: {
    ...typography.bodyM,
    color: colors.grayText,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  hint: {
    ...typography.bodyS,
    color: colors.grayText,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  errorText: {
    ...typography.bodyM,
    color: colors.red,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.green,
    borderRadius: radius.md + 2,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  continueText: {
    ...typography.bodyM,
    color: colors.white,
    fontWeight: '700',
  },
});
