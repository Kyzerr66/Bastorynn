const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{performance}=require('node:perf_hooks');
function load(file=path.join(__dirname,'../simulation.js')){
 const c=vm.createContext({console,Math,performance,Float32Array,Float64Array,Uint8Array,Int32Array,localStorage:{getItem:()=>null,setItem(){}},addEventListener(){},R3:{THREE:{}},Battle:{open(){}},G:{},RM:true});
 new vm.Script(fs.readFileSync(file,'utf8')).runInContext(c,{timeout:10000});return c.OwnedGame;
}
function board(game,mission='aube'){return game.Engine.create({mission,deck:['gatling_0','cryo_0','canon_0','mortar_0','tesla_0','radar_0'].map(id=>({id,lvl:1})),seed:443});}
function tower(g,b,id='canon_0',x=20,y=20){const t={id:b.next(),card:id,lvl:2,clvl:1,x,y,pvp:!!b.pvp,spent:100,mode:'first',dmg:0,kills:0,cd:0,fire:0,jam:0};b.towers.push(t);g.Engine.refresh(b);return t;}
function mob(g,b,type='leger'){b.wave=5;const m=g.Engine.spawn(b,type,b.W.lanes[0],1);m.hp=m.maxHp=1000;m.arm=.3;return m;}
module.exports={load,board,tower,mob};
