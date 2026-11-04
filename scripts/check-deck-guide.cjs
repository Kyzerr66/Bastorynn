const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});try{
 const results=[];for(const [name,width,height]of [['desktop',1440,900],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},isMobile:name==='mobile',hasTouch:name==='mobile'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('node:url').pathToFileURL(path.join(__dirname,'../index.html')).href);await page.getByRole('button',{name:'Jouer l’initiation'}).click();await page.evaluate(()=>{Battle.close();G.paused=false;closeScene(true);tab('arsenal');});
 await page.locator('.deck-reactions summary').click();await page.locator('.deck-lab').scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(__dirname,'../verification/screenshots/v32-deck-'+name+'.png')});
 assert.equal(await page.locator('.reaction-row').count(),5);assert.ok(await page.locator('.defense-badges').count()>0);
 await page.getByRole('button',{name:'PvP',exact:true}).click();assert.equal(await page.getByRole('button',{name:'PvP',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByLabel('Rôle de défense',{exact:true}).selectOption('slow');
 const filtered=await page.locator('#catalogueGrid [data-sheet]').evaluateAll(es=>es.map(e=>e.dataset.sheet));assert.ok(filtered.length);assert.equal(await page.evaluate(ids=>ids.every(id=>DefenseGuide.profile(id,true).roles.includes('slow')),filtered),true);
 await page.evaluate(()=>cardSheet('orbital_4'));assert.ok((await page.locator('#scene .defense-detail').innerText()).includes('10 et 40 m'));
 await page.waitForTimeout(500);await page.screenshot({path:path.join(__dirname,'../verification/screenshots/v32-courroux-'+name+'.png')});
 const overflow=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth}));assert.equal(overflow.body,overflow.viewport);assert.deepEqual(errors,[]);results.push({name,filtered,overflow,errors});await page.close();
 }fs.writeFileSync(path.join(__dirname,'../verification/v32-deck-guide.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
