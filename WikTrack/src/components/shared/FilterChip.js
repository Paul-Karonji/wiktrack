import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/shadows';

const COLOR_MAP = {
  green: { bg: colors.green, text: colors.white },
  purple: { bg: colors.pochiBg, text: colors.pochi },
  teal: { bg: colors.p2pBg, text: colors.p2p },
  blue: { bg: colors.paybillBg, text: colors.paybill },
  darkgreen: { bg: colors.tillBg, text: colors.till },
  gray: { bg: '#F1F5F9', text: colors.grayText },
};

export default function FilterChip({
  label,
  active,
  color = 'gray',
  onPress,
  compact = false,
  style: containerStyle,
}) {
  const activeStyle = COLOR_MAP.green;
  const inactiveStyle = COLOR_MAP[color] || COLOR_MAP.gray;
  const chipStyle = active ? activeStyle : inactiveStyle;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        compact && styles.compactChip,
        containerStyle,
        { backgroundColor: chipStyle.bg },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={4}
    >
      <Text
        style={[
          styles.label,
          compact && styles.compactLabel,
          { color: chipStyle.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactChip: {
    height: 32,
    paddingHorizontal: 14,
  },
  label: {
    ...typography.badge,
  },
  compactLabel: {
    fontSize: 11,
  },
});
