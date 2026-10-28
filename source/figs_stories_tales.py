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
    """Faraday's 1836 12-foot foil cube: charge on outside, sparks outside, zero electric field and straight gold leaves inside."""
    f = Fig(640, 300, "Faraday's 12-foot foil-covered cube connected to an electrostatic generator on the left. Plus signs "
                      "sit all around the outside surface of the metal shell and sparks jump from the corners, while inside "
                      "the hollow box the electric push is zero and the two gold leaves of the electroscope hang straight down")
    # Electrostatic generator at left
    gx, gy = 74, 175
    f.rect(gx - 34, gy + 28, 68, 16, 'block', rx=2)
    f.line(gx, gy - 26, gx, gy + 28, 'ln')
    f.circle(gx, gy - 26, 28, 'plate')
    f.circle(gx, gy - 26, 28, 'ln')
    f.text(gx, gy - 22, 'generator', 't m', 'middle', 11)
    # Charging wire to cube with spark
    f.line(gx + 28, gy - 26, 178, gy - 26, 'ln')
    f.path('M148,149 L156,139 L160,153 L169,141 L176,149', 'ln p')
    f.text(144, 124, 'sparks', 't p b', 'end', 12)

    # Outer foil cube (12 ft = 3.7 m)
    bx, by, bw, bh = 182, 46, 276, 206
    f.rect(bx, by, bw, bh, 'plate', rx=4)
    f.rect(bx + 8, by + 8, bw - 16, bh - 16, 'wash-n', rx=2)
    f.rect(bx, by, bw, bh, 'ln', rx=4)

    # Surface charges (+ badges) distributed around outside perimeter only
    top_xs = [202, 248, 296, 344, 392, 438]
    for x in top_xs:
        f.text(x, by - 7, '+', 't p b', 'middle', 15)
        f.text(x, by + bh + 16, '+', 't p b', 'middle', 15)
    side_ys = [78, 122, 166, 210, 238]
    for y in side_ys:
        f.text(bx - 12, y, '+', 't p b', 'middle', 15)
        f.text(bx + bw + 12, y, '+', 't p b', 'middle', 15)

    # Corner spark on top right
    f.path(f'M{bx + bw},{by + 12} L{bx + bw + 16},{by + 2} L{bx + bw + 12},{by - 8} L{bx + bw + 28},{by - 16}', 'ln p')

    # Dimension bracket at bottom
    f.bracket_label(bx, bx + bw, by + bh + 26, '12 ft (3.7 m) foil-covered cube', 12, up=False)

    # Inside the cube: electroscope jar & straight gold leaves
    ex, ey = 320, 152
    f.circle(ex, ey - 46, 7, 'fill-ink')                      # brass knob
    f.line(ex, ey - 39, ex, ey - 10, 'ln')                    # stem
    f.rect(ex - 32, ey - 22, 64, 72, 'plate', rx=8)           # glass jar
    f.rect(ex - 32, ey - 22, 64, 72, 'ln', rx=8)
    # Two gold leaves hanging straight down side by side
    f.line(ex - 3, ey - 10, ex - 3, ey + 28, 'ln p')
    f.line(ex + 3, ey - 10, ex + 3, ey + 28, 'ln p')
    f.text(ex, ey - 64, 'inside the metal shell:', 't b', 'middle', 13)
    f.text(ex, ey + 72, 'gold leaves hang straight', 't b', 'middle', 13)
    f.text(ex, ey + 88, '(no electric push inside)', 't m', 'middle', 12)

    # Explanatory callouts at right
    f.lines(482, 92, [
        'Outside:',
        'charges repel and spread',
        'over the outer foil skin.',
    ], 't', 'start', 12)
    f.lines(482, 166, [
        'Inside:',
        'surface charges arrange',
        'until their pushes cancel',
        'everywhere in the hollow.',
    ], 't m', 'start', 12)
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
    """Old kilogram (Le Grand K artifact in Sèvres) vs new kilogram (20 May 2019 Planck constant + Kibble balance)."""
    f = Fig(640, 330, "Left: from 1889 to 2019, the kilogram was defined by Le Grand K, a 39 mm by 39 mm platinum-iridium "
                      "cylinder under three glass bell jars in Sèvres, which drifted by about 50 micrograms over a century "
                      "relative to its copies. Right: since 20 May 2019, the kilogram is fixed by the Planck constant h = "
                      "6.626 070 15 × 10^-34 kg m^2/s and realised anywhere on a Kibble balance against an electric force")
    # Left panel: 1889–2019 Artifact
    f.rect(18, 20, 290, 288, 'plate', rx=8)
    f.text(163, 46, '1889 to 2019: one metal object', 't b', 'middle', 14)
    f.text(163, 64, 'Le Grand K in a vault at Sèvres', 't m', 'middle', 12)

    # Base + three nested bell jars + 39 mm cylinder
    cx, by = 163, 184
    f.rect(cx - 78, by, 156, 12, 'block', rx=2)
    for jr, jh in ((64, 96), (50, 80), (36, 64)):
        f.path(f'M{cx - jr},{by} L{cx - jr},{by - jh + jr * 0.6:.1f} '
               f'A{jr} {jr * 0.6:.1f} 0 0 1 {cx + jr},{by - jh + jr * 0.6:.1f} L{cx + jr},{by}', 'ln m')
    # 39 mm x 39 mm cylinder inside
    f.rect(cx - 18, by - 38, 36, 38, 'fill-ink', rx=2)
    f.text(cx, by - 15, '1 kg', 't b', 'middle', 11, extra='style="fill:var(--paper)"')
    f.text(cx + 46, by - 22, '39 mm', 't m', 'start', 11)
    f.lines(163, 264, [
        'Drifted ~50 µg in 100 years',
        'against its sister copies;',
        'only one vault had the original.',
    ], 't p', 'middle', 12)

    # Right panel: 2019–present Constant of nature
    f.rect(332, 20, 290, 288, 'plate', rx=8)
    f.text(477, 46, 'Since 20 May 2019: a rule of nature', 't b', 'middle', 14)
    f.text(477, 64, 'Planck constant fixed for all laboratories', 't m', 'middle', 12)

    # Formula banner at top of right card
    f.rect(354, 78, 246, 32, 'wash-n', rx=4)
    f.text(477, 99, 'h = 6.626 070 15 × 10⁻³⁴ kg m²/s', 't s b', 'middle', 13)

    # Schematic Kibble balance comparing gravitational pull mg with electromagnetic force
    bx, py = 477, 132
    f.line(bx, py - 12, bx, py + 58, 'ln')                    # central pillar
    f.rect(bx - 24, py + 58, 48, 8, 'block', rx=2)
    f.line(bx - 70, py, bx + 70, py, 'ln')                    # balance beam
    f.circle(bx, py, 4, 'fill-ink')
    # Left pan: mass m pulled by gravity mg
    lx = bx - 64
    f.line(lx, py, lx, py + 32, 'ln')
    f.rect(lx - 14, py + 32, 28, 22, 'fill-ink', rx=2)
    f.text(lx, py + 47, 'm', 't b', 'middle', 12, extra='style="fill:var(--paper)"')
    f.force(lx, py + 54, 0, 26, 'weight mg', 12)
    # Right pan: coil in magnet pulled by electric current measured via h
    rx = bx + 64
    f.line(rx, py, rx, py + 32, 'ln')
    f.rect(rx - 18, py + 32, 36, 22, 'plate', rx=3)
    f.rect(rx - 18, py + 32, 36, 22, 'ln e', rx=3)
    f.text(rx, py + 47, 'coil', 't e b', 'middle', 11)
    f.vector(rx, py + 32, 0, -24, 'electric pull', 12)

    f.lines(477, 264, [
        'Never wears out or drifts;',
        'any national lab can build',
        '1 kg from the fixed number h.',
    ], 't', 'middle', 12)
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
