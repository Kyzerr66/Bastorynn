const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-swiftshader']});try{
 const dir=path.join(__dirname,'../verification/screenshots');fs.mkdirSync(dir,{recursive:true});const report=[];
 for(const [device,width,height]of [['desktop',1440,900],['mobile',390,844],['landscape',844,390]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:device!=='desktop',hasTouch:device!=='desktop'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);await page.locator('#v4-loading').waitFor({state:'detached'});await page.waitForTimeout(900);
  await page.screenshot({path:dir+'/v4-welcome-'+device+'.png'});
  await page.getByRole('button',{name:'Jouer l’initiation'}).click();await page.waitForTimeout(1800);await page.evaluate(()=>Battle.B.paused=true);
  const battle=await page.evaluate(()=>({software:!!Battle.V.software,width:document.documentElement.scrollWidth,phase:Battle.B.phase,assets:CitadellesModels.stats()}));
  await page.screenshot({path:dir+'/v4-battle-'+device+'.png'});
  await page.evaluate(()=>{Battle.close();G.paused=false;render(true);closeScene(true);});await page.waitForTimeout(600);
  await page.screenshot({path:dir+'/v4-home-'+device+'.png',fullPage:device==='mobile'});
  for(const tab of ['arsenal','boutique','encheres','qg']){await page.locator('nav.tabs [data-t="'+tab+'"]').click();await page.waitForTimeout(300);if(tab==='arsenal'){const drawer=page.locator('.v4-presets');if(await drawer.getAttribute('open')!==null)throw Error('Deck drawer must start folded');await drawer.locator('summary').click();await page.locator('#presetName').waitFor({state:'visible'});await drawer.locator('summary').click();}await page.screenshot({path:dir+'/v4-'+tab+'-'+device+'.png'});}
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);report.push({device,battle,overflow,errors});if(errors.length||overflow)throw Error(JSON.stringify(report));await page.close();
 }
 fs.writeFileSync(path.join(__dirname,'../verification/v4-browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
