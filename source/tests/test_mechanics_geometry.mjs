import assert from 'node:assert/strict';
import {projectileDrawingScale, buoyancyForceAccount, clockwiseTangent,equalTimePositions} from '../live/mechanics_geometry.mjs';
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
// Hollowing increases displaced volume while preserving the same material mass.
const solid = buoyancyForceAccount(7800,.1,1000,.1,true);
const hull = buoyancyForceAccount(780,1,1000,.78,false);
close(solid.weight,7644); close(hull.weight,7644); close(hull.buoyancy,hull.weight);
close(solid.support,6664); close(solid.support+solid.buoyancy,solid.weight);
close(hull.support,0);
// Drawing extremes retain the entire physically computed trajectory.
for (const speed of [0,1,2,4]) for (const degrees of [-45,0,45]) {
  const angle=degrees*Math.PI/180, vx=speed*Math.cos(angle), vy=speed*Math.sin(angle);
  const time=(vy+Math.sqrt(vy*vy+2*9.8*.75))/9.8;
  const range=vx*time, scale=projectileDrawingScale(range,vy);
  assert.ok(range*scale<=450+1e-8);
  assert.ok((.75+Math.max(0,vy)**2/19.6)*scale<=192+1e-8);
}
// A velocity arrow must agree with the finite difference of clockwise motion.
for (const a of [0,.5,1.5,3,4.9]) {
  const tangent=clockwiseTangent(-Math.cos(a),-Math.sin(a));
  const da=1e-5, dx=(Math.cos(a+da)-Math.cos(a-da))/(2*da), dy=(Math.sin(a+da)-Math.sin(a-da))/(2*da);
  assert.ok(tangent.x*dx+tangent.y*dy>.999999);
  close(tangent.x*Math.cos(a)+tangent.y*Math.sin(a),0);
}
console.log('PASS mechanics: conserved hull mass, supported sinking body, trajectory bounds, velocity tangent');

// A shared strobe clock must not inherit irregular render/recording intervals.
const ticks=equalTimePositions([0,.023,.047,.091,.123,.224,.35].map(t=>({t,y0:3*t,y1:2*t})));
assert.equal(ticks.length,4);
ticks.forEach((p,i)=>{close(p.t,i*.1);close(p.y0,3*i*.1);close(p.y1,2*i*.1);});
console.log('PASS equal-time flashes: exact 0.1 s grid across irregular samples');
