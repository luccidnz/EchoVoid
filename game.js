const TILE = 28;
const GRID_W = 30;
const GRID_H = 21;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  running: false,
  mode: 'story',
  worldIndex: 0,
  score: 0,
  lives: 3,
  combo: 1,
  relics: 0,
  charge: 0,
  overcharge: 0,
  gloveTime: 0,
  stopwatchTime: 0,
  armor: 0,
  introSeen: false,
};

const ui = {
  score: document.getElementById('score'),
  lives: document.getElementById('lives'),
  world: document.getElementById('world'),
  combo: document.getElementById('combo'),
  relics: document.getElementById('relics'),
  charge: document.getElementById('charge'),
  chargeBar: document.getElementById('charge-bar'),
  status: document.getElementById('status'),
};

const keys = {};
let worlds, enemiesDef, hazardsDef, itemsDef, scoringDef;
let world;
let maze = [];
let coins = new Set();
let pickups = [];
let hazards = { slime: new Set(), traps: [], portals: [], missiles: [] };
let enemyUnits = [];

const player = {
  x: 1,
  y: 1,
  dir: {x:1, y:0},
  nextDir: {x:1, y:0},
  moveProg: 0,
  speed: 5.2,
};

function tileKey(x,y){return `${x},${y}`;}
function parseKey(k){const [x,y]=k.split(',').map(Number);return {x,y};}

async function loadConfig(){
  [worlds, enemiesDef, hazardsDef, itemsDef, scoringDef] = await Promise.all([
    fetch('config/worlds.json').then(r=>r.json()),
    fetch('config/enemies.json').then(r=>r.json()),
    fetch('config/hazards.json').then(r=>r.json()),
    fetch('config/items.json').then(r=>r.json()),
    fetch('config/scoring.json').then(r=>r.json()),
  ]);
}

function makeMaze() {
  maze = Array.from({length: GRID_H}, (_,y)=>Array.from({length: GRID_W}, (_,x)=>
    x===0||y===0||x===GRID_W-1||y===GRID_H-1|| (x%4===0&&y>2&&y<GRID_H-3) ? 1:0
  ));
  for(let y=3;y<GRID_H-3;y+=5){for(let x=2;x<GRID_W-2;x++) maze[y][x]=0;}
  coins.clear();
  for(let y=1;y<GRID_H-1;y++) for(let x=1;x<GRID_W-1;x++) if(!maze[y][x]) coins.add(tileKey(x,y));
}

function initWorld(idx){
  world = worlds.worlds[idx % worlds.worlds.length];
  makeMaze();
  state.worldIndex = idx;
  player.x=1; player.y=1; player.dir={x:1,y:0}; player.nextDir={x:1,y:0};
  enemyUnits = world.enemyRoster.map((id,i)=>({
    ...enemiesDef.tiers.find(t=>t.id===id),
    x: GRID_W-2-(i%3), y: GRID_H-2-(Math.floor(i/3)*2),
    dir:{x:-1,y:0},
    moveProg:0,
    stunned:0
  }));
  hazards.slime.clear();
  hazards.traps = [];
  hazards.portals = [];
  hazards.missiles = [];

  if(world.introducedHazards.includes('slime_tile')){
    for(let i=3;i<GRID_W-3;i+=3) hazards.slime.add(tileKey(i, Math.floor(GRID_H/2)));
  }
  if(world.introducedHazards.includes('trap_panel')){
    hazards.traps = [{x:10,y:8,t:0},{x:20,y:14,t:1.2}];
  }
  if(world.introducedHazards.includes('portal_pair')){
    hazards.portals = [{x:2,y:GRID_H-3,to:{x:GRID_W-3,y:2}}, {x:GRID_W-3,y:2,to:{x:2,y:GRID_H-3}}];
  }
  if(world.introducedHazards.includes('carrot_missile_turret')){
    hazards.missiles = [{x:15,y:1,dir:{x:0,y:1},t:0}];
  }

  pickups = [];
  spawnPickups();
  ui.status.textContent = `World ${idx+1}: ${world.id.replaceAll('_',' ')}`;
}

function spawnPickups(){
  const pItems = itemsDef.powerUps;
  for(let i=0;i<4;i++) {
    const item = pItems[i];
    pickups.push({id:item.id,x:4+i*6,y:3+(i%2)*8,type:'power'});
  }
  pickups.push({id:'relic',x:GRID_W-2,y:1,type:'bonus'});
  pickups.push({id:'mask',x:GRID_W-3,y:GRID_H-3,type:'bonus'});
  pickups.push({id:'collar',x:2,y:GRID_H-3,type:'bonus'});
}

function canMove(x,y){return x>=0&&x<GRID_W&&y>=0&&y<GRID_H&&!maze[y][x];}
function stepEntity(ent, dt, speed){
  ent.moveProg += dt*speed;
  while(ent.moveProg>=1){
    ent.moveProg -=1;
    const nx=ent.x+ent.dir.x, ny=ent.y+ent.dir.y;
    if(canMove(nx,ny)){ent.x=nx; ent.y=ny;} else return;
  }
}

function updatePlayer(dt){
  const spMult = hazards.slime.has(tileKey(player.x,player.y)) ? 0.72 : 1;
  const boost = state.overcharge>0 ? 1.18 : 1;
  const carrotBoost = state.carrotTime>0 ? 1.3 : 1;
  const speed = player.speed*spMult*boost*carrotBoost;

  const ndx = player.nextDir.x, ndy = player.nextDir.y;
  if(canMove(player.x+ndx, player.y+ndy)) player.dir = {x:ndx, y:ndy};

  stepEntity(player, dt, speed);

  coins.delete(tileKey(player.x,player.y));
  state.score += scoringDef.base.coin;

  for(const p of hazards.portals){
    if(player.x===p.x&&player.y===p.y){ player.x=p.to.x; player.y=p.to.y; break; }
  }

  for(const t of hazards.traps){
    const active = (Math.sin((performance.now()/1000+t.t)*3)>0.5);
    if(active && player.x===t.x && player.y===t.y) hitPlayer();
  }

  for(const m of hazards.missiles){
    if(m.ax===undefined){m.ax=m.x; m.ay=m.y;}
    if(Math.round(m.ax)===player.x && Math.round(m.ay)===player.y) hitPlayer();
  }

  pickups = pickups.filter(p=>{
    if(p.x===player.x&&p.y===player.y){ applyPickup(p.id); return false; }
    return true;
  });

  if(state.charge>=100 && keys[' ']) { state.overcharge = 8; state.charge = 0; }
}

function applyPickup(id){
  const base = scoringDef.base[id] || 100;
  state.score += base * state.combo;
  if(id==='volt_carrot'){state.charge=Math.min(100,state.charge+35); state.carrotTime=5;}
  if(id==='bone'){state.armor=Math.min(2,state.armor+1);}
  if(id==='glove'){state.gloveTime=7;}
  if(id==='stopwatch'){state.stopwatchTime=4.5;}
  if(id==='relic'){state.relics++; state.score+=2500;}
  if(id==='mask'){state.score+=2000;}
  if(id==='collar'){state.score+=1400;}
}

function aiChoose(e){
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>canMove(e.x+d.x,e.y+d.y));
  if(!dirs.length) return;
  let target = {x:player.x,y:player.y};
  if(e.id==='t2_flanker') target = {x:player.x+player.dir.x*2, y:player.y+player.dir.y*2};
  if(e.id==='t3_ravager' && Math.random()<0.4) target = {x:player.x+(Math.random()*6-3)|0, y:player.y+((Math.random()*6-3)|0)};
  if(e.id==='t4_warden' && state.relics===0) target = {x:GRID_W-2,y:1};
  dirs.sort((a,b)=>dist(e.x+a.x,e.y+a.y,target)-dist(e.x+b.x,e.y+b.y,target));
  e.dir = dirs[0];
}
function dist(x,y,t){return Math.abs(x-t.x)+Math.abs(y-t.y);}

function updateEnemies(dt){
  for(const e of enemyUnits){
    e.stunned = Math.max(0,e.stunned-dt);
    if(e.stunned>0) continue;
    if(Math.random()<0.08) aiChoose(e);
    const stopwatchMul = state.stopwatchTime>0 ? 0.65 : 1;
    const speed = e.baseSpeed*stopwatchMul;
    stepEntity(e, dt, speed);
    if(e.x===player.x&&e.y===player.y){
      if(state.overcharge>0){
        if(e.id==='t4_warden'){ e.stunned = 1.2; state.score += 300; }
        else { e.x=GRID_W-2; e.y=GRID_H-2; state.score += e.scoreValue * state.combo; state.combo=Math.min(3,state.combo+0.1); }
      } else if(state.gloveTime>0){
        e.stunned = 1.5; state.score += 150;
      } else hitPlayer();
    }
  }
}

function hitPlayer(){
  if(state.invuln>0) return;
  if(state.armor>0){state.armor--; state.invuln=1.2; return;}
  state.lives--;
  state.combo = 1;
  state.invuln=2;
  player.x=1;player.y=1;
  if(state.lives<=0){
    state.running=false;
    ui.status.textContent = 'Game Over — press a mode to restart';
  }
}

function updateHazards(dt){
  for(const m of hazards.missiles){
    m.t += dt;
    if(m.t>2.8){m.t=0;m.ax=m.x;m.ay=m.y;}
    if(m.ax!==undefined){m.ay += m.dir.y*dt*9; if(m.ay>GRID_H-1){m.ax=m.x;m.ay=m.y;}}
  }
}

function updateTimers(dt){
  state.overcharge = Math.max(0,state.overcharge-dt);
  state.gloveTime = Math.max(0,state.gloveTime-dt);
  state.stopwatchTime = Math.max(0,state.stopwatchTime-dt);
  state.carrotTime = Math.max(0,state.carrotTime-dt);
  state.invuln = Math.max(0,state.invuln-dt);
}

function maybeAdvanceWorld(){
  if(coins.size===0){
    initWorld(state.worldIndex+1);
    if(state.mode==='quick' && state.worldIndex>1){ state.running=false; ui.status.textContent='Quick Play Complete!'; }
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#031023'; ctx.fillRect(0,0,canvas.width,canvas.height);

  const ox = (canvas.width - GRID_W*TILE)/2;
  const oy = (canvas.height - GRID_H*TILE)/2;

  // maze
  for(let y=0;y<GRID_H;y++) for(let x=0;x<GRID_W;x++){
    if(maze[y][x]){
      ctx.fillStyle = '#113250';
      ctx.fillRect(ox+x*TILE, oy+y*TILE, TILE, TILE);
    }
  }

  // coins
  ctx.fillStyle = '#8eebff';
  for(const key of coins){
    const {x,y}=parseKey(key);
    ctx.fillRect(ox+x*TILE+12, oy+y*TILE+12, 4, 4);
  }

  // hazards
  for(const s of hazards.slime){
    const {x,y}=parseKey(s);
    ctx.fillStyle = 'rgba(95,255,180,0.35)';
    ctx.fillRect(ox+x*TILE, oy+y*TILE, TILE, TILE);
  }
  for(const t of hazards.traps){
    const active = (Math.sin((performance.now()/1000+t.t)*3)>0.5);
    ctx.fillStyle = active ? '#ff4c7a' : '#6a2a3b';
    ctx.fillRect(ox+t.x*TILE+3, oy+t.y*TILE+3, TILE-6, TILE-6);
  }
  for(const p of hazards.portals){
    ctx.strokeStyle = '#4fd5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ox+p.x*TILE+14, oy+p.y*TILE+14, 10, 0, Math.PI*2);
    ctx.stroke();
  }
  for(const m of hazards.missiles){
    if(m.ax!==undefined){
      ctx.fillStyle = '#ff9945';
      ctx.fillRect(ox+m.ax*TILE+10, oy+m.ay*TILE+8, 8, 12);
    }
  }

  // pickups
  for(const p of pickups){
    const color = p.id==='volt_carrot' ? '#ff9633' : p.id==='bone' ? '#d9fbff' : p.id==='glove' ? '#ffd16e' : p.id==='stopwatch' ? '#8cc8ff' : p.id==='relic' ? '#b7f7ff' : p.id==='mask' ? '#ff6fc9' : '#7cffb2';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ox+p.x*TILE+14, oy+p.y*TILE+14, 8, 0, Math.PI*2);
    ctx.fill();
  }

  // enemies
  for(const e of enemyUnits){
    ctx.fillStyle = e.id==='t1_tracker' ? '#f46689' : e.id==='t2_flanker' ? '#f89f4c' : e.id==='t3_ravager' ? '#cc5eff' : '#ff354f';
    ctx.fillRect(ox+e.x*TILE+4, oy+e.y*TILE+4, TILE-8, TILE-8);
    if(e.id==='t4_warden'){ctx.strokeStyle='#fff';ctx.strokeRect(ox+e.x*TILE+6, oy+e.y*TILE+6, TILE-12, TILE-12);}
  }

  // player
  ctx.fillStyle = state.overcharge>0 ? '#8eebff' : '#4fd5ff';
  ctx.beginPath();
  ctx.arc(ox+player.x*TILE+14, oy+player.y*TILE+14, 10, 0, Math.PI*2);
  ctx.fill();
  if(state.overcharge>0){
    ctx.strokeStyle = '#d9fbff';
    ctx.beginPath();
    ctx.arc(ox+player.x*TILE+14, oy+player.y*TILE+14, 14 + 2*Math.sin(performance.now()/80), 0, Math.PI*2);
    ctx.stroke();
  }
}

function updateUI(){
  ui.score.textContent = Math.floor(state.score);
  ui.lives.textContent = `${state.lives} (${state.armor} armor)`;
  ui.world.textContent = (state.worldIndex+1).toString();
  ui.combo.textContent = `x${state.combo.toFixed(1)}`;
  ui.relics.textContent = state.relics;
  ui.charge.textContent = `${Math.floor(state.charge)}%`;
  ui.chargeBar.style.width = `${state.charge}%`;
}

let last = performance.now();
function frame(t){
  const dt = Math.min(0.033,(t-last)/1000);
  last=t;
  if(state.running){
    updateTimers(dt);
    updateHazards(dt);
    updatePlayer(dt);
    updateEnemies(dt);
    maybeAdvanceWorld();
    updateUI();
  }
  draw();
  requestAnimationFrame(frame);
}

function setDir(dx,dy){ player.nextDir = {x:dx,y:dy}; }
window.addEventListener('keydown', e=>{
  keys[e.key.toLowerCase()] = true;
  if(['arrowup','w'].includes(e.key.toLowerCase())) setDir(0,-1);
  if(['arrowdown','s'].includes(e.key.toLowerCase())) setDir(0,1);
  if(['arrowleft','a'].includes(e.key.toLowerCase())) setDir(-1,0);
  if(['arrowright','d'].includes(e.key.toLowerCase())) setDir(1,0);
});
window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });

const comicText = [
  'Volt was a black miniature schnauzer with too much curiosity for one world.',
  'A rune-storm tore open the night. Energy spilled into the streets.',
  'The surge struck his pawprint shadow and rewrote his instincts in lightning.',
  'Speed became power. Mischief became purpose. VOLT became VOLT-MAN.',
  'Now he raids maze-realms, hunting relic shards before nightmare hunters claim them.'
];

async function playIntro(){
  const overlay = document.getElementById('intro');
  const panel = document.getElementById('comic-panel');
  overlay.classList.remove('hidden');
  for(const line of comicText){
    panel.textContent = line;
    await new Promise(r=>setTimeout(r, 2000));
    if(overlay.classList.contains('hidden')) break;
  }
  overlay.classList.add('hidden');
}

function start(mode){
  state.mode = mode;
  state.running = true;
  state.worldIndex = 0;
  state.score = 0;
  state.lives = mode==='endless'?1:3;
  state.combo = 1;
  state.relics = 0;
  state.charge = 0;
  state.overcharge = 0;
  state.armor = 0;
  initWorld(0);
}

document.querySelectorAll('[data-mode]').forEach(btn=>btn.onclick=()=>start(btn.dataset.mode));
document.getElementById('show-how').onclick = ()=>document.getElementById('howto').classList.toggle('hidden');
document.getElementById('show-intro').onclick = ()=>playIntro();
document.getElementById('skip-intro').onclick = ()=>document.getElementById('intro').classList.add('hidden');

loadConfig().then(()=>{
  initWorld(0);
  updateUI();
  requestAnimationFrame(frame);
});
