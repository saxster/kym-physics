import assert from 'node:assert/strict';
import {Color} from 'three';
import {makeColourResolver} from '../live/css_colour.mjs';

let created=0,reads=0,style;
const resolve=makeColourResolver(()=>{
  created++;
  return {getContext(kind,options){
    assert.equal(kind,'2d');assert.equal(options.colorSpace,'srgb');
    return {clearRect(){},set fillStyle(v){style=v;},fillRect(){},getImageData(x,y,w,h,options){
      assert.equal(options.colorSpace,'srgb');reads++;
      // Browser readback is covered by the real light/dark IAB screenshots.
      return {data:new Uint8ClampedArray(style.includes('.93')?[247,126,93,255]:[66,182,216,255])};
    }};
  }};
});
assert.equal(resolve('#356d83'),'#356d83');assert.equal(resolve('rgba(1,2,3,.5)'),'rgba(1,2,3,.5)');assert.equal(created,0);
const blue='color(display-p3 .44 .71 .83)',red='color(display-p3 .93 .52 .40)';
assert.equal(resolve(blue),'#42b6d8');assert.equal(resolve(blue),'#42b6d8');assert.equal(reads,1);
assert.equal(resolve(red),'#f77e5d');assert.equal(created,1);assert.equal(reads,2);
const warnings=[],warn=console.warn;console.warn=v=>warnings.push(v);
try { assert.notEqual(new Color(resolve(blue)).getHex(),0xffffff);assert.notEqual(new Color(resolve(red)).getHex(),0xffffff); }
finally { console.warn=warn; }
assert.deepEqual(warnings,[],'Renderer receives supported colour syntax rather than CSS Color 4');
console.log('CSS colour: native sRGB readback contract, lazy allocation, memoisation and actual Three parser PASS');
