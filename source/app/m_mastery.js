// Spaced retrieval & honest two-day proof queue for web books (Surface B).
// Persists in App.store ('mastery') with zero streaks, XP, or internal engine jargon.
import App from './core.js';
import {
  createCard,
  createSkill,
  interleaveItems,
  propagateImplicitCredit,
  ratingFromAttempt,
  scheduleFSRS,
  updateBKT,
} from './mastery_model.mjs';

function localDayKey(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

App.ready(() => {
  const { store } = App;
  const state = store.get('mastery', { cards: {}, skills: {}, proofs: {}, links: [] });
  state.cards = state.cards || {};
  state.skills = state.skills || {};
  state.proofs = state.proofs || {};
  state.links = state.links || [];

  const save = () => store.set('mastery', state);

  function recordCheck({
    id,
    chapterId = 'ch-1',
    skillId = 'core',
    isCorrect,
    usedHelp = false,
    isClosedChoice = false,
    responseTimeMs = 4500,
    nowMs = Date.now(),
  }) {
    if (!id) return null;
    const day = localDayKey(nowMs);
    const prevProof = state.proofs[id] || {
      id,
      chapterId,
      skillId,
      status: 'unseen',
      distinctDays: 0,
      lastProvenDay: null,
      lastWrongAtMs: null,
    };

    const isRapidBruteForce =
      Boolean(isCorrect) &&
      !usedHelp &&
      isClosedChoice &&
      ((prevProof.lastWrongAtMs != null && nowMs - prevProof.lastWrongAtMs < 5000) || responseTimeMs < 1200);

    let skill = state.skills[skillId] || createSkill(skillId);
    if (!isRapidBruteForce) {
      skill = updateBKT(skill, Boolean(isCorrect), Boolean(usedHelp));
      state.skills[skillId] = skill;

      if (state.links.length && (!isCorrect || !usedHelp)) {
        for (const adj of propagateImplicitCredit(skillId, Boolean(isCorrect) && !usedHelp, state.links)) {
          const pre = state.skills[adj.skillID] || createSkill(adj.skillID);
          pre.pLearned = Math.min(0.99, Math.max(0.05, pre.pLearned + adj.bktDelta));
          state.skills[adj.skillID] = pre;
        }
      }
    }

    let card = state.cards[id] || createCard();
    const proof = { ...prevProof, chapterId, skillId, updatedAtMs: nowMs };

    if (!isCorrect) {
      proof.distinctDays = 0;
      proof.lastProvenDay = null;
      proof.lastWrongAtMs = nowMs;
      proof.status = proof.status === 'proven' || proof.status === 'secure' ? 'retest_scheduled' : 'working';
      card = scheduleFSRS(card, ratingFromAttempt(false, responseTimeMs), nowMs).card;
      state.cards[id] = card;
    } else if (usedHelp) {
      proof.distinctDays = 0;
      proof.lastProvenDay = null;
      proof.status = proof.status === 'proven' || proof.status === 'secure' ? 'retest_scheduled' : 'assisted';
    } else if (isRapidBruteForce) {
      if (proof.status === 'unseen') proof.status = 'working';
    } else {
      if (proof.lastProvenDay !== day) {
        proof.distinctDays += 1;
        proof.lastProvenDay = day;
      }
      proof.status = proof.distinctDays >= 2 && skill.pLearned >= 0.85 ? 'secure' : 'proven';
      const profile = isClosedChoice ? 'conceptual_choice' : 'multi_step_derivation';
      const scheduled = scheduleFSRS(card, ratingFromAttempt(true, responseTimeMs, profile), nowMs);
      card = { ...scheduled.card, dueAtMs: scheduled.dueAtMs };
      state.cards[id] = card;
    }

    state.proofs[id] = proof;
    save();
    return { skill, proof, card };
  }

  function dueChecks(nowMs = Date.now(), maxSitting = 3) {
    const today = localDayKey(nowMs);
    const candidates = Object.values(state.proofs).filter(p => {
      const updatedDay = p.updatedAtMs ? localDayKey(p.updatedAtMs) : '';
      if (p.status === 'retest_scheduled' && updatedDay !== today) return true;
      if (p.status === 'assisted' && updatedDay !== today) return true;
      if (p.status === 'proven' && p.lastProvenDay && p.lastProvenDay !== today) return true;
      const card = state.cards[p.id];
      return Boolean(card && card.dueAtMs && card.dueAtMs <= nowMs && updatedDay !== today);
    });
    return interleaveItems(candidates, maxSitting, x => x.chapterId, x => x.skillId);
  }

  App.mastery = {
    recordCheck,
    dueChecks,
    registerSkillLinks(links) {
      if (Array.isArray(links)) {
        state.links = links;
        save();
      }
    },
    getProof(id) {
      return state.proofs[id] || null;
    },
    reset() {
      state.cards = {};
      state.skills = {};
      state.proofs = {};
      save();
    },
  };
});
