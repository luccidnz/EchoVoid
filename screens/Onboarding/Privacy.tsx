import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

export default function OnboardingPrivacy({ navigation }: any) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, backgroundColor: theme.colors.bg },
    title: { ...typography.h1, color: theme.colors.text, marginBottom: spacing.xxl },
    body: { color: theme.colors.text + 'CC', ...typography.body, textAlign: 'center', marginBottom: spacing.xxl },
    btn: { minWidth: 160 },
  });
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Privacy & Permissions</Text>
      <Text style={styles.body}>
        Ech0Void only requests permissions needed for audio recording and file access.{"\n"}
        Your data is stored locally and never shared without your consent.{"\n"}
        You can export or delete your sessions at any time from the Logbook.
      </Text>
      <EVoidButton
        label="Get Started"
        onPress={async () => {
          await AsyncStorage.setItem('onboarded', '1');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }}
        style={styles.btn}
      />
      <EVoidButton
        label="Skip Onboarding"
        onPress={async () => {
          await AsyncStorage.setItem('onboarded', '1');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }}
        style={[styles.btn, { marginTop: spacing.lg, backgroundColor: theme.colors.surface }]}
      />
    </View>
  );
}
