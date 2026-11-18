// Pure FSRS v5 + BKT + FIRe + Interleaving model shared by web/book-engine and Swift parity tests.
// Matches Sources/KymLearning/{FSRSScheduler,BKTEngine,KymLearningSkillGraph,KymLearningInterleaver}.swift.

export const FSRS_RATING = Object.freeze({ AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 });
export const FSRS_STATE = Object.freeze({ NEW: 0, LEARNING: 1, REVIEW: 2, RELEARNING: 3 });

export const FSRS_V5_WEIGHTS = Object.freeze([
  0.4072, 1.1829, 3.1262, 15.4722,
  7.2102, 0.5316, 1.0651, 0.0234,
  1.6160, 0.1544, 1.0070, 1.9395,
  0.0953, 0.2803, 2.0902, 0.2318, 2.8214,
]);

const DECAY = -0.5;
const FACTOR = Math.pow(0.9, 1.0 / DECAY) - 1.0;

export function createCard(overrides = {}) {
  return {
    stability: 0.0,
    difficulty: 0.0,
    retrievability: 0.0,
    reps: 0,
    lapses: 0,
    state: FSRS_STATE.NEW,
    lastReviewMs: null,
    scheduledDays: 0,
    ...overrides,
  };
}

export function retrievability(elapsedDays, stability) {
  if (!(stability > 0)) return 0.0;
  return Math.pow(1.0 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

function constrainDifficulty(d) {
  return Math.max(1.0, Math.min(10.0, d));
}

function initStability(rating, w = FSRS_V5_WEIGHTS) {
  return w[rating - 1];
}

function initDifficulty(rating, w = FSRS_V5_WEIGHTS) {
  return constrainDifficulty(w[4] - Math.exp(w[5] * (rating - 1)) + 1.0);
}

function nextDifficulty(difficulty, rating, w = FSRS_V5_WEIGHTS) {
  const delta = -w[6] * (rating - 3);
  const adjusted = difficulty + delta;
  const reversion = w[7] * (initDifficulty(FSRS_RATING.EASY, w) - adjusted);
  return constrainDifficulty(adjusted + reversion);
}

function nextRecallStability(difficulty, stability, retr, rating, w = FSRS_V5_WEIGHTS) {
  const hardPenalty = rating === FSRS_RATING.HARD ? w[15] : 1.0;
  const easyBonus = rating === FSRS_RATING.EASY ? w[16] : 1.0;
  return stability * (
    1.0 +
    Math.exp(w[8]) *
      (11.0 - difficulty) *
      Math.pow(stability, -w[9]) *
      (Math.exp((1.0 - retr) * w[10]) - 1.0) *
      hardPenalty *
      easyBonus
  );
}

function nextForgetStability(difficulty, stability, retr, w = FSRS_V5_WEIGHTS) {
  return (
    w[11] *
    Math.pow(difficulty, -w[12]) *
    (Math.pow(stability + 1.0, w[13]) - 1.0) *
    Math.exp((1.0 - retr) * w[14])
  );
}

function nextIntervalDays(stability, requestedRetention = 0.88, maximumInterval = 36500) {
  const raw = (stability / FACTOR) * (Math.pow(requestedRetention, 1.0 / DECAY) - 1.0);
  return Math.max(1, Math.min(Math.round(raw), maximumInterval));
}

export function scheduleFSRS(
  card,
  rating,
  nowMs = Date.now(),
  { requestedRetention = 0.88, maximumInterval = 36500, relearningStepDays = 1.0 } = {}
) {
  const elapsedDays = card.lastReviewMs != null ? Math.max(0, (nowMs - card.lastReviewMs) / 86_400_000) : 0;
  const curR = retrievability(elapsedDays, card.stability);
  let next = { ...card, retrievability: curR };

  if (card.state === FSRS_STATE.NEW) {
    next = createCard({
      stability: initStability(rating),
      difficulty: initDifficulty(rating),
      reps: 1,
      lapses: rating === FSRS_RATING.AGAIN ? 1 : 0,
      state: rating === FSRS_RATING.AGAIN || rating === FSRS_RATING.HARD ? FSRS_STATE.LEARNING : FSRS_STATE.REVIEW,
    });
  } else if (card.state === FSRS_STATE.LEARNING || card.state === FSRS_STATE.RELEARNING) {
    next.reps += 1;
    if (rating === FSRS_RATING.AGAIN) {
      next.stability = initStability(FSRS_RATING.AGAIN);
      next.difficulty = nextDifficulty(card.difficulty, rating);
      next.lapses += 1;
      next.state = card.state === FSRS_STATE.LEARNING ? FSRS_STATE.LEARNING : FSRS_STATE.RELEARNING;
    } else {
      next.stability = nextRecallStability(card.difficulty, card.stability, curR, rating);
      next.difficulty = nextDifficulty(card.difficulty, rating);
      if (rating === FSRS_RATING.GOOD || rating === FSRS_RATING.EASY) next.state = FSRS_STATE.REVIEW;
    }
  } else {
    next.reps += 1;
    if (rating === FSRS_RATING.AGAIN) {
      next.stability = nextForgetStability(card.difficulty, card.stability, curR);
      next.difficulty = nextDifficulty(card.difficulty, rating);
      next.lapses += 1;
      next.state = FSRS_STATE.RELEARNING;
    } else {
      next.stability = nextRecallStability(card.difficulty, card.stability, curR, rating);
      next.difficulty = nextDifficulty(card.difficulty, rating);
    }
  }

  next.retrievability = card.stability > 0 ? curR : 1.0;
  next.stability = Math.max(0.1, Math.min(next.stability, maximumInterval));
  next.difficulty = constrainDifficulty(next.difficulty);

  const intervalDays =
    rating === FSRS_RATING.AGAIN && relearningStepDays != null
      ? relearningStepDays
      : nextIntervalDays(next.stability, requestedRetention, maximumInterval);
  next.scheduledDays = intervalDays;
  next.lastReviewMs = nowMs;

  return {
    card: next,
    intervalDays,
    dueAtMs: nowMs + intervalDays * 86_400_000,
  };
}

export function ratingFromAttempt(isCorrect, responseTimeMs, profile = 'multi_step_derivation') {
  if (!isCorrect) return FSRS_RATING.AGAIN;
  const seconds = Math.max(0, Number(responseTimeMs) || 0) / 1000.0;
  if (profile === 'atomic_recall') {
    if (seconds < 3.0) return FSRS_RATING.EASY;
    return seconds <= 10.0 ? FSRS_RATING.GOOD : FSRS_RATING.HARD;
  }
  if (profile === 'conceptual_choice') {
    return seconds <= 25.0 ? FSRS_RATING.GOOD : FSRS_RATING.HARD;
  }
  return seconds <= 90.0 ? FSRS_RATING.GOOD : FSRS_RATING.HARD;
}

export function createSkill(skillID, overrides = {}) {
  return {
    skillID,
    pLearned: 0.25,
    pTransit: 0.18,
    pSlip: 0.10,
    pGuess: 0.20,
    independentEvidenceCount: 0,
    assistedEvidenceCount: 0,
    ...overrides,
  };
}

export function updateBKT(skill, isCorrect, usedAssistance = false, assistedCap = 0.68) {
  const next = { ...skill };
  if (usedAssistance) {
    next.assistedEvidenceCount += 1;
    const boost = isCorrect ? 0.04 : 0.0;
    next.pLearned = skill.pLearned > assistedCap ? skill.pLearned : Math.min(assistedCap, skill.pLearned + boost);
    return next;
  }
  next.independentEvidenceCount += 1;
  const L = skill.pLearned, S = skill.pSlip, G = skill.pGuess, T = skill.pTransit;
  let posterior;
  if (isCorrect) {
    const num = L * (1.0 - S);
    const den = num + (1.0 - L) * G;
    posterior = den > 0 ? num / den : L;
  } else {
    const num = L * S;
    const den = num + (1.0 - L) * (1.0 - G);
    posterior = den > 0 ? num / den : L;
  }
  const updatedL = posterior + (1.0 - posterior) * T;
  next.pLearned = Math.min(0.99, Math.max(0.05, updatedL));
  return next;
}

export function propagateImplicitCredit(completedSkillID, passedUnassisted, links = []) {
  const needle = String(completedSkillID || '').toLowerCase();
  return links
    .filter(l => String(l.dependentSkillID || '').toLowerCase() === needle)
    .map(l => {
      const w = Math.min(1.0, Math.max(0.1, Number(l.weight ?? 0.5)));
      if (passedUnassisted) {
        return {
          skillID: l.prerequisiteSkillID,
          stabilityMultiplier: Math.round((1.0 + 0.25 * w) * 1000) / 1000,
          bktDelta: Math.round(0.04 * w * 10_000) / 10_000,
        };
      }
      return {
        skillID: l.prerequisiteSkillID,
        stabilityMultiplier: Math.round((1.0 - 0.15 * w) * 1000) / 1000,
        bktDelta: Math.round(-0.03 * w * 10_000) / 10_000,
      };
    });
}

export function interleaveItems(items, limit = items.length, getCategory = x => x.category, getConcept = null) {
  const cap = Math.max(0, limit);
  if (!cap || !items.length) return [];
  const remaining = items.slice();
  const selected = [];
  let prevCat = null;
  let prevConcept = null;

  while (selected.length < cap && remaining.length > 0) {
    let idx = remaining.findIndex(it => {
      const catOk = prevCat == null || getCategory(it) !== prevCat;
      const conOk = !getConcept || prevConcept == null || getConcept(it) !== prevConcept;
      return catOk && conOk;
    });
    if (idx < 0 && prevCat != null) {
      idx = remaining.findIndex(it => getCategory(it) !== prevCat);
    }
    if (idx < 0) idx = 0;
    const chosen = remaining.splice(idx, 1)[0];
    prevCat = getCategory(chosen);
    prevConcept = getConcept ? getConcept(chosen) : null;
    selected.push(chosen);
  }
  return selected;
}
