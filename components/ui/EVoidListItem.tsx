import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Theme } from '../../theme';

type Props = { title: string; subtitle?: string; right?: React.ReactNode; style?: ViewStyle | ViewStyle[] };
export default function EVoidListItem({ title, subtitle, right, style }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.item, { backgroundColor: theme.colors.surface }, style]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.colors.accent }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginVertical: 4 },
    title: { ...theme.typography.body, fontWeight: '700' },
    subtitle: { ...theme.typography.caption, marginTop: 2 },
  });
}
