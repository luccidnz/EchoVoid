import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#17001F" />
      <Text style={styles.kicker}>VOID CANARY // SDK 57</Text>
      <Text style={styles.title}>BOOT SUCCESS</Text>
      <Text style={styles.body}>Isolated Expo SDK 57 runtime is alive.</Text>
      <Text style={styles.code}>ISOLATED CANARY 057</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#17001F', alignItems: 'center', justifyContent: 'center', padding: 28 },
  kicker: { color: '#FF4FF8', fontSize: 12, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', marginTop: 12 },
  body: { color: '#E6D8EA', fontSize: 16, textAlign: 'center', marginTop: 14 },
  code: { color: '#67F7FF', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginTop: 28 }
});
