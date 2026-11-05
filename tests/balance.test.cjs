const test=require('node:test'),assert=require('node:assert/strict');
const {load,board,tower,mob}=require('./helpers.cjs');
function setup(pvp=false,id='orbital_4'){
 const g=load(),b=board(g);b.pvp=pvp;b.phase='wave';b.queue=[];b.hp=1e9;
 const t=tower(g,b,id,10,10);t.lvl=1;g.Engine.refresh(b);
 function target(d){const m=mob(g,b);m.path=m.lane={len:100,water:[],segs:[{s:0,l:100,a:{x:10,y:10},b:{x:110,y:10},ang:0}]};m.off=0;m.d=d;m.x=10+d;m.y=10;m.spd=0;m.spawnT=0;m.hp=m.maxHp=100000;m.arm=0;return m;}
 return {g,b,t,target};
}
test('orbital targeting respects 10–40 m in PvE and PvP, including exact boundaries',()=>{
 for(const pvp of [false,true])for(const d of [0,9.999,10,25,40,40.001,65]){
  const {g,b,t,target}=setup(pvp);target(d);g.Engine.step(b,1/30);
  assert.equal(b.shots.length>0,d>=10&&d<=40,`${pvp?'PvP':'PvE'} ${d} m`);
  assert.equal(t.S.minRange,10);assert.equal(t.S.range,40);
 }
});
test('all long-range families have dead zones and caps after every buff',()=>{
 const g=load();for(const pvp of [false,true])for(const fam of ['orbital','mortar','sniper','rail','mlrs','obusier','siege','frostbattery','skyguard']){
  const id=Object.keys(g.CARD).filter(id=>g.CARD[id].fam===fam).at(-1),b=board(g);b.pvp=pvp;
  const t=tower(g,b,id);t.lvl=3;t.high=true;t.buff={range:10,dmg:0,rate:0,crit:0};t.branch='reach';t.S=g.Engine.stats(t);b.order={id:'lookout'};g.Tactical.boardStats(b,t);
  assert.ok(t.S.minRange>0&&t.S.minRange<t.S.range);assert.ok(t.S.range<=t.S.maxRange);assert.equal(g.Engine.inFiringBand(t,{x:t.x+t.S.minRange-.01,y:t.y,def:{r:1}}),false);
 }
});
test('one orbital volley damages each overlapping target only once in both modes',()=>{
 for(const pvp of [false,true]){const {g,b,t,target}=setup(pvp),targets=[target(20),target(20.05),target(20.1)];for(let i=0;i<30;i++)g.Engine.step(b,1/30);for(const m of targets)assert.ok(Math.abs((100000-m.hp)-t.S.dmg)<1e-7);}
});
test('orbital lock is cancelled if its target enters the dead zone before impact',()=>{
 const {g,b,target}=setup(),m=target(10.1);g.Engine.step(b,1/30);assert.equal(b.shots.length,1);m.d=9.9;for(let i=0;i<30;i++)g.Engine.step(b,1/30);assert.equal(m.hp,100000);assert.equal(b.shots.length,0);
});
test('defense drones take off, fire from the air and respect each nest’s capacity',()=>{
 for(const pvp of [false,true])for(const level of [1,2,3]){
  const {g,b,t,target}=setup(pvp,'drone_0'),m=target(2.5);
  t.lvl=level;g.Engine.refresh(b);
  let peak=0,shots=0;
  for(let tick=0;tick<120;tick++){
   g.Engine.step(b,1/30);
   peak=Math.max(peak,b.shots.filter(s=>s.kind==='drone').length);
   for(const e of b.ev.splice(0)){
    if(e.k!=='droneShot')continue;
    assert.ok(e.h>1&&e.x>t.x&&e.x<m.x);
    shots++;
   }
  }
  assert.equal(peak,level);
  assert.ok(shots>0&&m.hp<m.maxHp);
  b.towers.length=0;g.Engine.step(b,1/30);
  assert.equal(b.shots.filter(s=>s.kind==='drone'&&s.t>=0).length,0);
 }
});
test('Courroux damage is reduced by fifteen percent from the previous raw profile',()=>{
 const {t}=setup();assert.ok(Math.abs(t.S.dmg-150*2.4*.85)<1e-8);
});
test('acid reduces remaining armor temporarily and more gently in PvP',()=>{
 for(const pvp of [false,true]){const {g,b,target}=setup(pvp),m=target(20);m.arm=.5;m.acidT=.6;const before=m.hp;g.Engine.hit(b,m,100,{dt:'phys',reaction:false});assert.ok(Math.abs(before-m.hp-(pvp?54:57.5))<1e-8);m.acidT=0;const hp=m.hp;g.Engine.hit(b,m,100,{dt:'phys',reaction:false});assert.equal(hp-m.hp,50);assert.equal(m.arm,.5);}
});
test('mass corrosive reactions keep at most six active clouds, even within one tick',()=>{
 const {g,b,target}=setup();for(let i=0;i<500;i++){const m=target(20);m.burnT=2;g.Tactical.impact(b,m,5,{dt:'acid'});}
 assert.equal(b.puddles.filter(p=>p.t>0&&p.reactionCloud).length,g.Tactical.cfg.reactions.maxClouds);
 for(const m of b.mobs)m.burnT=0;
 g.Engine.step(b,1/30);assert.ok(b.puddles.length<=g.Tactical.cfg.reactions.maxClouds);
});
test('deck profiles and reactions match implemented effects for all cards and modes',()=>{
 const g=load();for(const pvp of [false,true])for(const id of Object.keys(g.CARD)){const p=g.DefenseGuide.profile(id,pvp);assert.ok(p.element);assert.ok(p.roles.length);assert.ok(g.DefenseGuide.detail(id,pvp).length>80);}
 const ready=g.DefenseGuide.comboState(['cryo_0','canon_0','flame_0','acid_0','tesla_0','emp_0']);assert.ok(ready.every(r=>r.ready));
 assert.equal(g.DefenseGuide.comboState(['gatling_0']).some(r=>r.ready),false);
 assert.ok(g.DefenseGuide.profile('orbital_4').roles.includes('armor'));
 assert.equal(g.DefenseGuide.profile('gatling_0').roles.includes('slow'),false);
});
test('spatial and identity caches preserve complete combat results against full scans',()=>{
 function run(indexed){const g=load(),b=board(g);if(!indexed){g.Tactical.candidates=B=>B.enemyPool||B.mobs;g.Tactical.target=(B,id)=>(B.enemyPool||B.mobs).find(m=>m.id===id&&!m.dead);}
  b.phase='wave';b.hp=1e9;const L=b.W.lanes[0];
  for(let i=0;i<16;i++){const p=g.MapGen.posAt(L,L.len*.2+i*.7);tower(g,b,['drone_4','tesla_4','acid_4','mine_4','plasma_4','mortar_4','laser_4','orbital_4'][i%8],p.x+1,p.y+1);}
  for(let i=0;i<160;i++){const m=mob(g,b,i%7?'leger':'apc');m.d=L.len*.15+(i%80)*.15;m.hp=m.maxHp=500;}
  for(let i=0;i<180;i++){g.Engine.step(b,1/30);b.ev.length=0;}
  return JSON.stringify({hp:b.hp,energy:b.energy,kills:b.kills,mobs:b.mobs.map(m=>[m.id,m.hp,m.x,m.y,m.burnT,m.acidT]),towers:b.towers.map(t=>[t.dmg,t.kills,t.aimId]),shots:b.shots.map(s=>[s.tg,s.x,s.y,s.t]),stats:b.stats});
 }assert.equal(run(true),run(false));
});
