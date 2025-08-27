import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { scaleFont } from 'src/utils/scale';

// Added type annotation for navigation prop
const TransmissionScreen = ({ navigation }: { navigation: any }) => {
  // Log navigation prop
  console.log('[TransmissionScreen] navigation prop:', navigation);

  return (
    <LinearGradient colors={[colors.bg, '#0A0A1C', colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Transmission</Text>
        <Text style={styles.p}>Listening / responses will appear here.</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  h1: { color: colors.text, fontSize: scaleFont(28), fontWeight: '700' },
  p: { color: colors.subtext, marginTop: 8 },
});

export default TransmissionScreen;
