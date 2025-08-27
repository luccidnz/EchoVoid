import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../theme/theme';

export default function Toggle({label, active, onPress}:{label:string;active:boolean;onPress:()=>void}){
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical:8,
        paddingHorizontal:12,
        borderRadius:8,
        backgroundColor:active ? `${c.accent}22` : c.card,
        borderWidth:1,
        borderColor:active ? c.accent : c.line,
        marginRight:8,
      }}
    >
      <Text style={{color:active ? c.accent : c.text}}>{label}</Text>
    </Pressable>
  );
}
