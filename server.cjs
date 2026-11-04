'use strict';
// Persistent identities; matches simulated by the server, independently of tabs.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm'),{performance}=require('node:perf_hooks');
const guards=require('./server-guards.cjs');
const PORT=Number(process.env.PORT)||Number(process.argv[process.argv.indexOf('--port')+1])||8787,HOST=process.env.HOST||'0.0.0.0';
const html=fs.readFileSync(path.join(__dirname,'dist','index.html')),simScript=new vm.Script(fs.readFileSync(path.join(__dirname,'simulation.js'),'utf8'));
const {gzipSync}=require('node:zlib'),staticCache=new Map();
function staticResponse(req,res,key,body,type,cache='no-cache'){
 let item=staticCache.get(key);if(!item){item={raw:body,gzip:gzipSync(body),hash:crypto.createHash('sha256').update(body).digest('hex').slice(0,20)};staticCache.set(key,item);}
 const gzip=String(req.headers['accept-encoding']||'').split(',').some(v=>/^\s*gzip\s*(?:;\s*q\s*=\s*(?!0(?:\.0*)?\s*$)[\d.]+)?\s*$/.test(v));
 const etag='"'+item.hash+(gzip?'-gzip':'')+'"',headers={'Content-Type':type,'Cache-Control':cache,'ETag':etag,'Vary':'Accept-Encoding','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 if(req.headers['if-none-match']===etag){res.writeHead(304,headers);return res.end();}
 const payload=gzip?item.gzip:item.raw;if(gzip)headers['Content-Encoding']='gzip';headers['Content-Length']=payload.length;
 res.writeHead(200,headers);res.end(payload);
}
const rooms=new Map(),maps=new Set(['aube','delta','fjord','dunes','caldeira','cite','emeraude','atoll','cimes','toundra','automne','canyon','baie','peninsule','glacier','rempart']);
const json=(res,status,data)=>accounts.defer(()=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));});
const publicRoom=r=>({code:r.code,config:r.config,capacity:r.capacity,started:r.started,completed:!!r.ended,authority:'server',players:r.players.map(p=>p?{id:p.id,name:p.name,friendId:p.accountId,ready:p.ready,connected:!!p.stream}:null)});
const accounts=require('./accounts.cjs')({json,rooms,publicRoom});
const capacityFor=c=>c.mode==='duel'?2:c.mode==='ffa'?(c.count===3?3:4):4;
const validConfig=c=>['coop','duel','duo','ffa'].includes(c.mode)&&maps.has(c.map)&&Number.isInteger(c.diff)&&c.diff>=0&&c.diff<=3&&(c.mode!=='ffa'||c.count==null||[3,4].includes(c.count));
const emit=(p,m)=>{if(!p?.stream)return;try{if(p.stream.writableLength>2e6){p.stream.end();p.stream=null;return;}p.stream.write(typeof m==='string'?m:'data: '+JSON.stringify(m)+'\n\n');}catch{p.stream=null;}};
const broadcast=(r,m)=>{const wire='data: '+JSON.stringify(m)+'\n\n';r.players.forEach(p=>emit(p,wire));},roster=r=>broadcast(r,{type:'room',room:publicRoom(r)});
function notifyRoom(r){accounts.roomChanged();accounts.notify(r.players.filter(Boolean).flatMap(p=>[p.accountId,...(accounts.user(p.accountId)?.friends||[])]));}
function player(id,u,loadout){return {id,...equipmentFor(u,loadout),name:u.name,accountId:u.id,token:crypto.randomBytes(24).toString('base64url'),ready:false,stream:null,last:Date.now(),rate:[]};}
function compactSeats(r){r.players=r.players.filter(Boolean);r.players.forEach((seat,i)=>{seat.id=i;emit(seat,{type:'seat',self:i});});}
// Seats index the running match, so a departed host is only replaced once the mission has ended.
function promoteCampaignHost(r){if(r.config.campaign&&r.ended&&!r.players[0]&&r.players.some(Boolean))compactSeats(r);}
function leaveRoom(r,p){p.stream?.end();if(!r.started&&p.id===0){closeRoom(r);return;}r.players[p.id]=null;if(!r.started)compactSeats(r);else promoteCampaignHost(r);if(r.game?.Frontier.session?.pvp){const b=r.game.Frontier.session.boards[p.id];if(b){b.hp=0;b.phase='lose';}}if(r.players.every(p=>!p))closeRoom(r);else{roster(r);notifyRoom(r);}accounts.notify([p.accountId,...(accounts.user(p.accountId)?.friends||[])]);}
function result(r,p){return {room:publicRoom(r),token:p.token,self:p.id};}
function closeRoom(r){broadcast(r,{type:'closed'});r.players.forEach(p=>p?.stream?.end());rooms.delete(r.code);notifyRoom(r);r.game=null;}
function auth(req,data){const u=accounts.requireUser(req),r=rooms.get(data.room);if(!r)throw Error('Salon introuvable');const p=r.players.find(p=>p&&p.token===data.token&&p.accountId===u.id);if(!p)throw Error('Accès refusé');r.last=p.last=Date.now();return {r,p};}
function loadGame(){const context=vm.createContext({console,Math,performance,Float32Array,Float64Array,Uint8Array,Int32Array,localStorage:{getItem:()=>null,setItem:()=>{}},addEventListener:()=>{},R3:{THREE:{}},Battle:{open:()=>{}},G:{},RM:true});simScript.runInContext(context,{timeout:3000});return context.OwnedGame;}
const catalog=loadGame();
const starters={defenses:['gatling_0','canon_0','cryo_0','mortar_0','missile_0','forge_0'],troops:catalog.TroopData.starters};
const allowedStarters={defenses:[...starters.defenses,'radar_0','tesla_0'],troops:starters.troops};
// The online save is the reference: a card earned seconds ago may not be saved yet, hence a retryable message.
function equipmentFor(u,value){const chosen=equipment(value);if(guards.findUnownedCards(chosen,u.progress,allowedStarters).length){const e=Error('Ce deck contient des cartes absentes de ta sauvegarde en ligne. Attends quelques secondes que ta progression soit enregistrée, puis réessaie.');e.status=409;throw e;}return chosen;}
function equipment(value){const v=value||starters;const result={};for(const [key,types]of [['defenses',catalog.CARD],['troops',catalog.UNIT]]){const a=v[key];if(!Array.isArray(a)||!a.length||a.length>6||new Set(a).size!==a.length||a.some(id=>typeof id!=='string'||!Object.hasOwn(types,id)))throw Error('Équipe de 1 à 6 cartes différentes dans chaque catégorie.');result[key]=[...a];}return result;}
function runtime(config){const game=loadGame();game.Frontier.begin(config,0,true);return game;}
function state(r){r.state=r.game.Frontier.snapshot();const ended=!!r.state.ended;const justEnded=ended&&!r.ended;if(justEnded){r.ended=true;r.last=Date.now();if(r.config.campaign){const b=r.game.Frontier.session.boards[0];accounts.recordCampaign(r.participants||[],{map:r.config.map,win:b.phase==='win',stars:r.game.Engine.stars(b),waves:b.phase==='win'?b.wave:Math.max(0,b.wave-1),diff:r.config.diff});}notifyRoom(r);}if(r.state.pvp)r.players.forEach(p=>p&&emit(p,{type:'state',data:guards.personalState(r.state,p.id)}));else broadcast(r,{type:'state',data:r.state});if(justEnded&&r.config.campaign&&!r.players[0]){promoteCampaignHost(r);roster(r);}}
const server=http.createServer(async(req,res)=>{try{guards.applySecurityHeaders(req,res);
 if(req.method==='GET'&&new URL(req.url,'http://localhost').pathname==='/api/health')return json(res,200,{ok:true,version:'bastorynn-4.0.1',accounts:accounts.status().connected,authority:'server',storage:accounts.status()});
 if(req.url.startsWith('/api/')&&accounts.status().type==='initializing'){res.setHeader('Retry-After','10');return json(res,503,{error:'Connexion aux sauvegardes indisponible. Le jeu solo reste accessible.'});}
 // The body is read before the account transaction: an interrupted upload must not hold the queue or the database lock.
 const body=req.method==='POST'&&req.url.startsWith('/api/')?await guards.readJsonBody(req):null;
 await ((req.url.startsWith('/api/')&&!/^\/api\/(send|events)(?:[?]|$)/.test(req.url))?accounts.transaction:async fn=>fn())(async()=>{
 const u=new URL(req.url,'http://localhost');
 if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{error:'Origine refusée'});
 if(req.headers['sec-fetch-site']==='cross-site'&&u.pathname.startsWith('/api/'))return json(res,403,{error:'Origine refusée'});
 if(req.method==='GET'&&u.pathname==='/api/health')return json(res,200,{ok:true,version:'bastorynn-3.2',accounts:true,authority:'server',storage:accounts.status()});
 // Serve the split browser engine from dist: without this, every /assets/ request is 404.
 if(req.method==='GET'&&/^\/assets\/(?:engine-part-\d{2}|audio-bank|citadelles-pack|blender-models|renderer|startup|engine)\.js$/.test(u.pathname)){
  const file=path.join(__dirname,'dist',u.pathname.slice(1));
  let body;
  try{body=staticCache.get(u.pathname)?.raw||fs.readFileSync(file);}catch{return json(res,404,{error:'Ressource du jeu introuvable'});}
  return staticResponse(req,res,u.pathname,body,'application/javascript; charset=utf-8','public, max-age=300');
 }

 if(req.method==='GET'&&(u.pathname==='/sitemap.xml'||u.pathname==='/robots.txt')){
  const file=path.join(__dirname,'dist',u.pathname.slice(1));
  const body=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':u.pathname.endsWith('.xml')?'application/xml; charset=utf-8':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
  return res.end(body);
 }
 // Google Search Console requires the original verification file at the site root.
 if(req.method==='GET'&&/^\/google[a-zA-Z0-9]+\.html$/.test(u.pathname)){
  const file=path.join(__dirname,'dist',u.pathname.slice(1));
  try{const body=fs.readFileSync(file);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});return res.end(body);}catch{return json(res,404,{error:'Fichier de validation introuvable'});}
 }
 if(req.method==='GET'&&await accounts.route(req,res,u,null))return;
 if(req.method==='GET'&&u.pathname==='/api/events'){
  const {r,p}=auth(req,{room:u.searchParams.get('room'),token:u.searchParams.get('token')});p.stream?.end();p.stream=res;res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(': connected\n\n');
  const heartbeat=setInterval(()=>{try{res.write(': heartbeat\n\n');p.last=Date.now();}catch{}},12000);res.on('close',()=>{clearInterval(heartbeat);if(p.stream===res){p.stream=null;p.last=Date.now();roster(r);}});emit(p,{type:'seat',self:p.id});roster(r);if(r.started){emit(p,{type:'start',config:r.startConfig});emit(p,{type:'state',data:guards.personalState(r.state||r.game.Frontier.snapshot(),p.id)});}return;
 }
 if(req.method==='POST'&&u.pathname.startsWith('/api/')){
  const data=body;if(await accounts.route(req,res,u,data))return;
  if(['/api/create','/api/join','/api/resume'].includes(u.pathname)){
   const user=accounts.requireUser(req),existing=accounts.activeRoom(user.id);
   if(u.pathname==='/api/resume'){if(!existing)return json(res,404,{error:'Aucune partie à reprendre.'});return json(res,200,result(existing,existing.players.find(p=>p?.accountId===user.id)));}
   if(existing){
    const same=u.pathname==='/api/join'&&existing.code===String(data.code).trim().toUpperCase();if(same)return json(res,200,result(existing,existing.players.find(p=>p?.accountId===user.id)));
    equipmentFor(user,data.loadout);if(u.pathname==='/api/create'){const c=data.config||{};if(!validConfig(c))return json(res,400,{error:'Configuration invalide'});if(rooms.size>=20&&(existing.started||existing.players.find(p=>p?.accountId===user.id)?.id!==0))return json(res,429,{error:'Trop de salons actifs'});}
    if(u.pathname==='/api/join'){const dest=rooms.get(String(data.code).trim().toUpperCase());if(!dest||dest.started||dest.players.filter(Boolean).length>=dest.capacity)return json(res,409,{error:'Cette invitation ne correspond plus à un salon disponible.'});}
    if(u.pathname==='/api/create'&&existing.started&&!existing.ended)return json(res,409,{error:'Quitte ta partie en cours avant de créer un nouveau salon.'});
    leaveRoom(existing,existing.players.find(p=>p?.accountId===user.id));
   }
   if(u.pathname==='/api/create'){
    if(rooms.size>=20)return json(res,429,{error:'Trop de salons actifs'});const c=data.config||{};if(!validConfig(c))return json(res,400,{error:'Configuration invalide'});
    let code;do{code=crypto.randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));const p=player(0,user,data.loadout),r={code,config:{mode:c.mode,campaign:c.mode==='coop'&&c.campaign===true,map:c.map,diff:c.diff,count:capacityFor(c)},capacity:capacityFor(c),players:[p],started:false,last:Date.now(),state:null};rooms.set(code,r);notifyRoom(r);return json(res,200,result(r,p));
   }
   const r=rooms.get(String(data.code).trim().toUpperCase());if(!r)return json(res,404,{error:'Salon introuvable ou invitation expirée.'});if(r.started)return json(res,409,{error:'La partie a déjà commencé. Attends le prochain salon.'});let i=r.players.findIndex(p=>p===null);if(i<0)i=r.players.length;if(i>=r.capacity)return json(res,409,{error:'Salon complet'});const p=player(i,user,data.loadout);r.players[i]=p;roster(r);notifyRoom(r);return json(res,200,result(r,p));
  }
  if(u.pathname==='/api/send'){
   const {r,p}=auth(req,data),type=data.type,msg=data.data||{};p.rate=p.rate.filter(t=>Date.now()-t<1000);if(p.rate.length>=30)return json(res,429,{error:'Trop d’actions'});p.rate.push(Date.now());
   if(type==='configure'){
    if(p.id!==0)throw Error('Seul l’hôte peut changer la carte du salon.');
    if(r.started)throw Error('La carte est verrouillée pendant la partie.');
    const next={...r.config,map:msg.map??r.config.map,diff:msg.diff??r.config.diff,count:r.config.mode==='ffa'?(msg.count??r.capacity):r.capacity};
    if(!validConfig(next))throw Error('Carte ou nombre de joueurs invalide.');
    const capacity=capacityFor(next);if(r.players.filter(Boolean).length>capacity)throw Error('Le salon contient trop de joueurs pour ce format.');
    r.config=next;r.capacity=capacity;for(const q of r.players)if(q)q.ready=false;roster(r);notifyRoom(r);
   }else if(type==='loadout'){if(r.started)throw Error('Le deck est verrouillé pour cette partie.');Object.assign(p,equipmentFor(accounts.user(p.accountId),msg));p.ready=false;roster(r);}
   else if(type==='ready'){if(r.started)throw Error('Partie déjà en cours');p.ready=!p.ready;roster(r);}
   else if(type==='start'){
    if(p.id!==0)throw Error('Seul l’hôte démarre la partie');if(r.started)throw Error('Partie déjà démarrée');const required=r.config.mode==='coop'?2:r.capacity;if(r.players.filter(Boolean).length<required)throw Error('Il faut '+required+' joueurs pour ce mode');if(r.players.some(p=>!p||!p.ready||!p.stream))throw Error('Tous les joueurs doivent être connectés et prêts');
    r.participants=r.players.map(p=>p.accountId);r.startConfig={...r.config,matchId:crypto.randomUUID(),authority:'server',players:r.players.map(p=>({id:p.id,name:p.name,bot:false,defenses:p.defenses,troops:p.troops}))};r.game=runtime(r.startConfig);r.started=true;r.simLast=performance.now();r.debt=0;r.lastState=0;broadcast(r,{type:'start',config:r.startConfig});state(r);notifyRoom(r);
   }else if(type==='campaignNext'){
    if(p.id!==0||!r.config.campaign||!r.ended)throw Error('Seul l’hôte prépare la mission suivante après la fin de la campagne.');
    const won=r.state?.boards?.[0]?.phase==='win',list=[...maps],index=list.indexOf(r.config.map);if(won&&index<list.length-1)r.config.map=list[index+1];
    r.config.diff=0;r.started=false;r.ended=false;r.state=null;r.game=null;r.startConfig=null;r.players=r.players.filter(Boolean);r.players.forEach((q,i)=>{q.id=i;q.ready=false;emit(q,{type:'seat',self:i});});roster(r);notifyRoom(r);
   }else if(type==='command'){
    if(!r.started)throw Error('Partie non démarrée');if(!['place','upgrade','sell','target','annex','repair','ability','wave','troop','troopUpgrade','speed','speedVote','specialize','order'].includes(msg.k)||!msg.d||typeof msg.d!=='object')throw Error('Action invalide');const answer=r.game.Frontier.apply(p.id,msg);if(typeof answer==='string')throw Error(answer);r.dirty=true;
   }else if(type==='leave'){
    leaveRoom(r,p);
   }else throw Error('Action réservée au serveur ou inconnue');return json(res,200,{ok:true});
  }
  return json(res,404,{error:'Route inconnue'});
 }
 if(req.method==='GET'&&(u.pathname==='/'||u.pathname==='/index.html'))return staticResponse(req,res,'html',html,'text/html; charset=utf-8');json(res,404,{error:'Introuvable'});
 });}catch(e){if(res.destroyed)return;if(!res.headersSent){res.removeHeader('Set-Cookie');json(res,e.status||400,{error:e.message});}else res.end();}});
// Delayed turns retain elapsed time; the displayed frame rate does not control combat.
setInterval(()=>{const now=performance.now();for(const r of rooms.values()){if(!r.game||r.ended)continue;try{r.debt=Math.min(.35,r.debt+(now-r.simLast)/1000);r.simLast=now;let n=0;while(r.debt>=1/30&&n++<12){r.game.Frontier.step(1/30);r.debt-=1/30;}if(now-r.lastState>=180){r.lastState=now;state(r);}}catch(e){console.error('Partie interrompue : '+e.message);closeRoom(r);}}},50).unref();
setInterval(()=>{const now=Date.now();for(const r of rooms.values())if(guards.shouldCloseRoom(r,now))closeRoom(r);},15000).unref();
accounts.ready.catch(e=>console.error('Sauvegardes indisponibles ; le solo reste accessible.',e.code||e.name));
server.listen(PORT,HOST,()=>{console.log('\nOWNED — Frontières | Serveur multijoueur\n');console.log('Sur ce PC : http://localhost:'+PORT);let interfaces={};try{interfaces=os.networkInterfaces();}catch{}for(const list of Object.values(interfaces))for(const n of list||[])if(n.family==='IPv4'&&!n.internal)console.log('Pour tes amis sur le même réseau : http://'+n.address+':'+PORT);if(process.argv.includes('--open')){const url='http://localhost:'+PORT,child=require('node:child_process').spawn(process.platform==='win32'?'cmd':process.platform==='darwin'?'open':'xdg-open',process.platform==='win32'?['/c','start','',url]:[url],{stdio:'ignore',detached:true});child.on('error',()=>{});child.unref();}console.log('\nGarde le serveur ouvert. Les parties continuent sans l’onglet hôte.\nComptes persistants : dossier data, ou DATA_DIR sur disque persistant.\nCtrl+C pour arrêter.\n');console.log('Sauvegardes : '+accounts.status().type); });
server.on('error',e=>{console.error('Impossible de démarrer : '+e.message);process.exitCode=1;});

for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{server.close();accounts.close().then(()=>process.exit(0));setTimeout(()=>process.exit(1),10000).unref();});
