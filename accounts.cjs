'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
module.exports=function accounts({json,rooms,publicRoom}){
 const dir=process.env.DATA_DIR||path.join(__dirname,'data'),file=path.join(dir,'accounts.json');
 fs.mkdirSync(dir,{recursive:true,mode:0o700});let db={version:1,users:[],sessions:[]};
 if(fs.existsSync(file)){db=JSON.parse(fs.readFileSync(file,'utf8'));if(db.version!==1||!Array.isArray(db.users)||!Array.isArray(db.sessions))throw Error('Fichier de comptes invalide : sauvegarde conservée.');}
 const presence=new Map(),limits=new Map(),inviteLimits=new Map();
 function save(){const temp=file+'.tmp';fs.writeFileSync(temp,JSON.stringify(db),{mode:0o600});fs.renameSync(temp,file);}
 function user(id){return db.users.find(u=>u.id===id);}
 function cookie(req){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('owned_session='))?.slice(14);if(!raw||raw.length>128)return null;const ses=db.sessions.find(s=>s.hash===hash(raw)&&s.expires>Date.now());return ses?user(ses.user):null;}
 function requireUser(req){const u=cookie(req);if(!u){const e=Error('Connecte-toi à ton compte pour jouer avec tes amis.');e.status=401;throw e;}return u;}
 const safe=u=>({id:u.id,username:u.username,name:u.name});
 function ended(r){return !!(r?.ended||r?.state?.ended||r?.game?.Frontier?.session?.ended);}
 function activeRoom(id){return [...rooms.values()].reverse().find(r=>!ended(r)&&r.players.some(p=>p?.accountId===id))||null;}
 function validInvite(i,recipient){const r=rooms.get(i.room),sender=user(i.from);return !!(i.expires>Date.now()&&r&&!r.started&&!ended(r)&&sender&&recipient.friends.includes(sender.id)&&r.players.some(p=>p?.accountId===sender.id)&&!r.players.some(p=>p?.accountId===recipient.id));}
 function roomChanged(){const changed=[];for(const u of db.users){const next=u.invites.filter(i=>validInvite(i,u));if(next.length!==u.invites.length){u.invites=next;changed.push(u.id);}}if(changed.length){save();notify(changed);}return changed;}

 function online(id){return !!presence.get(id)?.size;}
 function view(u){const r=activeRoom(u.id);return {user:safe(u),campaign:u.campaign||{},friends:u.friends.map(id=>user(id)).filter(Boolean).map(f=>({...safe(f),online:online(f.id),status:activeRoom(f.id)?.started?'En partie':online(f.id)?'En ligne':'Hors ligne'})),requests:u.requests.map(id=>user(id)).filter(Boolean).map(safe),sent:db.users.filter(f=>f.requests.includes(u.id)).map(safe),invitations:u.invites.filter(i=>validInvite(i,u)).map(i=>({...i,from:safe(user(i.from))})),activeRoom:r?{code:r.code,started:r.started,config:r.config}:null};}
 function emit(u){for(const stream of presence.get(u.id)||[]){try{if(stream.writableLength>1e6)stream.end();else stream.write('data: '+JSON.stringify({type:'social',data:view(u)})+'\n\n');}catch{}}}
 function notify(ids){for(const id of new Set(ids)){const u=user(id);if(u)emit(u);}}
 function onlineChanged(u){notify([u.id,...u.friends]);}
 function setSession(req,res,u,remember){const key=crypto.randomBytes(32).toString('base64url'),expires=Date.now()+(remember?30:1)*86400000;db.sessions=db.sessions.filter(s=>s.expires>Date.now());db.sessions.push({hash:hash(key),user:u.id,expires});if(db.sessions.filter(s=>s.user===u.id).length>12){const i=db.sessions.findIndex(s=>s.user===u.id);db.sessions.splice(i,1);}save();const secure=req.socket.encrypted||req.headers['x-forwarded-proto']==='https';res.setHeader('Set-Cookie',`owned_session=${key}; Path=/; HttpOnly; SameSite=Lax${remember?'; Max-Age=2592000':''}${secure?'; Secure':''}`);}
 function rate(req,label,max,period){const key=req.socket.remoteAddress+':'+label,now=Date.now(),r=limits.get(key)||{n:0,until:now+period};if(now>r.until){r.n=0;r.until=now+period;}limits.set(key,r);if(++r.n>max){const e=Error('Trop de tentatives. Réessaie dans quelques minutes.');e.status=429;throw e;}}
 async function route(req,res,u,data){const p=u.pathname;
  if(req.method==='GET'&&p==='/api/account/me'){const account=cookie(req);json(res,200,account?view(account):{user:null});return true;}
  if(req.method==='GET'&&p==='/api/social/events'){
   const account=requireUser(req);res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(': social\n\n');if(!presence.has(account.id))presence.set(account.id,new Set());presence.get(account.id).add(res);onlineChanged(account);
   const beat=setInterval(()=>{try{res.write(': heartbeat\n\n');}catch{}},15000);req.on('close',()=>{clearInterval(beat);presence.get(account.id)?.delete(res);onlineChanged(account);});return true;
  }
  if(req.method!=='POST'||!/^\/api\/(account|social)\//.test(p))return false;
  if(p==='/api/account/register'||p==='/api/account/login'){
   const username=String(data.username||'').trim().toLowerCase(),password=String(data.password||'');rate(req,'auth:'+username,18,900000);
   if(!/^[a-z0-9_-]{3,24}$/.test(username)||password.length<8||password.length>128)throw Error('Identifiant : 3–24 lettres/chiffres. Mot de passe : 8–128 caractères.');
   let account=db.users.find(a=>a.username===username);
   if(p.endsWith('/register')){rate(req,'register',12,3600000);if(account)throw Error('Cet identifiant est déjà utilisé.');if(db.users.length>=10000)throw Error('La capacité de comptes de ce serveur est atteinte.');const salt=crypto.randomBytes(16).toString('hex'),passwordHash=(await scrypt(password,salt,64)).toString('hex');
    if(db.users.some(a=>a.username===username))throw Error('Cet identifiant est déjà utilisé.');let id;do{id='OW-'+crypto.randomBytes(3).toString('hex').toUpperCase();}while(user(id));account={id,username,name:String(data.name||username).trim().slice(0,24)||username,salt,passwordHash,friends:[],requests:[],invites:[]};db.users.push(account);
   }else{const salt=account?.salt||'00000000000000000000000000000000',candidate=await scrypt(password,salt,64),expected=Buffer.from(account?.passwordHash||'00'.repeat(64),'hex');if(!account||expected.length!==candidate.length||!crypto.timingSafeEqual(candidate,expected))throw Error('Identifiant ou mot de passe incorrect.');}
   setSession(req,res,account,data.remember!==false);json(res,200,view(account));return true;
  }
  const account=requireUser(req);rate(req,'social:'+account.id,90,60000);
  if(p==='/api/account/logout'){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('owned_session='))?.slice(14);db.sessions=db.sessions.filter(s=>s.hash!==hash(raw||''));res.setHeader('Set-Cookie','owned_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');save();json(res,200,{ok:true});return true;}
  if(p==='/api/account/profile'){const name=String(data.name||'').trim();if(!name||name.length>24)throw Error('Choisis un pseudo de 1 à 24 caractères.');account.name=name;save();notify([account.id,...account.friends]);json(res,200,view(account));return true;}
  const target=user(String(data.id||'').trim().toUpperCase())||db.users.find(f=>f.username===String(data.id||'').trim().toLowerCase());
  if(p==='/api/social/request'){
   if(!target)throw Error('Joueur introuvable. Vérifie son identifiant de compte ou son code OW-.');if(target===account)throw Error('Tu ne peux pas t’ajouter toi-même.');if(account.friends.includes(target.id))throw Error('Vous êtes déjà amis.');if(account.friends.length>=100||target.friends.length>=100||target.requests.length>=100)throw Error('Liste d’amis pleine.');if(!target.requests.includes(account.id))target.requests.push(account.id);save();notify([account.id,target.id]);json(res,200,view(account));return true;
  }
  if(p==='/api/social/accept'||p==='/api/social/decline'){
   if(!target||!account.requests.includes(target.id))throw Error('Demande introuvable.');if(p.endsWith('/accept')){if(account.friends.length>=100||target.friends.length>=100)throw Error('Liste d’amis pleine.');if(!account.friends.includes(target.id))account.friends.push(target.id);if(!target.friends.includes(account.id))target.friends.push(account.id);target.requests=target.requests.filter(id=>id!==account.id);}account.requests=account.requests.filter(id=>id!==target.id);save();notify([account.id,target.id]);json(res,200,view(account));return true;
  }
  if(p==='/api/social/remove'){
   if(!target||!account.friends.includes(target.id))throw Error('Ami introuvable.');account.friends=account.friends.filter(id=>id!==target.id);target.friends=target.friends.filter(id=>id!==account.id);account.invites=account.invites.filter(i=>i.from!==target.id);target.invites=target.invites.filter(i=>i.from!==account.id);save();notify([account.id,target.id]);json(res,200,view(account));return true;
  }
  if(p==='/api/social/invite'){
   if(!target||!account.friends.includes(target.id))throw Error('Ajoute ce joueur et attends qu’il accepte ta demande.');const r=activeRoom(account.id);if(!r||r.started)throw Error('Crée un salon avant la partie pour inviter tes amis.');if(r.players.filter(Boolean).length>=r.capacity)throw Error('Le salon est complet.');if(r.players.some(p=>p?.accountId===target.id))throw Error('Cet ami est déjà dans le salon.');const key=account.id+':'+target.id+':'+r.code;if((inviteLimits.get(key)||0)>Date.now()-10000)throw Error('Invitation déjà envoyée.');inviteLimits.set(key,Date.now());target.invites=target.invites.filter(i=>validInvite(i,target)&&i.from!==account.id).slice(-19);target.invites.push({id:crypto.randomBytes(12).toString('hex'),from:account.id,room:r.code,mode:r.config.mode,map:r.config.map,expires:Date.now()+600000});save();emit(target);json(res,200,{ok:true});return true;
  }
  if(p==='/api/social/dismiss'){account.invites=account.invites.filter(i=>i.id!==data.invitation);save();emit(account);json(res,200,view(account));return true;}
  return false;
 }
 function recordCampaign(ids,result){for(const id of new Set(ids)){const u=user(id);if(!u)continue;u.campaign||={};const p=u.campaign[result.map]||={};p.best=Math.max(p.best||0,result.waves);if(result.win){p.win=true;p.stars=Math.max(p.stars||0,result.stars);p.d=Math.max(p.d||0,result.diff+1);}}save();notify(ids);}
 return {route,requireUser,cookie,view,safe,activeRoom,roomChanged,ended,notify,user,recordCampaign};
};
