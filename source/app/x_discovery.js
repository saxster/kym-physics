import App from './core.js';
import {activities as mechanics} from '../live/discovery_mechanics.mjs';
import {activities as waves} from '../live/discovery_waves.mjs';
import {activities as fields} from '../live/discovery_fields.mjs';
import {caseSeed,nextCase,restoreControls,finding,findings,plotBounds} from '../live/discovery_records.mjs';
import {download} from '../live/investigation_ui.js';
import {colors} from '../live/core.js';

const {el,store}=App;
const specs=[...mechanics,...waves,...fields];
const purposes={all:'Every question',make:'Make something work',measure:'Measure an unknown',test:'Test an explanation',discover:'Discover a hidden property'};
let requested=null;
App.on('discovery:request',id=>{requested=id;});
const fmt=n=>Number.isFinite(n)?String(Number(n.toPrecision(7))):'Reading unavailable';
const button=(text,fn)=>el('button',{type:'button',class:'live-ctl',onclick:fn},text);
const field=(text,input)=>el('label',{class:'discovery-field'},text,input);
const safe=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

function graph(canvas,plot,previous=[],cursor){
 const ctx=canvas.getContext('2d'),c=colors(),all=[...previous.map(p=>p.points),plot.points].flat().filter(p=>p.every(Number.isFinite));
 if(!all.length)return;
 const {xmin,xmax,ymin,ymax}=plotBounds(plot,previous);
 const X=x=>55+(x-xmin)/(xmax-xmin)*550,Y=y=>180-(y-ymin)/(ymax-ymin)*155;
 ctx.fillStyle=c.plate;ctx.fillRect(0,0,640,220);ctx.strokeStyle=c.rule;ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(55,25);ctx.lineTo(55,180);ctx.lineTo(605,180);ctx.stroke();
 ctx.fillStyle=c.ink;ctx.font='14px sans-serif';ctx.fillText(fmt(ymax),3,30);ctx.fillText(fmt(ymin),3,180);ctx.fillText(fmt(xmin),55,205);ctx.fillText(fmt(xmax),565,205);
 const line=(p,col,dash)=>{ctx.strokeStyle=col;ctx.setLineDash(dash);ctx.lineWidth=2;ctx.beginPath();p.points.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));ctx.stroke();};
 previous.forEach((p,i)=>line(p,[c.proton,c.green,c.neutron][i%3],[7,4]));line(plot,c.electron,[]);ctx.setLineDash([]);
 if(Number.isFinite(cursor)&&cursor>=xmin&&cursor<=xmax){ctx.strokeStyle=c.ink;ctx.beginPath();ctx.moveTo(X(cursor),25);ctx.lineTo(X(cursor),180);ctx.stroke();}
}

function mount(host,spec,api){
 const key='lab:'+spec.lesson,prior=store.get(key,{})?.discoveries?.[spec.id]||{};
 let seed=caseSeed(prior.seed??1),state=restoreControls(spec,seed,prior.state),mode=['Explore','Investigate','Challenge'].includes(prior.mode)?prior.mode:'Explore';
 let runs=findings(prior.runs).slice(0,3),result,revealed=false,audio=null;
 const events=new AbortController(),on=(node,event,fn)=>node.addEventListener(event,fn,{signal:events.signal});
 const title=el('h4',{class:'discovery-title'},spec.title),intro=el('p',{},spec.intro);
 const status=el('p',{class:'discovery-feedback',role:'status'}),modeBar=el('div',{class:'discovery-modes','aria-label':'How to investigate'});
 const controls=el('div',{class:'discovery-controls'}),extraControls=el('div',{class:'discovery-controls'}),more=el('details',{class:'discovery-more'},el('summary',{},'More apparatus controls'),extraControls);
 const instructions=el('section',{}),prediction=el('textarea',{'aria-label':'My prediction for this investigation',rows:2}),claim=el('textarea',{'aria-label':'My claim and evidence',rows:2});
 prediction.value=typeof prior.prediction==='string'?prior.prediction:'';claim.value=typeof prior.claim==='string'?prior.claim:'';
 const picture=el('div',{class:'discovery-picture',tabindex:0,role:'region','aria-label':'Calculated picture; choose a larger drawing to inspect labels'}),canvas=el('canvas',{width:640,height:300,role:'img','aria-label':spec.title});picture.append(canvas);
 const readings=el('ul',{class:'discovery-readings'}),summary=el('p',{}),plots=el('div',{}),runList=el('p',{class:'discovery-model-note'});
 const target=el('p',{}),guess=el('input',{type:'text',inputmode:'decimal','aria-label':'My measurement answer'}),answer=el('p',{class:'discovery-feedback'});
 const challenge=el('section',{class:'discovery-challenge'},target,field('My measurement answer',guess));
 const check=button('Check my measurement',()=>{
  if(!guess.value.trim()||!Number.isFinite(Number(guess.value))){status.textContent='Enter a finite number, in the unit named in the question.';return;}
  const q=result.challenge,ok=Math.abs(Number(guess.value)-q.answer)<=(q.tolerance??Math.max(.01,Math.abs(q.answer)*.02));
  status.textContent=ok?'Your result agrees within the reading tolerance. Explain how your evidence supports it.':'Compare the scale, units and the quantities you held fixed. You can try again or open the explanation.';
  if(ok){revealed=true;render();}
 });
 const reveal=button('Show the reasoning',()=>{revealed=true;render();});challenge.append(check,reveal,answer);
 const caseInput=el('input',{type:'number',min:0,max:2147483646,step:1,'aria-label':'Case number'});caseInput.value=seed;
 const caseTools=el('details',{class:'discovery-more'},el('summary',{},'Repeat this case or try another'),field('Case number',caseInput),
  button('Open this case',()=>newCase(caseSeed(caseInput.value))),button('Try another case',()=>newCase(nextCase(seed))));
 const stopSound=()=>{if(audio){audio.close().catch(()=>{});audio=null;}};
 const actions=el('div',{class:'discovery-actions'});
 const keep=button('Keep this run',()=>{
  if(runs.length>=3){status.textContent='Three runs are on the graph. Save findings in your notebook, then clear the comparison to start another.';return;}
  runs.push(finding(spec,state,result,{seed,prediction:prediction.value,claim:claim.value}));persist();render();
  status.textContent=`Kept run ${runs.length}. Change one setting and compare. Dashed lines retain the earlier settings.`;
 });
 const capture=button('Save this finding',()=>{
  const saved=store.get(key,{})||{},list=Array.isArray(saved.findings)?saved.findings:[];
  if(list.length>=30){status.textContent='This lesson has 30 saved findings. Export your notebook before starting a new collection.';return;}
  list.push(finding(spec,state,result,{seed,prediction:prediction.value,claim:claim.value}));
  store.set(key,{...saved,findings:list,t:Date.now()});App.emit('learn:change');
  status.textContent=store.available?'Saved with settings, readings and graphs in your notebook on this device.':'Kept for this visit. Export your notebook to keep the finding.';
 });
 const sheet=button('Save a paper experiment sheet',()=>{
  const rows=[...controlNodes.values()].filter(n=>!n.wrap.hidden).map(n=>`<li>${safe(n.control.label)}: ${safe(n.input.value)} ${safe(n.control.unit||'')}</li>`).join('');
  const q=mode==='Challenge'?result.challenge.prompt:spec.intro;
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>${safe(spec.title)}</title><style>body{font:18px/1.6 Georgia,serif;max-width:48rem;margin:2rem auto;padding:1rem}img{max-width:100%}table{border-collapse:collapse;width:100%}td,th{border:1px solid #777;height:3rem;padding:.5rem}</style><h1>${safe(spec.title)}</h1><p>The Moving World · model case ${seed}</p><p>${safe(q)}</p><ul>${rows}</ul><img alt="Calculated apparatus" src="${canvas.toDataURL()}"><h2>My prediction</h2><p>${safe(prediction.value)||'________________________________'}</p><table><tr><th>What I changed, with units</th><th>What I measured, with units</th></tr>${'<tr><td></td><td></td></tr>'.repeat(4)}</table><h2>My claim and evidence</h2><p>________________________________</p><p>Model limits: ${safe(spec.limits)}</p><p>This sheet is a virtual investigation unless the book gives a separate safe household procedure. Do not use mains electricity, flames or hot liquids.</p><p>${spec.sources.map(s=>`<a href="${safe(s)}">Physics source</a>`).join(' · ')}</p></html>`;
  download(`${spec.id}-case-${seed}.html`,html,'text/html;charset=utf-8');
 });
 actions.append(keep,button('Clear the comparison',()=>{runs=[];persist();render();}),capture,sheet,
  button('Inspect a larger drawing',()=>{picture.classList.toggle('is-large');picture.focus();}));
 if(spec.sound)actions.append(button('Hear this frequency',async()=>{
  stopSound();const tone=spec.sound(state,result),f=typeof tone==='number'?tone:tone.frequency;
  if(!Number.isFinite(f)||f<20||f>4000){status.textContent='This frequency is outside this short audible demonstration. Use the readings and graph.';return;}
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error();const active=audio=new Audio();await active.resume();if(audio!==active||!host.isConnected){active.close().catch(()=>{});return;}const oscillator=active.createOscillator(),gain=active.createGain();oscillator.frequency.value=f;gain.gain.setValueAtTime(.035,active.currentTime);gain.gain.exponentialRampToValueAtTime(.001,active.currentTime+.5);oscillator.connect(gain);gain.connect(active.destination);oscillator.start();oscillator.stop(active.currentTime+.55);oscillator.onended=()=>{if(audio===active)stopSound();};status.textContent=mode==='Challenge'&&!revealed?'A short tone. Keep your volume comfortable; use the trace to measure its frequency.':`A short ${fmt(f)} Hz tone. Keep your volume comfortable. The graph gives the same frequency without sound.`;}catch(_){stopSound();status.textContent='Sound is unavailable here. The frequency graph remains available.';}
 }));
 const sources=el('details',{class:'discovery-sources'},el('summary',{},'Why this model works, and where it stops'),el('p',{},spec.explanation),el('p',{},spec.limits),el('ul',{},spec.sources.map(url=>el('li',{},el('a',{href:url,target:'_blank',rel:'noopener'},url)))));
 const lesson=App.data.lessons.find(l=>l.id===spec.lesson);
 const links=el('nav',{'aria-label':'Return to the book'},el('a',{href:'#ch'+lesson.chapter},'Read this chapter'),el('span',{},' · '),el('a',{href:'#investigations'},'Choose another investigation'),el('span',{},' · '),el('a',{href:'#exam-directory'},'Revisit this idea in exam preparation'));
 const controlNodes=new Map();
 for(const [index,control] of spec.controls.entries()){
  const input=control.options?el('select',{'aria-label':control.label},control.options.map(([value,label])=>el('option',{value},label))):el('input',{type:'range',min:control.min,max:control.max,step:control.step,'aria-label':control.label});
  const output=el('output',{}),wrap=field(control.label,input);wrap.append(output);(index<3?controls:extraControls).append(wrap);controlNodes.set(control.key,{input,output,wrap,control});
  on(input,'input',()=>{state[control.key]=Number(input.value);revealed=false;guess.value='';stopSound();render();persist();});
 }
 const modeButtons=['Explore','Investigate','Challenge'].map(name=>{
  const b=button(name,()=>{mode=name;revealed=false;guess.value='';stopSound();render();persist();});modeBar.append(b);return b;
 });
 const persist=()=>{
  const saved=store.get(key,{})||{};
  store.set(key,{...saved,discoveries:{...(saved.discoveries||{}),[spec.id]:{seed,state,mode,prediction:prediction.value,claim:claim.value,runs}},t:Date.now()});
 };
 function newCase(value){seed=value;state=spec.initial(seed);caseInput.value=seed;revealed=false;guess.value='';stopSound();render();persist();status.textContent=`Case ${seed} is open. Kept runs remain for comparison; your written prediction and claim are unchanged.`;}
 function render(){
  result=spec.compute(state,seed);
  const concealed=mode==='Challenge'&&!revealed,q=result.challenge;
  modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===mode)));
  instructions.hidden=mode!=='Investigate';instructions.replaceChildren(el('ol',{},spec.investigation.map(s=>el('li',{},s))));
  for(const [key,n] of controlNodes){n.input.value=state[key];n.output.textContent=n.control.options?'':`${fmt(state[key])} ${n.control.unit||''}`;n.wrap.hidden=concealed&&(q.hideControls||[]).includes(key);}
  more.hidden=![...extraControls.children].some(e=>!e.hidden);
  const ctx=canvas.getContext('2d'),c=colors();ctx.fillStyle=c.plate;ctx.fillRect(0,0,640,300);
  spec.draw(ctx,{...state,__challenge:mode==='Challenge',__revealed:revealed},result,c);
  summary.textContent=concealed?q.evidence:result.summary;
  readings.replaceChildren(...result.readings.filter(r=>!concealed||!(q.hideReadings||[]).includes(r.label)).map(r=>el('li',{},`${r.label}: ${fmt(r.value)} ${r.unit||''}`)));
  plots.replaceChildren();
  for(const p of (result.plots||[]).filter(p=>!concealed||!(q.hidePlots||[]).includes(p.label))){
   const old=runs.flatMap(r=>(r.plots||[]).filter(a=>a.label===p.label&&a.xLabel===p.xLabel&&a.yLabel===p.yLabel));
   const cv=el('canvas',{width:640,height:220,role:'img','aria-label':`${p.label}: ${p.yLabel} against ${p.xLabel}`});graph(cv,p,old,result.cursor);
   plots.append(el('figure',{class:'discovery-plot'},el('figcaption',{},`${p.label} · ${p.yLabel} against ${p.xLabel}. Solid: this run. Dashed: retained runs.${p.zero===false?' Close-up vertical scale; it does not start at zero.':''}${Number.isFinite(result.cursor)?' Vertical line: the selected instant.':''}`),cv));
  }
  runList.textContent=runs.length?runs.map((r,i)=>`Run ${i+1}, case ${r.seed}: ${spec.controls.filter(c=>!concealed||!(q.hideControls||[]).includes(c.key)).map(c=>`${c.label} ${fmt(r.state[c.key])} ${c.unit||''}`).join('; ')}`).join(' | '):'No earlier run kept yet. Change one setting at a time.';
  challenge.hidden=mode!=='Challenge';target.textContent=q.prompt;answer.hidden=!revealed;answer.textContent=`${fmt(q.answer)} ${q.unit||''}. ${q.explanation}`;
  keep.disabled=capture.disabled=concealed;
  sources.hidden=concealed; // Explanations become available after the reader chooses to reveal.
 }
 on(prediction,'input',persist);on(claim,'input',persist);
 if(spec.onPoint){
  picture.append(el('p',{class:'discovery-model-note'},spec.pointerHint||'Choose a point on the picture. The controls offer the same changes with a keyboard.'));
  let drawing=false;
  const point=event=>{
   if(mode==='Challenge'&&!revealed)return;
   const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)/r.width*640,y=(event.clientY-r.top)/r.height*300;
   spec.onPoint(state,Math.max(0,Math.min(640,x)),Math.max(0,Math.min(300,y)));render();persist();
  };
  on(canvas,'pointerdown',event=>{drawing=true;canvas.setPointerCapture(event.pointerId);point(event);});
  on(canvas,'pointermove',event=>{if(drawing)point(event);});on(canvas,'pointerup',()=>{drawing=false;});on(canvas,'pointercancel',()=>{drawing=false;});
 }
 on(caseInput,'keydown',event=>{if(event.key==='Enter')newCase(caseSeed(caseInput.value));});
 const observer=new MutationObserver(()=>render());observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
 host.append(title,intro,modeBar,instructions,field('My prediction, if I want to write it',prediction),controls,more,picture,summary,readings,plots,runList,challenge,actions,
  field('My claim and evidence',claim),caseTools,el('p',{class:'discovery-model-note'},'These readings come from a calculated model. Nothing is recorded from your microphone or sensors. Your notes stay on this device.'),status,sources,links);
 render();
 const cleanup=()=>{events.abort();observer.disconnect();stopSound();};api?.onCleanup(cleanup);
 return {cleanup,stopSound};
}

function offer(stage,lessonId,api){
 for(const spec of specs.filter(s=>s.lesson===lessonId)){
  const detail=el('details',{class:'discovery-offer','data-discovery-activity':spec.id},el('summary',{},'Try a new investigation: '+spec.title));
  let mounted=null,closed=false;api.onCleanup(()=>{closed=true;});
  detail.addEventListener('toggle',()=>{if(closed||!detail.isConnected)return;if(detail.open&&!mounted)mounted=mount(detail,spec,api);if(!detail.open)mounted?.stopSound();});
  stage.append(detail);
  if(requested===spec.id){requested=null;detail.open=true;requestAnimationFrame(()=>detail.scrollIntoView({block:'start',behavior:'instant'}));}
 }
 if(lessonId==='m-newton')offerTrail(stage,api);
}

function directory(host){
 const bar=el('div',{class:'discovery-purpose','aria-label':'Choose an investigation purpose'}),list=el('ul',{class:'discovery-entries'}),count=el('p',{role:'status'});
 const buttons=[];
 const show=purpose=>{
  list.replaceChildren();
  for(const spec of specs.filter(s=>purpose==='all'||s.purpose===purpose)){
   const lesson=App.data.lessons.find(l=>l.id===spec.lesson);if(!lesson)continue;
   list.append(el('li',{},el('a',{href:'#'+lesson.target,'data-open-lesson':lesson.id,'data-discovery':spec.id},spec.title),el('span',{},' · chapter '+lesson.chapter)));
  }
  if(purpose==='all'||purpose==='test'){
   const lesson=App.data.lessons.find(l=>l.id==='m-newton');list.append(el('li',{},el('a',{href:'#'+lesson.target,'data-open-lesson':lesson.id,'data-discovery':'statement-trail'},'Find a path through the forces')));
  }
  buttons.forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===purpose)));count.textContent=`${list.children.length} investigations. Choose one; it opens beside its original lesson.`;
 };
 for(const [key,label] of Object.entries(purposes)){const b=button(label,()=>show(key));buttons.push([key,b]);bar.append(b);}
 host.append(bar,count,list,el('p',{class:'discovery-model-note'},'These original activities were inspired by ',el('a',{href:'https://www.drjonesphysics.com/apps',target:'_blank',rel:'noopener'},'Dr Jones Physics'),'. Physics sources and model limits are beside each activity.'));
 show('all');
}

function offerTrail(stage,api){
 const detail=el('details',{class:'discovery-offer','data-discovery-activity':'statement-trail'},el('summary',{},'Try a new investigation: Find a path through the forces'));
 stage.append(detail);let mounted=false;
 detail.addEventListener('toggle',()=>{if(!detail.open||mounted)return;mounted=true;trail(detail);});
 if(requested==='statement-trail'){requested=null;detail.open=true;requestAnimationFrame(()=>detail.scrollIntoView({block:'start',behavior:'instant'}));}
}
function trail(host){
 const route=[0,1,4,7,8],truth=[
  'Steady velocity can go with zero net force.',
  'A net force changes velocity.',
  'Equal and opposite forces on different objects do not cancel on one object.',
  'A larger mass needs a larger net force for the same acceleration.',
  'Friction can act without the surfaces sliding.'
 ],falsehood=[
  ['A forward net force is needed to keep a steady velocity.','A steady velocity needs zero net force; forces may still balance.'],
  ['An object has zero mass on the Moon.','Its mass is unchanged. Its weight is smaller in the Moon\'s gravitational field.'],
  ['Action and reaction act on the same object.','The two forces in an interaction pair act on different objects.'],
  ['Zero velocity always means zero acceleration.','A ball at the top of a vertical throw has zero velocity for an instant and downward acceleration.']
 ];
 const key='lab:m-newton',draft=store.get(key,{})?.trail||{};let seed=caseSeed(draft.seed??1),path=[],rejected=2;
 const grid=el('div',{class:'discovery-trail'}),status=el('p',{role:'status'}),correction=el('textarea',{'aria-label':'My correction to a rejected statement',rows:3});correction.value=typeof draft.correction==='string'?draft.correction:'';
 const sample=i=>route.includes(i)?truth[(route.indexOf(i)+seed)%truth.length]:falsehood[([2,3,5,6].indexOf(i)+seed)%falsehood.length][0];
 const save=()=>{store.set(key,{...store.get(key,{}),trail:{seed,correction:correction.value},t:Date.now()});App.emit('learn:change');};
 const render=()=>{grid.replaceChildren(...Array.from({length:9},(_,i)=>{
  const b=button(`${i+1}. ${sample(i)}`,()=>{
   const previous=path.at(-1),neighbour=previous===undefined?i===0:Math.abs(i%3-previous%3)+Math.abs(Math.floor(i/3)-Math.floor(previous/3))===1;
   if(!neighbour||path.includes(i)){status.textContent='Start at 1, then move to a neighbouring square horizontally or vertically. Use Start again to retrace your route.';return;}
   if(!route.includes(i)){rejected=i;status.textContent=`Statement ${i+1} needs repairing. Write a correction below, then continue along another neighbouring square.`;return;}
   path.push(i);status.textContent=i===8?'You reached 9. Now repair one statement you rejected and compare your explanation.':'That statement fits. Choose a neighbouring square.';render();
  });b.setAttribute('aria-pressed',String(path.includes(i)));return b;
 }));};
 correction.addEventListener('input',save);
 host.append(el('h4',{class:'discovery-title'},'Find a path through the forces'),el('p',{},'Start at 1 and reach 9. Move horizontally or vertically through statements that are true. When a statement fails, repair it in your own words.'),
  button('Use a plain list',()=>grid.classList.toggle('is-list')),grid,status,field('My correction to a rejected statement',correction),
  button('Compare my correction',()=>{const index=([2,3,5,6].indexOf(rejected)+seed)%falsehood.length;status.textContent=`Statement ${rejected+1}: ${falsehood[index][1]} Compare that reasoning with what you wrote. Your own wording can be different.`;save();}),
  button('Start again',()=>{path=[];render();status.textContent='Start again at 1. Your written correction is kept.';}),
  button('Try another trail',()=>{seed=nextCase(seed);path=[];render();save();status.textContent=`Trail ${seed}. The statements have moved; start at 1.`;}),
  el('p',{class:'discovery-model-note'},'There is one route through this arrangement. This is an ungraded way to revisit the chapter; no score is kept.'),el('a',{href:'#ch3'},'Return to forces and Newton’s laws'));
 render();
}

App.explorer('discovery',{mount,offer,directory});
