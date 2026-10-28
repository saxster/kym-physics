"""Figures for Chapter 11 (Colour, and what light really is). Names start with c11_. Theme classes only; colour is never the only cue."""
from __future__ import annotations
import math
from figs_core import Fig, figure, r_


@figure
def c11_prism():
    f = Fig(640, 340, 'White light enters a prism and separates: red bends least and violet most, all towards the base. A slit selects the red beam. A second prism bends that red beam again, towards its base, without making new colours. Angles and colour separation are schematic.')
    for x,n,title in ((20,'1','Separate'),(287,'2','Select red'),(449,'3','Bend again')):
        f.text(x,28,n,'t e b',size=15)
        f.text(x+23,28,title,'t b',size=15)
    f.ray(24,100,130,100,chevrons=1)
    f.text(26,80,'white light','t',size=13)
    f.path('M150,42 L85,230 L215,230 Z','water')
    f.line(130,100,175,110,'ray')
    for name,yy in (('red',158),('yellow',175),('green',192),('blue',209),('violet',226)):
        f.ray(175,110,318,yy,chevrons=1,cls='ray light-'+name)
        if name!='red': f.text(326,yy+4,name,'t m',size=12)
    f.text(150,254,'first prism','t m','middle',13)
    f.text(203,81,'red bends least','t p',size=12)
    f.line(252,86,270,137,'ln m')
    f.text(200,287,'violet bends most','t',size=12)
    f.line(248,271,278,209,'ln m')
    # Red continues along one straight ray until it enters the second prism.
    f.rect(318,62,7,88,'block',rx=1)
    f.rect(318,166,7,78,'block',rx=1)
    f.ray(318,158,415.3,190.7,chevrons=1,cls='ray light-red')
    f.text(354,148,'red only','t p b','middle',13)
    f.path('M431,146 L391,260 L471,260 Z','water')
    f.ray(415.3,190.7,450.9,202.8,cls='ray light-red')
    f.ray(450.9,202.8,520,281.4,cls='ray light-red')
    f.text(435,282,'second prism','t m','middle',12)
    f.rect(520,230,7,76,'plate',rx=0)
    f.rect(520,275,7,14,'sample-red',rx=0)
    f.text(541,267,'still','t b',size=14)
    f.text(541,285,'red','t p b',size=14)
    f.text(320,326,'Colour separation and angles enlarged; the prisms do not add colours.','t m','middle',12)
    return f.svg()


def _banana(f, cx, cy):
    f.path(f'M{cx - 42},{cy + 12} Q{cx},{cy - 44} {cx + 42},{cy + 12} Q{cx},{cy - 8} {cx - 42},{cy + 12} Z', 'block')


@figure
def c11_banana():
    f = Fig(640, 350, 'A yellow banana under white, red and blue illumination. In this idealised model it reflects red and green and absorbs blue. Its appearance is yellow, red, and nearly black respectively. Each incoming and reflected colour is named; the blue-lit banana has no reflected-light arrow.')
    for i,(cx,title,col,inn,back,look) in enumerate(((107,'White light','sample-yellow','R + G + B','R + G','looks yellow'),(320,'Red light','sample-red','R','R','looks red'),(533,'Blue light','sample-dark','B','none','looks nearly black'))):
        if i: f.line(cx-106,18,cx-106,324,'ln r')
        f.text(cx,31,title,'t b','middle',16)
        f.text(cx,60,'arriving: '+inn,'t','middle',13)
        # Broad curved fruit with a stem, ridge and blossom tip.
        f.path(f'M{cx-49},164 Q{cx-12},217 {cx+49},159 Q{cx+21},239 {cx-34},202 Q{cx-50},187 {cx-49},164 Z',col)
        f.path(f'M{cx-45},174 Q{cx-4},223 {cx+43},174','ln thin')
        f.line(cx-49,164,cx-53,151,'ln', 'stroke-width="4"')
        f.line(cx+49,159,cx+53,153,'ln')
        incoming = [('red',-6),('green',0),('blue',6)] if i==0 else [('red' if i==1 else 'blue',0)]
        for colour,off in incoming:
            f.ray(cx-68+off,83,cx-28+off,150,cls='ray light-'+colour)
        if i<2:
            for colour,off in ([('red',-4),('green',4)] if i==0 else [('red',0)]):
                f.ray(cx+29+off,153,cx+70+off,86,cls='ray light-'+colour)
        f.text(cx,258,'back to your eye: '+back,'t','middle',12)
        f.text(cx,286,look,'t b','middle',15)
        f.text(cx,310,'blue is absorbed' if i!=1 else 'red is reflected','t m','middle',12)
    f.text(320,342,'The light reaching your eye depends on the light that arrived.','t','middle',14)
    return f.svg()


def _person(f, x, ground_y):
    f.circle(x, ground_y - 34, 7, 'ln')
    f.line(x, ground_y - 27, x, ground_y, 'ln')


def _sun(f, x, y, r=12):
    f.circle(x, y, r, 'block')
    for k in range(8):
        a = math.radians(k * 45)
        f.line(x + math.cos(a) * (r + 4), y + math.sin(a) * (r + 4), x + math.cos(a) * (r + 11), y + math.sin(a) * (r + 11), 'ln m')


@figure
def c11_sky():
    f = Fig(640, 320, 'Noon and sunset: at noon sunlight crosses a short stretch of air and the scattered blue reaches you from all over the sky; at sunset the beam crosses far more air, loses most of its blue, and arrives orange')
    # noon
    f.text(30, 24, 'Noon', 't b', 'start', 13)
    f.rect(20, 70, 290, 130, 'wash-e', rx=0)
    f.text(30, 88, 'air', 't e', 'start', 12)
    f.ground(20, 230, 290)
    _person(f, 165, 230)
    f.text(165, 250, 'you', 't', 'middle', 12)
    _sun(f, 165, 36)
    f.text(190, 40, 'Sun overhead', 't', 'start', 12)
    f.ray(165, 52, 165, 188, chevrons=2)
    for (x, y) in ((60, 120), (100, 160), (235, 110), (275, 165)):
        f.ray(x, y, 165 + (x - 165) * 0.08, 196 - (196 - y) * 0.1, chevrons=1)
    f.text(165, 274, 'blue, scattered to you', 't', 'middle', 12)
    f.text(165, 290, 'from all over the sky', 't', 'middle', 12)
    f.line(320, 20, 320, 300, 'ln r')
    # sunset
    f.text(340, 24, 'Sunset', 't b', 'start', 13)
    f.rect(330, 70, 290, 130, 'wash-e', rx=0)
    f.text(340, 88, 'air', 't e', 'start', 12)
    f.ground(330, 230, 290)
    _person(f, 390, 230)
    f.text(390, 250, 'you', 't', 'middle', 12)
    _sun(f, 600, 186)
    f.text(596, 160, 'setting Sun', 't', 'middle', 12)
    f.ray(586, 189, 398, 195, chevrons=3)
    for x in (540, 480):
        f.arrow(x, 190, x - 12, 150, 'muted')
    f.text(500, 138, 'blue leaves the beam sideways', 't m', 'middle', 12)
    f.text(492, 220, 'a much longer path through air', 't m', 'middle', 12)
    f.text(475, 274, 'most blue scattered away;', 't', 'middle', 12)
    f.text(475, 290, 'the orange gets through', 't', 'middle', 12)
    return f.svg()


@figure
def c11_brewster():
    f = Fig(640, 320, 'Sunlight meeting the sea at Brewster’s angle, 53° from the normal: the reflected glare is completely polarised and reaches an eye on the sea wall looking 37° below the horizon; the refracted ray is at right angles to it')
    f.rect(40, 200, 580, 100, 'water', rx=0)
    f.line(40, 200, 620, 200, 'ln e')
    f.text(60, 290, 'sea', 't e', 'start', 13)
    f.rect(40, 150, 70, 50, 'block', rx=2)
    f.text(75, 196, 'sea wall', 't m', 'middle', 12)
    ex, ey = 75, 96
    f.circle(ex, ey, 7, 'ln')
    f.line(ex, ey + 7, ex, 150, 'ln')
    f.text(ex, 76, 'you', 't', 'middle', 12)
    # polarised lens in front of the eye
    f.rect(84, 90, 18, 12, 'block', rx=2)
    for x in (88, 93, 98):
        f.line(x, 92, x, 100, 'ln e')
    f.text(112, 60, 'polarised lens:', 't e', 'start', 12)
    f.text(112, 74, 'passes up-and-down shaking only', 't e', 'start', 12)
    # geometry: Brewster's angle for water, 53.1° from the normal = 36.9° below the horizon
    b = math.radians(53.1)
    px = ex + (200 - ey) / math.tan(math.radians(90) - b)
    py = 200
    f.line(ex, ey, 260, ey, 'ln dash')
    f.text(266, ey - 4, 'horizon', 't m', 'start', 12)
    f.path(f'M{r_(ex + 50)},{ey} A50,50 0 0 1 {r_(ex + 50 * math.cos(math.radians(36.9)))},{r_(ey + 50 * math.sin(math.radians(36.9)))}', 'ln m')
    f.text(130, 122, '37° down', 't', 'start', 12)
    # incoming sunlight, reflected glare, refracted ray
    ux, uy = -math.sin(b), math.cos(b)
    f.ray(px - ux * 170, py - uy * 170, px, py, chevrons=2)
    f.text(px - ux * 170 + 6, py - uy * 170 - 6, 'sunlight', 't', 'start', 12)
    rx, ry = -math.sin(b), -math.cos(b)
    f.ray(px, py, ex + 8, ey + 6, chevrons=1)
    for t in (.3, .45, .6, .75):
        f.circle(px + (ex + 8 - px) * t, py + (ey + 6 - py) * t, 2.6, 'fill-ink')
    f.text(232, 108, 'glare, polarised', 't', 'start', 12)
    f.text(232, 122, 'side to side', 't', 'start', 12)
    tx, ty = -math.sin(math.radians(36.9)), math.cos(math.radians(36.9))
    f.ray(px, py, px + tx * 95, py + ty * 95, chevrons=1)
    # the normal, the angles, the right angle
    f.line(px, 120, px, 270, 'ln dash')
    f.text(px + 6, 284, 'normal', 't m', 'start', 12)
    f.path(f'M{r_(px)},164 A36,36 0 0 1 {r_(px - ux * 36)},{r_(py - uy * 36)}', 'ln m')
    f.text(px + 22, 160, '53°', 't', 'start', 12)
    f.path(f'M{r_(px)},164 A36,36 0 0 0 {r_(px + rx * 36)},{r_(py + ry * 36)}', 'ln m')
    f.text(px - 22, 160, '53°', 't', 'end', 12)
    f.path(f'M{r_(px)},236 A36,36 0 0 1 {r_(px + tx * 36)},{r_(py + ty * 36)}', 'ln m')
    f.text(px - 28, 250, '37°', 't', 'end', 12)
    k = 14
    f.path(f'M{r_(px + rx * k)},{r_(py + ry * k)} L{r_(px + (rx + tx) * k)},{r_(py + (ry + ty) * k)} L{r_(px + tx * k)},{r_(py + ty * k)}', 'ln m')
    f.text(px - 28, 206, '90°', 't m', 'end', 12)
    return f.svg()


@figure
def c11_young():
    f = Fig(640, 390, 'Two coherent sources feed two actual paths to each marked screen point. A calculated equal-amplitude intensity strip and curve show bright points at integer wavelength path differences and dark points at half-integer differences. The finite-slit diffraction envelope is omitted; geometry and wavelength are illustrative.')
    f.text(24,27,'Two routes to the same point','t b',size=17)
    sx,ya,yb,xx,lam=95,126,186,478,14
    def delta(y):return math.hypot(xx-sx,y-yb)-math.hypot(xx-sx,y-ya)
    def target(d):
        lo,hi=40.,272.
        for _ in range(50):
            m=(lo+hi)/2
            if delta(m)>d:lo=m
            else:hi=m
        return (lo+hi)/2
    for y in (ya,yb):
        for r in range(14,85,14):
            f.path(f'M{sx},{y-r} A{r},{r} 0 0 1 {sx},{y+r}','ln r')
        f.circle(sx,y,5,'fill-ink')
    f.text(78,ya+4,'S₁','t b','end',14);f.text(78,yb+4,'S₂','t b','end',14)
    f.text(24,290,'Sources stay in step','t b',size=13)
    # Each sample is derived from the same two distances as the path labels.
    f.rect(xx,40,22,232,'glass',rx=0)
    pts=[]
    for y in range(40,272):
        intensity=math.cos(math.pi*delta(y)/lam)**2
        f.add(f'<rect x="{xx}" y="{y}" width="22" height="1.1" class="fill-vol" opacity="{intensity:.3f}"/>')
        pts.append((530+64*intensity,y))
    f.path('M'+' L'.join(f'{x:.2f},{y}' for x,y in pts),'ln e')
    f.line(530,40,530,272,'ln m')
    f.text(562,292,'intensity →','t e','middle',12)
    f.text(489,26,'screen','t b','middle',12)
    for d,lab,cls in ((0,'A','ln e'),(lam/2,'B','ln p dash')):
        y=target(d)
        f.line(sx,ya,xx,y,cls);f.line(sx,yb,xx,y,cls)
        f.circle(xx,y,4,'fill-ink');f.text(463,y+4,lab,'t b','end',14)
    f.text(24,319,'A · equal paths: crest meets crest → bright','t e b',size=14)
    f.text(24,346,'B · extra half-wavelength: crest meets trough → dark','t p b',size=14)
    f.text(24,378,'Same-amplitude point sources; slit-width envelope omitted. Distances are schematic.','t m',size=12)
    return f.svg()


@figure
def c11_raman():
    f = Fig(640, 365, 'One-frequency light enters a liquid. Sideways scattered light is analysed by wavelength. The strong central Rayleigh line has unchanged photon energy; the two weak Raman lines correspond to energy given to or received from molecular vibration. Peak heights are schematic, not a prediction of relative intensities.')
    f.text(24,28,'A colour shift records an energy exchange','t b',size=17)
    f.path('M92,119 V169 L68,240 Q68,253 82,253 H174 Q188,253 188,240 L164,169 V119','glass')
    f.path('M81,205 L72,239 Q72,249 83,249 H173 Q184,249 184,239 L175,205 Z','water')
    f.ray(15,222,171,222,chevrons=2)
    f.circle(128,222,4,'fill-ink')
    f.ray(128,218,128,145,chevrons=1)
    f.text(24,285,'one colour enters','t b',size=13)
    f.text(128,102,'sideways light','t','middle',12)
    f.path('M148,147 L252,147 L275,180','ln m')
    f.text(220,127,'analyse','t m','middle',12)
    f.axis(285,252,310,178,'wavelength increases →','scattered light')
    for x,h,cls in ((342,30,'ln e'),(441,150,'ln'),(540,36,'ln p')):
        f.line(x,252,x,252-h,cls,extra='stroke-width="3"')
    f.text(441,75,'unchanged','t b','middle',13)
    f.text(342,195,'shorter λ','t e b','middle',12)
    f.text(540,195,'longer λ','t p b','middle',12)
    f.text(24,320,'Shorter λ: photon gains energy. Longer λ: photon gives energy to the molecule.','t',size=13)
    f.text(24,350,'Raman lines are weak; peak heights here are schematic, not measured intensities.','t m',size=12)
    return f.svg()
