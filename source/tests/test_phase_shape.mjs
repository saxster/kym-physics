import assert from 'node:assert/strict';
import {phaseDisc} from '../app/phase_shape.mjs';
for(const [angle,fraction]of [[0,0],[90,.5],[180,1],[270,.5],[360,0]])assert.ok(Math.abs(phaseDisc(angle).lit-fraction)<1e-12);
for(let a=0;a<360;a+=5){assert.ok(Math.abs(phaseDisc(a).lit-phaseDisc(360-a).lit)<1e-12);}
assert.equal(phaseDisc(0).path,'');assert.ok(phaseDisc(180).path.includes('0 1 1'));
console.log('PASS ideal lunar phase fraction, endpoints and waxing/waning symmetry.');
