import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { activities, trainAt, stopping, polygonCentroid, shapePoints, stickingCollision, bridgeReactions } from '../live/discovery_mechanics.mjs';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const by=id=>activities.find(a=>a.id===`discovery-${id}`);
function finite(value,path='result'){
 if(typeof value==='number')assert.ok(Number.isFinite(value),`${path} must be finite`);
 else if(Array.isArray(value))value.forEach((v,i)=>finite(v,`${path}[${i}]`));
 else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>finite(v,`${path}.${k}`));
}
// Draw smoke verifies finite coordinates and exercises all drawing branches, not visual layout.
const ctx=new Proxy({}, {get(_target,key){return (...args)=>args.forEach(a=>finite(a,`canvas.${String(key)}`));},set(){return true;}});
const lessonIds=new Set(['mechanics','investigations','waves','fields'].flatMap(name=>JSON.parse(readFileSync(new URL(`../lessons/${name}.json`,import.meta.url))).map(l=>l.id)));
assert.equal(activities.length,10);
assert.equal(new Set(activities.map(a=>a.id)).size,10);
let boundaryCases=0;
for(const activity of activities){
 assert.ok(lessonIds.has(activity.lesson),`${activity.id}: existing lesson`);
 for(const key of ['title','purpose','intro','explanation','limits'])assert.ok(activity[key]?.length,`${activity.id}: ${key}`);
 assert.ok(activity.investigation.length>=3);
 assert.ok(activity.sources.every(s=>s.startsWith('https://')));
 assert.deepEqual(activity.initial(17),activity.initial(17),'deterministic case');
 assert.notDeepEqual(activity.initial(1),activity.initial(2),'new case changes selected values');
 for(const seed of [0,1,17,999]){
  const initial=activity.initial(seed);
  const states=[initial];
  for(const control of activity.controls){
   const values=control.options?control.options.map(o=>o[0]):[control.min,control.max];
   for(const value of values)states.push({...initial,[control.key]:value});
  }
  // Also cover simultaneous minimums and maximums, not just one variable at a time.
  for(const side of ['min','max'])states.push(activity.controls.reduce((s,c)=>({...s,[c.key]:c.options?c.options[side==='min'?0:c.options.length-1][0]:c[side]}),{...initial}));
  for(const state of states){
   const before=structuredClone(state),result=activity.compute(state,seed);finite(result);assert.deepEqual(state,before,'compute is pure');
   assert.ok(Array.isArray(result.readings)&&Array.isArray(result.plots));
   assert.ok(Number.isFinite(result.challenge.answer));assert.ok(result.challenge.tolerance>0);assert.ok(result.challenge.evidence);
   const keys=new Set(activity.controls.map(c=>c.key)),labels=new Set(result.readings.map(r=>r.label));
   (result.challenge.hideControls||[]).forEach(k=>assert.ok(keys.has(k),`${activity.id}: hidden control ${k} exists`));
   (result.challenge.hideReadings||[]).forEach(k=>assert.ok(labels.has(k),`${activity.id}: hidden reading ${k} exists`));
   result.plots.forEach(p=>assert.ok(p.points.length>=2));
   activity.draw(ctx,state,result,{ink:'#111',accent:'#157',warm:'#b42'});
   activity.draw(ctx,{...state,__challenge:true,__revealed:false},result,{ink:'#111',accent:'#157',warm:'#b42'});
   boundaryCases++;
  }
 }
}
// Independent analytic examples, continuity and conservation checks.
const train={v1:8,v2:8,v3:0};
near(trainAt(train,2).x,4);near(trainAt(train,2).v,4);near(trainAt(train,2).a,2);
near(trainAt(train,12).x,64);near(trainAt(train,12).v,0);
for(const t of [4,8]){near(trainAt(train,t-1e-8).x,trainAt(train,t+1e-8).x,1e-6);near(trainAt(train,t-1e-8).v,trainAt(train,t+1e-8).v,1e-6);}
near(trainAt({v1:-8,v2:-8,v3:0},12).x,-64);
const stop=stopping(36,1,.5),twice=stopping(72,1,.5);
near(stop.thinking,10);near(stop.braking,100/9.8);near(stop.total,10+100/9.8);
near(twice.thinking/stop.thinking,2);near(twice.braking/stop.braking,4);
near(stopping(36,2,.5).braking,stop.braking);near(stopping(36,1,.25).braking,stop.braking*2);
const tri=polygonCentroid([[0,0],[6,0],[0,3]]);near(tri.area,9);near(tri.x,2);near(tri.y,1);
const reversed=polygonCentroid([[0,3],[6,0],[0,0]]);near(reversed.x,2);near(reversed.y,1);
const square=polygonCentroid([[-2,-2],[2,-2],[2,2],[-2,2]]);near(square.area,16);near(square.x,0);near(square.y,0);
const com=by('balance-shape'),cs=com.initial(1),old=shapePoints(cs);com.onPoint(cs,180,125);assert.equal(cs.extra,1);assert.equal(shapePoints(cs).length,old.length+1);finite(com.compute(cs));
const keyboard={...com.initial(1),extra:cs.extra,addAngle:cs.addAngle,addRadius:cs.addRadius};assert.deepEqual(shapePoints(cs),shapePoints(keyboard));
const comResult=com.compute(cs);for(const pin of comResult.pins){const p=comResult.points[pin],v=[comResult.centre.x-p[0],comResult.centre.y-p[1]];assert.ok(Math.hypot(...v)>0);}
const collision=stickingCollision(2,1,4,-2);near(collision.momentum,6);near(collision.final,2);near(collision.before,18);near(collision.after,6);near(collision.loss,12);
for(const m1 of [.5,4])for(const m2 of [.5,4])for(const u1 of [1,8])for(const u2 of [-4,0]){const p=stickingCollision(m1,m2,u1,u2);near((m1+m2)*p.final,m1*u1+m2*u2);assert.ok(p.loss>=-1e-8);}
const bridge=bridgeReactions(4,10,40,0);near(bridge.left,441);near(bridge.right,49);near(bridge.total,490);
for(const x of [0,1,2,4]){const p=bridgeReactions(4,10,40,x);near(p.left+p.right,490);near(p.right*4,98*2+392*x);}
const projectile=by('projectile'),ps={...projectile.initial(0),height:1.225,speed:4,time:1,target:2};const flight=projectile.compute(ps);near(flight.range,2);near(flight.point.height,0);near(flight.challenge.answer,4);
const rho=by('density');near(rho.compute({mass:200,volume:100,instrument:0}).rho,2000);near(rho.compute({mass:200,volume:100,instrument:2}).force,.98);near(rho.compute({mass:100,volume:200,instrument:3}).fraction,.5);
const earth=by('earth').compute({distance:800,angle:7.2,stick:1});near(earth.circumference,40000);near(earth.shadow,Math.tan(7.2*Math.PI/180));
const ruler=by('ruler'),rs={start:15,length:45,division:1};assert.deepEqual(ruler.compute(rs).ends,[15,60]);near(ruler.compute({...rs,start:25}).challenge.answer,45);
const repeat=by('repeats'),r0={truth:40,bias:0,scatter:1,resolution:.1};near(repeat.compute(r0).readings.find(r=>r.label==='Mean minus reference').value,0);near(repeat.compute({...r0,bias:3}).readings.find(r=>r.label==='Mean minus reference').value,3);
// Graph pointer and keyboard controls yield the same authored velocities.
const ts=by('train').initial(0);by('train').onPoint(ts,405,206);near(ts.v2,8);near(trainAt(ts,8).v,8);
console.log(`Discovery mechanics: 10 activities; ${boundaryCases} seeded control-boundary/draw cases; analytic, conservation, pointer and challenge-contract checks passed.`);
