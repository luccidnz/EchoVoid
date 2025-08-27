import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/theme/theme';
import EsmeraProvider from './services/tts/EsmeraProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingIntro from './screens/Onboarding/Intro';
import OnboardingHowTo from './screens/Onboarding/HowTo';
import OnboardingPrivacy from './screens/Onboarding/Privacy';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import { Alert, AppState } from 'react-native';
import TestNavigator from './src/navigation/TestNavigator';

const Stack = createNativeStackNavigator();

// Ensure proper handling of sensor data and fallback logic
function runSensorTestAndCalibration() {
  return new Promise<{ mag: { x: number; y: number; z: number } | null; acc: { x: number; y: number; z: number } | null }>((resolve, reject) => {
    let magReady = false, accReady = false;
    let magData: { x: number; y: number; z: number } | null = null;
    let accData: { x: number; y: number; z: number } | null = null;

    const finish = () => {
      magSub.remove();
      accSub.remove();
      if (magData && accData) {
        if (__DEV__) {
          console.log('Sensor data collected successfully:', { mag: magData, acc: accData });
        }
        resolve({ mag: magData, acc: accData });
      } else {
        if (__DEV__) {
          console.error('Sensor data incomplete:', { mag: magData, acc: accData });
        }
        reject(new Error('Sensor data incomplete'));
      }
    };

    const magSub = Magnetometer.addListener((data) => {
      magData = data;
      magReady = true;
      if (magReady && accReady) finish();
    });

    const accSub = Accelerometer.addListener((data) => {
      accData = data;
      accReady = true;
      if (magReady && accReady) finish();
    });

    setTimeout(() => {
      if (!magReady || !accReady) finish();
    }, 2000);
  });
}

export default function App() {
  // Set default value for showOnboarding
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarded = async () => {
      const v = await AsyncStorage.getItem('onboarded');
      setShowOnboarding(v !== '1');
    };

    const init = async () => {
      try {
        const result = await runSensorTestAndCalibration();
        if (__DEV__) {
          console.log('Sensor calibration:', result);
        }
      } catch (error) {
        console.error('Sensor calibration failed', error);
        Alert.alert(
          'Sensor calibration failed',
          error instanceof Error ? error.message : String(error)
        );
      }
      checkOnboarded();
    };

    init();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkOnboarded();
      }
    });

    return () => subscription.remove();
  }, []);

  if (showOnboarding === null) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <EsmeraProvider>
          <NavigationContainer>
            {showOnboarding ? (
              <Stack.Navigator initialRouteName="OnboardingIntro" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="OnboardingIntro" component={OnboardingIntro} />
                <Stack.Screen name="OnboardingHowTo" component={OnboardingHowTo} />
                <Stack.Screen name="OnboardingPrivacy" component={OnboardingPrivacy} />
              </Stack.Navigator>
            ) : (
              <TestNavigator />
            )}
          </NavigationContainer>
        </EsmeraProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
