#!/usr/bin/env node
/**
 * Unit verification of all 16 vendored 3D Physics Atlas chapters (ch00 .. ch15)
 * in source/live/atlas/physics/.
 */
import assert from 'node:assert/strict';
import { THREE } from '../live/atlas/engine/phys_kit.js';
import { createAssemblyController } from '../live/atlas/engine/render.js';

const CHAPTER_SLUGS = [
  'ch00-seeing-scale',
  'ch01-describing-motion',
  'ch02-unbalanced-forces',
  'ch03-laws-of-motion',
  'ch04-2d-motion',
  'ch05-universal-gravitation',
  'ch06-fluids-pressure',
  'ch07-work-energy-power',
  'ch08-heat-matter',
  'ch09-oscillations-sound',
  'ch10-rays-images',
  'ch11-colour-wave-light',
  'ch12-electric-circuits',
  'ch13-magnetism-em',
  'ch14-earth-sky',
  'ch15-atoms-stars-cosmos',
];

let totalStations = 0;
let totalLessons = 0;
let totalControls = 0;
let totalParts = 0;

for (let idx = 0; idx < CHAPTER_SLUGS.length; idx++) {
  const slug = CHAPTER_SLUGS[idx];
  const mod = await import(`../live/atlas/physics/${slug}/chapter.js`);
  const ch = mod.CHAPTER;
  assert.ok(ch, `${slug}: missing CHAPTER export`);
  assert.equal(ch.no, idx, `${slug}: CHAPTER.no should equal ${idx}`);
  assert.ok(Array.isArray(ch.PAGES) && ch.PAGES.length >= 2, `${slug}: expected >= 2 PAGES`);
  assert.ok(ch.PLATES && typeof ch.PLATES === 'object', `${slug}: missing PLATES object`);
  assert.ok(Array.isArray(ch.controls) && ch.controls.length >= 2, `${slug}: expected >= 2 controls`);
  assert.ok(ch.lessons && Object.keys(ch.lessons).length >= 2, `${slug}: expected >= 2 lessons`);
  assert.equal(typeof ch.sonify, 'function', `${slug}: expected sonify(ctx, state, page) function`);

  // Verify default state and readout on every page
  ch.params = { ...ch.defaultParams };
  const st = ch.state(0.5, false);
  assert.ok(st && typeof st === 'object', `${slug}: ch.state() must return an object`);

  for (let p = 0; p < ch.PAGES.length; p++) {
    const page = ch.PAGES[p];
    assert.ok(page.tab && page.title && page.alt, `${slug} page ${p}: missing tab/title/alt`);
    for (const partKey of page.parts || []) {
      const plate = ch.PLATES[partKey];
      assert.ok(plate && typeof plate.text === 'string', `${slug} page ${p}: missing PLATES[${partKey}].text`);
      if (typeof plate.facts === 'function') {
        const facts = plate.facts(st);
        assert.ok(Array.isArray(facts) && facts.length >= 1, `${slug} plate ${partKey}: facts() must return array`);
      }
    }
    const r = ch.readout(st, page, p);
    assert.equal(typeof r, 'string', `${slug} page ${p}: readout must be a string`);
    assert.ok(r.length > 15, `${slug} page ${p}: readout too short: ${r}`);
  }

  // Verify every lesson preset maps to a valid page and produces valid state
  for (const [lessonId, preset] of Object.entries(ch.lessons)) {
    assert.ok(preset.page >= 0 && preset.page < ch.PAGES.length, `${slug} lesson ${lessonId}: invalid page ${preset.page}`);
    ch.params = { ...ch.defaultParams, ...(preset.params || {}) };
    const lst = ch.state(1.0, false);
    const lr = ch.readout(lst, ch.PAGES[preset.page], preset.page);
    assert.ok(lr.length > 15, `${slug} lesson ${lessonId}: readout too short`);
    totalLessons++;
  }

  // Build the 3D world and step frame() across all pages
  const scene = new THREE.Scene();
  const ASM = {};
  const { asm } = createAssemblyController(ASM);
  const world = ch.buildWorld({ scene, asm });
  assert.ok(world && typeof world.update === 'function', `${slug}: buildWorld() must return { update }`);
  const asmCount = Object.keys(ASM).length;
  assert.ok(asmCount >= ch.PAGES.length, `${slug}: expected >= ${ch.PAGES.length} parts, got ${asmCount}`);

  world.update(st);

  totalStations += ch.PAGES.length;
  totalControls += ch.controls.length;
  totalParts += asmCount;
}

console.log(`PASS test_atlas_physics.mjs: ${CHAPTER_SLUGS.length} chapters, ${totalStations} 3D stations, ${totalLessons} figure lessons, ${totalParts} 3D parts, ${totalControls} controls verified.`);
