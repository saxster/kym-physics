const G = 9.8, EARTH_R = 6371e3, MU_EARTH_KM = 398600.4418;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rad = (d) => d * Math.PI / 180;
function horizon(eyeHeight, rangeKm, flat = false) {
  const alpha = Math.acos(EARTH_R / (EARTH_R + eyeHeight));
  const beyond = Math.max(0, rangeKm * 1e3 / EARTH_R - alpha);
  return { horizonKm: EARTH_R * alpha / 1e3, hiddenMetres: flat ? 0 : EARTH_R * (1 / Math.cos(beyond) - 1) };
}
function measurement(truth = 36.5, resolution = 0.1, bias = 0, scatter = 1) {
  const readings = [-0.8, 0.3, -0.1, 0.8, -0.2].map((n) => Math.round((truth + bias + n * scatter) / resolution) * resolution);
  const mean = readings.reduce((a, b) => a + b, 0) / readings.length;
  return { readings, mean, error: mean - truth, range: Math.max(...readings) - Math.min(...readings) };
}
function scaleFactors(s) {
  return { length: s, area: s * s, volume: s * s * s };
}
function rainfall(areaKm2, depthMm) {
  const volume = areaKm2 * 1e3 * depthMm;
  return { volume, tonnes: volume };
}
function earthMeasure(distanceStadia, angleDeg, stadionM) {
  return { fraction: angleDeg / 360, circumferenceStadia: 360 / angleDeg * distanceStadia, circumferenceKm: 360 / angleDeg * distanceStadia * stadionM / 1e3 };
}
const relativeVelocity = (frame, relative) => frame + relative;
function trainPosition(t, v0 = 10, brake = 0) {
  const s = brake > 0 ? Math.min(t, v0 / brake) : t;
  return v0 * s - 0.5 * brake * s * s;
}
function walk(t) {
  t = clamp(t, 0, 12);
  const x = t < 3 ? 2 * t : t < 6 ? 6 : t < 9 ? 6 - (t - 6) : 3;
  const distance = t < 3 ? 2 * t : t < 6 ? 6 : t < 9 ? 6 + t - 6 : 9;
  const velocity = t < 3 ? 2 : t < 6 ? 0 : t < 9 ? -1 : 0;
  return { x, distance, velocity, averageSpeed: t ? distance / t : 0, averageVelocity: t ? x / t : 0 };
}
function constantAcceleration(t, v0, a) {
  return { x: v0 * t + 0.5 * a * t * t, v: v0 + a * t, a };
}
function ramp(angle, t, rolling = false) {
  const a = G * Math.sin(rad(angle)) * (rolling ? 5 / 7 : 1);
  return { a, x: 0.5 * a * t * t, v: a * t };
}
function toss(t, v0 = 4.43) {
  return { height: v0 * t - 0.5 * G * t * t, v: v0 - G * t, a: -G, topTime: v0 / G };
}
function slide(v0, mu, t) {
  const stop = mu ? v0 / (mu * G) : Infinity, s = Math.min(t, stop);
  return { v: t >= stop ? 0 : Math.max(0, v0 - mu * G * s), distance: v0 * s - 0.5 * mu * G * s * s, a: t < stop ? -mu * G : 0, stopTime: stop };
}
function shove(v0, mu, t, releaseTime = 0.4, mass = 1) {
  if (t < releaseTime) {
    const a = v0 / releaseTime;
    return { v: a * t, distance: 0.5 * a * t * t, a, hand: mass * (a + mu * G), friction: -mass * mu * G, contact: true };
  }
  const p = slide(v0, mu, t - releaseTime), friction2 = p.v > 0 ? -mass * mu * G : 0;
  return { ...p, distance: v0 * releaseTime / 2 + p.distance, hand: 0, friction: friction2, contact: false };
}
function friction(applied, mass, muS = 0.5, muK = 0.35) {
  const normal = mass * G, slipping = Math.abs(applied) > muS * normal;
  const force = slipping ? -Math.sign(applied) * muK * normal : -applied;
  return { normal, force, net: applied + force, slipping, limit: muS * normal };
}
function tablecloth(duration, mu = 0.3, mass = 1) {
  const a = mu * G, v = a * duration, during = 0.5 * a * duration ** 2, after = v * v / (2 * mu * G);
  return { a, v, force: mass * a, during, after, totalDistance: during + after };
}
function resultant(force, angleDeg, mass) {
  const x = force * (1 + Math.cos(rad(angleDeg))), y = force * Math.sin(rad(angleDeg));
  return { x, y, magnitude: Math.hypot(x, y), ax: x / mass, ay: y / mass };
}
function support(mass, angleDeg, stiffness) {
  const weight = mass * G, normal = weight * Math.cos(rad(angleDeg));
  return { weight, normal, along: weight * Math.sin(rad(angleDeg)), compression: normal / stiffness };
}
function forcePair(m1, m2, force) {
  return { f1: force, f2: -force, a1: force / m1, a2: -force / m2 };
}
function recoil(m1, m2, separationSpeed) {
  return { v1: m2 / (m1 + m2) * separationSpeed, v2: -m1 / (m1 + m2) * separationSpeed };
}
function rocketSequence(fuel, time, dryMass = 70, separationSpeed = 7.1, count = 6, interval = 0.7) {
  let mass = dryMass + fuel, v = 0, x = 0;
  const parcels = [];
  for (let i = 0; i < count; i++) {
    const at = i * interval;
    if (time < at) break;
    const dm = fuel / count, newMass = mass - dm, p = recoil(newMass, dm, separationSpeed);
    x += v * (i === 0 ? 0 : interval);
    v += p.v1;
    parcels.push({ at, x, v: v - separationSpeed, mass: dm });
    mass = newMass;
  }
  const lastAt = parcels.at(-1)?.at || 0, craftX = x + v * (time - lastAt);
  const located = parcels.map((p) => ({ ...p, position: p.x + p.v * (time - p.at) }));
  const exhaustMomentum = located.reduce((sum, p) => sum + p.mass * p.v, 0);
  const centre = (mass * craftX + located.reduce((sum, p) => sum + p.mass * p.position, 0)) / (dryMass + fuel);
  return { mass, v, x: craftX, parcels: located, craftMomentum: mass * v, exhaustMomentum, centre };
}
function fall(t, mass, drag, g = G) {
  if (!drag) return { distance: 0.5 * g * t * t, v: g * t, a: g };
  const terminal = Math.sqrt(mass * g / drag), u = g * t / terminal;
  const logCosh = u + Math.log1p(Math.exp(-2 * u)) - Math.LN2;
  return { distance: terminal * terminal / g * logCosh, v: terminal * Math.tanh(u), a: g / Math.cosh(u) ** 2, terminal };
}
function projectile(height, vx, t) {
  return { height: height - 0.5 * G * t * t, x: vx * t, vx, vy: -G * t, flightTime: Math.sqrt(2 * height / G) };
}
function circle(radius, speed, angle) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), vx: -speed * Math.sin(angle), vy: speed * Math.cos(angle), ax: -speed * speed / radius * Math.cos(angle), ay: -speed * speed / radius * Math.sin(angle), a: speed * speed / radius };
}
function gravity(distanceR) {
  const radius = distanceR * EARTH_R, g = G / (distanceR * distanceR), omega = Math.sqrt(g / radius);
  return { ratio: 1 / (distanceR * distanceR), g, barycentreKm: 384400 * 0.0123 / (1 + 0.0123), tangentGap60: radius * (1 - Math.cos(omega * 60)), sideways60: radius * Math.sin(omega * 60) };
}
function weightless(heightKm, freelyFalling = true) {
  const g = G / (1 + heightKm / 6371) ** 2;
  return { g, sensor: freelyFalling ? 0 : g };
}
function orbit(e = 0.5, a = 2, mean = 0, mu = 1) {
  let E = mean;
  for (let i = 0; i < 20; i++) {
    const d = (E - e * Math.sin(E) - mean) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-13) break;
  }
  const r = a * (1 - e * Math.cos(E)), n = Math.sqrt(mu / a ** 3), dEdt = n / (1 - e * Math.cos(E));
  const x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(E), vx = -a * Math.sin(E) * dEdt, vy = a * Math.sqrt(1 - e * e) * Math.cos(E) * dEdt;
  return { x, y, vx, vy, radius: r, speed: Math.hypot(vx, vy), period: 2 * Math.PI / n, arealRate: Math.sqrt(mu * a * (1 - e * e)) / 2, energy: -mu / (2 * a) };
}
function torsion(bigMass = 5, separation = 0.1, smallMass = 0.05, arm = 0.4, stiffness = 1e-5) {
  let torque = 0;
  for (const side of [-1, 1]) {
    const sx = side * arm;
    for (const bside of [-1, 1]) {
      const dx = bside * arm - sx, dy = bside * separation, r = Math.hypot(dx, dy);
      torque += sx * 66743e-15 * smallMass * bigMass * dy / r ** 3;
    }
  }
  return { torque, angle: torque / stiffness, stiffness };
}
function perturbedOrbit(planetMass = 1e-3, duration = 8, phase = 0) {
  const planetRadius = 2.5, planetRate = Math.sqrt(1 / planetRadius ** 3), h = 0.01;
  const acceleration = (x, y, t2, m) => {
    const r = Math.hypot(x, y), px = planetRadius * Math.cos(t2 * planetRate + phase), py = planetRadius * Math.sin(t2 * planetRate + phase), dx = px - x, dy = py - y, d = Math.hypot(dx, dy);
    return [-x / r ** 3 + m * (dx / d ** 3 - px / planetRadius ** 3), -y / r ** 3 + m * (dy / d ** 3 - py / planetRadius ** 3)];
  };
  const step = (q, t2, dt, m) => {
    const f = (s, time) => {
      const a2 = acceleration(s[0], s[1], time, m);
      return [s[2], s[3], ...a2];
    };
    const plus = (s, k, c) => s.map((v, i) => v + k[i] * c), k1 = f(q, t2), k2 = f(plus(q, k1, dt / 2), t2 + dt / 2), k3 = f(plus(q, k2, dt / 2), t2 + dt / 2), k4 = f(plus(q, k3, dt), t2 + dt);
    return q.map((v, i) => v + dt * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6);
  };
  let a = [1, 0, 0, 1], b = [1, 0, 0, 1], t = 0, energyError = 0;
  const baseline = [[1, 0]], perturbed = [[1, 0]], residual = [[0, 0]];
  while (t < duration - 1e-10) {
    const dt = Math.min(h, duration - t);
    a = step(a, t, dt, 0);
    b = step(b, t, dt, planetMass);
    t += dt;
    energyError = Math.max(energyError, Math.abs(0.5 * (a[2] ** 2 + a[3] ** 2) - 1 / Math.hypot(a[0], a[1]) + 0.5));
    if (baseline.length === 1 || Math.round(t / h) % 4 === 0 || t >= duration) {
      baseline.push(a.slice(0, 2));
      perturbed.push(b.slice(0, 2));
      residual.push([b[0] - a[0], b[1] - a[1]]);
    }
  }
  return { baseline, perturbed, residual, difference: Math.hypot(a[0] - b[0], a[1] - b[1]), energyError };
}
function burn(rp = 6601, apoHeight = 71e3, dv = 0) {
  const ra = apoHeight + 6371, a0 = (rp + ra) / 2, v0 = Math.sqrt(MU_EARTH_KM * (2 / rp - 1 / a0)), v = v0 + dv, energy = 0.5 * v * v - MU_EARTH_KM / rp;
  if (energy >= 0) return { v0, v, energy, bound: false, apoKm: Infinity, a: Infinity, e: 1 + rp * (v * v / MU_EARTH_KM - 2 / rp) };
  const a = -MU_EARTH_KM / (2 * energy);
  return { v0, v, energy, bound: true, apoKm: 2 * a - rp, a, e: 1 - rp / a, periodHours: 2 * Math.PI * Math.sqrt(a ** 3 / MU_EARTH_KM) / 3600 };
}
function capture(vInfinity = 1.5, retrogradeDv = 0.5) {
  const mu = 4902.8001, rp = 1837.4, vBefore = Math.sqrt(vInfinity * vInfinity + 2 * mu / rp), v = vBefore - retrogradeDv, energy = 0.5 * v * v - mu / rp;
  return { vBefore, v, energy, bound: energy < 0, rp, apoKm: energy < 0 ? -mu / energy - rp : Infinity };
}
function pressure(force, area) {
  return { pressure: force / area, force, area };
}
function suction(outside, inside, rho) {
  const difference = outside - inside;
  return { difference, height: Math.max(0, difference) / (rho * G), separatingForce: difference * Math.PI * 0.1 ** 2 };
}
function hydrostatic(depth, width = 1, extra = 0) {
  return { baseGauge: 1e3 * G * depth + extra, damForce: 0.5 * 1e3 * G * depth * depth * width + extra * depth * width };
}
function buoyancy(mass, volume, rho) {
  const weight = mass * G, fraction = Math.min(1, mass / (rho * volume)), displaced = volume * fraction, buoyancy2 = rho * G * displaced;
  return { weight, fraction, displaced, buoyancy: buoyancy2, support: Math.max(0, weight - buoyancy2), averageDensity: mass / volume };
}
function layered(bodyDensity, upperDensity = 1e3, lowerDensity = 1200) {
  return { lowerFraction: clamp((bodyDensity - upperDensity) / (lowerDensity - upperDensity), 0, 1) };
}
function energyAccount(mass, height, retention = 0.64, progress = 0) {
  const total = mass * G * height, impacts = Math.floor((progress + 1) / 2), active = total * retention ** impacts, u = progress % 2;
  const fraction = u <= 1 ? 1 - u * u : 2 * (u - 1) - (u - 1) ** 2, gravitational = active * fraction, kinetic = active - gravitational, lost = total - active;
  return { total, gravitational, kinetic, ballThermal: lost * 0.3, floorThermal: lost * 0.4, airThermal: lost * 0.3, height: gravitational / (mass * G), impacts };
}
function impact(mass, speed, resistingForce) {
  return { momentum: mass * speed, kinetic: 0.5 * mass * speed * speed, time: mass * speed / resistingForce, distance: 0.5 * mass * speed * speed / resistingForce };
}
function work(mass, height, pathLength) {
  return { force: mass * G, energy: mass * G * height, pathLength, alongForce: height };
}
function power(watts, hours) {
  return { joules: watts * hours * 3600, kWh: watts * hours / 1e3 };
}
function station(input, efficiency) {
  return { electrical: input * efficiency, rejected: input * (1 - efficiency), input };
}
function wheel(initial, load, seconds, friction2 = 0) {
  const remaining = Math.max(0, initial - (load + friction2) * seconds);
  return { remaining, delivered: Math.min(initial, load * seconds), spent: initial - remaining, omega: Math.sqrt(2 * remaining) };
}
function stevin(height, leftLength = 4, rightLength = 2, linearDensity = 1) {
  const tension = linearDensity * G * height;
  return { leftForce: tension, rightForce: tension, leftMass: linearDensity * leftLength, rightMass: linearDensity * rightLength, leftAngle: Math.asin(height / leftLength), rightAngle: Math.asin(height / rightLength) };
}
function heatEngine(hot, cold, fraction = 0.5, input = 1e3) {
  const limit = Math.max(0, 1 - cold / hot), efficiency = clamp(fraction, 0, 1) * limit;
  return { limit, efficiency, work: input * efficiency, rejected: input * (1 - efficiency), input };
}
function fallingBody(t, mass, area, cd = 0.47, air = 1, g = G) {
  const dragCoefficient = 0.5 * 1.225 * air * cd * area;
  const p = fall(t, mass, dragCoefficient, g);
  return {
    ...p,
    weight: mass * g,
    drag: dragCoefficient * p.v ** 2,
    dragCoefficient,
    terminal: dragCoefficient ? Math.sqrt(mass * g / dragCoefficient) : Infinity
  };
}
function sphericalField(radius, count = 24) {
  return {
    radius,
    area: 4 * Math.PI * radius ** 2,
    field: G / radius ** 2,
    patchArea: 4 * Math.PI * radius ** 2 / count,
    flux: 4 * Math.PI * G,
    points: Array.from({ length: count }, (_, i) => {
      const z = 1 - 2 * (i + 0.5) / count, a = i * Math.PI * (3 - Math.sqrt(5)), q = Math.sqrt(1 - z * z);
      return [radius * q * Math.cos(a), radius * q * Math.sin(a), radius * z];
    })
  };
}
function cabinFall(t, altitudeKm, free = true, mass = 70, stiffness = 7e3) {
  const p = weightless(altitudeKm, free), support2 = mass * p.sensor;
  return { ...p, support: support2, compression: support2 / stiffness, displacement: free ? -0.5 * p.g * t * t : 0, velocity: free ? -p.g * t : 0 };
}
function torsionResponse(equilibrium, seconds, disturbance = 0, stiffness = 1e-5, inertia = 0.016, dampingRatio = 0.12) {
  const omega = Math.sqrt(stiffness / inertia), decay = dampingRatio * omega, wd = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
  const displacement = disturbance * Math.exp(-decay * seconds) * (Math.cos(wd * seconds) + decay / wd * Math.sin(wd * seconds));
  const velocity = -disturbance * Math.exp(-decay * seconds) * omega * omega / wd * Math.sin(wd * seconds);
  return { angle: equilibrium + displacement, displacement, velocity, energy: 0.5 * inertia * velocity * velocity + 0.5 * stiffness * displacement * displacement, period: 2 * Math.PI / wd };
}
function perturberPosition(time, phase = 0) {
  const radius = 2.5, angle = time / Math.sqrt(radius ** 3) + phase;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), angle };
}
function perturbingAcceleration(x, y, t, m, phase = 0) {
  const p = perturberPosition(t, phase), d = Math.hypot(p.x - x, p.y - y);
  return [m * ((p.x - x) / d ** 3 - p.x / 2.5 ** 3), m * ((p.y - y) / d ** 3 - p.y / 2.5 ** 3)];
}
function conicState(rp, speed, mu, seconds) {
  const e = rp * speed * speed / mu - 1, energy = 0.5 * speed * speed - mu / rp;
  let x, y, vx, vy;
  if (Math.abs(e - 1) < 1e-7) {
    const factor = Math.sqrt(2 * rp ** 3 / mu), B = seconds / factor;
    let D = Math.cbrt(3 * B);
    for (let i = 0; i < 30; i++) D -= (D + D ** 3 / 3 - B) / (1 + D * D);
    const rate = 1 / (factor * (1 + D * D));
    x = rp * (1 - D * D);
    y = 2 * rp * D;
    vx = -2 * rp * D * rate;
    vy = 2 * rp * rate;
  } else if (e < 1) {
    const a = -mu / (2 * energy), p = orbit(e, a, seconds * Math.sqrt(mu / a ** 3), mu);
    ({ x, y, vx, vy } = p);
  } else {
    const a = mu / (2 * energy), n = Math.sqrt(mu / a ** 3), mean = n * seconds;
    let H = Math.asinh(mean / e);
    for (let i = 0; i < 40; i++) {
      const d = (e * Math.sinh(H) - H - mean) / (e * Math.cosh(H) - 1);
      H -= d;
      if (Math.abs(d) < 1e-12) break;
    }
    const rate = n / (e * Math.cosh(H) - 1);
    x = a * (e - Math.cosh(H));
    y = a * Math.sqrt(e * e - 1) * Math.sinh(H);
    vx = -a * Math.sinh(H) * rate;
    vy = a * Math.sqrt(e * e - 1) * Math.cosh(H) * rate;
  }
  return { x, y, vx, vy, radius: Math.hypot(x, y), speed: Math.hypot(vx, vy), energy, e };
}
function missionCoast(rp, speed, mu, displayRadius) {
  const energy = 0.5 * speed * speed - mu / rp;
  if (energy < 0) {
    const a = -mu / (2 * energy);
    return Math.PI * Math.sqrt(a ** 3 / mu);
  }
  let lo = 0, hi = Math.sqrt(displayRadius ** 3 / mu) * 4;
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (conicState(rp, speed, mu, mid).radius < displayRadius) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
function eggIntegral(u) {
  return u - 0.2 * u * u - 0.32 * u ** 3 + 0.1 * u ** 4 - 8e-3 * u ** 5;
}
function eggLowerFraction(interfaceU) {
  const u = clamp(interfaceU, -1, 1);
  return (eggIntegral(u) - eggIntegral(-1)) / (eggIntegral(1) - eggIntegral(-1));
}
function eggInterface(density, upper = 1e3, lower = 1200) {
  const fraction = layered(density, upper, lower).lowerFraction;
  let lo = -1, hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (eggLowerFraction(mid) < fraction) lo = mid;
    else hi = mid;
  }
  return { fraction, interfaceU: (lo + hi) / 2 };
}
function rollingEnergy(mass, height, rolling = true, radius = 0.2) {
  const total = mass * G * height, translation = total * (rolling ? 5 / 7 : 1), rotation = total - translation, v = Math.sqrt(2 * translation / mass);
  return { total, translation, rotation, v, omega: rolling ? v / radius : 0 };
}
const HOUSEHOLD = [{ name: "Geyser", watts: 2e3, start: 7, end: 7.25 }, { name: "Lamp", watts: 10, start: 0, end: 24 }, { name: "Fan", watts: 60, start: 12, end: 20 }, { name: "Kettle", watts: 1500, start: 18, end: 18.1 }];
function household(hours, schedule = HOUSEHOLD) {
  const appliances = schedule.map((a) => ({ ...a, kWh: a.watts * Math.max(0, Math.min(hours, a.end) - a.start) / 1e3 }));
  return { appliances, kWh: appliances.reduce((sum, a) => sum + a.kWh, 0), watts: appliances.reduce((sum, a) => sum + (hours >= a.start && hours < a.end ? a.watts : 0), 0) };
}
function uniformArc(points, count) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const total = lengths.at(-1);
  return Array.from({ length: count }, (_, i) => {
    const at = (i + 0.5) * total / count;
    let j = 1;
    while (lengths[j] < at) j++;
    const f = (at - lengths[j - 1]) / (lengths[j] - lengths[j - 1]);
    return points[j].map((v, k) => points[j - 1][k] + f * (v - points[j - 1][k]));
  });
}
function generatorWheel(initial, initialLoad, seconds, inertia = 1) {
  const rate = initialLoad / initial, remaining = initial * Math.exp(-rate * seconds), omega = Math.sqrt(2 * remaining / inertia), power2 = initialLoad * remaining / initial;
  return { remaining, delivered: initial - remaining, omega, power: power2, torque: omega ? power2 / omega : 0, angle: initialLoad ? 2 * Math.sqrt(2 * initial / inertia) / rate * (1 - Math.exp(-rate * seconds / 2)) : Math.sqrt(2 * initial / inertia) * seconds };
}
function stevinChain(height, density = 1) {
  const left = -Math.sqrt(16 - height * height), right = Math.sqrt(4 - height * height), mid = (left + right) / 2, half = (right - left) / 2, a = half * 1.1, halfArc = a * Math.sinh(half / a), length = 2 * halfArc;
  const at = (arc) => {
    const x = mid + a * Math.asinh((arc - halfArc) / a);
    return [x, a * (Math.cosh((x - mid) / a) - Math.cosh(half / a))];
  };
  const curve = Array.from({ length: 121 }, (_, i) => at(length * i / 120)), beads = Array.from({ length: Math.floor(length / 0.5) }, (_, i) => at(0.25 + i * 0.5));
  return { left, right, curve, beads, length, ...stevin(height, 4, 2, density) };
}
function drivePath(hydro, u) {
  const path = hydro ? [[-1.65, 0.8], [-0.6, 0.8], [-0.6, 0.4], [0, 0.4]] : [[-1.65, 0.2], [-0.7, 0.2], [-0.7, 0.45], [0, 0.45]], lengths = [0];
  for (let i2 = 1; i2 < path.length; i2++) lengths.push(lengths.at(-1) + Math.hypot(path[i2][0] - path[i2 - 1][0], path[i2][1] - path[i2 - 1][1]));
  const at = Math.max(0, Math.min(1, u)) * lengths.at(-1);
  let i = 1;
  while (i < path.length - 1 && lengths[i] < at) i++;
  const f = (at - lengths[i - 1]) / (lengths[i] - lengths[i - 1]);
  return { path, point: path[i].map((v, j) => path[i - 1][j] + f * (v - path[i - 1][j])) };
}
export {
  EARTH_R,
  G,
  HOUSEHOLD,
  MU_EARTH_KM,
  buoyancy,
  burn,
  cabinFall,
  capture,
  circle,
  conicState,
  constantAcceleration,
  drivePath,
  earthMeasure,
  eggInterface,
  eggLowerFraction,
  energyAccount,
  fall,
  fallingBody,
  forcePair,
  friction,
  generatorWheel,
  gravity,
  heatEngine,
  horizon,
  household,
  hydrostatic,
  impact,
  layered,
  measurement,
  missionCoast,
  orbit,
  perturbedOrbit,
  perturberPosition,
  perturbingAcceleration,
  power,
  pressure,
  projectile,
  rainfall,
  ramp,
  recoil,
  relativeVelocity,
  resultant,
  rocketSequence,
  rollingEnergy,
  scaleFactors,
  shove,
  slide,
  sphericalField,
  station,
  stevin,
  stevinChain,
  suction,
  support,
  tablecloth,
  torsion,
  torsionResponse,
  toss,
  trainPosition,
  uniformArc,
  walk,
  weightless,
  wheel,
  work
};
