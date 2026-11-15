import test from 'node:test';
import assert from 'node:assert/strict';
import { activities } from '../live/discovery_waves.mjs';

const activity = id => activities.find(a => a.id === id);
const value = (r, label) => r.readings.find(v => v.label === label)?.value;
const near = (actual, expected, epsilon = 1e-8) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} should be ${expected}`);

test('equal 3 m paths distinguish slower-water and faster-water predictions', () => {
  const a = activity('refraction-rivals'), state = { angle: 45, length: 3, reveal: 1 }, r = a.compute(state);
  near(value(r, 'Air travel time'), 10.00692285594456);
  near(value(r, 'Wave prediction: water time'), 13.339228166974099);
  near(value(r, 'Corpuscular prediction: water time'), 7.507068909185717);
  near(value(r, 'Refracted angle'), 32.03672255339524, 1e-6);
  assert.ok(value(r, 'Model measured water time') > value(r, 'Air travel time'));
  assert.equal(value(a.compute({ ...state, reveal: 0 }), 'Model measured water time'), undefined);
});

test('single-gap reference, changed interference and local marker return', () => {
  const a = activity('wave-bench'), s = { mode: 0, gap: 2, wavelength: 1, motion: 0, time: 0 }, r = a.compute(s);
  near(value(r, 'Frequency'), 6);
  const points = r.plots[0].points;
  near(points[120][1], 1);
  near(points[180][0], 1);
  near(points[180][1], .013428602617085762, 1e-8);
  near(value(r, 'Marker displacement'), 3);
  near(value(a.compute({ ...s, time: 1 / 6 }), 'Marker displacement'), 3);
  near(value(a.compute({ ...s, time: 1 / 12 }), 'Marker displacement'), -3);
  assert.notDeepEqual(a.compute({ ...s, mode: 1 }).plots[0].points, points);
  assert.deepEqual(a.compute({ ...s, motion: 1 }).plots, r.plots, 'changing marker direction does not change the detector physics');
});

test('reflection fixes the end; slower-region wavelength tracks speed at fixed frequency', () => {
  const a = activity('wave-bench'), s = { mode: 2, gap: 2, wavelength: 1.25, motion: 0, time: .07 };
  for (const time of [0, .07, .32]) near(a.compute({ ...s, time }).plots[0].points.at(-1)[1], 0);
  const slower = a.compute({ ...s, mode: 3 });
  near(value(slower, 'Frequency'), 4.8);
  near(value(slower, 'Slower-region speed'), 3.6);
  near(value(slower, 'Slower-region wavelength'), .75);
  near(value(slower, 'Slower-region speed') / value(slower, 'Slower-region wavelength'), value(slower, 'Frequency'));
  near(slower.plots[0].points[200][1], 3 * Math.cos(2 * Math.PI * (4 - 4.8 * .07)));
});

test('300 Hz horn at 30 m/s gives front/rear/driver known cases', () => {
  const a = activity('doppler-train'), s = { frequency: 300, speed: 30, listener: 0, tone: 0 };
  near(value(a.compute(s), 'Received frequency'), 328.2397238782554);
  near(value(a.compute({ ...s, listener: 1 }), 'Received frequency'), 276.23448640190125);
  near(value(a.compute({ ...s, listener: 2 }), 'Received frequency'), 300);
  near(value(a.compute(s), 'Front crest spacing'), 1.0623333333333334);
  near(value(a.compute(s), 'Rear crest spacing'), 1.2623333333333333);
  near(a.sound(s).frequency, value(a.compute(s), 'Received frequency'));
  near(a.sound({ ...s, tone: 1 }).frequency, 300);
});

test('telescope changes field with eyepiece and resolution with aperture', () => {
  const a = activity('telescope-designer'), s = { objective: 1000, eyepiece: 20, aperture: 100, target: 0 }, r = a.compute(s);
  near(value(r, 'Magnification'), 50);
  near(value(r, 'True field diameter'), 1);
  near(value(r, 'Diffraction resolution'), 1.3840368499180165);
  near(value(a.compute({ ...s, eyepiece: 10 }), 'True field diameter'), .5);
  near(value(a.compute({ ...s, aperture: 200 }), 'Diffraction resolution'), value(r, 'Diffraction resolution') / 2);
  near(value(a.compute({ ...s, eyepiece: 5 }), 'Diffraction resolution'), value(r, 'Diffraction resolution'));
});

test('three electrical routes agree and latent-energy plateau stays at zero Celsius', () => {
  const a = activity('heating-evidence'), s = { route: 0, power: 200, time: 1000 };
  const r = a.compute(s);
  near(value(r, 'Power × time'), 200);
  near(value(a.compute({ ...s, route: 1 }), 'Joulemeter increase'), 200);
  const vi = a.compute({ ...s, route: 2 });
  near(value(vi, 'Voltmeter'), 20); near(value(vi, 'Ammeter'), 10);
  near(value(vi, 'Voltage × current × time'), 200);
  near(value(r, 'Temperature'), 0);
  near(value(r, 'Energy in phase changes'), 158);
  near(value(r, 'Melted fraction'), 158 / 334);
  near(value(a.compute({ ...s, time: 1500 }), 'Temperature'), 0);
  near(value(a.compute({ ...s, power: 100, time: 2000 }), 'Melted fraction'), 158 / 334);
  near(value(a.compute({ ...s, power: 500, time: 2000 }), 'Temperature'), 100);
  near(value(a.compute({ ...s, power: 500, time: 2000 }), 'Vapour fraction'), 205.4 / 2256);
  assert.ok(r.plots[0].points.some(([t, temp]) => t === 210 && temp === 0), 'plot includes the exact start of melting');
});

test('all control endpoint combinations, challenge answers and plotted values remain finite', () => {
  for (const a of activities) {
    assert.deepEqual(a.initial(9), a.initial(9));
    assert.notDeepEqual(a.initial(1), a.initial(2), `${a.id} needs fresh cases`);
    let cases = [a.initial(7)];
    for (const control of a.controls) {
      const values = control.options?.map(([v]) => v) || [control.min, control.max];
      cases = cases.flatMap(s => values.map(v => ({ ...s, [control.key]: v })));
    }
    for (const state of cases) {
      const r = a.compute(state, 7);
      for (const v of r.readings) assert.ok(Number.isFinite(v.value), `${a.id}: ${v.label}`);
      for (const p of r.plots) for (const xy of p.points) for (const v of xy) assert.ok(Number.isFinite(v), `${a.id}: ${p.label}`);
      assert.ok(Number.isFinite(r.challenge.answer), `${a.id}: challenge`);
      assert.ok(r.challenge.tolerance > 0);
      assert.ok(Array.isArray(r.challenge.hideControls));
      assert.ok(Array.isArray(r.challenge.hideReadings));
      for (const label of r.challenge.hideReadings) assert.ok(r.readings.some(v => v.label === label), `${a.id}: hidden reading must exist`);
      for (const key of r.challenge.hideControls) assert.ok(a.controls.some(v => v.key === key), `${a.id}: hidden control must exist`);
    }
  }
});
