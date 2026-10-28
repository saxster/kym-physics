"""Measure text contrast on opaque explorer surfaces (artwork is schematic)."""
from playwright.sync_api import sync_playwright
import json, sys
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8766/'
def contrast(a,b):
 def luminance(c):
  c=[v/255 for v in c];c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
  return sum(v*w for v,w in zip(c,[.2126,.7152,.0722]))
 low,high=sorted([luminance(a),luminance(b)]);return (high+.05)/(low+.05)
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(reduced_motion='reduce');page.goto(URL+'#explore-scale');page.get_by_role('button',name='Open Powers of Ten',exact=True).click();results=[]
 for theme in ['light','dark','sepia']:
  page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
  rows=page.locator('.scale-width,.scale-power,.scale-caption,.scale-window-note,.scale-step-controls button,.scale-ruler span,.scale-top .xp-kicker,.scale-readout .xp-kicker').evaluate_all('''es=>es.map(e=>{const rgb=s=>s.match(/[\\d.]+/g).map(Number);let layers=[];for(let n=e;n;n=n.parentElement)layers.push(rgb(getComputedStyle(n).backgroundColor));let bg=[255,255,255];for(const c of layers.reverse()){const a=c.length>3?c[3]:1;bg=bg.map((v,i)=>c[i]*a+v*(1-a));}return {text:e.textContent,fg:rgb(getComputedStyle(e).color).slice(0,3),bg}})''')
  for row in rows:
   ratio=contrast(row['fg'],row['bg']);assert ratio>=4.5,(theme,row['text'],ratio)
   results.append({'theme':theme,'text':row['text'],'contrast':round(ratio,2)})
 print('PASS normal-size explorer text/control contrast; minimum',min(r['contrast'] for r in results))
 browser.close()
