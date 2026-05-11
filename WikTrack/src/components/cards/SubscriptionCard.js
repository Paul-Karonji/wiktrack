import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

export default function SubscriptionCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>WikTrack is Free</Text>
      <Text style={styles.body}>
        All features are available at no cost. Track your M-Pesa income, view reports, and get daily notifications \u2014 completely free.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.greenLight,
  },
  title: {
    ...typography.heading3,
    color: colors.green,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyM,
    color: colors.navy,
    lineHeight: 22,
  },
});
