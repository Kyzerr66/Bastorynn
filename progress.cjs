'use strict';
// Progress format v8. Identity, password hashes and session data are never accepted here.
const fields=new Set('v c tk xp lvl daily streak ach st col deck minted owners prog trophies best seen feed auctions nextDrop onboard battles seasonEnd mis aid lastAuc earned bots chests ws bestWs pass diff troops troopDeck troopsV1 savedDecks selectedDeck coopClaims endlessMap playerName'.split(' '));
function validate(value){
 const bad=()=>{const e=Error('Format de progression invalide. La sauvegarde précédente est conservée.');e.status=400;throw e;};
 if(!value||Array.isArray(value)||typeof value!=='object'||value.v!==8)bad();
 if(Buffer.byteLength(JSON.stringify(value))>400000)bad();
 let nodes=0;
 function check(v,depth=0){if(++nodes>40000||depth>12)bad();if(v===null||typeof v==='boolean')return;if(typeof v==='number'){if(!Number.isFinite(v)||Math.abs(v)>1e15)bad();return;}if(typeof v==='string'){if(v.length>2048)bad();return;}if(Array.isArray(v)){if(v.length>2000)bad();for(const x of v)check(x,depth+1);return;}if(typeof v!=='object')bad();for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k)||k.length>128)bad();check(x,depth+1);}}
 check(value);
 for(const key of ['c','tk','xp','lvl'])if(!Number.isFinite(value[key])||value[key]<0)bad();
 if(!Number.isInteger(value.lvl)||value.lvl<1)bad();
 for(const key of ['col','st','prog'])if(!value[key]||Array.isArray(value[key])||typeof value[key]!=='object')bad();
 for(const key of ['deck','troopDeck'])if(value[key]!==undefined&&(!Array.isArray(value[key])||value[key].length>6||value[key].some(x=>typeof x!=='string'||x.length>80)))bad();
 if(value.savedDecks!==undefined&&(!Array.isArray(value.savedDecks)||value.savedDecks.length>12))bad();
 return Object.fromEntries(Object.entries(value).filter(([key])=>fields.has(key)));
}
module.exports={validate};
