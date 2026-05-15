import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../theme/typography';

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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  h1: { color: colors.text, fontSize: FONT_SIZES.xxxl, fontWeight: FONT_WEIGHTS.bold },
  p: { color: colors.subtext, marginTop: SPACING.sm },
});

export default TransmissionScreen;
