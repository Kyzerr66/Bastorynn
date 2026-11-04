'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module'),{Readable}=require('node:stream');
// Exercise the real server's lifecycle functions without production storage or listeners.
// The fixture controls the end of a mission; no debug endpoint is added to the game.
test('campaign promotes a departed host only after final state, then opens the next mission',async()=>{
 const root=path.join(__dirname,'..'),realRequire=createRequire(path.join(root,'server.cjs')),events=[],recorded=[],intervals=[];let handler;
 const accountStub={ready:new Promise(()=>{}),defer:fn=>fn(),transaction:fn=>fn(),route:()=>false,roomChanged(){},notify(){},user(){},recordCampaign:(...args)=>recorded.push(args),requireUser:()=>({id:'user1'})};
 const context=vm.createContext({console,Buffer,URL,process:{env:{},argv:['node','server.cjs'],once(){}},__dirname:root,
  require(name){if(name==='./accounts.cjs')return ()=>accountStub;if(name==='node:http')return {createServer:fn=>{handler=fn;return {on(){}};}};return realRequire(name);},
  setInterval(fn,ms){intervals.push({fn,ms});return {unref(){}};},setTimeout,clearTimeout});
 new vm.Script(fs.readFileSync(path.join(root,'server.cjs'),'utf8')+'\nglobalThis.fixture={runtime,rooms,state,leaveRoom};').runInContext(context);
 const {runtime,rooms,state,leaveRoom}=context.fixture;
 const stream=seat=>({writableLength:0,write:wire=>events.push({seat,...JSON.parse(wire.slice(6))}),end(){}});
 const config={mode:'coop',campaign:true,map:'aube',diff:0,count:4,players:[{id:0,name:'Host',bot:false},{id:1,name:'Guest',bot:false}]};
 const r={code:'TEST',config,capacity:4,players:[{id:0,accountId:'user0',rate:[],token:'a',stream:stream(0)},{id:1,accountId:'user1',rate:[],token:'b',stream:stream(1)}],started:true,participants:['user0','user1'],last:Date.now(),game:runtime(config)};
 rooms.set(r.code,r);leaveRoom(r,r.players[0]);assert.equal(r.players[0],null);assert.equal(r.players[1].id,1,'running match seat must not move');
 const b=r.game.Frontier.session.boards[0];b.phase='win';b.wave=b.maxWave;r.game.Frontier.session.ended=true;r.game.Frontier.session.winner=0;
 events.length=0;state(r);assert.equal(r.ended,true);assert.equal(r.players.length,1);assert.equal(r.players[0].accountId,'user1');assert.equal(r.players[0].id,0);assert.equal(recorded.length,1);
 assert.ok(events.findIndex(e=>e.type==='state'&&e.data.ended)<events.findIndex(e=>e.type==='seat'&&e.self===0));
 const count=events.length;intervals.find(i=>i.ms===50).fn();assert.equal(events.length,count,'ended room skips simulation and broadcasts');
 const req=Readable.from([Buffer.from(JSON.stringify({room:'TEST',token:'b',type:'campaignNext',data:{}}))]);Object.assign(req,{method:'POST',url:'/api/send',headers:{},socket:{}});
 const response={headersSent:false,destroyed:false,removeHeader(){},setHeader(){},writeHead(status){this.status=status;this.headersSent=true;},end(body){this.body=body;}};
 await handler(req,response);assert.equal(response.status,200,response.body);assert.equal(r.config.map,'delta');assert.equal(r.started,false);assert.equal(r.game,null);assert.equal(r.players[0].ready,false);
});
