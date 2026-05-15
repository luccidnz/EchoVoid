import React, {createContext, useContext, useMemo, useState} from 'react';
import { createEngine, Engine } from '../core/audio/evpEngine';
import { backupSession } from '../core/cloud/sync';
import { addMessage as storeMessage } from '../core/logging/sessionStore';
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
      await storeMessage(session.id, { ...m, ts: Date.now() });
    } catch (error) {
      console.error('Failed to store message:', error);
    }
  }
  async function sync(){ if(session) await backupSession(session); }
  const value = useMemo(()=>({engine, session, start, stop, addMessage, sync}),[engine, session]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
