// Original teaching activities. Grounding, numerical checks and limits:
// ../research/discovery-waves.md. This module has no DOM, clock or audio side effects.
import { C, snell, singleSlit, doubleSlit, soundWave, phaseState, doppler } from './waves_models.mjs';
import { SOUND_SPEED_MS, sampledWavefronts, CREST_STRIDE } from './doppler_model.mjs';
import { text, line, circle, rect, arrow } from './investigation_draw.js';

const TAU = 2 * Math.PI;
const sample = (count, min, max, fn) => Array.from({ length: count }, (_, i) => {
  const x = min + (max - min) * i / (count - 1);
  return [x, fn(x)];
});
const choice = (seed, n) => ((Math.trunc(Number(seed) || 0) % n) + n) % n;
const reading = (label, value, unit) => ({ label, value, unit });
const range = (key, label, min, max, step, unit = '') => ({ key, label, min, max, step, unit });
const options = (key, label, labels) => ({ key, label, options: labels.map((v, i) => [i, v]) });
const palette = c => ({ ink: c.ink || '#302d28', a: c.electron || c.blue || c.accent || '#3472a1', b: c.proton || c.red || '#b65743', g: c.green || '#43785b', soft: c.muted || '#8c8174' });
const cp = slug => `https://openstax.org/books/college-physics-2e/pages/${slug}`;
const up = slug => `https://openstax.org/books/university-physics-volume-3/pages/${slug}`;

const refraction = {
  id: 'refraction-rivals', lesson: 'w10-coin', title: 'Two theories, one bending ray', purpose: 'test',
  intro: 'A ray bends towards the normal on entering water. Newton’s corpuscular account and a wave account could both explain that bend. What extra measurement would separate them?',
  investigation: [
    'Compare the two predicted travel times through the same water path. Both accounts use the same measured bending angle.',
    'Reveal the model timing measurement. Divide path length by travel time to decide whether water makes light faster or slower.',
    'Change the path length. Does the evidence still favour the same account? Record the measurement that decided it.'
  ],
  explanation: 'In the historical corpuscular account, attraction into water increased light’s speed; the wave account required a lower speed. Foucault compared light in air and water in 1850 and found it slower in water. This rejected that corpuscular explanation. Modern photons are not Newton’s tiny classical projectiles.',
  limits: 'Ideal air index 1 and water index 1.333; no dispersion. The timing is a calculated modern model reading, not Foucault’s recorded apparatus data. Nanosecond timing and ray dimensions are schematic.',
  sources: [cp('25-3-the-law-of-refraction'), 'https://spcs.canterbury.ac.nz/~wjt23/foucault.html'],
  controls: [range('angle', 'Angle from the normal', 10, 70, 5, '°'), range('length', 'Equal path length in each medium', 1, 6, .5, 'm'), options('reveal', 'Timing evidence', ['Predictions only', 'Show model measurement'])],
  initial: seed => ({ angle: 35 + choice(seed, 5) * 5, length: 2 + choice(seed, 4) * .5, reveal: 0 }),
  compute(s) {
    const n = 1.333, airNs = s.length / C * 1e9, waveNs = airNs * n, corpuscleNs = airNs / n;
    const readings = [reading('Incident angle', s.angle, '°'), reading('Refracted angle', snell(s.angle, 1, n).angleDeg, '°'), reading('Air travel time', airNs, 'ns'), reading('Corpuscular prediction: water time', corpuscleNs, 'ns'), reading('Wave prediction: water time', waveNs, 'ns')];
    if (s.reveal) readings.push(reading('Model measured water time', waveNs, 'ns'));
    return { readings, summary: s.reveal ? 'The equal water path takes longer. The evidence supports the slower-in-water prediction.' : 'The bending alone does not distinguish these two accounts. Inspect their different timing predictions.',
      plots: [{ label: 'Predicted travel time through water', xLabel: 'Path length (m)', yLabel: 'Time (ns)', points: sample(25, 0, 6, x => x / C * 1e9 * n) }, { label: 'Corpuscular rival prediction', xLabel: 'Path length (m)', yLabel: 'Time (ns)', points: sample(25, 0, 6, x => x / C * 1e9 / n) }], cursor: s.length,
      challenge: { prompt: 'From the equal-path air and water timings, how many times longer does light take in water?', answer: n, unit: 'times', tolerance: .015, explanation: 'For equal distances, the time ratio is the inverse speed ratio. Divide the measured water time by the air time.', evidence: 'Equal paths and their model travel times; bending alone cannot answer.', hideControls: [], hideReadings: [] } };
  },
  draw(ctx, s, r, colors) {
    const c = palette(colors), angle = s.angle * Math.PI / 180, out = snell(s.angle, 1, 1.333).angleDeg * Math.PI / 180;
    line(ctx, c.soft, [[30, 145], [330, 145]], 2); line(ctx, c.soft, [[190, 40], [190, 268]], 1, [4, 4]);
    arrow(ctx, c.a, 190 - 100 * Math.sin(angle), 145 - 100 * Math.cos(angle), 100 * Math.sin(angle), 100 * Math.cos(angle));
    arrow(ctx, c.a, 190, 145, 100 * Math.sin(out), 100 * Math.cos(out));
    text(ctx, c.ink, 'air', 40, 80); text(ctx, c.ink, 'water', 40, 205); text(ctx, c.soft, 'normal', 200, 35, 12);
    text(ctx, c.ink, 'Same bend; different predictions', 355, 38, 15);
    const times = r.readings.filter(x => x.label.includes('prediction:'));
    times.forEach((v, i) => { const y = 95 + i * 65; text(ctx, i ? c.a : c.b, i ? 'Wave account' : 'Corpuscular account', 355, y - 12, 14); rect(ctx, i ? c.a : c.b, 355, y, v.value / 30 * 240, 18, true); });
    text(ctx, c.ink, s.reveal ? 'Measurement: longer water time' : 'Reveal timing to test the accounts', 350, 246, 14);
    text(ctx, c.soft, 'Bars share one time scale. Ray lengths are schematic.', 30, 288, 12);
  }
};

const benchIntensity = (s, y) => {
  const wavelength = s.wavelength / 100, width = s.gap / 100;
  return s.mode === 0 ? singleSlit(y, width, wavelength, 2) : singleSlit(y, width / 4, wavelength, 2) * doubleSlit(y, width, wavelength, 2).intensity;
};
const benchDisplacement = (s, x, t) => {
  const wavelength = s.wavelength / 100, frequency = 6 / s.wavelength;
  if (s.mode === 2) return soundWave(x, t, wavelength, frequency, .003).displacement - soundWave(.2 - x, t, wavelength, frequency, .003).displacement;
  if (s.mode === 3 && x > .05) {
    // Continuous phase at the boundary; downstream speed and wavelength are 0.6×.
    const cycles = .05 / wavelength + (x - .05) / (wavelength * .6) - frequency * t;
    return .003 * Math.cos(TAU * cycles);
  }
  return soundWave(x, t, wavelength, frequency, .003).displacement;
};
const markerDisplacement = (s, t) => benchDisplacement(s, .05, t);
const waveBench = {
  id: 'wave-bench', lesson: 'w11-diffraction', title: 'Keep your eye on one marker', purpose: 'discover',
  intro: 'A disturbance crosses the bench. Does one piece of the medium cross with it? Keep the coloured marker in sight while you change openings, add a reflecting end, or enter a slower region.',
  investigation: [
    'Move the time slider through one cycle. Follow the same marked piece and its displacement trace.',
    'Switch between transverse and longitudinal motion. Which direction does the marker move relative to the travelling disturbance?',
    'Keep the wavelength fixed. Compare one opening with two, then narrow the opening. Save each detector profile to compare its width and dark bands.',
    'Try a fixed reflecting end, then the slower region. At the slower boundary count cycles on both sides: frequency stays fixed while wavelength shrinks.'
  ],
  explanation: 'The coloured marker moves around a fixed mean position while the disturbance travels right. Motion across the travel direction is transverse; motion along it is longitudinal. At the detector, contributions from an opening arrive with different phases. Two coherent openings add interference bands inside the single-opening envelope. A fixed end reflects with reversed displacement, making nodes. In a slower region, each cycle travels less far, so wavelength falls while frequency stays fixed.',
  limits: 'Ideal scalar-wave comparisons, not one literal apparatus for every medium. Opening modes use a far-field screen 2 m away; two-gap centre spacing equals the gap setting and each width is one quarter of it. Reflection sums equal incident and inverted reflected waves at a fixed end. The slower-region mode shows normal incidence with 0.6× phase speed and wavelength, constant amplitude and no reflected component; it isolates phase continuity, not energy transmission or shallow-water shoaling. The enlarged marker strip is not water-particle orbits or a literal light medium. Detector intensity is normalised to its central peak; profiles do not compare total transmitted power.',
  sources: [cp('16-9-waves'), cp('16-10-superposition-and-interference'), cp('17-1-sound'), cp('27-3-youngs-double-slit-experiment'), cp('27-5-single-slit-diffraction')],
  controls: [options('mode', 'Bench arrangement', ['One gap', 'Two coherent gaps', 'Fixed reflecting end', 'Slower region']), range('gap', 'Gap width / two-gap spacing', 1, 3, .25, 'cm'), range('wavelength', 'Incoming wavelength', .5, 3, .25, 'cm'), options('motion', 'Marker motion', ['Transverse', 'Longitudinal']), range('time', 'Time', 0, 1, .005, 's')],
  initial: seed => ({ mode: 0, gap: 2 + choice(seed, 4) * .25, wavelength: .75 + choice(seed, 4) * .25, motion: 0, time: 0 }),
  compute(s) {
    const f = 6 / s.wavelength;
    const readings = [reading('Wave speed', 6, 'cm/s'), reading('Frequency', f, 'Hz'), reading('Marker displacement', markerDisplacement(s, s.time) * 1000, 'mm')];
    if (s.mode < 2) readings.push(reading('Central intensity', benchIntensity(s, 0), 'relative'));
    if (s.mode === 3) readings.push(reading('Slower-region speed', 3.6, 'cm/s'), reading('Slower-region wavelength', s.wavelength * .6, 'cm'));
    const profile = s.mode < 2 ? { label: 'Detector profile (retain for comparison)', xLabel: 'Screen position (m)', yLabel: 'Relative intensity', points: sample(241, -2, 2, y => benchIntensity(s, y)) } : { label: 'Displacement across the bench', xLabel: 'Mean position (cm)', yLabel: 'Displacement (mm)', points: sample(401, 0, 10, x => benchDisplacement(s, x / 100, s.time) * 1000) };
    return { readings,
      summary: s.mode === 3 ? 'Across the boundary: speed and wavelength become 0.6×, while frequency stays fixed.' : s.mode === 2 ? 'The fixed end stays still: incident and reversed reflected displacement cancel there.' : 'The same marked piece stays near its mean position. The detector profile changes when the opening or wavelength changes.',
      plots: [profile, { label: 'Marked piece: local motion', xLabel: 'Time (s)', yLabel: 'Displacement (mm)', points: sample(401, 0, 1, t => markerDisplacement(s, t) * 1000) }],
      challenge: { prompt: 'Use the wave speed and wavelength to find the frequency.', answer: f, unit: 'Hz', tolerance: .05, explanation: 'Each cycle advances the pattern one wavelength. Divide speed in cm/s by wavelength in cm.', evidence: 'The selected wavelength, 6 cm/s speed and the marked-piece trace.', hideControls: [], hideReadings: ['Frequency'] } };
  },
  draw(ctx, s, r, colors) {
    const c = palette(colors);
    text(ctx, c.ink, 'One medium; disturbance travels →', 25, 28, 16);
    line(ctx, c.soft, [[25, 120], [350, 120]], 1, [3, 3]);
    for (let i = 0; i <= 40; i++) {
      const x = i / 400, d = benchDisplacement(s, x, s.time), px = 25 + x * 3200, marked = i === 20;
      circle(ctx, marked ? c.b : c.a, px + (s.motion ? d * 3200 : 0), 120 + (s.motion ? 0 : -d * 6000), marked ? 6 : 3, true);
    }
    line(ctx, c.b, [[185, 85], [185, 155]], 1, [3, 3]);
    text(ctx, c.b, 'marked piece; dashed mean position', 25, 180, 13);
    arrow(ctx, c.g, 65, 210, 160, 0, '6 cm/s');
    text(ctx, c.soft, 'Displacements enlarged; marker strip spans 10 cm.', 25, 267, 12);
    if (s.mode >= 2) {
      if (s.mode === 2) line(ctx, c.ink, [[345, 65], [345, 170]], 5);
      else line(ctx, c.g, [[185, 60], [185, 168]], 2, [5, 4]);
      text(ctx, c.ink, s.mode === 2 ? 'Right end fixed' : 'Right half: slower region', 385, 70, 16);
      text(ctx, c.a, s.mode === 2 ? 'Incident wave →' : 'Incoming speed: 6 cm/s', 385, 115, 14);
      text(ctx, c.b, s.mode === 2 ? '← Reversed reflection' : 'Outgoing speed: 3.6 cm/s', 385, 150, 14);
      text(ctx, c.ink, s.mode === 2 ? 'Zero displacement at the end' : 'Same cycles each second', 385, 200, 14);
      text(ctx, c.soft, 'Use the full displacement plot below.', 385, 244, 12);
      return;
    }
    text(ctx, c.ink, s.mode ? 'Two gaps → detector' : 'One gap → detector', 385, 28, 15);
    const width = s.gap / 3 * 65;
    const gaps = s.mode ? [[130 - width / 2, width / 4], [130 + width / 2, width / 4]] : [[130, width]];
    let barrierTop = 50;
    for (const [y, w] of gaps) {
      line(ctx, c.ink, [[400, barrierTop], [400, y - w / 2]], 4);
      line(ctx, c.g, [[392, y - w / 2], [408, y - w / 2]], 2);
      line(ctx, c.g, [[392, y + w / 2], [408, y + w / 2]], 2);
      barrierTop = y + w / 2;
    }
    line(ctx, c.ink, [[400, barrierTop], [400, 230]], 4);
    for (let i = 0; i <= 100; i++) {
      const y = -2 + i * .04, intensity = benchIntensity(s, y), py = 230 - (y + 2) / 4 * 180;
      line(ctx, c.a, [[545, py], [545 + intensity * 65, py]], 2);
    }
    text(ctx, c.soft, '+2 m', 500, 49, 12); text(ctx, c.soft, '−2 m', 500, 245, 12);
    text(ctx, c.soft, 'Screen distance 2 m; geometry schematic', 360, 288, 11);
  }
};

const heardFrequency = s => s.listener === 2 ? s.frequency : doppler(s.frequency, s.listener === 0 ? s.speed : -s.speed, 0, SOUND_SPEED_MS);
const dopplerTrain = {
  id: 'doppler-train', lesson: 'w9-doppler', title: 'Measure a passing train’s horn', purpose: 'measure',
  intro: 'The horn keeps one rhythm. Choose a platform listener ahead, one behind, or the driver travelling with the horn. Predict who counts the most crests each second.',
  investigation: ['Keep the emitted frequency fixed and switch listeners. Compare their received frequency and the crest spacing.', 'Increase train speed. Explain why the front spacing shrinks and the rear spacing grows.', 'If you choose to play a short tone, compare the emitted and received selections. The oscilloscope gives the same evidence without sound.'],
  explanation: 'A crest expands through the air from the place where it was emitted. A moving horn emits its next crest nearer the listener ahead. A stationary listener there receives crests more often. Behind the train they arrive less often. The co-moving driver receives the horn’s emitted frequency.',
  limits: 'Straight radial motion through still air at 348.7 m/s. Platform cases remain on the selected side; this is not a continuous closest-approach flyby. The diagram draws only every twelfth crest. Audio is an optional short constant-frequency sample of the selected listener, not a full train recording.',
  sources: [cp('17-4-doppler-effect-and-sonic-booms')],
  controls: [range('frequency', 'Horn emits', 180, 600, 20, 'Hz'), range('speed', 'Train speed', 0, 60, 5, 'm/s'), options('listener', 'Listener', ['Platform ahead', 'Platform behind', 'Co-moving driver']), options('tone', 'Tone to compare', ['Received', 'Emitted'])],
  initial: seed => ({ frequency: 260 + 20 * choice(seed, 7), speed: 15 + 5 * choice(seed, 7), listener: 0, tone: 0 }),
  compute(s) {
    const received = heardFrequency(s);
    return { readings: [reading('Emitted frequency', s.frequency, 'Hz'), reading('Received frequency', received, 'Hz'), reading('Front crest spacing', (SOUND_SPEED_MS - s.speed) / s.frequency, 'm'), reading('Rear crest spacing', (SOUND_SPEED_MS + s.speed) / s.frequency, 'm')],
      summary: s.listener === 2 ? 'Driver and horn move together: received and emitted frequency match.' : s.listener === 0 ? 'Ahead: smaller crest spacing gives a higher received frequency.' : 'Behind: wider crest spacing gives a lower received frequency.',
      plots: [{ label: 'Emitted oscilloscope trace', xLabel: 'Time (ms)', yLabel: 'Normalised signal', points: sample(401, 0, 20, ms => Math.sin(TAU * s.frequency * ms / 1000)) }, { label: 'Received oscilloscope trace', xLabel: 'Time (ms)', yLabel: 'Normalised signal', points: sample(401, 0, 20, ms => Math.sin(TAU * received * ms / 1000)) }],
      challenge: { prompt: 'Count the received cycles in the 20 ms trace. Estimate the received frequency.', answer: received, unit: 'Hz', tolerance: Math.max(5, received * .025), explanation: 'Frequency is cycles per second. Divide the number of cycles in the displayed 0.020 s by 0.020.', evidence: 'Received oscilloscope trace; emitted frequency and crest spacings are additional checks.', hideControls: [], hideReadings: ['Received frequency'] } };
  },
  sound: s => ({ frequency: s.tone ? s.frequency : heardFrequency(s), duration: .7 }),
  draw(ctx, s, r, colors) {
    const c = palette(colors), timeS = .45, start = -s.speed * timeS, px = x => 320 + x * 1.6;
    ctx.save(); ctx.beginPath(); ctx.rect(20, 40, 600, 190); ctx.clip();
    for (const front of sampledWavefronts({ timeS, sourceStartXM: start, sourceSpeedMs: s.speed, frequencyHz: s.frequency, maxRadiusM: 170 })) circle(ctx, c.a, px(front.centreXM), 155, front.radiusM * 1.6);
    ctx.restore();
    rect(ctx, c.b, 290, 130, 60, 32, true); circle(ctx, c.ink, 301, 169, 6, true); circle(ctx, c.ink, 339, 169, 6, true);
    const listenerX = s.listener === 0 ? 570 : s.listener === 1 ? 70 : 320;
    circle(ctx, c.g, listenerX, s.listener === 2 ? 115 : 210, 7, true);
    arrow(ctx, c.b, 295, 90, s.speed * 1.4, 0);
    text(ctx, c.ink, ['Platform ahead', 'Platform behind', 'Driver'][s.listener], Math.min(470, Math.max(25, listenerX - 55)), 250, 14);
    text(ctx, c.ink, 'Each circle is centred where its crest was emitted.', 25, 27, 15);
    text(ctx, c.soft, `Only 1 in ${CREST_STRIDE} crests drawn. Use the traces to count actual cycles.`, 25, 284, 12);
  }
};

const telescopeValues = s => {
  const magnification = s.objective / s.eyepiece, field = 50 / magnification;
  const resolution = 1.22 * 550e-9 / (s.aperture / 1000) * 180 / Math.PI * 3600;
  return { magnification, field, resolution, moonFraction: .5 / field, resolved: 2 >= resolution };
};
const telescope = {
  id: 'telescope-designer', lesson: 'w10-eye', title: 'Build a view that answers your question', purpose: 'make',
  intro: 'First fit the whole Moon in the eyepiece. Then try to distinguish two stars 2 arcseconds apart. Will more magnification solve both jobs?',
  investigation: ['Use the Moon target. Change the eyepiece focal length and compare the Moon diameter with the field circle.', 'Choose the close stars. Keep the focal lengths fixed while increasing aperture. Watch the diffraction discs and resolution reading.', 'Save two designs: a wide Moon view and a close-star view. Explain which part of each instrument matters.'],
  explanation: 'A shorter eyepiece increases magnification but gives a smaller patch of sky through this fixed 50° apparent field. A larger objective aperture gathers more light and narrows the diffraction pattern. Magnification alone enlarges an unresolved blur; it cannot replace aperture.',
  limits: 'Ideal paraxial telescope with 50° apparent eyepiece field; true field ≈ apparent field / magnification. Resolution uses the Rayleigh criterion at 550 nm. No atmosphere, aberrations, eye acuity, glare or brightness adaptation. Close-star view is enlarged 200× relative to the whole field; rings mark first diffraction minima, not hard star edges. Moon diameter is an illustrative 0.5°.',
  sources: [up('2-8-microscopes-and-telescopes'), up('4-5-circular-apertures-and-resolution')],
  controls: [range('objective', 'Objective focal length', 400, 1600, 100, 'mm'), range('eyepiece', 'Eyepiece focal length', 5, 40, 5, 'mm'), range('aperture', 'Objective aperture', 30, 200, 10, 'mm'), options('target', 'Target', ['Whole Moon', 'Close star pair'])],
  initial: seed => ({ objective: 600 + 100 * choice(seed, 5), eyepiece: 20 + 5 * choice(seed, 4), aperture: 40 + 10 * choice(seed, 6), target: 0 }),
  compute(s) {
    const v = telescopeValues(s);
    return { readings: [reading('Magnification', v.magnification, '×'), reading('True field diameter', v.field, '°'), reading('Diffraction resolution', v.resolution, 'arcsec'), reading('Moon diameter', .5, '°'), reading('Star separation', 2, 'arcsec'), reading('Relative collecting area (vs 30 mm)', (s.aperture / 30) ** 2, 'times')],
      summary: s.target === 0 ? v.moonFraction <= 1 ? 'The whole Moon fits inside the field.' : 'The Moon is larger than the field: choose a wider view.' : v.resolved ? 'The ideal aperture meets the Rayleigh criterion for this pair.' : 'These stars fail the ideal resolution criterion. Increasing magnification alone cannot separate their diffraction patterns.',
      plots: [{ label: 'Aperture sets the resolution limit', xLabel: 'Aperture (mm)', yLabel: 'Resolution (arcsec)', points: sample(171, 30, 200, a => 1.22 * 550e-9 / (a / 1000) * 180 / Math.PI * 3600) }], cursor: s.aperture,
      challenge: { prompt: 'With a 50° apparent eyepiece field and your chosen magnification, estimate the true field diameter.', answer: v.field, unit: '°', tolerance: .015, explanation: 'Divide the eyepiece’s 50° apparent field by the magnification. Check that a 0.5° Moon fits when the answer exceeds 0.5°.', evidence: 'Focal lengths, magnification and the Moon-to-field drawing.', hideControls: [], hideReadings: ['True field diameter'] } };
  },
  draw(ctx, s, r, colors) {
    const c = palette(colors), v = telescopeValues(s), x = 180, y = 147, radius = 105;
    text(ctx, c.ink, s.target ? 'Close-star inset: 200× whole-field scale' : 'Moon and field on one angular scale', 25, 25, 15);
    circle(ctx, c.ink, x, y, radius);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.clip();
    if (!s.target) { circle(ctx, c.soft, x, y, radius * v.moonFraction, true); circle(ctx, c.ink, x, y, radius * v.moonFraction); }
    else {
      const pxPerArcsec = 2 * radius / (v.field * 3600) * 200, offset = pxPerArcsec, blur = v.resolution * pxPerArcsec;
      for (const sign of [-1, 1]) { circle(ctx, c.a, x + sign * offset, y, blur); circle(ctx, c.b, x + sign * offset, y, 2, true); }
    }
    ctx.restore();
    text(ctx, c.soft, s.target ? 'Rings: first diffraction minima' : 'Circle: edge of the eyepiece field', 45, 276, 12);
    const halfAperture = s.aperture / 200 * 62;
    line(ctx, c.a, [[375, 150 - halfAperture], [375, 150 + halfAperture]], 5);
    const eyeX = 400 + s.objective / 1600 * 170;
    line(ctx, c.b, [[eyeX, 128], [eyeX, 172]], 4);
    line(ctx, c.soft, [[375, 150 - halfAperture], [eyeX - 15, 150], [eyeX, 143]], 1);
    line(ctx, c.soft, [[375, 150 + halfAperture], [eyeX - 15, 150], [eyeX, 157]], 1);
    text(ctx, c.a, 'objective', 350, 240, 14); text(ctx, c.b, 'eyepiece', 520, 240, 14);
    text(ctx, c.soft, 'Layout schematic; view uses calculated angles.', 345, 286, 11);
  }
};

const thermalEnergy = s => s.power * s.time / 1000;
const thermal = {
  id: 'heating-evidence', lesson: 'w8-phase', title: 'Follow energy while the thermometer waits', purpose: 'measure',
  intro: 'An ideal heater supplies energy to 1 kg of ice starting at −20 °C. Can energy keep entering while the temperature stays still? Choose which instruments will measure the input.',
  investigation: ['Choose power-and-time, a joulemeter, or voltage-current-time. Predict whether all three should give the same energy.', 'Move time through the melting plateau. Compare the thermometer, supplied-energy graph and particle arrangement.', 'Repeat with another power. The time changes; does the energy needed to finish melting change? Keep real household heating observations separate from these ideal readings.'],
  explanation: 'Before melting, energy raises the temperature. During melting it changes the arrangement and interactions of the particles while the temperature remains 0 °C. A joulemeter measures supplied electrical energy directly; power × time or voltage × current × time estimates that same input for a steady heater. Only in this insulated model does all input reach the sample.',
  limits: '1 kg of pure water at atmospheric pressure, constant power, no heat loss or container heating. Reuses the book’s phase model: ice specific heat rounded to 2100 J/(kg K), water 4186, fusion 334 kJ/kg, vaporisation 2256 kJ/kg. The equally sized dots are illustrative particles, with prescribed motion; not a molecular simulation. Liquid positions are more compact than the open ice arrangement. Voltage is fixed at an illustrative 20 V; this is a model, not a wiring or heating instruction.',
  sources: [cp('14-2-temperature-change-and-heat-capacity'), cp('14-3-phase-change-and-latent-heat'), cp('20-4-electric-power-and-energy')],
  controls: [options('route', 'Measure input energy with', ['Power and time', 'Joulemeter', 'Voltage, current and time']), range('power', 'Steady heater power', 100, 500, 25, 'W'), range('time', 'Heating time', 0, 6000, 10, 's')],
  initial: seed => ({ route: choice(seed, 3), power: 200 + 25 * choice(seed, 9), time: 600 + 100 * choice(seed, 5) }),
  compute(s) {
    const q = thermalEnergy(s), p = phaseState(q), phaseEnergy = Math.min(Math.max(q - 42, 0), 334) + Math.max(q - 794.6, 0);
    const readings = [reading('Sample mass', 1, 'kg'), reading('Temperature', p.temperatureC, '°C'), reading('Melted fraction', p.liquidFraction, 'fraction'), reading('Vapour fraction', p.vapourFraction, 'fraction'), reading('Energy in phase changes', phaseEnergy, 'kJ')];
    if (s.route === 0) readings.push(reading('Measured power', s.power, 'W'), reading('Elapsed time', s.time, 's'), reading('Power × time', q, 'kJ'));
    else if (s.route === 1) readings.push(reading('Joulemeter increase', q, 'kJ'));
    else readings.push(reading('Voltmeter', 20, 'V'), reading('Ammeter', s.power / 20, 'A'), reading('Elapsed time', s.time, 's'), reading('Voltage × current × time', q, 'kJ'));
    const times = [...new Set([0, ...[42, 376, 794.6, 3050.6].map(e => e * 1000 / s.power).filter(t => t < 6000), ...sample(61, 0, 6000, t => t).map(p => p[0])])].sort((a, b) => a - b);
    return { readings, summary: `The sample is ${p.stage}. Compare the temperature and energy curves at the same time.`, cursor: s.time,
      plots: [{ label: 'Thermometer follows the same sample', xLabel: 'Time (s)', yLabel: 'Temperature (°C)', points: times.map(t => [t, phaseState(s.power * t / 1000).temperatureC]) }, { label: 'Supplied energy keeps increasing', xLabel: 'Time (s)', yLabel: 'Energy (kJ)', points: [[0, 0], [6000, s.power * 6]] }],
      challenge: { prompt: 'How much of the supplied energy so far has changed phase, rather than raised temperature?', answer: phaseEnergy, unit: 'kJ', tolerance: .5, explanation: 'The first 42 kJ warms the ice. The next 334 kJ melts it. Warming liquid then takes 418.6 kJ before energy begins boiling it.', evidence: 'Input-energy instruments and the flat sections of the linked temperature curve.', hideControls: [], hideReadings: ['Energy in phase changes'] } };
  },
  draw(ctx, s, r, colors) {
    const c = palette(colors), p = phaseState(thermalEnergy(s));
    text(ctx, c.ink, 'One sample, one energy account', 25, 28, 16);
    rect(ctx, c.soft, 40, 55, 290, 175); text(ctx, c.ink, p.stage, 50, 252, 15);
    const motion = Math.sqrt((p.temperatureC + 273.15) / 273.15);
    for (let i = 0; i < 32; i++) {
      const fraction = (i + .5) / 32, gas = fraction < p.vapourFraction, liquid = fraction < p.liquidFraction, phase = i * 2.399 + s.time * .07 * motion;
      const x = gas ? 55 + ((i * 47 + s.time * .1 * (1 + i % 3)) % 260) : liquid ? 95 + (i % 8) * 24 + 7 * Math.cos(phase) : 65 + (i % 8) * 34 + 2 * Math.cos(phase);
      const y = gas ? 65 + ((i * 29 + s.time * .08) % 145) : liquid ? 130 + Math.floor(i / 8) * 23 + 6 * Math.sin(phase) : 85 + Math.floor(i / 8) * 38 + 2 * Math.sin(phase);
      circle(ctx, gas ? c.b : liquid ? c.a : c.soft, x, y, 4, true);
    }
    text(ctx, c.ink, ['Power × elapsed time', 'Joulemeter increase', 'Voltage × current × time'][s.route], 365, 72, 15);
    rect(ctx, c.g, 365, 100, thermalEnergy(s) / 3000 * 230, 23, true);
    text(ctx, c.g, 'Supplied-energy bar: 0 to 3000 kJ', 365, 147, 12);
    arrow(ctx, c.b, 365, 200, -24, 0); text(ctx, c.b, 'heater supplies energy', 378, 205, 14);
    text(ctx, c.soft, 'Dots stay the same size. Motion and phase layout are illustrative.', 25, 286, 12);
  }
};

export const activities = [refraction, waveBench, dopplerTrain, telescope, thermal];
