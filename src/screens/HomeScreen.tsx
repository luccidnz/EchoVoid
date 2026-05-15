import React from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import UIButton from '../components/UIButton';
import { colors } from '../theme/colors';
import { hasNativeVoice, startListening } from '../voice/adapter';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const onBegin = async () => {
    console.log('[Home] Begin pressed');
    console.log('[HomeScreen] Navigating to Transmission');
    
    // Explicitly dispatch navigation actions
    navigation.dispatch({
      type: 'NAVIGATE',
      payload: { name: 'Transmission' },
    });
    console.log('[HomeScreen] Dispatching navigation to Transmission');

    if (hasNativeVoice) {
      try { await startListening((t: string) => { console.log('Heard:', t); }); } catch {}
    } else {
      Alert.alert('Voice', 'Native voice unavailable in Expo Go. Dev Client build required.');
    }
  };

  return (
    <LinearGradient
      colors={[colors.bg, '#0A0A1C', colors.card]}
      style={styles.flex}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Ech0Void</Text>
        <Text style={styles.subtitle}>where echos become answers</Text>

        <UIButton label="Begin Transmission" onPress={onBegin} style={styles.btn} testID="btn-begin" />
        <UIButton label="Settings" onPress={() => { console.log('[Home] Settings'); console.log('[HomeScreen] Navigating to Settings'); navigation.navigate('Settings'); }} style={styles.btn} testID="btn-settings" />
        <UIButton label="AR Mode" onPress={() => { console.log('[Home] ARMode'); console.log('[HomeScreen] Navigating to ARMode'); navigation.navigate('ARMode'); }} style={styles.btn} testID="btn-ar" />
      </View>

      {/* decorative neon ring that never intercepts touches */}
      <View pointerEvents="none" style={styles.ring} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: colors.text, fontSize: 44, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase',
  },
  subtitle: {
    color: colors.subtext, marginTop: 6, marginBottom: 18,
  },
  btn: {
    width: '90%',
    backgroundColor: '#12122B',
    borderColor: colors.neon,
  },
  ring: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 6,
    borderColor: 'rgba(0,243,255,0.25)',
    shadowColor: colors.neon,
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
});
