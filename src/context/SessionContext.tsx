import React, {createContext, useContext, useMemo, useState} from 'react';
import { createEngine, Engine } from '../core/audio/evpEngine';
import { backupSession } from '../core/cloud/sync';
import * as FileSystem from 'expo-file-system';
type Session = { id: string; mode: string; startedAt: number; };
type Ctx = {
  engine: Engine; session: Session|null;
  start: (mode?:string)=>void; stop: ()=>void;
  addMessage: (m:{text:string; conf?:number; tag?:string})=>void;
  sync: ()=>Promise<void>;
};
const C = createContext<Ctx>(null as any);
export const useSession = () => useContext(C);
export function SessionProvider({children}:{children:React.ReactNode}){
  const [engine] = useState(()=>createEngine());
  const [session, setSession] = useState<Session|null>(null);
  function start(mode='Standard'){ setSession({ id:`sess_${Date.now()}`, mode, startedAt:Date.now() }); }
  function stop(){ setSession(null); }
  async function addMessage(m: { text: string; conf?: number; tag?: string }) {
    if (!session) return;
    try {
      const sessionPath = `${FileSystem.documentDirectory}sessions/${session.id}/`;
      await FileSystem.makeDirectoryAsync(sessionPath, { intermediates: true });
      const logFile = `${sessionPath}log.txt`;
      const logEntry = `${new Date().toISOString()} - ${m.text} [${m.conf || 0}] {${m.tag || ''}}\n`;
      await FileSystem.writeAsStringAsync(logFile, logEntry, { encoding: FileSystem.EncodingType.UTF8 });
    } catch (error) {
      console.error('Failed to write message to file:', error);
    }
  }
  async function sync(){ if(session) await backupSession(session); }
  const value = useMemo(()=>({engine, session, start, stop, addMessage, sync}),[engine, session]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
