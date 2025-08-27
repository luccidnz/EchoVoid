import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSession } from '../context/SessionContext';
import { colors } from '../theme/colors';
import Screen from './_layout/Screen';
import Meter from '../components/Meter';
import Visualizer from '../components/Visualizer';
import Toggle from '../components/Toggle';
import { speakEsmera } from '../core/audio/tts';
import { useTranscription } from '../core/audio/transcription';
import { detectAnomalies, setSensitivity } from '../core/anomaly/detector';

export default function SessionScreen({navigation}:any){
  const { engine, session, start, stop, sync } = useSession();
  const { text, conf, listening, supported, start:startASR, stop:stopASR } = useTranscription();
  const [amp,setAmp] = useState(0);
  const [mode,setMode] = useState<'Standard'|'Mana'|'Reverse'|'DreamLink'|'Shadow'|'CallAndResponse'>('Standard');
  const [hits,setHits] = useState<any[]>([]);

  useEffect(()=> engine.level$(setAmp), [engine]);
  useEffect(()=>{ const det = setInterval(()=>{
    const arr = detectAnomalies(new Float32Array(10));
    if(arr.length) setHits(h=>[...h,...arr]);
  },1000); return ()=>clearInterval(det); },[]);

  const onSpeak = ()=> speakEsmera(text || 'Welcome to EchoVoid.', !text);

  return (
    <Screen style={{flex:1, backgroundColor:colors.bg}}>
      <ScrollView contentContainerStyle={{padding:16, gap:16}}>
      <Text style={{color:colors.text, fontSize:18}}>Mode</Text>
      <View style={{flexDirection:'row', flexWrap:'wrap'}}>
        {(['Standard','Mana','Reverse','DreamLink','Shadow','CallAndResponse'] as const).map(m =>
          <Toggle key={m} label={m} active={mode===m} onPress={()=>setMode(m)} />
        )}
      </View>

  <Text style={{color:colors.text, fontSize:18}}>Sweep / Meter</Text>
      <Visualizer level={amp}/>
    <Meter level={amp} color={colors.neon}/>

  <Text style={{color:colors.text, fontSize:18, marginTop:8}}>Transcript</Text>
  <Text style={{color:colors.neon}}>{text || '…listening…'}</Text>
    <Text style={{color:colors.neon2, opacity:conf==null?0.5:1}}>confidence: {conf==null?'—':Math.round(conf*100)+'%'}</Text>

  <Text style={{color:colors.text, fontSize:18, marginTop:8}}>Anomalies</Text>
  {hits.map((h,i)=>(<Text key={i} style={{color:colors.neon2}}>{`hit @${Math.round(h.freq)}Hz (${Math.round(h.confidence*100)}%)`}</Text>))}

      <View style={{flexDirection:'row', gap:12, marginTop:8}}>
        {!session
          ? <Pressable onPress={()=>start(mode)} style={btn}><Text style={{ color: colors.neon, fontWeight: "bold" }}>Start</Text></Pressable>
          : <Pressable onPress={()=>stop()} style={btn}><Text style={{ color: colors.neon, fontWeight: "bold" }}>Stop</Text></Pressable>}
        {supported
          ? !listening
            ? <Pressable onPress={startASR} style={btn}><Text style={{ color: colors.neon, fontWeight: "bold" }}>Listen</Text></Pressable>
            : <Pressable onPress={stopASR} style={btn}><Text style={{ color: colors.neon, fontWeight: "bold" }}>Stop ASR</Text></Pressable>
          : <Pressable onPress={onSpeak} style={btn}><Text style={{ color: colors.neon, fontWeight: "bold" }}>Speak</Text></Pressable>}
      <Pressable onPress={()=>navigation.navigate('Logbook')} style={btnGhost}><Text style={{color:colors.text}}>Logbook</Text></Pressable>
      <Pressable onPress={sync} style={btnGhost}><Text style={{color:colors.text}}>Sync</Text></Pressable>
      </View>
      </ScrollView>
    </Screen>
  );
}
const btn = { backgroundColor:'#0e2f36', borderWidth:1, borderColor:colors.neon, paddingVertical:10, paddingHorizontal:14, borderRadius:10 };
const btnt = { color:colors.neon, fontWeight:"bold" };
const btnGhost = { backgroundColor:'#141414', borderWidth:1, borderColor:'#2a2a2a', paddingVertical:10, paddingHorizontal:14, borderRadius:10 };
