import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

export default function OnboardingIntro({ navigation }: any) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, backgroundColor: theme.colors.bg },
    title: { ...typography.h1, color: theme.colors.text, marginBottom: spacing.xxl },
    body: { color: theme.colors.text + 'CC', ...typography.body, textAlign: 'center', marginBottom: spacing.xxl },
    btn: { minWidth: 160 },
  });
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Welcome to Ech0Void</Text>
      <Text style={styles.body}>
        Ech0Void is a modern ITC toolkit for exploring anomalous audio, spirit communication, and creative consciousness. Record, analyze, and share your sessions with a beautiful, intuitive interface.
      </Text>
      <EVoidButton label="How to Use" onPress={() => navigation?.navigate?.('OnboardingHowTo')} style={styles.btn} />
    </View>
  );
}
