import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { useTheme } from '../../theme';

export default function OnboardingHowTo({ navigation }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>How to Use Ech0Void</Text>
      <Text style={[styles.body, { color: theme.colors.text, opacity: 0.8 }]}>
        1. Begin a Live ITC session to record and mark anomalies.\n
        2. Review your sessions in the Logbook.\n
        3. Export, share, or analyze your results.\n
        4. Explore advanced features in Settings.
      </Text>
      <EVoidButton label="Privacy & Permissions" onPress={() => navigation?.navigate?.('OnboardingPrivacy')} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  body: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  btn: { minWidth: 160 },
});
