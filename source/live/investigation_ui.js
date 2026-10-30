import {normaliseRecord,points,summarise,csv,sourceLabel} from './investigation_records.mjs';

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
const button=(text,fn)=>{const b=el('button','live-ctl',text);b.type='button';b.addEventListener('click',fn);return b;};
export function download(name,body,type){
 const url=URL.createObjectURL(new Blob([body],{type})),a=el('a');a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function activity(stage,api,lesson){
 const store=window.App?.store,key='investigation:'+lesson.id,spec=lesson.observations;
 let record=normaliseRecord(store?.get(key,null)),predict=null,modelNote='';
 const panel=el('section','inv-activity'),quick=el('details','inv-quick'),long=el('details','inv-long');
 quick.open=true;quick.append(el('summary','', 'Try a short encounter'),el('p','',lesson.encounter));
 const setup=el('p','inv-meta',`Allow about ${lesson.minutes} minutes, plus ${lesson.preparation} minute${lesson.preparation===1?'':'s'} to prepare. These are planning estimates; take your time.`);
 long.append(el('summary','','Make an investigation'),setup,el('p','',lesson.materials));
 const steps=el('ol');lesson.procedure.forEach(s=>steps.append(el('li','',s)));long.append(steps);
 long.append(el('p','inv-note','Your observations stay on this device. Supplied examples are illustrative data, not measurements made by you. Model readings are kept separate.'));
 const status=el('p','inv-save');status.setAttribute('role','status');
 const save=()=>{store?.set(key,{...record,t:Date.now()});window.App?.emit('learn:change');status.textContent=store?.available?'Saved in your notebook on this device.':'Kept for this visit. Export the record to keep a copy.';};
 const field=(label,key,help)=>{
  const wrapper=el('label','inv-field',label),input=el('textarea');input.rows=2;input.value=record[key];input.setAttribute('aria-label',label);
  input.addEventListener('input',()=>{record[key]=input.value;save();});wrapper.append(input);if(help)wrapper.append(el('small','',help));long.append(wrapper);
 };
 field('What will you hold fixed?','controlled');
 field('Measurement resolution and units','resolution','Repeat-to-repeat spread does not include calibration error. State ruler divisions, timing resolution or other limits.');
 field('Setup notes','notes');
 const scroll=el('div','inv-table-scroll');scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Measurement table; scroll horizontally on a narrow screen');
 const table=el('table','inv-table'),head=el('thead'),tr=el('tr');
 [`${spec.x} (${spec.xUnit})`,`${spec.y} (${spec.yUnit})`,'Source','Trial note',''].forEach(s=>{const th=el('th','',s);th.scope='col';tr.append(th);});head.append(tr);
 const body=el('tbody');table.append(head,body);scroll.append(table);long.append(scroll);
 const validation=el('p','inv-note'),summary=el('p','inv-summary'),chart=api.canvas(640,220,`${spec.x} against ${spec.y}: circles are your observations, squares supplied examples, crosses model readings`);
 chart.cv.classList.add('inv-chart');long.append(chart.cv,validation,summary);
 const redraw=()=>{
  const ps=points(record,spec),c=api.colors(),ctx=chart.ctx;
  chart.clear(c.plate);ctx.strokeStyle=c.ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(55,20);ctx.lineTo(55,172);ctx.lineTo(605,172);ctx.stroke();
  const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y),xmin=Math.min(0,...xs),ymin=Math.min(0,...ys),xmax=Math.max(1,...xs),ymax=Math.max(1,...ys);
  ctx.font='13px sans-serif';ctx.fillStyle=c.ink;ctx.fillText(`${spec.y} (${spec.yUnit})`,60,16);ctx.fillText(`${spec.x} (${spec.xUnit})`,200,210);
  ctx.fillText(String(Number(ymax.toPrecision(4))),4,37);ctx.fillText(String(Number(xmax.toPrecision(4))),560,190);ctx.fillText(String(xmin),38,190);
  for(const p of ps){const x=55+(p.x-xmin)/(xmax-xmin)*545,y=172-(p.y-ymin)/(ymax-ymin)*140;ctx.strokeStyle=p.source==='mine'?c.electron:p.source==='supplied'?c.proton:c.ink;
   ctx.beginPath();if(p.source==='mine')ctx.arc(x,y,5,0,Math.PI*2);else if(p.source==='supplied')ctx.rect(x-4,y-4,8,8);else{ctx.moveTo(x-4,y-4);ctx.lineTo(x+4,y+4);ctx.moveTo(x-4,y+4);ctx.lineTo(x+4,y-4);}ctx.stroke();}
  if(predict){
   // Hollow diamonds compare the current ideal model at the same x as each observation.
   for(const p of ps){const expected=predict(p.x);if(!Number.isFinite(expected)||expected<ymin||expected>ymax)continue;
    const x=55+(p.x-xmin)/(xmax-xmin)*545,y=172-(expected-ymin)/(ymax-ymin)*140;ctx.strokeStyle=c.green;ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+5,y);ctx.lineTo(x,y+5);ctx.lineTo(x-5,y);ctx.closePath();ctx.stroke();
   }
  }
  const invalid=record.rows.length-ps.length;
  validation.textContent=record.rows.length?`${ps.length} complete numeric trial${ps.length===1?'':'s'} plotted.${invalid?` ${invalid} incomplete or out-of-range trial${invalid===1?' is':'s are'} not plotted; enter finite values in the stated ranges.`:''}`:'No measurements yet. Add a trial, enter your readings, or add the supplied examples.';
  const repeat=summarise(record,spec).filter(g=>g.count>1);
  summary.textContent=repeat.length?repeat.map(g=>`${sourceLabel(g.source)} at ${g.x} ${spec.xUnit}${g.condition?' ('+g.condition+')':''}: n=${g.count}, mean ${g.mean.toPrecision(4)} ${spec.yUnit}, range ${g.range.toPrecision(3)} ${spec.yUnit}.`).join(' '):'Repeat the same setting to compare the mean and range within each data source. Keep the physical conditions fixed within a repeated setting. A range is not a full uncertainty estimate.';
  if(predict){summary.textContent+=' Green diamonds: current model at each observed x. '+modelNote;
   const residuals=ps.map(p=>{const e=predict(p.x);return Number.isFinite(e)?`${p.x} ${spec.xUnit}: observed ${p.y}, model ${Number(e.toPrecision(4))} ${spec.yUnit}`:null;}).filter(Boolean);
   if(residuals.length)summary.textContent+=' '+residuals.join('; ')+'.';
  }
  if(lesson.renderer==='bounce'){
   const ratios=ps.filter(p=>p.x>0).map(p=>`Trial ${p.index+1}: energy fraction ${Number((p.y/p.x).toPrecision(4))}, speed ratio ${Number(Math.sqrt(p.y/p.x).toPrecision(4))}${p.y>p.x?' (rebound exceeds release: check calibration, release and possible energy input)':''}`);
   if(ratios.length)summary.textContent+=' '+ratios.join('; ')+'.';
  }
  if(lesson.renderer==='microwave'&&ps.length)summary.textContent+=' Speed estimates (2df): '+ps.map(p=>`${(2*p.x/100*p.y*1e9).toExponential(4)} m/s`).join(', ')+'.';
  if(lesson.renderer==='bounceTiming'&&ps.length)summary.textContent+=' Interval results: '+ps.filter(p=>p.x>0).map(p=>`e=${Number((p.y/p.x).toPrecision(4))}, energy fraction=${Number((p.y/p.x)**2).toPrecision(4)}`).join('; ')+'.';
 };
 function renderRows(){
  body.replaceChildren();record.rows.forEach((row,i)=>{
   const tr=el('tr');
   for(const [key,label] of [['x',spec.x],['y',spec.y],['source','Source'],['note','Trial note']]){
    const td=el('td'),input=el(key==='source'?'select':'input');
    if(key==='source')for(const s of ['mine','supplied','model']){const o=el('option','',sourceLabel(s));o.value=s;input.append(o);}
    else{input.type='text';if(key!=='note')input.inputMode='decimal';}
    input.value=row[key];input.setAttribute('aria-label',`${label}, trial ${i+1}`);
    input.addEventListener('input',()=>{row[key]=input.value;save();redraw();});td.append(input);tr.append(td);
   }
   const td=el('td'),remove=button('Remove',()=>{record.rows.splice(i,1);renderRows();save();redraw();});remove.setAttribute('aria-label',`Remove trial ${i+1}`);td.append(remove);tr.append(td);body.append(tr);
  });
 }
 const addRows=rows=>{if(record.rows.length+rows.length>100){status.textContent='This record holds up to 100 trials. Export it before starting another set.';return;}record.rows.push(...rows);renderRows();save();redraw();};
 const actions=el('div','inv-actions');actions.append(button('Add a trial',()=>{addRows([{x:'',y:'',source:'mine',note:''}]);body.lastElementChild?.querySelector('input')?.focus();}),
  button('Add supplied examples',()=>addRows(spec.samples.map(([x,y])=>({x:String(x),y:String(y),source:'supplied',note:spec.sampleNote||'Illustrative supplied example'})))),
  button('Export measurements (CSV)',()=>download(lesson.id+'-measurements.csv',csv(record,spec),'text/csv;charset=utf-8')));
 long.append(actions);field('My claim and supporting observations','claim');field('What result would change my explanation?','changeMind');long.append(status);
 const theory=el('details','inv-theory');theory.append(el('summary','','From the observation to the equation'));
 const reasoning=el('ol');lesson.derivation.forEach(s=>reasoning.append(el('li','',s)));theory.append(reasoning,el('p','inv-worked',lesson.worked));
 const challenge=el('aside','inv-challenge');challenge.append(el('strong','','Try a changed case'),el('p','',lesson.challenge));
 const links=el('nav','inv-links');links.setAttribute('aria-label','Connected investigations');
 for(const id of lesson.connections){const target=window.App?.data.lessons.find(l=>l.id===id);if(!target)continue;const a=el('a','',target.title);a.href='#'+target.target;a.dataset.openLesson=id;links.append(a);}
 if(lesson.renderer==='bounce'){
  const target=document.querySelector('figure[data-live="videotrack"]');
  if(target){const a=el('a','','Analyse a local video');a.href='#'+target.id;a.dataset.openOriginal='videotrack';a.dataset.returnInvestigation=lesson.id;links.prepend(a);}
 }
 const home=el('a','','Back to everyday investigations');home.href='#investigations';links.append(home);
 const sources=el('details','inv-sources');sources.append(el('summary','','Sources for this investigation'));
 const ul=el('ul');lesson.sources.forEach((url,i)=>{const li=el('li'),a=el('a','',`Physics source ${i+1}`);a.href=url;a.target='_blank';a.rel='noopener';li.append(a);ul.append(li);});sources.append(ul);
 panel.append(quick,long,theory,challenge,links,sources);
 stage.querySelector('.lab-prediction').after(panel);
 renderRows();redraw();api.loop(()=>redraw());
 // Put extended work after the model, while keeping the encounter before it.
 stage.append(long,theory,challenge,links,sources);
 return {record(reading){long.open=true;addRows([{x:String(reading[0]),y:String(reading[1]),source:'model',note:reading[2]||'Calculated model reading'}]);status.scrollIntoView({block:'nearest'});},
  compare(fn,note){predict=fn;modelNote=note;redraw();},redraw};
}
