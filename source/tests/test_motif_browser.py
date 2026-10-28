#!/usr/bin/env python3
"""Exercise animated volume art across early RAF scheduling, theme redraws and navigation."""
import functools,http.server,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT/'build/site')))
threading.Thread(target=server.serve_forever,daemon=True).start()
errors=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  page=browser.new_page(viewport={'width':390,'height':900})
  page.on('pageerror',lambda e:errors.append(str(e)))
  # A fresh frame may have a timestamp before the synchronous setup clock.
  # Explicitly simulate that valid scheduling boundary on every initial callback.
  page.add_init_script('''const realRAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>realRAF(t=>cb(t-64));''')
  page.goto(f'http://127.0.0.1:{server.server_address[1]}/#vol1')
  for vol in range(1,5):
   page.evaluate('(v)=>location.hash="#vol"+v',vol)
   for theme in ('light','dark','sepia'):
    page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
    page.wait_for_timeout(150)
  assert not errors,errors
  browser.close()
 print('PASS four volume motifs: early RAF timestamps, navigation and all themes')
finally:server.shutdown()
