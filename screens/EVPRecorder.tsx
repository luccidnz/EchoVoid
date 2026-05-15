import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Recorder from '../services/audio/Recorder';
import SessionStore from '../services/sessions/SessionStore';
import SpectrogramPreview from '../components/evp/SpectrogramPreview';
import { detectAnomalies } from '../src/core/anomaly/detector';
import EVoidButton from '../components/ui/EVoidButton';
import { useTheme } from '../theme';

export default function EVPRecorder() {
  const { theme } = useTheme();
  const [recording, setRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [markers, setMarkers] = useState<number[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const start = async () => {
    await Recorder.startRecording();
    setRecording(true);
    setUri(null);
    setMarkers([]);
    setAnomalies([]);
  };

  const stop = async () => {
    const result = await Recorder.stopRecording();
    setRecording(false);
    setUri(result);
    setMarkers(Recorder.getMarkers());
    // Simulate anomaly detection (replace with real buffer later)
    const fakeBuffer = new Float32Array(2048).map(() => Math.random() * 2 - 1);
    setAnomalies(detectAnomalies(fakeBuffer));
  };

  const mark = () => {
    Recorder.markAnomaly();
    setMarkers([...Recorder.getMarkers()]);
  };

  const saveSession = async () => {
    if (!uri) return;
    const session = {
      id: Date.now().toString(),
      type: 'evp',
      uri,
      markers,
      anomalies,
      date: new Date().toISOString(),
    };
    await SessionStore.create(session);
    Alert.alert('Session Saved', 'Your EVP session has been saved to the logbook.');
  };

  const handlePlay = () => {
    if (uri) {
      Alert.alert('Playing Recording', `Playing file: ${uri}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>EVP Recorder</Text>
      <View style={styles.status}>
        <Text style={{ color: theme.colors.text }}>Status: {recording ? 'Recording...' : uri ? 'Stopped' : 'Idle'}</Text>
        {uri && <Text style={{ color: theme.colors.text }}>File: {uri}</Text>}
        {markers.length > 0 && <Text style={{ color: theme.colors.text }}>Markers: {markers.join(', ')}</Text>}
        {anomalies.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: theme.colors.text }}>Anomalies Detected:</Text>
            {anomalies.map((a, i) => (
              <Text key={i} style={{ color: theme.colors.text }}>
                {`Time: ${a.time}, Freq: ${Math.round(a.freq)}Hz, Confidence: ${Math.round(a.confidence * 100)}%`}
              </Text>
            ))}
          </View>
        )}
      </View>
      <SpectrogramPreview />
      <View style={styles.buttons}>
        {!recording ? (
          <EVoidButton label="Start Recording" onPress={start} style={styles.btn} />
        ) : (
          <EVoidButton label="Stop Recording" onPress={stop} variant="outline" style={styles.btn} />
        )}
        {recording && (
          <EVoidButton label="Mark Anomaly" onPress={mark} variant="outline" style={styles.btn} />
        )}
        {uri && (
          <EVoidButton label="Save Session" onPress={saveSession} style={styles.btn} />
        )}
        {uri && (
          <EVoidButton label="Play Recording" onPress={handlePlay} variant="outline" style={styles.btn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  status: { marginBottom: 24 },
  buttons: { gap: 12 },
  btn: { minWidth: 180 },
});
