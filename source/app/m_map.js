// Keep the map page's automatic entry while deferring cartographic data until it is visible.
import App from './core.js';
App.ready(()=>{
  const mount=document.querySelector('[data-mount="map"]');
  if(!mount)return;
  let loading=false,ready=false;
  const status=App.el('p',{class:'amap-note',role:'status'},'The map opens when you reach this page.');
  const retry=App.el('button',{type:'button',class:'amap-btn',hidden:true,onclick:load},'Retry map');
  mount.append(status,retry);
  async function load(){
    if(ready||loading)return;
    loading=true;retry.hidden=true;status.textContent='Opening the map…';
    try{const impl=await App.loadExplorer('map');impl.mount(mount);ready=true;observer?.disconnect();}
    catch(error){status.textContent='The map could not load. Check the connection and try again.';retry.hidden=false;}
    finally{loading=false;}
  }
  const observer='IntersectionObserver' in window?new IntersectionObserver(rows=>{if(rows.some(r=>r.isIntersecting))load();},{rootMargin:'200px'}):null;
  if(observer)observer.observe(mount);else load();
});
