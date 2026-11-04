'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load,board}=require('../tests/helpers.cjs'),g=load(),rows=[];
function checkPath(W,L){assert.ok(L.len>0&&Number.isFinite(L.len));let previous=null,samples=0;for(let d=0;d<=L.len;d+=.5){const p=g.MapGen.posAt(L,d);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.x>=-1.26&&p.y>=-1.26&&p.x<=W.S+1.26&&p.y<=W.S+1.26);if(previous)assert.ok(Math.hypot(p.x-previous.x,p.y-previous.y)<=.501);previous=p;samples++;}return samples;}
for(const P of g.MAPS){
 const W=g.MapGen.get(P.id),b=board(g,P.id);let samples=0,spots=0;
 for(const L of W.lanes){samples+=checkPath(W,L);assert.ok(Math.hypot(L.pts.at(-1).x-W.cit.x,L.pts.at(-1).y-W.cit.y)<3);}
 for(let x=1;x<W.S;x+=1)for(let y=1;y<W.S;y+=1)if(!g.Engine.checkPlace(b,0,{x,y}))spots++;
 assert.ok(spots>=6,P.id+' initial placement spaces');
 const pvp=[];
 for(const count of [2,3,4]){const world=g.SiegePvP.world(W,count);let paths=0,routeSamples=0;
  const lengths=world.routes.map(routes=>routes.map(pts=>g.MapGen.mkLane(pts).len).sort((a,b)=>a-b));
  let symmetryError=0;for(const lens of lengths)for(let i=0;i<lens.length;i++)symmetryError=Math.max(symmetryError,Math.abs(lens[i]-lengths[0][i]));
  assert.ok(symmetryError<.01,P.id+' symmetric routes '+count);
  for(let a=0;a<count;a++)for(let z=0;z<count;z++)if(a!==z)for(let r=0;r<world.outposts.length;r++){
   const pts=g.SiegePvP.routePoints(world,a,z,r);assert.ok(pts?.length>1);routeSamples+=checkPath(world,g.MapGen.mkLane(pts));paths++;
  }
  pvp.push({players:count,paths,samples:routeSamples,maxRouteSymmetryError:symmetryError});
 }
 rows.push({map:P.id,pveLanes:W.lanes.length,pveSamples:samples,validInitialMitrailleusePositions:spots,pvp});console.log(P.id+': routes et poses valides');
}
const report={scope:'Geometry continuity, bounds (1.25 m spawn margin), symmetric PvP route lengths and initial placement availability. Not a visual terrain audit or balance proof.',maps:rows};
fs.writeFileSync(path.join(__dirname,'../verification/v3-maps.json'),JSON.stringify(report,null,2)+'\n');

