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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const setBusiness = useBusinessStore((s) => s.setBusiness);

  const handleCreateAccount = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim() || !businessName.trim()) {
      Alert.alert('Missing info', 'Please fill in email, password, your name, and business name.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // Normalize phone if provided (optional field)
    let normalizedPhone = '';
    if (phone.trim()) {
      normalizedPhone = phone.replace(/\s/g, '');
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '+254' + normalizedPhone.slice(1);
      } else if (normalizedPhone.startsWith('254')) {
        normalizedPhone = '+' + normalizedPhone;
      } else if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = '+254' + normalizedPhone;
      }
    }

    try {
      // Sign up with email + password via Supabase
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            business_name: businessName.trim(),
            owner_phone: normalizedPhone,
          },
        },
      });

      if (authError) {
        Alert.alert('Error', authError.message);
        setLoading(false);
        return;
      }

      // Store in Zustand — business record created after email verification
      setBusiness({
        ownerName: fullName.trim(),
        ownerEmail: email.trim().toLowerCase(),
        ownerPhone: normalizedPhone,
        businessName: businessName.trim(),
      });

      navigation.navigate('VerifyEmail');
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
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.grayText}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.grayText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone number (optional)</Text>
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
          We'll send a confirmation link to your email.
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
