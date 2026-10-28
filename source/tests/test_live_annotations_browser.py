#!/usr/bin/env python3
"""Check that the public numerical margin agrees with its live experiment."""
import functools,http.server,threading
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT/'build/site')))
threading.Thread(target=server.serve_forever,daemon=True).start()
errors=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  page=browser.new_page(viewport={'width':390,'height':900},reduced_motion='reduce')
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_address[1]}/#fig-12-3')
  fig=page.locator('figure[data-live="circuit"]').first
  fig.locator('.live-open').click()
  fig.get_by_role('button',name='3 LEDs',exact=True).click()
  expect(fig.locator('.live-readout')).to_contain_text('9.1 mA')
  expect(fig.locator('.live-your-numbers')).to_contain_text('9.1 mA')
  expect(fig.locator('.live-your-numbers')).to_contain_text('resistor = 3.0 V')
  battery=fig.get_by_role('slider',name='Battery')
  battery.focus();battery.press('Home')
  expect(fig.locator('.live-readout')).to_contain_text('no current')
  expect(fig.locator('.live-your-numbers')).to_contain_text('I = 0')
  # The guided trend must set the physical state that its caption describes.
  fig.get_by_role('button',name='4. Side-on trend',exact=True).click()
  expect(battery).to_have_value('9')
  expect(fig.locator('.live-your-numbers')).to_contain_text('9.1 mA')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert not errors,errors
  browser.close()
 print('PASS public circuit model / margin / threshold / guided trend agree')
finally:server.shutdown()
