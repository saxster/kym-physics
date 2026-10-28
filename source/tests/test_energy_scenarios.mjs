import assert from 'node:assert/strict';
import { SCENARIOS } from '../live/energy_scenarios.mjs';

const close = (actual, expected) => assert.ok(
  Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * 1e-12,
  `${actual} != ${expected}`,
);
const byId = (state, id) => state.jars.find(jar => jar.id === id);
const [ball, climb, coal, sun] = SCENARIOS;
const storeIds = new Set(['grav', 'kinetic', 'elastic', 'thermal', 'chemical', 'nuclear']);
const pathways = new Set(['mechanical', 'electrical', 'heating', 'waves', 'conversion']);
const stages = [...Array.from({ length: 601 }, (_, i) => i / 200),
  1e-30, 1e-15, 1 - 1e-10, 1 + 1e-10, 2 - 1e-10, 2 + 1e-10, 3 - 1e-15];

for (const scenario of SCENARIOS) {
  for (const u of stages) {
    const state = scenario.eval(u);
    assert.ok(state.eq && state.caption, `${scenario.name}: missing account explanation`);
    close(state.jars.reduce((sum, jar) => sum + jar.val, 0), scenario.totalJ);
    for (const jar of state.jars) {
      assert.ok(Number.isFinite(jar.val) && jar.val >= 0, `${scenario.name} at ${u}: invalid ${jar.id}`);
      if (jar.kind === 'store') {
        assert.ok(storeIds.has(jar.id), `Unsubstantiated store: ${jar.id}`);
      } else {
        assert.equal(jar.kind, 'output');
        assert.ok(jar.title && /current|space/.test(jar.sub), 'An output must identify its destination/pathway');
      }
    }
    for (const tube of state.tubes) {
      assert.ok(pathways.has(tube.way), `Unsupported pathway: ${tube.way}`);
      assert.equal(state.jars[tube.from].id, tube.fromId);
      assert.equal(state.jars[tube.to].id, tube.toId);
      if (tube.way === 'conversion') {
        assert.match(tube.label, /friction|conversion|Burning/);
        assert.doesNotMatch(tube.label, /Heating/);
      }
      if (tube.way === 'waves') assert.match(tube.label, /^Waves \((sound|light)\)$/);
    }
  }
  assert.deepEqual(scenario.eval(-1), scenario.eval(0));
  assert.deepEqual(scenario.eval(4), scenario.eval(3));
  assert.throws(() => scenario.eval(NaN), TypeError);
  assert.throws(() => scenario.eval(Infinity), TypeError);
}

// The bounce includes its surroundings. Sound is a transfer and is accounted
// for as internal energy after absorption, never a separate stored quantity.
close(byId(ball.eval(0), 'grav').val, 0.98);
close(byId(ball.eval(0.5), 'kinetic').val, 0.49);
close(byId(ball.eval(3), 'grav').val, 0.63);
close(byId(ball.eval(3), 'thermal').val, 0.35);
for (const u of stages) {
  const state = ball.eval(u);
  assert.ok(state.jars.every(jar => !/sound/i.test(jar.sub)));
  assert.ok(state.tubes.every(tube => tube.way !== 'heating'));
}
assert.match(ball.eval(2.5).caption, /after absorption|absorbed sound/);

// Work on a 40 kg body raised 12 m: this is independent of the chosen food
// budget, and the unconverted chemical store must decrease as the others grow.
close(byId(climb.eval(3), 'grav').val, 40 * 9.8 * 12);
close(byId(climb.eval(3), 'thermal').val, 18800 - 40 * 9.8 * 12);
close(byId(climb.eval(3), 'chemical').val, 0);
assert.match(climb.eval(1).caption, /assumes/);
assert.equal(climb.eval(1).tubes[1].way, 'conversion');

// Regression: adding a 15 J turbine buffer on top of 100 J made 115 J.
const coalMiddle = coal.eval(1.5);
close(byId(coalMiddle, 'chemical').val, 50);
close(byId(coalMiddle, 'kinetic').val, 15);
close(byId(coalMiddle, 'electro').val, 14);
close(byId(coalMiddle, 'thermal').val, 21);
close(byId(coal.eval(3), 'electro').val, 40);
close(byId(coal.eval(3), 'thermal').val, 60);
for (const u of stages) {
  const delivered = byId(coal.eval(u), 'electro');
  assert.equal(delivered.kind, 'output');
  assert.equal(delivered.title, 'Delivered');
}

// Regression: the Sun's nuclear input previously remained fixed while the
// same energy appeared again in its thermal jar. Emitted light also appeared
// under a gravitational-store label. Both now have an explicit account role.
close(byId(sun.eval(0), 'nuclear').val, sun.totalJ);
close(byId(sun.eval(1.5), 'nuclear').val, sun.totalJ / 2);
close(byId(sun.eval(1.5), 'thermal').val, sun.totalJ / 4);
close(byId(sun.eval(1.5), 'grav').val, sun.totalJ / 4);
close(byId(sun.eval(3), 'nuclear').val, 0);
close(byId(sun.eval(3), 'thermal').val, 0);
close(byId(sun.eval(3), 'grav').val, sun.totalJ);
for (const u of stages) {
  const state = sun.eval(u), sunlight = byId(state, 'grav');
  assert.equal(sunlight.kind, 'output');
  assert.equal(sunlight.title, 'Sunlight');
  assert.equal(state.tubes[0].way, 'conversion');
  assert.equal(state.tubes[1].way, 'waves');
}
assert.match(sun.eval(3).caption, /not gravitational energy/);

console.log(`Energy scenarios: ${SCENARIOS.length} accounts × ${stages.length} stages, conservation and label checks passed`);
