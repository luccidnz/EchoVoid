import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#020408" />
      <Text style={styles.kicker}>ECH0VOID // NATIVE CANARY</Text>
      <Text style={styles.title}>BOOT SUCCESS</Text>
      <Text style={styles.body}>
        Bare React Native shell is alive on this phone.
      </Text>
      <Text style={styles.code}>CANARY 001</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020408',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  kicker: {
    color: '#47E9FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  title: {
    color: '#F4F7FB',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 10,
  },
  body: {
    color: '#AEB8C7',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  code: {
    color: '#9A7CFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginTop: 26,
  },
});
