import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/shadows';
import { useBusinessStore } from '../../store';
import { supabase } from '../../lib/supabase';

const PAYMENT_TYPES = [
  { key: 'pochi', label: 'Pochi la Biashara', defaultOn: true },
  { key: 'p2p', label: 'Personal M-Pesa received (P2P)', defaultOn: true },
  { key: 'till', label: 'Till / BuyGoods (Lipa Na M-Pesa)', defaultOn: false },
  { key: 'paybill', label: 'Paybill', defaultOn: false },
];

export default function PaymentTypeScreen({ navigation }) {
  const { businessId, setEnabledTypes } = useBusinessStore();
  const [selected, setSelected] = useState(['pochi', 'p2p']); // Pre-selected

  const toggleType = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleContinue = async () => {
    if (!businessId) {
      Alert.alert(
        'Setup not complete',
        'Please verify your email or log in again so WikTrack can create your business profile.'
      );
      return;
    }

    setEnabledTypes(selected);

    // Save to Supabase
    const { error } = await supabase
      .from('businesses')
      .update({ enabled_types: selected })
      .eq('id', businessId);

    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }

    navigation.navigate('SmsPermission');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        What M-Pesa payments does your business receive?
      </Text>
      <Text style={styles.subtitle}>
        Select all that apply. You can change this later.
      </Text>

      <View style={styles.list}>
        {PAYMENT_TYPES.map((type) => {
          const isSelected = selected.includes(type.key);
          return (
            <TouchableOpacity
              key={type.key}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => toggleType(type.key)}
              activeOpacity={0.8}
            >
              {isSelected ? (
                <CheckCircle2 size={24} color={colors.green} />
              ) : (
                <Circle size={24} color={colors.border} />
              )}
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={selected.length === 0}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingTop: 60,
  },
  title: {
    ...typography.heading2,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyM,
    color: colors.grayText,
    marginBottom: spacing.xxxl,
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 56,
  },
  optionSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenLight + '30',
  },
  optionLabel: {
    ...typography.bodyL,
    color: colors.navy,
    flex: 1,
  },
  optionLabelSelected: {
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: radius.md + 2,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...typography.bodyL,
    color: colors.white,
    fontWeight: '700',
  },
});
