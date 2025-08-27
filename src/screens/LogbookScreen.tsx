import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme/colors';
import Screen from './_layout/Screen';

export default function LogbookScreen(){
  return (
    <Screen style={{flex:1, backgroundColor:colors.bg, alignItems:'center', justifyContent:'center'}}>
      <Text style={{color:colors.text}}>Logbook (coming soon)</Text>
    </Screen>
  );
}
