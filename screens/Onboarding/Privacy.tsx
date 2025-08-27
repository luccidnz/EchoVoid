import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingPrivacy({ navigation }: any) {
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Privacy & Permissions</Text>
      <Text style={styles.body}>
        Ech0Void only requests permissions needed for audio recording and file access.{"\n"}
        Your data is stored locally and never shared without your consent.{"\n"}
        You can export or delete your sessions at any time from the Logbook.
      </Text>
      <EVoidButton label="Get Started" onPress={async () => {
        await AsyncStorage.setItem('onboarded', '1');
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }} style={styles.btn} />
      <EVoidButton label="Skip Onboarding" onPress={async () => {
        await AsyncStorage.setItem('onboarded', '1');
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }} style={[styles.btn, { marginTop: 16, backgroundColor: '#333' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#111' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 24 },
  body: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 32 },
  btn: { minWidth: 160 },
});
