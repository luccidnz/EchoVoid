import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useTheme, Theme } from '../../theme';

// Added type annotation for navigation prop
const TransmissionScreen = ({ navigation }: { navigation: any }) => {
  // Log navigation prop
  console.log('[TransmissionScreen] navigation prop:', navigation);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <LinearGradient colors={[colors.bg, '#0A0A1C', colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Transmission</Text>
        <Text style={styles.p}>Listening / responses will appear here.</Text>
      </View>
    </LinearGradient>
  );
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    h1: { ...theme.typography.heading1, color: colors.text },
    p: { ...theme.typography.body, color: colors.subtext, marginTop: 8 },
  });
}

export default TransmissionScreen;
