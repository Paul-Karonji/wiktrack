import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.greenDark} />

      {/* Green top section */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Wallet size={40} color={colors.white} />
        </View>
        <Text style={styles.appName}>WikTrack</Text>
      </View>

      {/* White bottom sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.headline}>
          Your M-Pesa income,{'\n'}
          <Text style={styles.headlineBold}>tracked automatically.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Know exactly how much your business made today — without doing anything.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CreateAccount')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // TODO: Navigate to login screen
          }}
        >
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.greenDark,
  },
  topSection: {
    flex: 0.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.heading1,
    color: colors.white,
  },
  bottomSheet: {
    flex: 0.45,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  headline: {
    ...typography.heading2,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  headlineBold: {
    fontWeight: '800',
  },
  subtitle: {
    ...typography.bodyL,
    color: colors.grayText,
    marginBottom: spacing.xxxl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: radius.md + 2,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonText: {
    ...typography.bodyL,
    color: colors.white,
    fontWeight: '700',
  },
  loginLink: {
    ...typography.bodyM,
    color: colors.grayText,
    textAlign: 'center',
  },
});
