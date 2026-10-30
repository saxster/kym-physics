const string=v=>typeof v==='string'?v:typeof v==='number'&&Number.isFinite(v)?String(v):'';
export function normaliseRecord(value){
 const r=value&&typeof value==='object'?value:{};
 return {version:1,controlled:string(r.controlled),resolution:string(r.resolution),notes:string(r.notes),
  claim:string(r.claim),changeMind:string(r.changeMind),
  rows:(Array.isArray(r.rows)?r.rows:[]).filter(v=>v&&typeof v==='object').map(v=>({
   x:string(v.x),y:string(v.y),source:['mine','supplied','model'].includes(v.source)?v.source:'mine',note:string(v.note)}))};
}
export const sourceLabel=s=>({mine:'My observation',supplied:'Supplied observation',model:'Model reading'}[s]||'My observation');
export function points(record,spec){
 return record.rows.flatMap((r,i)=>{
  const x=Number(r.x),y=Number(r.y);
  return r.x.trim()!==''&&r.y.trim()!==''&&Number.isFinite(x)&&Number.isFinite(y)&&
   (spec.minX===undefined||x>=spec.minX)&&(spec.minY===undefined||y>=spec.minY)?[{x,y,source:r.source,index:i}]:[];
 });
}
export function summarise(record,spec){
 const groups=new Map();
 for(const p of points(record,spec)){
  // Never pool a supplied/model value with a learner's physical observations.
  const key=p.x+':'+p.source+(p.source==='model'?':'+record.rows[p.index].note:'');
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);
 }
 return [...groups.values()].map(ps=>({x:ps[0].x,source:ps[0].source,condition:ps[0].source==='model'?record.rows[ps[0].index].note:'',count:ps.length,
  mean:ps.reduce((n,p)=>n+p.y,0)/ps.length,range:Math.max(...ps.map(p=>p.y))-Math.min(...ps.map(p=>p.y))}));
}
const cell=v=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s)&&!/^[-+]?\d+(\.\d*)?(e[-+]?\d+)?$/i.test(s.trim()))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function csv(record,spec){
 return [[`${spec.x} (${spec.xUnit})`,`${spec.y} (${spec.yUnit})`,'Source','Trial note'],
 ...record.rows.map(r=>[r.x,r.y,sourceLabel(r.source),r.note]),[],
 ['Held fixed',record.controlled],['Resolution',record.resolution],['Setup notes',record.notes],
 ['Claim',record.claim],['What would change my explanation',record.changeMind]]
 .map(row=>row.map(cell).join(',')).join('\r\n');
}
export function markdown(record,spec){
 const safe=s=>String(s).replaceAll('|','\\|').replaceAll('\n',' ');
 const lines=[`Measurements: ${spec.x} (${spec.xUnit}) → ${spec.y} (${spec.yUnit})`,'',
  `| ${safe(spec.x)} (${safe(spec.xUnit)}) | ${safe(spec.y)} (${safe(spec.yUnit)}) | Source | Note |`,
  '| --- | --- | --- | --- |',...record.rows.map(r=>'| '+[r.x,r.y,sourceLabel(r.source),r.note].map(safe).join(' | ')+' |'),''];
 for(const [label,key] of [['Held fixed','controlled'],['Resolution','resolution'],['Setup notes','notes'],['Claim','claim'],['What would change my explanation','changeMind']])if(record[key])lines.push(`${label}: ${record[key]}`,'');
 return lines.join('\n');
}
