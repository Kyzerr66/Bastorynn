// Profiles come from combat stats, including rarity traits and PvP normalization.
const DefenseGuide=(()=>{
  let mode='pve',filter='all';
  const labels={instant:'Impact immédiat',dot:'Dégâts dans la durée',slow:'Ralentissement',armor:'Anti-armure',shield:'Anti-bouclier',air:'Anti-aérien',area:'Zone / groupes',support:'Soutien',close:'Défense rapprochée'};
  function profile(id,pvp=false){
    const c=CARD[id],f=FAM[c.fam],S=Engine.stats({card:id,lvl:1,clvl:1,pvp}),roles=[];
    const cold=['cryo','frostbattery'].includes(c.fam)||!!S.freeze,fire=S.dt==='fire'||S.burn>0,acid=S.dt==='acid';
    const element=cold?'❄ Givre':S.dt==='fire'?'♨ Feu':acid?'◈ Acide':S.kind==='chain'?'ϟ Électricité':S.dt==='energy'?'✦ Énergie':S.dt==='true'?'◎ Dégâts purs':S.dt==='none'?'◇ Soutien':'◆ Physique';
    if(S.dmg&&S.kind!=='puddle'&&S.kind!=='beam')roles.push('instant');
    if(S.kind==='puddle'||S.kind==='beam'||S.burn)roles.push('dot');
    if(S.slow||S.freeze||S.stun||S.vehStun||S.pull)roles.push('slow');
    if(S.pierce||S.melt||acid||S.dt==='fire'||S.dt==='true')roles.push('armor');
    if(S.dt==='energy'||S.shieldMul>1)roles.push('shield');
    if(S.air)roles.push('air');
    if(S.splash||['pulse','cone','gravity','chain','puddle'].includes(S.kind)||S.multi>1)roles.push('area');
    if(['eco','radar','aura'].includes(S.kind))roles.push('support');
    if(S.dmg&&!S.minRange&&!S.airOnly&&S.range<=3.5)roles.push('close');
    return {id,f,S,roles,element,cold,fire,acid,impact:['shell','missile','mine'].includes(S.kind)||c.fam==='canon',electric:S.kind==='chain',rupture:['pulse','emp','sonic'].includes(c.fam)};
  }
  const reactions=[
    {key:'fracture',left:'Givre',right:'Obus / missile / mine / canon',name:'Fracture',effect:'Impact renforcé (+15 %, ou +30 % contre une armure >10 %). Consomme le givre.',a:p=>p.cold,b:p=>p.impact},
    {key:'thermal',left:'Givre',right:'Feu / brûlure',name:'Choc thermique',effect:'Explosion de dégâts (+30 % de l’impact). Consomme le givre et la brûlure.',a:p=>p.cold,b:p=>p.fire},
    {key:'corrosive',left:'Acide',right:'Feu / brûlure',name:'Vapeur corrosive',effect:'Petit nuage acide de 1,4 s : 5 dégâts/s en PvE, 2 en PvP.',a:p=>p.acid,b:p=>p.fire},
    {key:'conductive',left:'Eau / pluie / orage',right:'Tesla',name:'Conductivité',effect:'Impact électrique renforcé de 12 %. Dépend du terrain ou de la météo.',environment:true,b:p=>p.electric},
    {key:'rupture',left:'Bouclier ennemi',right:'Onde / IEM / sonique',name:'Protection rompue',effect:'Retire 20 % du bouclier maximal, jusqu’à 45 points en PvE ou 18 en PvP.',environment:true,b:p=>p.rupture}
  ];
  function comboState(ids,pvp=false){const list=ids.filter(id=>CARD[id]).map(id=>profile(id,pvp));return reactions.map(r=>({...r,ready:(r.environment||list.some(r.a))&&list.some(r.b)}));}
  const num=n=>Number(n.toFixed(2));
  function badges(id){const p=profile(id);return '<div class="defense-badges"><span>'+p.element+'</span><span>'+labels[['slow','dot','shield','armor','instant','support'].find(r=>p.roles.includes(r))||'support']+'</span></div>';}
  function detail(id,pvp=false){const p=profile(id,pvp),s=p.S,lines=[];
    if(s.slow)lines.push('Ralentit de '+Math.round(s.slow.p*100)+' % pendant '+num(s.slow.d)+' s. Les résistances ennemies s’appliquent.');
    if(s.freeze)lines.push('Gel : '+Math.round(s.freeze.c*100)+' % de chance, jusqu’à '+num(Math.min(1.8,s.freeze.d))+' s ; les boss résistent.');
    if(p.acid)lines.push('Ignore l’armure. Le contact réduit aussi l’armure restante de '+(pvp?'8':'15')+' % pendant 0,6 s, renouvelé dans le nuage.');
    if(s.pierce)lines.push('Ignore '+Math.round(s.pierce*100)+' % de l’armure sur ce tir ; ne réduit pas l’armure pour les autres tours.');
    if(s.melt)lines.push('Érode définitivement '+num(s.melt*5)+' points de pourcentage d’armure par impact.');
    if(s.burn)lines.push('Brûle pendant '+(pvp?'1,4':'2,5')+' s (durée réduite sous la pluie). Les brûlures ne s’additionnent pas : la plus forte est conservée.');
    if(s.kind==='puddle')lines.push('Nuage : dégâts continus aux ennemis au sol qui restent dans sa zone.');
    if(s.kind==='beam')lines.push('Faisceau continu : dégâts progressifs tant que la cible reste à portée.');
    if(s.dt==='energy')lines.push('Énergie : efficacité doublée sur les boucliers avant les bonus propres à la carte. L’armure reste active.');
    if(s.dt==='fire'||s.dt==='true')lines.push(s.dt==='fire'?'Le feu ignore l’armure et traverse les boucliers.':'Les dégâts purs ignorent l’armure, mais les boucliers les absorbent.');
    if(s.minRange)lines.push('Tir entre '+num(s.minRange)+' et '+num(s.range)+' m : prévois une tour rapprochée dans la zone morte.');
    if(!lines.length)lines.push(p.f.desc);
    return '<section class="defense-detail"><b>'+(pvp?'PvP':'PvE')+' · '+p.element+' · '+p.f.role+'</b><div class="defense-tags">'+p.roles.map(r=>'<span>'+labels[r]+'</span>').join('')+'</div><ul>'+lines.map(t=>'<li>'+t+'</li>').join('')+'</ul></section>';
  }
  function diagram(ids,pvp=false){return '<div class="reaction-map">'+comboState(ids,pvp).map(r=>'<article class="reaction-row '+(r.ready?'ready':'')+'"><div class="reaction-formula"><span>'+r.left+'</span><i>+</i><span>'+r.right+'</span><i>→</i><strong>'+r.name+'</strong></div><p>'+r.effect+'</p><small>'+(r.ready?(r.environment?'✓ Prêt si la condition est présente':'✓ Combinaison dans ton deck'):'À compléter dans ton deck')+'</small></article>').join('')+'</div><p class="reaction-note">Une seule réaction par ennemi toutes les '+Tactical.cfg.reactions.cooldown+' s. Les bonus de dégâts sont plafonnés à '+(pvp?Tactical.cfg.reactions.pvpBonusCap:Tactical.cfg.reactions.bonusCap)+' ; Fracture et Choc thermique sont aussi limités à 5 % des PV max. Les nuages ne déclenchent pas de réaction en chaîne.</p>';}
  function analysis(ids,pvp=false){const ps=ids.filter(id=>CARD[id]).map(id=>profile(id,pvp)),needs=['close','air','slow','armor','area'],missing=needs.filter(r=>!ps.some(p=>p.roles.includes(r)));return {ps,missing};}
  function mount(host,refreshCollection){
    const panel=document.createElement('section');panel.className='deck-lab';panel.setAttribute('aria-label','Analyse du deck et réactions');host.querySelector('.deck8').after(panel);
    function paint(){const pvp=mode==='pvp',{ps,missing}=analysis(G.deck,pvp),cost=ps.reduce((n,p)=>n+Engine.cost(p.id,pvp),0),suggest=CARDS.filter(c=>owned(c.id)&&!G.deck.includes(c.id)).filter(c=>profile(c.id,pvp).roles.some(r=>missing.includes(r))).sort((a,b)=>Engine.cost(a.id,pvp)-Engine.cost(b.id,pvp)).slice(0,3);
      panel.innerHTML='<header><div><small>COMPOSE TA DÉFENSE</small><h3>Rôles & réactions</h3></div><div class="deck-mode" role="group" aria-label="Mode d’analyse"><button data-guide-mode="pve" aria-pressed="'+!pvp+'">PvE</button><button data-guide-mode="pvp" aria-pressed="'+pvp+'">PvP</button></div></header><p>'+ps.length+' / 6 défenses · coût moyen '+(ps.length?Math.round(cost/ps.length):0)+' ⚡ · '+(pvp?'Statistiques normalisées, niveaux de collection ignorés.':'Profil de base des cartes ; les améliorations en partie renforcent leurs effets.')+'</p><div class="deck-coverage">'+['close','air','slow','armor','area'].map(r=>'<span class="'+(missing.includes(r)?'missing':'covered')+'">'+(missing.includes(r)?'○ ':'✓ ')+labels[r]+'</span>').join('')+'</div><p role="status">'+(missing.length?'À prévoir : '+missing.map(r=>labels[r].toLowerCase()).join(', ')+'.':'Les cinq rôles principaux sont couverts. Adapte le placement et les cartes à la vague.')+'</p>'+(ps.some(p=>p.S.minRange)?'<p>◎ Protège les zones mortes de tes artilleries avec une défense rapprochée.</p>':'')+(suggest.length?'<div class="deck-suggestions">Cartes possédées à examiner : '+suggest.map(c=>'<button data-guide-card="'+c.id+'">'+c.n+'</button>').join('')+'</div>':'')+'<details class="deck-reactions"><summary>Schéma des réactions élémentaires</summary>'+diagram(G.deck,pvp)+'</details><details><summary>Effets des cartes de ce deck</summary>'+ps.map(p=>'<h4>'+CARD[p.id].n+'</h4>'+detail(p.id,pvp)).join('')+'</details>';
    }
    panel.onclick=e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.guideMode){mode=b.dataset.guideMode;paint();refreshCollection?.();panel.querySelector('[data-guide-mode="'+mode+'"]').focus();}if(b.dataset.guideCard)cardSheet(b.dataset.guideCard);};paint();
    const wrap=document.createElement('label');wrap.className='defense-role-filter';wrap.innerHTML='Filtrer par effet <select aria-label="Rôle de défense"><option value="all">Tous les effets</option>'+Object.entries(labels).map(([id,n])=>'<option value="'+id+'">'+n+'</option>').join('')+'</select>';host.querySelector('#catalogueCount').before(wrap);const select=wrap.querySelector('select');select.value=filter;select.disabled=arsenalType==='units';select.onchange=()=>{filter=select.value;renderArsenal();};
  }
  function matches(id){return filter==='all'||!!CARD[id]&&profile(id,mode==='pvp').roles.includes(filter);}
  return {profile,badges,detail,diagram,analysis,comboState,mount,matches,reactions};
})();
