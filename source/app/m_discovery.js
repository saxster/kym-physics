// Subject activities arrive only after the reader opens a lesson or asks for a route.
import App from './core.js';
const load=()=>App.loadExplorer('discovery');
App.on('lesson:mounted',({id,stage,api})=>{
 let closed=false;api.onCleanup(()=>{closed=true;});
 const offer=()=>load().then(impl=>{if(!closed&&stage.isConnected)impl.offer(stage,id,api);});
 offer().catch(()=>{
  if(closed)return;
  const retry=App.el('button',{type:'button',class:'live-ctl'},'Try loading the extra investigations again');
  retry.addEventListener('click',()=>{retry.disabled=true;offer().then(()=>retry.remove()).catch(()=>{retry.disabled=false;});});
  stage.append(retry);
 });
});
App.ready(()=>{
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('[data-discovery]');
  if(link&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&!event.button)App.emit('discovery:request',link.dataset.discovery);
 },true);
 const host=document.getElementById('investigations');if(!host)return;
 const route=App.el('section',{class:'discovery-routes'},App.el('h3',{},'What would you like to find out?'),
  App.el('p',{},'Build something, measure an unknown, or test an explanation. Each route takes you back into the story.'));
 const button=App.el('button',{type:'button',class:'live-ctl'},'Choose a new investigation');
 route.append(button);host.querySelector('.inv-start')?.after(route);
 button.addEventListener('click',async()=>{
  button.disabled=true;
  try{(await load()).directory(route);button.remove();}
  catch(_){button.textContent='The extra investigations did not load. Try again';button.disabled=false;}
 });
});
