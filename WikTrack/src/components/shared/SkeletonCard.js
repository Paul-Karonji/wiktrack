import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

export default function SkeletonCard({ height = 160, style }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeleton, { height, opacity }, style]}>
      <View style={styles.line1} />
      <View style={styles.line2} />
      <View style={styles.line3} />
    </Animated.View>
  );
}

export function SkeletonRow() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeletonRow, { opacity }]}>
      <View style={styles.circle} />
      <View style={styles.rowLines}>
        <View style={styles.rowLine1} />
        <View style={styles.rowLine2} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  line1: {
    width: '40%',
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 7,
    marginBottom: spacing.md,
  },
  line2: {
    width: '70%',
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14,
    marginBottom: spacing.md,
  },
  line3: {
    width: '55%',
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 7,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 68,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  rowLines: {
    flex: 1,
  },
  rowLine1: {
    width: '60%',
    height: 14,
    backgroundColor: colors.border,
    borderRadius: 7,
    marginBottom: 6,
  },
  rowLine2: {
    width: '40%',
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
  },
});
