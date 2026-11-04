'use strict';
const {performance}=require('node:perf_hooks'),fs=require('node:fs'),path=require('node:path');
const {load,board,tower,mob}=require('../tests/helpers.cjs');
const baseline=process.argv[2];
function run(file,n,indexed=true){const g=load(file),b=board(g);if(!indexed){g.Tactical.candidates=B=>B.enemyPool||B.mobs;g.Tactical.target=(B,id)=>(B.enemyPool||B.mobs).find(m=>m.id===id&&!m.dead);}
 b.phase='wave';b.hp=1e9;const L=b.W.lanes[0];for(let i=0;i<36;i++){const p=g.MapGen.posAt(L,L.len*.15+(i%18)*1.4);tower(g,b,['drone_4','missile_4','tesla_4','acid_4','plasma_4','laser_4'][i%6],p.x+(i<18?1:-1),p.y+1);}
 for(let i=0;i<n;i++){const m=mob(g,b);m.hp=m.maxHp=1e8;m.d=L.len*.15+(i%160)*.15;m.spd=.01;}
 const ms=[];let maxShots=0;for(let i=0;i<600;i++){const start=performance.now();g.Engine.step(b,1/30);const cost=performance.now()-start;b.ev.length=0;maxShots=Math.max(maxShots,b.shots.length);if(i>=120)ms.push(cost);}
 ms.sort((a,b)=>a-b);return {units:n,remaining:b.mobs.length,towers:36,maxShots,meanMs:ms.reduce((a,b)=>a+b,0)/ms.length,p95Ms:ms[Math.floor(ms.length*.95)]};
}
const results=baseline==='--refresh'?JSON.parse(fs.readFileSync(path.join(__dirname,'../verification/v32-simulation-stress.json'),'utf8')):{scope:'Node CPU simulation only, 36 defenses, 200/600/1200 long-lived units, 30 ticks/s, 120 warmup + 480 measured ticks. Not player FPS.'};
results.current=[200,600,1200].map(n=>{const r=run(undefined,n);console.log('Current '+n+': '+r.meanMs.toFixed(2)+' ms/tick');return r;});
results.fullScan=[200,600,1200].map(n=>run(undefined,n,false));
if(baseline&&baseline!=='--refresh')results.before=[200,600,1200].map(n=>run(path.resolve(baseline,'simulation.js'),n));
fs.writeFileSync(path.join(__dirname,'../verification/v32-simulation-stress.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
