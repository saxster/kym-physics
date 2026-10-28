import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// The annotation table is standalone authored JavaScript; load it without altering
// the application's module configuration or coupling checks to the build output.
const file=await readFile(new URL('../live/enhancements.js',import.meta.url));
const {ENHANCEMENTS:E}=await import('data:text/javascript;base64,'+file.toString('base64'));
const state=(nums={},tabs=[],readout='')=>({num:(k,f)=>nums[k]??f,tab:i=>tabs[i]??0,readout:()=>readout,interacted:false,watched:false});
// Independent electrical account: 9V - 3×2V = 3V across330Ω =>9.09mA.
const circuit=E.circuit.yourNumbers(state({Battery:9},[2]));
assert.match(circuit,/9\.1 mA/);assert.match(circuit,/resistor = 3\.0 V/);
assert.match(E.circuit.yourNumbers(state({Battery:6},[2])),/I = 0/);
assert.equal(E.circuit.challenge.check(state({Battery:9},[2])),true);
assert.equal(E.circuit.challenge.check(state({Battery:6},[2])),false);
// A table must agree with actual offered coil-turn choices and the eye's physical mapping.
for(const [index,turns]of [1,10,50,200].entries()){
 assert.match(E.induction.yourNumbers(state({Turns:index})),new RegExp(`N = ${turns} turns`));
}
const eye=E.eye3d.yourNumbers(state({'Object distance':50}));
assert.match(eye,/500/);assert.doesNotMatch(eye,/2\.4 cm/);
assert.doesNotMatch(E.magnetometer.idealised,/subtracted by the browser/);
assert.doesNotMatch(E.phases.watch[2].caption,/5° orbital tilt/);
console.log('PASS annotation fidelity: LED threshold/current, coil turns, eye distances and sensor/phase limitations');
assert.equal(E.seriesparallel.challenge.check(state({LEDs:3},[1],'Unclip one LED to test the branches.')),false);
assert.equal(E.seriesparallel.challenge.check(state({LEDs:3},[1],'Parallel with LED 1 unclipped: other branches remain.')),true);
assert.equal(E.refraction.challenge.check(state({'Arriving angle':35},[2],'Diamond: Some light reflects at the surface.')),false);
assert.equal(E.refraction.challenge.check(state({'Arriving angle':35},[2],'Diamond to air: total internal reflection')),true);
console.log('PASS challenge boundaries: ordinary reflection and an unbroken circuit do not earn completion');
