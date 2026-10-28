"""Prepare book fonts: add superscript +/- and an equilibrium harpoon glyph to Literata."""
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables._g_l_y_f import GlyphComponent, Glyph
import shutil, os
E = '/home/claude/fonts/node_modules/@expo-google-fonts/'
SRC = {
  'Literata-300': E+'literata/300Light/Literata_300Light.ttf',
  'Literata-400': E+'literata/400Regular/Literata_400Regular.ttf',
  'Literata-400i': E+'literata/400Regular_Italic/Literata_400Regular_Italic.ttf',
  'Literata-600': E+'literata/600SemiBold/Literata_600SemiBold.ttf',
  'Literata-600i': E+'literata/600SemiBold_Italic/Literata_600SemiBold_Italic.ttf',
  'Literata-700': E+'literata/700Bold/Literata_700Bold.ttf',
  'Lexend-400': E+'lexend/400Regular/Lexend_400Regular.ttf',
  'Lexend-600': E+'lexend/600SemiBold/Lexend_600SemiBold.ttf',
}

def add_glyph(font, name, uni, glyph, adv):
    font['glyf'][name] = glyph
    font['hmtx'][name] = (adv, 0)
    order = font.getGlyphOrder()
    if name not in order:
        order.append(name); font.setGlyphOrder(order)
    for t in font['cmap'].tables:
        if t.isUnicode(): t.cmap[uni] = name
    font['maxp'].numGlyphs = len(font.getGlyphOrder())

def composite(font, base, scale, dx, dy):
    g = Glyph(); g.numberOfContours = -1; c = GlyphComponent()
    c.glyphName = base; c.x, c.y = dx, dy; c.flags = 0x4
    c.transform = [[scale, 0], [0, scale]]
    g.components = [c]
    g.recalcBounds(font['glyf'])
    return g

def harpoons(font, thick):
    pen = TTGlyphPen(None)
    L, R = 70, 690
    yt, yb = 400, 220           # bar centres
    h = thick / 2
    # top: rightward harpoon, barb up
    pen.moveTo((L, yt - h)); pen.lineTo((R, yt - h)); pen.lineTo((R - 170, yt + 150))
    pen.lineTo((R - 170 - thick*1.1, yt + 150)); pen.lineTo((R - 120 - thick, yt + h)); pen.lineTo((L, yt + h)); pen.closePath()
    # bottom: leftward harpoon, barb down
    pen.moveTo((R, yb + h)); pen.lineTo((L, yb + h)); pen.lineTo((L + 170, yb - 150))
    pen.lineTo((L + 170 + thick*1.1, yb - 150)); pen.lineTo((L + 120 + thick, yb - h)); pen.lineTo((R, yb - h)); pen.closePath()
    return pen.glyph()

os.makedirs('fonts', exist_ok=True)
for key, path in SRC.items():
    f = TTFont(path, lazy=False)
    for tag in ('vmtx', 'vhea', 'hdmx', 'LTSH', 'VDMX'):
        if tag in f: del f[tag]
    cm = f.getBestCmap()
    if key.startswith('Literata'):
        minus = f['glyf'][cm[0x2212]]; minus.recalcBounds(f['glyf'])
        thick = minus.yMax - minus.yMin
        adv = int(f['hmtx'][cm[0x2B]][0] * 0.58)
        add_glyph(f, 'uni207A', 0x207A, composite(f, cm[0x2B], 0.6, 10, 430), adv)
        add_glyph(f, 'uni207B', 0x207B, composite(f, cm[0x2212], 0.6, 10, 430), adv)
        add_glyph(f, 'uni21CC', 0x21CC, harpoons(f, thick), 760)
    f.save(f'fonts/{key}.ttf')
    print('ok', key)
