// Shared placeholder for explorers that are not built yet: shows what is coming, with a way back.
import App from './core.js';

export function placeholder(name, text) {
  App.explorer(name, {
    mount(stage, { title, close }) {
      const { el } = App;
      stage.append(el('div', { class: 'explore-ph' },
        el('p', { class: 'lj-kick' }, 'Coming soon'),
        el('p', {}, text),
        el('button', { type: 'button', class: 'live-ctl', onclick: close }, 'Close')));
    },
  });
}
