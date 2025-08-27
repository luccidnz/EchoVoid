import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import EVoidButton from '../ui/EVoidButton';
import { shareSessionZip } from '../../services/export/zipSession';
import { useTheme, Theme } from '../../theme';

export default function SessionDetail({ route }: any) {
  const session = route?.params?.session;
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handlePlay = async () => {
    if (!session?.uri) return;
    if (playing) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setPlaying(false);
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: session.uri }, { shouldPlay: true });
      soundRef.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish) {
          setPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {}
  };

  return (
    <ScrollView style={styles.detail} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Session Detail</Text>
      <Text style={styles.label}>Type:</Text>
      <Text style={styles.value}>{session?.type || 'Session'}</Text>
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>{new Date(session?.created).toLocaleString()}</Text>
      <Text style={styles.label}>Anomalies:</Text>
      <Text style={styles.value}>{session?.anomalies?.length ?? 0}</Text>
      <EVoidButton
        label={playing ? 'Stop Playback' : 'Play Recording'}
        onPress={handlePlay}
        style={{ marginVertical: 16, minWidth: 140 }}
      />
      <Text style={styles.label}>Anomaly Timestamps:</Text>
      {session?.anomalies?.length ? (
        session.anomalies.map((ms: number, i: number) => (
          <Text key={i} style={styles.value}>{ms} ms</Text>
        ))
      ) : (
        <Text style={styles.value}>None</Text>
      )}
      <EVoidButton label="Export Session" onPress={() => shareSessionZip(session)} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    detail: { flex: 1, padding: 20, backgroundColor: '#111' },
    title: { ...theme.typography.heading2, color: '#fff', marginBottom: 16 },
    label: { ...theme.typography.label, color: '#aaa', marginTop: 12 },
    value: { ...theme.typography.body, color: '#fff', marginTop: 2 },
  });
}
