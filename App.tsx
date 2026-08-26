import React, { Component, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

class StartupBoundary extends Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={styles.failure}>
          <Text style={styles.failureKicker}>ECH0VOID STARTUP DIAGNOSTIC</Text>
          <Text style={styles.failureTitle}>JavaScript boot error</Text>
          <Text selectable style={styles.failureBody}>{this.state.error.message || String(this.state.error)}</Text>
          <Pressable style={styles.retry} onPress={() => this.setState({ error: null })}>
            <Text style={styles.retryText}>RETRY BOOT</Text>
          </Pressable>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function BootGate() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 180);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <SafeAreaView style={styles.boot}>
        <Text style={styles.bootKicker}>ECH0VOID // SAFE BOOT</Text>
        <Text style={styles.bootTitle}>Opening the void…</Text>
      </SafeAreaView>
    );
  }

  // Delay navigator evaluation until after the primitive React Native shell is visibly alive.
  // If a JS module fails during navigator startup, StartupBoundary shows the actual message.
  const AppNavigator = require('./src/navigation/AppNavigator').default as React.ComponentType;
  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StartupBoundary>
        <BootGate />
      </StartupBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: '#030408', alignItems: 'center', justifyContent: 'center', padding: 28 },
  bootKicker: { color: '#47E9FF', fontSize: 11, fontWeight: '900', letterSpacing: 2.4 },
  bootTitle: { color: '#F4F7FB', fontSize: 28, fontWeight: '900', marginTop: 10 },
  failure: { flex: 1, backgroundColor: '#030408', justifyContent: 'center', padding: 24 },
  failureKicker: { color: '#FFB84D', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  failureTitle: { color: '#F4F7FB', fontSize: 30, fontWeight: '900', marginTop: 9, marginBottom: 15 },
  failureBody: { color: '#AEB8C7', fontSize: 13, lineHeight: 20, backgroundColor: '#0A0E15', borderRadius: 14, padding: 15 },
  retry: { marginTop: 18, backgroundColor: '#47E9FF', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  retryText: { color: '#021014', fontWeight: '900', letterSpacing: 1.2 },
});
