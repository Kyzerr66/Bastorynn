'use strict';
// One small-game snapshot, serialized and locked across overlapping deployments.
const fs=require('node:fs'),path=require('node:path');
module.exports=async function createStore(){
 const file=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'accounts.json');
 let initial={version:1,users:[],sessions:[]};
 if(fs.existsSync(file)){initial=JSON.parse(fs.readFileSync(file,'utf8'));if(initial.version!==1||!Array.isArray(initial.users)||!Array.isArray(initial.sessions))throw Error('Sauvegarde locale invalide : import interrompu.');}
 if(!process.env.DATABASE_URL){
  fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});let current=initial;
  return {kind:'local',async begin(){return structuredClone(current);},async commit(data,dirty){if(dirty){const temp=file+'.tmp';fs.writeFileSync(temp,JSON.stringify(data),{mode:0o600});fs.renameSync(temp,file);current=structuredClone(data);}},async rollback(){},async close(){}};
 }
 const {Pool}=require('pg');
 const url=new URL(process.env.DATABASE_URL);
 // TLS options are explicit; do not accidentally disable certificate verification.
 for(const key of ['sslmode','sslcert','sslkey','sslrootcert'])url.searchParams.delete(key);
 const pool=new Pool({connectionString:url.toString(),max:2,connectionTimeoutMillis:10000,idleTimeoutMillis:30000,ssl:process.env.DATABASE_TLS==='local-test'?false:{rejectUnauthorized:true,...(process.env.DATABASE_CA_CERT?{ca:process.env.DATABASE_CA_CERT.replace(/\\n/g,'\n')}:{})}});
 pool.on('error',()=>console.error('Connexion de sauvegarde interrompue. Les prochaines écritures seront retentées.'));
 try{
  await pool.query('CREATE SCHEMA IF NOT EXISTS bastorynn_private');
  await pool.query('REVOKE ALL ON SCHEMA bastorynn_private FROM PUBLIC');
  await pool.query('CREATE TABLE IF NOT EXISTS bastorynn_private.game_accounts (id integer PRIMARY KEY CHECK(id=1), payload jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())');
  await pool.query('REVOKE ALL ON bastorynn_private.game_accounts FROM PUBLIC');
  await pool.query('INSERT INTO bastorynn_private.game_accounts(id,payload) VALUES(1,$1::jsonb) ON CONFLICT(id) DO NOTHING',[JSON.stringify(initial)]);
 }catch(e){await pool.end();throw e;}
 let client=null;
 return {kind:'postgres',async begin(){client=await pool.connect();try{await client.query('BEGIN');await client.query("SET LOCAL lock_timeout = '10s'");const {rows}=await client.query('SELECT payload FROM bastorynn_private.game_accounts WHERE id=1 FOR UPDATE');return rows[0].payload;}catch(e){try{await client.query('ROLLBACK');}finally{client.release();client=null;}throw e;}},async commit(data,dirty){if(dirty)await client.query('UPDATE bastorynn_private.game_accounts SET payload=$1::jsonb,updated_at=now() WHERE id=1',[JSON.stringify(data)]);await client.query('COMMIT');client.release();client=null;},async rollback(){if(client){try{await client.query('ROLLBACK');}finally{client.release();client=null;}}},async close(){await pool.end();}};
};
