// Eccentric anomaly is the parameter of x=a(cos E-e), y=b sin E.
// Advance mean anomaly uniformly; this preserves equal swept areas in equal times.
export function eccentricAnomaly(meanAnomaly, eccentricity) {
  let E = meanAnomaly;
  for (let i = 0; i < 9; i++) {
    E -= (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
  }
  return E;
}
