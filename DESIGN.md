# The Moving World: Powers of Ten

The reader is Kym, twelve, in Mumbai. Keep the book's warm paper, serif reading typography, restrained blue accents, and personal voice. Scope new layout styles to the scale explorer; the other explorers share the older xp classes.

The horizontal width of the complete scene is the physical view width. Multiplying it by ten must shrink each fixed physical length by ten. Landmarks carry approximate physical dimensions independently of their display framing. An illustration is a model, never a measured map.

Primary hierarchy: current width, visual scene, paired ×10 controls, ruler, one observation, landmarks. The guide sits alongside the scene on wide screens and immediately after the step buttons on narrow screens. Opening it preserves the view; beginning a lesson is explicit. Detailed maths and qualifications live in a disclosure.

Use native buttons, select and range controls. Announce settled values, respect still/reduced-motion mode, fit landmark drawings inside both canvas dimensions, release observers and animation work on close, and package illustrations for offline and single-file builds.

Illustrations in source/assets/scale are generated using the built-in image tool. Neighbourhood: top-down Mumbai-inspired apartment and surrounding lanes, brown ink and muted watercolor on cream, no labels. Coast: imaginary coastal city, hills, rivers and teal sea in the same editorial palette, no labels. Apartment: detailed orthographic top-down Mumbai-inspired rooms and central desk, matching ink-and-watercolor palette, no labels. Reference widths are illustrative assignments, 10 m, 100 m and 100 km; they are not real maps. The original generated images remain in the Codex generated_images folder. Space and microscopic reference diagrams extend the existing book's canvas drawing library.

Verification: node source/tests/test_scale_model.mjs; .venv/bin/python source/tests/test_scale_browser.py (serve source/build/site at localhost:8765 first). The browser suite covers six widths, three themes, guide behaviour, controls, bounds, keyboard, reopening, and offline reload. Retain screenshots under source/build/scale-checks for visual review.
