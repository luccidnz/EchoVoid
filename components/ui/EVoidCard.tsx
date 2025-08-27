import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

type Props = { children: React.ReactNode; style?: ViewStyle | ViewStyle[] };
export default function EVoidCard({ children, style }: Props) {
  const { theme } = useTheme();
  const { spacing, elevation } = useDesignSystem();
  const styles = StyleSheet.create({
    card: {
      borderRadius: spacing.lg,
      padding: spacing.lg,
      margin: spacing.sm,
      ...elevation.low,
      shadowColor: theme.colors.bg,
    },
  });
  return <View style={[styles.card, style]}>{children}</View>;
}
