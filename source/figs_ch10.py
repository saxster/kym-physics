"""Figures for Chapter 10 (Light and seeing). Names start with c10_. Theme classes only; colour is never the only cue."""
from __future__ import annotations
import math
from figs_core import Fig, figure, r_


def _eye(f, x, y, s=1.0):
    """A simple eye (almond outline, iris, pupil) centred at (x, y)."""
    w, h = 26 * s, 22 * s
    f.path(f'M{r_(x - w)},{r_(y)} Q{r_(x)},{r_(y - h)} {r_(x + w)},{r_(y)} Q{r_(x)},{r_(y + h)} {r_(x - w)},{r_(y)} Z', 'block')
    f.circle(x, y, 9 * s, 'ln')
    f.circle(x, y, 4.5 * s, 'fill-ink')


def _mango(f, x, y, rx=26, ry=18, tilt=-25, cls='block'):
    f.add(f'<ellipse cx="{r_(x)}" cy="{r_(y)}" rx="{rx}" ry="{ry}" transform="rotate({tilt} {r_(x)} {r_(y)})" class="{cls}"/>')
    f.line(x + rx * .8, y - ry * .9, x + rx * 1.0, y - ry * 1.5, 'ln')


def _lamp(f, x, y, r=12):
    f.circle(x, y, r, 'block')
    for k in range(8):
        a = math.radians(k * 45 + 22.5)
        f.line(x + math.cos(a) * (r + 4), y + math.sin(a) * (r + 4), x + math.cos(a) * (r + 12), y + math.sin(a) * (r + 12), 'ln m')


@figure
def c10_seeing():
    f = Fig(640, 330, 'Two models of seeing a mango. The crossed-out prediction sends rays out of the eye. In the observed mechanism, light goes from the lamp to the mango, scatters in many directions, and a small part enters the eye. The mango and eye are recognisable; arrows show light travel, not the direction of attention.')
    f.text(160,29,'Prediction: eyes send light?','t m','middle',14)
    f.text(484,29,'Light must reach your eye','t b','middle',15)
    f.line(320,16,320,304,'ln r')
    _eye(f,58,158);_mango(f,252,158,cls='sample-yellow')
    for yy in (150,171): f.arrow(92,yy,218,yy,'muted',dash=True)
    f.line(146,142,172,180,'ln p');f.line(146,180,172,142,'ln p')
    f.text(160,220,'No lamp, no visible mango.','t','middle',13)
    f.text(160,244,'The eye is a receiver.','t b','middle',14)
    _lamp(f,578,81)
    _mango(f,516,211,cls='sample-yellow')
    _eye(f,365,127)
    f.ray(567,97,526,188,chevrons=2)
    f.ray(491,196,391,140,chevrons=2)
    for a in (0,45,90,135,270,315):
        a=math.radians(a);f.ray(516+33*math.cos(a),211+33*math.sin(a),516+58*math.cos(a),211+58*math.sin(a),chevrons=0)
    f.text(580,121,'1 lamp','t b','middle',13)
    f.text(516,295,'2 mango scatters light','t','middle',13)
    f.text(378,91,'3 eye receives some','t b',size=12)
    f.text(320,322,'Trace the light: source → object → eye.','t b','middle',15)
    return f.svg()


@figure
def c10_pinhole():
    f = Fig(640, 448, 'A recognisable four-pane window projects an upside-down image through a pinhole. Two marked points identify the window top and bottom and their image positions. A separate scale inset compares the one metre object with the ten centimetre image predicted by a three metre object distance and thirty centimetre image distance. Main apparatus distances are schematic.')
    f.text(24,28,'Every point sends light through the same tiny hole','t b',size=17)
    # Window rather than an unexplained object arrow.
    f.rect(38,77,67,152,'block',rx=1)
    f.rect(44,83,55,140,'water',rx=0)
    f.line(71.5,83,71.5,223,'ln');f.line(44,153,99,153,'ln')
    f.circle(72,82,4,'fill-vol');f.circle(72,224,4,'bar-p')
    f.path('M374,145 V76 H604 V230 H374 V155','glass')
    f.line(597,80,597,225,'ln e')
    f.text(600,64,'screen','t e','end',13)
    f.text(374,111,'pinhole','t b','middle',13)
    f.line(374,117,374,143,'ln m')
    # The marked rays are exactly collinear through the hole at (374,150).
    xt=597;yt=150+(150-82)*(xt-374)/(374-72);yb=150+(150-224)*(xt-374)/(374-72)
    for yy,end,cls in ((82,yt,'light-blue'),(224,yb,'light-red')):
        f.ray(72,yy,374,150,chevrons=1,cls='ray '+cls)
        f.ray(374,150,xt,end,chevrons=1,cls='ray '+cls)
    ih=yt-yb;iw=ih*67/152
    f.rect(xt-iw,yb,iw,ih,'water',rx=0)
    f.line(xt-iw/2,yb,xt-iw/2,yt,'ln');f.line(xt-iw,(yb+yt)/2,xt,(yb+yt)/2,'ln')
    f.circle(xt,yt,4,'fill-vol');f.circle(xt,yb,4,'bar-p')
    f.bracket_label(72,374,250,'3 m to the hole',13,up=False)
    f.bracket_label(374,597,250,'30 cm to the screen',13,up=False)
    f.text(24,306,'Image height = object height × 0.30 m ÷ 3 m = one tenth.','t',size=13)
    f.text(24,330,'Height comparison at one shared scale','t b',size=13)
    f.rect(70,340,12,100,'water',rx=0);f.rect(265,430,12,10,'water',rx=0)
    f.line(55,440,300,440,'ln r')
    f.text(95,380,'1 m window','t',size=13);f.text(294,432,'10 cm image','t',size=13)
    f.text(610,370,'Main apparatus:','t m','end',12)
    f.text(610,388,'spacing and sizes schematic','t m','end',12)
    return f.svg()


@figure
def c10_mirror():
    f = Fig(640, 320, 'A point on a face in front of a flat mirror: a ray reflects into the eye at the same angle it arrived, and traced back the reflected rays meet behind the mirror at the image')
    # mirror: a thin slab at x = 360 with hatching behind it
    f.rect(356, 40, 8, 250, 'block', rx=1)
    for y in range(48, 286, 14):
        f.line(364, y, 372, y + 6, 'ln m')
    f.text(360, 32, 'mirror', 't', 'middle', 12)
    ox, oy = 170, 110
    ix, iy = 550, 110
    ex, ey = 150, 250
    # object point and its image
    f.circle(ox, oy, 4, 'fill-ink')
    f.text(ox, 92, 'a point on your face', 't', 'middle', 12)
    f.circle(ix, iy, 4, 'ln dash')
    f.text(ix, 92, 'image', 't m', 'middle', 12)
    _eye(f, ex, ey, 0.9)
    f.text(ex, 288, 'your eye', 't', 'middle', 12)
    # ray 1: object -> mirror -> eye, found from the image-to-eye line
    my = iy + (ey - iy) * (ix - 360) / (ix - ex)
    f.ray(ox, oy, 360, my, chevrons=1)
    dx, dy = ex - 360, ey - my
    n = math.hypot(dx, dy)
    f.ray(360, my, ex - dx / n * 30, ey - dy / n * 30, chevrons=1)
    f.line(360, my, ix, iy, 'ln dash')
    # the normal at the point of reflection, with the two angles
    f.line(300, my, 440, my, 'ln dash')
    f.text(444, my + 4, 'normal', 't m', 'start', 12)
    a = math.degrees(math.atan2(my - oy, 360 - ox))
    r = 42
    f.path(f'M{r_(360 - r)},{r_(my)} A{r},{r} 0 0 1 {r_(360 - r * math.cos(math.radians(a)))},{r_(my - r * math.sin(math.radians(a)))}', 'ln m')
    f.path(f'M{r_(360 - r)},{r_(my)} A{r},{r} 0 0 0 {r_(360 - r * math.cos(math.radians(a)))},{r_(my + r * math.sin(math.radians(a)))}', 'ln m')
    f.text(306, my - 8, 'i', 't s i', 'end', 13)
    f.text(306, my + 18, 'r', 't s i', 'end', 13)
    f.text(250, my + 46, 'angle r = angle i', 't m', 'middle', 12)
    # ray 2: straight at the mirror and straight back, traced through to the image
    f.ray(ox + 8, oy, 360, oy, chevrons=1)
    f.ray(360, oy + 6, ox + 12, oy + 6, chevrons=1)
    f.line(360, oy, ix, iy, 'ln dash')
    f.bracket_label(ox, 360, 304, '1 m', 12)
    f.bracket_label(360, ix, 304, '1 m', 12)
    return f.svg()


@figure
def c10_refraction():
    f = Fig(640, 320, 'A coin under water in a cup: light from the coin bends away from the normal as it leaves the water, and the eye traces the ray straight back to a place higher and nearer than the coin')
    # cup and water
    f.rect(203, 130, 234, 158, 'water', rx=0)
    f.path('M200,90 L205,290 L435,290 L440,90', 'glass')
    f.line(203, 130, 437, 130, 'ln e')
    f.text(320, 112, 'air', 't m', 'middle', 13)
    f.text(262, 176, 'water', 't e', 'start', 13)
    # coin
    cx, cy = 320, 284
    f.add(f'<ellipse cx="{cx}" cy="{cy}" rx="14" ry="4" class="block"/>')
    f.text(cx, 308, 'coin', 't', 'middle', 12)
    # ray: 32° in water, 45° in air
    px = cx + (cy - 4 - 130) * math.tan(math.radians(32))
    py = 130
    f.ray(cx, cy - 4, px, py, chevrons=1)
    ex, ey = 490, 56
    f.ray(px, py, 470, 73, chevrons=1)
    _eye(f, ex, ey, 0.9)
    f.text(ex, 30, 'eye', 't', 'middle', 12)
    # the normal and the two angles
    f.line(px, 70, px, 190, 'ln dash')
    f.text(px - 8, 70, 'normal', 't m', 'end', 12)
    f.path(f'M{r_(px)},100 A30,30 0 0 1 {r_(px + 30 * math.sin(math.radians(45)))},{r_(130 - 30 * math.cos(math.radians(45)))}', 'ln m')
    f.path(f'M{r_(px)},160 A30,30 0 0 1 {r_(px - 30 * math.sin(math.radians(32)))},{r_(130 + 30 * math.cos(math.radians(32)))}', 'ln m')
    f.text(px + 56, 112, '45° to the normal', 't', 'start', 12)
    f.text(px + 26, 202, '32° to the normal', 't', 'start', 12)
    # the eye's straight-line guess
    f.line(px, py, cx, py + (px - cx), 'ln dash')
    f.add(f'<ellipse cx="{cx}" cy="{r_(py + (px - cx))}" rx="14" ry="4" class="ln dash"/>')
    f.text(cx - 20, py + (px - cx) + 4, 'seems here', 't m', 'end', 12)
    return f.svg()


@figure
def c10_eye():
    f = Fig(640, 370, 'A cut-away eye, with cornea, iris aperture, adjustable lens, vitreous space, retina and optic nerve. Rays from two marked points on a tree meet at inverted positions on the retina. A two-thin-surface model gives stronger power to the cornea than the lens; its geometry is illustrative rather than an anatomical scale drawing.')
    f.text(24,28,'The eye forms an image on a sensitive lining','t b',size=17)
    f.add('<ellipse cx="400" cy="173" rx="113" ry="111" class="wash-n"/>')
    f.add('<ellipse cx="400" cy="173" rx="108" ry="106" class="fill-sheet"/>')
    f.path('M299,124 Q263,173 299,222','water')
    f.path('M465,86 Q544,173 465,260','ln p',extra='stroke-width="4"')
    f.path('M508,191 L550,207 L548,222 L505,207','wash-n')
    f.path('M508,191 L550,207 M505,207 L548,222','ln')
    f.line(310,120,310,132,'ln',extra='stroke-width="5"');f.line(310,214,310,226,'ln',extra='stroke-width="5"')
    f.add('<ellipse cx="325" cy="173" rx="12" ry="35" class="water"/>')
    f.text(394,192,'vitreous','t m','middle',12)
    # Two serial thin optical surfaces. Choose cornea focal length so
    # rays from x=55 meet x=500, with lens power half the corneal power.
    u,d,v=233,37,175
    def residual(fc):
        # A ray from object centre with angle1: y=u at cornea.
        y=u;theta=1-y/fc;y+=d*theta;theta-=y/(2*fc)
        return y+v*theta
    lo,hi=60.,300.
    for _ in range(60):
        mid=(lo+hi)/2
        if residual(mid)>0:hi=mid
        else:lo=mid
    fc=(lo+hi)/2
    def image_ray(sy,yc):
        theta=(yc-sy)/233;after=theta-(yc-173)/fc
        yl=yc+37*after;theta2=after-(yl-173)/(2*fc)
        return yl,yl+175*theta2
    # A trunk and branching crown identify the object without replacing it by an arrow.
    f.line(55,222,55,124,'ln',extra='stroke-width="4"')
    f.path('M55,129 L31,145 M55,149 L76,131 M55,167 L29,157','ln g')
    for sy,cls in ((124,'light-blue'),(222,'light-red')):
        f.circle(55,sy,4,'fill-vol' if sy==124 else 'bar-p')
        for yc in (143,203):
            yl,yi=image_ray(sy,yc)
            f.ray(55,sy,288,yc,cls='ray '+cls)
            f.ray(288,yc,325,yl,cls='ray '+cls,chevrons=0)
            f.ray(325,yl,500,yi,cls='ray '+cls)
        f.circle(500,yi,4,'fill-vol' if sy==124 else 'bar-p')
    f.text(55,251,'tree','t b','middle',13)
    f.text(236,87,'cornea','t b','end',13);f.line(242,93,281,146,'ln m')
    f.text(332,78,'iris + pupil','t',size=13);f.line(334,84,310,128,'ln m')
    f.text(325,286,'lens','t b','middle',13);f.line(325,276,325,211,'ln m')
    f.text(540,143,'retina','t p b',size=13);f.line(534,150,503,167,'ln m')
    f.text(547,247,'optic nerve','t m','middle',12)
    f.text(24,320,'Most bending at the cornea; the lens adjusts the focus.','t b',size=14)
    f.text(24,347,'Two optical surfaces and coloured point tags are explanatory models, not scale anatomy.','t m',size=12)
    return f.svg()


@figure
def c10_romer():
    f = Fig(640, 300, 'Rømer’s reasoning: light from Io must cross the extra width of Earth’s orbit when Earth is on the far side of the Sun, so the eclipses appear late')
    sx, sy = 150, 150
    f.circle(sx, sy, 80, 'ln dash')
    f.circle(sx, sy, 16, 'block')
    f.text(sx, 190, 'Sun', 't', 'middle', 12)
    # Earth on the near and far sides of its orbit
    f.circle(230, 150, 7, 'fill-ink')
    f.text(230, 128, 'Earth, near side', 't', 'middle', 12)
    f.text(230, 174, 'eclipse seen first', 't m', 'middle', 12)
    f.circle(70, 150, 7, 'fill-ink')
    f.text(70, 128, 'Earth, far side', 't', 'middle', 12)
    f.text(70, 174, '16.6 min later', 't m', 'middle', 12)
    # Jupiter, its shadow, and Io entering it
    f.path('M520,134 L640,128 L640,172 L520,166 Z', 'wash')
    f.circle(520, 150, 16, 'block')
    f.text(496, 190, 'Jupiter', 't', 'end', 12)
    f.text(636, 190, "Jupiter's shadow", 't m', 'end', 12)
    f.circle(560, 124, 5, 'fill-ink')
    f.text(560, 110, 'Io', 't', 'middle', 12)
    f.text(560, 96, 'about to be eclipsed', 't m', 'middle', 12)
    # light from Io to both Earth positions
    f.ray(554, 126, 237, 148, chevrons=2)
    f.ray(554, 128, 78, 150, chevrons=0)
    f.bracket_label(70, 230, 236, '300 million km extra: 16.6 light-minutes', 12, up=False)
    return f.svg()
