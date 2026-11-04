'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{load}=require('../tests/helpers.cjs');
const g=load(),deck=['gatling_0','cryo_0','canon_0','mortar_0','tesla_0','radar_0'].map(id=>({id,lvl:1}));
const b=g.Engine.create({preset:{...g.MAPS[0],n:'Premier rempart',waves:6,hp:.65,training:true,boss:{6:'b_garde'}},world:g.MapGen.get('aube'),deck,diff:0,first:true});
const history=[];
function prepare(){
 if(b.orderOffer)g.Tactical.chooseOrder(b,'assault');
 // Fixed beginner-friendly plan. Normal prices and earned energy only.
 const order=[0,1,0,2,3,4,0,3,2,4];
 for(let attempt=0;attempt<10;attempt++){
  const di=order[b.towers.length%order.length];if(b.energy<g.Engine.cost(deck[di].id))break;
  const range=g.Engine.stats({card:deck[di].id,lvl:1,clvl:1}).range;let best=null,score=-Infinity;
  for(let x=1;x<b.W.S;x+=.75)for(let y=Math.max(1,b.W.cit.y-13);y<Math.min(b.W.S,b.W.cit.y+3);y+=.75){
   const p={x,y};if(g.Engine.checkPlace(b,di,p))continue;let value=0;
   for(const L of b.W.lanes)for(let d=Math.max(0,L.len-14);d<L.len-1;d+=.6){const q=g.MapGen.posAt(L,d);if(Math.hypot(q.x-x,q.y-y)<range)value+=1;}
   if(value>score){score=value;best=p;}
  }
  if(!best||score<=0)break;g.Engine.place(b,di,best);
 }
 for(const t of b.towers){if(t.lvl<2)g.Engine.upgrade(b,t);if(t.lvl>=2&&!t.branch)g.Tactical.specialize(b,t,g.Tactical.branchOptions(t)[0]);}
 history.push({wave:b.wave+1,hp:b.hp,energy:b.energy,towers:b.towers.length});g.Engine.startWave(b);
}
let ticks=0;while(!['win','lose'].includes(b.phase)&&ticks++<36000){if(b.phase==='build')prepare();g.Engine.step(b,1/30);b.ev.length=0;}
const report={scope:'Headless initiation with a fixed placement policy, normal budget, no purchases or abilities. Winnability check, not a human usability test.',result:b.phase,hp:b.hp,wave:b.wave,simulatedSeconds:b.t,kills:b.kills,reactions:b.tactical.reactions,history};
fs.writeFileSync(path.join(__dirname,'../verification/v32-training.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));assert.equal(b.phase,'win');

