// Experiments share their chapter implementation with stories, explorers and the notebook.
import App from './core.js';

const linksFor = (lessons, title) => App.el('details', { class: 'lab-story-links' },
  App.el('summary', {}, title),
  App.el('ul', {}, lessons.map(l => App.el('li', {},
    App.el('a', { href: '#' + l.target, 'data-open-lesson': l.id }, l.title)))));

function openLesson(lesson, story = null) {
  const figure = document.getElementById(lesson.target);
  if (!figure) return;
  if (document.querySelector('#storydlg[open]')) window.__leaveStory?.();
  location.hash = lesson.target;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    figure.scrollIntoView({ block: 'start', behavior: 'instant' });
    figure.querySelector('.lab-return')?.remove();
    if (story) {
      const back = App.el('button', { type: 'button', class: 'lab-return live-ctl', onclick: () => {
        figure.dispatchEvent(new CustomEvent('close-lesson'));
        back.remove(); App.openStory(story.id);
        requestAnimationFrame(() => {
          const article = document.getElementById('story-' + story.id);
          const panel = article?.closest('.sd-body');
          if (panel) panel.scrollTop = story.scroll;
          article?.querySelector(`[data-open-lesson="${CSS.escape(lesson.id)}"]`)?.focus({ preventScroll: true });
        });
      } }, 'Return to the story');
      figure.insertBefore(back, figure.firstChild);
    }
    figure.dispatchEvent(new CustomEvent('open-lesson', { detail: { id: lesson.id, story: story?.id || null } }));
  }));
}

App.ready(() => {
  const lessons = App.data.lessons || [];
  if (!lessons.length) return;
  const byId = new Map(lessons.map(l => [l.id, l]));
  document.addEventListener('click', e => {
    const link = e.target.closest?.('[data-open-original]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    const figure = document.getElementById(link.hash.slice(1));
    if (!figure || figure.dataset.live !== link.dataset.openOriginal) return;
    e.preventDefault(); e.stopPropagation();
    const returnLesson = byId.get(link.dataset.returnInvestigation);
    location.hash = figure.id;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      figure.scrollIntoView({block:'start',behavior:'instant'});
      figure.querySelector('.lab-return')?.remove();
      if (returnLesson) figure.prepend(App.el('a', {class:'lab-return', href:'#'+returnLesson.target, 'data-open-lesson':returnLesson.id}, 'Return to the bounce investigation'));
      figure.dispatchEvent(new CustomEvent('open-original'));
    }));
  }, true);
  // Capture before the story panel's ordinary anchor handler closes the modal.
  document.addEventListener('click', e => {
    const link = e.target.closest?.('[data-open-lesson]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button !== 0)) return;
    const lesson = byId.get(link.dataset.openLesson);
    if (!lesson) return;
    const article = link.closest('article.story');
    const story = article ? { id: article.id.slice(6), scroll: article.closest('.sd-body')?.scrollTop || 0 } : null;
    e.preventDefault(); e.stopPropagation(); openLesson(lesson, story);
  }, true);
  const groups = {
    scale: l => l.chapter === 0 || l.id === 'atom-scale',
    sky: l => l.chapter === 14 || /orbit|halo|cannon|moon|chandrayaan|foucault/.test(l.id),
    spectrum: l => /photoelectric|stellar-spectrum|polar|em-wave|raman|prism|colour/.test(l.id),
    map: l => ['foucault', 'telescope', 'tracks', 'parity', 'motor'].includes(l.id),
  };
  for (const [name, filter] of Object.entries(groups)) {
    const page = document.getElementById('explore-' + name);
    const choices = lessons.filter(filter);
    if (page && choices.length) page.append(linksFor(choices, 'Try the connected experiments'));
  }
});
