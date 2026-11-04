'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const target=path.resolve(process.argv[2]||path.join(__dirname,'..')),label=process.argv[3]||'after';
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Reprise du rendu'))errors.push(m.text());});
 await page.goto(pathToFileURL(path.join(target,'index.html')).href);
 await page.getByRole('button',{name:'Jouer l’initiation'}).click();
 await page.evaluate(()=>{Battle.B.paused=true;});await page.waitForTimeout(1500);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');
 const runs=[];
 for(const count of [200,600]){
 await page.evaluate(n=>{const b=Battle.B;b.mobs=[];b.ev=[];const L=b.W.lanes[0],p=MapGen.posAt(L,L.len*.4);for(let i=0;i<n;i++){const m=Engine.spawn(b,['leger','fantassin','lourd'][i%3],L,L.len*.4,true);m.x=p.x+(i%20)*.3-3;m.y=p.y+(Math.floor(i/20)%30)*.2-3;m.spawnT=0;m.hp=m.maxHp=100000;m.moving=true;}const c=Battle.V.cam;c.tx=p.x;c.tz=p.y;c.ttx=null;c.d=c.td=c.base*1.3;},count);
 await page.waitForTimeout(2500);
 await cdp.send('Profiler.start');
 const metrics=await page.evaluate(()=>new Promise(resolve=>{const intervals=[],draws=[],V=Battle.V,draw=V.frame;V.frame=function(...args){const t=performance.now();try{return draw.apply(this,args);}finally{draws.push(performance.now()-t);}};let last=performance.now(),start=last;function sample(now){intervals.push(now-last);last=now;if(now-start<4000)return requestAnimationFrame(sample);V.frame=draw;intervals.sort((a,b)=>a-b);draws.sort((a,b)=>a-b);resolve({frames:intervals.length,draws:draws.length,renderMeanMs:draws.reduce((a,b)=>a+b,0)/draws.length,renderP95Ms:draws[Math.floor(draws.length*.95)],frameMeanMs:intervals.reduce((a,b)=>a+b,0)/intervals.length,frameP95Ms:intervals[Math.floor(intervals.length*.95)],quality:RuntimePerformance.current,units:Battle.B.mobs.length,software:!!Battle.V.software});}requestAnimationFrame(sample);}));
 const {profile}=await cdp.send('Profiler.stop'),totals=new Map();for(const n of profile.nodes){if(n.hitCount)totals.set(n.callFrame.functionName||'(anonymous)',(totals.get(n.callFrame.functionName||'(anonymous)')||0)+n.hitCount);}
 runs.push({count,...metrics,hotspots:[...totals].sort((a,b)=>b[1]-a[1]).slice(0,18)});
 }
 if(errors.length)throw Error(errors.join('\n'));
 const result={label,scope:'Headless Chrome, 1280x800, software GPU environment, paused simulation with 200/600 visible units. Measures rendering and UI; not player hardware FPS.',runs,errors};
 fs.writeFileSync(path.join(__dirname,'../verification/stress-browser-'+label+'.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
