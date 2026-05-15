import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
export default function Chip({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {options.map(opt => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={({ focused }) => [
            styles.chip,
            {
              backgroundColor: value === opt ? theme.colors.accent : theme.colors.surface,
              borderColor: theme.name === 'HighContrast' ? theme.colors.text : 'transparent',
              borderWidth: theme.name === 'HighContrast' ? 2 : 0,
            },
            focused && theme.name === 'HighContrast' && { borderColor: theme.colors.accent },
          ]}
        >
          <Text style={[theme.typography.chip, { color: value === opt ? theme.colors.bg : theme.colors.text }]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, margin: 2 },
});
