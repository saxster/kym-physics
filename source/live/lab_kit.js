// Shared lesson framing, prediction journal and computed diagram for the new experiments.
// Domain widgets own their physics and scene; this helper owns no subject-specific model.
import { makeStage, webglOK } from './three_kit.js';

const element = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

export function makeLab(stage, api, { id, title, question, explanation, limits, three = true }) {
  stage.dataset.lesson = id;
  const heading = element('h3', 'lab-title', title);
  stage.append(heading);
  const journal = window.App?.store;
  const key = `lab:${id}`;
  let saved = journal?.get(key, {}) || {};
  const predict = element('details', 'lab-prediction');
  predict.append(element('summary', '', 'Predict before you try'));
  predict.append(element('p', '', question || 'What will change when you change one control? Why?'));
  const prediction = element('textarea', 'lab-answer');
  prediction.rows = 2;
  prediction.setAttribute('aria-label', 'My prediction');
  prediction.value = saved.prediction || '';
  predict.open = !saved.prediction;
  predict.append(prediction);
  stage.append(predict);

  let kit = null;
  if (three && webglOK()) {
    try {
      kit = makeStage(stage, api, { height: 320, distance: 8.8, label: title });
      kit.spinSpeed = 0;
    } catch (_) {
      stage.querySelector('.live-3d')?.remove();
    }
  }
  if (three && !kit) stage.append(element('p', 'live-note', 'The calculated diagram below shows this experiment without 3D.'));
  const canvas = api.canvas(640, 240, `${title}: calculated diagram and measurements`);
  const diagramScroll = element('div', 'lab-diagram-scroll');
  diagramScroll.tabIndex = 0; diagramScroll.setAttribute('role', 'region');
  diagramScroll.setAttribute('aria-label', 'Calculated diagram. Use Full-size drawing to inspect small labels.');
  canvas.cv.replaceWith(diagramScroll); diagramScroll.append(canvas.cv);
  stage.insertBefore(element('p', 'lab-diagram-hint', 'Use Full-size drawing to read small labels, then scroll sideways.'), diagramScroll);
  const say = api.readout();
  const account = element('details', 'lab-explanation');
  account.append(element('summary', '', 'Explain what happened'));
  account.append(element('p', '', explanation || 'Compare the scene, measurements and your prediction. Describe the cause of the change.'));
  const answer = element('textarea', 'lab-answer');
  answer.rows = 3;
  answer.setAttribute('aria-label', 'My explanation');
  answer.value = saved.explanation || '';
  account.append(answer);
  const status = element('p', 'lab-save-status');
  status.setAttribute('role', 'status');
  account.append(status);
  stage.append(account);
  if (limits) {
    const notes = element('details', 'lab-limits');
    notes.append(element('summary', '', 'What this model simplifies'), element('p', '', limits));
    stage.append(notes);
  }
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
      canvas.clear(api.colors().plate);
      diagram(canvas.ctx, canvas.W, canvas.H);
    }
    if (kit) { kit.dirty = true; kit.render(); }
  };
  let fitted = false;
  const refresh = () => {
    drawFrame();
    if (!fitted && kit?.root.children.length) { kit.fitContents(); kit.render(); fitted = true; }
  };
  api.loop(() => drawFrame());
  return { kit, canvas, say, redraw(fn) { diagram = fn; refresh(); }, refresh,
    fit() { kit?.fitContents(); kit?.render(); } };
}
