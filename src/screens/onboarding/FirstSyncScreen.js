import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { readSmsMessages } from '../../lib/smsReader';
import { parseMpesaSMS } from '../../lib/smsParser';
import { supabase } from '../../lib/supabase';
import { useBusinessStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';
import * as Crypto from 'expo-crypto';

export default function FirstSyncScreen({ navigation, route }) {
  const permissionGranted = route?.params?.permissionGranted ?? false;
  const { businessId, enabledTypes, completeOnboarding, setLastSync } = useBusinessStore();
  const [messageCount, setMessageCount] = useState(0);
  const [importing, setImporting] = useState(true);
  const [imported, setImported] = useState(0);
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

  const runInitialSync = () => {
    const filter = {
      box: 'inbox',
      address: 'MPESA',
      minDate: 0, // Read all history
    };

    readSmsMessages(
      filter,
      (fail) => {
        console.error('SMS read failed:', fail);
        finishOnboarding();
      },
      async (count, smsList) => {
        const messages = JSON.parse(smsList);
        setMessageCount(messages.length);

        const parsed = messages
          .map((sms) => parseMpesaSMS(sms.body, enabledTypes))
          .filter(Boolean);

        if (parsed.length === 0) {
          finishOnboarding();
          return;
        }

        // Animate progress
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: Math.min(parsed.length * 50, 3000), // At least 3s for the wow moment
          useNativeDriver: false,
        }).start();

        try {
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
                timestamp: tx.timestamp.toISOString(),
                balance: tx.balance,
                source: 'sms',
                sms_hash: await Crypto.digestStringAsync(
                  Crypto.CryptoDigestAlgorithm.SHA256,
                  tx.rawSms
                ),
              }))
            );

            await supabase
              .from('transactions')
              .upsert(transactions, { onConflict: 'sms_hash' });

            processedCount += batch.length;
            setImported(processedCount);
          }

          setLastSync();
        } catch (err) {
          console.error('Initial sync error:', err);
        }

        setImporting(false);
        setTimeout(() => finishOnboarding(), 1500);
      }
    );
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

      {!permissionGranted && (
        <Text style={styles.importing}>
          You can enable SMS access later in Settings.
        </Text>
      )}

      <Text style={styles.hint}>This only takes a few seconds.</Text>
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
});
