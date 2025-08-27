import React from 'react';
import { View } from 'react-native';
export default function Meter({level=0, color='#00D9FF'}:{level?:number;color?:string}){
  return <View style={{height:10, backgroundColor:'#1a1a1a', borderRadius:8}}>
    <View style={{height:10, width:`${Math.min(100,Math.max(0,level*100))}%`, backgroundColor:color, borderRadius:8}}/>
  </View>;
}
