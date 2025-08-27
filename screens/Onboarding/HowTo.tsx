import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { scaleFont } from 'src/utils/scale';

export default function OnboardingHowTo({ navigation }: any) {
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>How to Use Ech0Void</Text>
      <Text style={styles.body}>
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
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#111' },
  title: { fontSize: scaleFont(28), fontWeight: '800', color: '#fff', marginBottom: 24 },
  body: { color: '#ccc', fontSize: scaleFont(16), textAlign: 'center', marginBottom: 32 },
  btn: { minWidth: 160 },
});
