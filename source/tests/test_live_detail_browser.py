#!/usr/bin/env python3
"""Check native-size live reading through the public book UI, including GL and 3D."""
import functools
import http.server
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT/'build/site')))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/'
errors=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for width in (390,820,1440):
            for theme in ('light','sepia','dark'):
                page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.goto(url)
                page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
                for name in ('projectile','eye3d','skycolour','refraction'):
                    fig=page.locator(f'figure[data-live="{name}"]').first
                    fig.evaluate('e=>e.scrollIntoView({block:"center"})')
                    opening=fig.locator('.live-open');opening.click()
                    stage=fig.locator('.live-stage');expect(stage).to_be_visible()
                    if name=='refraction':
                        stage.locator('summary').click()
                    toggle=fig.locator('.live-detail-toggle')
                    expect(toggle).to_have_attribute('aria-pressed','false')
                    play=fig.locator('.live-play')
                    if play.count():expect(play).to_have_attribute('aria-pressed','false')
                    values=fig.locator('input').evaluate_all('es=>es.map(e=>e.value)')
                    toggle.click();expect(toggle).to_have_attribute('aria-pressed','true')
                    expect(stage).to_have_attribute('tabindex','0')
                    for canvas in stage.locator('canvas[data-logical-width]').all():
                        if canvas.is_visible():
                            assert canvas.evaluate('e=>e.clientWidth>=Number(e.dataset.logicalWidth)'),name
                    if width==390:
                        assert stage.evaluate('e=>e.scrollWidth>e.clientWidth+50'),name
                        stage.focus();page.keyboard.press('End')
                        stage.evaluate('e=>e.scrollLeft=e.scrollWidth')
                        assert stage.evaluate('e=>e.scrollLeft>0'),name
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,name)
                    assert fig.locator('input').evaluate_all('es=>es.map(e=>e.value)')==values
                    if play.count():expect(play).to_have_attribute('aria-pressed','false')
                    # Inputs are reachable and update in either reading mode.
                    slider=fig.locator('input[type="range"]').first
                    if slider.count():
                        slider.focus();page.keyboard.press('Home');before=slider.input_value()
                        page.keyboard.press('ArrowRight');assert slider.input_value()!=before
                    toggle.click();expect(toggle).to_have_attribute('aria-pressed','false')
                    assert stage.evaluate('e=>e.scrollLeft==0 && e.scrollWidth<=e.clientWidth+1'),name
                    fig.get_by_role('button',name='Back to the drawing',exact=True).click()
                    expect(opening).to_be_focused()
                    expect(stage).to_have_count(0)
                page.close()
            print('PASS native live size / fit / controls / pause / themes',width,flush=True)
        browser.close()
    assert not errors,errors
finally:
    server.shutdown()
