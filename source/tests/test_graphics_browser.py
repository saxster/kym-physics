#!/usr/bin/env python3
"""Public-UI graphics checks against an existing site build (starts its own server)."""
import functools
import http.server
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'build/graphics-review/browser'
OUT.mkdir(parents=True, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT/'build/site')))
threading.Thread(target=server.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{server.server_address[1]}/'
errors = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (390,820,1024,1180,1440):
            for theme in ('light','sepia','dark'):
                page = browser.new_page(viewport={'width':width,'height':900}, reduced_motion='reduce')
                page.on('pageerror',lambda e: errors.append(str(e)))
                page.goto(URL+'#fig-11-1')
                page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
                page.evaluate('document.fonts.ready')
                button=page.locator('#fig-11-1 .figure-enlarge')
                button.click()
                dialog=page.locator('dialog.figure-detail')
                expect(dialog).to_be_visible()
                expect(dialog.get_by_role('button',name='Full size',exact=True)).to_have_attribute('aria-pressed','true')
                assert dialog.locator('svg.fig').evaluate('s=>s.getBoundingClientRect().width')==640
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
                if width==390:
                    assert dialog.locator('.figure-detail-scroll').evaluate('e=>e.scrollWidth>e.clientWidth')
                dialog.get_by_role('button',name='Fit',exact=True).click()
                assert dialog.locator('.figure-detail-scroll').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
                dialog.screenshot(path=str(OUT/f'prism-{width}-{theme}.png'))
                page.keyboard.press('Escape')
                expect(dialog).not_to_be_visible()
                expect(button).to_be_focused()
                # Caption access and graph reading survive print; controls are excluded.
                page.emulate_media(media='print')
                expect(button).not_to_be_visible()
                expect(page.locator('#fig-11-1 > svg.fig')).to_be_visible()
                page.close()
            print('PASS figure detail / themes / print',width)
        # The story uses an SVG hatch pattern. Its cloned definition must remain unique.
        page=browser.new_page(viewport={'width':390,'height':900},reduced_motion='reduce')
        page.goto(URL+'#story-moon-phases')
        story=page.locator('#story-dialog')
        # Locate via the open dialog itself; background story articles may share ids.
        if not story.count(): story=page.locator('dialog').filter(has=page.locator('.story'))
        button=page.locator('dialog:not(.figure-detail) .figure-enlarge').first
        button.click()
        dialog=page.locator('dialog.figure-detail')
        expect(dialog).to_be_visible()
        assert dialog.locator('svg [id]').count()>0
        assert dialog.locator('svg').evaluate('''s=>[...s.querySelectorAll('[id]')].every(e=>e.id.startsWith('figure-detail-'))''')
        page.keyboard.press('Escape')
        expect(button).to_be_focused()
        print('PASS story detail / pattern ids / focus')
        # Cover tiles have meaningful hit targets and all stories resolve.
        page.goto(URL+'#cover')
        tiles=page.locator('svg.cover-live g[data-ch]')
        assert tiles.count()==16
        assert min(tiles.nth(i).bounding_box()['width'] for i in range(16))>=44
        tiles.nth(2).click()
        expect(page.locator('.cv-card')).to_contain_text('Why things keep moving')
        print('PASS illustrated cover / touch targets')
        browser.close()
    assert not errors,errors
finally:
    server.shutdown()
