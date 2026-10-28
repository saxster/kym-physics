#!/usr/bin/env python3
"""Open every live figure and every explorer in a built book, let it run, screenshot it, report console errors.

   python3 livetest.py build/site/index.html OUTDIR [--w 1280] [--only fig-3-2,fig-3-4] [--wait 1500] [--offline] [--file]

The book is served from its folder over a local HTTP server (lazy chunks in live/ need one); --file opens it as file://
instead (fine for single-file --out builds). It reports which chunks loaded before any tap (there should be none),
and with --offline it also checks that the page and a live figure still work offline after the first visit
(service worker). Exit status 1 if there were console errors or a figure or explorer failed to open."""
import functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

a = sys.argv[1:]
html, outdir = a[0], a[1]
w = int(a[a.index('--w') + 1]) if '--w' in a else 1280
wait = int(a[a.index('--wait') + 1]) if '--wait' in a else 1500
only = a[a.index('--only') + 1].split(',') if '--only' in a else None
offline = '--offline' in a
use_file = '--file' in a
os.makedirs(outdir, exist_ok=True)
root = os.path.dirname(os.path.abspath(html))

server = None
if use_file:
    url = 'file://' + os.path.abspath(html)
else:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=root))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/{os.path.basename(html)}'

failures = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': w, 'height': 900})
    pg = ctx.new_page()
    errs, chunk_log = [], []
    gpu_noise = []   # software-GL performance notes from the headless test browser, not page errors
    pg.on('console', lambda m: (gpu_noise if 'GL Driver Message' in m.text else errs).append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(f'pageerror: {e}'))
    pg.on('requestfailed', lambda r: errs.append(f'request failed: {r.url} {r.failure}'))
    pg.on('request', lambda r: chunk_log.append(r.url.rsplit('/', 1)[-1]) if '/live/' in r.url else None)
    print('opening', url)
    pg.goto(url, wait_until='load'); pg.wait_for_timeout(800)
    print('chunks loaded before any tap:', len(chunk_log), chunk_log or '')
    if chunk_log:
        failures.append('chunks loaded before any tap')
    figs = pg.query_selector_all('figure[data-live]')
    print('live figures:', len(figs))
    for f in figs:
        fid = f.get_attribute('id')
        if only and fid not in only: continue
        # story figures are read inside the story panel; open the story first (works with or without paging)
        f.evaluate("e=>{const a=e.closest('article.story'); if(a && window.App && !e.closest('dialog')) App.openStory(a.id.replace('story-',''));}"); pg.wait_for_timeout(300)
        f.evaluate("e=>e.scrollIntoView({block:'center'})"); pg.wait_for_timeout(200)
        btn = f.query_selector('.live-open')
        if not btn: print(fid, 'NO BUTTON'); failures.append(f'{fid}: no button'); continue
        before = len(chunk_log)
        btn.click(); pg.wait_for_timeout(wait)
        if not f.query_selector('.live-stage'):
            print(fid, f.get_attribute('data-live'), 'DID NOT OPEN'); failures.append(f'{fid}: did not open'); continue
        def snap(path):
            pb = f.query_selector('.live-play')
            if pb and pb.get_attribute('aria-pressed') == 'true': pb.click(); pg.wait_for_timeout(150)
            f.screenshot(path=path, timeout=60000)
            if pb: pb.click()
        snap(f'{outdir}/{fid}-{w}.png')
        # interact: press each tab / move each slider to max, screenshot again
        sl = f.query_selector('input[type=range]')
        tabs = f.query_selector_all('.live-tabs button')
        if sl:
            sl.evaluate("e=>{e.value=e.max; e.dispatchEvent(new Event('input'))}"); pg.wait_for_timeout(wait)
            snap(f'{outdir}/{fid}-{w}-b.png')
        elif len(tabs) > 1:
            tabs[-1].click(); pg.wait_for_timeout(wait)
            snap(f'{outdir}/{fid}-{w}-b.png')
        print(fid, f.get_attribute('data-live'), 'ok', f'(+{len(chunk_log) - before} chunks: {", ".join(chunk_log[before:])})' if len(chunk_log) > before else '')
    # explorers: open each one from its own page
    for m in pg.query_selector_all('.explore-mount[data-chunk]'):
        name = m.get_attribute('data-mount')
        sec = m.evaluate("e=>e.closest('section').id")
        pg.evaluate(f"location.hash='#{sec}'"); pg.wait_for_timeout(300)
        m.evaluate("e=>e.scrollIntoView({block:'center'})")
        ob = m.query_selector('.explore-open')
        if not ob: print('explorer', name, 'NO BUTTON'); failures.append(f'explorer {name}: no button'); continue
        before = len(chunk_log)
        ob.click(); pg.wait_for_timeout(wait)
        opened = m.evaluate("e=>{const s=e.querySelector('.explore-stage'); return !!s && !s.hidden && s.children.length>0}")
        m.screenshot(path=f'{outdir}/explore-{name}-{w}.png')
        print('explorer', name, 'ok' if opened else 'DID NOT OPEN', f'(+{len(chunk_log) - before} chunks: {", ".join(chunk_log[before:])})')
        if not opened: failures.append(f'explorer {name}: did not open')
    sw = pg.evaluate('document.documentElement.scrollWidth')
    if sw > w: print('WARNING overflow', sw)
    if offline and not use_file:
        ok = pg.evaluate("""async () => { if (!('serviceWorker' in navigator)) return 'no service worker support';
            const r = await Promise.race([navigator.serviceWorker.ready.then(() => 'ready'), new Promise(res => setTimeout(() => res('timeout'), 8000))]);
            return r; }""")
        print('service worker:', ok)
        pg.wait_for_timeout(1500)
        ctx.set_offline(True)
        pg2 = ctx.new_page()
        pg2.on('pageerror', lambda e: errs.append(f'offline pageerror: {e}'))
        try:
            pg2.goto(url, wait_until='load'); pg2.wait_for_timeout(800)
            title = pg2.title()
            f = pg2.query_selector('figure[data-live]')
            live_ok = None
            if f:
                f.evaluate("e=>e.scrollIntoView({block:'center'})"); pg2.wait_for_timeout(200)
                f.query_selector('.live-open').click(); pg2.wait_for_timeout(wait)
                live_ok = bool(f.query_selector('.live-stage'))
            print('offline reload:', repr(title), '| live figure opens offline:', live_ok)
            if not title or live_ok is False:
                failures.append('offline reload')
        except Exception as e:
            print('offline reload FAILED:', e); failures.append('offline reload')
        ctx.set_offline(False)
    if gpu_noise: print(f'(ignored {len(gpu_noise)} software-GL performance notes from the test browser)')
    print('\n'.join(errs) or 'no console errors')
    b.close()
if server:
    server.shutdown()
if errs or failures:
    print('FAILED:', '; '.join(failures) or f'{len(errs)} console messages')
    sys.exit(1)
