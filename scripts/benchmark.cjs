'use strict';
const fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks'),{gzipSync}=require('node:zlib');
const {load,board,tower,mob}=require('../tests/helpers.cjs');
const root=path.join(__dirname,'..'),baseline=process.argv[2];
function run(file,count){const g=load(file),b=board(g);b.phase='wave';b.hp=b.maxHp=1e9;b.wave=15;b.queue=[];
 for(let i=0;i<30;i++)tower(g,b,['gatling_0','cryo_0','canon_0','tesla_0'][i%4],15+(i%10)*4,20+Math.floor(i/10)*7);
 for(let i=0;i<count;i++){const m=mob(g,b);m.hp=m.maxHp=1e8;m.d=(i*1.713)%b.W.lanes[0].len;m.off=(i%3-1)*.1;}
 const times=[];for(let i=0;i<720;i++){const start=performance.now();g.Engine.step(b,1/30);b.ev.length=0;const dt=performance.now()-start;if(i>=120)times.push(dt);}
 times.sort((a,b)=>a-b);return {units:count,towers:30,ticks:600,meanMs:times.reduce((a,b)=>a+b,0)/times.length,p95Ms:times[Math.floor(times.length*.95)],remainingMobs:b.mobs.length};}
function payload(dir){const names=fs.readdirSync(path.join(dir,'dist/assets')).filter(f=>/^engine-part-\d+\.js$/.test(f)),parts=[fs.readFileSync(path.join(dir,'dist/index.html')),...names.map(n=>fs.readFileSync(path.join(dir,'dist/assets',n)))];return {rawInitialBytes:parts.reduce((s,b)=>s+b.length,0),gzipInitialBytes:parts.reduce((s,b)=>s+gzipSync(b).length,0),fragments:names.length};}
const results={scope:'Local Node simulation, 30 towers, 50/100/200 long-lived units, 120 warmup + 600 measured ticks. No rendering/network cost; not mobile FPS.',current:{payload:payload(root),runs:[50,100,200].map(n=>run(undefined,n))}};
if(baseline)results.baseline={payload:payload(baseline),runs:[50,100,200].map(n=>run(path.join(baseline,'simulation.js'),n))};
fs.writeFileSync(path.join(root,'verification/v3-benchmark.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
