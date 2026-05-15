import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

type Props = { title: string; subtitle?: string; right?: React.ReactNode; style?: ViewStyle | ViewStyle[] };
export default function EVoidListItem({ title, subtitle, right, style }: Props) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderRadius: spacing.md,
      marginVertical: spacing.xs,
    },
    title: { ...typography.body, fontWeight: '700' },
    subtitle: { ...typography.caption, marginTop: spacing.xs },
  });
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
