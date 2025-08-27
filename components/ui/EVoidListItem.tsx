import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { scaleFont } from 'src/utils/scale';

type Props = { title: string; subtitle?: string; right?: React.ReactNode; style?: ViewStyle | ViewStyle[] };
export default function EVoidListItem({ title, subtitle, right, style }: Props) {
  const { theme } = useTheme();
  const accLabel = subtitle ? `${title}, ${subtitle}` : title;
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={accLabel}
      style={[styles.item, { backgroundColor: theme.colors.surface }, style]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.colors.accent }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginVertical: 4 },
  title: { fontWeight: '700', fontSize: scaleFont(16) },
  subtitle: { fontSize: scaleFont(13), marginTop: 2 },
});
