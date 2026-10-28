import sys
from playwright.sync_api import sync_playwright
from PIL import Image
w=int(sys.argv[1]) if len(sys.argv)>1 else 1280
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':w,'height':900})
    pg.goto('file:///home/claude/book/build/The-Invisible-World.html'); pg.wait_for_timeout(500)
    print('overflow', pg.evaluate('document.documentElement.scrollWidth'))
    figs=pg.query_selector_all('figure[id^=fig-]')
    paths=[]
    for f in figs:
        i=f.get_attribute('id'); path=f'/home/claude/work/fig/{i}.png'
        f.screenshot(path=path); paths.append(path)
    b.close()
import os
print(len(paths))
