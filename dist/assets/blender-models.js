/* Blender-authored, indexed and quantized mesh archive. No remote asset service. */
window.CitadellesModels=(()=>{
 const T=R3.THREE,cache=new Map();let pack=null,disabled=false;
 const rarityTrim={
  commune:'#777b6c',rare:'#647781',epique:'#796e83',legendaire:'#98865f',mythique:'#906e70'
 };
 function decode(data,accent,unitPaint,foliage=false,defenseTrim=null){
  if(!data)return null;
  const n=data.i.length,positions=new Float32Array(n*3),colors=new Float32Array(n*3),mr=new Float32Array(n*2),em=new Float32Array(n*2);
  const palette=pack.palette.map(c=>new T.Color(c));if(accent)palette[4]=new T.Color(accent);
  if(defenseTrim){
   const trim=new T.Color(defenseTrim),neutral=new T.Color();
   for(let i=0;i<palette.length;i++){
    const color=palette[i];
    const luma=.2126*color.r+.7152*color.g+.0722*color.b;
    neutral.setRGB(luma,luma,luma);
    color.lerp(neutral,i===4 ? .68 : .37);
    // Tint metal fittings and sand-colored brackets without repainting the hull.
    if(i===3||['#bfb69b','#918a72'].includes(pack.palette[i]))color.lerp(trim,.29);
   }
  }
  if(unitPaint){palette[1].lerp(new T.Color(unitPaint[0]),.35);palette[2].lerp(new T.Color(unitPaint[1]),.2);}
  if(foliage){palette[1]=new T.Color('#527263');palette[2]=new T.Color('#91ab96');palette[0]=new T.Color('#385144');palette[3]=new T.Color('#776d50');}
  for(let v=0;v<n;v++){
   const from=data.i[v]*3,k=data.m[Math.floor(v/3)],col=palette[k]||palette[0];
   for(let a=0;a<3;a++)positions[v*3+a]=data.p[from+a]/10000;
   colors.set([col.r,col.g,col.b],v*3);mr.set([k===3?.5:k===1?.35:.08,k===4?.55:.8],v*2);em.set([k===4 ? (defenseTrim ? .07 : .16) : 0,0],v*2);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));g.setAttribute('color',new T.BufferAttribute(colors,3));g.setAttribute('mr',new T.BufferAttribute(mr,2));g.setAttribute('em',new T.BufferAttribute(em,2));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData.blender=true;return g;
 }
 function tower(card,level=1){if(!pack)return null;const levelKey=Math.max(1,Math.min(3,level)),data=pack.towers[card.fam]?.[levelKey];if(!data)return null;
  const key='tower|'+card.fam+'|'+card.r+'|'+levelKey;if(cache.has(key))return cache.get(key);
  const trim=rarityTrim[card.r]||rarityTrim.commune;
  const result={...data.meta};
  for(const k of ['base','turret','barrel','spin'])result[k]=decode(data.parts[k],data.accent,null,false,trim);
  cache.set(key,result);if(cache.size>256)cache.delete(cache.keys().next().value);return result;
 }
 function unit(type,paint){if(!pack?.units[type])return null;const key='unit|'+type+'|'+paint.join('|');if(cache.has(key))return cache.get(key);const result=pack.units[type].map(p=>({...p,g:decode(p.g,null,paint)}));cache.set(key,result);if(cache.size>256)cache.delete(cache.keys().next().value);return result;}
 function tree(type){const data=pack?.trees[type]||pack?.trees.pine;return data?decode(data,null,null,true):null;}
 function decor(type){return pack?.decor[type]?decode(pack.decor[type]):null;}
 async function init(){
  if(!window.BastorynnAssetArchive)throw Error('Archive 3D Citadelles manquante');
  const bytes=Uint8Array.from(atob(window.BastorynnAssetArchive),c=>c.charCodeAt(0));delete window.BastorynnAssetArchive;
  if(typeof DecompressionStream!=='function')throw Error('Ce navigateur ne prend pas en charge les assets 3D. Utilise une version récente de Chrome, Edge, Firefox ou Safari.');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));const parsed=JSON.parse(await new Response(stream).text());if(disabled||window.BastorynnSkipModels)return null;pack=parsed;
  return {families:Object.keys(pack.towers).length,baseUnits:Object.keys(pack.units).length,trees:Object.keys(pack.trees).length};
 }
 return {init,disable(){disabled=true;pack=null;},tower,unit,tree,decor,stats:()=>({ready:!!pack,cached:cache.size,families:pack?Object.keys(pack.towers):[],baseUnits:pack?Object.keys(pack.units):[]})};
})();
