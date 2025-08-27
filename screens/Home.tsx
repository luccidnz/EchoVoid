

import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../theme';
import EVoidButton from '../components/ui/EVoidButton';
import Screen from './_layout/Screen';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../src/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  return (
    <Screen style={[styles.flex, { backgroundColor: theme.colors.bg }]}> 
      <View style={styles.center}>
        <Image source={require('../assets/logo.svg')} style={{ width: 96, height: 96, marginBottom: 16 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Ech0Void</Text>
        <Text style={[styles.subtitle, { color: theme.colors.accent }]}>where echos become answers</Text>
        <EVoidButton label="Begin Transmission" onPress={() => navigation.navigate('Transmission')} style={styles.btn} />
        <EVoidButton label="Settings" onPress={() => navigation.navigate('Settings')} style={styles.btn} />
        <EVoidButton label="AR Mode" onPress={() => navigation.navigate('ARMode')} style={styles.btn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 40, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  subtitle: { fontSize: 16, marginBottom: 24, fontWeight: '600' },
  btn: { width: 220, marginVertical: 6 },
});
