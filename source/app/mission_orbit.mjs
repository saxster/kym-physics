// Physical apsides include the central body's radius. Each selected orbit is
// fitted uniformly to its panel; eccentricity and body-to-orbit size stay true.
export function fitMissionOrbit(periHeightKm, apoHeightKm, bodyRadiusKm, width, height) {
  const periKm = bodyRadiusKm + periHeightKm;
  const apoKm = bodyRadiusKm + apoHeightKm;
  const aKm = (periKm + apoKm) / 2;
  const cKm = (apoKm - periKm) / 2;
  const bKm = Math.sqrt(periKm * apoKm);
  const pxPerKm = Math.min((width - 48) / (2 * aKm), (height - 112) / (2 * bKm));
  const cx = width / 2, cy = height / 2 + 2;
  return {
    a: aKm * pxPerKm, b: bKm * pxPerKm, c: cKm * pxPerKm,
    cx, cy, focusX: cx - cKm * pxPerKm, focusY: cy,
    bodyRadius: bodyRadiusKm * pxPerKm, pxPerKm,
    eccentricity: cKm / aKm,
  };
}

// Kilometres and km³/s² keep the apsides, central radius and GM consistent.
export function missionPeriodHours(periHeightKm, apoHeightKm, bodyRadiusKm, gmKm3s2) {
  const aKm = bodyRadiusKm + (periHeightKm + apoHeightKm) / 2;
  return 2 * Math.PI * Math.sqrt(aKm ** 3 / gmKm3s2) / 3600;
}
