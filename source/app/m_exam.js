// Motion practice sits beside the story. Attempts and due dates stay in this browser.
import App from './core.js';
import { normaliseState, recordAttempt, objectiveProgress, revisionQueue, numericFeedback, paperRemaining, exportMarkdown } from './exam_model.mjs';

const { el, store } = App;
const KEY = 'exam:' + (App.data.exam?.key || 'motion');
const STAGES = [['all', 'All practice questions'], ['recall', 'Recall'], ['worked', 'Worked examples'], ['guided', 'With a little help'], ['independent', 'On your own'], ['transfer', 'A new setting'], ['review', 'Come back to it']];
const ERRORS = [['concept', 'The physics idea'], ['method', 'The calculation or method'], ['units', 'Units or conversion'], ['graph', 'Reading or drawing a graph'], ['wording', 'Explaining precisely']];
const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15l2 2 5-4"/></svg>';
const date = t => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const button = (text, fn, cls = '') => el('button', { type: 'button', class: `lj-btn ${cls}`, onclick: fn }, text);
const download = (name, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = el('a', { href: url, download: name }); document.body.append(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
};

App.ready(() => {
  const root = document.getElementById('exam-prep'), catalog = App.data.exam;
  if (!root || !catalog?.questions?.length) return;
  let state = normaliseState(store.get(KEY), catalog), timer = null;
  // Recheck at commitment as another bank may have been opened in a different tab.
  function refreshExposure() {
  for (const key of store.keys().filter(k => /^exam:(motion|mixed|chapter-(?:0[0-9]|1[0-5]))$/.test(k) && k !== KEY)) {
    const raw = store.get(key, {});
    const other = raw && typeof raw === 'object' ? raw : {};
    for (const q of catalog.questions) {
      const d = state.drafts[q.id] || (state.drafts[q.id] = {});
      if (!d.committedAt && ((Array.isArray(other.attempts) && other.attempts.some(a => a?.qid === q.id)) || other.drafts?.[q.id]?.revealed || other.drafts?.[q.id]?.solutionSeen)) d.solutionSeen = true;
    }
  }
  }
  refreshExposure();
  const views = new Map(), papers = new Map();
  const questionById = new Map(catalog.questions.map(q => [q.id, q]));
  const status = root.querySelector('#exam-motion-status');
  const daily = root.querySelector('#exam-motion-daily');
  const storageNote = el('p', { class: 'exam-storage-note', role: 'status', hidden: true });
  status?.after(storageNote);
  root.classList.add('exam-enhanced');

  function persist() {
    store.set(KEY, state);
    storageNote.hidden = store.available;
    storageNote.textContent = 'This browser cannot save to device storage. Your work is available on this page; export it before leaving or closing this page.';
  }
  function activePaper() { return state.paper && !state.paper.finishedAt ? state.paper : null; }
  function draft(qid) { return state.drafts[qid] || (state.drafts[qid] = {}); }
  function say(message) { if (status) status.textContent = message; }

  function refreshProgress() {
    const selected = catalog.objectives.filter(o => state.scope[o.id] !== false);
    for (const obj of catalog.objectives) {
      const row = [...root.querySelectorAll('[data-objective]')].find(n => n.dataset.objective === obj.id);
      const node = row?.querySelector('.exam-objective-status');
      const p = objectiveProgress(catalog, state, obj.id);
      if (node) node.textContent = `${p.label}${p.due ? ` · next review ${date(p.due)}` : ''}`;
    }
    if (!daily) return;
    const queue = revisionQueue(catalog, state).slice(0, 4);
    const list = el('ol', { class: 'exam-daily-list' });
    for (const item of queue) {
      if (!item.question) continue;
      list.append(el('li', {}, el('a', { href: `#exam-q-${item.question.id}` }, item.question.title),
        el('span', { class: 'exam-daily-reason' }, item.reason || item.progress?.reason || item.objective.label)));
    }
    const completed = selected.filter(o => ['secure', 'revisited'].includes(objectiveProgress(catalog, state, o.id).status)).length;
    const heading = daily.querySelector(':scope > h3') || el('h3', {}, 'Practice today');
    daily.replaceChildren(heading, el('p', { class: 'exam-routine' }, 'Recall an old idea, work through one example, then answer a fresh question. Compare your reasoning and correct one mistake. Return after a delay.'), el('p', {}, selected.length ? `${completed} of ${selected.length} selected objectives revisited successfully after a delay. These are self-marked practice records, not a predicted exam grade.` : 'Choose at least one objective above to make a practice plan.'),
      queue.length ? list : el('p', {}, selected.length ? 'Nothing is due today. You can practise early below, or return on the next review date shown above.' : 'Your earlier answers are still saved.'));
    if (status && !status.textContent) say('Start with one worked example or one short question. Your saved answers will help choose what comes next.');
  }

  function refresh() {
    refreshProgress();
    papers.forEach(p => p.paint());
    if (activePaper() && !timer) timer = setInterval(tick, 1000);
    if (!activePaper() && timer) { clearInterval(timer); timer = null; }
  }
  function finishPaper(why = '') {
    if (!activePaper()) return;
    const paper = state.paper;
    refreshExposure();
    paper.finishedAt = paper.deadline && paper.deadline <= Date.now() ? paper.deadline : Date.now();
    const spec = catalog.papers.find(p => p.id === paper.id);
    for (const id of spec?.questions || []) {
      const d = draft(id); d.revealed = true; d.committedAt = paper.finishedAt;
      d.committedAnswer = (d.answer || '').trim() || (d.numericAnswer || '').trim();
      d.committedUnit = d.unit || '';
    }
    persist();
    for (const q of catalog.questions.filter(q => q.stage === 'paper')) views.get(q.id)?.paint();
    say(why || 'Your paper is finished. Compare your first answers with the marking guidance, then save the marks for each question.');
    refresh();
  }
  function tick() {
    const p = activePaper();
    if (p && !p.untimed && paperRemaining(p) <= 0) finishPaper('Time is up. Your answers are saved. Mark the work you completed using the guidance below.');
    else papers.forEach(paper => paper.paintTimer());
  }

  // These selections personalise practice; they do not certify a school syllabus.
  for (const obj of catalog.objectives) {
    const row = [...root.querySelectorAll('[data-objective]')].find(n => n.dataset.objective === obj.id);
    if (!row) continue;
    const input = el('input', { type: 'checkbox', id: `exam-scope-${obj.id}` });
    input.checked = state.scope[obj.id] !== false;
    input.addEventListener('change', () => { state.scope[obj.id] = input.checked; persist(); refreshProgress(); });
    row.prepend(el('label', { class: 'exam-scope', for: input.id }, input, el('span', {}, 'Include in my practice')));
  }

  const filters = root.querySelector('#exam-motion-filters');
  const stageSelect = el('select', { id: 'exam-stage', 'aria-label': 'Question stage' }, STAGES.map(([value, title]) => el('option', { value }, title)));
  const objectiveSelect = el('select', { id: 'exam-objective', 'aria-label': catalog.chapter === 1 ? 'Motion objective' : 'Chapter objective' }, el('option', { value: 'all' }, 'All chapter objectives'), catalog.objectives.map(o => el('option', { value: o.id }, o.label)));
  const count = el('p', { class: 'exam-filter-count', role: 'status' });
  const resetFilters = button('Show every practice question', () => { stageSelect.value = 'all'; objectiveSelect.value = 'all'; filterQuestions(); });
  function filterQuestions() {
    let visible = 0;
    for (const q of catalog.questions.filter(q => q.stage !== 'paper')) {
      const node = document.getElementById(`exam-q-${q.id}`);
      if (!node) continue;
      const show = (stageSelect.value === 'all' || q.stage === stageSelect.value) && (objectiveSelect.value === 'all' || q.objectives.includes(objectiveSelect.value));
      node.hidden = !show; if (show) visible++;
    }
    count.textContent = visible ? `${visible} practice question${visible === 1 ? '' : 's'} shown.` : 'No questions match both selections. Show every practice question to begin again.';
    resetFilters.hidden = stageSelect.value === 'all' && objectiveSelect.value === 'all';
  }
  if (filters) filters.append(el('div', { class: 'exam-filter-row' },
    el('label', {}, 'Question stage', stageSelect), el('label', {}, 'Chapter objective', objectiveSelect)), count, resetFilters);
  stageSelect.addEventListener('change', filterQuestions); objectiveSelect.addEventListener('change', filterQuestions);

  function revealLinkedQuestion(hash = location.hash) {
    let target; try { target = document.getElementById(decodeURIComponent(hash.replace(/^#/, ''))); } catch { return; }
    if (target?.matches('.exam-paper')) { target.open = true; return; }
    const question = target?.closest('.exam-question');
    if (!question) return;
    const q = questionById.get(question.dataset.qid);
    if (q?.stage !== 'paper' && question.hidden) { stageSelect.value = 'all'; objectiveSelect.value = 'all'; filterQuestions(); }
    question.closest('.exam-paper')?.setAttribute('open', '');
  }
  root.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a) revealLinkedQuestion(a.getAttribute('href')); }, true);
  addEventListener('hashchange', () => revealLinkedQuestion());
  App.on('search:target', target => revealLinkedQuestion('#' + target.id));

  function mountQuestion(q) {
    const node = document.getElementById(`exam-q-${q.id}`);
    const ui = node?.querySelector('.exam-response-ui'), solution = node?.querySelector('.exam-solution');
    if (!ui || !solution) return;
    const summary = solution.querySelector(':scope > summary');
    const marking = el('div', { class: 'exam-marking-ui' });
    solution.append(marking);
    const localStatus = el('p', { class: 'exam-question-status', role: 'status' });
    const isPaper = q.stage === 'paper';
    const paperSpec = isPaper ? catalog.papers.find(p => p.questions.includes(q.id)) : null;
    const originalSummary = summary?.textContent || 'Model answer and marking guidance';
    function paint() {
      const d = draft(q.id), paper = activePaper();
      const paperIsCurrent = paper?.id === paperSpec?.id;
      const locked = isPaper && !!paper;
      ui.replaceChildren(); marking.replaceChildren();
      if (q.stage === 'worked') { solution.hidden = false; return; }
      const revealed = !!d.revealed && !locked;
      solution.hidden = !revealed; solution.open = revealed;
      if (summary) summary.textContent = originalSummary;
      const answer = el('textarea', { id: `exam-answer-${q.id}`, rows: 3, class: 'lj-ta', placeholder: q.kind === 'graph' ? 'Draw on paper; describe your diagram or graph here.' : 'Write your answer and any working before looking.' });
      answer.value = d.answer || ''; answer.readOnly = revealed; answer.disabled = isPaper && !paperIsCurrent && !revealed;
      const label = el('label', { class: 'lj-lab', for: answer.id }, 'Your first answer');
      const numeric = q.numeric ? el('input', { type: 'text', inputmode: 'decimal', id: `exam-number-${q.id}`, class: 'exam-number', placeholder: 'Final number', autocomplete: 'off' }) : null;
      const unit = q.numeric ? el('input', { type: 'text', id: `exam-unit-${q.id}`, class: 'exam-unit', placeholder: q.numeric.unit, autocomplete: 'off' }) : null;
      if (numeric) { numeric.value = d.numericAnswer || ''; numeric.readOnly = revealed; unit.value = d.unit || ''; unit.readOnly = revealed; numeric.disabled = unit.disabled = answer.disabled; }
      const saveDraft = () => {
        d.answer = answer.value;
        if (numeric) { d.numericAnswer = numeric.value; d.unit = unit.value; }
        persist();
      };
      answer.addEventListener('input', saveDraft); numeric?.addEventListener('input', saveDraft); unit?.addEventListener('input', saveDraft);
      const help = el('input', { type: 'checkbox', id: `exam-help-${q.id}` });
      help.checked = !!(d.assisted || d.hintsUsed || q.stage === 'guided');
      help.disabled = revealed || answer.disabled || !!d.hintsUsed || q.stage === 'guided';
      help.addEventListener('change', () => { d.assisted = help.checked; persist(); });
      ui.append(label, answer);
      if (numeric) ui.append(el('div', { class: 'exam-numeric-row' }, el('label', { for: numeric.id }, 'Final number', numeric), el('label', { for: unit.id }, 'Unit in your answer', unit)));
      ui.append(el('label', { class: 'exam-help', for: help.id }, help, 'I used a hint, the book, or someone’s help'));
      if (d.solutionSeen) ui.append(el('p', { class: 'exam-small' }, 'You have seen this solution before. This attempt is useful practice; choose a fresh question to check independent understanding.'));
      localStatus.textContent = '';
      ui.append(localStatus);
      const actions = el('div', { class: 'lj-row exam-actions' });
      if (!revealed && !isPaper && q.hints?.length) {
        const hints = Math.max(0, Math.min(q.hints.length, Number(d.hintsUsed) || 0));
        for (let i = 0; i < hints; i++) ui.append(el('p', { class: 'exam-hint', role: 'status' }, q.hints[i]));
        if (hints < q.hints.length) actions.append(button(hints ? 'Another hint' : 'Give me a hint', () => {
          saveDraft(); d.hintsUsed = hints + 1; d.assisted = true; persist(); paint();
          document.getElementById(`exam-answer-${q.id}`)?.focus({ preventScroll: true });
        }));
      }
      if (!revealed && !isPaper) actions.append(button('Show model answer', () => {
        saveDraft();
        refreshExposure();
        const firstAnswer = answer.value.trim() || numeric?.value.trim();
        if (!firstAnswer) { localStatus.textContent = 'Try an answer first. A sketch on paper counts: describe what you drew.'; answer.focus(); return; }
        d.committedAnswer = answer.value.trim() || `${numeric.value.trim()} ${unit.value.trim()}`.trim();
        d.committedUnit = unit?.value || '';
        d.assisted = help.checked; d.revealed = true; d.committedAt = Date.now(); persist(); paint();
        solution.querySelector('input, summary')?.focus({ preventScroll: true });
      }, 'primary'));
      if (isPaper && !revealed) ui.append(el('p', { class: 'exam-small' }, paperIsCurrent ? 'Keep working. The answers open when you finish the paper.' : 'Start this paper above, with or without a timer. Then finish it to see the answers.'));
      if (revealed && !isPaper && d.saved) actions.append(button('Try this question again', () => {
        state.drafts[q.id] = { answer: '', unit: '', solutionSeen: true, assisted: false };
        persist(); paint(); document.getElementById(`exam-answer-${q.id}`)?.focus();
      }));
      ui.append(actions);
      if (!revealed) return;
      const committed = d.committedAnswer || d.answer || d.numericAnswer || '';
      if (!committed.trim()) { marking.append(el('p', {}, 'You did not answer this question. Use the explanation to learn it, then try a fresh practice question.')); return; }
      if (q.numeric) {
        const feedback = numericFeedback(d.numericAnswer || d.committedAnswer || d.answer, d.committedUnit || d.unit || '', q.numeric);
        marking.append(el('p', { class: 'exam-number-feedback' }, `${feedback.message} Award method marks only when your written working earns them.`));
      }
      const points = el('fieldset', { class: 'exam-rubric' }, el('legend', {}, 'Tick each point present in your first answer — one mark each'));
      const selected = new Set(Array.isArray(d.selectedPoints) ? d.selectedPoints : []);
      const checks = q.points.map((point, i) => {
        const input = el('input', { type: 'checkbox', id: `exam-mark-${q.id}-${i}`, value: i });
        input.checked = selected.has(i); input.disabled = !!d.saved;
        points.append(el('label', { for: input.id }, input, el('span', {}, point)));
        input.addEventListener('change', () => { d.selectedPoints = checks.flatMap((c, idx) => c.checked ? [idx] : []); persist(); score.textContent = `${d.selectedPoints.length} / ${q.marks} marks selected`; });
        return input;
      });
      const score = el('p', { class: 'exam-score' }, `${selected.size} / ${q.marks} marks selected`);
      marking.append(points, score);
      const mistakes = el('fieldset', { class: 'exam-errors' }, el('legend', {}, 'What needs another look? (optional)'));
      const errorChecks = ERRORS.map(([id, text]) => {
        const input = el('input', { type: 'checkbox', id: `exam-error-${q.id}-${id}` });
        input.checked = (d.mistakes || []).includes(id); input.disabled = !!d.saved;
        input.addEventListener('change', () => { d.mistakes = ERRORS.flatMap(([key], idx) => errorChecks[idx].checked ? [key] : []); persist(); });
        mistakes.append(el('label', { for: input.id }, input, text)); return input;
      });
      marking.append(mistakes);
      if (d.saved) marking.append(el('p', { class: 'exam-saved', role: 'status' }, `Saved: ${selected.size} / ${q.marks} marks, self-marked${d.assisted || d.hintsUsed || q.stage === 'guided' ? ' with help' : ' without help'}${d.solutionSeen ? ' · memory review' : ''}.`));
      else marking.append(button('Save marked attempt', () => {
        const marked = checks.flatMap((c, i) => c.checked ? [i] : []);
        d.selectedPoints = marked;
        state = recordAttempt(state, q, { answer: committed, unit: d.committedUnit || d.unit || '', numericAnswer: d.numericAnswer || '', points: marked, now: d.committedAt || Date.now(), assisted: !!(d.assisted || d.hintsUsed || q.stage === 'guided' || !d.committedAt), mistakes: d.mistakes || [], source: isPaper ? 'paper' : 'practice' });
        state.drafts[q.id] = { ...d, saved: true }; persist(); paint(); refresh();
        const saved = node.querySelector('.exam-saved');
        if (saved) { saved.tabIndex = -1; saved.focus({ preventScroll: true }); }
      }, 'primary'));
      marking.append(el('p', { class: 'exam-small' }, 'Use equivalent correct wording. If you are unsure whether a point earns credit, ask your teacher before counting it.'));
    }
    views.set(q.id, { paint }); paint();
  }
  catalog.questions.forEach(mountQuestion);
  function noteExposure(ids) {
    for (const id of ids) { const d = draft(id); if (!d.committedAt) { d.solutionSeen = true; views.get(id)?.paint(); } }
    persist();
  }
  for (const details of root.querySelectorAll('[data-example-questions]')) {
    details.addEventListener('toggle', () => {
      if (details.open && !document.documentElement.dataset.examPrint) noteExposure(details.dataset.exampleQuestions.split(' ').filter(Boolean));
    });
  }
  addEventListener('beforeprint', () => {
    const kind = document.documentElement.dataset.examPrint;
    if (!kind) noteExposure(catalog.questions.filter(q => q.stage !== 'worked').map(q => q.id));
    else if (kind === 'revision') noteExposure([...root.querySelectorAll('[data-example-questions]')].flatMap(d => d.dataset.exampleQuestions.split(' ').filter(Boolean)));
  });


  for (const spec of catalog.papers || []) {
    const details = [...root.querySelectorAll('.exam-paper')].find(n => n.dataset.paperid === spec.id);
    const ui = details?.querySelector('.exam-paper-ui');
    if (!ui) continue;
    const timerText = el('p', { class: 'exam-timer', 'aria-live': 'off' });
    function paintTimer() {
      const current = activePaper();
      if (current?.id !== spec.id) { timerText.textContent = ''; return; }
      if (current.untimed) timerText.textContent = 'Untimed practice · finish when you are ready to mark.';
      else {
        const seconds = paperRemaining(current);
        timerText.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} remaining · your timer continues if you leave this page`;
      }
    }
    function start(untimed) {
      if (activePaper()) { say('Finish your current paper before starting another. Your answers and timer are saved.'); return; }
      const unmarked = spec.questions.find(id => { const d = draft(id); return d.revealed && !d.saved && (d.committedAnswer || d.answer || d.numericAnswer || '').trim(); });
      if (unmarked) {
        details.open = true;
        say('Mark your previous answers in this paper before starting it again. Blank questions do not need marking. Your work is still saved.');
        views.get(unmarked)?.paint();
        document.getElementById(`exam-q-${unmarked}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
        return;
      }
      const now = Date.now();
      state.paper = { id: spec.id, startedAt: now, deadline: untimed ? null : now + spec.minutes * 60_000, finishedAt: null, untimed };
      for (const id of spec.questions) {
        const prior = draft(id);
        state.drafts[id] = { answer: '', unit: '', solutionSeen: !!(prior.revealed || prior.solutionSeen), assisted: false };
      }
      details.open = true; persist(); catalog.questions.filter(q => q.stage === 'paper').forEach(q => views.get(q.id)?.paint());
      say(untimed ? 'Your untimed paper has begun. Finish it when you are ready to mark.' : `Your ${spec.minutes}-minute paper has begun. The timer continues across reloads.`);
      refresh(); document.getElementById(`exam-answer-${spec.questions[0]}`)?.focus({ preventScroll: true });
    }
    function paint() {
      const current = activePaper(), isCurrent = current?.id === spec.id;
      ui.replaceChildren();
      if (isCurrent) { details.open = true; ui.append(timerText, button('Finish paper and mark', () => finishPaper(), 'primary')); }
      else {
        const last = state.paper?.id === spec.id && state.paper.finishedAt;
        const marked = spec.questions.filter(id => draft(id).saved);
        if (last) ui.append(el('p', {}, `Paper finished · ${marked.length} of ${spec.questions.length} questions marked. ${marked.reduce((sum, id) => sum + (draft(id).selectedPoints?.length || 0), 0)} marks recorded so far.`));
        const timed = button(last ? 'Start this paper again' : `Start ${spec.minutes}-minute paper`, () => start(false), 'primary');
        const untimed = button('Use without a timer', () => start(true));
        timed.disabled = untimed.disabled = !!current;
        ui.append(el('div', { class: 'lj-row' }, timed, untimed));
        if (current) ui.append(el('p', { class: 'exam-small' }, 'Another paper is in progress. Finish it before beginning this one.'));
      }
      paintTimer();
    }
    papers.set(spec.id, { paint, paintTimer }); paint();
  }

  const tools = root.querySelector('#exam-motion-tools');
  if (tools) {
    const options = el('select', { id: 'exam-print-choice', 'aria-label': 'What to print' });
    for (const p of catalog.papers || []) {
      options.append(el('option', { value: `questions:${p.id}` }, `${p.title} · questions only`), el('option', { value: `answers:${p.id}` }, `${p.title} · answers and marking`));
    }
    options.append(el('option', { value: 'revision:' }, `${catalog.title} revision sheet`));
    tools.append(el('label', { for: options.id }, 'What to print', options),
      el('div', { class: 'lj-row' }, button('Print selected sheet', () => {
        const [kind, paper] = options.value.split(':');
        if (kind === 'answers' && activePaper()) { say('Finish your current paper before printing answers. Your timer and work are still saved.'); return; }
        if (kind === 'answers') {
          const spec = catalog.papers.find(p => p.id === paper);
          for (const id of spec?.questions || []) { const d = draft(id); if (!d.revealed) d.solutionSeen = true; }
          persist(); spec?.questions.forEach(id => views.get(id)?.paint());
        }
        document.documentElement.dataset.examPrint = kind;
        document.documentElement.dataset.examPaper = paper || '';
        for (const p of root.querySelectorAll('.exam-paper')) p.dataset.examPrintSelected = String(p.dataset.paperid === paper);
        window.print();
      }), button('Export exam progress', () => download(`the-moving-world-${catalog.key || 'motion'}-progress.md`, exportMarkdown(catalog, state)))),
      el('p', { class: 'exam-small' }, 'Your notebook’s “Save a backup” includes exam answers, marks and review dates. Restore that backup to continue on another device.'));
  }
  addEventListener('afterprint', () => { delete document.documentElement.dataset.examPrint; delete document.documentElement.dataset.examPaper; root.querySelectorAll('[data-exam-print-selected]').forEach(n => delete n.dataset.examPrintSelected); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); refreshProgress(); } });
  App.on('page:change', () => { tick(); refreshProgress(); });
  App.tool({ id: 'exam', label: 'Exam practice', icon: ICON, order: 45, title: 'Prepare for my exam', onClick: () => {
    const current = App.pages?.current();
    const chapter = current?.kind === 'chapter' ? Number(current.n) : null;
    if (chapter !== null && chapter !== 1 && App.data.examChapters?.includes(chapter)) {
      location.href = `exams/ch${String(chapter).padStart(2, '0')}.html#exam-prep`; return;
    }
    const target = App.data.chapters?.length && (App.data.examChapters?.length || 0) > 1 && chapter !== 1 ? 'exam-directory' : 'exam-prep';
    location.hash = target; document.getElementById(target)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  } });
  say(state.attempts.length ? 'Your marked attempts are saved here. Choose a question or a review for today.' : 'Begin with a worked example, then try a question on your own.');
  filterQuestions(); revealLinkedQuestion(); persist(); tick(); refresh();
});
