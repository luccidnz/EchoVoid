import React from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { voidTheme } from '../ech0void/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const replayIntro = async () => {
    await AsyncStorage.removeItem('ech0void.intro.accepted.v2');
    navigation.replace('Welcome');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>← HOME</Text></Pressable>
        <Text style={styles.kicker}>ABOUT THE INSTRUMENT</Text>
        <Text style={styles.title}>Ech0Void V2</Text>
        <Text style={styles.version}>local-first • provenance-first • offline core</Text>

        <View style={styles.panel}><Text style={styles.head}>THREE REAL ENGINES</Text><Text style={styles.body}>EchoBox layers generated fragments and decays. Field Drift uses jumpy rate/reverse/dropout behaviour. Signal Scan builds procedural static, gates and scan tones. They share a source bank but not the same scheduler.</Text></View>
        <View style={styles.panel}><Text style={styles.head}>SENSOR INPUT</Text><Text style={styles.body}>The device magnetometer and accelerometer can influence timing and source selection according to Sensor Mix. The displayed magnetic-field reading is a phone-sensor measurement, not a claim that a detected change has a paranormal cause.</Text></View>
        <View style={styles.panel}><Text style={styles.head}>ROOM MIC</Text><Text style={styles.body}>Room audio is recorded locally when microphone permission is granted. Ech0Void does not call a cloud transcription service. If the phone speaker is used, its generated audio can bleed into the microphone; the source ledger is retained to make that reviewable.</Text></View>
        <View style={styles.panel}><Text style={styles.head}>DATA</Text><Text style={styles.body}>Session records are stored on-device. Sharing happens only when you choose the JSON export action. No backend is required for the V2 core.</Text></View>

        <Pressable onPress={replayIntro} style={styles.button}><Text style={styles.buttonText}>REPLAY INTRO + DISCLOSURE</Text></Pressable>
        <Pressable onPress={() => Alert.alert('Ech0Void', 'The V2 core deliberately keeps AI interpretation out of the capture path. Analysis can be added later as an optional, clearly separated review layer.')} style={styles.ghost}><Text style={styles.ghostText}>WHY NO AI “SPIRIT WORDS”?</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: voidTheme.bg },
  content: { padding: 20, paddingTop: 28, paddingBottom: 50 },
  back: { color: voidTheme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  kicker: { color: voidTheme.cyan, fontSize: 10, letterSpacing: 2.1, fontWeight: '900', marginTop: 25 },
  title: { color: voidTheme.text, fontSize: 36, fontWeight: '900', marginTop: 4 },
  version: { color: voidTheme.violet, fontSize: 11, marginTop: 2, marginBottom: 18 },
  panel: { backgroundColor: voidTheme.panel, borderWidth: 1, borderColor: voidTheme.border, borderRadius: 16, padding: 16, marginBottom: 10 },
  head: { color: voidTheme.text, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  body: { color: voidTheme.muted, fontSize: 12, lineHeight: 18 },
  button: { backgroundColor: voidTheme.cyan, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#021014', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  ghost: { borderColor: voidTheme.border, borderWidth: 1, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 9 },
  ghostText: { color: voidTheme.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
