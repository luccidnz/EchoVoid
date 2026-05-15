import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';

type Props = { title: string; subtitle?: string; right?: React.ReactNode; style?: ViewStyle | ViewStyle[] };
export default function EVoidListItem({ title, subtitle, right, style }: Props) {
  const { theme } = useTheme();
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
const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: SPACING.sm + SPACING.xs, marginVertical: SPACING.xs },
  title: { fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.md },
  subtitle: { fontSize: 13, marginTop: SPACING.xxs },
});
