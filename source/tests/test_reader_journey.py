"""A small, ungraded first visit, readable optional depth, and discoverable experiments.

Run against the build by default, or pass --url for the same public journey live.
"""
import argparse
import functools
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--url')
parser.add_argument('--out', default='build/reader-journey')
args = parser.parse_args()
out = ROOT / args.out
out.mkdir(parents=True, exist_ok=True)
server = None
if args.url:
    url = args.url.rstrip('/') + '/'
else:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_): pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT/'build/site')))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/'
receipt = {'url': url, 'checks': [], 'layouts': [], 'errors': []}

def settled(page):
    page.wait_for_function('!document.getAnimations().some(a => a.playState === "running" && a.effect?.getTiming().iterations !== Infinity)')

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        page = context.new_page()
        page.on('pageerror', lambda e: receipt['errors'].append(str(e)))
        page.goto(url, wait_until='networkidle')
        expect(page.get_by_role('heading', name='The Moving World', exact=True)).to_be_visible()
        expect(page.get_by_role('heading', name='A letter to Kym', exact=True)).not_to_be_visible()
        expect(page.locator('.cover-chapters')).not_to_have_attribute('open', '')
        page.get_by_role('button', name='Reading settings: text size and colours', exact=True).click()
        expect(page.get_by_role('button', name='Paper & stamp sounds', exact=True)).to_have_attribute('aria-pressed', 'false')
        page.keyboard.press('Escape')
        page.get_by_role('link', name='A letter to you, from Amar', exact=True).click()
        expect(page.get_by_role('heading', name='A letter to Kym', exact=True)).to_be_visible()
        expect(page.get_by_role('heading', name='How this book works', exact=True)).not_to_be_visible()
        page.go_back()
        page.get_by_role('link', name='Try a quick puzzle', exact=True).click()
        expect(page.get_by_role('heading', name='Investigate everyday things', exact=True)).to_be_visible()
        page.get_by_label('Choose an everyday object', exact=True).select_option('A spinning top')
        page.get_by_label('Time for the longer activity', exact=True).select_option('10')
        expect(page.locator('#investigation-count')).to_contain_text('No activities match')
        page.get_by_role('button', name='Show every investigation', exact=True).click()
        expect(page.locator('#investigation-count')).to_contain_text('17 investigations')
        page.get_by_role('link', name='Try the bouncing-ball puzzle', exact=True).click()
        title = page.get_by_role('heading', name='Measure what a bounce returns', exact=True)
        expect(title).to_be_visible()
        settled(page)
        assert title.bounding_box()['y'] >= 0, 'The first puzzle must open at its title and question'
        expect(page.locator('.inv-long')).not_to_have_attribute('open', '')
        expect(page.locator('.inv-theory')).not_to_have_attribute('open', '')
        page.screenshot(path=str(out/'first-puzzle-mobile.png'))
        page.get_by_role('link', name='← Everyday investigations', exact=True).click()
        expect(page.get_by_role('heading', name='Investigate everyday things', exact=True)).to_be_visible()
        receipt['checks'].append('fresh visit, quiet default, separate letter, starter, filter recovery, title alignment, optional work, return')

        page.goto(url+'#s4-1', wait_until='networkidle')
        pred = page.locator('#pred-4-1')
        expect(pred.locator('.pred-reveal')).not_to_be_visible()
        pred.locator('.pred-opt').first.click()
        expect(pred.locator('.pred-reveal')).not_to_be_visible()
        pred.get_by_role('button', name='WHY? See what happens', exact=True).click()
        expect(pred.locator('.pred-reveal')).to_be_visible()
        page.reload(wait_until='networkidle')
        expect(pred.locator('.pred-reveal')).to_be_visible()
        pred.get_by_role('button', name='Fold flap & change my prediction', exact=True).click()
        expect(pred.locator('.pred-reveal')).not_to_be_visible()
        expect(pred.locator('.pred-opt').first).to_be_focused()
        receipt['checks'].append('prediction stays hidden after choice, explicit reveal, persisted reveal, change guess and keyboard focus')

        review = page.locator('#ch4 .box.five').first
        expect(review).not_to_have_attribute('open', '')
        review.locator(':scope > summary').click()
        expect(review.locator('.fqs').first).to_be_visible()
        check = review.locator('.five-turn')
        anchor = check.get_attribute('id')
        review.locator(':scope > summary').click()
        page.goto(url+'#'+anchor)
        expect(check.get_by_label('Your answer', exact=True)).to_be_visible()
        page.get_by_role('button', name='Search the book (⌘K or /)', exact=True).click()
        page.get_by_role('combobox', name='Search the book', exact=True).fill('Measure what a bounce returns')
        page.get_by_role('option').filter(has_text='Try an experiment').first.click()
        expect(page.locator('figure[data-active-lesson="j-bounce"] .lab-title')).to_have_text('Measure what a bounce returns')
        receipt['checks'].append('optional review, deep link unfolds review, search opens experiment')

        for width in [390, 820, 1024, 1180, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            for theme in ['light', 'sepia', 'dark']:
                # Use the app's settings boundary to preserve its persisted theme behavior.
                page.get_by_role('button', name='Reading settings: text size and colours', exact=True).click()
                page.locator('#settings-pop').get_by_role('button', name=theme.capitalize(), exact=True).click()
                page.keyboard.press('Escape')
                page.goto(url+'#top')
                settled(page)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width, theme, 'cover overflow')
                expect(page.get_by_role('link', name='Try a quick puzzle', exact=True)).to_be_visible()
                page.screenshot(path=str(out/f'cover-{width}-{theme}.png'))
                page.get_by_role('link', name='Try a quick puzzle', exact=True).click()
                settled(page)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width, theme, 'directory overflow')
                page.screenshot(path=str(out/f'directory-{width}-{theme}.png'))
                receipt['layouts'].append({'width': width, 'theme': theme, 'surfaces': ['cover', 'directory']})
        assert not receipt['errors'], receipt['errors']
        browser.close()
    receipt['result'] = 'PASS'
    print('PASS reader journey, explicit prediction reveal, deep links, search, five widths and three themes')
finally:
    (out/'receipt.json').write_text(json.dumps(receipt, indent=2))
    if server:
        server.shutdown()
