import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function EmptyState({ heading, body, ctaText, onCtaPress, icon }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || <Inbox size={48} color={colors.border} />}
      </View>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.body}>{body}</Text>
      {ctaText && onCtaPress && (
        <TouchableOpacity style={styles.cta} onPress={onCtaPress} activeOpacity={0.8}>
          <Text style={styles.ctaText}>{ctaText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.heading3,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyM,
    color: colors.grayText,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cta: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.green,
    borderRadius: 14,
  },
  ctaText: {
    ...typography.bodyM,
    color: colors.white,
    fontWeight: '600',
  },
});
