import React, {useEffect, useRef} from 'react';
import { View, Animated } from 'react-native';
export default function Visualizer({level=0}:{level?:number}){
  const val = useRef(new Animated.Value(0)).current;
  useEffect(()=>{ Animated.timing(val,{toValue:level,duration:120,useNativeDriver:false}).start(); },[level]);
  const height = val.interpolate({inputRange:[0,1],outputRange:[6,48]});
  return (
    <View style={{flexDirection:'row',alignItems:'flex-end',gap:4, height:60}}>
      {Array.from({length:24}).map((_,i)=> <Animated.View key={i} style={{width:6,height,backgroundColor:'#00D9FF',opacity:0.6,borderRadius:4}}/>) }
    </View>
  );
}
