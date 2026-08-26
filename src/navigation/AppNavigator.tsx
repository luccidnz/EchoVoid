import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Ech0Mode } from '../ech0void/types';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import TransmissionScreen from '../screens/TransmissionScreen';
import LogbookScreen from '../screens/LogbookScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { voidTheme } from '../ech0void/theme';

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Transmission: { mode: Ech0Mode };
  Logbook: undefined;
  SessionDetail: { sessionId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: voidTheme.bg,
    card: voidTheme.panel,
    text: voidTheme.text,
    border: voidTheme.border,
    primary: voidTheme.cyan,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Transmission" component={TransmissionScreen} />
        <Stack.Screen name="Logbook" component={LogbookScreen} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
