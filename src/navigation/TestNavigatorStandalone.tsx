import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TestNavigator from './TestNavigator';

export default function TestNavigatorStandalone() {
  return (
    <NavigationContainer>
      <TestNavigator />
    </NavigationContainer>
  );
}
