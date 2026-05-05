import React, { useState, useEffect, useRef } from 'react';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import { createEngine, PRESETS } from '../src/core/audio/evpEngine';
import { WORD_BANK } from '../src/core/audio/wordBank';
import LiveChain from '../services/audio/LiveChain';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
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
import { useEsmera } from '../services/tts/EsmeraProvider';

function LiveITC() {
  const { theme } = useTheme();
  const { speak } = useEsmera();
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
  const [anomalyCount, setAnomalyCount] = useState(0);

  const [sensitivity, setSensitivity] = useState(0.5);
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [wordHistory, setWordHistory] = useState<{word: string, time: string}[]>([]);

  const lastMag = useRef([0,0,0]);
  const lastAcc = useRef([0,0,0]);
  const currentMagRef = useRef([0,0,0]);
  const currentAccRef = useRef([0,0,0]);
  const lastWordTime = useRef(0);

  // Keep refs for current state to use inside sensor callbacks without triggering re-renders
  const stateRefs = useRef({ enabled, sensitivity, pitch, rate });
  useEffect(() => {
    stateRefs.current = { enabled, sensitivity, pitch, rate };
  }, [enabled, sensitivity, pitch, rate]);

  const processSensors = (currentMag: number[], currentAcc: number[]) => {
    const { enabled, sensitivity, pitch, rate } = stateRefs.current;
    if (!enabled) return;

    const magDelta = Math.abs(currentMag[0] - lastMag.current[0]) +
                     Math.abs(currentMag[1] - lastMag.current[1]) +
                     Math.abs(currentMag[2] - lastMag.current[2]);

    const accDelta = Math.abs(currentAcc[0] - lastAcc.current[0]) +
                     Math.abs(currentAcc[1] - lastAcc.current[1]) +
                     Math.abs(currentAcc[2] - lastAcc.current[2]);

    const combinedDelta = magDelta + accDelta;

    // Threshold determined by sensitivity (inverted: higher sensitivity = lower threshold)
    const threshold = (1.0 - sensitivity) * 5.0 + 0.1; // Range: 0.1 to 5.1

    if (combinedDelta > threshold) {
      const now = Date.now();
      // Throttle to max 1 word per 2 seconds to avoid spam
      if (now - lastWordTime.current > 2000) {
        lastWordTime.current = now;

        // Pseudo-random selection based on sensor values
        const seed = Math.abs(currentMag[0] * currentAcc[1] + currentMag[2] * currentAcc[0]) * 10000;
        const index = Math.floor(seed % WORD_BANK.length);
        const selectedWord = WORD_BANK[index];

        setWord(selectedWord);
        setWordHistory(prev => [{ word: selectedWord, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));

        speak(selectedWord, { pitch, rate });
      }
    }

    lastMag.current = currentMag;
    lastAcc.current = currentAcc;
  };

  // Sensor subscriptions
  useEffect(() => {
    const magSub = Magnetometer.addListener((data) => {
      const magArr = [data.x, data.y, data.z];
      setMag(magArr);
      currentMagRef.current = magArr;
      processSensors(magArr, currentAccRef.current);
    });
    const accSub = Accelerometer.addListener((data) => {
      const accArr = [data.x, data.y, data.z];
      setAcc(accArr);
      currentAccRef.current = accArr;
      processSensors(currentMagRef.current, accArr);
    });
    return () => { magSub.remove(); accSub.remove(); };
  }, []);

  // Start/stop LiveChain (mic input) when enabled changes
  useEffect(() => {
    if (enabled) {
      if (!liveChainActive.current) {
        LiveChain.startLiveChain({ gain, fx, onLevel: setVu });
        liveChainActive.current = true;
      }
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
  }, [enabled, gain, fx]);

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

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.bg }]}> 
      <NoiseOverlay />

      <View style={styles.mainContainer}>
        {/* Top Header Controls */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Live ITC</Text>
          <Timer ms={timer} />
          <View style={styles.actionButtons}>
            <EVoidButton label={recording ? "Stop" : "Record"} onPress={recording ? handleStop : handleRecord} />
            <EVoidButton label="Mark Anomaly" onPress={handleMarkAnomaly} />
          </View>
          {recordingUri && (
             <Text style={{ color: theme.colors.accent, fontSize: 14, marginTop: 8 }}>
               Recording saved: {recordingUri}
             </Text>
          )}
        </View>

        {/* Visualizer & Sensor Status */}
        <View style={styles.visualizerContainer}>
          <AudioReactiveBars />
          <View style={styles.sensorTextContainer}>
             <Text style={[styles.sensorText, { color: theme.colors.text }]}>Mag: {mag.map(v => v.toFixed(1)).join(',')}</Text>
             <Text style={[styles.sensorText, { color: theme.colors.text }]}>Acc: {acc.map(v => v.toFixed(1)).join(',')}</Text>
          </View>
        </View>

        {/* Word History Log */}
        <View style={[styles.historyContainer, { borderColor: theme.colors.surface }]}>
           <Text style={[styles.historyTitle, { color: theme.colors.text }]}>Entity Communications</Text>
           <ScrollView style={styles.scrollView}>
             {wordHistory.length === 0 ? (
                <Text style={{ color: theme.colors.surface, textAlign: 'center', marginTop: 20 }}>Awaiting signal...</Text>
             ) : (
                wordHistory.map((entry, index) => (
                  <View key={index} style={styles.historyRow}>
                    <Text style={[styles.historyTime, { color: theme.colors.surface }]}>{entry.time}</Text>
                    <Text style={[styles.historyWord, { color: theme.colors.accent }]}>{entry.word}</Text>
                  </View>
                ))
             )}
           </ScrollView>
        </View>

        {/* Audio & Sensor Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.row}>
            <VU value={vu} peak={peak} />
            <Knob value={gain} onChange={setGain} min={0} max={1} label="Gain" format="" size={60} />
            <Knob value={sensitivity} onChange={setSensitivity} min={0} max={1} label="Sens" format="" size={60} />
            <Toggle value={enabled} onChange={setEnabled} label="Active" />
          </View>

          <View style={styles.row}>
            <Knob value={pitch} onChange={setPitch} min={0.1} max={2.0} step={0.1} label="Pitch" format="" size={60} />
            <Knob value={rate} onChange={setRate} min={0.1} max={2.0} step={0.1} label="Rate" format="" size={60} />
            <Chip options={['Echo', 'Reverb', 'Distort']} value={fx} onChange={setFx} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mainContainer: { flex: 1, padding: 10, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: 2 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  visualizerContainer: { height: 80, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  sensorTextContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginTop: 5 },
  sensorText: { fontSize: 10, opacity: 0.7 },
  historyContainer: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 10, minHeight: 120 },
  historyTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  scrollView: { flex: 1 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#333' },
  historyTime: { fontSize: 12 },
  historyWord: { fontSize: 16, fontWeight: 'bold' },
  controlsSection: { paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 10, marginVertical: 8 },
});

