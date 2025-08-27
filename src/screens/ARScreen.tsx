import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '../theme/colors';
export default function ARScreen(){
  const [active,setActive] = useState(false);
  return (
  <View style={{flex:1, backgroundColor:colors.bg, alignItems:'center', justifyContent:'center'}}>
  <Text style={{color:colors.text, marginBottom:20}}>AR Mode {active?'Active':'Idle'}</Text>
  <Pressable onPress={()=>setActive(a=>!a)} style={{padding:12,borderWidth:1,borderColor:colors.neon}}>
  <Text style={{color:colors.neon}}>{active?'Stop':'Start'} AR</Text>
      </Pressable>
    </View>
  );
}
