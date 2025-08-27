import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { useEsmera } from '../../services/tts/Esmera';
import { usePrefs } from '../../hooks/usePrefs';
import Toggle from '../components/Toggle';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  // Log navigation prop
  console.log('[SettingsScreen] navigation prop:', navigation);

  const { availableVoices } = useEsmera();
  const [promptsEnabled, setPromptsEnabled] = usePrefs('prompts.enabled', true);
  const [voiceId, setVoiceId] = usePrefs('prompts.voice', '');
  const [rate, setRate] = usePrefs('prompts.rate', 1);
  const [pitch, setPitch] = usePrefs('prompts.pitch', 1);

  return (
    <LinearGradient colors={[colors.bg, '#0A0A1C', colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Settings</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Enable Prompts</Text>
          <Switch value={promptsEnabled} onValueChange={setPromptsEnabled} />
        </View>

        <Text style={styles.section}>Voice</Text>
        <View style={styles.rowWrap}>
          {availableVoices.map(v => (
            <Toggle key={v.identifier} label={v.name} active={voiceId === v.identifier} onPress={() => setVoiceId(v.identifier)} />
          ))}
        </View>

        <Text style={styles.section}>Rate: {rate.toFixed(2)}</Text>
        <Slider
          minimumValue={0.5}
          maximumValue={2}
          value={rate}
          onValueChange={setRate}
        />

        <Text style={styles.section}>Pitch: {pitch.toFixed(2)}</Text>
        <Slider
          minimumValue={0.5}
          maximumValue={2}
          value={pitch}
          onValueChange={setPitch}
        />
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  h1: { color: colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  p: { color: colors.subtext, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  label: { color: colors.text, fontSize: 16 },
  section: { color: colors.text, fontSize: 18, marginTop: 16, marginBottom: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
});
