export type Channel = 'PINK'|'WHITE'|'AM'|'FM'|'AETHER';
export type SweepSettings = {
  rateHz:number; dwellMs:number; enabled:Record<Channel,boolean>;
  range:[number,number]; aether:{grain:number; mod:number};
};
export type Engine = {
  settings:SweepSettings;
  setSettings:(p:Partial<SweepSettings>)=>void;
  level$:(cb:(n:number)=>void)=>()=>void; // subscribe to mock amplitude 0..1
  /** update sweep settings based on ambient sensor reading */
  applyAmbient:(lux:number)=>void;
};
export const PRESETS = {
  Focused:{ rateHz:4, dwellMs:120, range:[1000,3000] as [number,number] },
  Broad:  { rateHz:2, dwellMs:200, range:[500,7000] as [number,number] },
  Random: { rateHz:3, dwellMs:180, range:[300,8000] as [number,number] }
};
export function createEngine():Engine{
  let settings:SweepSettings = { rateHz:3.0, dwellMs:180, enabled:{PINK:true,WHITE:false,AM:true,FM:true,AETHER:true}, range:[300,8000], aether:{grain:0.2, mod:0.5} };
  const subs = new Set<(n:number)=>void>();
  const id = setInterval(()=>{ const amp = 0.2 + Math.random()*0.8; subs.forEach(s=>s(amp)); }, 100);
  const setSettings = (p:Partial<SweepSettings>)=>{ settings = {...settings, ...p, range:p.range||settings.range, aether:{...settings.aether, ...(p.aether||{})} }; };
  return {
    get settings(){ return settings; },
    setSettings,
    level$(cb){ subs.add(cb); return ()=>subs.delete(cb); },
    applyAmbient(lux:number){
      const norm = Math.min(Math.max(lux,0),1000)/1000; // normalize 0..1
      const rateHz = 2 + norm*6; // 2..8 Hz sweep rate
      const range:[number,number] = [300, 3000 + norm*5000];
      setSettings({ rateHz, range });
    }
  };
}
