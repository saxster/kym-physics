// Shared lesson framing, prediction journal and computed diagram for the new experiments.
// Domain widgets own their physics and scene; this helper owns no subject-specific model.
import { makeStage, webglOK } from './three_kit.js';
import { diagramAnnotations } from './annotations.js';

const element = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

export function makeLab(stage, api, { id, title, question, explanation, limits, three = true, diagramHeight = 240 }) {
  stage.dataset.lesson = id;
  stage.classList.add('lab-stage');
  const heading = element('h3', 'lab-title', title);
  const prompt = element('p', 'lab-question', question || 'What will change when you change one control? Why?');
  prompt.id = `lab-${id}-question`;
  stage.append(heading, prompt);
  const journal = window.App?.store;
  const key = `lab:${id}`;
  let saved = journal?.get(key, {}) || {};
  const predict = element('details', 'lab-prediction');
  predict.append(element('summary', '', 'Write a prediction'));
  const prediction = element('textarea', 'lab-answer');
  prediction.rows = 2;
  prediction.setAttribute('aria-label', 'My prediction');
  prediction.setAttribute('aria-describedby', prompt.id);
  prediction.value = saved.prediction || '';
  predict.open = false;
  predict.append(prediction);
  stage.append(predict);

  let kit = null;
  if (three && webglOK()) {
    try {
      kit = makeStage(stage, api, { height: 280, distance: 8.8, label: title });
      kit.spinSpeed = 0;
    } catch (_) {
      stage.querySelector('.live-3d')?.remove();
    }
  }
  if (three && !kit) stage.append(element('p', 'live-note', 'The calculated diagram below shows this experiment without 3D.'));
  const canvas = api.canvas(640, diagramHeight, `${title}: calculated diagram and measurements`);
  const annotations = diagramAnnotations(canvas, api);
  canvas.ctx = annotations.ctx;
  const diagramScroll = element('div', 'lab-diagram-scroll');
  diagramScroll.tabIndex = 0; diagramScroll.setAttribute('role', 'region');
  diagramScroll.setAttribute('aria-label', 'Calculated diagram. Use Full-size drawing to inspect small labels.');
  annotations.surface.replaceWith(diagramScroll); diagramScroll.append(annotations.surface);
  const controls = element('div', 'lab-control-slot');
  (kit?.wrap || diagramScroll).after(controls);
  api.placeControls?.(controls);
  const say = api.readout();
  const observations = element('div', 'lab-observations');
  observations.append(element('p', 'lab-observations-title', 'What the model shows'));
  if (say.element) observations.append(say.element);
  controls.after(observations);
  if (kit) {
    const hint = element('p', 'lab-diagram-hint', 'Linked drawing · use Full-size drawing for a closer view.');
    diagramScroll.before(hint);
  }
  const account = element('details', 'lab-explanation');
  account.append(element('summary', '', 'Explain what happened'));
  const explanationCopy = element('p', '', explanation || 'Compare the scene, measurements and your prediction. Describe the cause of the change.');
  account.append(explanationCopy);
  const answer = element('textarea', 'lab-answer');
  answer.rows = 3;
  answer.setAttribute('aria-label', 'My explanation');
  answer.id = `lab-${id}-explanation`;
  const answerLabel = element('label', 'lab-explain-label', 'Explain it in your own words');
  answerLabel.htmlFor = answer.id;
  answer.value = saved.explanation || '';
  account.append(answerLabel, answer);
  const status = element('p', 'lab-save-status');
  status.setAttribute('role', 'status');
  account.append(status);
  stage.append(account);
  const notes = element('details', 'lab-limits'), limitsCopy = element('p', '', limits);
  notes.append(element('summary', '', 'What this model simplifies'), limitsCopy);
  notes.hidden = !limits;
  stage.append(notes);
  const persist = () => {
    saved = { id, title, prediction: prediction.value, explanation: answer.value, t: Date.now() };
    journal?.set(key, saved);
    status.textContent = journal?.available ? 'Saved in your notebook on this device.' : 'Saved for this visit. Export your notebook to keep a copy.';
    window.App?.emit('lab:journal', saved);
  };
  prediction.addEventListener('input', persist);
  answer.addEventListener('input', persist);
  let diagram = null;
  const drawFrame = () => {
    if (diagram) {
      annotations.begin();
      canvas.clear(api.colors().plate);
      diagram(canvas.ctx, canvas.W, canvas.H);
      annotations.finish();
    }
    if (kit) { kit.dirty = true; kit.render(); }
  };
  let fitted = false;
  const refresh = () => {
    drawFrame();
    if (!fitted && kit?.root.children.length) { if (!kit.fitRadius) kit.fitContents(); kit.render(); fitted = true; }
  };
  api.loop(() => drawFrame());
  const refitPreset = event => {
    if (event.target.closest('.live-tabs') && kit && !kit.fitRadius) { kit.fitContents(); kit.render(); }
  };
  stage.addEventListener('click', refitPreset);
  api.onCleanup(() => stage.removeEventListener('click', refitPreset));
  return { kit, canvas, say, redraw(fn) { diagram = fn; refresh(); }, refresh,
    teach(copy) {
      if (copy.title !== undefined) {
        heading.textContent = copy.title;
        stage.closest('figure')?.setAttribute('aria-label', copy.title);
        kit?.wrap.setAttribute('aria-label', copy.title);
      }
      if (copy.question !== undefined) prompt.textContent = copy.question;
      if (copy.explanation !== undefined) explanationCopy.textContent = copy.explanation;
      if (copy.limits !== undefined) { limitsCopy.textContent = copy.limits; notes.hidden = !copy.limits; }
    },
    frame(radius) { if (kit) { kit.fit(radius); kit.render(); fitted = true; } },
    fit() { if (!kit?.fitRadius) kit?.fitContents(); kit?.render(); } };
}
