"""Companion spreads (spreads/chNN.html) in a real browser. Serves build/site itself.

    python3 build.py --site build/site && ../.venv/bin/python tests/test_spreads_browser.py [build/site]

Checks, for every spread: every page by deep link with no errors; the figure stays still until the reader acts;
Play and Pause; every listed part opens its breakdown from the keyboard and Escape returns focus; pointing at a
moving part and clicking opens it; a tap opens one on a phone; reduced motion never moves; three themes; no
sideways overflow; offline reload; the main page keeps its 4 MiB budget. Screenshots go to build/spread-checks.
"""
import functools, glob, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

SITE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'build', 'site'))
OUT = os.path.join(os.path.dirname(SITE), 'spread-checks'); os.makedirs(OUT, exist_ok=True)
GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args): pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SITE))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_port}/'
fails = []


def check(ok, what):
    print(('PASS  ' if ok else 'FAIL  ') + what)
    if not ok:
        fails.append(what)


def ready(page):
    page.wait_for_function('window.__spread && document.getElementById("sheet").textContent.length > 20', timeout=30000)
    page.wait_for_timeout(300)


def part_xy(page, key):
    """Screen point of a part's first mesh."""
    return page.evaluate('''k => { const E = __spread.E, p = new E.THREE.Vector3(); let m = null;
      E.ASM[k].traverse(o => { if (!m && o.isMesh && o.visible && o.userData.part !== undefined) m = o; });
      m.getWorldPosition(p); const c = document.getElementById('gl').getBoundingClientRect();
      const [x, y] = E.toScreen(p, c.width, c.height); return [c.left + x, c.top + y]; }''', key)


spreads = sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(SITE, 'spreads', 'ch*.html')))
check(bool(spreads), f'spreads built: {", ".join(spreads) or "none"}')
idx = os.path.getsize(os.path.join(SITE, 'index.html'))
check(idx < 4 * 1024 * 1024, f'index.html under 4 MiB ({idx / 1048576:.2f} MiB)')
main_html = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
sw = open(os.path.join(SITE, 'sw.js'), encoding='utf-8').read()

with sync_playwright() as p:
    browser = p.chromium.launch(args=GL)
    for key in spreads:
        url = f'{BASE}spreads/{key}.html'
        check(f'href="spreads/{key}.html"' in main_html, f'{key}: the chapter links to its spread')
        check(f'./spreads/{key}.html' in sw, f'{key}: the service worker precaches it')

        # ---- desktop: deep links, calm start, play, parts, picking ----
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(url); ready(page)
        n = page.evaluate('__spread.N')
        for i in range(n):
            page.goto(url + (f'#p{i}' if i else '')); page.reload(); ready(page)
            check(page.evaluate('location.hash') == (f'#p{i}' if i else ''), f'{key} p{i}: deep link holds')
            check(not page.evaluate('__spread.started'), f'{key} p{i}: a deep link opens still')
            check(page.locator('#sheet h1').inner_text().strip() != '', f'{key} p{i}: page has a title')
            check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{key} p{i}: no sideways overflow')
            page.screenshot(path=os.path.join(OUT, f'{key}-1280-p{i}.png'))
        check(not errors, f'{key}: no console errors across {n} pages' + (f' ({errors[:3]})' if errors else ''))

        page.goto(url); page.reload(); ready(page)
        c0 = page.evaluate('__spread.clock'); page.wait_for_timeout(800); c1 = page.evaluate('__spread.clock')
        check(c0 == c1 and not page.evaluate('__spread.started'), f'{key}: still until the reader acts')
        play = page.get_by_role('button', name='Play')
        play.click(); page.wait_for_timeout(800)
        check(page.evaluate('__spread.clock') > c1, f'{key}: Play starts the figure')
        page.get_by_role('button', name='Pause').click(); c2 = page.evaluate('__spread.clock'); page.wait_for_timeout(500)
        check(abs(page.evaluate('__spread.clock') - c2) < 0.02, f'{key}: Pause stops it')

        # keyboard: every page's parts open from their buttons; Escape closes and returns focus
        opened = 0
        for i in range(n):
            page.evaluate(f'__spread.goto({i}, true)'); page.wait_for_timeout(250)
            for b in page.locator('#sheet button[data-part]').all():
                k = b.get_attribute('data-part')
                b.focus(); page.keyboard.press('Enter'); page.wait_for_timeout(120)
                ok = page.locator('#plate').is_visible() and page.locator('#plate h1').inner_text().strip() != '' and page.locator('#facts tr').count() > 0
                page.keyboard.press('Escape'); page.wait_for_timeout(80)
                back = page.evaluate('document.activeElement && document.activeElement.dataset.part')
                check(ok and back == k and page.locator('#plate').is_hidden(), f'{key} p{i}: “{k}” opens from the keyboard and Escape returns')
                opened += 1
        check(opened > 0, f'{key}: {opened} breakdowns reachable from the keyboard')

        # pointer: point at the moving ball, time stops, click opens it
        page.evaluate('__spread.goto(0, true)'); page.get_by_role('button', name='Play').click(); page.wait_for_timeout(600)
        x, y = part_xy(page, 'ball')
        page.mouse.move(x, y); page.wait_for_timeout(500)
        t0 = page.evaluate('__spread.clock'); page.wait_for_timeout(400)
        check(abs(page.evaluate('__spread.clock') - t0) < 0.02, f'{key}: pointing at the ball stops time')
        page.mouse.click(x, y); page.wait_for_timeout(200)
        check(page.locator('#plate').is_visible(), f'{key}: clicking the moving ball opens its breakdown')
        page.keyboard.press('Escape')

        # practice: choosing marks the answer and only then shows why
        page.evaluate('__spread.goto(1, true)'); page.wait_for_timeout(250)
        q = page.locator('.practice .q').first
        if q.count():
            check(q.locator('.why').is_hidden(), f'{key}: a question hides its reason before an answer')
            q.locator('button[data-c]').first.click()
            check(q.locator('.why').is_visible() and q.locator('button.right').count() == 1, f'{key}: answering shows the right choice and the reason')

        for theme in ('light', 'sepia', 'dark'):
            page.evaluate("t => { localStorage.setItem('mw:settings', JSON.stringify({theme: t})); }", theme)
            page.goto(url + '#p5'); page.reload(); ready(page)
            check(page.evaluate('document.documentElement.dataset.theme') == theme, f'{key}: {theme} theme follows the book settings')
            page.screenshot(path=os.path.join(OUT, f'{key}-1280-{theme}.png'))
        page.evaluate("localStorage.removeItem('mw:settings')")

        # offline: once opened, the spread reloads with the network gone
        ctx = browser.new_context(viewport={'width': 1280, 'height': 800})
        op = ctx.new_page(); op.goto(url); ready(op)
        op.wait_for_function('navigator.serviceWorker && navigator.serviceWorker.controller !== undefined', timeout=10000)
        op.evaluate('navigator.serviceWorker.ready'); op.reload(); ready(op)
        op.wait_for_timeout(1500)
        ctx.set_offline(True); op.reload();
        try:
            ready(op); check(True, f'{key}: reloads offline')
        except Exception as e:
            check(False, f'{key}: reloads offline ({e.__class__.__name__})')
        ctx.close()
        page.close()

        # ---- phone: a tap opens a breakdown; the figure stacks over the text ----
        ph = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2).new_page()
        perr = []
        ph.on('pageerror', lambda e: perr.append(str(e)))
        ph.goto(url); ready(ph)
        x, y = part_xy(ph, 'ball'); ph.touchscreen.tap(x, y); ph.wait_for_timeout(250)
        check(ph.locator('#plate').is_visible(), f'{key}: a tap opens a breakdown on a phone')
        check(ph.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{key}: phone, no sideways overflow')
        for i in (0, 4, 6):
            ph.evaluate(f'__spread.goto({i}, true)'); ph.wait_for_timeout(400)
            ph.screenshot(path=os.path.join(OUT, f'{key}-390-p{i}.png'))
        check(not perr, f'{key}: phone, no errors')
        ph.context.close()

        # ---- reduced motion: never moves, even after Play would have been pressed ----
        rm = browser.new_page(viewport={'width': 1280, 'height': 800}, reduced_motion='reduce')
        rm.goto(url); ready(rm)
        check(rm.get_by_role('button', name='Play').count() == 0, f'{key}: reduced motion has no Play button')
        c0 = rm.evaluate('__spread.clock'); rm.mouse.wheel(0, 900); rm.wait_for_timeout(900)
        check(rm.evaluate('__spread.clock') == c0, f'{key}: reduced motion stays still while scrolling')
        rm.close()
    browser.close()

srv.shutdown()
print(f'\n{len(fails)} failed' if fails else '\nall spread checks passed')
sys.exit(1 if fails else 0)
