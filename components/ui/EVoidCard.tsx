import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type Props = { children: React.ReactNode; style?: ViewStyle | ViewStyle[] };
export default function EVoidCard({ children, style }: Props) {
  const { theme } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.bg }, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, margin: 8, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
});
