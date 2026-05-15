import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { themeColors } from '../theme/theme';
import { SPACING } from '../theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../theme/typography';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  console.log('WelcomeScreen navigation prop:', navigation);
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={[themeColors.card, themeColors.accent2, themeColors.neon]}
      style={styles.gradient}
    >
      <View style={styles.container}>
  <Text style={[styles.title, { color: themeColors.neon }]}>EchØVoid</Text>
  <Text style={[styles.subtitle, { color: themeColors.text }]}>Where echoes become answers.</Text>
        <Pressable
          onPress={() => {
            if (navigation && typeof navigation.navigate === 'function') {
              try {
                navigation.navigate('Home');
              } catch (e) {
                console.error('Navigation error:', e);
              }
            } else {
              console.error('Invalid navigation prop:', navigation);
            }
          }}
          style={[styles.button, { backgroundColor: themeColors.neon, borderColor: themeColors.neon }]}
        >
          <Text style={[styles.buttonText, { color: themeColors.card }]}>Begin Transmission</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            try {
              navigation.navigate('Settings');
            } catch (e) {
              console.error('Navigation error:', e);
            }
          }}
          style={[styles.button, { backgroundColor: themeColors.accent2, borderColor: themeColors.text }]}
        >
          <Text style={[styles.buttonText, { color: themeColors.text }]}>Settings</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            try {
              navigation.navigate('ARMode');
            } catch (e) {
              console.error('Navigation error:', e);
            }
          }}
          style={[styles.button, { backgroundColor: themeColors.accent, borderColor: themeColors.accent }]}
        >
          <Text style={[styles.buttonText, { color: themeColors.card }]}>AR Mode</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, width, height },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.display - SPACING.xxs,
    fontWeight: FONT_WEIGHTS.black,
    letterSpacing: 2,
    textShadowColor: '#000a',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING.sm + SPACING.xxs,
    marginBottom: SPACING.xl,
    opacity: 0.85,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.md + SPACING.xxs,
    paddingVertical: SPACING.sm + SPACING.xs + SPACING.xxs,
    paddingHorizontal: SPACING.lg + SPACING.sm + SPACING.xs,
    borderRadius: SPACING.md,
    borderWidth: 2,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
  },
});
