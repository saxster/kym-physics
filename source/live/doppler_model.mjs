// Sparse sound crests for a straight, constant-speed source in still air.
// The model clock is physical seconds. A slower display changes that clock's
// rate, never the relative speeds of the source and the sound wavefronts.
export const SOUND_SPEED_MS = 348.7;
export const CREST_STRIDE = 12;

export function sampledWavefronts({ timeS, sourceStartXM, sourceSpeedMs, frequencyHz, maxRadiusM = 220 }) {
  const intervalS = CREST_STRIDE / frequencyHz;
  const maxAgeS = maxRadiusM / SOUND_SPEED_MS;
  const first = Math.max(0, Math.ceil((timeS - maxAgeS) / intervalS - 1e-10));
  const last = Math.floor(timeS / intervalS + 1e-10);
  const fronts = [];
  for (let index = first; index <= last; index++) {
    const emittedAtS = index * intervalS;
    const ageS = Math.max(0, timeS - emittedAtS);
    fronts.push({
      index,
      emittedAtS,
      centreXM: sourceStartXM + sourceSpeedMs * emittedAtS,
      radiusM: SOUND_SPEED_MS * ageS,
    });
  }
  return fronts;
}
