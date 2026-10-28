"""Chapter 2 figures: why things keep moving.

All drawings are ours. c2_friction_closeup is drawn from the idea in OpenStax College Physics 2e Fig 5.2 (rough surfaces
touch at high points); c2_train_brake redraws the braking-frame idea of 8.01SC Lesson 4.4 as a Mumbai local. Nothing is
copied. Helpers come from figs_core (force, vector, axis, ground, mass_block, arrow, text).
"""
from figs_core import Fig, figure


def _person(f, x, yf, h=92, lean=0, cls='ln'):
    """A stick figure with its feet at (x, yf); `lean` shifts the head sideways (positive = right)."""
    hx, hy = x + lean, yf - h + 10
    hip = yf - 26
    f.circle(hx, hy, 9, cls)
    f.line(x, hip, hx, hy + 9, cls)
    f.line(x - 10, yf, x, hip, cls)
    f.line(x + 10, yf, x, hip, cls)
    sx, sy = x + lean * 0.6, hip - (h - 36) * 0.6
    f.line(sx, sy, sx - 14, sy + 20, cls)
    f.line(sx, sy, sx + 16, sy + 16, cls)
    return f


@figure
def c2_book_slide():
    f = Fig(640, 290, 'Three snapshots of a book on a table: pushed by a hand and speeding up; released and slowing, with an unknown backward contact force; and stopped. Page edges identify the same book at each stage. Blue velocity arrows shorten; red arrows are forces.')
    f.text(24,28,'A shove ends. Motion does not end at once.', 't b',size=17)
    f.ground(22,184,594)
    for x,n,title,note in ((72,'1','While you push','the book speeds up'),(292,'2','After you let go','it is still moving'),(510,'3','A little later','it has stopped')):
        f.book(x,150,76,34)
        f.text(x+38,222,n+'  '+title,'t b','middle',14)
        f.text(x+38,244,note,'t m','middle',13)
    # A recognisable hand touches only in the first snapshot.
    f.path('M28,174 L28,160 Q29,155 34,157 L45,162 L63,162 Q70,162 70,167 L70,177 L46,181 Z','wash-p')
    f.path('M28,174 L28,160 Q29,155 34,157 L45,162 L63,162 Q70,162 70,167 L70,177 L46,181','ln')
    f.force(71,167,62,0)
    f.vector(82,120,84,0)
    f.text(110,98,'moving right','t e','middle',13)
    f.vector(300,120,42,0)
    f.arrow(291,166,242,166,'muted',dash=True)
    f.text(235,172,'?','t b','end',20)
    f.text(330,98,'moving more slowly','t e','middle',13)
    f.text(548,120,'v = 0','t e b','middle',16)
    f.text(320,278,'What touches the sliding book and pushes it backwards?','t','middle',14)
    return f.svg()


@figure
def c2_arrow_forces():
    f = Fig(640, 270, 'An arrow in flight. Named forces: the Earth pulls it down, the air pushes it backward. Its velocity '
                      'is drawn separately as a blue arrow. A crossed-out dashed arrow shows Aristotle\'s forward push '
                      'from the air, which no object exerts.')
    x1, y1, x2, y2 = 170, 170, 430, 110
    ux, uy = 0.9745, -0.2249
    # the arrow itself: shaft, head, fletching
    f.line(x1, y1, x2, y2, 'ln', 'stroke-width="3"')
    f.path(f'M{x2 + ux * 14:.1f},{y2 + uy * 14:.1f} L{x2 - uy * 5:.1f},{y2 + ux * 5:.1f} L{x2 + uy * 5:.1f},{y2 - ux * 5:.1f} Z', 'fill-ink')
    for k in (0, 14):
        bx, by = x1 + ux * k, y1 + uy * k
        f.line(bx, by, bx - ux * 10 - uy * 8, by - uy * 10 + ux * 8, 'ln')
        f.line(bx, by, bx - ux * 10 + uy * 8, by - uy * 10 - ux * 8, 'ln')
    mx, my = 300, 140
    # velocity (not a force), offset above the shaft
    f.vector(mx - uy * 26, my - ux * 26, ux * 90, uy * 90, 'velocity (not a force)', 13)
    # forces, labelled by hand so nothing collides with the shaft
    f.force(mx, my, 0, 70)
    f.text(310, 214, 'pull of the Earth', 't p b', 'start', 13)
    f.force(mx, my, -ux * 70, -uy * 70)
    f.text(236, 128, 'push of the air (slows it)', 't p b', 'end', 13)
    # Aristotle's forward push from behind, crossed out
    ax, ay = 118, 184
    f.arrow(ax, ay, ax + ux * 60, ay + uy * 60, 'muted', dash=True)
    cx, cy = ax + ux * 30, ay + uy * 30
    f.line(cx - 7, cy - 7, cx + 7, cy + 7, 'ln')
    f.line(cx - 7, cy + 7, cx + 7, cy - 7, 'ln')
    f.text(30, 214, "Aristotle's idea: air pushing from behind.", 't m', 'start', 12)
    f.text(30, 230, 'No object exerts it, so it is crossed out.', 't m', 'start', 12)
    return f.svg()


def _ramp_panel(f, x0, start_h, bottom, down_w, up_pts, ghost=None, flat=False):
    f.line(x0, start_h, x0 + down_w, bottom, 'ln')
    f.path('M' + ' L'.join(f'{px},{py}' for px, py in up_pts), 'ln')
    f.line(x0, start_h, up_pts[-1][0], start_h, 'ln dash')
    f.circle(x0 + 15, start_h + 5, 7, 'fill-ink')
    if ghost:
        f.circle(ghost[0], ghost[1], 7, 'ln m')
    if flat:
        f.arrow(up_pts[-1][0] - 60, bottom - 12, up_pts[-1][0] - 6, bottom - 12, 'ink')
        f.text(up_pts[-1][0] - 33, bottom - 20, 'and on', 't m', 'middle', 12)


@figure
def c2_two_ramps():
    f = Fig(640, 232, "Galileo's two-ramp thought experiment in three panels: a steep second ramp, a shallower one and a "
                      "flat one. A dashed line marks the starting height. The ball regains it on the steep and shallow "
                      "ramps, travelling further on the shallow one, and can never regain it on the flat ramp.")
    f.text(22, 60, 'starting height', 't m', 'start', 12)
    _ramp_panel(f, 20, 70, 140, 70, [(90, 140), (160, 70)], ghost=(147, 73))
    f.text(90, 176, 'steep second ramp:', 't', 'middle', 12)
    f.text(90, 192, 'back to nearly', 't m', 'middle', 12)
    f.text(90, 207, 'the same height', 't m', 'middle', 12)
    _ramp_panel(f, 200, 70, 140, 70, [(270, 140), (430, 70)], ghost=(413, 70))
    f.text(315, 176, 'shallower ramp:', 't', 'middle', 12)
    f.text(315, 192, 'further along it,', 't m', 'middle', 12)
    f.text(315, 207, 'same height', 't m', 'middle', 12)
    _ramp_panel(f, 450, 70, 140, 70, [(520, 140), (620, 140)], flat=True)
    f.text(535, 176, 'flat:', 't', 'middle', 12)
    f.text(535, 192, 'never back to its height,', 't m', 'middle', 12)
    f.text(535, 207, 'so it never stops', 't m', 'middle', 12)
    return f.svg()


@figure
def c2_train_brake():
    f = Fig(640, 300, 'A braking local train seen from the platform and from inside. On the platform view the floor '
                      'pushes the passenger\'s feet backward while her upper body keeps the old velocity, so she tilts '
                      'forward. Inside, a dashed arrow marks the apparent forward push that no object exerts.')
    f.text(200, 40, 'From the platform', 't b', 'middle', 13)
    f.text(520, 40, 'From inside the train', 't b', 'middle', 13)
    f.line(405, 50, 405, 280, 'ln dash')
    # the carriage
    f.rect(40, 95, 340, 120, 'plate', rx=8)
    f.circle(90, 227, 12, 'ln')
    f.circle(330, 227, 12, 'ln')
    f.ground(20, 239, 380)
    f.vector(60, 72, 90, 0, 'train slowing', 13)
    # the passenger, tilting forward (to the right, the way the train moves)
    _person(f, 150, 215, 92, lean=18)
    f.force(150, 212, -60, 0)
    f.text(172, 206, 'friction from the floor', 't p b', 'start', 12)
    f.text(172, 221, 'slows her feet', 't p b', 'start', 12)
    f.vector(186, 118, 60, 0)
    f.text(256, 112, 'her top half keeps', 't e', 'start', 12)
    f.text(256, 127, 'the old velocity', 't e', 'start', 12)
    # inside view
    f.ground(430, 215, 190)
    _person(f, 525, 215, 92, lean=18)
    f.arrow(505, 152, 567, 152, 'muted', dash=True)
    f.text(430, 100, 'feels like a push forward,', 't m', 'start', 12)
    f.text(430, 115, 'but nothing exerts it', 't m', 'start', 12)
    return f.svg()


@figure
def c2_friction_closeup():
    f = Fig(640, 330, 'A sliding block and a connected magnified contact cut-away. Upward normal force and backward friction are two components of the contact interaction. Microscopic junctions deform and break as surfaces slide; the roughness and deformation are enlarged, not measured geometry.')
    f.text(24,28,'The contact is where the push happens','t b',size=17)
    f.mass_block(72,132,120,52,'block',15)
    f.ground(30,184,238)
    f.vector(112,108,90,0)
    f.text(158,86,'sliding right','t e','middle',13)
    f.force(132,180,0,-48)
    f.force(72,180,-43,0)
    f.text(29,218,'friction: backwards','t p b',size=13)
    f.text(132,244,'normal: out of the surface','t p','middle',12)
    f.circle(175,184,13,'ln e')
    f.line(185,175,334,80,'ln m');f.line(185,193,334,243,'ln m')
    f.rect(334,61,282,203,'plate',rx=8)
    top=[(334,137),(355,137),(370,154),(387,142),(405,157),(426,139),(446,152),(464,142),(482,158),(503,141),(524,155),(545,139),(567,153),(590,140),(616,141)]
    bot=[(334,181),(355,179),(370,154),(387,174),(405,157),(426,178),(446,175),(464,178),(482,158),(503,180),(524,155),(545,178),(567,176),(590,180),(616,179)]
    f.path('M334,62 L616,62 L616,141 '+' '.join(f'L{x},{y}' for x,y in reversed(top))+' Z','wash-e')
    f.path('M334,263 L616,263 L616,179 '+' '.join(f'L{x},{y}' for x,y in reversed(bot))+' Z','wash-n')
    f.path('M'+' L'.join(f'{x},{y}' for x,y in top),'ln')
    f.path('M'+' L'.join(f'{x},{y}' for x,y in bot),'ln')
    for x,y in ((370,154),(405,157),(482,158),(524,155)):
        f.circle(x,y,5,'wash-p');f.line(x-4,y,x+4,y,'ln p')
    f.text(475,89,'block surface','t b','middle',13)
    f.text(475,238,'table surface','t b','middle',13)
    f.vector(516,106,58,0)
    f.text(475,291,'tiny contact junctions deform and break','t','middle',12)
    f.text(320,322,'Magnified model: real contact also depends on adhesion and material deformation.','t m','middle',12)
    return f.svg()


@figure
def c2_friction_graph():
    f = Fig(640, 300, 'A schematic graph of friction against the push on an object. From the origin, friction rises '
                      'along a diagonal, matching the push exactly while nothing moves. At a limit the object slips, and '
                      'friction drops to a slightly lower, roughly steady sliding value.')
    f.axis(70, 250, 520, 200, 'push on the object (N)', 'friction from the floor (N)')
    f.line(70, 250, 260, 60, 'ln p')
    f.circle(260, 60, 4, 'fill-ink')
    f.line(260, 60, 260, 95, 'ln dash')
    f.line(260, 95, 560, 95, 'ln p')
    f.text(200, 200, 'at rest: friction', 't', 'start', 12)
    f.text(200, 215, 'matches your push exactly', 't', 'start', 12)
    f.text(272, 56, 'slips here', 't b', 'start', 12)
    f.text(420, 84, 'sliding: a little less, and roughly steady', 't m', 'middle', 12)
    f.text(86, 240, 'no push, no friction', 't m', 'start', 12)
    return f.svg()
