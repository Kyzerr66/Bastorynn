'use strict';
const {load,tower}=require('../tests/helpers.cjs'),{performance}=require('node:perf_hooks'),fs=require('node:fs'),path=require('node:path');
function run(n,file){const g=load(file);g.Frontier.begin({mode:'duo',map:'aube',diff:0,players:Array.from({length:4},(_,id)=>({id,name:'Stress '+id,bot:false,defenses:['gatling_0','cryo_0','canon_0'],troops:g.TroopData.starters}))},0,true);
 const s=g.Frontier.session;g.SiegePvP.start(s);const mid=s.world.S/2;
 for(const b of s.boards){b.hp=b.maxHp=1e9;for(let i=0;i<4;i++){const t=tower(g,b,['gatling_0','cryo_0'][i%2],mid+(i-2)*2,mid+(b.player-1.5)*3);t.owner=b.player;}}
 for(let i=0;i<n;i++){const owner=i%4,b=s.boards[owner],target=s.boards.find(q=>q.team!==b.team),type=i%5?'fantassin':'leger',w=g.TroopData.stats(type),x=mid-3,y=mid+(owner-1.5)*.9,L={id:0,len:100,kind:'g',water:[],segs:[{s:0,l:100,a:{x,y},b:{x:x+100,y},ang:0}]};const m=g.Engine.spawn(target,type,L,(i%30)*.2,true);Object.assign(m,{hp:1e8,maxHp:1e8,owner,faction:b.team,targetPlayer:target.player,weapon:w,def:g.SiegePvP.combatDefinition(type,w),off:0,spawnT:0,fireCd:0,shieldQuiet:0,kills:0,dmg:0});}
 const ms=[];for(let i=0;i<240;i++){const t=performance.now();g.SiegePvP.step(s,1/30);if(i>=60)ms.push(performance.now()-t);for(const b of s.boards)b.ev.length=0;}
 const fingerprint=require('node:crypto').createHash('sha256').update(JSON.stringify(s.boards.map(b=>({hp:b.hp,mobs:b.mobs.map(m=>[m.id,m.hp,m.x,m.y,m.dmg,m.kills,m.fireCd]),towers:b.towers.map(t=>[t.dmg,t.kills,t.aimId])})))).digest('hex');
 ms.sort((a,b)=>a-b);return {units:n,remaining:s.boards.reduce((n,b)=>n+b.mobs.length,0),towers:16,meanMs:ms.reduce((a,b)=>a+b,0)/ms.length,p95Ms:ms[Math.floor(ms.length*.95)],fingerprint};}
const result={scope:'Local Node 2v2 combat, dense artificial frontline, 16 towers, 60 warmup + 180 measured ticks. CPU only; no production network or GPU.',runs:[200,600].map(n=>run(n))};
if(process.argv[2]){result.before=[200,600].map(n=>run(n,path.resolve(process.argv[2],'simulation.js')));require('node:assert/strict').deepEqual(result.runs.map(r=>r.fingerprint),result.before.map(r=>r.fingerprint));result.identicalCombatResults=true;}
fs.writeFileSync(path.join(__dirname,'../verification/v32-pvp-stress.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
