import test from 'node:test';
import assert from 'node:assert/strict';
import {caseSeed, nextCase, restoreControls, finding, findings, findingMarkdown, plotBounds} from '../live/discovery_records.mjs';

test('a case has a reproducible bounded seed; invalid seeds cannot become a broken model',()=>{
 assert.equal(caseSeed('23'),23);assert.equal(caseSeed('-1'),1);assert.equal(caseSeed('no'),1);
 assert.equal(nextCase(1),48271);assert.equal(nextCase(0),48271);
});
test('restore uses declared controls and preserves new defaults, never out-of-range backup values',()=>{
 const spec={initial:()=>({speed:10,mode:0}),controls:[{key:'speed',min:0,max:30,step:1},{key:'mode',options:[[0,'A'],[1,'B']]}]};
 assert.deepEqual(restoreControls(spec,1,{speed:Infinity,mode:7}),{speed:10,mode:0});
 assert.deepEqual(restoreControls(spec,1,{speed:99,mode:1,attack:'<script>'}),{speed:30,mode:1});
});
test('a finding carries the actual controls, prediction, measurements and plot without aliasing live state',()=>{
 const spec={id:'train',title:'A train',limits:'Constant acceleration',sources:['https://example.org/physics'],controls:[{key:'speed',label:'Train speed',unit:'m/s'}]};
 const state={speed:10};const result={summary:'A model run',readings:[{label:'Distance',value:50,unit:'m'}],plots:[{label:'Motion',xLabel:'t (s)',yLabel:'x (m)',points:[[0,0],[5,50]]}]};
 const saved=finding(spec,state,result,{seed:3,prediction:'It goes further',claim:'I measured 50 m'});
 state.speed=20;result.plots[0].points[1][1]=100;
 assert.equal(saved.state.speed,10);assert.equal(saved.plots[0].points[1][1],50);
 assert.deepEqual(saved.settings,[{label:'Train speed',value:'10',unit:'m/s'}]);
 assert.equal(saved.source,'model');assert.equal(saved.seed,3);assert.match(findingMarkdown(saved),/It goes further/);
 assert.match(findingMarkdown(saved),/50 m/);assert.match(findingMarkdown(saved),/5 \| 50/);
});

test('a small transit dip has a labelled close-up scale; retained deeper dips remain in view',()=>{
 const p={zero:false,points:[[0,1],[.1,.9975],[.2,1]]};
 const b=plotBounds(p);assert.ok(b.ymin>.99);assert.ok(b.ymax>1);assert.ok(155*.0025/(b.ymax-b.ymin)>100);
 const wide=plotBounds(p,[{points:[[0,.96],[.1,1]]}]);assert.ok(wide.ymin<.96);
});

test('incomplete backup findings remain readable without admitting nonfinite graph points',()=>{
 const value=findings([{title:'Old finding',source:'model',plots:[{label:'Evidence',points:[[0,1],[1,Infinity]]}]}])[0];
 assert.deepEqual(value.state,{});assert.equal(value.seed,1);assert.deepEqual(value.plots[0].points,[[0,1]]);
 assert.doesNotThrow(()=>findingMarkdown(value));
});

test('malformed backup text cannot crash notebook export and large finite graphs keep their extrema',()=>{
 const malformed={title:'Old finding',source:'model',prediction:{toString:null},claim:{toString:null},limits:{toString:null},summary:{toString:null},plots:[{label:'Curve',xLabel:{toString:null},points:[[0,1]]}]};
 assert.doesNotThrow(()=>findingMarkdown(malformed));
 const points=Array.from({length:150000},(_,i)=>[i,i/2]);
 assert.deepEqual(plotBounds({points}),{xmin:0,xmax:149999,ymin:0,ymax:74999.5});
 assert.doesNotThrow(()=>findingMarkdown({title:'Large finding',source:'model',plots:[{label:'Curve',points}]}));
});
