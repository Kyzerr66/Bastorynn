'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function between(source,start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);if(a<0||b<a)throw Error('Missing build boundary '+start);return source.slice(a,b);}
const config=JSON.parse(read('src/tactical-config.json'));
const tactics=read('src/tactics.js').replace('/* TACTICAL_CONFIG */',JSON.stringify(config));
let client=read('src/client.js').replace('/* TACTICS_MODULE */',()=>tactics).replace('/* TACTICAL_UI_MODULE */',()=>read('src/tactical-ui.js'));
new vm.Script(client,{filename:'client.js'});
const pieces=[
 between(client,'const RAR =','const SND_META ='),
 between(client,'const MapGen =','const Battle ='),
 between(client,'const WaveRadar=','const TerritoryUI='),
 between(client,'const TroopData=','const Troops='),
 between(client,'const CoopBalance=','const TowerLevelUI='),
 between(client,'const MatchSpeed=','const TowerFinder='),
 between(client,'const Frontier =','// Real mesh renderer')
];
const exported='Engine,MapGen,MAPS,Frontier,WaveRadar,CARD,UNIT,FAM,TroopData,TroopUpgrades,CoopBalance,SiegePvP,MatchSpeed,Tactical';
const simulation=pieces.join('\n')+'\nglobalThis.OwnedGame={'+exported+'};\n';
new vm.Script(simulation,{filename:'simulation.js'});
const assetNames=[];for(let at=0,i=1;at<client.length;at+=300000,i++)assetNames.push(['engine-part-'+String(i).padStart(2,'0')+'.js','window.__bastorynnScriptParts.push('+JSON.stringify(client.slice(at,at+300000))+');\n']);
const sha=crypto.createHash('sha256').update(client).digest('hex').slice(0,12);
let html=read('src/index.html').replace('/* RENDERER_MODULE */',()=>read('src/renderer.js')).replace('/* TACTICAL_STYLE */',()=>read('src/tactical.css'));
html=html.replace('<!-- ENGINE_SCRIPTS -->',assetNames.map(([name])=>'<script src="assets/'+name+'?v='+sha+'"></script>').join('\n'));
html=html.trimEnd()+'\n';
client='';
for(const dir of ['assets','dist/assets']){
 const dest=path.join(root,dir);fs.mkdirSync(dest,{recursive:true});
 // Only remove known generated fragments, never recurse into user data.
 for(const f of fs.readdirSync(dest))if(/^engine-part-\d{2}\.js$/.test(f))fs.unlinkSync(path.join(dest,f));
 for(const [name,body]of assetNames)fs.writeFileSync(path.join(dest,name),body);
 fs.writeFileSync(path.join(dest,'audio-bank.js'),read('src/audio-bank.js'));
}
fs.writeFileSync(path.join(root,'simulation.js'),simulation);
for(const f of ['index.html','dist/index.html'])fs.writeFileSync(path.join(root,f),html);
fs.writeFileSync(path.join(root,'verification/build.json'),JSON.stringify({version:JSON.parse(read('package.json')).version,hash:sha,fragments:assetNames.length,simulationBytes:Buffer.byteLength(simulation),clientBytes:assetNames.reduce((n,a)=>n+Buffer.byteLength(a[1]),0),source:'src/client.js + src/tactics.js'},null,2)+'\n');
console.log('Build V3:',assetNames.length,'fragments; shared rules',sha);

