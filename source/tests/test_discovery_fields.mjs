import assert from 'node:assert/strict';
import fs from 'node:fs';
import {activities,repairCircuit,sensorResistance,sensorOutput,machineState,spectralPatterns,starEvidence,discOverlap,planetEvidence,detectedDecay,distancePattern} from '../live/discovery_fields.mjs';
const near=(actual,expected,tolerance=1e-9)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} expected ${expected}`);
const at=id=>activities.find(a=>a.id===id);
const lessons=new Set(['fields','mechanics','waves','investigations'].flatMap(name=>JSON.parse(fs.readFileSync(new URL(`../lessons/${name}.json`,import.meta.url))).map(a=>a.id)));
assert.equal(activities.length,7);assert.equal(new Set(activities.map(a=>a.id)).size,7);
// Literal values calculated independently from circuit conservation and declared sensor laws.
let q=repairCircuit({connection:0,switch:0,reversed:0,meter:0,voltage:6,resistance:330});near(q.led,0);near(q.lamp,0);
q=repairCircuit({connection:1,switch:0,reversed:0,meter:0,voltage:6,resistance:330});near(q.lamp,0);assert.ok(q.led>0);
q=repairCircuit({connection:1,switch:1,reversed:1,meter:1,voltage:6,resistance:330});near(q.led,0);near(q.lamp,6/220);near(q.meter,-6000/220);near(q.sourcePower,36/220);
q=repairCircuit({connection:1,switch:1,reversed:0,meter:2,voltage:6,resistance:330});near(q.meter,6);
near(sensorResistance(0,100),10000);near(sensorResistance(0,20),30851.69313600048,1e-7);near(sensorResistance(1,25),10000);near(sensorResistance(1,50),3588.182581929083,1e-7);
near(sensorOutput({sensor:1,environment:25,fixed:10000,position:0}).voltage,2.5);
near(sensorOutput({sensor:1,environment:25,fixed:10000,position:1}).voltage,2.5);
const hot={sensor:1,environment:50,fixed:10000,position:0};assert.ok(sensorOutput(hot).voltage>2.5);near(sensorOutput(hot).voltage+sensorOutput({...hot,position:1}).voltage,5);
q=machineState({angle:90,current:2,field:.5,turns:10,omega:2});near(q.force,2);near(q.m.torque,.4);near(q.g.voltage,.4);near(q.speakerDisplacement,.1);
near(machineState({angle:0,current:2,field:.5,turns:10,omega:2}).m.torque,0);near(machineState({angle:90,current:2,field:.5,turns:10,omega:0}).g.voltage,0);
assert.deepEqual(spectralPatterns[0].lines,[410.174,434.046,486.136,656.285]);
q=starEvidence({element:0,temperature:10000,velocity:0});near(q.peak,289.7771955);near(q.observed[3],656.285);
q=starEvidence({element:2,temperature:5000,velocity:299.792458});near(q.observed[0],589.583995);near(q.observed[1],590.181592);
near(discOverlap(0,.1),Math.PI*.01);near(discOverlap(2,.1),0);near(discOverlap(1,1),1.228369698608757,1e-12);
const orbit={inclination:90,radius:.1,mass:1,phase:0};q=planetEvidence(orbit);near(q.flux,.99);near(q.rv,0);near(q.periodDays,3.661251516198477,1e-9);near(q.amplitude,131.7804872142784,1e-8);
near(planetEvidence({...orbit,phase:.5}).flux,1);near(planetEvidence({...orbit,inclination:80}).depth,0);assert.ok(planetEvidence({...orbit,inclination:80}).amplitude>120);near(planetEvidence({...orbit,inclination:0}).amplitude,0);
near(planetEvidence({...orbit,mass:0}).amplitude,0);
for(const kind of [0,1,2]){near(distancePattern(kind,1),1);near(distancePattern(kind,2),.25);near(distancePattern(kind,3),1/9);}near(distancePattern(3,5),1);
const decayActivity=at('d-decay-evidence'),ds={sample:1000,halfLife:6,time:6,background:0},dr=decayActivity.compute(ds,39);near(dr.readings[1].value,500);near(dr.readings[2].value,57.7622650466621);
assert.deepEqual(detectedDecay(100,6,25,45,2),detectedDecay(100,6,25,45,2));assert.notDeepEqual(detectedDecay(100,6,25,45,2),detectedDecay(100,6,25,46,2));
assert.deepEqual(detectedDecay(0,6,5,45,0),[0,0,0,0,0]);
assert.notDeepEqual(dr.plots[0].points,dr.plots[1].points);assert.notDeepEqual(dr.plots[1].points,dr.plots[2].points);
for(const p of dr.plots.slice(0,3))for(let i=1;i<p.points.length;i++)assert.ok(p.points[i][1]<=p.points[i-1][1]);
// A silent drawing context checks every numeric argument, including all slider extremes.
const ctx=new Proxy({}, {get:(_,name)=>name==='measureText'?()=>({width:20}):(...args)=>{for(const x of args.flat(Infinity))if(typeof x==='number')assert.ok(Number.isFinite(x),`nonfinite drawing ${name}`);},set:()=>true});
const finite=value=>{if(typeof value==='number')assert.ok(Number.isFinite(value));else if(Array.isArray(value))value.forEach(finite);else if(value&&typeof value==='object')Object.values(value).forEach(finite);};
let cases=0;
for(const a of activities){
 assert.ok(lessons.has(a.lesson),a.lesson);assert.ok(a.investigation.length>=3);assert.ok(a.sources.every(s=>s.startsWith('https://')));
 assert.deepEqual(a.initial(15),a.initial(15));assert.notDeepEqual(a.initial(15),a.initial(16));
 const states=[a.initial(15)];
 // Individual choices plus the Cartesian extreme corners: finite endpoints are part of the public contract.
 for(const control of a.controls)for(const v of control.options?control.options.map(v=>v[0]):[control.min,control.max])states.push({...a.initial(15),[control.key]:v});
 const corners=a.controls.reduce((states,c)=>states.flatMap(s=>(c.options?[c.options[0][0],c.options.at(-1)[0]]:[c.min,c.max]).map(v=>({...s,[c.key]:v}))),[a.initial(15)]);states.push(...corners);
 for(const s of states){const result=a.compute(s,15);finite(result);assert.ok(result.summary);assert.ok(result.challenge.evidence);assert.ok(result.challenge.tolerance>=0);assert.ok(result.readings.every(r=>typeof r.value==='number'));assert.ok(result.plots.every(p=>p.points.length>=2));a.draw(ctx,s,result,{});a.draw(ctx,{...s,__challenge:true,__revealed:false},result,{});cases++;}
}
// Unknown properties stay off the corresponding controls; evidence values remain measurable.
for(let task=0;task<3;task++){const a=at('d-star-case'),result=a.compute({...a.initial(2),task},2);assert.deepEqual(result.challenge.hideControls,[["element"],["temperature"],["velocity"]][task]);assert.ok(!result.readings.some(r=>/temperature|velocity|element/i.test(r.label)));}
assert.deepEqual(at('d-machine-trail').compute({...at('d-machine-trail').initial(2),mode:1},2).challenge.hideControls,['omega']);
console.log(`Discovery fields: numeric assertions and ${cases} endpoint/render-contract cases passed.`);

// Selected series resistances must all appear in the fixed-drop design account.
const resistorCase=at('d-circuit-repair'),base=resistorCase.initial(1);
near(resistorCase.compute({...base,voltage:6,connection:0}).challenge.answer,0);
near(resistorCase.compute({...base,voltage:6,connection:1}).challenge.answer,190);
near(resistorCase.compute({...base,voltage:9,connection:0}).challenge.answer,120);
