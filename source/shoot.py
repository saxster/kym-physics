#!/usr/bin/env python3
"""Screenshot parts of a built book.
   python3 shoot.py build/x.html OUTPREFIX id1 id2 ...  [--w 1280] [--h 900]
   Each id is an element id (e.g. ch2, s2-3, fig-2-4, credits); one PNG per id: OUTPREFIX-<id>-<w>.png
   Use --full to capture a full-page PNG instead (can be very tall)."""
import sys
from playwright.sync_api import sync_playwright
args = sys.argv[1:]
w = int(args[args.index('--w') + 1]) if '--w' in args else 1280
h = int(args[args.index('--h') + 1]) if '--h' in args else 900
dark = '--dark' in args
ids = [a for i, a in enumerate(args[2:], 2) if not a.startswith('--') and args[i - 1] not in ('--w', '--h')]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': w, 'height': h}, color_scheme='dark' if dark else 'light')
    pg.goto('file://' + __import__('os').path.abspath(args[0]), wait_until='load')
    pg.wait_for_timeout(400)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    if sw > w: print(f'WARNING horizontal overflow: scrollWidth {sw} > {w}')
    for i in ids:
        # the app shows one page at a time: following the hash reveals the page that holds the element
        pg.evaluate(f"location.hash='#{i}'"); pg.wait_for_timeout(250)
        y = pg.evaluate(f"(()=>{{const e=document.getElementById('{i}'); return e? Math.max(0, e.getBoundingClientRect().top+scrollY-24) : -1}})()")
        if y < 0: print('missing id', i); continue
        pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(120)
        out = f'{args[1]}-{i}-{w}{"-dark" if dark else ""}.png'
        pg.screenshot(path=out); print(out)
    b.close()
