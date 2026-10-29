#!/usr/bin/env python3
"""Check real Pages delivery, old-reader upgrade, offline bytes and retained demonstrations.

Run before pushing with --wait-for-publish build/publish/deployed.flag, wait for
upgrade-ready.json, publish, verify Pages, then create that flag. Without the flag
option this checks an already deployed book. Uses isolated browser profiles only.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import time
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--url', default='https://saxster.github.io/kym-physics/')
p.add_argument('--site', default='build/site')
p.add_argument('--out', default='build/publish/browser-trail/health')
p.add_argument('--wait-for-publish', help='Wait for this flag after capturing a real old-reader cache')
p.add_argument('--old-cache')
a = p.parse_args()
site, out = ROOT / a.site, ROOT / a.out
out.mkdir(parents=True, exist_ok=True)
url = a.url.rstrip('/') + '/'
html = (site / 'index.html').read_bytes()
sw = (site / 'sw.js').read_bytes()
cache = re.search(rb"const CACHE = '([^']+)'", sw).group(1).decode()
files = json.loads(re.search(rb'const FILES = (.*?);', sw).group(1))
expected = {f: hashlib.sha256((site / ('index.html' if f == './' else f[2:])).read_bytes()).hexdigest() for f in files}
receipt = {'url': url, 'expectedCache': cache, 'expectedIndexSha256': hashlib.sha256(html).hexdigest(), 'cases': [], 'errors': []}

def log(message):
    with (out / 'log.md').open('a') as f:
        f.write(f'- {time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())} {url}: {message}\n')
    print(message, flush=True)


def monitor(page):
    page.on('pageerror', lambda e: receipt['errors'].append(str(e)))
    page.on('console', lambda m: receipt['errors'].append(m.text) if m.type == 'error' else None)


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2, reduced_motion='reduce')
        page = context.new_page(); monitor(page)
        page.set_default_navigation_timeout(180000)
        expect.set_options(timeout=60000)
        response = page.goto(url, wait_until='networkidle')
        assert response.ok, response.status
        if a.wait_for_publish:
            assert a.old_cache, '--old-cache is required to prove an old-reader upgrade'
            page.wait_for_function('navigator.serviceWorker.controller !== null', timeout=180000)
            page.wait_for_function('(k)=>caches.has(k)', arg=a.old_cache, timeout=180000)
            old = {'url': url, 'cache': a.old_cache, 'indexSha256': hashlib.sha256(response.body()).hexdigest()}
            page.screenshot(path=str(out / 'old-reader-before-publish.png'))
            (out / 'upgrade-ready.json').write_text(json.dumps(old, indent=2))
            log('Old live edition and real service-worker cache ready')
            flag = ROOT / a.wait_for_publish
            deadline = time.monotonic() + 1200
            while not flag.exists():
                assert time.monotonic() < deadline, 'Publication flag did not arrive within 20 minutes'
                page.wait_for_timeout(1000)
            receipt['oldReader'] = old
            response = page.reload(wait_until='networkidle')
        assert response.ok and hashlib.sha256(response.body()).hexdigest() == receipt['expectedIndexSha256'], 'Live index is not the intended build'
        r = page.request.get(url + 'sw.js', timeout=60000)
        assert r.ok and r.body() == sw, 'Live service worker differs from the verified build'
        page.evaluate('async()=>{const r=await navigator.serviceWorker.ready;await r.update();}')
        page.wait_for_function('(k)=>caches.has(k)', arg=cache, timeout=180000)
        page.wait_for_function('(k)=>navigator.serviceWorker.controller!==null && caches.keys().then(ks=>ks.filter(x=>x.startsWith("mw-")).every(x=>x===k))', arg=cache, timeout=180000)
        # Installation may have created the cache before addAll has completed.
        page.wait_for_function('async({cache,files})=>{const c=await caches.open(cache);return (await Promise.all(files.map(f=>c.match(new URL(f,location.href).href)))).every(Boolean);}', arg={'cache': cache, 'files': files}, timeout=180000)
        actual = page.evaluate('''async({cache,files})=>{
          const c=await caches.open(cache),out={};
          for(const f of files){const r=await c.match(new URL(f,location.href).href);
            const b=await crypto.subtle.digest('SHA-256',await r.arrayBuffer());
            out[f]=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
          return out;
        }''', {'cache': cache, 'files': files})
        assert actual == expected, 'One or more deployed/offline files differ from the verified build'
        receipt['precacheFiles'] = actual
        receipt['oldCacheRemoved'] = not a.old_cache or page.evaluate('(k)=>caches.has(k)', a.old_cache) is False
        assert receipt['oldCacheRemoved']
        context.set_offline(True)
        page.reload(wait_until='domcontentloaded')
        lesson = page.evaluate('App.data.lessons.find(x=>x.id==="photoelectric")')
        page.evaluate('(id)=>location.hash=id', lesson['target'])
        fig = page.locator('#' + lesson['target'])
        fig.locator('[data-lesson-id="photoelectric"]').tap()
        expect(fig.locator('.live-readout')).to_contain_text('eV')
        page.screenshot(path=str(out / 'live-offline-new-lesson.png'))
        context.set_offline(False)
        receipt['offlineNewLesson'] = True
        context.close()
        log(f'PASS intended live bytes, all {len(files)} precached files, cache upgrade and offline new lesson')
        for width in [390, 1440]:
            context = browser.new_context(viewport={'width': width, 'height': 844 if width < 600 else 1000}, is_mobile=width<600, has_touch=width<600, device_scale_factor=2 if width<600 else 1, reduced_motion='reduce')
            page = context.new_page(); monitor(page)
            page.goto(url, wait_until='networkidle', timeout=180000)
            for ident in ['cannon3d', 'eye3d', 'field3d', 'phases', 'ripple', 'skycolour', 'circuit']:
                fig = page.locator(f'figure[data-live="{ident}"]')
                page.evaluate('(id)=>location.hash=id', fig.get_attribute('id'))
                page.screenshot(path=str(out / f'{ident}-{width}-before.png'))
                opener = fig.locator('.live-open')
                opener.tap() if width<600 else opener.click()
                expect(fig.locator('.live-stage')).to_be_visible()
                expect(fig.locator('.live-stage canvas').first).to_be_visible()
                sliders = fig.locator('input[type=range]')
                if sliders.count(): sliders.first.focus(); sliders.first.press('End')
                play = fig.locator('.live-play')
                if play.count() and play.get_attribute('aria-pressed') == 'true': play.click()
                assert not re.search(r'NaN|undefined', fig.locator('.live-readout').inner_text())
                fig.screenshot(path=str(out / f'{ident}-{width}.png'))
                fig.get_by_role('button', name='Back to the drawing', exact=True).click()
                receipt['cases'].append({'id': ident, 'width': width, 'passed': True})
            for mount in page.locator('.explore-mount[data-chunk]').all():
                name = mount.get_attribute('data-mount')
                sec = mount.evaluate("e=>e.closest('section').id")
                page.evaluate('(id)=>location.hash=id', sec)
                page.screenshot(path=str(out / f'explorer-{name}-{width}-before.png'))
                mount.locator('.explore-open').click()
                expect(mount.locator('.explore-stage')).to_be_visible()
                assert mount.locator('.explore-stage').evaluate('e=>e.children.length>0')
                mount.screenshot(path=str(out / f'explorer-{name}-{width}.png'))
                receipt['cases'].append({'id': f'explorer-{name}', 'width': width, 'passed': True})
            context.close()
            log(f'PASS retained original Three/raw/circuit demonstrations and explorers at {width}px')
        browser.close()
        assert not receipt['errors'], receipt['errors']
        receipt['passed'] = True
finally:
    receipt['finished'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    (out / 'receipt.json').write_text(json.dumps(receipt, indent=2))
