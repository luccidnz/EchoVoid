import React from 'react';
import { Pressable, Text } from 'react-native';
export default function Toggle({label, active, onPress}:{label:string;active:boolean;onPress:()=>void}){
  return (
    <Pressable onPress={onPress} style={{paddingVertical:8,paddingHorizontal:12,borderRadius:8,backgroundColor:active?'#00D9FF22':'#171717',borderWidth:1,borderColor:active?'#00D9FF':'#262626',marginRight:8}}>
      <Text style={{color:active?'#00D9FF':'#F2F2F2'}}>{label}</Text>
    </Pressable>
  );
}
