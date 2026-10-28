"""Figures for the stories in the tales group (eclipse-1919, faraday-cage, fizeau-wheel, foucault, kilogram,
mpemba, trams, wobbly-bridge). Every number drawn here is recorded in provenance/stories_tales.yml and was
computed with python3 -I from the inputs cited there. Theme classes only."""
from __future__ import annotations
import math
from figs_core import Fig, catmull, figure, r_


# ------------------------------------------------------------------ eclipse-1919
@figure
def s_eclipse_bend():
    """29 May 1919 eclipse test: starlight grazing the Sun's limb bends inwards, shifting the apparent star outwards."""
    f = Fig(640, 330, "A star at the left sends a light ray past the darkened Sun in the middle to a telescope on Earth "
                      "at the right. The Sun's gravity bends the ray towards the Sun, so looking back along the arriving "
                      "ray makes the star appear shifted outwards from its true place. Einstein predicted 1.75 arcseconds "
                      "at the Sun's edge; the older Newtonian reckoning gave 0.87 arcseconds (angles exaggerated)")
    # All four points share one explicit back-projection geometry.
    sun_x, sun_y, sun_r = 310, 178, 42
    ex, ey = 566, 172
    gx, gy = sun_x, sun_y - sun_r - 12
    tx, ty = ex - 20, ey - 8
    # True star at far left
    sx, sy = 62, 148
    f.circle(sx, sy, 5.5, 'fill-ink')
    f.text(sx, sy + 22, 'true star position', 't b', 'start', 13)
    f.text(sx, sy + 38, '(Hyades cluster)', 't m', 'start', 12)

    # Apparent star position (shifted upwards/outwards away from the Sun)
    ax = sx
    ay = gy + (ty - gy) * (ax - gx) / (tx - gx)
    f.circle(ax, ay, 5.5, 'plate')
    f.circle(ax, ay, 5.5, 'ln dash')
    f.text(ax + 14, ay - 24, 'apparent position seen from Earth', 't p b', 'start', 13)
    f.text(ax + 14, ay - 7, 'shifted outwards from the Sun', 't m', 'start', 12)
    f.arrow(sx, sy - 10, ax, ay + 10, 'proton', dash=True)

    # Eclipsed Sun in the middle
    # Corona rays
    for k in range(16):
        ang = math.radians(k * 22.5)
        r1 = sun_r + 3
        r2 = sun_r + (16 if k % 2 == 0 else 10)
        f.line(sun_x + r1 * math.cos(ang), sun_y + r1 * math.sin(ang),
               sun_x + r2 * math.cos(ang), sun_y + r2 * math.sin(ang), 'ln m')
    f.circle(sun_x, sun_y, sun_r, 'fill-ink')
    f.circle(sun_x, sun_y, sun_r, 'ln')
    f.text(sun_x, sun_y + 4, 'eclipsed Sun', 't b', 'middle', 12, extra='style="fill:var(--paper)"')
    f.text(sun_x, sun_y + sun_r + 28, 'Moon blots out glare so nearby stars show', 't m', 'middle', 12)

    # Earth / telescope at right
    f.circle(ex, ey, 22, 'plate')
    f.circle(ex, ey, 22, 'ln')
    f.text(ex, ey + 5, 'Earth', 't b', 'middle', 12)
    f.text(ex, ey + 38, 'Príncipe & Sobral', 't m', 'middle', 12)

    # Actual bent light path: the true star, grazing point, then the telescope.
    f.ray(sx, sy, gx, gy, chevrons=1)
    f.ray(gx, gy, tx, ty, chevrons=1)
    # Sight line projected straight back from telescope through grazing point to apparent star
    f.line(ax, ay, gx, gy, 'ln dash')

    # Callout box comparing the two predictions at bottom left
    f.rect(24, 258, 242, 62, 'plate', rx=5)
    f.text(36, 278, 'Shift right at the Sun’s edge:', 't b', 'start', 12)
    f.text(36, 296, 'Einstein (1915): 1.75 arcseconds', 't p b', 'start', 12)
    f.text(36, 312, 'Old reckoning:  0.87 arcseconds', 't m', 'start', 12)
    f.text(618, 318, 'angles exaggerated for clarity', 't m', 'end', 12)
    return f.svg()


# ------------------------------------------------------------------ faraday-cage
@figure
def s_faraday_cube():
    f = Fig(640, 375, 'A foil-covered conducting box shown with its front wall removed so the hollow interior is visible. Excess positive charge resides on the outer surface. An electroscope inside has straight leaves, whereas the comparison electroscope outside has separated leaves when charged. In electrostatic equilibrium, with no charge enclosed, the field inside the empty conducting cavity is zero.')
    f.text(24,27,'Charge spreads on the conducting skin','t b',size=17)
    # Back and side walls; the interior stays paper coloured, not metal coloured.
    f.path('M150,84 L185,58 L480,58 L480,278 L445,308 L150,308 Z','wash-n')
    f.rect(164,97,267,196,'fill-sheet',rx=0)
    f.path('M150,84 L445,84 L480,58 M445,84 L445,308 L480,278 M150,84 L150,308 L445,308 M185,58 L185,84','ln')
    f.path('M164,97 L431,97 L431,293 L164,293 Z','ln m dash')
    for x in (178,223,268,313,358,403):
        f.text(x,78,'+','t p b','middle',15);f.text(x,329,'+','t p b','middle',15)
    for y in (125,168,211,254):
        f.text(139,y,'+','t p b','middle',15);f.text(491,y,'+','t p b','middle',15)
    f.text(298,120,'hollow cavity','t b','middle',14)
    # Generator and an explicit electrical connection to outer skin.
    f.circle(56,159,24,'block');f.line(56,183,56,238,'ln');f.rect(28,238,56,9,'block',rx=2)
    f.line(80,159,150,159,'ln');f.path('M103,159 l8,-9 l5,17 l8,-10','ln p')
    f.text(56,270,'generator','t m','middle',12)
    def electroscope(x,y,spread):
        f.circle(x,y,7,'fill-ink');f.line(x,y+7,x,y+48,'ln')
        f.rect(x-27,y+27,54,69,'glass',rx=7)
        f.line(x if spread else x-3,y+48,x-(17 if spread else 3),y+80,'ln nn')
        f.line(x if spread else x+3,y+48,x+(17 if spread else 3),y+80,'ln nn')
    electroscope(298,154,False)
    f.text(298,268,'leaves hang straight','t b','middle',13)
    electroscope(561,112,True)
    f.text(561,101,'+','t p b','middle',16)
    f.text(561,236,'outside:','t b','middle',13)
    f.text(561,254,'charged leaves','t m','middle',12)
    f.text(561,272,'separate','t m','middle',12)
    f.text(320,357,'Front wall cut away to show the inside; the real foil shell is closed.','t m','middle',12)
    return f.svg()


# ------------------------------------------------------------------ fizeau-wheel
@figure
def s_fizeau_wheel():
    """Fizeau's 1849 cogwheel speed-of-light measurement between Suresnes and Montmartre (8,633 m)."""
    f = Fig(640, 300, "Top: light from a lamp passes through a gap in a 720-tooth cogwheel at Suresnes, travels 8,633 m "
                      "to a mirror at Montmartre, and returns through the same gap when the wheel turns slowly. Bottom: "
                      "at 12.6 turns per second the wheel rotates by half a tooth during the 55-microsecond round trip, "
                      "so the returning beam hits a tooth and the eyepiece goes dark")

    def draw_row(y0, tag, wheel_note, eye_label, blocked):
        f.text(20, y0 - 66, tag, 't b', 'start', 13)
        # Eyepiece at far left
        f.rect(20, y0 - 12, 46, 24, 'plate', rx=4)
        f.text(43, y0 + 4, 'eye', 't m', 'middle', 12)
        # Angled half-silvered glass plate
        px = 104
        f.line(px - 12, y0 - 16, px + 12, y0 + 16, 'ln')
        # Lamp above the angled plate
        f.circle(px, y0 - 44, 9, 'plate')
        f.circle(px, y0 - 44, 9, 'ln p')
        f.text(px + 14, y0 - 40, 'lamp', 't m', 'start', 11)
        f.ray(px, y0 - 35, px, y0 - 2, chevrons=1)

        # Cogwheel at x = 200
        wx = 204
        f.circle(wx, y0, 32, 'plate')
        f.circle(wx, y0, 22, 'ln m')
        # Draw teeth around the rim; on the right edge (angle 0), put either a gap or a tooth
        for k in range(12):
            ang = math.radians(k * 30 + (15 if not blocked else 0))
            x1, y1 = wx + 24 * math.cos(ang), y0 + 24 * math.sin(ang)
            x2, y2 = wx + 34 * math.cos(ang), y0 + 34 * math.sin(ang)
            f.line(x1, y1, x2, y2, 'ln', extra='stroke-width="4"')
        f.text(wx, y0 + 48, wheel_note, 't m', 'middle', 12)

        # Distant mirror at Montmartre (x = 520)
        mx = 520
        f.rect(mx, y0 - 28, 10, 56, 'block', rx=2)
        f.line(mx, y0 - 28, mx, y0 + 28, 'ln')

        # Outgoing ray (slightly above centre line)
        f.ray(px + 4, y0 - 6, mx, y0 - 6, chevrons=2)
        f.text((wx + mx) / 2, y0 - 14, 'outgoing beam (8,633 m to Montmartre)', 't m', 'middle', 11)

        # Returning ray (slightly below centre line)
        if not blocked:
            f.ray(mx, y0 + 8, 66, y0 + 8, chevrons=2)
            f.circle(54, y0 + 8, 5, 'ln p')
            f.text(550, y0 + 4, eye_label, 't b', 'start', 12)
        else:
            # Stopped at the cogwheel tooth at wx + 32
            f.ray(mx, y0 + 8, wx + 34, y0 + 8, chevrons=2)
            f.rect(wx + 24, y0 - 5, 12, 18, 'fill-ink', rx=1)
            f.text(wx + 44, y0 + 24, 'tooth moves into gap’s place', 't p b', 'start', 12)
            f.text(550, y0 + 4, eye_label, 't p b', 'start', 12)

    draw_row(88, '1. Wheel still or slow:', '720 teeth, 720 gaps', 'bright spot', blocked=False)
    draw_row(222, '2. First blackout (12.6 turns/s):', 'turns 1/1,440 rev in 55 µs', 'spot goes dark', blocked=True)
    return f.svg()


# ------------------------------------------------------------------ foucault
@figure
def s_foucault_turn():
    """Foucault pendulum floor rotation rate across four latitudes: North Pole, Paris, Mumbai, Equator."""
    f = Fig(640, 290, "Four dials comparing Foucault pendulum turning rates. The red tracks show 4.2 hours elapsed: at the North "
                      "Pole (90 degrees N) 15 degrees per hour, a full circle in 24 hours; in Paris (48.9 degrees N) 11.3 "
                      "degrees per hour, 32 hours; in Mumbai (19.1 degrees N) 4.9 degrees per hour, about 73 hours; and on "
                      "the Equator (0 degrees) 0 degrees per hour, no turning at all")
    cases = [
        (92,  'North Pole', '90° N',    15.0, '15.0° / hour', 'full circle: 24 h'),
        (244, 'Paris',      '48.9° N',  11.3, '11.3° / hour', 'full circle: 32 h'),
        (396, 'Mumbai',     '19.1° N',   4.9, '4.9° / hour',  'full circle: 73 h'),
        (548, 'Equator',    '0°',        0.0, '0° / hour',    'never turns'),
    ]
    cy, r = 136, 54
    for cx, place, lat, deg, rate_lbl, period_lbl in cases:
        f.text(cx, 32, place, 't b', 'middle', 14)
        f.text(cx, 50, f'latitude {lat}', 't m', 'middle', 12)
        f.circle(cx, cy, r, 'plate')
        f.circle(cx, cy, r, 'ln')
        # Compass ticks on floor
        for a in (0, 90, 180, 270):
            rad = math.radians(a)
            f.line(cx + (r - 6) * math.cos(rad), cy + (r - 6) * math.sin(rad),
                   cx + r * math.cos(rad), cy + r * math.sin(rad), 'ln m')
        # Initial swing plane (vertical dashed line)
        f.line(cx, cy - r + 10, cx, cy + r - 10, 'ln dash')
        # The red track is the stated rate times an explicit elapsed 4.2 h.
        # Recompute the rate from latitude before drawing, avoiding rounded-angle drift.
        deg = 15 * math.sin(math.radians(float(lat.split('°')[0])))
        vis_deg = deg * 4.2
        if deg > 0:
            ang = math.radians(-90 + vis_deg)
            dx, dy = (r - 10) * math.cos(ang), (r - 10) * math.sin(ang)
            f.line(cx - dx, cy - dy, cx + dx, cy + dy, 'ln p')
            # Small curved arrow along rim showing apparent clockwise drift in N hemisphere
            a1, a2 = math.radians(-85), math.radians(-90 + vis_deg - 3)
            if vis_deg > 12:
                f.path(f'M{r_(cx + (r - 14) * math.cos(a1))},{r_(cy + (r - 14) * math.sin(a1))} '
                       f'A{r - 14} {r - 14} 0 0 1 '
                       f'{r_(cx + (r - 14) * math.cos(a2))},{r_(cy + (r - 14) * math.sin(a2))}',
                       'ar ar-proton', extra='fill="none" marker-end="url(#ah-proton)"')
        else:
            f.line(cx, cy - r + 10, cx, cy + r - 10, 'ln p')
        # Bob in the middle
        f.circle(cx, cy, 5, 'fill-ink')
        f.text(cx, 218, rate_lbl, 't p b' if deg > 0 else 't m', 'middle', 13)
        f.text(cx, 236, period_lbl, 't m', 'middle', 12)

    f.lines(320, 270, ['Hourly turn = 15° × sin(latitude).',
                       'Red track: after 4.2 hours, drawn to the stated angle.'], 't m', 'middle', 12)
    return f.svg()


# ------------------------------------------------------------------ kilogram
@figure
def s_kilogram_rule():
    f = Fig(640, 420, 'The kilogram changed from one protected metal object to a reproducible measurement using a fixed Planck constant. A Kibble balance has two separate modes: a stationary coil carries current to balance a mass; then the same coil is moved at a measured speed to measure an induced voltage. Combining the modes eliminates magnetic field and coil length. The two modes are not simultaneous.')
    f.text(24,27,'One kilogram: from an object to a repeatable measurement','t b',size=16)
    f.text(24,52,'Until 2019: the original cylinder in Sèvres','t m',size=12)
    f.text(24,77,'Since 2019: fix h, then measure electrical quantities','t b',size=13)
    f.text(320,102,'h = 6.626 070 15 × 10⁻³⁴ J s','t s','middle',16)
    for x,title in ((18,'1  Weighing mode'),(338,'2  Velocity mode')):
        f.rect(x,124,284,232,'plate',rx=7)
        f.text(x+142,149,title,'t b','middle',15)
        # The same coil in a magnetic gap, seen in cut-away.
        for xx,lab,cls in ((x+42,'N','wash-p'),(x+203,'S','wash-e')):
            f.rect(xx,214,38,69,cls,rx=3);f.rect(xx,214,38,69,'ln',rx=3)
            f.text(xx+19,254,lab,'t b','middle',14)
        f.rect(x+103,230,77,29,'water',rx=4)
        for k in range(5):f.line(x+111+13*k,233,x+111+13*k,256,'ln e')
    # First mode: coil and mass stationary; opposing forces balance.
    f.mass_block(139,175,42,33,'m',15)
    f.line(160,208,160,230,'ln')
    f.force(177,221,0,-41)
    f.force(141,213,0,41)
    f.text(218,195,'magnetic','t p',size=12);f.text(218,212,'support','t p',size=12)
    f.text(99,278,'mg','t p b','end',13)
    f.text(160,313,'stationary coil: mg = B L I','t s','middle',14)
    f.text(160,338,'measure the balancing current I','t m','middle',12)
    # Second mode: no load/current, motion produces an open-circuit voltage.
    f.vector(480,220,0,-45)
    f.text(498,184,'speed v','t e b',size=12)
    f.path('M441,245 H430 V165 H588 V213 H570','ln');f.line(518,245,552,245,'ln')
    f.circle(552,213,18,'block');f.text(552,218,'V','t b','middle',15)
    f.line(552,231,552,245,'ln')
    f.text(480,313,'moving coil: U = B L v','t s','middle',14)
    f.text(480,338,'measure speed v and voltage U','t m','middle',12)
    f.text(320,386,'Combine the two modes: mgv = UI. The unknown B L cancels.','t b','middle',14)
    f.text(320,411,'Schematic measurement principle; the coil is not weighed and moved at the same time.','t m','middle',12)
    return f.svg()


# ------------------------------------------------------------------ mpemba
@figure
def s_mpemba_curves():
    """Schematic cooling curves for hot vs cold water in a freezer, illustrating why identical states at 35 °C cannot cross."""
    f = Fig(640, 330, "Graph of water temperature (degrees C) against time in a freezer. A cold cup starting at 35 degrees C "
                      "cools along a solid curve to 0 degrees C. A hot cup starting at 90 degrees C must pass through 35 "
                      "degrees C on the way down: if the two cups are identical then, the hot cup stays behind by the head "
                      "start (solid curve). For the Mpemba effect to happen, the hot cup must follow the steeper dashed curve "
                      "and cross ahead. The curves end at 0 degrees C; they do not show complete freezing")
    x0, y0, w, h = 76, 238, 510, 196
    f.axis(x0, y0, w, h, 'time in freezer', 'temperature (°C)',
           ticks={'y': [(0, '0°'), (68, '35°'), (175, '90°')]})

    # Horizontal reference line at 35 °C (y = y0 - 68 = 170) and 0 °C (y0 = 238)
    y35 = y0 - 68
    y90 = y0 - 175
    f.line(x0, y35, x0 + w - 20, y35, 'ln dash')
    f.text(x0 + w - 22, y35 - 6, 'cold cup’s starting temperature (35 °C)', 't m', 'end', 11)

    # Curve 1: Cold cup starting at 35 °C, reaching 0 °C at x = x0 + 300
    cold_pts = [
        (x0, y35),
        (x0 + 90, y0 - 42),
        (x0 + 190, y0 - 18),
        (x0 + 300, y0),
    ]
    f.path(catmull(cold_pts), 'ln e')
    f.circle(x0, y35, 4, 'pt-e')
    f.circle(x0 + 300, y0, 4, 'pt-e')
    f.text(x0 + 82, y0 - 22, 'cold start (35 °C)', 't e b', 'start', 12)

    # Curve 2: Hot cup starting at 90 °C, reaching 35 °C at x = x0 + 130
    hot_to_35 = [
        (x0, y90),
        (x0 + 60, y0 - 115),
        (x0 + 130, y35),
    ]
    f.path(catmull(hot_to_35), 'ln p')
    f.circle(x0, y90, 4, 'pt-p')
    f.circle(x0 + 130, y35, 4.5, 'pt-p')
    f.text(x0 + 14, y90 + 6, 'hot start (90 °C)', 't p b', 'start', 12)

    # Branch A (solid): if identical to the cold cup once it reaches 35 °C, it is simply shifted right by 130 units
    same_after_35 = [
        (x0 + 130, y35),
        (x0 + 220, y0 - 42),
        (x0 + 320, y0 - 18),
        (x0 + 430, y0),
    ]
    f.path(catmull(same_after_35), 'ln p')
    f.circle(x0 + 430, y0, 4, 'pt-p')
    f.lines(x0 + 336, y0 - 54, [
        'if identical at 35 °C:',
        'reaches 0 °C later',
    ], 't m', 'start', 12)

    # Branch B (dashed): Mpemba crossover if hot cup arrives at 35 °C changed (less mass, convection, frost contact)
    mpemba_branch = [
        (x0 + 130, y35),
        (x0 + 180, y0 - 32),
        (x0 + 235, y0),
    ]
    f.path(catmull(mpemba_branch), 'ln p', extra='stroke-dasharray="6 4"')
    f.circle(x0 + 235, y0, 4, 'pt-p')
    f.lines(x0 + 150, y0 - 122, [
        'to reach 0 °C first (dashed), it must',
        'arrive at 35 °C changed (evaporation,',
        'convection, less gas, melted frost)',
    ], 't p', 'start', 12)
    f.arrow(x0 + 215, y0 - 82, x0 + 182, y0 - 38, 'proton')
    f.text(320, 314, 'Reaching 0 °C is not freezing solid: latent heat must still leave.', 't m', 'middle', 12)
    return f.svg()


# ------------------------------------------------------------------ trams
@figure
def s_tram_field():
    """Tram side view plus a perpendicular wire cross-section and an explicitly enlarged compass deflection."""
    field_nt, earth_nt = 500, 38400
    actual_angle = math.atan(field_nt / earth_nt)
    angle_enlargement = 30
    f = Fig(640, 380, "A side view of a Bombay tram taking current from an overhead wire and returning it through rails. "
                      "A separate end-on cross-section shows circular field lines in the plane perpendicular to the wire. "
                      "The ideal single-wire field estimate at 200 metres is 500 nanotesla, 1.3 percent of the horizontal "
                      "Earth field of 38,400 nanotesla. A perpendicular field this size deflects a compass about 0.75 degrees; "
                      "the needle angle is enlarged thirty times to make that small change visible.")
    gy, tx, ox = 204, 120, 300
    f.text(24, 24, 'Side view: the tram and its current path', 't b', size=13)
    f.ground(24, gy, 346)
    f.line(54, gy, 54, 48, 'ln m')
    f.line(48, 52, 232, 52, 'ln p')
    f.arrow(180, 52, 228, 52, 'proton')
    f.text(120, 42, 'overhead current ≈ 500 A', 't p', 'middle', 12)
    f.rect(tx - 44, gy - 68, 88, 54, 'plate', rx=6)
    f.rect(tx - 44, gy - 68, 88, 54, 'ln', rx=6)
    for wx in (-28, 0, 28):
        f.rect(tx + wx - 10, gy - 56, 20, 18, 'wash-n', rx=2)
    f.circle(tx - 24, gy - 7, 7, 'fill-ink')
    f.circle(tx + 24, gy - 7, 7, 'fill-ink')
    f.path(f'M{tx},{gy - 68} L{tx - 14},92 L{tx},52 L{tx + 14},92 Z', 'ln')
    f.text(tx, gy - 24, 'Bombay tram', 't b', 'middle', 12)
    f.arrow(156, 217, 90, 217, 'proton')
    f.text(24, 236, 'rail return', 't p', size=12)

    # Observatory in the same side view; the magnetometer inset is explicitly magnified.
    f.rect(ox - 56, gy - 84, 112, 84, 'plate', rx=4)
    f.path(f'M{ox - 56},{gy - 84} A56 40 0 0 1 {ox + 56},{gy - 84}', 'plate')
    f.path(f'M{ox - 56},{gy - 84} A56 40 0 0 1 {ox + 56},{gy - 84}', 'ln')
    f.rect(ox - 56, gy - 84, 112, 84, 'ln', rx=4)
    f.lines(ox, 78, ['Colaba', 'Observatory'], 't b', 'middle', 12)
    cy = gy - 42
    f.circle(ox, cy, 26, 'wash-n'); f.circle(ox, cy, 26, 'ln')
    f.line(ox, cy - 22, ox, cy + 22, 'ln dash')
    dx = 22 * math.sin(actual_angle * angle_enlargement)
    dy = 22 * math.cos(actual_angle * angle_enlargement)
    f.line(ox - dx, cy + dy, ox + dx, cy - dy, 'ln p')
    f.circle(ox, cy, 3, 'fill-ink')
    f.text(ox, 222, 'needle angle ×30', 't m', 'middle', 12)
    f.bracket_label(tx, ox, 246, '200 m · scene not to scale', 12, up=False)

    # This is a different view, perpendicular to the wire, not a field drawn
    # in the tram's side-view plane. Out of the page means anticlockwise field.
    cx, cy = 500, 116
    f.lines(cx, 26, ['End-on view of one wire', 'plane perpendicular to the wire'], 't b', 'middle', 12)
    for rad in (24, 43, 62):
        f.circle(cx, cy, rad, 'ln e')
    f.circle(cx, cy, 7, 'block'); f.circle(cx, cy, 2.5, 'fill-ink')
    f.arrow(cx + 62, cy + 12, cx + 62, cy - 12, 'vector')
    f.lines(cx, 204, ['• current towards you', 'circles wrap around the wire'], 't m', 'middle', 12)
    f.lines(24, 294, ['One-wire estimate: B = μ₀I ÷ (2πr) ≈ 500 nT at 200 m.',
                       '500 ÷ 38,400 = 1.3% of Earth’s horizontal field.',
                       'If perpendicular, the compass turns arctan(500 ÷ 38,400) ≈ 0.75°.',
                       'Colaba Observatory moved to Alibag in 1904.'], 't', size=12)
    f.text(24, 368, 'Actual return currents and routes change the field; the estimate treats one long straight wire.', 't m', size=12)
    return f.svg()


# ------------------------------------------------------------------ wobbly-bridge
@figure
def s_wobble_loop():
    """London Millennium Bridge feedback loop between sideways deck sway and walker steps, broken by dampers."""
    f = Fig(640, 265, "A cycle of three boxes connected by arrows around a loop: '1. Deck sways a little to the side' leads "
                      "to '2. Walkers widen and time their steps to keep balance', which leads to '3. Sideways foot pushes "
                      "add in time with the sway', feeding back into larger sway. At the right, 'Viscous & mass dampers "
                      "(2001–02)' drain energy out of the bridge faster than steps put it in, breaking the loop")
    # Three loop boxes arranged in a triangle on the left/centre
    # Box 1 (top)
    f.rect(144, 22, 220, 54, 'plate', rx=8)
    f.rect(144, 22, 220, 54, 'ln', rx=8)
    f.text(254, 45, '1. Small sideways deck sway', 't b', 'middle', 13)
    f.text(254, 63, '(up to 7 cm on opening day)', 't m', 'middle', 12)

    # Box 2 (bottom left)
    f.rect(22, 152, 212, 64, 'plate', rx=8)
    f.rect(22, 152, 212, 64, 'ln', rx=8)
    f.text(128, 176, '3. Sideways pushes add up', 't b', 'middle', 13)
    f.text(128, 194, 'every step feeds energy', 't m', 'middle', 12)
    f.text(128, 209, 'into the same sway', 't m', 'middle', 12)

    # Box 3 (bottom centre-right)
    f.rect(274, 152, 212, 64, 'plate', rx=8)
    f.rect(274, 152, 212, 64, 'ln', rx=8)
    f.text(380, 176, '2. Walkers adjust balance', 't b', 'middle', 13)
    f.text(380, 194, 'steps widen and fall into', 't m', 'middle', 12)
    f.text(380, 209, 'time with the moving floor', 't m', 'middle', 12)

    # Curved arrows connecting 1 -> 2 -> 3 -> 1
    f.curved_arrow(336, 78, 384, 148, bend=-22, kind='proton')
    f.arrow(270, 184, 238, 184, kind='proton')
    f.curved_arrow(124, 148, 172, 78, bend=-22, kind='proton')
    f.text(254, 122, 'positive feedback loop', 't p b', 'middle', 13)

    # Damper sink at far right breaking the loop
    f.rect(508, 22, 114, 194, 'wash-n', rx=8)
    f.rect(508, 22, 114, 194, 'ln e', rx=8)
    f.text(565, 48, 'The cure', 't e b', 'middle', 14)
    f.text(565, 66, '(2001 to 2002)', 't m', 'middle', 12)
    # Piston damper icon
    f.rect(547, 86, 36, 46, 'plate', rx=3)
    f.rect(547, 86, 36, 46, 'ln e', rx=3)
    f.line(553, 108, 577, 108, 'ln e', extra='stroke-width="3"')
    f.line(565, 74, 565, 108, 'ln e')
    f.lines(565, 154, [
        '37 fluid dampers',
        '+ 52 mass dampers',
        'drain energy faster',
        'than steps feed it.',
    ], 't', 'middle', 11)

    # Energy drain arrow from top box into damper box
    f.vector(368, 49, 134, 0)
    f.lines(434, 72, ['energy drained', 'out of the bridge'], 't e', 'middle', 12)
    return f.svg()
