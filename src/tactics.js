// Shared rules: this exact module is compiled into browser and server bundles.
const Tactical = (() => {
  const cfg = /* TACTICAL_CONFIG */;
  const climates = {
    tempere: ['clear','rain','fog','storm','wind'], marais: ['clear','fog','rain','storm','wind'],
    neige: ['clear','snow','wind','fog'], toundra: ['clear','wind','snow','fog'], alpin: ['clear','snow','fog','wind'],
    desert: ['clear','wind','clear','wind'], volcan: ['clear','wind','fog','wind'], canyon: ['clear','wind','fog','wind'],
    tropical: ['clear','rain','storm','wind'], jungle: ['clear','rain','fog','storm'],
    urbain: ['clear','fog','rain','wind'], automne: ['clear','wind','rain','fog']
  };
  const weatherNames = {clear:'Temps clair',rain:'Pluie',fog:'Brouillard',storm:'Orage',snow:'Neige',wind:'Vent fort'};
  const weatherHelp = {clear:'Aucun modificateur.',rain:'Brûlures plus courtes ; électricité renforcée.',fog:'Portée de tir −12 %. Un radar proche compense.',storm:'Conductivité renforcée. Cercles de foudre annoncés 3 s avant impact.',snow:'Mobilité terrestre −8 % ; givre prolongé.',wind:'Les fumées se dissipent deux fois plus vite.'};
  const reactions = {fracture:['Fracture','#a9e8ff'],thermal:['Choc thermique','#ffb18d'],conductive:['Conductivité','#b4adff'],corrosive:['Vapeur corrosive','#b7e584'],rupture:['Protection rompue','#80bfff']};
  const branches = {
    precision:{name:'Perforation',desc:'Dégâts +25 %, pénétration +15 points ; délai entre tirs +10 %.',dmg:1.25,rate:1.1,pierce:.15},
    barrage:{name:'Barrage',desc:'Cadence +25 %, zone +15 % ; dégâts par tir −15 %.',dmg:.85,rate:.8,splash:1.15},
    control:{name:'Contrôle',desc:'Durée du ralentissement +35 %, portée +10 % ; dégâts −15 %.',dmg:.85,range:1.1,slow:1.35},
    reach:{name:'Vigie',desc:'Portée +20 % ; délai entre tirs +12 %.',range:1.2,rate:1.12},
    support:{name:'Amplification',desc:'Soutien et revenus +20 % ; couverture −10 %.',support:1.2,range:.9}
  };
  const orders = {
    assault:{name:'Tir soutenu',desc:'Cadence +12 % pendant 2 vagues.',rate:1/1.12},
    lookout:{name:'Observation',desc:'Portée +12 % pendant 2 vagues.',range:1.12},
    recovery:{name:'Réactivité',desc:'Recharge des pouvoirs accélérée de 25 % pendant 2 vagues.',ability:1.25}
  };
  function init(B) {
    B.weather={kind:'clear',next:'clear',phase:-1,endsAt:cfg.weather.phaseSeconds,warnings:[],strikeCycle:-1};
    B.tactical={reactions:0,log:[],leaked:{},orders:0};
    B.orderOffer=null;B.order=null;
  }
  function weatherAt(B,time=B.t) {
    const list=climates[B.P.biome]||climates.tempere, phase=Math.floor(time/cfg.weather.phaseSeconds);
    // Clear opening, then a seed-dependent rotation. No mutable RNG state.
    const kindAt=n=>n===0?'clear':list[1+((n-1+(B.P.seed%Math.max(1,list.length-1)))%(list.length-1))];
    return {phase,kind:kindAt(phase),next:kindAt(phase+1),endsAt:(phase+1)*cfg.weather.phaseSeconds};
  }
  function tick(B,dt) {
    if(!B.weather)init(B);
    const w=B.weather,next=weatherAt(B);
    if(w.phase!==next.phase){Object.assign(w,next);w.warnings=[];w.strikeCycle=-1;B.ev.push({k:'weather',name:weatherNames[w.kind]});Engine.refresh(B);}
    if(w.endsAt-B.t<=cfg.weather.noticeSeconds&&w.noticePhase!==w.phase){w.noticePhase=w.phase;B.ev.push({k:'weatherSoon',name:weatherNames[w.next]});}
    if(w.kind==='storm'&&B.phase==='wave'){
      const cycle=Math.floor(B.t/cfg.weather.strikeEvery),impact=(cycle+1)*cfg.weather.strikeEvery;
      if(w.strikeCycle!==cycle){
        w.strikeCycle=cycle;
        const sites=B.pvp?(B.W.bases||[B.W.cit]).map(p=>{const dx=B.W.S/2-p.x,dy=B.W.S/2-p.y,len=Math.hypot(dx,dy)||1;return {x:p.x+dx/len*6,y:p.y+dy/len*6};}):Engine.activeLanes(B).map(l=>MapGen.posAt(l,l.len*(.4+(cycle%3)*.12)));
        w.warnings=sites.map(p=>({x:p.x,y:p.y,r:cfg.weather.strikeRadius,at:impact,hit:false}));
      }
      for(const q of w.warnings)if(!q.hit&&B.t+dt>=q.at){
        q.hit=true;for(const m of B.mobs)if(!m.dead&&Math.hypot(m.x-q.x,m.y-q.y)<=q.r)Engine.hit(B,m,Math.min(B.pvp?18:35,m.maxHp*.06),{dt:'energy',reaction:false,ev:false});
        B.ev.push({k:'lightning',x:q.x,y:q.y,r:q.r});
      }
    }else w.warnings=[];
  }
  function wet(B,m){return m.onWater||['rain','storm'].includes(B.weather?.kind);}
  function cold(S){return ['cryo','frostbattery'].includes(S.fam)||!!S.freeze;}
  function event(B,m,key){
    const [name,color]=reactions[key];m.reactionReady=B.t+cfg.reactions.cooldown;
    B.tactical.reactions++;B.tactical.log.push({name,at:B.t});if(B.tactical.log.length>5)B.tactical.log.shift();
    B.ev.push({k:'reaction',name,key,x:m.x,y:m.y,c:color});
  }
  function impact(B,m,dmg,S){
    if(S.reaction===false||dmg<=0||!B.tactical)return 0;
    const fire=S.dt==='fire'&&S.fam, chilled=m.frz>0||(m.chillUntil||0)>B.t;
    if((m.reactionReady||0)>B.t)return 0;
    let key=null,extra=0;
    if((fire&&chilled)||(cold(S)&&m.burnT>0)){
      key='thermal';extra=Math.min(dmg*.3,m.maxHp*.05);m.frz=0;m.slowT=0;m.chillUntil=0;m.burnT=0;m._thermalAt=B.t;
    }else if(chilled&&(['shell','missile','mine'].includes(S.kind)||S.fam==='canon')){
      key='fracture';extra=Math.min(dmg*(m.arm>.1?.3:.15),m.maxHp*.05);m.frz=0;m.chillUntil=0;m.slowT=0;
    }else if((fire&&m.acidT>0)||(S.dt==='acid'&&m.burnT>0)){
      key='corrosive';
      // Bounded independent cloud. It cannot trigger reactions of its own.
      B.puddles.push({x:m.x,y:m.y,r:.75,t:1.4,T:1.4,dps:B.pvp?2:5,born:B.t,tw:S.tw,mark:0,reactionCloud:true});
      const clouds=B.puddles.filter(p=>p.reactionCloud);if(clouds.length>cfg.reactions.maxClouds)clouds[0].t=0;
    }else if(S.kind==='chain'&&wet(B,m)){
      key='conductive';extra=dmg*.12;
    }else if(m.shield>0&&['pulse','emp','sonic'].includes(S.fam)){
      key='rupture';m.shield=Math.max(0,m.shield-Math.min(m.maxShield*.2,B.pvp?18:45));
    }
    if(key){event(B,m,key);return Math.min(extra,B.pvp?cfg.reactions.pvpBonusCap:cfg.reactions.bonusCap);}
    return 0;
  }
  function effect(B,m,S){
    if(cold(S)&&!m.def.noSlow&&m._thermalAt!==B.t)m.chillUntil=B.t+(B.weather?.kind==='snow'?2.4:2);
  }
  function branchOptions(tw){const kind=FAM[CARD[tw.card].fam].kind;
    if(['eco','aura','radar'].includes(kind))return ['reach','support'];
    if(cold(tw.S||{fam:CARD[tw.card].fam}))return ['control','barrage'];
    return ['precision','barrage'];
  }
  function specialize(B,tw,id){
    if(!tw||!B.towers.includes(tw))return 'Défense introuvable';
    if(tw.lvl<2)return 'Améliore cette défense au niveau 2.';
    if(tw.branch)return 'Spécialisation déjà choisie pour cette défense.';
    if(!branchOptions(tw).includes(id))return 'Spécialisation invalide';
    tw.branch=id;Engine.refresh(B);B.ev.push({k:'upgrade',x:tw.x,y:tw.y,tw:tw.id,c:'#ecc779'});return true;
  }
  function stats(S,tw){const q=branches[tw.branch];if(!q)return S;
    // Smaller modifiers in competitive games; meaningful tradeoffs are retained.
    const factor=v=>tw.pvp?1+(v-1)*.55:v;
    if(q.dmg)S.dmg*=factor(q.dmg);if(q.rate)S.rate*=factor(q.rate);if(q.range)S.range*=factor(q.range);
    if(q.pierce)S.pierce=Math.min(.85,S.pierce+q.pierce*(tw.pvp?.55:1));
    if(q.splash)S.splash*=factor(q.splash);if(q.slow&&S.slow)S.slow={...S.slow,d:S.slow.d*factor(q.slow)};
    if(q.support){for(const key of ['income','buffRate','buffDmg','buffRange','buffCrit','mark'])if(Number.isFinite(S[key]))S[key]*=factor(q.support);S.income=Math.round(S.income||0);}
    return S;
  }
  function boardStats(B,tw){
    const S=tw.S;
    if(B.weather?.kind==='fog'&&!['eco','radar','aura'].includes(S.kind)){
      const radarOrder=!B.pvp&&B.order?orders[B.order.id]?.range||1:1;
      const covered=B.towers.some(t=>t.S?.kind==='radar'&&t.jam<=0&&Math.hypot(t.x-tw.x,t.y-tw.y)<=Engine.stats(t).range*radarOrder);
      if(!covered)S.range*=cfg.weather.fogRange;
    }
    if(B.order&&!B.pvp){const o=orders[B.order.id];if(o?.rate)S.rate*=o.rate;if(o?.range)S.range*=o.range;}
  }
  function onStart(B){if(B.order&&B.wave>B.order.untilWave){B.order=null;Engine.refresh(B);}B.orderOffer=null;}
  function onClear(B){if(!B.pvp&&B.wave>0&&B.wave%3===0&&(B.endless||B.wave<B.maxWave))B.orderOffer={wave:B.wave,options:Object.keys(orders)};}
  function chooseOrder(B,id){
    if(B.pvp||B.phase!=='build'||!B.orderOffer||!B.orderOffer.options.includes(id))return 'Ordre indisponible';
    B.order={id,untilWave:B.wave+2};B.orderOffer=null;B.tactical.orders++;Engine.refresh(B);return true;
  }
  function leaked(B,m){if(!B.tactical)return;B.tactical.leaked[m.type]=(B.tactical.leaked[m.type]||0)+m.def.dmg;}
  function advice(counts){
    let air=0,armor=0,stealth=0,swarm=0,shield=0;
    for(const [id,n] of Object.entries(counts||{})){const d=UNIT[id];if(!d)continue;if(d.mv==='a')air+=n;if(d.arm>=.25)armor+=n;if(d.stealth||d.sub)stealth+=n;if(d.shield)shield+=n;if(d.t==='inf')swarm+=n;}
    const lines=[];if(air)lines.push({key:'air',n:air,label:'Aériens',tip:'Mitrailleuse, missiles ou DCA : les mortiers ne les touchent pas.'});
    if(armor)lines.push({key:'armor',n:armor,label:'Blindés',tip:'Canon perforant, antichar ou cryo suivi d’un impact explosif.'});
    if(stealth)lines.push({key:'stealth',n:stealth,label:'Camouflage',tip:'Place un radar pour révéler les ennemis cachés.'});
    if(shield)lines.push({key:'shield',n:shield,label:'Boucliers',tip:'Tesla et IEM : l’électricité est efficace contre leurs protections.'});
    if(swarm||!lines.length)lines.push({key:'swarm',n:swarm,label:'Infanterie',tip:'Mitrailleuse et mortier couvrent les groupes ; le cryo les retient.'});
    return lines;
  }
  const grids=new WeakMap();
  function index(B){const pool=B.enemyPool||B.mobs;if(pool.length<32){grids.delete(B);return;}const cells=new Map(),order=new Map();let radius=0;
    pool.forEach((m,i)=>{if(m.dead)return;order.set(m,i);radius=Math.max(radius,m.def.r||0);const k=Math.floor(m.x/4)+':'+Math.floor(m.y/4);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(m);});grids.set(B,{pool,cells,order,radius});
  }
  function candidates(B,p,r){const pool=B.enemyPool||B.mobs,g=grids.get(B);if(!g||g.pool!==pool||r>24)return pool;
    const radius=r+g.radius*.6,out=[];for(let x=Math.floor((p.x-radius)/4);x<=Math.floor((p.x+radius)/4);x++)for(let y=Math.floor((p.y-radius)/4);y<=Math.floor((p.y+radius)/4);y++){const bucket=g.cells.get(x+':'+y);if(bucket)out.push(...bucket);}
    // Preserve original target tie-breaking, including taunt priority.
    return out.sort((a,b)=>g.order.get(a)-g.order.get(b));
  }
  function invalidate(B){grids.delete(B);}
  return {cfg,init,tick,weatherAt,weatherNames,weatherHelp,reactions,wet,impact,effect,branches,branchOptions,specialize,stats,boardStats,orders,onStart,onClear,chooseOrder,leaked,advice,index,candidates,invalidate};
})();
