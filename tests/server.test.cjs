'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),net=require('node:net');
const {load,board}=require('./helpers.cjs');
test('HTTP guards, deck ownership, authoritative coop, duel departure and final reconnect', {timeout:60000},async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'bastorynn-test-'));
 const probe=http.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 const server=spawn(process.execPath,['server.cjs'],{cwd:path.join(__dirname,'..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATABASE_URL:'',DATA_DIR:directory},windowsHide:true,stdio:['ignore','pipe','pipe']});
 const streams=[],base='http://127.0.0.1:'+port;
 try{
  await new Promise((resolve,reject)=>{server.stdout.on('data',b=>{if(b.toString().includes('localhost:'+port))resolve();});server.on('exit',c=>reject(Error('Test server exit '+c)));server.on('error',reject);});
  const health=await fetch(base+'/api/health');assert.equal((await health.json()).version,'bastorynn-3.1');
  assert.match(health.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  // An unfinished upload must not enter the global account transaction queue.
  const slow=net.connect(port,'127.0.0.1');slow.on('error',()=>{});await new Promise(r=>slow.once('connect',r));
  slow.write('POST /api/account/login HTTP/1.1\r\nHost: 127.0.0.1:'+port+'\r\nContent-Length: 1000\r\nContent-Type: application/json\r\n\r\n{"username":');
  try{await new Promise(r=>setTimeout(r,50));const concurrent=await fetch(base+'/api/account/me',{signal:AbortSignal.timeout(2000)});assert.equal(concurrent.status,200);await concurrent.json();}finally{slow.destroy();}
  const afterAbort=await fetch(base+'/api/health',{signal:AbortSignal.timeout(2000)});assert.equal(afterAbort.status,200);await afterAbort.json();
  const compressed=await fetch(base,{headers:{'accept-encoding':'gzip'}});assert.equal(compressed.headers.get('content-encoding'),'gzip');assert.ok((await compressed.text()).includes('ENGINE_SCRIPTS')===false);
  const same=await fetch(base,{headers:{'accept-encoding':'gzip','if-none-match':compressed.headers.get('etag')}});assert.equal(same.status,304);
  const plain=await fetch(base,{headers:{'accept-encoding':'gzip;q=0'}});assert.equal(plain.headers.get('content-encoding'),null);await plain.arrayBuffer();
  async function api(user,url,data){const res=await fetch(base+'/api/'+url,{method:'POST',headers:{'Content-Type':'application/json',...(user.cookie?{Cookie:user.cookie}:{})},body:JSON.stringify(data)});const cookie=res.headers.get('set-cookie');if(cookie)user.cookie=cookie.split(';')[0];return {status:res.status,data:await res.json()};}
  const users=[{},{}];for(let i=0;i<users.length;i++)assert.equal((await api(users[i],'account/register',{username:'qa_player_'+i,password:'Local_test_only_2026',name:'Test '+i})).status,200);
  const game=load(),troops=[...game.TroopData.starters],initialDeck=['gatling_0','cryo_0','canon_0','radar_0','mortar_0','tesla_0'];
  assert.equal((await api(users[0],'create',{config:{mode:'coop',map:'aube',diff:0},loadout:{defenses:['gatling_4'],troops}})).status,409);
  const a=await api(users[0],'create',{config:{mode:'coop',map:'aube',diff:0},loadout:{defenses:initialDeck,troops}});assert.equal(a.status,200);const b=await api(users[1],'join',{code:a.data.room.code});assert.equal(b.status,200);const seats=[a.data,b.data];
  async function stream(i){const controller=new AbortController(),res=await fetch(base+'/api/events?room='+seats[i].room.code+'&token='+seats[i].token,{headers:{Cookie:users[i].cookie},signal:controller.signal});assert.equal(res.status,200);const events=[],decoder=new TextDecoder();let buffer='';
   (async()=>{try{for await(const data of res.body){buffer+=decoder.decode(data,{stream:true});let pos;while((pos=buffer.indexOf('\n\n'))>=0){const chunk=buffer.slice(0,pos);buffer=buffer.slice(pos+2);if(chunk.startsWith('data: '))events.push(JSON.parse(chunk.slice(6)));}}}catch(e){if(e.name!=='AbortError')events.push({type:'stream-error',message:e.message});}})();
   const result={controller,events,async wait(predicate,timeout=10000){const until=Date.now()+timeout;while(Date.now()<until){const found=events.find(predicate);if(found)return found;await new Promise(r=>setTimeout(r,25));}throw Error('Expected SSE event missing');}};streams.push(result);return result;
  }
  const feed=[await stream(0),await stream(1)];
  const send=(i,type,data={})=>api(users[i],'send',{room:seats[i].room.code,token:seats[i].token,type,data});
  assert.equal((await send(0,'ready')).status,200);assert.equal((await send(1,'ready')).status,200);assert.equal((await send(0,'start')).status,200);
  const initial=await feed[0].wait(e=>e.type==='state');assert.equal(initial.data.boards[0].weather.kind,'clear');
  const g=load(),local=board(g);let position;
  for(let x=1;x<local.W.S&&!position;x++)for(let y=1;y<local.W.S;y++)if(!g.Engine.checkPlace(local,0,{x,y})){position={x,y};break;}
  assert.ok(position);assert.equal((await send(0,'command',{k:'place',d:{di:0,p:position}})).status,200);
  const placed=await feed[0].wait(e=>e.type==='state'&&e.data.boards[0].towers.length===1),id=placed.data.boards[0].towers[0].id;
  assert.equal((await send(0,'command',{k:'upgrade',d:{id}})).status,200);
  assert.equal((await send(1,'command',{k:'specialize',d:{id,branch:'precision'}})).status,400);
  assert.equal((await send(0,'command',{k:'specialize',d:{id,branch:'precision'}})).status,200);
  await feed[1].wait(e=>e.type==='state'&&e.data.boards[0].towers[0]?.branch==='precision');
  feed[1].controller.abort();const reconnected=await stream(1);await reconnected.wait(e=>e.type==='state'&&e.data.boards[0].towers[0]?.branch==='precision');
  assert.equal((await send(0,'command',{k:'order',d:{id:'assault'}})).status,400);
  assert.equal((await send(0,'command',{k:'wave',d:{}})).status,200);
  await reconnected.wait(e=>e.type==='state'&&e.data.boards[0].phase==='wave');
  assert.equal((await send(0,'leave')).status,200);assert.equal((await send(1,'leave')).status,200);
  for(const s of streams)s.controller.abort();
  const duel=await api(users[0],'create',{config:{mode:'duel',map:'aube',diff:0}});assert.equal(duel.status,200);seats[0]=duel.data;
  const opponent=await api(users[1],'join',{code:duel.data.room.code});assert.equal(opponent.status,200);seats[1]=opponent.data;
  const duelFeeds=[await stream(0),await stream(1)];
  for(let i=0;i<2;i++)assert.equal((await send(i,'ready')).status,200);
  assert.equal((await send(0,'start')).status,200);
  for(let i=0;i<2;i++){const snap=(await duelFeeds[i].wait(e=>e.type==='state')).data;assert.ok(Number.isFinite(snap.boards[i].energy));assert.equal(snap.boards[1-i].energy,undefined);assert.equal(snap.boards[1-i].wallets,undefined);}
  assert.equal((await send(0,'leave')).status,200);
  const final=await duelFeeds[1].wait(e=>e.type==='state'&&e.data.ended,30000);
  assert.equal(final.data.winner,1);assert.equal(final.data.boards[0].phase,'lose');
  const count=duelFeeds[1].events.filter(e=>e.type==='state').length;
  await new Promise(r=>setTimeout(r,650));assert.equal(duelFeeds[1].events.filter(e=>e.type==='state').length,count,'finished games stop broadcasting snapshots');
  duelFeeds[1].controller.abort();const finalReconnect=await stream(1);const saved=await finalReconnect.wait(e=>e.type==='state'&&e.data.ended);
  assert.equal(saved.data.clock,final.data.clock);assert.equal(saved.data.boards[0].energy,undefined);
  assert.equal((await send(1,'leave')).status,200);
  for(let i=2;i<4;i++){users.push({});assert.equal((await api(users[i],'account/register',{username:'qa_player_'+i,password:'Local_test_only_2026',name:'Test '+i})).status,200);}
  const duo=await api(users[0],'create',{config:{mode:'duo',map:'aube',diff:0}});assert.equal(duo.status,200);seats[0]=duo.data;
  for(let i=1;i<4;i++){const joined=await api(users[i],'join',{code:duo.data.room.code});assert.equal(joined.status,200);seats[i]=joined.data;}
  const duoFeeds=[];for(let i=0;i<4;i++){duoFeeds.push(await stream(i));assert.equal((await send(i,'ready')).status,200);}
  assert.equal((await send(0,'start')).status,200);
  for(let i=0;i<4;i++){const snap=(await duoFeeds[i].wait(e=>e.type==='state')).data;for(let j=0;j<4;j++){
    if(Math.floor(i/2)===Math.floor(j/2))assert.ok(Number.isFinite(snap.boards[j].energy),'allied budget is visible');
    else{assert.equal(snap.boards[j].energy,undefined);assert.equal(snap.boards[j].wallets,undefined);}
  }}
  for(const s of streams)assert.ok(!s.events.some(e=>e.type==='stream-error'));
 }finally{
  for(const s of streams)s.controller.abort();server.kill();await new Promise(r=>{if(server.exitCode!==null)return r();server.once('exit',r);setTimeout(r,12000).unref();});
  // Only this test's newly created, verified temporary directory may be removed.
  const target=path.resolve(directory);assert.equal(path.dirname(target),path.resolve(os.tmpdir()));assert.ok(path.basename(target).startsWith('bastorynn-test-'));fs.rmSync(target,{recursive:true,force:true});
 }
});
