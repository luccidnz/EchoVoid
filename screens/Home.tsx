

import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme, Theme } from '../theme';
import ParticleField from '../components/fx/ParticleField';
import EVoidButton from '../components/ui/EVoidButton';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../src/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <ParticleField />
      <View style={styles.center}>
        <Image source={require('../assets/logo.svg')} style={{ width: 96, height: 96, marginBottom: 16 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Ech0Void</Text>
        <Text style={[styles.subtitle, { color: theme.colors.accent }]}>where echos become answers</Text>
  <EVoidButton label="Begin Transmission" onPress={() => navigation.navigate('Transmission')} style={styles.btn} />
  <EVoidButton label="Settings" onPress={() => navigation.navigate('Settings')} style={styles.btn} />
  <EVoidButton label="AR Mode" onPress={() => navigation.navigate('ARMode')} style={styles.btn} />
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    title: { ...theme.typography.display, textTransform: 'uppercase' },
    subtitle: { ...theme.typography.label, marginBottom: 24 },
    btn: { width: 220, marginVertical: 6 },
  });
}
