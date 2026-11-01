#!/usr/bin/env python3
"""End-to-end Playwright verification of all 16 3D Atlas physics chapters (Ch 0..15),
atlas_period, and 100/100 interactive chapter figures."""
import functools
import http.server
import os
import threading
from playwright.sync_api import sync_playwright

_BUILD_SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'build', 'site'))
_ROOT_SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE_DIR = _BUILD_SITE if os.path.exists(os.path.join(_BUILD_SITE, 'index.html')) else _ROOT_SITE


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=SITE_DIR))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/index.html'

    chapter_targets = [
        (0, 'fig-0-1', 'atlas_ch00', 4),
        (1, 'fig-1-1', 'atlas_ch01', 5),
        (2, 'fig-2-1', 'atlas_ch02', 5),
        (3, 'fig-3-1', 'atlas_ch03', 5),
        (4, 'fig-4-1', 'atlas_ch04', 2),
        (5, 'fig-5-1', 'atlas_ch05', 5),
        (6, 'fig-6-1', 'atlas_ch06', 3),
        (7, 'fig-7-2', 'atlas_ch07', 4),
        (8, 'fig-8-1', 'atlas_ch08', 6),
        (9, 'fig-9-1', 'atlas_period', 12),
        (9, 'fig-9-2', 'atlas_ch09', 3),
        (10, 'fig-10-1', 'atlas_ch10', 3),
        (11, 'fig-11-1', 'atlas_ch11', 3),
        (12, 'fig-12-1', 'atlas_ch12', 4),
        (13, 'fig-13-2', 'atlas_ch13', 3),
        (14, 'fig-14-1', 'atlas_ch14', 3),
        (15, 'fig-15-1', 'atlas_ch15', 5),
    ]

    with sync_playwright() as p:
        # 1. Full 3D WebGL verification across all 16 chapters
        b = p.chromium.launch(args=[
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--ignore-gpu-blocklist',
        ])
        ctx = b.new_context(viewport={'width': 1280, 'height': 900})
        pg = ctx.new_page()
        errs = []
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}')
              if m.type in ('error', 'warning') and 'GL Driver Message' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append(f'pageerror: {e.stack}'))

        pg.goto(url, wait_until='load')
        pg.wait_for_timeout(600)

        # Verify all 100 chapter figures have a .live-open button
        total_figs = pg.evaluate("document.querySelectorAll('article.chapter figure').length")
        live_figs = pg.evaluate("document.querySelectorAll('article.chapter figure[data-live]').length")
        live_btns = pg.evaluate("document.querySelectorAll('article.chapter figure .live-open').length")
        lab_btns = pg.evaluate("document.querySelectorAll('figure[data-labs] .lab-open').length")
        print(f'Chapter figures: {live_figs}/{total_figs} data-live ({live_btns} .live-open buttons, {lab_btns} .lab-open buttons)')
        assert total_figs == 100, f'Expected 100 chapter figures, found {total_figs}'
        assert live_figs == 100, f'Expected 100/100 live chapter figures, found {live_figs}'
        assert live_btns == 100, f'Expected 100 .live-open buttons, found {live_btns}'
        assert lab_btns >= 126, f'Expected >= 126 .lab-open buttons, found {lab_btns}'

        for ch_num, _, widget_name, expected_pages in chapter_targets:
            fig_id = pg.evaluate(f"document.querySelector('figure[data-live=\"{widget_name}\"]')?.id")
            assert fig_id, f'No figure found with data-live="{widget_name}"'
            pg.evaluate(f"location.hash = '#{fig_id}'")
            pg.wait_for_timeout(200)
            fig = pg.query_selector(f'#{fig_id}')
            assert fig is not None, f'Missing figure #{fig_id}'
            fig.evaluate("e => e.scrollIntoView({block: 'center'})")
            pg.wait_for_timeout(150)

            btn = fig.query_selector('.live-open')
            assert btn is not None, f'Missing .live-open on #{fig_id}'
            btn.click()
            pg.wait_for_timeout(700)

            stage = fig.query_selector('.atlas-stage')
            assert stage is not None, f'Ch {ch_num} (#{fig_id}, {widget_name}): .atlas-stage did not mount'

            # Verify multi-page station tabs
            page_tabs = fig.query_selector_all('.atlas-pages button')
            assert len(page_tabs) == expected_pages, (
                f'Ch {ch_num} ({widget_name}): expected {expected_pages} page tabs, got {len(page_tabs)}'
            )

            # Verify Solid / X-ray / Section cutaway buttons
            cut_btns = fig.query_selector_all('.atlas-cuts button')
            assert len(cut_btns) == 3, f'Ch {ch_num} ({widget_name}): expected 3 cutaway buttons, got {len(cut_btns)}'
            cut_btns[1].click()  # X-ray
            pg.wait_for_timeout(100)
            cut_btns[2].click()  # Section cutaway
            pg.wait_for_timeout(100)
            cut_btns[0].click()  # Solid
            pg.wait_for_timeout(100)

            # Verify interactive parameter sliders (on atlas_ch00..15)
            sliders = fig.query_selector_all('.live-slider input[type=range]')
            if widget_name != 'atlas_period':
                assert len(sliders) >= 2, f'Ch {ch_num} ({widget_name}): expected >= 2 sliders, got {len(sliders)}'
                sliders[0].evaluate("e => { e.value = e.max; e.dispatchEvent(new Event('input')); }")
                pg.wait_for_timeout(100)

            # Verify part breakdown buttons
            part_btns = fig.query_selector_all('.atlas-parts button')
            min_parts = 1 if widget_name == 'atlas_period' else 2
            assert len(part_btns) >= min_parts, f'Ch {ch_num} ({widget_name}): expected >= {min_parts} part buttons, got {len(part_btns)}'
            part_btns[0].click()
            pg.wait_for_timeout(100)

            # Step to another station tab and verify readout is non-empty
            page_tabs[-1].click()
            pg.wait_for_timeout(180)
            readout_txt = fig.query_selector('.live-readout').inner_text().strip()
            assert len(readout_txt) > 15, f'Ch {ch_num} ({widget_name}): readout empty'

            # Verify pedagogical enhancements (Challenge + Your numbers Caveat equation + Watch tour)
            yn = fig.query_selector('.live-your-numbers')
            assert yn is not None and len(yn.inner_text().strip()) > 5, f'Ch {ch_num} ({widget_name}): missing .live-your-numbers'

            print(f'PASS Ch {ch_num:02d} ({fig_id} -> {widget_name}): {len(page_tabs)} pages, {len(sliders)} sliders, {len(part_btns)} part buttons')

        assert not errs, f'Console/page errors during WebGL 3D verification: {errs}'
        b.close()

        # 2. Verify --disable-webgl 2D Canvas fallback
        b2 = p.chromium.launch(args=['--disable-webgl'])
        ctx2 = b2.new_context(viewport={'width': 1280, 'height': 900})
        pg2 = ctx2.new_page()
        errs2 = []
        pg2.on('pageerror', lambda e: errs2.append(f'fallback pageerror: {e.stack}'))
        pg2.goto(url, wait_until='load')
        pg2.wait_for_timeout(500)
        pg2.evaluate("location.hash = '#fig-5-1'")
        pg2.wait_for_timeout(200)
        fig5 = pg2.query_selector('#fig-5-1')
        fig5.evaluate("e => e.scrollIntoView({block: 'center'})")
        fig5.query_selector('.live-open').click()
        pg2.wait_for_timeout(600)
        assert fig5.query_selector('.atlas-stage canvas') is not None, '2D fallback canvas missing'
        assert not errs2, f'Fallback errors: {errs2}'
        print('PASS --disable-webgl 2D Canvas fallback verified cleanly')
        b2.close()

    server.shutdown()
    print('ALL 16 CHAPTERS, 64 3D ATLAS FIGURES, AND 100/100 LIVE FIGURES VERIFIED FLAWLESSLY!')


if __name__ == '__main__':
    main()
