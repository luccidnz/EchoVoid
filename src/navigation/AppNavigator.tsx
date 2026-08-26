import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Ech0Mode } from '../ech0void/types';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
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

function TransmissionRoute(props: any) {
  const Screen = require('../screens/TransmissionScreen').default;
  return <Screen {...props} />;
}

function LogbookRoute(props: any) {
  const Screen = require('../screens/LogbookScreen').default;
  return <Screen {...props} />;
}

function SessionDetailRoute(props: any) {
  const Screen = require('../screens/SessionDetailScreen').default;
  return <Screen {...props} />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Transmission" component={TransmissionRoute} />
        <Stack.Screen name="Logbook" component={LogbookRoute} />
        <Stack.Screen name="SessionDetail" component={SessionDetailRoute} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
