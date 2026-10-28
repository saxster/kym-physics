// Keep the whole diagram visible in the text; open its full vector detail on request.
import App from './core.js';

App.ready(() => {
  if (typeof HTMLDialogElement === 'undefined') return;
  const { el } = App;
  const title = el('h2', { id: 'figure-detail-title' }, 'Look closely');
  const close = el('button', { type: 'button', class: 'figure-close', autofocus: true }, 'Close');
  const fit = el('button', { type: 'button', 'aria-pressed': 'true' }, 'Fit');
  const full = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Full size');
  const scroll = el('div', { class: 'figure-detail-scroll', tabindex: '0', 'aria-label': 'Diagram. Scroll to see the full drawing.' });
  const caption = el('p', { class: 'figure-detail-caption' });
  const hint = el('p', { class: 'figure-detail-hint' }, 'Scroll sideways to explore the full drawing, or choose Fit.');
  const dialog = el('dialog', { class: 'figure-detail', 'aria-labelledby': title.id },
    el('header', { class: 'figure-detail-bar' }, title, fit, full, close), hint, scroll, caption);
  document.body.append(dialog);
  let opener = null, serial = 0;
  function setSize(actual) {
    const svg = scroll.querySelector('svg');
    if (!svg) return;
    svg.style.width = actual ? `${svg.viewBox.baseVal.width}px` : '100%';
    svg.style.minWidth = actual ? `${svg.viewBox.baseVal.width}px` : '0';
    fit.setAttribute('aria-pressed', String(!actual));
    full.setAttribute('aria-pressed', String(actual));
    hint.hidden = !actual;
  }
  fit.addEventListener('click', () => setSize(false));
  full.addEventListener('click', () => setSize(true));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { scroll.replaceChildren(); opener?.focus({ preventScroll: true }); });
  function enhance() {
    document.querySelectorAll('figure > svg.fig').forEach(svg => {
      const figure = svg.parentElement;
      if (figure.querySelector('.figure-enlarge') || svg.querySelector('[data-ch]')) return;
      const button = el('button', { type: 'button', class: 'figure-enlarge', 'aria-haspopup': 'dialog' }, 'Look closely ↗');
      button.addEventListener('click', () => {
        opener = button;
        const clone = svg.cloneNode(true);
        // Clip paths and other local definitions must stay unique beside the original.
        const prefix = `figure-detail-${++serial}-`;
        const ids = new Map([...clone.querySelectorAll('[id]')].map(n => [n.id, prefix + n.id]));
        clone.querySelectorAll('*').forEach(n => {
          for (const a of [...n.attributes]) {
            let value = a.value;
            for (const [oldId, newId] of ids) {
              value = value.replaceAll(`url(#${oldId})`, `url(#${newId})`);
              if ((a.name === 'href' || a.name === 'xlink:href') && value === `#${oldId}`) value = `#${newId}`;
            }
            if (a.name === 'id') value = ids.get(a.value) || a.value;
            n.setAttribute(a.name, value);
          }
        });
        const cap = figure.querySelector('figcaption');
        caption.textContent = cap?.textContent || svg.getAttribute('aria-label') || '';
        title.textContent = cap?.querySelector('b')?.textContent || 'Look closely';
        const volume = figure.closest('[class*="vol-"]')?.className.match(/\bvol-\d\b/);
        dialog.className = 'figure-detail ' + (volume?.[0] || 'vol-1');
        scroll.replaceChildren(clone);
        setSize(true);
        dialog.showModal();
        scroll.scrollLeft = 0;
        scroll.scrollTop = 0;
      });
      figure.append(button);
    });
  }
  enhance();
  App.on('story:open', enhance);
});
