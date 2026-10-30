// Learning evidence and review dates. No DOM, network or reading-progress inputs.
const INDEPENDENT = new Set(['independent', 'transfer', 'review', 'paper']);
const CHANGED = new Set(['transfer', 'review', 'paper']);
const INTERVALS = [1, 3, 7, 14, 30];
const ERRORS = new Set(['concept', 'method', 'units', 'graph', 'wording']);
const object = x => x && typeof x === 'object' && !Array.isArray(x);
const validTime = x => typeof x === 'number' && Number.isFinite(x) && x > 0;
const dayKey = time => {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const plusDays = (time, days) => { const d = new Date(time); d.setDate(d.getDate() + days); return d.getTime(); };
const cleanPoints = (values, max) => [...new Set((Array.isArray(values) ? values : []).filter(n => Number.isInteger(n) && n >= 0 && n < max))];

export function normaliseState(raw, catalog) {
  raw = object(raw) ? raw : {};
  const questions = new Map(catalog.questions.map(q => [q.id, q]));
  const state = { version: 1, attempts: [], drafts: {}, scope: {}, paper: null };
  for (const a of Array.isArray(raw.attempts) ? raw.attempts : []) {
    if (!object(a) || !questions.has(a.qid) || !validTime(a.at) || typeof a.answer !== 'string' || !a.answer.trim()) continue;
    const q = questions.get(a.qid), points = cleanPoints(a.points, q.marks);
    state.attempts.push({ qid: q.id, at: a.at, answer: a.answer, unit: typeof a.unit === 'string' ? a.unit : '',
      numericAnswer: typeof a.numericAnswer === 'string' ? a.numericAnswer : '', points, score: points.length, max: q.marks,
      helped: typeof a.helped === 'boolean' ? a.helped : a.assisted === true,
      assisted: a.assisted === true || state.attempts.some(old => old.qid === a.qid),
      mistakes: (Array.isArray(a.mistakes) ? a.mistakes : []).filter(x => ERRORS.has(x)), source: a.source === 'paper' ? 'paper' : 'practice' });
  }
  for (const q of catalog.questions) {
    const d = raw.drafts?.[q.id];
    if (!object(d)) continue;
    const draft = {};
    for (const field of ['answer', 'numericAnswer', 'unit', 'committedAnswer', 'committedUnit']) if (typeof d[field] === 'string') draft[field] = d[field];
    for (const field of ['revealed', 'assisted', 'saved', 'solutionSeen']) draft[field] = d[field] === true;
    if (validTime(d.committedAt)) draft.committedAt = d.committedAt;
    draft.hintsUsed = Number.isInteger(d.hintsUsed) && d.hintsUsed >= 0 ? Math.min(d.hintsUsed, q.hints?.length || 0) : 0;
    draft.selectedPoints = cleanPoints(d.selectedPoints, q.marks);
    draft.mistakes = (Array.isArray(d.mistakes) ? d.mistakes : []).filter(x => ERRORS.has(x));
    state.drafts[q.id] = draft;
  }
  for (const o of catalog.objectives) state.scope[o.id] = raw.scope?.[o.id] !== false;
  const p = raw.paper;
  if (object(p) && catalog.papers.some(x => x.id === p.id) && validTime(p.startedAt)
      && (p.untimed === true || validTime(p.deadline))) {
    state.paper = { id: p.id, startedAt: p.startedAt, deadline: p.untimed === true ? null : p.deadline,
      finishedAt: validTime(p.finishedAt) ? p.finishedAt : null, untimed: p.untimed === true };
  }
  return state;
}

export function numericFeedback(value, unit, spec) {
  const text = String(value ?? '').trim().replaceAll('−', '-');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text) || !Number.isFinite(Number(text)))
    return { correct: false, message: 'Enter a finite number for your final value.' };
  const canonical = s => {
    const raw = String(s ?? '').normalize('NFKC').replace(/[\s·⋅]/g, '').replaceAll('−', '-').replace(/\^([+-]?\d)/g, '$1');
    const names = {ohm:'Ω',ohms:'Ω',degree:'°',degrees:'°','deg/h':'°/h','degrees/hour':'°/h',newton:'N',newtons:'N',joule:'J',joules:'J',ampere:'A',amperes:'A',amp:'A',amps:'A',volt:'V',volts:'V',watt:'W',watts:'W',hertz:'Hz',becquerel:'Bq',becquerels:'Bq',pascal:'Pa',pascals:'Pa',litre:'L',litres:'L',liter:'L',liters:'L',kilogram:'kg',kilograms:'kg',millimetre:'mm',millimetres:'mm',day:'days',percent:'%'};
    if (names[raw.toLowerCase()]) return names[raw.toLowerCase()];
    return ({ 'Nm-1':'N/m', 'Jkg-1':'J/kg', 'kgms-1':'kgm/s', 'ms-1': 'm/s', 'ms-2': 'm/s2', 'm/s/s': 'm/s2', 'metres/second': 'm/s', 'seconds': 's', 'second': 's', 'metres': 'm', 'metre': 'm' })[raw] || raw;
  };
  if (canonical(unit) !== canonical(spec.unit)) return { correct: false, message: `For this numerical check, use the unit ${spec.unit}. Equivalent units can still earn credit using the marking guidance.` };
  const correct = Math.abs(Number(text) - spec.value) <= (spec.tolerance || 0) + Number.EPSILON * Math.max(1, Math.abs(spec.value)) * 4;
  return { correct, message: correct ? 'Your final value and unit agree with the model. Check your method against the mark points.' : 'Your final value differs from the model. Compare your method with the worked steps.' };
}

export function recordAttempt(state, question, input) {
  if (typeof input.answer !== 'string' || !input.answer.trim()) throw new Error('Write an answer before recording an attempt.');
  const at = input.now ?? Date.now();
  if (!validTime(at)) throw new Error('Invalid attempt date.');
  const points = cleanPoints(input.points, question.marks);
  const a = { qid: question.id, at, answer: input.answer, unit: typeof input.unit === 'string' ? input.unit : '',
    numericAnswer: typeof input.numericAnswer === 'string' ? input.numericAnswer : '', points, score: points.length, max: question.marks,
    helped: input.assisted === true,
    assisted: input.assisted === true || state.attempts.some(old => old.qid === question.id) || state.drafts[question.id]?.solutionSeen === true,
    mistakes: (Array.isArray(input.mistakes) ? input.mistakes : []).filter(x => ERRORS.has(x)), source: input.source === 'paper' ? 'paper' : 'practice' };
  return { ...state, attempts: [...state.attempts, a] };
}

export function objectiveProgress(catalog, state, objectiveId, now = Date.now()) {
  const questions = catalog.questions.filter(q => q.objectives.includes(objectiveId));
  const byId = new Map(questions.map(q => [q.id, q]));
  const attempts = state.attempts.filter(a => byId.has(a.qid)).sort((a, b) => a.at - b.at);
  let due = null, steps = 0, lastDay = null, lastId = null, recent = [];
  const successes = [], seen = new Set();
  for (const a of attempts) {
    const q = byId.get(a.qid);
    // Known questions cannot add fresh evidence; successful retrieval when due still schedules the next review.
    const repeat = seen.has(a.qid); seen.add(a.qid);
    if (repeat && a.score === q.marks && a.assisted && !a.helped) {
      if (due !== null && dayKey(a.at) >= dayKey(due) && dayKey(a.at) !== lastDay) {
        steps = Math.min(steps + 1, INTERVALS.length);
        due = plusDays(a.at, INTERVALS[steps - 1]); lastDay = dayKey(a.at);
      }
      continue;
    }
    const full = a.score === q.marks && !a.assisted && INDEPENDENT.has(q.stage);
    if (!full) { due = plusDays(a.at, 1); steps = 0; recent = []; continue; }
    successes.push(a); recent.push(a);
    const day = dayKey(a.at);
    if (due === null || (day >= dayKey(due) && day !== lastDay && a.qid !== lastId)) {
      steps = Math.min(steps + 1, INTERVALS.length);
      due = plusDays(a.at, INTERVALS[steps - 1]); lastDay = day; lastId = a.qid;
    }
  }
  const distinctQuestions = new Set(recent.map(a => a.qid)).size;
  const distinctDays = new Set(recent.map(a => dayKey(a.at))).size;
  const transferred = recent.some(a => CHANGED.has(byId.get(a.qid).stage));
  let status = 'new', label = 'Not yet practised', reason = 'Start with a short independent question.';
  if (attempts.length) { status = 'practise'; label = 'Practise again'; reason = 'Return to the explanation, then try a different question.'; }
  if (recent.length) { status = 'independent'; label = 'Answered independently'; reason = 'Return after a delay and use a different setting.'; }
  if (distinctDays > 1 && distinctQuestions > 1) { status = 'revisited'; label = 'Revisited after a delay'; }
  if (distinctDays > 1 && distinctQuestions > 1 && transferred) {
    status = 'secure'; label = 'Secure in self-marked practice'; reason = 'Keep this idea fresh with occasional reviews.';
  }
  const attempted = new Set([...attempts.map(a => a.qid), ...questions.filter(q => state.drafts[q.id]?.revealed || state.drafts[q.id]?.solutionSeen).map(q => q.id)]);
  const independent = questions.filter(q => INDEPENDENT.has(q.stage) && q.stage !== 'paper');
  const next = independent.find(q => !attempted.has(q.id)) || independent[0] || questions.find(q => q.stage !== 'paper');
  if (next && attempted.has(next.id)) reason += ' You have seen these solutions; a repeat is useful revision, not new independent evidence.';
  return { label, status, due, attempts: attempts.length, successes: successes.length, nextQuestion: next?.id || null, reason };
}

export function revisionQueue(catalog, state, now = Date.now()) {
  const seen = new Set();
  return catalog.objectives.filter(o => state.scope[o.id] !== false).map(objective => {
    const progress = objectiveProgress(catalog, state, objective.id, now);
    return { objective, progress, question: catalog.questions.find(q => q.id === progress.nextQuestion), reason: progress.reason };
  }).filter(x => x.question && (x.progress.due === null || dayKey(x.progress.due) <= dayKey(now)))
    .sort((a, b) => (a.progress.due ?? Infinity) - (b.progress.due ?? Infinity))
    .filter(item => { if (seen.has(item.question.id)) return false; seen.add(item.question.id); return true; });
}

export function paperRemaining(paper, now = Date.now()) {
  if (!paper || paper.untimed === true || paper.deadline === null) return null;
  if (!validTime(paper.deadline)) return 0;
  return Math.max(0, Math.ceil((paper.deadline - now) / 1000));
}

export function exportMarkdown(catalog, state, now = Date.now()) {
  const lines = [`# ${catalog.title}: exam practice`, '', `Exported ${new Date(now).toLocaleDateString('en-GB')}.`, '',
    'Marks below are self-assessed against the book’s suggested marking guidance; they are not official examination scores.', '', '## Objectives', ''];
  for (const o of catalog.objectives) {
    const p = objectiveProgress(catalog, state, o.id, now);
    lines.push(`- ${o.label}: ${p.label}${state.scope[o.id] === false ? ' (not selected for review)' : ''}${p.due ? `; review ${new Date(p.due).toLocaleDateString('en-GB')}` : ''}`);
  }
  lines.push('', '## Attempts', '');
  if (!state.attempts.length) lines.push('No marked attempts yet.');
  for (const a of state.attempts) {
    const q = catalog.questions.find(q => q.id === a.qid);
    lines.push(`### ${q?.title || a.qid}`, '', `${new Date(a.at).toLocaleString('en-GB')} · ${a.score}/${a.max} · ${a.assisted ? 'with help or a previously seen solution' : 'independent before seeing the solution'} · self-marked`, '', a.answer, '');
    if (a.numericAnswer) lines.push(`Final value: ${a.numericAnswer} ${a.unit}`, '');
    if (a.mistakes.length) lines.push(`Practise: ${a.mistakes.join(', ')}`, '');
    lines.push(`Teaching: ${q?.teach || '#ch1'}`, '');
  }
  return lines.join('\n');
}
