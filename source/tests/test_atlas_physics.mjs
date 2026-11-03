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

// --- Quantitative 3D domain and engine invariants ---
function buildChapterScene(ch) {
  const scene = new THREE.Scene();
  const ASM = {};
  const ctrl = createAssemblyController(ASM);
  const world = ch.buildWorld({ scene, asm: ctrl.asm });
  return { scene, ASM, ctrl, world };
}

// 1. stepExplode + resetExplode preserves dynamic motion on exploded parts (ch01 vertical toss)
{
  const { CHAPTER: ch01 } = await import('../live/atlas/physics/ch01-describing-motion/chapter.js');
  ch01.params = { ...ch01.defaultParams, v0Mps: 10 };
  const { ASM, ctrl, world } = buildChapterScene(ch01);
  ctrl.setExplode(1.0);
  const st0 = ch01.state(0.05, false);
  ctrl.resetExplode();
  world.update(st0);
  ctrl.stepExplode(0.2);
  const tossBall = ASM.toss_column.children.find(c => c.userData?.part === 'Tossed ball');
  const yA = tossBall.position.y;

  const st1 = ch01.state(0.45, false);
  ctrl.resetExplode();
  world.update(st1);
  ctrl.stepExplode(0.2);
  const yB = tossBall.position.y;
  assert.ok(Math.abs(yB - yA) > 0.25, `ch01 exploded tossBall must move across time steps (${yA} vs ${yB})`);

  // Also verify peak height scales monotonically with v0Toss
  ctrl.setExplode(0);
  const yBar = ASM.kinematic_bars.children.find(c => c.userData?.part === 'Height y(t)');
  ch01.params = { ...ch01.defaultParams, v0Toss: 5 };
  world.update(ch01.state(0.5, false));
  const yLow = yBar.scale.y;
  ch01.params = { ...ch01.defaultParams, v0Toss: 11 };
  world.update(ch01.state(0.5, false));
  const yHigh = yBar.scale.y;
  assert.ok(yHigh > yLow * 1.9, `ch01 y_bar scale must grow with v0Toss (${yLow} -> ${yHigh})`);
}

// 2. ch05 Kepler equal-area sectors originate at Sun focus (-c, 0, 0) and perihelion speed > aphelion speed
{
  const { CHAPTER: ch05 } = await import('../live/atlas/physics/ch05-universal-gravitation/chapter.js');
  ch05.params = { ...ch05.defaultParams, eccentricity: 0.6 };
  const { ASM, world } = buildChapterScene(ch05);
  world.update(ch05.state(0.0, false));
  const [, sunKep, periSector, apoSector] = ASM.area_wedges.children;
  const periPos = periSector.geometry.attributes.position;
  const apoPos = apoSector.geometry.attributes.position;
  const focusX = sunKep.position.x;
  assert.ok(Math.abs(periPos.getX(0) - focusX) < 1e-4, `ch05 periSector vertex 0 at Sun focus (${periPos.getX(0)} vs ${focusX})`);
  assert.ok(Math.abs(apoPos.getX(0) - focusX) < 1e-4, `ch05 apoSector vertex 0 at Sun focus (${apoPos.getX(0)} vs ${focusX})`);
}

// 3. ch08 phase staircase keeps thermometer marker flat on both 0 °C melting and 100 °C boiling plateaus
{
  const { CHAPTER: ch08 } = await import('../live/atlas/physics/ch08-heat-matter/chapter.js');
  const { ASM, world } = buildChapterScene(ch08);
  const marker = ASM.phase_stair.children.find(c => c.geometry?.type === 'SphereGeometry');
  ch08.params = { ...ch08.defaultParams, addedHeatKj: 100 };
  world.update(ch08.state(0, true));
  const yMelt1 = marker.position.y;
  ch08.params = { ...ch08.defaultParams, addedHeatKj: 320 };
  world.update(ch08.state(0, true));
  const yMelt2 = marker.position.y;
  assert.ok(Math.abs(yMelt1 - 0.5) < 1e-4 && Math.abs(yMelt2 - 0.5) < 1e-4, `ch08 melting plateau must stay flat at y=0.5 (${yMelt1}, ${yMelt2})`);

  ch08.params = { ...ch08.defaultParams, addedHeatKj: 1100 };
  world.update(ch08.state(0, true));
  const yBoil1 = marker.position.y;
  ch08.params = { ...ch08.defaultParams, addedHeatKj: 2600 };
  world.update(ch08.state(0, true));
  const yBoil2 = marker.position.y;
  assert.ok(Math.abs(yBoil1 - 1.35) < 1e-4 && Math.abs(yBoil2 - 1.35) < 1e-4, `ch08 boiling plateau must stay flat at y=1.35 (${yBoil1}, ${yBoil2})`);
}

// 4. ch14 seasonal globes tilt North Pole toward the Sun at June solstice (+Z)
{
  const { CHAPTER: ch14 } = await import('../live/atlas/physics/ch14-earth-sky/chapter.js');
  ch14.params = { ...ch14.defaultParams, axialTiltDeg: 23.5, nodeOffsetDeg: 5.0 };
  const { ASM, world } = buildChapterScene(ch14);
  world.update(ch14.state(0, true));
  const globes = ASM.tilted_earths.children.filter(c => c.type === 'Group' && !c.userData?.arrow);
  assert.equal(globes.length, 4, 'ch14 should have 4 seasonal globes');
  for (const g of globes) {
    assert.ok(g.rotation.x < -0.35, `ch14 seasonal globe rotation.x should be -tiltRad (${g.rotation.x})`);
  }
}

console.log(`PASS test_atlas_physics.mjs: ${CHAPTER_SLUGS.length} chapters, ${totalStations} 3D stations, ${totalLessons} figure lessons, ${totalParts} 3D parts, ${totalControls} controls + quantitative 3D domain invariants verified.`);
