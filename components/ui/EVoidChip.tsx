import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type Props = { label: string; selected?: boolean; style?: ViewStyle | ViewStyle[] };
export default function EVoidChip({ label, selected, style }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
          borderColor: theme.name === 'HighContrast' ? theme.colors.text : 'transparent',
          borderWidth: theme.name === 'HighContrast' ? 2 : 0,
        },
        style,
      ]}
    >
      <Text style={[theme.typography.chip, { color: selected ? theme.colors.bg : theme.colors.text }]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, margin: 4 },
});
