const TacticalUI=(()=>{
  let board,view,root,panel,canvas,ctx,elapsed=0,signature='',effects=[],seen=new WeakSet(),reduced=false,previewWave=-1,previewCounts={};
  try{reduced=localStorage.getItem('bastorynn-reduced')==='1'||RM;}catch{}
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const setReduced=v=>{reduced=!!v;document.documentElement.classList.toggle('v3-reduced',reduced);try{localStorage.setItem('bastorynn-reduced',reduced?'1':'0');}catch{}};
  setReduced(reduced);
  function attach(B,V,r){
    detach();board=B;view=V;root=r;seen=new WeakSet();previewWave=-1;
    panel=document.createElement('section');panel.className='tactical-panel';panel.setAttribute('aria-label','Conseiller tactique');
    panel.innerHTML='<button class="tactical-toggle" aria-expanded="false"><span class="tactical-weather-icon" aria-hidden="true">☀</span><span><b data-weather></b><small data-forecast></small></span><span class="tactical-expand">+</span></button><div class="tactical-body" hidden><p data-weather-help></p><div data-intel></div><div data-orders></div><details class="tactical-combos"><summary>Combinaisons élémentaires</summary><p>❄ + impact → Fracture<br>❄ + feu → Choc thermique<br>Eau + Tesla → Conductivité<br>Feu + acide → Vapeur corrosive<br>Bouclier + IEM → Rupture<br>Fumée + vent → Dispersion</p></details><div class="tactical-log" data-log aria-live="polite"></div><label class="tactical-reduced"><input type="checkbox" data-reduced> Animations réduites</label></div>';
    root.appendChild(panel);
    const toggle=panel.querySelector('.tactical-toggle');toggle.onclick=()=>{const body=panel.querySelector('.tactical-body');body.hidden=!body.hidden;toggle.setAttribute('aria-expanded',String(!body.hidden));panel.querySelector('.tactical-expand').textContent=body.hidden?'+':'−';};
    panel.querySelector('[data-reduced]').checked=reduced;panel.querySelector('[data-reduced]').onchange=e=>setReduced(e.target.checked);
    panel.querySelector('[data-orders]').onclick=e=>{const b=e.target.closest('[data-order]');if(!b)return;const result=Frontier.command('order',{id:b.dataset.order});if(typeof result==='string')Battle.hint(result);signature='';};
    canvas=document.createElement('canvas');canvas.className='tactical-overlay';canvas.setAttribute('aria-hidden','true');root.appendChild(canvas);ctx=canvas.getContext('2d');
    if(B.P.training){const g=document.createElement('div');g.className='tactical-coach';g.setAttribute('role','status');root.appendChild(g);}
    elapsed=1;frame(0);
  }
  function detach(){panel?.remove();canvas?.remove();root?.querySelector('.tactical-coach')?.remove();board=view=root=panel=canvas=ctx=null;effects=[];signature='';}
  function events(list){if(!board)return;for(const e of list){if(seen.has(e))continue;seen.add(e);
    if(e.k==='reaction'){effects.push({...e,life:1.2});Snd.play(e.key==='thermal'?'cryo':e.key==='conductive'?'tesla':'pulse',{vol:.24,gap:.4,max:2});}
    if(e.k==='lightning')effects.push({...e,c:'#c5d7ff',life:.5});
    if(e.k==='weather')Snd.play('wave_start',{vol:.22,gap:2,max:1});
    if(e.k==='weatherSoon')Snd.play('wave_start',{vol:.15,gap:2,max:1});
    if(e.k==='clear'&&board.orderOffer){panel.querySelector('.tactical-body').hidden=false;panel.querySelector('.tactical-toggle').setAttribute('aria-expanded','true');panel.querySelector('.tactical-expand').textContent='−';Battle.hint('Un ordre tactique est disponible : choisis ton bonus pour deux vagues.');signature='';}
  }effects=effects.slice(-12);}
  function update(){const B=board,w=B.weather||{kind:'clear',next:'clear',endsAt:120};const left=Math.max(0,Math.ceil(w.endsAt-B.t));
    let counts={};
    if(!B.pvp){if(B.phase==='build'){if(previewWave!==B.wave){previewWave=B.wave;previewCounts=Engine.preview(B).counts;}counts=B.nextIntel||previewCounts;}else for(const m of B.mobs)if(!m.dead)counts[m.type]=(counts[m.type]||0)+1;}
    const sig=[B.wave,B.phase,left,w.kind,B.tactical?.reactions,B.orderOffer?.wave,B.order?.id,B.order?.untilWave,B.towers.length,JSON.stringify(counts)].join('|');if(sig===signature)return;signature=sig;
    panel.querySelector('[data-weather]').textContent=Tactical.weatherNames[w.kind];
    panel.querySelector('.tactical-weather-icon').textContent={clear:'☀',rain:'☂',fog:'≋',storm:'ϟ',snow:'❄',wind:'↝'}[w.kind];
    panel.querySelector('[data-forecast]').textContent=(left<=Tactical.cfg.weather.noticeSeconds?'Bientôt : '+Tactical.weatherNames[w.next]+' · ':'Changement dans ')+left+' s';
    panel.classList.toggle('weather-incoming',left<=Tactical.cfg.weather.noticeSeconds);
    panel.querySelector('[data-weather-help]').textContent=Tactical.weatherHelp[w.kind];
    panel.querySelector('[data-intel]').innerHTML=B.pvp?'<h4>Priorité du siège</h4><p>Conteste les avant-postes et protège ta citadelle. Les spécialisations sont disponibles au niveau 2.</p>':'<h4>'+ (B.phase==='build'?'Préparer la vague '+(B.wave+1):'Menaces restantes')+'</h4>'+Tactical.advice(counts).slice(0,3).map(q=>'<p class="tactical-counter"><b>'+q.label+' · '+q.n+'</b><span>'+q.tip+'</span></p>').join('');
    panel.querySelector('[data-orders]').innerHTML=B.orderOffer?'<h4>Choisis un ordre · 2 vagues</h4><p>Un seul choix pour la citadelle. Sans choix, la partie continue normalement.</p>'+B.orderOffer.options.map(id=>'<button class="tactical-order" data-order="'+id+'"><b>'+Tactical.orders[id].name+'</b><small>'+Tactical.orders[id].desc+'</small></button>').join(''):B.order?'<p class="tactical-active">'+Tactical.orders[B.order.id].name+' · jusqu’à la vague '+B.order.untilWave+'</p>':'';
    panel.querySelector('[data-log]').innerHTML=(B.tactical?.log||[]).slice(-3).map(q=>'<span>'+escape(q.name)+'</span>').join('');
    const coach=root.querySelector('.tactical-coach');if(coach){const steps=[['Construis ta ligne','Choisis la Mitrailleuse en bas, puis un terrain libre au bord de la route.'],['Combine tes défenses','Ajoute un Cryo près de ta mitrailleuse, puis lance la vague.'],['Prépare le contre','Observe le renseignement et améliore une tour au niveau 2 pour la spécialiser.'],['Tiens le rempart','Choisis un ordre après la vague 3. Un boss arrive à la vague 6.']];const i=B.wave>=3?3:B.wave>=1?2:B.towers.length?1:0;coach.innerHTML='<b>INITIATION '+(i+1)+'/4 · '+steps[i][0]+'</b><span>'+steps[i][1]+'</span>';}
  }
  function frame(dt){if(!board||!ctx)return;elapsed+=dt;if(elapsed>=.25){elapsed=0;update();}
    const width=root.clientWidth,height=root.clientHeight;if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    ctx.clearRect(0,0,width,height);
    for(const q of board.weather?.warnings||[]){const remaining=q.at-board.t;if(q.hit||remaining<0||remaining>Tactical.cfg.weather.strikeNotice)continue;
      const c=view.project(q.x,q.y,view.groundY(q.x,q.y)+.12);if(!c.ok)continue;const edge=view.project(q.x+q.r,q.y,view.groundY(q.x,q.y)+.12),radius=Math.max(12,Math.hypot(edge.x-c.x,edge.y-c.y));
      ctx.save();ctx.strokeStyle='#f8c775';ctx.fillStyle='rgba(244,174,87,.13)';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(c.x,c.y,radius,radius*.6,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffe4b0';ctx.fillText('FOUDRE · '+Math.ceil(remaining)+' s',c.x,c.y-radius*.6-6);ctx.restore();
    }
    effects=effects.filter(e=>(e.life-=dt)>0);
    for(const e of effects){const p=view.project(e.x,e.y,view.groundY(e.x,e.y)+.7);if(!p.ok)continue;ctx.globalAlpha=Math.min(1,e.life*2);ctx.fillStyle=e.c;ctx.strokeStyle=e.c;ctx.textAlign='center';ctx.font='bold 12px system-ui';const lift=reduced?0:(1.2-e.life)*18;
      if(e.name){ctx.lineWidth=3;ctx.strokeStyle='#14252a';ctx.strokeText(e.name,p.x,p.y-lift);ctx.fillText(e.name,p.x,p.y-lift);}else{ctx.beginPath();ctx.arc(p.x,p.y,14,0,7);ctx.stroke();}
    }ctx.globalAlpha=1;
  }
  function specialization(el,tw,access){if(!access.own||tw.lvl<2)return;
    const wrap=document.createElement('div');wrap.className='tactical-specialization';
    wrap.innerHTML=tw.branch?'<b>'+Tactical.branches[tw.branch].name+'</b><small>'+Tactical.branches[tw.branch].desc+(tw.pvp?' Effets réduits en PvP.':'')+'</small>':'<b>Spécialisation gratuite</b><small>Un choix définitif pour cette tour'+(tw.pvp?' · effets réduits en PvP':'')+'.</small><div>'+Tactical.branchOptions(tw).map(id=>'<button data-branch="'+id+'"><b>'+Tactical.branches[id].name+'</b><small>'+Tactical.branches[id].desc+'</small></button>').join('')+'</div>';
    el.querySelector('.bp-a')?.before(wrap);
    wrap.querySelectorAll('[data-branch]').forEach(b=>b.onclick=()=>{const r=Frontier.command('specialize',{id:tw.id,branch:b.dataset.branch});if(typeof r==='string')Battle.hint(r);else Battle.inspectTower(tw.id);});
  }
  function debrief(t){const worst=Object.entries(t?.leaked||{}).sort((a,b)=>b[1]-a[1])[0];if(!worst)return 'Varie les rôles et protège les sorties de route.';
    return escape((UNIT[worst[0]]?.n||'Les ennemis')+' : '+worst[1]+' dégâts à la citadelle. '+Tactical.advice({[worst[0]]:1})[0].tip);
  }
  function quick(){
    if(Battle.B)return;closeScene(true);G.paused=true;
    const base=MAPS[0],preset={...base,n:'Premier rempart',waves:6,hp:.65,training:true,boss:{6:'b_garde'}};
    Battle.open({preset,world:MapGen.get('aube'),deck:['gatling_0','cryo_0','canon_0','mortar_0','tesla_0','radar_0'].map(id=>({id,lvl:1})),diff:0,first:true,onEnd:r=>{
      G.paused=false;render(true);scene('<div class="kicker">Initiation terminée</div><h2>'+(r.win?'Le rempart a tenu.':'Une nouvelle stratégie à essayer.')+'</h2><p class="sline">'+r.waves+'/6 vagues · '+r.kills+' ennemis repoussés · '+(r.tactical?.reactions||0)+' réactions</p><p class="sline">'+debrief(r.tactical)+'</p><p class="sline">Cet entraînement ne dépense aucune carte et ne modifie pas la progression de campagne.</p><div class="sacts"><button class="btn go full" data-close="campaign">Jouer la campagne</button><button class="btn glass full" data-close="retry">Rejouer l’initiation</button><button class="btn glass full" data-close="home">Retour au QG</button></div>','',k=>{if(k==='retry')setTimeout(quick,50);if(k==='campaign')setTimeout(startBattle,50);});
    }});
  }
  function welcome(){
    scene('<div class="v3-welcome"><div class="v4-welcome-copy"><div class="kicker">CITADELLES · STRATÉGIE EN TEMPS RÉEL</div><h1>BASTORYNN</h1><p class="v3-lead">Chaque tour compte.<br>Chaque ligne résiste.</p><p>Construis au bord des routes, combine tes tours et repousse les assauts. Tes décisions font la différence.</p><button class="btn go full" id="v3FirstPlay">Jouer l’initiation <small>6 vagues · sans compte</small></button><button class="btn glass full" id="v3WelcomePack">Recevoir mon booster et explorer</button><span class="v3-welcome-note">Aucun téléchargement · clavier, souris et tactile</span></div><div class="v3-lineup"><img data-art="cryo_0" alt="Cryo : contrôle"><img data-art="canon_0" alt="Canon : impact"><img data-art="tesla_0" alt="Tesla : électricité"></div></div>');Arts.fill($('scene'));
    $('v3FirstPlay').onclick=()=>{G.onboard=true;save();closeScene(true);quick();};
    $('v3WelcomePack').onclick=()=>{closeScene(true);onboarding();};
  }
  function home(){
    const target=$('t-combat');if(!target||target.querySelector('.v3-command'))return;
    const section=document.createElement('section');section.className='v3-command';section.innerHTML='<div class="v3-command-copy"><span class="kicker">CITADELLES · SOLO & MULTIJOUEUR</span><h1>Chaque tour compte.<br>Chaque ligne résiste.</h1><p>Compose ton arsenal, provoque les réactions élémentaires et protège ta citadelle.</p><div class="v3-command-actions"><button class="btn go" data-quick>Partie d’initiation <small>6 vagues · deck fourni</small></button><button class="btn glass" data-coop>Jouer avec des amis</button></div><div class="v3-features"><span>16 cartes</span><span>Spécialisations</span><span>Combos élémentaires</span></div></div><div class="v3-command-art"><img data-art="mortar_0" alt="Mortier"><img data-art="cryo_0" alt="Cryo"><img data-art="tesla_0" alt="Tesla"><span>CONSTRUIRE · COMBINER · RÉSISTER</span></div>';
    target.prepend(section);
    const modes=document.createElement('section');modes.className='v4-mode-grid';modes.setAttribute('aria-label','Choisir un mode de jeu');modes.innerHTML='<button class="v4-mode" data-campaign><span>01 / CAMPAGNE</span><b>Tiens le rempart.</b><small>16 territoires. Un deck à adapter à chaque assaut.</small><em><span>Choisir une mission </span>↗</em></button><button class="v4-mode" data-friends><span>02 / ESCOUADE</span><b>Un front commun.</b><small>Défends la citadelle avec tes alliés en coopération.</small><em><span>Jouer ensemble </span>↗</em></button><button class="v4-mode" data-arsenal><span>03 / ARSENAL</span><b>Prépare le contre.</b><small>Compare les rôles et construis tes réactions élémentaires.</small><em><span>Composer mon deck </span>↗</em></button>';section.after(modes);
    modes.querySelector('[data-campaign]').onclick=()=>target.querySelector('.hero')?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
    modes.querySelector('[data-friends]').onclick=()=>Frontier.campaignMenu();
    modes.querySelector('[data-arsenal]').onclick=()=>document.querySelector('nav.tabs [data-t="arsenal"]').click();section.querySelector('[data-quick]').onclick=quick;section.querySelector('[data-coop]').onclick=()=>Frontier.campaignMenu();Arts.fill(section);
    const hero=target.querySelector('.hero');if(hero)hero.classList.add('v3-campaign');
  }
  return {attach,detach,events,frame,specialization,debrief,quick,welcome,home};
})();
