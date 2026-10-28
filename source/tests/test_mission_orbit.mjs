import assert from 'node:assert/strict';
import { fitMissionOrbit, missionPeriodHours } from '../app/mission_orbit.mjs';

// Expected focus distances come from physical radii, independently of the fit.
const earth = [[170,36500],[173,41762],[226,41603],[233,71351],[288,369328]];
const moon = [[164,18074],[174,1437],[153,163],[25,134]];
for (const width of [280,390,460,720]) {
  for (const [radius, apsides] of [[6371,earth],[1737.1,moon]]) {
    for (const [peri,apo] of apsides) {
      const o = fitMissionOrbit(peri,apo,radius,width,300);
      assert.ok(Math.abs(o.a*o.a-o.b*o.b-o.c*o.c)<1e-7, 'body must occupy a focus');
      assert.ok(Math.abs((o.a-o.c)/o.pxPerKm-(radius+peri))<1e-7, 'nearest distance includes body radius');
      assert.ok(Math.abs((o.a+o.c)/o.pxPerKm-(radius+apo))<1e-7, 'farthest distance includes body radius');
      assert.ok(Math.abs(o.bodyRadius/o.pxPerKm-radius)<1e-7, 'body shares orbit scale');
      assert.ok(o.cx-o.a>=23.999 && o.cx+o.a<=width-23.999, 'ellipse fits horizontally');
      assert.ok(o.cy-o.b>=0 && o.cy+o.b<=300, 'ellipse fits vertically');
    }
  }
}
const circle=fitMissionOrbit(200,200,6371,460,300);
assert.equal(circle.eccentricity,0);
assert.equal(circle.a,circle.b);
assert.equal(circle.focusX,circle.cx);
const transfer=fitMissionOrbit(288,369328,6371,460,300);
assert.ok(Math.abs(transfer.eccentricity-(369328-288)/(369328+288+2*6371))<1e-12);
console.log('PASS mission ellipses: physical apsides, focus, circle, uniform body scale, four panel widths.');

// Independent known results catch confusing the transfer time with a full orbit.
assert.ok(Math.abs(missionPeriodHours(400,400,6371,398600)*60-92.4)<0.1);
assert.ok(Math.abs(missionPeriodHours(288,369328,6371,398600)-231.08)<0.01);
assert.ok(Math.abs(missionPeriodHours(174,1437,1737.1,4902.8)-3.196)<0.001);
console.log('PASS mission periods: 92.4 min circular LEO, 231.1 h full transfer ellipse, 3.2 h lunar ellipse.');
