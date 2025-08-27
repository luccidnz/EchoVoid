import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme/colors';
export default function AnomaliesScreen(){
  return (
  <View style={{flex:1, backgroundColor:colors.bg, alignItems:'center', justifyContent:'center'}}>
  <Text style={{color:colors.text}}>Anomalies (coming soon)</Text>
    </View>
  );
}
