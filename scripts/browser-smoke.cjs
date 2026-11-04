const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {spawn}=require('node:child_process'),fs=require('node:fs');
(async()=>{
 const server=spawn(process.execPath,['server.cjs'],{cwd:__dirname+'/..',env:{...process.env,DATABASE_URL:'',HOST:'127.0.0.1',PORT:'8790',DATA_DIR:require('node:os').tmpdir()+'/bastorynn-ui-test'},windowsHide:true});
 let browser;try{
 await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(d.toString().includes('8790'))resolve()});server.on('error',reject);server.on('exit',c=>reject(Error('Server '+c)));});
 browser=await chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-swiftshader']});
 const results=[];fs.mkdirSync(__dirname+'/../verification/screenshots',{recursive:true});
 for(const [name,width,height]of [['desktop',1440,900],['mobile',390,844],['landscape',844,390]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:name!=='desktop',hasTouch:name!=='desktop'});
  await page.addInitScript(()=>{window.__policyViolations=[];document.addEventListener('securitypolicyviolation',e=>window.__policyViolations.push({directive:e.effectiveDirective,blocked:e.blockedURI}));});const requests=[];page.on('request',r=>requests.push(r.url()));const errors=[];page.on('pageerror',e=>(errors.push(e.message),console.log('PAGE ERROR',e.stack)));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Reprise du rendu'))errors.push(m.text());});
  await page.goto('http://127.0.0.1:8790',{waitUntil:'load'});await page.waitForTimeout(800);
  await page.screenshot({path:__dirname+'/../verification/screenshots/v32-welcome-'+name+'.png'});
  const audioDeferred=!requests.some(u=>u.includes('audio-bank'));if(!audioDeferred)throw Error('Audio loaded before input');await page.getByRole('button',{name:'Jouer l’initiation'}).click();
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{Battle.B.paused=true;});
  const state=await page.evaluate(()=>({phase:Battle.B.phase,weather:Battle.B.weather,towers:Battle.B.towers.length,canvas:!!Battle.V,software:!!Battle.V.software,bodyWidth:document.documentElement.scrollWidth,width:innerWidth}));
  await page.screenshot({path:__dirname+'/../verification/screenshots/v32-battle-'+name+'.png'});
  await page.locator('.tactical-toggle').click();await page.screenshot({path:__dirname+'/../verification/screenshots/v32-intel-'+name+'.png'});
  const placement=await page.evaluate(()=>{
   const b=Battle.B;b.energy=1000;const L=b.W.lanes[0];
   for(let d=L.len-5;d>L.len*.5;d-=1){const p=MapGen.posAt(L,d);for(const sign of [-1,1]){const point={x:p.x+Math.sin(p.ang)*sign*1.7,y:p.y-Math.cos(p.ang)*sign*1.7};if(!Engine.checkPlace(b,0,point)){const t=Frontier.command('place',{di:0,p:point});Frontier.command('upgrade',{id:t.id});Battle.inspectTower(t.id);Battle.V.focus(t.x,t.y);return{id:t.id,x:t.x,y:t.y};}}}return null;
  });
  if(!placement)throw Error('No valid tower spot');
  await page.locator('[data-branch="precision"]').click();
  await page.waitForTimeout(500);await page.screenshot({path:__dirname+'/../verification/screenshots/v32-specialization-'+name+'.png'});
  await page.evaluate(()=>{Battle.cancelPlace();Battle.B.paused=false;Engine.startWave(Battle.B);});
  await page.waitForTimeout(1500);
  const combat=await page.evaluate(()=>({mobs:Battle.B.mobs.length,phase:Battle.B.phase,branch:Battle.B.towers[0].branch,frames:Battle.V.getPerformance?.()}));
  await page.evaluate(()=>{Battle.close();G.paused=false;render(true);closeScene(true);});await page.waitForTimeout(500);
  await page.screenshot({path:__dirname+'/../verification/screenshots/v32-home-'+name+'.png'});
  if(errors.length)throw Error(errors.join('; '));if(state.bodyWidth!==state.width)throw Error('Horizontal overflow');const policies=await page.evaluate(()=>window.__policyViolations);if(policies.length)throw Error(JSON.stringify(policies));await page.evaluate(()=>Social.open());await page.locator('#accountUsername').waitFor();await page.locator('#accountUsername').fill('bad!');const badName=await page.locator('#accountUsername').evaluate(e=>e.validity.patternMismatch);await page.locator('#accountUsername').fill('bon-joueur_7');const goodName=await page.locator('#accountUsername').evaluate(e=>e.checkValidity());if(!badName||!goodName)throw Error('Username HTML pattern failed');await page.locator('#socialClose').click();results.push({name,state,combat,audioDeferred,policies,usernamePattern:{badNameRejected:badName,goodNameAccepted:goodName},errors});await page.close();
 }
 const offline=await browser.newPage({viewport:{width:1280,height:800}});const offlineErrors=[];offline.on('pageerror',e=>offlineErrors.push(e.message));await offline.goto(require('node:url').pathToFileURL(__dirname+'/../index.html').href);await offline.getByRole('button',{name:'Jouer l’initiation'}).click();await offline.waitForTimeout(1000);const offlineState=await offline.evaluate(()=>({phase:Battle.B.phase,hasAudio:!!Object.keys(SND).length}));if(offlineErrors.length)throw Error(offlineErrors.join('; '));results.push({name:'file-offline',...offlineState,errors:offlineErrors});await offline.close();
 fs.writeFileSync(__dirname+'/../verification/v32-browser.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exit(1)});

