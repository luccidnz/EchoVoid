import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

// Define route names and use them with useNavigation
type RootStackParamList = {
  ScreenA: undefined;
  ScreenB: undefined;
};

function ScreenA() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screen A</Text>
      <Button title="Go to Screen B" onPress={() => {
        console.log('Navigating to ScreenB');
        navigation.navigate('ScreenB');
      }} />
    </View>
  );
}

function ScreenB() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screen B</Text>
      <Button title="Go to Screen A" onPress={() => {
        console.log('Navigating to ScreenA');
        navigation.navigate('ScreenA');
      }} />
    </View>
  );
}

export default function TestNavigator() {
  return (
    <Stack.Navigator initialRouteName="ScreenA">
      <Stack.Screen name="ScreenA" component={ScreenA} />
      <Stack.Screen name="ScreenB" component={ScreenB} />
    </Stack.Navigator>
  );
}
