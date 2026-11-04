const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
(async()=>{const server=spawn(process.execPath,['server.cjs'],{cwd:path.join(__dirname,'..'),windowsHide:true,env:{...process.env,HOST:'127.0.0.1',PORT:'8793',DATABASE_URL:'postgres://test:test@127.0.0.1:9/unavailable',DATABASE_TLS:'local-test'}});let browser;
try{
 await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(d.toString().includes('8793'))resolve()});server.on('error',reject);server.on('exit',c=>reject(Error('Server '+c)));});
 const base='http://127.0.0.1:8793',home=await fetch(base),health=await (await fetch(base+'/api/health')).json(),account=await fetch(base+'/api/account/me');
 if(home.status!==200||!health.ok||health.accounts||account.status!==503)throw Error('Database outage must preserve static game and health, reject account access');
 browser=await chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-swiftshader']});const runs=[];
 for(const kind of ['missing-models','stalled-models','missing-engine']){
  const page=await browser.newPage({viewport:{width:1280,height:800}});let stalled;
  if(kind==='missing-models')await page.route('**/citadelles-pack.js*',r=>r.abort());
  if(kind==='stalled-models')await page.route('**/citadelles-pack.js*',r=>{stalled=r;});
  if(kind==='missing-engine')await page.route('**/engine.js*',r=>r.abort());
  const start=Date.now();await page.goto(base,{waitUntil:'domcontentloaded'});
  if(kind==='missing-engine'){await page.locator('#load-retry').waitFor({state:'visible'});if(await page.evaluate(()=>BastorynnBoot.phase)!=='error')throw Error('Missing engine must offer retry');}
  else{await page.locator('#v4-loading').waitFor({state:'detached',timeout:18000});await page.getByRole('button',{name:'Jouer l’initiation'}).click();await page.waitForTimeout(400);const state=await page.evaluate(()=>({fallback:BastorynnBoot.fallback,phase:Battle.B?.phase}));if(!state.fallback||state.phase!=='build')throw Error('Fallback must remain playable');}
  runs.push({kind,elapsedMs:Date.now()-start,boot:await page.evaluate(()=>BastorynnBoot)});if(stalled)await stalled.abort().catch(()=>{});await page.close();
 }
 const report={databaseOutage:{home:home.status,health,account:account.status},runs};fs.writeFileSync(path.join(__dirname,'../verification/loading-failures.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exit(1)});
