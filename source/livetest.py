#!/usr/bin/env python3
"""Open every live figure in a built book, let it run, screenshot it, report console errors.
   python3 livetest.py build/x.html OUTDIR [--w 1280] [--only fig-3-2,fig-3-4] [--wait 1500]"""
import sys, os
from playwright.sync_api import sync_playwright
a = sys.argv[1:]
html, outdir = a[0], a[1]
w = int(a[a.index('--w') + 1]) if '--w' in a else 1280
wait = int(a[a.index('--wait') + 1]) if '--wait' in a else 1500
only = a[a.index('--only') + 1].split(',') if '--only' in a else None
os.makedirs(outdir, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': w, 'height': 900})
    errs = []
    pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(f'pageerror: {e}'))
    pg.goto('file://' + os.path.abspath(html), wait_until='load'); pg.wait_for_timeout(500)
    figs = pg.query_selector_all('figure[data-live]')
    print('live figures:', len(figs))
    for f in figs:
        fid = f.get_attribute('id')
        if only and fid not in only: continue
        # story figures are read inside the story panel; open the story first (works with or without paging)
        f.evaluate("e=>{const a=e.closest('article.story'); if(a && window.App && !e.closest('dialog')) App.openStory(a.id.replace('story-',''));}"); pg.wait_for_timeout(300)
        f.evaluate("e=>e.scrollIntoView({block:'center'})"); pg.wait_for_timeout(200)
        btn = f.query_selector('.live-open')
        if not btn: print(fid, 'NO BUTTON'); continue
        btn.click(); pg.wait_for_timeout(wait)
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
        print(fid, f.get_attribute('data-live'), 'ok')
    sw = pg.evaluate('document.documentElement.scrollWidth')
    if sw > w: print('WARNING overflow', sw)
    print('\n'.join(errs) or 'no console errors')
    b.close()
