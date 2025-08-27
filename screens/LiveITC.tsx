import React, { useState, useEffect, useRef } from 'react';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import { createEngine, PRESETS } from '../src/core/audio/evpEngine';
import { WORD_BANK } from '../src/core/audio/wordBank';
import LiveChain from '../services/audio/LiveChain';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../theme';
import VU from '../components/controls/VU';
import Knob from '../components/controls/Knob';
import EVoidSlider from '../components/controls/Slider';
import Toggle from '../components/controls/Toggle';
import Chip from '../components/controls/Chip';
import XYPad from '../components/controls/XYPad';
import AudioReactiveBars from '../components/fx/AudioReactiveBars';
import NoiseOverlay from '../components/fx/NoiseOverlay';
import Timer from '../components/controls/Timer';
import EVoidButton from '../components/ui/EVoidButton';


function LiveITC() {
  const { theme } = useTheme();
  const engineRef = useRef(null);
  const liveChainActive = useRef(false);
  const [gain, setGain] = useState(0.7);
  const [fx, setFx] = useState('Echo');
  const [vu, setVu] = useState(0.3);
  const [peak, setPeak] = useState(0.5);
  const [enabled, setEnabled] = useState(true);
  const [x, setX] = useState(0.5);
  const [y, setY] = useState(0.5);
  const [timer, setTimer] = useState(0);
  const [mag, setMag] = useState([0,0,0]);
  const [acc, setAcc] = useState([0,0,0]);
  const [word, setWord] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [anomalyCount, setAnomalyCount] = useState(0);
  // Select a random word from the bank
  useEffect(() => {
    const idx = Math.floor(Math.random() * WORD_BANK.length);
    setWord(WORD_BANK[idx]);
  }, []);

  // Sensor subscriptions
  useEffect(() => {
  const magSub = Magnetometer.addListener((data) => setMag([data.x, data.y, data.z]));
  const accSub = Accelerometer.addListener((data) => setAcc([data.x, data.y, data.z]));
  return () => { magSub.remove(); accSub.remove(); };
  }, []);

  // Start/stop LiveChain (mic input) when enabled changes
  useEffect(() => {
  if (enabled) {
    } else if (liveChainActive.current) {
      LiveChain.stopLiveChain();
      liveChainActive.current = false;
      setVu(0);
    }
    return () => {
      if (liveChainActive.current) {
        LiveChain.stopLiveChain();
        liveChainActive.current = false;
      }
    };
  }, [enabled]);

  // Update gain/fx live
  useEffect(() => {
    if (liveChainActive.current) {
      LiveChain.setGain(gain);
    }
  }, [gain]);
  useEffect(() => {
    if (liveChainActive.current) {
      LiveChain.setFx(fx);
    }
  }, [fx]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1000), 1000);
    return () => clearInterval(interval);
  }, []);

  // Implement recording, anomaly marking, and playback logic
  const handleRecord = () => {
    console.log('Recording started');
    setRecording(true);
  };

  const handleStop = () => {
    console.log('Recording stopped');
    setRecording(false);
  };

  const handleMarkAnomaly = () => {
    console.log('Anomaly marked');
    setAnomalyCount((count) => count + 1);
  };

  const handlePlay = () => {
    console.log('Playback started');
    setPlaying(true);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.bg }]}> 
      <NoiseOverlay />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Live ITC</Text>
        <Timer ms={timer} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <EVoidButton label={recording ? "Stop" : "Record"} onPress={recording ? handleStop : handleRecord} />
          <EVoidButton label="Mark Anomaly" onPress={handleMarkAnomaly} />
          <EVoidButton label={playing ? "Stop" : "Play"} onPress={playing ? () => setPlaying(false) : handlePlay} />
        </View>
        {recordingUri && (
          <Text style={{ color: theme.colors.accent, fontSize: 14, marginTop: 8 }}>
            Recording saved: {recordingUri}
          </Text>
        )}
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 12 }}>Magnetometer: {mag.map(v => v.toFixed(2)).join(', ')}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 12 }}>Accelerometer: {acc.map(v => v.toFixed(2)).join(', ')}</Text>
          {word && <Text style={{ color: theme.colors.accent, fontSize: 18, marginTop: 8 }}>ITC Word: {word}</Text>}
        </View>
      </View>
      <AudioReactiveBars
        barCount={24}
        colors={[theme.colors.accent, theme.colors.primary]}
      />
      <View style={styles.row}>
        <VU value={vu} peak={peak} />
        <Knob value={gain} onChange={setGain} min={0} max={1} label="Gain" format="" />
        <Chip options={['Echo', 'Reverb', 'Pitch']} value={fx} onChange={setFx} />
        <Toggle value={enabled} onChange={setEnabled} label="Enable" />
      </View>
      <View style={styles.row}>
        <EVoidSlider value={gain} onChange={setGain} min={0} max={1} label="Mix" format="" />
        <XYPad x={x} y={y} onChange={(nx, ny) => { setX(nx); setY(ny); }} label="Mod" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginVertical: 12 },
});

