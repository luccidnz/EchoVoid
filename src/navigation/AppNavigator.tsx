import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navTheme } from '../theme/theme';
import { createStackNavigator, StackCardStyleInterpolator } from '@react-navigation/stack';
import { Easing } from 'react-native-reanimated';

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

const Stack = createStackNavigator<RootStackParamList>();

const fadeConfig = {
  animation: 'timing',
  config: {
    duration: 350,
    easing: Easing.out(Easing.cubic),
  },
};

const forFade: StackCardStyleInterpolator = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

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
        screenOptions={{
          headerShown: false,
          transitionSpec: { open: fadeConfig, close: fadeConfig },
          cardStyleInterpolator: forFade,
        }}
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
