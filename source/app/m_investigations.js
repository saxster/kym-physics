import App from './core.js';
App.ready(()=>{
 const host=document.getElementById('investigation-filters');if(!host)return;
 const entries=[...document.querySelectorAll('#investigations .inv-entry')];
 const select=(label,options)=>{
  const n=App.el('select',{'aria-label':label},options.map(([value,text])=>App.el('option',{value},text)));
  host.append(App.el('label',{},label,n));return n;
 };
 const object=select('Choose an everyday object',[['all','Every object'],...[...new Set(entries.map(e=>e.dataset.object))].sort().map(s=>[s,s])]);
 const time=select('Time for the longer activity',[['all','Any duration'],['10','Up to 10 minutes'],['12','Up to 12 minutes']]);
 const update=()=>{
  let n=0;entries.forEach(e=>{const show=(object.value==='all'||object.value===e.dataset.object)&&(time.value==='all'||+e.dataset.minutes<=+time.value);e.hidden=!show;if(show)n++;});
  document.getElementById('investigation-count').textContent=n?`${n} investigation${n===1?'':'s'}. Open one for a short encounter or a longer activity.`:'No activities match both choices. Choose another object or duration.';
 };
 object.addEventListener('change',update);time.addEventListener('change',update);update();
 App.tool({id:'investigate',label:'Investigate',order:46,icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 3h6M10 3v6l-5 10a1 1 0 0 0 1 2h12a1 1 0 0 0 1-2L14 9V3M8 15h8"/></svg>',onClick:()=>{location.hash='investigations';}});
 for(const chapter of App.data.chapters){
  const choices=App.data.lessons.filter(l=>l.chapter===chapter.n&&l.object);if(!choices.length)continue;
  const root=document.querySelector(`#ch${chapter.n} .intro`);if(!root)continue;
  root.append(App.el('aside',{class:'inv-chapter-links'},App.el('strong',{},'Investigate an everyday thing'),
   App.el('ul',{},choices.map(l=>App.el('li',{},App.el('a',{href:'#'+l.target,'data-open-lesson':l.id},l.title))))));
 }
});
