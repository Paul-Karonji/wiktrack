import React from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function ToggleRow({ icon, title, description, value, onValueChange, destructive }) {
  const handleToggle = (newValue) => {
    if (destructive && !newValue) {
      Alert.alert(
        'Are you sure?',
        `Turning off ${title.toLowerCase()} may affect your experience.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Turn Off', style: 'destructive', onPress: () => onValueChange(false) },
        ]
      );
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <View style={styles.row}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: colors.border, true: colors.greenLight }}
        thumbColor={value ? colors.green : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyM,
    fontWeight: '500',
    color: colors.navy,
  },
  description: {
    ...typography.bodyS,
    color: colors.grayText,
    marginTop: 2,
  },
});
