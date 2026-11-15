// Evidence remains in the existing lab record and notebook, with model provenance.
export function caseSeed(value){const n=Number(value);return Number.isSafeInteger(n)&&n>=0&&n<2147483647?n:1;}
export const nextCase=seed=>(Math.max(1,caseSeed(seed))*48271)%2147483647;
const clone=value=>JSON.parse(JSON.stringify(value));
const text=value=>typeof value==='string'?value:'';
export function plotBounds(plot,previous=[]){
 let xmin=0,xmax=1e-9,ymin=Infinity,ymax=-Infinity;
 for(const p of [...previous,plot])for(const point of p.points||[]){
  if(!Array.isArray(point)||point.length!==2||!point.every(Number.isFinite))continue;
  xmin=Math.min(xmin,point[0]);xmax=Math.max(xmax,point[0]);ymin=Math.min(ymin,point[1]);ymax=Math.max(ymax,point[1]);
 }
 if(ymin===Infinity)return {xmin:0,xmax:1,ymin:0,ymax:1};
 if(plot.zero===false){const pad=Math.max(ymax-ymin,Math.abs(ymax)*.001,1e-9)*.08;ymin-=pad;ymax+=pad;}
 else{ymin=Math.min(0,ymin);ymax=Math.max(ymin+1e-9,ymax);}
 return {xmin,xmax,ymin,ymax};
}
export function restoreControls(spec,seed,raw){
 const state=spec.initial(caseSeed(seed));
 if(!raw||typeof raw!=='object')return state;
 for(const control of spec.controls){
  const v=raw[control.key];if(typeof v!=='number'||!Number.isFinite(v))continue;
  if(control.options){if(control.options.some(([key])=>key===v))state[control.key]=v;}
  else state[control.key]=Math.max(control.min,Math.min(control.max,v));
 }
 return state;
}
export function finding(spec,state,result,{seed=1,prediction='',claim=''}={}){
 return clone({version:1,activity:spec.id,title:spec.title,source:'model',seed:caseSeed(seed),
  state,settings:(spec.controls||[]).map(c=>({label:c.label,value:String(c.options?.find(([value])=>value===state[c.key])?.[1]??state[c.key]),unit:c.unit||''})),
  readings:result.readings,plots:result.plots||[],summary:result.summary,
  prediction,claim,limits:spec.limits,sources:spec.sources,t:Date.now()});
}
// Backups are user-controlled input. Only finite plotted values reach the renderer.
export function findings(value){
 if(!Array.isArray(value))return [];
 return value.filter(v=>v&&typeof v==='object'&&typeof v.title==='string'&&v.source==='model').map(v=>({
  ...v,state:v.state&&typeof v.state==='object'&&!Array.isArray(v.state)?v.state:{},seed:caseSeed(v.seed??1),
  prediction:text(v.prediction),claim:text(v.claim),limits:text(v.limits),summary:text(v.summary),
  settings:(Array.isArray(v.settings)?v.settings:[]).filter(s=>s&&typeof s.label==='string'&&typeof s.value==='string').map(s=>({...s,unit:text(s.unit)})),
  readings:(Array.isArray(v.readings)?v.readings:[]).filter(r=>r&&typeof r.label==='string'&&Number.isFinite(r.value)).map(r=>({...r,unit:text(r.unit)})),
  plots:(Array.isArray(v.plots)?v.plots:[]).filter(p=>p&&typeof p.label==='string'&&Array.isArray(p.points)).map(p=>({...p,xLabel:text(p.xLabel),yLabel:text(p.yLabel),points:p.points.filter(a=>Array.isArray(a)&&a.length===2&&a.every(Number.isFinite))})),
  sources:(Array.isArray(v.sources)?v.sources:[]).filter(u=>typeof u==='string'&&u.startsWith('https://')),
 }));
}
export function findingMarkdown(raw){
 const f=findings([raw])[0];if(!f)return '';
 const lines=[`### ${f.title}`,`Model reading · case ${f.seed}`,'',`I predicted: ${f.prediction||'(in my head)'}`,
  `My claim: ${f.claim||'(not recorded)'}`,'',`Settings: ${f.settings.map(s=>`${s.label}: ${s.value} ${s.unit||''}`).join('; ')}`,f.summary||'',
  ...f.readings.map(r=>`${r.label}: ${r.value} ${r.unit||''}`),''];
 for(const plot of f.plots){
  const cell=s=>String(s||'').replaceAll('|','\\|').replaceAll('\n',' ');
  lines.push(plot.label,`| ${cell(plot.xLabel)} | ${cell(plot.yLabel)} |`,'| --- | --- |');
  for(const [x,y] of plot.points)lines.push(`| ${x} | ${y} |`);
  lines.push('');
 }
 lines.push(`Model limits: ${f.limits||''}`,`Sources: ${f.sources.join(', ')}`,'');
 return lines.join('\n');
}
