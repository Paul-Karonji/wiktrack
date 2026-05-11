import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { useBusinessStore } from '../../store';

export default function SubscriptionCard({ onUpgrade }) {
  const { plan, getDaysLeftInTrial } = useBusinessStore();
  const daysLeft = getDaysLeftInTrial();

  let bgColor, textContent, ctaText;

  if (plan === 'starter') {
    bgColor = colors.greenLight;
    textContent = 'Starter Plan \u2014 KES 299/mo';
    ctaText = 'Manage Plan';
  } else if (plan === 'business') {
    bgColor = '#DBEAFE';
    textContent = 'Business Plan \u2014 KES 699/mo';
    ctaText = 'Manage Plan';
  } else if (daysLeft > 3) {
    bgColor = colors.background;
    textContent = `Free Trial \u2014 ${daysLeft} days remaining`;
    ctaText = 'Upgrade to Starter \u2014 KES 299/mo';
  } else if (daysLeft > 0) {
    bgColor = colors.amberLight;
    textContent = `Trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Upgrade to keep your daily reports.`;
    ctaText = 'Upgrade Now \u2014 KES 299/mo';
  } else {
    bgColor = colors.redLight;
    textContent = 'Your free trial has ended. Upgrade to continue.';
    ctaText = 'Upgrade \u2014 KES 299/mo';
  }

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{textContent}</Text>
      <TouchableOpacity style={styles.button} onPress={onUpgrade} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{ctaText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  text: {
    ...typography.bodyM,
    color: colors.navy,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodyM,
    color: colors.white,
    fontWeight: '600',
  },
});
