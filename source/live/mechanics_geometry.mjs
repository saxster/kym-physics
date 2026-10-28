// Presentation geometry and force accounts use SI quantities, independently of pixels.
export function projectileDrawingScale(xLand, upwardVy, tableHeight = 0.75) {
  const apex = tableHeight + Math.max(0, upwardVy) ** 2 / (2 * 9.8);
  return Math.min(240, 450 / Math.max(0.1, xLand), 192 / apex);
}
export function buoyancyForceAccount(bodyDensity, bodyVolume, fluidDensity, submergedVolume, onFloor) {
  const weight = bodyDensity * bodyVolume * 9.8;
  const buoyancy = fluidDensity * submergedVolume * 9.8;
  return {weight, buoyancy, support: onFloor ? Math.max(0, weight - buoyancy) : 0};
}
export function clockwiseTangent(inwardX, inwardY) {
  return {x: inwardY, y: -inwardX};
}

// Interpolate saved model positions onto one exact strobe clock.
export function equalTimePositions(samples, interval = 0.1) {
  if (!samples.length) return [];
  const result = [], end = samples[samples.length - 1].t;
  let index = 1;
  for (let tick = 0; tick * interval <= end + 1e-10; tick++) {
    const t = tick * interval;
    while (index < samples.length - 1 && samples[index].t < t) index++;
    const a = samples[Math.max(0,index-1)], b = samples[Math.min(index,samples.length-1)];
    const f = b.t > a.t ? Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t))) : 0;
    result.push({t, y0:a.y0+(b.y0-a.y0)*f, y1:a.y1+(b.y1-a.y1)*f});
  }
  return result;
}
