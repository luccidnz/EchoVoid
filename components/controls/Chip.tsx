import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, Theme } from '../../theme';
export default function Chip({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.row}>
      {options.map(opt => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={[styles.chip, { backgroundColor: value === opt ? theme.colors.accent : theme.colors.surface }]}
        >
          <Text style={[styles.text, { color: value === opt ? theme.colors.bg : theme.colors.text }]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 8, marginVertical: 8 },
    chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, margin: 2 },
    text: { ...theme.typography.caption, fontWeight: '600', fontSize: 14 },
  });
}
