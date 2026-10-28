// The shell every explorer page shares: an "Open" button in the explorer's mount point. The explorer's own code
// (app/x_<name>.js, often heavy, sometimes three.js) loads only when the reader presses it.
import App from './core.js';

const { el } = App;
const ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 4.2 L15.5 10 L6.5 15.8 Z" fill="currentColor"/></svg>';

export function explorerShell(name, { label } = {}) {
  App.ready(() => {
    const mount = document.querySelector(`[data-mount="${name}"]`);
    if (!mount) return;
    const title = mount.dataset.title || name;
    const chunk = mount.dataset.chunk || 'x_' + name;
    mount.querySelector('.noscript')?.remove();
    const btnLabel = label || `Open ${title}`;
    const btn = el('button', { type: 'button', class: 'live-open explore-open', html: ICON + `<span>${btnLabel}</span>` });
    const msg = el('p', { class: 'live-note', role: 'status' });
    const stage = el('div', { class: 'explore-stage', hidden: true });
    mount.append(btn, msg, stage);
    btn.addEventListener('click', async () => {
      btn.disabled = true; btn.querySelector('span').textContent = 'Opening…'; msg.textContent = '';
      try {
        const impl = await App.loadExplorer(name, chunk);
        stage.hidden = false; btn.hidden = true;
        await impl.mount(stage, { title, close: () => { stage.replaceChildren(); stage.hidden = true; btn.hidden = false; btn.focus(); } });
        App.emit('explore:open', { name });
      } catch (e) {
        msg.textContent = location.protocol === 'file:'
          ? 'This explorer loads from the web. Open the book from its website (or a local server) to use it.'
          : 'This explorer could not load. Check the connection and try again.';
        msg.classList.add('live-warn');
      } finally {
        btn.disabled = false; btn.querySelector('span').textContent = btnLabel;
      }
    });
  });
}
