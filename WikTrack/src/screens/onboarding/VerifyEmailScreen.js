import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Mail, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';
import { supabase } from '../../lib/supabase';
import { useBusinessStore } from '../../store';

export default function VerifyEmailScreen({ navigation }) {
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const setBusiness = useBusinessStore((s) => s.setBusiness);
  const businessName = useBusinessStore((s) => s.businessName);
  const ownerName = useBusinessStore((s) => s.ownerName);
  const ownerPhone = useBusinessStore((s) => s.ownerPhone);

  const checkVerification = async () => {
    setChecking(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        Alert.alert('Error', error.message);
        setChecking(false);
        return;
      }

      if (session?.user?.email_confirmed_at) {
        setVerified(true);

        // Create business record now that email is verified
        const { data: biz, error: bizError } = await supabase
          .from('businesses')
          .insert({
            user_id: session.user.id,
            name: businessName,
            owner_phone: ownerPhone || '',
          })
          .select()
          .single();

        if (bizError) {
          console.error('Business creation error:', bizError);
        } else {
          setBusiness({ businessId: biz.id });
        }

        setTimeout(() => navigation.navigate('PaymentType'), 1000);
      } else {
        Alert.alert(
          'Not yet verified',
          'Please check your email inbox (and spam folder) and tap the confirmation link, then try again.'
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: session.user.email,
        });
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Sent', 'A new verification email has been sent.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not resend email.');
    }
  };

  const handleSkip = () => {
    // Allow skipping — create business without verified email
    navigation.navigate('PaymentType');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {verified ? (
            <CheckCircle2 size={64} color={colors.green} />
          ) : (
            <Mail size={64} color={colors.green} />
          )}
        </View>

        <Text style={styles.title}>
          {verified ? 'Email verified!' : 'Check your email'}
        </Text>

        <Text style={styles.body}>
          {verified
            ? 'Your account is confirmed. Let\u2019s set up your dashboard.'
            : 'We sent a confirmation link to your email. Tap the link to verify your account, then come back here.'}
        </Text>

        {!verified && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={checkVerification}
              disabled={checking}
              activeOpacity={0.8}
            >
              {checking ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>I've verified my email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleResend}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Resend email</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: 100,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.heading1,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    ...typography.bodyL,
    color: colors.grayText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.green,
    borderRadius: radius.md + 2,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    ...typography.bodyL,
    color: colors.white,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  secondaryButtonText: {
    ...typography.bodyM,
    color: colors.green,
    fontWeight: '600',
  },
  skipText: {
    ...typography.bodyS,
    color: colors.grayText,
  },
});
