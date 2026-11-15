import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {activities as mechanics} from '../live/discovery_mechanics.mjs';
import {activities as waves} from '../live/discovery_waves.mjs';
import {activities as fields} from '../live/discovery_fields.mjs';
const all=[...mechanics,...waves,...fields];
test('every accepted idea maps to an activity or a shared reader capability',()=>{
 const coverage=JSON.parse(fs.readFileSync(new URL('../../docs/discovery-coverage.json',import.meta.url)));
 assert.deepEqual(Object.keys(coverage).map(Number),Array.from({length:32},(_,i)=>i+1));
 const ids=new Set([...all.map(a=>a.id),'all','notebook-findings','statement-trail','seeded-cases','paper-sheet','purpose-directory']);
 for(const [idea,entries] of Object.entries(coverage)){assert.ok(entries.length,idea);for(const id of entries)assert.ok(ids.has(id),`${idea}: ${id}`);}
});
test('all activities attach to real existing lessons and expose evidence and original sources',()=>{
 const lessons=['mechanics','waves','fields','investigations'].flatMap(name=>JSON.parse(fs.readFileSync(new URL(`../lessons/${name}.json`,import.meta.url))));
 const ids=new Set(lessons.map(l=>l.id));assert.equal(all.length,22);assert.equal(new Set(all.map(a=>a.id)).size,22);
 for(const a of all){
  assert.ok(ids.has(a.lesson),a.id);assert.ok(['make','measure','test','discover'].includes(a.purpose),a.id);
  assert.ok(a.sources.length&&a.sources.every(s=>s.startsWith('https://')),a.id);
  const r=a.compute(a.initial(1),1);assert.ok(r.challenge.prompt&&r.challenge.evidence&&r.challenge.explanation,a.id);
  assert.ok(Number.isFinite(r.challenge.answer)&&r.challenge.tolerance>=0,a.id);
 }
});
