import { useState, useEffect } from 'react';
import { LightSensor } from 'expo-sensors';

/** Stream ambient light sensor readings in lux */
export function useAmbientLight(interval:number = 1000){
  const [lux,setLux] = useState(0);
  useEffect(()=>{
    LightSensor.setUpdateInterval(interval);
    const sub = LightSensor.addListener((e:any)=>{
      setLux(e.illuminance ?? 0);
    });
    return ()=>sub.remove();
  },[interval]);
  return lux;
}
