import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { SPACING } from '../../src/theme/spacing';
import { FONT_WEIGHTS } from '../../src/theme/typography';

type Props = { message: string; type?: 'info' | 'danger' | 'success' };
export default function EVoidToast({ message, type = 'info' }: Props) {
  const { theme } = useTheme();
  const color = type === 'danger' ? theme.colors.danger : type === 'success' ? theme.colors.accent : theme.colors.primary;
  return (
    <View style={[styles.toast, { borderColor: color }]}> 
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#222E',
    borderRadius: SPACING.sm + SPACING.xs,
    borderWidth: 2,
    padding: SPACING.md,
    alignItems: 'center',
  },
  text: { fontWeight: FONT_WEIGHTS.bold, fontSize: 15 },
});
