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
    let preview, dispose;
    const close = () => {
      if (typeof dispose === 'function') dispose();
      dispose = null;
      stage.replaceChildren(); stage.hidden = true; btn.hidden = false;
      if (preview) preview.hidden = false;
      btn.focus();
    };
    if (name === 'scale') {
      preview = el('figure', { class: 'scale-preview' },
        el('img', { src: window.BOOK_SCALE_ART, width: 1536, height: 1024, loading: 'lazy', alt: 'An illustrated Mumbai neighbourhood with a room at its centre.' }),
        el('figcaption', {}, 'A room. A street. A world. Begin with one metre and see what surrounds it.'));
      mount.append(preview);
    }
    mount.append(btn, msg, stage);
    btn.addEventListener('click', async () => {
      msg.classList.remove('live-warn');
      mount.setAttribute('aria-busy', 'true');
      btn.disabled = true; btn.querySelector('span').textContent = 'Opening…'; msg.textContent = '';
      try {
        const impl = await App.loadExplorer(name, chunk);
        stage.hidden = false; btn.hidden = true;
        if (preview) preview.hidden = true;
        dispose = await impl.mount(stage, { title, close });
        App.emit('explore:open', { name });
      } catch (e) {
        close();
        msg.textContent = location.protocol === 'file:'
          ? 'This explorer loads from the web. Open the book from its website (or a local server) to use it.'
          : 'This explorer could not load. Check the connection and try again.';
        msg.classList.add('live-warn');
      } finally {
        mount.removeAttribute('aria-busy');
        btn.disabled = false; btn.querySelector('span').textContent = btnLabel;
        if (msg.classList.contains('live-warn')) btn.focus();
      }
    });
  });
}
