import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatRelativeTime } from '../../lib/formatDate';

const STATUS_CONFIG = {
  active: { dotColor: colors.syncGreen, getText: (d) => formatRelativeTime(d) },
  idle: { dotColor: colors.syncGray, getText: () => 'Up to date' },
  syncing: { dotColor: colors.amber, getText: () => 'Syncing...' },
  error: { dotColor: colors.red, getText: () => 'SMS access needed \u2014 tap to fix' },
  offline: { dotColor: colors.syncGray, getText: () => 'No internet \u2014 data saved on phone' },
};

export default function SyncStatusIndicator({ status = 'idle', lastSyncedAt, onPress, light = false }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'syncing') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  // Determine effective status
  let effectiveStatus = status;
  if (status === 'idle' && lastSyncedAt) {
    const diffMins = (Date.now() - new Date(lastSyncedAt).getTime()) / 60000;
    if (diffMins < 30) effectiveStatus = 'active';
  }

  const config = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.idle;
  const textColor = light ? 'rgba(255,255,255,0.7)' : colors.grayText;

  const content = (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dot, { backgroundColor: config.dotColor, opacity: pulseAnim }]}
      />
      <Text style={[styles.text, { color: textColor }]}>{config.getText(lastSyncedAt)}</Text>
    </View>
  );

  if (onPress && (effectiveStatus === 'error' || effectiveStatus === 'offline')) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    ...typography.bodyS,
  },
});
