// 3-level auto-expanding progress-trail upgrade for m_beauty.js nav.spine + compact 16px native section switcher.
import App from './core.js';

function initProgressRail() {
  if (typeof document === 'undefined') return;
  const chapters = [...document.querySelectorAll('article.chapter')];
  if (!chapters.length) return;

  let clickLockUntil = 0;
  let currentSecId = '';
  let mobileWrap = null;
  let mobileSelect = null;
  let mobileLabel = null;
  let lastSelectKey = '';

  const allSections = [];
  chapters.forEach(ch => {
    const chNum = ch.querySelector('.opener .cl')?.textContent?.trim() || ch.id.toUpperCase();
    const chTitle = ch.querySelector('.opener h2')?.textContent?.trim() || ch.id;
    const secs = [...ch.querySelectorAll('section.sec[id]')];
    secs.forEach((sec, idx) => {
      const h3 = sec.querySelector('h3');
      const numEl = h3?.querySelector('.n');
      const num = numEl ? numEl.textContent.trim() : `${idx + 1}`;
      const clone = h3?.cloneNode(true);
      clone?.querySelector('.n')?.remove();
      const title = (clone?.textContent || '').replace(/\s+/g, ' ').trim();
      const subNodes = [...sec.querySelectorAll('h4[id], figcaption')].slice(0, 6);
      const subs = subNodes.map((node, sIdx) => {
        if (!node.id) node.id = `${sec.id}-p${sIdx + 1}`;
        const raw = node.textContent.replace(/\s+/g, ' ').trim();
        const label = raw.length > 52 ? raw.slice(0, 49).trim() + '…' : raw;
        return { id: node.id, label };
      }).filter(item => item.label);
      allSections.push({
        chapterId: ch.id,
        chapterLabel: `${chNum} · ${chTitle}`,
        secId: sec.id,
        num,
        title,
        subs,
      });
    });
  });

  const secMetaById = new Map(allSections.map(s => [s.secId, s]));

  function ensureMobilePicker() {
    if (mobileWrap || !allSections.length) return;
    mobileWrap = App.el('div', { class: 'pr-mobile-wrap', hidden: true });
    mobileLabel = App.el('span', { class: 'pr-mobile-label' }, 'Jump to section');
    const caret = App.el('span', { class: 'pr-mobile-caret', 'aria-hidden': 'true' }, '▾');
    mobileSelect = App.el('select', { class: 'pr-select', 'aria-label': 'Jump to chapter section' });
    mobileSelect.addEventListener('change', () => {
      const targetId = mobileSelect.value;
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        clickLockUntil = Date.now() + 900;
        setActiveSection(targetId, true);
        target.scrollIntoView({ behavior: App.reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    });
    mobileWrap.append(mobileLabel, caret, mobileSelect);
    document.body.append(mobileWrap);
  }

  function populateMobileOptions(chapterId) {
    if (!mobileSelect || !chapterId) return;
    const key = chapterId;
    if (lastSelectKey === key) return;
    lastSelectKey = key;
    const chSecs = allSections.filter(s => s.chapterId === chapterId);
    const items = chSecs.length ? chSecs : allSections.slice(0, 24);
    mobileSelect.replaceChildren(
      ...items.map(s => App.el('option', { value: s.secId }, `${s.num ? s.num + ' · ' : ''}${s.title}`))
    );
  }

  function enrichSpine(nav) {
    if (!nav) return;
    const links = [...nav.querySelectorAll('ol > li > a[data-sec]')];
    links.forEach(a => {
      const li = a.parentElement;
      if (!li || li.dataset.prEnriched === '1') return;
      li.dataset.prEnriched = '1';
      a.addEventListener('click', () => {
        clickLockUntil = Date.now() + 900;
        if (a.dataset.sec) setActiveSection(a.dataset.sec, true);
      });
      const meta = secMetaById.get(a.dataset.sec || '');
      if (meta && meta.subs.length) {
        const subList = App.el('ul', { class: 'sp-sub' },
          meta.subs.map(sub =>
            App.el('li', {}, App.el('a', { href: `#${sub.id}` }, sub.label))
          )
        );
        li.append(subList);
      }
    });
  }

  function syncSpineState(nav) {
    if (!nav) return;
    enrichSpine(nav);
    const links = [...nav.querySelectorAll('ol > li > a[data-sec]')];
    let activeIdx = links.findIndex(a => a.getAttribute('aria-current') === 'location');
    if (activeIdx < 0 && currentSecId) {
      activeIdx = links.findIndex(a => a.dataset.sec === currentSecId);
    }
    links.forEach((a, idx) => {
      const li = a.parentElement;
      if (!li) return;
      if (activeIdx >= 0 && idx < activeIdx) li.dataset.passed = 'true';
      else delete li.dataset.passed;
      if (idx === activeIdx) li.dataset.active = 'true';
      else delete li.dataset.active;
    });
  }

  function setActiveSection(secId, fromUser) {
    if (!secId) return;
    if (!fromUser && Date.now() < clickLockUntil) return;
    currentSecId = secId;
    const meta = secMetaById.get(secId);
    const nav = document.querySelector('nav.spine');
    if (nav) {
      nav.querySelectorAll('ol > li > a[data-sec]').forEach(a => {
        if (a.dataset.sec === secId) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
      syncSpineState(nav);
    }
    if (mobileWrap && meta) {
      populateMobileOptions(meta.chapterId);
      if (mobileSelect) mobileSelect.value = secId;
      if (mobileLabel) mobileLabel.textContent = `${meta.num ? meta.num + ' · ' : ''}${meta.title}`;
      mobileWrap.hidden = false;
    }
  }

  ensureMobilePicker();

  const existingNav = document.querySelector('nav.spine');
  if (existingNav) {
    syncSpineState(existingNav);
    const mo = new MutationObserver(() => syncSpineState(existingNav));
    mo.observe(existingNav, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  } else {
    const bodyObserver = new MutationObserver(() => {
      const nav = document.querySelector('nav.spine');
      if (nav) {
        bodyObserver.disconnect();
        syncSpineState(nav);
        const mo = new MutationObserver(() => syncSpineState(nav));
        mo.observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current'] });
      }
    });
    bodyObserver.observe(document.body, { childList: true });
  }

  if (typeof IntersectionObserver !== 'undefined') {
    const secIO = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) setActiveSection(e.target.id, false);
      }
    }, { rootMargin: '-38% 0px -60% 0px' });
    allSections.forEach(s => {
      const node = document.getElementById(s.secId);
      if (node) secIO.observe(node);
    });

    const cover = document.querySelector('.cover, section.front');
    if (cover && mobileWrap) {
      const coverIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) mobileWrap.hidden = true;
          else if (currentSecId) mobileWrap.hidden = false;
        });
      }, { threshold: 0.2 });
      coverIO.observe(cover);
    }
  }
}

App.ready(() => {
  initProgressRail();
});
