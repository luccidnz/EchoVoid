import React from 'react';
import { Text, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import Screen from './_layout/Screen';

export default function OnboardingScreen({onDone}:{onDone:()=>void}){
  return (
    <Screen style={{flex:1, backgroundColor:colors.bg, justifyContent:'center', alignItems:'center', padding:24}}>
      <Text style={{color:colors.text, marginBottom:20}}>Welcome to EchoVoid. Respect the wairua and proceed with care.</Text>
      <Pressable onPress={onDone} style={{padding:12,borderWidth:1,borderColor:colors.neon}}>
        <Text style={{color:colors.neon}}>Begin</Text>
      </Pressable>
    </Screen>
  );
}
