"""Figures for the engine self-test fixture (tests/fixture/src/ch00.md). Loaded only when --src points at the fixture."""
from figs_core import Fig, figure


@figure
def c0_helpers():
    f = Fig(640, 320, 'Every figure helper: forces on a block, a velocity vector, graph axes, a light ray, a wave, a spring and the ground')
    f.ground(20, 150, 260)
    f.mass_block(60, 100, 90, 50, '2 kg')
    f.force(105, 125, 0, 62, 'weight 20 N')
    f.force(105, 100, 0, -62, 'push of floor 20 N')
    f.force(150, 125, 62, 0, 'pull 5 N')
    f.vector(170, 70, 50, 0, 'v = 2 m/s')
    f.spring(320, 30, 320, 150, coils=7)
    f.mass_block(302, 150, 36, 30, 'm')
    f.axis(380, 150, 230, 110, 'time (s)', 'height (m)', ticks={'x': [(60, '1'), (120, '2'), (180, '3')], 'y': [(50, '5'), (100, '10')]})
    f.wave(380, 100, 210, 30, 105, cls='ln e')
    f.ray(30, 305, 260, 250, chevrons=2)
    f.text(150, 300, 'a light ray', 't m', 'start', 13)
    f.wave(330, 270, 280, 16, 70, cls='ln m')
    f.text(330, 305, 'a wave: wavelength 70, amplitude 16', 't m', 'start', 13)
    return f.svg()


@figure
def c0_globe():
    f = Fig(1000, 300, 'A ball in space with an arrow showing the direction it spins', wide=True)
    f.circle(500, 150, 110, 'ln')
    f.path('M390,150 Q500,200 610,150', 'ln m')
    f.curved_arrow(430, 60, 570, 60, bend=-30)
    f.text(500, 290, 'turn it in 3D', 't m', 'middle', 13)
    return f.svg()


@figure
def c0_ripples():
    f = Fig(640, 200, 'Two rows of ripples spreading from two sources')
    for k in range(4):
        f.wave(40, 50 + k * 34, 560, 8, 60, phase=k * 0.8, cls='ln e' if k % 2 else 'ln m')
    f.text(320, 190, 'ripples from two sources', 't m', 'middle', 13)
    return f.svg()
