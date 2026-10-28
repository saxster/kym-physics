import assert from 'node:assert/strict';
import { MIN_EXP, MAX_EXP, clampExp, widthAt, stepTarget, formatPower, formatWidth, fitExponent, ratioText } from '../app/scale_model.mjs';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * 1e-12, `${actual} != ${expected}`);

assert.equal(MIN_EXP, -15);
assert.equal(MAX_EXP, 22);
assert.equal(clampExp(-30), -15);
assert.equal(clampExp(40), 22);
assert.equal(clampExp(0.25), 0.25);
assert.equal(widthAt(0), 1);
assert.equal(widthAt(7), 10_000_000);
close(widthAt(0.5), Math.sqrt(10));

// Exact multiplicative steps also work from a fitted, fractional landmark view.
const earthView = fitExponent(12_742_000);
close(widthAt(earthView), 15_927_500);
close(widthAt(stepTarget(earthView, 1)) / widthAt(earthView), 10);
close(widthAt(stepTarget(earthView, -1)) / widthAt(earthView), 0.1);
close(stepTarget(stepTarget(earthView, 1), -1), earthView);
assert.equal(stepTarget(22, 1), 22);
assert.equal(stepTarget(-15, -1), -15);
let target = 0;
for (let press = 0; press < 4; press++) target = stepTarget(target, 1);
assert.equal(target, 4);

assert.equal(formatPower(0), '10⁰');
assert.equal(formatPower(-15), '10⁻¹⁵');
assert.equal(formatPower(1.25), '10¹.²⁵');
assert.equal(formatPower(-0.0001), '10⁰');
assert.equal(formatWidth(-15), '1 fm');
assert.equal(formatWidth(-16), '0.1 fm');
close(widthAt(fitExponent(1e21 * 2)), 2.5e21);
assert.equal(formatWidth(-9), '1 nm');
assert.equal(formatWidth(-6), '1 µm');
assert.equal(formatWidth(-3), '1 mm');
assert.equal(formatWidth(0), '1 m');
assert.equal(formatWidth(1), '10 m');
assert.equal(formatWidth(7), '10,000 km');
assert.equal(formatWidth(Math.log10(149597870700)), '1 AU');
assert.equal(formatWidth(Math.log10(9.4607304725808e15)), '1 light-year');
assert.equal(ratioText(0), 'Your starting view');
assert.equal(ratioText(1), '10× wider than your starting view');
assert.equal(ratioText(-2), '100× smaller than your starting view');
assert.equal(ratioText(7, 6), '10× wider than your starting view');
assert.equal(ratioText(21), '10²¹× wider than your starting view');

assert.throws(() => clampExp(NaN), TypeError);
assert.throws(() => widthAt(Infinity), TypeError);
assert.throws(() => fitExponent(0), RangeError);
assert.throws(() => fitExponent(-1), RangeError);
assert.throws(() => stepTarget(0, 0), RangeError);
console.log('Scale model: all assertions passed');
