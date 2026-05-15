import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import UIButton from '../components/UIButton';
import { nextPrompt } from '../core/prompts';
import { useEsmera } from '../../services/tts/Esmera';
import { usePrefs } from '../../hooks/usePrefs';
import { useSession } from '../context/SessionContext';
import SessionStore from '../../services/sessions/SessionStore';

// Added type annotation for navigation prop
const TransmissionScreen = ({ navigation }: { navigation: any }) => {
  // Log navigation prop
  console.log('[TransmissionScreen] navigation prop:', navigation);

  const { speak } = useEsmera();
  const { session } = useSession();
  const [promptsEnabled] = usePrefs('prompts.enabled', true);
  const [voiceId] = usePrefs('prompts.voice', '');
  const [rate] = usePrefs('prompts.rate', 1);
  const [pitch] = usePrefs('prompts.pitch', 1);

  const [current, setCurrent] = useState('');

  const onPrompt = () => {
    const q = nextPrompt();
    setCurrent(q);
    speak(q, { voiceId, rate, pitch });
    if (session) {
      SessionStore.appendPrompt(session.id, q).catch(() => {});
    }
  };

  return (
    <LinearGradient colors={[colors.bg, '#0A0A1C', colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Transmission</Text>
        <Text style={styles.p}>Listening / responses will appear here.</Text>
        {promptsEnabled && <UIButton label="Prompt" onPress={onPrompt} style={{ marginTop: 24 }} />}
        {current ? <Text style={styles.prompt}>{current}</Text> : null}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  h1: { color: colors.text, fontSize: 28, fontWeight: '700' },
  p: { color: colors.subtext, marginTop: 8 },
  prompt: { color: colors.text, marginTop: 16, fontStyle: 'italic', textAlign: 'center' },
});

export default TransmissionScreen;
