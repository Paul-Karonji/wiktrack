import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { useBusinessStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';
import { useSmsSync } from '../../hooks/useSmsSync';

export default function FirstSyncScreen({ navigation, route }) {
  const permissionGranted = route?.params?.permissionGranted ?? false;
  const { businessId, completeOnboarding } = useBusinessStore();
  const { sync } = useSmsSync(false);
  const [messageCount, setMessageCount] = useState(0);
  const [importing, setImporting] = useState(true);
  const [imported, setImported] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permissionGranted && Platform.OS === 'android') {
      runInitialSync();
    } else {
      setTimeout(() => {
        finishOnboarding();
      }, 1500);
    }
  }, []);

  const runInitialSync = async () => {
    try {
      if (businessId) {
        const { registerForPushNotifications } = require('../../lib/notifications');
        registerForPushNotifications(businessId).catch((err) =>
          console.error('Push registration failed:', err)
        );
      }

      const result = await sync({
        fullHistory: true,
        onProgress: ({ parsedCount, messagesRead }) => {
          setMessageCount(messagesRead);
          setImported(parsedCount);
        },
      });

      setMessageCount(result.messagesRead);
      setImported(result.parsedCount);

      if (!result.success) {
        throw new Error(result.errorMessage || 'Initial SMS sync failed.');
      }

      if (result.parsedCount === 0) {
        finishOnboarding();
        return;
      }

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: Math.min(result.parsedCount * 50, 3000),
        useNativeDriver: false,
      }).start();
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
