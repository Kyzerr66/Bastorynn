/* Keep the first paint independent of the renderer, models and account database. */
(()=>{
 const config={"renderer":"assets/renderer.js?v=91390abae8bb","adapter":"assets/blender-models.js?v=bec7ad17a401","models":"assets/citadelles-pack.js?v=bec7ad17a401","engine":"assets/engine.js?v=fbf681541e8e"},message=document.getElementById('load-message'),retry=document.getElementById('load-retry');
 const state=window.BastorynnBoot={phase:'renderer',fallback:false};
 retry.onclick=()=>location.reload();
 function deadline(promise,ms,label){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]).finally(()=>clearTimeout(timer));}
 function script(url,ms=20000){return new Promise((resolve,reject)=>{const el=document.createElement('script');let timer;
  const finish=error=>{clearTimeout(timer);el.onload=el.onerror=null;if(error){el.remove();reject(error);}else resolve();};
  el.src=url;el.async=true;el.onload=()=>finish();el.onerror=()=>finish(Error('Fichier inaccessible : '+url.split('?')[0]));timer=setTimeout(()=>finish(Error('Connexion trop lente. Réessaie dans quelques instants.')),ms);document.body.appendChild(el);
 });}
 async function start(){try{
  message.textContent='Chargement du moteur…';await script(config.renderer);
  state.phase='models';message.textContent='Préparation des modèles 3D…';
  try{await deadline((async()=>{await script(config.adapter,8000);await script(config.models,8000);await window.CitadellesModels.init();})(),8000,'Modèles différés');}
  catch(error){window.BastorynnSkipModels=true;window.CitadellesModels?.disable();state.fallback=true;console.warn('Démarrage avec les modèles intégrés.',error.message);}
  state.phase='game';message.textContent='Ouverture de la citadelle…';await script(config.engine);
  if(!window.BastorynnReady)throw Error('Le moteur a rencontré une erreur. Réessaie pour recharger les fichiers.');
  state.phase='ready';document.getElementById('v4-loading').remove();
 }catch(error){state.phase='error';message.textContent=error.message;retry.hidden=false;console.error(error);}}
 start();
})();
