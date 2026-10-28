#!/usr/bin/env python3
"""Regressions for accessible controls, persistent insets and no-WebGL phase art.

Build the book first; optionally pass --site source/build/live-waves-site.
Uses the repository's existing Playwright installation and a local HTTP server.
"""
import argparse
import functools
import http.server
import math
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--site', default='source/build/site')
args = parser.parse_args()

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_address[1]}'
url = base + '/' + args.site.strip('/') + '/'
errors = []

# Construction of audio/sensor resources is forbidden until an explicit press.
MONITOR = """window.resourceStarts={audio:0,mic:0,magnetometer:0};
if(window.AudioContext)window.AudioContext=new Proxy(window.AudioContext,{construct(t,a){resourceStarts.audio++;return Reflect.construct(t,a);}});
if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>{resourceStarts.mic++;return Promise.reject(Error('Unexpected microphone request'));};
window.Magnetometer=class{constructor(){resourceStarts.magnetometer++;throw Error('Unexpected sensor request');}};"""
FALLBACK = """const originalGetContext=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:originalGetContext.call(this,t,...a);};"""

def open_widget(page, name):
    figure = page.locator(f'figure[data-live="{name}"]').first
    fid = figure.get_attribute('id')
    page.evaluate('(id)=>location.hash=id', fid)
    page.wait_for_timeout(60)
    figure.locator('.live-open').click()
    expect(figure.locator('.live-stage')).to_be_visible()
    page.wait_for_timeout(120)
    return figure

def painted(canvas):
    # Distinguishes a drawn explanatory inset from a ResizeObserver-cleared canvas.
    return canvas.evaluate("""cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    let changed=0;for(let i=0;i<d.length;i+=16)if(d[i+3]&&Math.abs(d[i]-d[0])+Math.abs(d[i+1]-d[1])+Math.abs(d[i+2]-d[2])>45)changed++;return changed>20;}""")

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width':390,'height':900}, reduced_motion='reduce')
        page.add_init_script(MONITOR)
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url)
        colour = open_widget(page, 'colourmix')
        colour.get_by_role('button', name='An object under this light', exact=True).click()
        select = colour.get_by_label('Object under coloured light')
        select.select_option('3')
        expect(select).to_have_value('3')
        harmonics = open_widget(page, 'harmonics')
        harmonics.get_by_text('Edit one partial at a time', exact=True).click()
        partial = harmonics.get_by_label('Partial 3 amplitude', exact=True)
        partial.focus()
        partial.press('Home')
        partial.press('ArrowRight')
        expect(partial).to_have_value('0.01')
        mirror = open_widget(page, 'mirror')
        canvas = mirror.locator('.live-stage canvas').first
        canvas.focus()
        canvas.press('ArrowDown')
        expect(canvas).to_be_focused()
        for name in ('scope','doppler','induction','magnetometer'):
            open_widget(page, name)
        assert page.evaluate('JSON.stringify(resourceStarts)') == '{"audio":0,"mic":0,"magnetometer":0}'
        print('PASS native object / partial / mirror keyboard controls; no audio or sensor activation')
        page.close()

        for fallback in (False, True):
            page = browser.new_page(viewport={'width':390,'height':900}, reduced_motion='reduce')
            if fallback:
                page.add_init_script(FALLBACK)
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(url)
            for name, label in [('eye3d','Stable eye cross-section'),('field3d','Fixed perpendicular wire cross-section'),('phases','Linked overhead lunar orbit')]:
                figure = open_widget(page,name)
                inset = figure.locator(f'canvas[aria-label^="{label}"]')
                assert inset.count() == 1, (name, 'missing inset')
                assert painted(inset), (name, 'empty initial inset')
                # Changing full-size/fitted dimensions clears canvas backing stores.
                detail = figure.get_by_role('button',name='Full-size drawing',exact=True)
                if detail.count():
                    detail.click()
                    page.wait_for_timeout(100)
                    assert painted(inset), (name,'empty inset after resizing')
                    figure.get_by_role('button',name='Fit drawing',exact=True).click()
                figure.locator('input[type=range]').first.focus()
                figure.locator('input[type=range]').first.press('Home')
                page.wait_for_timeout(60)
                assert painted(inset), (name,'empty changed-state inset')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            print('PASS stable optical/field/phase insets', 'without WebGL' if fallback else 'with WebGL')
            # Independent pixel area oracle: projected lit fraction is geometric.
            fractions = page.evaluate("""async()=>{const{phaseDisc}=await import('/source/live/art_waves.js');
            const cv=document.createElement('canvas');cv.width=cv.height=220;const ctx=cv.getContext('2d');
            return [0,Math.PI/3,Math.PI/2,Math.PI,3*Math.PI/2,5*Math.PI/3].map(a=>{
              ctx.clearRect(0,0,220,220);phaseDisc(ctx,110,110,100,a,'#ffffff','#000000');
              const d=ctx.getImageData(0,0,220,220).data;let lit=0,total=0;
              for(let y=12;y<208;y++)for(let x=12;x<208;x++)if((x-110)**2+(y-110)**2<98**2){total++;if(d[(y*220+x)*4]>127)lit++;}
              return[a,lit/total];});}""")
            for angle, fraction in fractions:
                assert abs(fraction-(1-math.cos(angle))/2)<.015,(angle,fraction)
            page.close()
        print('PASS independent phase-mask pixel area: new, crescent, quarter, full and waning')
        browser.close()
    assert not errors, errors
finally:
    server.shutdown()
