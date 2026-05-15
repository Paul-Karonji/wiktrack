import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { Shield, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';

const TRUST_BULLETS = [
  'We ONLY read messages from MPESA.',
  'We NEVER read messages from contacts.',
  'We NEVER share your SMS data.',
  'You can turn this off anytime in Settings.',
];

export default function SmsPermissionScreen({ navigation }) {
  const handleAllow = async () => {
    if (Platform.OS === 'android') {
      try {
        const rationale = {
          title: 'WikTrack needs M-Pesa message access',
          message:
            'We only read messages from MPESA to track your business income and sync new payments in the background.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        };

        const readGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          rationale
        );
        const receiveGranted =
          readGranted === PermissionsAndroid.RESULTS.GRANTED
            ? await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                rationale
              )
            : readGranted;

        navigation.navigate('FirstSync', {
          permissionGranted:
            readGranted === PermissionsAndroid.RESULTS.GRANTED &&
            receiveGranted === PermissionsAndroid.RESULTS.GRANTED,
        });
      } catch (err) {
        console.error('Permission error:', err);
        navigation.navigate('FirstSync', { permissionGranted: false });
      }
    } else {
      navigation.navigate('FirstSync', { permissionGranted: false });
    }
  };

  const handleNotNow = () => {
    navigation.navigate('FirstSync', { permissionGranted: false });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>One important permission</Text>

        <View style={styles.shieldContainer}>
          <View style={styles.shieldCircle}>
            <Shield size={40} color={colors.green} />
          </View>
        </View>

        <Text style={styles.explanation}>
          <Text style={styles.bold}>WikTrack reads your M-Pesa messages</Text>
          {'\n'}to track your income automatically.
        </Text>

        <View style={styles.bullets}>
          {TRUST_BULLETS.map((bullet, index) => (
            <View key={index} style={styles.bulletRow}>
              <Check size={18} color={colors.green} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.allowButton}
          onPress={handleAllow}
          activeOpacity={0.8}
        >
          <Text style={styles.allowText}>Allow M-Pesa message access</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNotNow}>
          <Text style={styles.notNowText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.heading2,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  shieldContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  shieldCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanation: {
    ...typography.bodyL,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 26,
  },
  bold: {
    fontWeight: '700',
  },
  bullets: {
    gap: spacing.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bulletText: {
    ...typography.bodyM,
    color: colors.navy,
    flex: 1,
  },
  actions: {
    paddingBottom: spacing.xxl,
  },
  allowButton: {
    backgroundColor: colors.green,
    borderRadius: radius.md + 2,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  allowText: {
    ...typography.bodyL,
    color: colors.white,
    fontWeight: '700',
  },
  notNowText: {
    ...typography.bodyM,
    color: colors.grayText,
    textAlign: 'center',
  },
});
