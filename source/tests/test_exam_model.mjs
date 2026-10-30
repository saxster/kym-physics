import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseState, recordAttempt, objectiveProgress, revisionQueue, numericFeedback, paperRemaining, exportMarkdown } from '../app/exam_model.mjs';

const day = (n) => new Date(2026, 9, n, 12).getTime();
const q = (id, stage = 'independent') => ({ id, title: id, stage, objectives: ['speed'], marks: 2, points: ['method', 'answer'], model: ['Worked answer'], teach: '#s1-2' });
const catalog = { title: 'Motion', objectives: [{ id: 'speed', label: 'Calculate speed', teach: '#s1-2' }], questions: [q('first'), q('changed', 'transfer'), q('later', 'review'), q('guided', 'guided')], papers: [{ id: 'paper-a', minutes: 15, questions: ['first'] }] };
const start = () => normaliseState(null, catalog);
const attempt = (state, id, n, extra = {}) => recordAttempt(state, catalog.questions.find(q => q.id === id), { answer: '24 ÷ 6 = 4 m/s', points: [0, 1], now: day(n), ...extra });

test('numeric feedback checks value and requested units without accepting empty or non-finite answers', () => {
  const spec = { value: 5, unit: 'm/s', tolerance: .01 };
  assert.equal(numericFeedback('5.00', 'm/s', spec).correct, true);
  assert.equal(numericFeedback('5e0', 'm / s', spec).correct, true);
  assert.equal(numericFeedback('5', 'm s⁻¹', spec).correct, true);
  assert.equal(numericFeedback('18', 'km/h', spec).correct, false);
  assert.match(numericFeedback('5', 'km/h', spec).message, /unit/i);
  for (const raw of ['', ' ', 'Infinity', '0x5', '5junk']) assert.equal(numericFeedback(raw, 'm/s', spec).correct, false);
  assert.equal(numericFeedback('−2', 'm/s²', { value: -2, unit: 'm/s²', tolerance: 0 }).correct, true);
});

test('helped and guided answers never establish independent success, including full marks', () => {
  let state = attempt(start(), 'first', 30, { assisted: true });
  state = attempt(state, 'guided', 31);
  const p = objectiveProgress(catalog, state, 'speed', day(31));
  assert.equal(p.successes, 0);
  assert.notEqual(p.status, 'secure');
});

test('secure practice requires distinct questions, a delay and a changed setting', () => {
  let state = attempt(start(), 'first', 30);
  assert.equal(objectiveProgress(catalog, state, 'speed', day(30)).status, 'independent');
  state = attempt(state, 'changed', 30);
  assert.notEqual(objectiveProgress(catalog, state, 'speed', day(30)).status, 'secure');
  state = attempt(state, 'later', 31);
  assert.equal(objectiveProgress(catalog, state, 'speed', day(31)).status, 'secure');
  let same = attempt(start(), 'first', 30);
  same = attempt(same, 'first', 31);
  assert.notEqual(objectiveProgress(catalog, same, 'speed', day(31)).status, 'secure');
});

test('partial and zero marks schedule a next-day repair and retain the old attempts', () => {
  let state = attempt(start(), 'first', 30, { points: [0], mistakes: ['units'] });
  assert.equal(state.attempts[0].score, 1);
  assert.equal(objectiveProgress(catalog, state, 'speed', day(30)).due, day(31));
  state = attempt(state, 'changed', 31, { points: [] });
  assert.equal(state.attempts.length, 2);
  assert.equal(state.attempts[1].score, 0);
  assert.equal(objectiveProgress(catalog, state, 'speed', day(31)).due, day(32));
});

test('a later failure removes secure status; early repetitions cannot extend the interval', () => {
  let state = attempt(attempt(start(), 'first', 30), 'changed', 31);
  const due = objectiveProgress(catalog, state, 'speed', day(31)).due;
  state = attempt(state, 'changed', 31);
  assert.equal(objectiveProgress(catalog, state, 'speed', day(31)).due, due);
  state = attempt(state, 'later', 32, { points: [] });
  assert.equal(objectiveProgress(catalog, state, 'speed', day(32)).status, 'practise');
});

test('daily queue offers a new question, respects chosen objectives and waits until a future review is due', () => {
  assert.equal(revisionQueue(catalog, start(), day(30))[0].objective.id, 'speed');
  let state = attempt(start(), 'first', 30);
  assert.equal(revisionQueue(catalog, state, day(30)).length, 0);
  assert.equal(revisionQueue(catalog, state, day(31))[0].question.id, 'changed');
  state.scope.speed = false;
  assert.equal(revisionQueue(catalog, state, day(31)).length, 0);
});

test('due-day retrieval of a known question schedules another review without adding independent evidence', () => {
  let state = attempt(attempt(start(), 'first', 30), 'changed', 31);
  assert.equal(objectiveProgress(catalog, state, 'speed').due, day(34));
  state = attempt(state, 'first', 34);
  const p = objectiveProgress(catalog, state, 'speed', day(34));
  assert.equal(p.due, day(41));
  assert.equal(p.successes, 2);
  state = attempt(state, 'first', 41, { assisted: true });
  assert.equal(objectiveProgress(catalog, state, 'speed', day(41)).due, day(42));
});

test('revealed but unmarked questions are not selected as fresh daily practice', () => {
  const state = start(); state.drafts.first = { revealed: true };
  assert.equal(revisionQueue(catalog, state, day(30))[0].question.id, 'changed');
});

test('the daily queue lists a shared question only once', () => {
  const shared = { ...catalog, objectives: [...catalog.objectives, { id: 'units', label: 'Use compatible units' }],
    questions: catalog.questions.map(q => ({ ...q, objectives: ['speed', 'units'] })) };
  assert.equal(revisionQueue(shared, normaliseState(null, shared), day(30)).length, 1);
});

test('saved state rejects corrupted records and invalid rubric points but preserves valid drafts and untimed papers', () => {
  const state = normaliseState({ attempts: [null, { qid: 'deleted', at: day(30) }], drafts: { first: { answer: 'my working', numericAnswer: '4', revealed: true, hintsUsed: 1 } }, scope: { speed: false }, paper: { id: 'paper-a', startedAt: day(30), deadline: null, finishedAt: null, untimed: true } }, catalog);
  assert.equal(state.attempts.length, 0);
  assert.equal(state.drafts.first.numericAnswer, '4');
  assert.equal(state.paper.untimed, true);
  assert.equal(state.scope.speed, false);
  assert.throws(() => attempt(start(), 'first', 30, { answer: '  ' }), /answer/i);
  const marked = attempt(start(), 'first', 30, { points: [0, 0, -1, 99, '1'] });
  assert.equal(marked.attempts[0].score, 1);
});

test('paper time uses a persistent deadline; exporting retains answers, marks and assistance', () => {
  assert.equal(paperRemaining({ deadline: day(30) + 15000 }, day(30)), 15);
  assert.equal(paperRemaining({ deadline: day(30) + 15000 }, day(30) + 16000), 0);
  assert.equal(paperRemaining({ deadline: null, untimed: true }, day(30)), null);
  const result = exportMarkdown(catalog, attempt(start(), 'first', 30, { assisted: true }));
  assert.match(result, /24 ÷ 6/);
  assert.match(result, /2\/2/);
  assert.match(result, /help|assist/i);
});


test('new chapter units accept written names and equivalent SI exponent notation', () => {
  for (const [typed, unit] of [['ohms','Ω'],['degrees','°'],['deg/h','°/h'],['newtons','N'],['joules','J'],['amperes','A'],['watts','W'],['hertz','Hz'],['becquerels','Bq'],['N m⁻¹','N/m'],['J kg⁻¹','J/kg'],['kg m s⁻¹','kg m/s']]) {
    assert.equal(numericFeedback('12', typed, {value:12,unit,tolerance:0}).correct,true,typed);
  }
});
