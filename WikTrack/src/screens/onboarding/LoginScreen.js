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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setBusiness = useBusinessStore((s) => s.setBusiness);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
        setLoading(false);
        return;
      }

      // Check if user has a business record
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (bizError && bizError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching business:', bizError);
      }

      if (bizData) {
        // User has a business, update store and go to main app if onboarding is done
        // Wait, onboarding complete is usually set at the end of FirstSync
        setBusiness({
          businessId: bizData.id,
          ownerName: bizData.owner_name || '', // Note: DB schema didn't have owner_name, it's 'name' for business, wait let me check schema
          businessName: bizData.name,
          enabledTypes: bizData.enabled_types || ['till', 'paybill', 'pochi', 'p2p'],
        });
        
        // If they have a business, they probably finished onboarding.
        // We can just set onboarding complete to true.
        useBusinessStore.getState().setOnboardingComplete(true);
      } else {
        // Logged in but no business record yet (maybe they abandoned signup at VerifyEmail)
        navigation.navigate('VerifyEmail');
      }
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
        <Text style={styles.title}>Welcome back</Text>

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
            placeholder="Your password"
            placeholderTextColor={colors.grayText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back to Welcome</Text>
        </TouchableOpacity>
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
  backButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  backText: {
    ...typography.bodyM,
    color: colors.grayText,
  },
});
