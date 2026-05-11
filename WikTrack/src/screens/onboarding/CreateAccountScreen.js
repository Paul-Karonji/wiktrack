import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';
import { supabase } from '../../lib/supabase';
import { useBusinessStore } from '../../store';

export default function CreateAccountScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const setBusiness = useBusinessStore((s) => s.setBusiness);

  const handleCreateAccount = async () => {
    if (!phone.trim() || !fullName.trim() || !businessName.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/\s/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+254' + normalizedPhone.slice(1);
    } else if (normalizedPhone.startsWith('254')) {
      normalizedPhone = '+' + normalizedPhone;
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+254' + normalizedPhone;
    }

    setLoading(true);

    try {
      // Sign up with phone OTP via Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      });

      if (authError) {
        Alert.alert('Error', authError.message);
        setLoading(false);
        return;
      }

      // Store in Zustand temporarily — will create business record after OTP verification
      setBusiness({
        ownerName: fullName.trim(),
        ownerPhone: normalizedPhone,
        businessName: businessName.trim(),
      });

      // For now, skip OTP verification and create business directly
      // In production, you'd verify OTP first
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: biz, error: bizError } = await supabase
          .from('businesses')
          .insert({
            user_id: user.id,
            name: businessName.trim(),
            owner_phone: normalizedPhone,
          })
          .select()
          .single();

        if (bizError) {
          console.error('Business creation error:', bizError);
        } else {
          setBusiness({
            businessId: biz.id,
            trialStarted: biz.trial_started,
          });
        }
      }

      navigation.navigate('PaymentType');
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create your account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="0712 345 678"
            placeholderTextColor={colors.grayText}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={15}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Mary Wanjiku"
            placeholderTextColor={colors.grayText}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business name</Text>
          <TextInput
            style={styles.input}
            placeholder="Mary's Salon"
            placeholderTextColor={colors.grayText}
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateAccount}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          We will send you a verification code via SMS.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    padding: spacing.xl,
    paddingTop: 60,
  },
  title: {
    ...typography.heading1,
    color: colors.navy,
    marginBottom: spacing.xxxl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.bodyM,
    fontWeight: '500',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    ...typography.bodyL,
    color: colors.navy,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: radius.md + 2,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.bodyL,
    color: colors.white,
    fontWeight: '700',
  },
  hint: {
    ...typography.bodyS,
    color: colors.grayText,
    textAlign: 'center',
  },
});
