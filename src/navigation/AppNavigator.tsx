import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navTheme } from '../theme/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import TransmissionScreen from '../screens/TransmissionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ARModeScreen from '../screens/ARModeScreen';

import Logbook from '../../screens/Logbook';
import SessionDetail from '../../components/logbook/SessionDetail';
import OnboardingIntro from '../../screens/Onboarding/Intro';
import OnboardingHowTo from '../../screens/Onboarding/HowTo';
import OnboardingPrivacy from '../../screens/Onboarding/Privacy';
import WelcomeScreen from '../screens/WelcomeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Transmission: undefined;
  Settings: undefined;
  ARMode: undefined;
  Logbook: undefined;
  SessionDetail: { session: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  // Log navigation container state
  console.log('[AppNavigator] Navigation state:', Stack.Navigator);

  return (
    <NavigationContainer
      theme={navTheme}
      onStateChange={(state) => console.log('[AppNavigator] Navigation state changed:', state)}
    >
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={({ route }) => ({
          headerShown: false,
          // provide a distinct animation for a few key routes
          animation:
            route.name === 'Welcome'
              ? 'fade_from_bottom'
              : route.name === 'ARMode'
              ? 'slide_from_bottom'
              : 'slide_from_right',
        })}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Transmission" component={TransmissionScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ARMode" component={ARModeScreen} />
        <Stack.Screen name="Logbook" component={Logbook} />
        <Stack.Screen name="SessionDetail" component={SessionDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
