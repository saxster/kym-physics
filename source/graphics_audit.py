#!/usr/bin/env python3
"""Render every registered textbook figure for repeatable editorial review.

../.venv/bin/python graphics_audit.py --out build/graphics-review/before
The HTML atlas is searchable and theme-switchable. PNG sheets are grouped by source
module; metrics use the browser's real SVG text bounds, rather than text-length guesses.
"""
from pathlib import Path
import argparse
import html
import importlib
import json
import re
from playwright.sync_api import sync_playwright
from figs_core import FIGS, DEFS

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT / 'build/graphics-review/current')
    parser.add_argument('--shots', action='store_true')
    args = parser.parse_args()
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    for module in sorted(ROOT.glob('figs_*.py')):
        if module.stem != 'figs_core':
            importlib.import_module(module.stem)
    groups = {}
    inventory = []
    for name, fn in FIGS.items():
        svg = fn()
        module = fn.__module__
        inventory.append({'name': name, 'module': module, 'svg_bytes': len(svg.encode()),
                          'labels': re.findall(r'<text\b[^>]*>(.*?)</text>', svg)})
        groups.setdefault(module, []).append((name, svg))
    css = (ROOT / 'book.css').read_text()
    for family, weight, filename in [('Lexend', 400, 'Lexend-400.ttf'), ('Lexend', 700, 'Lexend-600.ttf'),
                                      ('Literata', 400, 'Literata-400.ttf')]:
        css += f'\n@font-face{{font-family:{family};font-weight:{weight};src:url("{(ROOT / "fonts" / filename).as_uri()}")}}'
    review_css = '''
    body {padding:24px;background:var(--paper);font:15px system-ui;color:var(--ink)}
    main {max-width:2000px;margin:auto} header{margin-bottom:24px}
    nav {display:flex;gap:12px;position:sticky;top:0;background:var(--paper);padding:12px;z-index:2}
    button,input {font:inherit;padding:8px} .sheet{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-bottom:50px}
    .sheet h2{grid-column:1/-1;font:22px Georgia;margin:18px 0 0}
    article{padding:16px;border:1px solid var(--rule);background:var(--sheet);min-width:0}
    h3{font:13px system-ui;color:var(--muted);margin:0 0 10px} .frame{min-height:210px;display:flex;align-items:center}
    svg.fig{display:block;width:100%;height:auto} article[hidden]{display:none}
    @media(max-width:760px){.sheet{grid-template-columns:1fr}body{padding:8px}article{padding:10px}.frame{min-height:0}}
    '''
    body = []
    for module, items in groups.items():
        body.append(f'<section class="sheet vol-{1 if "ch0" in module else 4}" id="{module}"><h2>{module}</h2>')
        for name, svg in items:
            body.append(f'<article id="{name}"><h3>{name}</h3><div class="frame">{svg}</div></article>')
        body.append('</section>')
    script = '''document.querySelectorAll('[data-theme-choice]').forEach(b=>b.onclick=()=>document.documentElement.dataset.theme=b.dataset.themeChoice);
    document.querySelector('input').oninput=e=>document.querySelectorAll('article').forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(e.target.value.toLowerCase()));'''
    page_html = '<!doctype html><html lang="en" data-theme="sepia"><meta charset="utf-8"><title>Textbook graphics atlas</title><style>' + css + review_css + '</style><body>' + DEFS + '<main><header><h1>Every textbook figure</h1><p>Review the mechanism, evidence, labels, scale, and visual hierarchy.</p></header><nav><input aria-label="Find a figure" placeholder="Find a figure"><button data-theme-choice="sepia">Sepia</button><button data-theme-choice="light">Light</button><button data-theme-choice="dark">Dark</button></nav>' + ''.join(body) + '</main><script>' + script + '</script></body></html>'
    (out / 'index.html').write_text(page_html)
    (out / 'inventory.json').write_text(json.dumps(inventory, indent=2, ensure_ascii=False))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1500, 'height': 1000}, device_scale_factor=1)
        page.goto((out / 'index.html').as_uri())
        page.evaluate('document.fonts.ready')
        metrics = page.evaluate('''() => [...document.querySelectorAll('article')].map(a=>{
          const svg=a.querySelector('svg'), vb=svg.viewBox.baseVal;
          const labels=[...svg.querySelectorAll('text')].map(t=>{
            const b=t.getBBox(), matrix=svg.getScreenCTM().inverse().multiply(t.getScreenCTM());
            const corners=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]]
              .map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix));
            const x=Math.min(...corners.map(p=>p.x)), y=Math.min(...corners.map(p=>p.y));
            return {text:t.textContent,x,y,w:Math.max(...corners.map(p=>p.x))-x,h:Math.max(...corners.map(p=>p.y))-y};
          });
          return {name:a.id, width:vb.width,height:vb.height,
            outside:labels.filter(b=>b.x < -1 || b.y < -1 || b.x+b.w > vb.width+1 || b.y+b.h > vb.height+1),
            overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>3 && Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>3).map(b=>[a.text,b.text]))};
        })''')
        (out / 'metrics.json').write_text(json.dumps(metrics, indent=2, ensure_ascii=False))
        if args.shots:
            page.add_style_tag(content='nav{position:static}')
            for module in groups:
                page.locator('#' + module).screenshot(path=str(out / (module + '.png')))
        browser.close()
    print(f'{len(inventory)} figures in {len(groups)} source modules. Atlas: {out / "index.html"}')
    print(f'{sum(bool(m["outside"]) for m in metrics)} figures with out-of-bounds labels; {sum(bool(m["overlaps"]) for m in metrics)} with potential text collisions (editorial review required).')


if __name__ == '__main__':
    main()
