import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

type Props = { message: string; type?: 'info' | 'danger' | 'success' };
export default function EVoidToast({ message, type = 'info' }: Props) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const color = type === 'danger' ? theme.colors.danger : type === 'success' ? theme.colors.accent : theme.colors.primary;
  const styles = StyleSheet.create({
    toast: {
      position: 'absolute',
      bottom: spacing.xxxl,
      left: spacing.xxl,
      right: spacing.xxl,
      borderRadius: spacing.md,
      borderWidth: 2,
      padding: spacing.lg,
      alignItems: 'center',
    },
    text: { ...typography.toast },
  });
  return (
    <View style={[styles.toast, { borderColor: color, backgroundColor: theme.colors.surface + 'EE' }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}
