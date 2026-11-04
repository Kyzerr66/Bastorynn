const test=require('node:test'),assert=require('node:assert/strict');
const {load,board,tower,mob}=require('./helpers.cjs');
const g=load();
test('all 16 maps and original catalogs remain available',()=>{assert.equal(g.MAPS.length,16);assert.equal(Object.keys(g.CARD).length,160);assert.equal(g.TroopData.starters.length,6);});
test('fracture consumes cold, adds bounded damage and cannot retrigger immediately',()=>{
 const b=board(g),m=mob(g,b);m.frz=2;g.Engine.hit(b,m,100,{kind:'shell',fam:'mortar',dt:'phys'});
 assert.equal(m.frz,0);assert.equal(b.tactical.reactions,1);const hp=m.hp;g.Engine.hit(b,m,100,{kind:'shell',fam:'mortar',dt:'phys'});assert.equal(b.tactical.reactions,1);assert.ok(Math.abs((hp-m.hp)-70)<1e-6);
});
test('thermal shock clears both statuses in both application orders',()=>{
 for(const mode of ['fire','cold']){const b=board(g),m=mob(g,b);m.burnT=mode==='cold'?2:0;m.frz=mode==='fire'?1:0;g.Engine.hit(b,m,20,mode==='fire'?{dt:'fire',fam:'flame'}:{dt:'energy',fam:'cryo'});assert.equal(m.frz,0);assert.equal(m.burnT,0);assert.equal(b.tactical.log[0].name,'Choc thermique');}
});
test('conductivity is bounded and respects internal cooldown',()=>{const b=board(g),m=mob(g,b);b.weather.kind='rain';g.Engine.hit(b,m,40,{kind:'chain',fam:'tesla',dt:'energy'});assert.equal(b.tactical.reactions,1);g.Engine.hit(b,m,40,{kind:'chain',fam:'tesla',dt:'energy'});assert.equal(b.tactical.reactions,1);});
test('corrosive clouds do not recursively create more reactions',()=>{const b=board(g),m=mob(g,b);m.acidT=2;g.Engine.hit(b,m,20,{fam:'flame',dt:'fire'});assert.equal(b.puddles.length,1);b.t+=2;g.Engine.hit(b,m,2,{dt:'acid',reaction:false});assert.equal(b.puddles.length,1);});
test('EMP rupture removes a bounded part of shields',()=>{const b=board(g),m=mob(g,b);m.shield=m.maxShield=200;g.Engine.hit(b,m,5,{fam:'emp',kind:'pulse',dt:'energy'});assert.equal(b.tactical.log[0].name,'Protection rompue');assert.equal(m.shield,150);});
test('specialization is validated once and does not mutate family statistics',()=>{
 const b=board(g),t=tower(g,b),raw=g.Engine.stats({...t}),before=g.FAM.canon.dmg;t.lvl=1;assert.equal(typeof g.Tactical.specialize(b,t,'precision'),'string');t.lvl=2;assert.equal(g.Tactical.specialize(b,t,'precision'),true);assert.ok(t.S.dmg>raw.dmg);assert.ok(t.S.rate>raw.rate);assert.equal(typeof g.Tactical.specialize(b,t,'barrage'),'string');assert.equal(g.FAM.canon.dmg,before);
});
test('temporary orders expire and cannot be chosen twice or in PvP',()=>{
 const b=board(g);b.wave=3;g.Tactical.onClear(b);assert.equal(g.Tactical.chooseOrder(b,'assault'),true);assert.equal(typeof g.Tactical.chooseOrder(b,'lookout'),'string');b.wave=6;g.Tactical.onStart(b);assert.equal(b.order,null);b.pvp=true;b.orderOffer={options:['assault']};assert.equal(typeof g.Tactical.chooseOrder(b,'assault'),'string');
});
test('weather schedule is repeatable and contains a 120 second clear opening',()=>{const b=board(g),c=board(g);for(let t=0;t<=1200;t+=13)assert.deepEqual(g.Tactical.weatherAt(b,t),g.Tactical.weatherAt(c,t));assert.equal(g.Tactical.weatherAt(b,119).kind,'clear');assert.equal(g.Tactical.weatherAt(b,120).phase,1);});
test('fog modifies actual tower range and a newly placed radar immediately compensates',()=>{const b=board(g),t=tower(g,b),r=t.S.range;b.weather.kind='fog';g.Engine.refresh(b);assert.ok(Math.abs(t.S.range-r*.88)<1e-9);tower(g,b,'radar_0',20.5,20);assert.equal(t.S.range,r);});

test('radar coverage with an active range order is independent of tower order',()=>{const b=board(g),t=tower(g,b),r=t.S.range,radar=tower(g,b,'radar_0');radar.x=t.x+radar.S.range*1.05;b.weather.kind='fog';b.order={id:'lookout',untilWave:2};g.Engine.refresh(b);assert.ok(Math.abs(t.S.range-r*1.12)<1e-9);b.towers.reverse();g.Engine.refresh(b);assert.ok(Math.abs(t.S.range-r*1.12)<1e-9);});

test('weather warning is emitted once, twelve seconds before transition',()=>{const b=board(g);b.t=108;g.Tactical.tick(b,1/30);g.Tactical.tick(b,1/30);assert.equal(b.ev.filter(e=>e.k==='weatherSoon').length,1);});

test('announced lightning has bounded damage and does not strike twice',()=>{const b=board(g),m=mob(g,b);b.phase='wave';let time=120;while(g.Tactical.weatherAt(b,time).kind!=='storm'&&time<3600)time+=120;assert.ok(time<3600);b.t=time+2;g.Tactical.tick(b,1/30);const warning=b.weather.warnings[0];assert.ok(warning);m.x=warning.x;m.y=warning.y;b.t=warning.at-.01;const hp=m.hp;g.Tactical.tick(b,1/30);assert.ok(m.hp<hp&&hp-m.hp<=35);const after=m.hp;g.Tactical.tick(b,1/30);assert.equal(m.hp,after);assert.ok(warning.hit);});
test('spatial candidates preserve all valid targets and original order',()=>{
 const b=board(g);for(let i=0;i<200;i++){const m=mob(g,b);m.x=(i*17)%70;m.y=(i*11)%70;}
 g.Tactical.index(b);const p={x:25,y:30},r=5,candidates=g.Tactical.candidates(b,p,r);const valid=b.mobs.filter(m=>Math.hypot(m.x-p.x,m.y-p.y)<=r+m.def.r*.6);assert.ok(valid.every(m=>candidates.includes(m)));assert.deepEqual(candidates.map(m=>b.mobs.indexOf(m)),candidates.map(m=>b.mobs.indexOf(m)).sort((a,b)=>a-b));assert.ok(candidates.length<200);
});
test('invalid placement and repair never spend energy',()=>{const b=board(g),before=b.energy;assert.equal(typeof g.Engine.place(b,0,{x:-1,y:0}),'string');b.phase='wave';b.hp=10;assert.equal(typeof g.Engine.repair(b),'string');assert.equal(b.energy,before);});
test('same seeded game gives the same result through multiple waves',()=>{
 function run(){const b=board(g);b.energy=10000;const L=b.W.lanes[0];for(let d=L.len*.5;d<L.len-3;d+=2){const p=g.MapGen.posAt(L,d);for(const sign of [-1,1]){const pos={x:p.x+Math.sin(p.ang)*sign*1.7,y:p.y-Math.cos(p.ang)*sign*1.7};if(!g.Engine.checkPlace(b,0,pos))g.Engine.place(b,0,pos);}}
 g.Engine.startWave(b);for(let i=0;i<1200;i++){g.Engine.step(b,1/30);b.ev.length=0;}return JSON.stringify({hp:b.hp,kills:b.kills,energy:b.energy,mobs:b.mobs.map(m=>[m.type,m.hp,m.x,m.y]),tactical:b.tactical,weather:b.weather});}
 assert.equal(run(),run());
});
test('all multiplayer formats accept authorized new commands and serialize new state',()=>{
 for(const [mode,n]of [['coop',2],['duel',2],['duo',4],['ffa',3],['ffa',4]]){const game=load();game.Frontier.begin({mode,map:'aube',diff:0,players:Array.from({length:n},(_,id)=>({id,name:'Test '+id,bot:false,defenses:['canon_0'],troops:game.TroopData.starters}))},0,true);const s=game.Frontier.session,b=game.SiegePvP.board(s,0);const t=tower(game,b);t.owner=0;assert.equal(game.Frontier.apply(1,{k:'specialize',d:{id:t.id,branch:'precision'}}),'Seul le propriétaire peut vendre ou changer le ciblage de cette défense.');assert.equal(game.Frontier.apply(0,{k:'specialize',d:{id:t.id,branch:'precision'}}),true);game.Frontier.step(1/30);const snap=game.Frontier.snapshot();assert.ok(snap.boards[0].weather);assert.ok(snap.boards[0].tactical);assert.equal(snap.boards[0].towers[0].branch,'precision');assert.ok(JSON.stringify(snap).length<100000);}
});
