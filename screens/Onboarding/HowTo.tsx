import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

export default function OnboardingHowTo({ navigation }: any) {
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
      <Text style={styles.title}>How to Use Ech0Void</Text>
      <Text style={styles.body}>
        1. Begin a Live ITC session to record and mark anomalies.{"\n"}
        2. Review your sessions in the Logbook.{"\n"}
        3. Export, share, or analyze your results.{"\n"}
        4. Explore advanced features in Settings.
      </Text>
      <EVoidButton label="Privacy & Permissions" onPress={() => navigation?.navigate?.('OnboardingPrivacy')} style={styles.btn} />
    </View>
  );
}
