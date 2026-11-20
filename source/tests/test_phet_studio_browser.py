#!/usr/bin/env python3
"""End-to-end Playwright verification of the PhET-inspired Simulation Studio, LiveIO,
drafting craft, Pedagogical Honesty gate, 3D PNG capture, cold preset URL hydration,
and mobile 390x844 responsive layout."""
import base64
import functools
import http.server
import os
import shutil
import struct
import subprocess
import threading
import zlib

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE_DIR = os.path.join(ROOT_DIR, 'source', 'build', 'site')
SHOT_DIR = os.path.join(ROOT_DIR, 'source', 'build', 'phet-studio-checks')
VENV_PYTHON = os.path.join(ROOT_DIR, '.venv', 'bin', 'python')


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class LocalSiteServer(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True
    allow_reuse_address = True


def assert_valid_nonblank_png(data_url: str, label: str):
    assert isinstance(data_url, str) and data_url.startswith('data:image/png;base64,'), (
        f'{label}: expected PNG data URL, got {str(data_url)[:80]}'
    )
    raw = base64.b64decode(data_url.split(',', 1)[1])
    assert raw[:8] == b'\x89PNG\r\n\x1a\n', f'{label}: invalid PNG header'
    assert len(raw) > 1000, f'{label}: PNG suspiciously tiny ({len(raw)} bytes)'

    pos = 8
    width = height = 0
    idat_parts = []
    while pos + 8 <= len(raw):
        length, ctype = struct.unpack('>I4s', raw[pos:pos + 8])
        chunk_data = raw[pos + 8:pos + 8 + length]
        if ctype == b'IHDR' and len(chunk_data) >= 8:
            width, height = struct.unpack('>II', chunk_data[:8])
        elif ctype == b'IDAT':
            idat_parts.append(chunk_data)
        pos += 12 + length
        if ctype == b'IEND':
            break

    assert width > 0 and height > 0, f'{label}: missing IHDR dimensions'
    pixels = zlib.decompress(b''.join(idat_parts))
    unique_bytes = len(set(pixels[:min(len(pixels), 24000)]))
    assert unique_bytes > 5, f'{label}: decoded PNG appears blank/uniform ({unique_bytes} distinct bytes)'


def screenshot_clear(page, fig, path):
    page.evaluate("""() => {
      document.querySelectorAll('.tb, header, nav, .progress, #progress, .bar, [role="progressbar"]').forEach((el) => { el.style.visibility = 'hidden'; });
    }""")
    fig.evaluate("el => { const r = el.getBoundingClientRect(); window.scrollBy(0, r.top - 24); }")
    fig.screenshot(path=path)
    page.evaluate("""() => {
      document.querySelectorAll('.tb, header, nav, .progress, #progress, .bar, [role="progressbar"]').forEach((el) => { el.style.visibility = ''; });
    }""")


def open_widget(page, widget_name: str):
    fig_id = page.evaluate(f"""() => {{
      const f = document.querySelector('figure[data-live="{widget_name}"]');
      return f ? f.id : null;
    }}""")
    assert fig_id, f'No figure found for data-live="{widget_name}"'
    page.evaluate(f"location.hash = '#{fig_id}'")
    fig = page.locator(f'#{fig_id}')
    fig.wait_for(state='visible', timeout=10000)
    fig.scroll_into_view_if_needed()
    fig.locator('.live-open').click()
    fig.locator('.live-studio-bar').wait_for(state='visible', timeout=10000)
    fig.locator('canvas').first.wait_for(state='visible', timeout=10000)
    return fig


def main():
    from playwright.sync_api import sync_playwright

    assert os.path.exists(os.path.join(SITE_DIR, 'index.html')), f'Missing built site at {SITE_DIR}'
    os.makedirs(SHOT_DIR, exist_ok=True)

    server = LocalSiteServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=SITE_DIR))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base_url = f'http://127.0.0.1:{server.server_address[1]}/index.html'

    with sync_playwright() as p:
        browser = p.chromium.launch(args=[
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--ignore-gpu-blocklist',
        ])
        context = browser.new_context(viewport={'width': 1440, 'height': 900}, service_workers='block')
        context.add_init_script("""
            (() => {
              window.__acCreated = 0;
              for (const k of ['AudioContext', 'webkitAudioContext']) {
                const Orig = window[k];
                if (!Orig) continue;
                window[k] = function(...args) {
                  window.__acCreated++;
                  return new Orig(...args);
                };
                window[k].prototype = Orig.prototype;
              }
            })();
        """)
        page = context.new_page()
        errors = []
        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}')
                if m.type == 'error' and 'GL Driver Message' not in m.text else None)
        page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))

        page.goto(base_url, wait_until='load')

        # 1. w_forces: transport, steppers, prefs, keys modal, LiveIO presets, honesty gate, mobile 390x844
        fig_forces = open_widget(page, 'forces')
        assert page.evaluate('window.__acCreated') == 0, 'AudioContext must not initialize before opt-in sonify'

        # P3: Paused canvas + readout redraw immediately when sliders/tabs change without pressing Play
        png_before_pause_edit = fig_forces.locator('canvas').first.evaluate('c => c.toDataURL("image/png")')
        st_before_pause = page.evaluate("window.LiveIO.getState('forces')")
        fig_forces.locator('.live-tabs button.live-ctl', has_text='Rough floor').click()
        fig_forces.locator('button[aria-label="Increase Pull to the right"]').click()
        png_after_pause_edit = fig_forces.locator('canvas').first.evaluate('c => c.toDataURL("image/png")')
        st_after_pause = page.evaluate("window.LiveIO.getState('forces')")
        assert png_after_pause_edit != png_before_pause_edit, 'Paused canvas must redraw immediately on control input (P3)'
        assert st_after_pause['readout'] != st_before_pause['readout'], 'Paused readout must update immediately (P3)'
        fig_forces.locator('button.live-studio-pill', has_text='Reset').click()

        # Steppers (- / +)
        pull_l_slider = fig_forces.locator('input[type="range"]').first
        v0 = float(pull_l_slider.input_value())
        fig_forces.locator('button[aria-label="Increase Pull to the left"]').click()
        assert float(pull_l_slider.input_value()) == v0 + 10.0, 'Stepper + did not increment Pull to the left'
        fig_forces.locator('button[aria-label="Decrease Pull to the left"]').click()
        assert float(pull_l_slider.input_value()) == v0, 'Stepper - did not decrement Pull to the left'

        # Open Play toggle
        open_play_btn = fig_forces.locator('button.live-studio-pill', has_text='Open Play')
        open_play_btn.click()
        assert 'live-openplay' in (fig_forces.get_attribute('class') or '')
        assert not fig_forces.locator('.live-challenge').is_visible()
        open_play_btn.click()
        assert fig_forces.locator('.live-challenge').is_visible()

        # Slow 1/4x, +1 Step, Replay, Reset
        slow_btn = fig_forces.locator('button.live-studio-pill', has_text='Slow')
        slow_btn.click()
        assert slow_btn.get_attribute('aria-pressed') == 'true'
        fig_forces.locator('button.live-studio-pill', has_text='+1 Step').click()
        slow_btn.click()
        assert slow_btn.get_attribute('aria-pressed') == 'false'
        fig_forces.locator('button.live-studio-pill', has_text='Replay').click()
        fig_forces.locator('button.live-studio-pill', has_text='Reset').click()

        # Prefs popover + switches (uses <button role="switch">, zero extra <input>)
        prefs_btn = fig_forces.locator('button.live-studio-pill', has_text='Prefs')
        prefs_btn.click()
        popover = fig_forces.locator('.live-studio-popover')
        assert popover.is_visible()
        sonify_sw = popover.locator('[data-pref-key="sonify"]')
        assert sonify_sw.count() == 1 and sonify_sw.get_attribute('aria-checked') == 'false', 'Sonify switch must start off (P11)'
        popover.locator('[data-pref-key="units"]').click()
        popover.locator('[data-pref-key="colorblind"]').click()
        popover.locator('[data-pref-key="highlights"]').click()
        assert page.locator('html').get_attribute('data-sim-cb') == '1'
        assert page.locator('html').get_attribute('data-sim-highlights') == '1'

        # Restore colorblind off after check; keep Prefs tested then open ? Keys modal for Esc + screenshot
        popover.locator('[data-pref-key="units"]').click()
        popover.locator('[data-pref-key="colorblind"]').click()
        popover.locator('[data-pref-key="highlights"]').click()
        assert page.locator('html').get_attribute('data-sim-cb') is None

        keys_btn = fig_forces.locator('button.live-studio-pill', has_text='Keys')
        keys_btn.click()
        keys_modal = fig_forces.locator('.live-keys-modal')
        assert keys_modal.is_visible()
        screenshot_clear(page, fig_forces, os.path.join(SHOT_DIR, 'studio-prefs-keys.png'))
        page.keyboard.press('Escape')
        assert not keys_modal.is_visible(), 'Esc must close Keyboard Shortcuts modal'

        # LiveIO preset + state + capturePNG
        page.evaluate("""async () => {
          await window.LiveIO.openPreset('forces', {
            tabs: [0],
            sliders: { 'Pull to the left': 200, 'Pull to the right': 200 },
            custom: { v: 4.0, x: 0, loadIdx: 0 }
          });
        }""")
        st_cruise = page.evaluate("window.LiveIO.getState('forces')")
        assert st_cruise['sliders']['Pull to the left'] == 200
        assert st_cruise['sliders']['Pull to the right'] == 200
        assert abs(st_cruise['custom']['v'] - 4.0) < 1e-6
        assert '4.0 m/s' in st_cruise['readout']

        # Also step a bit so beaker & velocity chevrons are active for desktop screenshot
        fig_forces.locator('button[aria-label="Increase Pull to the right"]').click()
        fig_forces.locator('button.live-studio-pill', has_text='+1 Step').click()
        screenshot_clear(page, fig_forces, os.path.join(SHOT_DIR, 'forces-desktop.png'))

        cap_forces = page.evaluate("window.LiveIO.capturePNG('forces')")
        assert_valid_nonblank_png(cap_forces['pngDataUrl'], 'w_forces')

        # Pedagogical Honesty: tour actor NEVER stamps; real user action DOES stamp
        fig_forces.locator('.live-watch-btn').click()
        fig_forces.locator('.live-watch-dot').nth(4).click()
        page.evaluate("""() => {
          window.LiveIO.setState('forces', {
            tabs: [1],
            sliders: { 'Pull to the left': 0, 'Pull to the right': 250 }
          }, { actor: 'tour' });
        }""")
        assert fig_forces.locator('.live-stamp.is-stamped').count() == 0, 'Honesty breach: tour must NOT award stamp'

        # Now drop Pull to the right to 240, then genuinely click + stepper as user -> reaches 250 N net pull
        page.evaluate("""() => {
          window.LiveIO.setState('forces', {
            tabs: [1],
            sliders: { 'Pull to the left': 0, 'Pull to the right': 240 }
          }, { actor: 'preset' });
        }""")
        assert fig_forces.locator('.live-stamp.is-stamped').count() == 0
        fig_forces.locator('button[aria-label="Increase Pull to the right"]').click()
        assert fig_forces.locator('.live-stamp.is-stamped').count() == 1, 'Genuine user win must award stamp'
        ev_log = page.evaluate("window.LiveIO.getEventLog('forces')")
        assert ev_log['processSummary']['watchTourUsed'] is True
        assert ev_log['processSummary']['totalUserActions'] >= 1

        # Mobile 390x844 overflow check + screenshot
        page.set_viewport_size({'width': 390, 'height': 844})
        fig_forces.scroll_into_view_if_needed()
        overflow = page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        assert not overflow, 'Horizontal overflow detected on mobile 390x844 in w_forces'
        screenshot_clear(page, fig_forces, os.path.join(SHOT_DIR, 'forces-mobile.png'))
        page.set_viewport_size({'width': 1440, 'height': 900})

        # Share URL captured before closing for cold ?preset= hydration check later
        page.evaluate("""() => {
          window.LiveIO.setState('forces', {
            tabs: [0],
            sliders: { 'Pull to the left': 120, 'Pull to the right': 370 }
          }, { actor: 'preset' });
        }""")
        share_url = page.evaluate("window.LiveIO.shareUrl('forces')")
        fig_forces.locator('.live-close').click()

        # 2. w_energytrack: primary sliders before PDOM mirrors, gravity tabs, Pie on bead, Drain warmth, light & dark
        fig_et = open_widget(page, 'energytrack')
        first_range_aria = fig_et.locator('input[type="range"]').first.evaluate(
            'el => el.closest("label, .live-slider")?.textContent || el.getAttribute("aria-label") || ""'
        )
        assert 'Friction' in first_range_aria, f'First range input must remain Friction, got: {first_range_aria}'
        assert fig_et.locator('.live-pdom-sr input[type="range"]').count() == 2

        fig_et.locator('.live-tabs button.live-ctl', has_text='Moon (1.6)').click()
        fig_et.locator('.live-tabs button.live-ctl', has_text='Jupiter (24.8)').click()
        fig_et.locator('.live-tabs button.live-ctl', has_text='Earth (9.8)').click()
        fig_et.locator('.live-tabs button.live-ctl', has_text='Pie on bead').click()
        for _ in range(6):
            fig_et.locator('button.live-studio-pill', has_text='+1 Step').click()

        screenshot_clear(page, fig_et, os.path.join(SHOT_DIR, 'energytrack-desktop.png'))

        # Friction + Drain warmth test
        page.evaluate("""() => {
          window.LiveIO.setState('energytrack', { sliders: { Friction: 0.1 } }, { actor: 'user' });
        }""")
        for _ in range(6):
            fig_et.locator('button.live-studio-pill', has_text='+1 Step').click()
        fig_et.locator('button.live-ctl', has_text='Drain warmth').click()

        # P10: PDOM focus-within reveal bbox + aria-valuetext (path probe + reference datum line)
        pdom_input = fig_et.locator('.live-pdom-sr input[type="range"]').first
        pdom_input.focus()
        pdom_box = fig_et.locator('.live-pdom-sr').first.bounding_box()
        assert pdom_box and pdom_box['width'] > 10 and pdom_box['height'] > 10, f'PDOM wrapper must expand on focus-within (P10), got {pdom_box}'
        pdom_input.evaluate('el => { el.value = "2"; el.dispatchEvent(new Event("input", { bubbles: true })); }')
        vtext = pdom_input.get_attribute('aria-valuetext') or ''
        assert len(vtext.strip()) > 8 and 'm/s' in vtext, f'Expected meaningful aria-valuetext on PDOM path probe (P10), got: {vtext}'
        ref_input = fig_et.locator('.live-pdom-sr input[type="range"]').nth(1)
        ref_input.evaluate('el => { el.value = "0.5"; el.dispatchEvent(new Event("input", { bubbles: true })); }')
        ref_vtext = ref_input.get_attribute('aria-valuetext') or ''
        assert '0.5' in ref_vtext, f'Expected 0.5 in reference datum aria-valuetext (P10), got: {ref_vtext}'

        # Dark theme screenshot
        page.evaluate("document.documentElement.setAttribute('data-theme', 'dark')")
        fig_et.locator('button.live-studio-pill', has_text='+1 Step').click()
        screenshot_clear(page, fig_et, os.path.join(SHOT_DIR, 'energytrack-dark.png'))
        page.evaluate("document.documentElement.removeAttribute('data-theme')")

        # P6: hRef > h negative peRel, Drain warmth zero clamp, Jupiter -> Moon thermal clamping
        page.evaluate("""() => {
          window.LiveIO.setState('energytrack', {
            tabs: [0, 0, 2],
            sliders: { 'Friction': 0.1, 'Release height': 0.5 },
            custom: { hRef: 1.0 }
          }, { actor: 'user' });
        }""")
        for _ in range(4):
            fig_et.locator('button.live-studio-pill', has_text='+1 Step').click()
        st_jup = page.evaluate("window.LiveIO.getState('energytrack')")
        assert st_jup['custom']['hRef'] == 1.0
        fig_et.locator('.live-tabs button.live-ctl', has_text='Moon (1.6)').click()
        st_moon = page.evaluate("window.LiveIO.getState('energytrack')")
        assert st_moon['custom']['thermalPerKg'] <= 1.6 * 0.5 + 1e-6, 'Moon gravity switch must clamp thermalPerKg (P6)'
        fig_et.locator('button.live-ctl', has_text='Drain warmth').click()
        st_drained = page.evaluate("window.LiveIO.getState('energytrack')")
        assert st_drained['custom']['thermalPerKg'] == 0, 'Drain warmth must reset thermal store cleanly (P6)'
        fig_et.locator('.live-close').click()

        # 3. w_seriesparallel & w_circuit: Lifelike <-> Schematic toggle + canvas tap LED 1 + open gap probe (P12)
        fig_sp = open_widget(page, 'seriesparallel')
        fig_sp.locator('button.live-ctl', has_text='Schematic view').click()
        cv = fig_sp.locator('canvas').first
        cv.scroll_into_view_if_needed()
        box = cv.bounding_box()
        assert box is not None
        page.mouse.click(box['x'] + box['width'] * (320.0 / 640.0), box['y'] + box['height'] * (92.0 / 360.0))
        reclip_btn = fig_sp.locator('button.live-ctl', has_text='Reclip LED 1')
        assert reclip_btn.count() == 1, 'Canvas tap on LED 1 must unclip LED 1'
        fig_sp.locator('.live-tabs button.live-ctl', has_text='Parallel').click()
        sp_pdom = fig_sp.locator('.live-pdom-sr input[type="range"]').first
        sp_pdom.evaluate('el => { el.value = "2"; el.dispatchEvent(new Event("input", { bubbles: true })); }')
        assert '9.0 V across open gap' in (sp_pdom.get_attribute('aria-valuetext') or ''), 'Open Branch 1 probe must report 9.0 V across open gap (P12)'
        screenshot_clear(page, fig_sp, os.path.join(SHOT_DIR, 'circuits-schematic.png'))
        fig_sp.locator('.live-close').click()

        fig_circ = open_widget(page, 'circuit')
        fig_circ.locator('button.live-ctl', has_text='Schematic view').click()
        fig_circ.locator('button.live-ctl', has_text='Open switch').click()
        st_circ_open = page.evaluate("window.LiveIO.getState('circuit')")
        assert st_circ_open['custom']['switchOpen'] is True and '0.0 mA' in st_circ_open['readout'], 'Opening circuit switch must stop current (P12)'
        fig_circ.locator('button.live-studio-pill', has_text='+1 Step').click()
        fig_circ.locator('.live-close').click()

        # P4: w_shadow honest Reset check (preset moves outside winning zone, then Reset back to 5000/7.2 must NOT award stamp)
        fig_sh = open_widget(page, 'shadow')
        page.evaluate("""() => {
          window.LiveIO.setState('shadow', { sliders: { 'Distance between sticks': 6500 } }, { actor: 'preset' });
        }""")
        assert fig_sh.locator('.live-stamp.is-stamped').count() == 0
        fig_sh.locator('button.live-studio-pill', has_text='Reset').click()
        st_sh = page.evaluate("window.LiveIO.getState('shadow')")
        assert st_sh['sliders']['Distance between sticks'] == 5000
        assert fig_sh.locator('.live-stamp.is-stamped').count() == 0, 'Reset on winning default w_shadow must NOT award a stamp (P4)'
        sh_log = page.evaluate("window.LiveIO.getEventLog('shadow')")
        assert all(ev.get('control') != 'Reset' or ev.get('actor') == 'reset' for ev in sh_log['events']), 'Reset event must record actor=reset'
        fig_sh.locator('.live-close').click()

        # 3b. w_buoyancy: Density PhET-iO parity (Mystery ? block + direct drag + Reveal ? + screenshot)
        fig_buoy = open_widget(page, 'buoyancy')
        fig_buoy.locator('button.live-ctl', has_text='Mystery ? block').click()
        st_mys0 = page.evaluate("window.LiveIO.getState('buoyancy')")
        assert st_mys0['custom']['mysteryMode'] is True
        bcv = fig_buoy.locator('canvas').first
        bcv.scroll_into_view_if_needed()
        bbox = bcv.bounding_box()
        assert bbox is not None
        bx = bbox['x'] + bbox['width'] * (197.0 / 640.0)
        by = bbox['y'] + bbox['height'] * (120.0 / 380.0)
        page.mouse.move(bx, by)
        page.mouse.down()
        page.mouse.move(bx, by + bbox['height'] * (65.0 / 380.0), steps=5)
        page.mouse.up()
        st_drag = page.evaluate("window.LiveIO.getState('buoyancy')")
        assert st_drag['custom']['subPos'] > st_mys0['custom']['subPos'], 'Dragging buoyancy block downward must submerge it further'
        fig_buoy.locator('button.live-ctl', has_text='Reveal ? density').click()
        assert fig_buoy.locator('button.live-ctl', has_text='650 kg/m³').count() == 1, 'Reveal ? density must display 650 kg/m³'
        screenshot_clear(page, fig_buoy, os.path.join(SHOT_DIR, 'buoyancy-desktop.png'))
        fig_buoy.locator('.live-close').click()

        # 4. atlas_ch07: 3D steppers + LiveIO + capturePNG test (P5)
        fig_a7 = open_widget(page, 'atlas_ch07')
        assert fig_a7.locator('.live-step-btn').count() >= 2, 'Atlas 3D widget must expose unified steppers (P5)'
        st_a7 = page.evaluate("window.LiveIO.getState('atlas_ch07')")
        assert len(st_a7['sliders']) >= 1 and len(st_a7['tabs']) >= 1, f'Atlas LiveIO state must expose normalized sliders and tabs (P5), got {st_a7}'
        page.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
        cap_a7 = page.evaluate("window.LiveIO.capturePNG('atlas_ch07')")
        assert_valid_nonblank_png(cap_a7['pngDataUrl'], 'atlas_ch07')
        fig_a7.locator('.live-close').click()

        assert page.evaluate('window.__acCreated') == 0, 'No AudioContext may be created when sonify stays off'

        # P11: Opt-in Sonify switch turns on in Prefs and strictly resets OFF on reload
        fig_f2 = open_widget(page, 'forces')
        fig_f2.locator('button.live-studio-pill', has_text='Prefs').click()
        sw2 = fig_f2.locator('.live-studio-popover [data-pref-key="sonify"]')
        sw2.click()
        assert sw2.get_attribute('aria-checked') == 'true'
        fig_f2.locator('.live-close').click()

        # 5. Cold ?preset= URL hydration + P11 Sonify reload check in fresh context
        ctx2 = browser.new_context(viewport={'width': 1440, 'height': 900}, service_workers='block')
        page2 = ctx2.new_page()
        page2.on('console', lambda m: errors.append(f'cold.console.{m.type}: {m.text}')
                 if m.type == 'error' and 'GL Driver Message' not in m.text else None)
        page2.on('pageerror', lambda e: errors.append(f'cold.pageerror: {e}'))
        page2.goto(share_url, wait_until='load')
        hydrated_fig = page2.locator('figure[data-live="forces"].live-on').first
        hydrated_fig.wait_for(state='visible', timeout=10000)
        page2.wait_for_function("() => window.LiveIO && window.LiveIO.getState('forces')?.sliders?.['Pull to the right'] === 370", timeout=10000)
        hydrated_state = page2.evaluate("window.LiveIO.getState('forces')")
        assert hydrated_state['sliders']['Pull to the left'] == 120
        assert hydrated_state['sliders']['Pull to the right'] == 370
        hydrated_fig.locator('button.live-studio-pill', has_text='Prefs').click()
        assert hydrated_fig.locator('.live-studio-popover [data-pref-key="sonify"]').get_attribute('aria-checked') == 'false', 'Sonify must reset OFF after reload (P11)'
        ctx2.close()

        assert not errors, 'Browser console/page errors:\n' + '\n'.join(errors)
        browser.close()

    server.shutdown()
    print('PASS test_phet_studio_browser: desktop + mobile + LiveIO + honesty + 3D capturePNG + cold ?preset= hydration')


def test_phet_studio_browser_e2e():
    try:
        import playwright.sync_api  # noqa: F401
        main()
    except ImportError:
        env = dict(os.environ)
        node_bin = env.get('PLAYWRIGHT_NODEJS_PATH') or shutil.which('node')
        if node_bin:
            env['PLAYWRIGHT_NODEJS_PATH'] = node_bin
        subprocess.run([VENV_PYTHON, __file__], env=env, check=True)


if __name__ == '__main__':
    main()
