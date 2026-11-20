// Pure, zero-DOM physics helpers shared across flagship live figures and Node property tests.

export function fmtSpeedPure(mps, units = 'si') {
  if (units === 'kmh') return `${(mps * 3.6).toFixed(1)} km/h`;
  return `${mps.toFixed(1)} m/s`;
}

export function computeForcesState({ pullL = 0, pullR = 0, rough = false, v = 0, mass = 50, fricMax = 100 }) {
  const netPull = pullR - pullL;
  let fFric = 0;
  if (rough) {
    if (Math.abs(v) > 1e-4) {
      fFric = -Math.sign(v) * fricMax;
    } else if (Math.abs(netPull) <= fricMax) {
      fFric = -netPull;
    } else {
      fFric = -Math.sign(netPull) * fricMax;
    }
  }
  const fNet = netPull + fFric;
  const a = fNet / Math.max(1e-6, mass);
  return { netPull, fFric, fNet, a };
}

export function beakerTiltEq(accelMps2, g = 9.8) {
  if (!Number.isFinite(accelMps2) || Math.abs(accelMps2) < 1e-9) return 0;
  return Math.max(-0.45, Math.min(0.45, Math.atan(-accelMps2 / g)));
}

export const GRAVITIES = [
  { name: 'Earth (9.8)', g: 9.8 },
  { name: 'Moon (1.6)', g: 1.6 },
  { name: 'Jupiter (24.8)', g: 24.8 },
];

export function energyTrackAt({ m, g = 9.8, h, h0, hRef = 0, thermalPerKg = 0 }) {
  const eTotAbs = m * g * h0;
  const eTherm = Math.min(eTotAbs, Math.max(0, m * thermalPerKg));
  const eMech = Math.max(0, eTotAbs - eTherm);
  const peAbs = Math.min(eMech, Math.max(0, m * g * h));
  const ke = Math.max(0, eMech - peAbs);
  const v = Math.sqrt((2 * ke) / Math.max(1e-9, m));
  const peRel = peAbs - m * g * hRef;
  const eTotRel = m * g * (h0 - hRef);
  const drift = Math.abs((peRel + ke + eTherm) - eTotRel);
  if (drift > 1e-9) {
    throw new Error(`Energy conservation drift ${drift}`);
  }
  return { m, g, h, hRef, eTotAbs, eTotRel, peAbs, peRel, ke, eTherm, v };
}
