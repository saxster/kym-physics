import assert from 'node:assert/strict';
import * as M from '../live/investigation_models.mjs';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
// Independent analytic examples: g=9.8, a 30-degree ramp and a one-metre drop.
near(M.rolling(.5,30,1).acceleration,3.2666666666666666);
near(M.rolling(1,30,1).acceleration,2.45);
near(M.rolling(.4,30,1).speed,Math.sqrt(14));
for(const inertia of [.4,.5,1]){
 const p=M.rolling(inertia,30,1);
 near(p.translation+p.rotation,9.8);
}
near(M.balance(.2,-.2,.4,.1,0).torque,0);
near(M.balance(.2,-.2,.4,.2,0).torque,-.392);
near(M.balance(.2,-.2,.4,.2,0).support,5.226666666666667);
near(M.balance(.2,-.2,.4,.2,0).alpha,-16.3333333333333);
near(M.balance(.2,-.2,.4,.2,0).netForce,-.6533333333333333);
near(M.yoyo(.5,.04,.01,1).acceleration,9.8/9);
near(M.yoyo(.5,.04,.01,1).translation+M.yoyo(.5,.04,.01,1).rotation,9.8);
near(M.spring(2,20,false).extension,.1);
assert.ok(M.spring(2,20,true).extension<.1);
near(M.gas(1,300).pressure,101325);
near(M.gas(.5,300).pressure,202650);
near(M.gas(1,600).pressure,202650);
near(M.diver(101325).volumeMl,10);
near(M.diver(202650).volumeMl,9.5);
assert.ok(M.diver(101325).buoyancy>M.diver(101325).weight);
assert.ok(M.diver(202650).buoyancy<M.diver(202650).weight);
near(M.bounce(1,.64).restitution,.8);
near(M.bounce(1,.64).fraction,.64);
assert.equal(M.bounce(0,1),null);
assert.equal(M.bounce(1,-1),null);
near(M.bounceTiming(1,.8).restitution,.8);near(M.bounceTiming(1,.8).firstHeight,1.225);
assert.equal(M.bounceTiming(0,1),null);
near(M.eddyDrop(0,0).distance,0);near(M.eddyDrop(0,2).duration,Math.sqrt(2/9.8));
assert.ok(M.eddyDrop(.2,2).duration>M.eddyDrop(0,2).duration);
for(const b of [0,.05,.2,.5])for(const t of [0,.2,.5,1,4]){
 const p=M.eddyDrop(b,t);assert.ok(p.distance<=1.00000001);near(p.potentialLost,p.kinetic+p.heat);
}
near(M.top(80,30).precession*2,M.top(160,30).precession*4);
near(M.lightClock(.6,2.5).gamma,1.25);
near(M.lightClock(.6,2.5).properTime,2);
const clock=M.lightClock(.6,1.25);
near(Math.hypot(clock.lightX,clock.lightY),1.25); // c=1, still on first outgoing leg
near(M.microwave(6.1,2.45).speed,298900000);
near(M.flashlight(0,3).emf,0);
const f=M.flashlight(2,4,2);near(f.work,f.stored+f.lightEnergy+f.windingLoss);
assert.ok(f.chargedVoltage<f.emf);assert.ok(f.voltage<f.chargedVoltage);
assert.equal(M.nucleon(2).charge,1);assert.equal(M.nucleon(1).charge,0);
const samples=M.decayEnsembles(64,2,10,4);
assert.deepEqual(samples,M.decayEnsembles(64,2,10,4));
assert.notDeepEqual(samples[0],samples[1]);
samples.forEach(s=>s.forEach((n,i)=>{assert.ok(n>=0&&n<=64);if(i)assert.ok(n<=s[i-1]);}));
const flight=M.discFlight(10,30,false);
near(flight.at(-1).y,0);near(flight.at(-1).x,10.3201270564,0.00001); // launched 1m above floor, g9.8
const air=M.discFlight(10,15,true);
assert.ok(air.length>2);assert.ok(air.every(p=>[p.x,p.y,p.vx,p.vy].every(Number.isFinite)));
for(const beta of [0,.1,.6,.8])for(const t of [.2,.7,1.8,2.7,4.7]){
 const a=M.lightClock(beta,t),b=M.lightClock(beta,t+1e-5);
 if(Math.floor(a.properTime)!==Math.floor(b.properTime))continue;
 near(Math.hypot(b.lightX-a.lightX,b.lightY-a.lightY)/1e-5,1,1e-8);
}
for(const speed of [5,10,15])for(const angle of [0,15,30,45]){
 const ps=M.discFlight(speed,angle,true);near(ps.at(-1).y,0);
 let previous=Infinity;
 for(const p of ps){const energy=.5*(p.vx**2+p.vy**2)+9.8*p.y;assert.ok(energy<=previous+1e-6);previous=energy;}
}
console.log('PASS investigation models: independent values, limits, conservation, event geometry, seeded samples');
