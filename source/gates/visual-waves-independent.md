# Independent thermal, waves and optics gate

29 October 2026, 04:20 UTC. Fresh review against `source/SKILL.md`, the complete `source/PLAYBOOK.md`, and the C08–C11, S01, S04 and S11 acceptance rows in `docs/threejs-implementation-plan.md`. This review examined the actual domain mounts, model equations, lesson catalog, shared shell, preserved conduction/interference implementations, and story dispatch. It did not treat the numerical suite or the presence of a catalog record as proof of correct teaching geometry.

**Initial verdict: CHANGES REQUIRED.** The implementation contains substantial useful, correctly calculated work, but the acceptance register cannot honestly be marked fully verified. The blockers below are implementation findings, not suggestions to postpone accepted work. Parent has been sent each substantive blocker while this audit was running; fixes made after this timestamp need a separate closure receipt.

## Evidence boundary

- Source: `live/waves_models.mjs`, `waves_draw.js`, `waves_thermal.js`, `waves_motion.js`, `waves_optics.js`, `waves_colour.js`, `w_waveslab.js`, `lab_kit.js`, `lessons/waves.json`, `app/m_labs.js`, and the relevant preserved widgets.
- Fresh desktop Chromium/SwiftShader inspection: 14 lessons opened in the built book at 1440×1000, reduced motion. Captures and readouts: `source/build/waves-independent/receipt.json` and named PNGs in the same directory. Built service-worker version was **mw-b9c07a410691**. No page errors occurred in these openings. This was a focused renderer inspection, not the complete control/theme/mobile matrix.
- Previously recorded `waves-focused` screenshots were treated as older evidence. Its membrane audio failures have been reported; parent states current rebuilt membrane audio tests pass at 390/1440. This gate does not relabel that older failed receipt as a new current failure.
- Primary-source checks during this review: [OpenStax mirror construction](https://openstax.org/books/college-physics-2e/pages/25-7-image-formation-by-mirrors), [eye conjugates and accommodation](https://openstax.org/books/college-physics-2e/pages/26-1-physics-of-the-eye), and [field projection and intensity](https://openstax.org/books/college-physics-2e/pages/27-8-polarization). The Russell membrane page timed out; no fresh successful fetch of it is claimed. The repo's grounding/model derivations were inspected for the remaining models.

“PASS” below means the inspected implementation meets that row's physics/teaching obligation, subject to the separate full browser matrix and source-link correction. It does not certify hardware sensors, learning outcomes, or untested viewports.

## Per-ID findings

| ID | Verdict | Concrete evidence and remaining work |
|---|---|---|
| C08.1 | PASS | Falling mass, drop progress, paddle rotation and insulated water account use one `jouleWork` state. The readout distinguishes work from contact heating. Paddle timing is explicitly illustrative. |
| C08.2 | PASS | Overlapping Maxwell distributions and independent `mcΔT` accounts distinguish temperature from total transferred energy. Sample mass changes the account rather than fabricating more literal molecules; that marker convention and the translational-only distribution limit are stated. |
| C08.3 | PASS, conditional on B1 closure | Preserved `w_conduction.js` includes contact/gap, local vibrating sites, depth-layer gradient and joule ledger. The added insulation view gives a calculated steady gradient. Its reversed-case scene must be made consistent. |
| C08.4 | FAIL: B1 | The room→ice case flips the heat arrow while the red left block and descending left-to-right temperature graph remain the hot side. Thickness/rate mathematics is correct; the visual direction disagrees. |
| C08.5 | PASS | One energy coordinate controls temperature, phase fractions, representative lattice contraction and separate vapour markers. The plateaux are real state intervals, not an animated thermometer detached from phase. The arrangement is appropriately labelled schematic. |
| C08.6 | FAIL: B2 | Wet-bulb cases, energy per evaporated gram and reversible coastal circulation are present. The “fastest escape” animation never selects fast particles or links humidity to net escaping/returning events; its arrays are independent of those controls. |
| C09.1 | FAIL: B3 | Length and finite-angle period comparisons work. Mass changes a label/readout only; the claimed changing force is not shown because both force-segment lengths are independent of mass. |
| C09.2 | PASS | RK4 transient motion integrates drive work and damping loss; periodic response and manual impulse are distinct. Flutter uses a separately labelled steady-flow feedback envelope, without falsely imposing a gust frequency. Catalog limits should say transient plus steady response, rather than describing the entire resonance lesson as steady state only. |
| C09.3 | PASS with range caveat | Surface and red tracked parcel share the same deep-water model and slowed time; the diagram distinguishes the travelling surface from orbital parcel motion and states omitted Stokes drift. Offered extremes include kA≈1.57 (λ1 m, A.25 m), outside a small-amplitude physical wave: restrict the physical range or make the displayed exaggeration and resulting approximation explicit. |
| C09.4 | PASS | Longitudinal rows occupy a volume; pressure uses the negative spatial displacement derivative, with the correct relative phase. Probe position and echo outward/return progress are calculated. Regular markers and magnified displacement are disclosed. |
| C09.5 | PASS | Existing microphone remains separate; synthetic frequency/amplitude controls give optional audio, a fixed time window and amplitude-squared relative intensity without sound-level calibration. |
| C09.6 | PASS; S11 remains open | String sinusoidal modes and true uniform-membrane Bessel modes, fixed rim, nodal diameters, central-load trial-shape overlay and audio at the calculated frequency are implemented. The loaded case is honestly labelled a Rayleigh estimate, not a fitted tabla. |
| C09.7 | PASS | Sparse wavefronts remain centred at emission positions. Listener velocity and co-moving driver have the correct still-air radial Doppler formulas; sparse crests/slowed time are stated. |
| C10.1 | PASS | Explicit source→object→eye route, lamp-off state, blocking control, eye position and sampled outward scattering directions replace eye-emission. The explanatory apparatus remains visible with zero signal and says so. |
| C10.2 | PASS with presentation caveat | Actual perforated aperture, two object endpoints, finite-hole ray bundles, distance/hole controls and sampled extended-source umbra/penumbra account exist. The additional pinhole scene is an aperture/screen cutaway rather than a fully modelled enclosure; preserve its interpretation as an opened camera. |
| C10.3 | FAIL: B4 | Flat-mirror oblique hit violates reflection law except at one distance. Curved rays start above the visible spherical object, and symmetric image spheres cannot visibly demonstrate inversion. Correct formula labels do not repair these geometric claims. |
| C10.4 | PASS | Existing Snell view remains; fixed-eye coin uses a bisection-solved refraction crossing and checks rim clearance. Bent guide traces actual circle intersections/reflections and stops at a transmitting contact. |
| C10.5 | FAIL: B5 | Underwater corneal power and focus-error account are useful, but the new retinal ray/image representation is not calculated from the selected object distance and computed conjugates. Existing eye/glasses/half-pupil controls remain available. |
| C10.6 | PASS | Earth/Jupiter distance uses the same scaled geometry as the drawn positions; emission, flight progress and reception clocks are separated. Fizeau uses the historical path/tooth count and round-trip timing. The tiny wheel advance is explicitly shown as a magnified phase marker. |
| C11.1 | PASS with visual legibility caveat | The prism interfaces have calculated geometry, a moving selecting slit and second prism that admits only the selected wavelength. The droplet traces Snell/reflection paths and places observer/cone consistently. In the captured first frame the seven-band prism fan is barely separable: provide a close view or a longer separation region while preserving angles. |
| C11.2 | PASS | Preserved colour mix remains; illumination×reflectance and approximate cone-response integrals are linked pointwise and labelled illustrative. |
| C11.3 | FAIL: B6 | Optical-depth direct/removed-fraction graphs are useful, but the displayed scattered path has a scattering vertex outside the atmosphere and an incoming direction inconsistent with the Sun. |
| C11.4 | FAIL: B7 | Malus projection and Fresnel intensity are calculated correctly. The water-glare scene does not contain a ray that meets the water surface, and changing incidence changes no reflection geometry. |
| C11.5 | FAIL: B8 | Existing two-source widget retains source paths, a screen probe and exact-path strip. New slit/grating/film additions are formula graphs only, and the Arago scene has decorative rim paths whose phase sum is not linked to the plotted result. This falls short of the required visible wave mechanism for these newly accepted cases. |
| C11.6 | FAIL: B9 | Reciprocal-wavelength energy accounting and elastic/Stokes/anti-Stokes readouts are correct. The outgoing propagating sinusoid changes wavelength but retains the input temporal frequency, depicting changed light speed rather than the frequency shift. |
| S01 | PASS | Round trip, tooth/gap phase and first-extinction reference speed are inspectable in the shared Fizeau experiment. |
| S04 | PASS | Hot/cold reservoir account gives work+rejection=100 J for all offered controls and a chosen fraction of the Carnot limit. The piston is explicitly an illustration of a cycle, not an invented pressure-volume simulation. |
| S11 | FAIL: B10 | Story links open shared experiments, but this baseline dispatches only the lesson ID and hard-coded defaults. Tabla starts with zero central loading; water-glare material opens the ordinary polarised-beam state. Story-specific presets are not implemented. |

## Actionable blockers and closure checks

### B1 — Insulation must agree about which side is hotter

In `waves_thermal.js`, `w8-insulation`, the left/right geometry is red/blue and the plotted temperature falls left→right for both presets; `flow.set` reverses only in the ice case. Choose one coherent convention: either keep hot on the left and show room→ice left→right, or swap reservoir roles and reverse the plotted gradient too. Add visible skin/room/ice names and temperatures beside their blocks. Verify the arrow points from the actually labelled hotter side through the layer to the colder side in both presets; both endpoints must agree with the graph.

### B2 — Evaporation must visibly select energetic molecules

`w8-evaporation` moves 48 liquid markers by the same small sine rule and creates 10 independent ascending markers. Neither `caseIdx` nor `lost` enters these motions, and there is no selected high-energy liquid marker or return/condensation route. Show a modest sampled speed/energy distribution, highlight energetic surface candidates, and make escape/return or the displayed net balance respond to humidity. A qualitative event sequence is sufficient if clearly labelled illustrative; it need not claim an actual matka rate. Preserve the correct latent-energy and wet-bulb account. Closure: a learner can identify which shown liquid molecule escapes and explain why humid air reduces net evaporation.

### B3 — Pendulum force comparison must respond to mass

`w9-pendulum` draws gravity with fixed 28 px and restoring component with fixed 55 px factors while `mass` only enters text. Show labelled weight `mg` and tangential restoring force `mg sinθ` using a declared shared force scale (or a separate normalised acceleration vector plus a force readout/arrow). The identical starting state with masses 10 and 20 must double forces without changing period. Use arrowheads and a key to distinguish gravity from its tangential component.

### B4 — Mirror rays must locate the shown image

At object `[-d,0,0]`, eye `[-2,1,z]`, plane x=0, the correct reflected hit is `[0,d/(d+2),z*d/(d+2)]`. Current Y is `2/(d+2)`. At d1.5 that puts it at .571429 instead of .428571 and breaks the incident/reflected angle equality and image–hit–eye collinearity. Test both geometric identities at multiple d and z values using the actual renderer helper, not just `mirrorImage`. For curved mirrors replace the spherical object with an arrow whose top is the shared ray source h=.3, and show the image arrow height `−h*di/d` at x=−di so upright/inverted is visible. Keep the focus limit finite/clipped with its existing explanation.

### B5 — Eye geometry and retinal image must use the same conjugates

`w10-eye` fixes the object at `[-2,.65,0]`, every image endpoint height at −.45, and caps `focusX` at 3. Underwater the computed focus lies farther back, but all displayed rays are forced together at the cap. The central ray kinks; changing object distance does not change object position or retinal image scale. Generate the pre-lens directions, image conjugate, retinal intercepts and inverted image scale from a common reduced-eye state. If longitudinal lengths are separately framed, label that framing and maintain the central-ray and focus construction within each frame. Draw continuing diverging/converging rays up to the viewport clip; do not replace an out-of-frame focus with a false nearer intersection. Closure: compare air/underwater/goggles at two distances; readout focus, ray intersection, retinal blur and image scale must agree.

### B6 — Sky scattering must occur in air and share the solar direction

`w11-sky` uses `scatterPoint=[.5,.05,0]` around a globe centre `[0,−1,0]`, so its radius is 1.163, outside atmosphere radius1.15. The incoming scattered segment starts at `entry+[.7,.2]` and is not parallel to the direct solar ray. Choose an atmospheric scattering vertex and compute its backward intersection with the same shell along the solar direction, then connect that vertex to the observer. Retain enlarged-atmosphere disclosure. Label the blue curve as total removed fraction, not the fraction all entering one eye; it includes scattering into other directions. Closure: every offered solar angle must put the event inside the drawn shell, keep the incoming solar rays parallel, and avoid passing through the opaque globe.

### B7 — Water glare needs actual incidence/reflection geometry

`w11-polarisation` places water at y−1.15 but renders both beam parts horizontally around y0. `incidence` changes Fresnel numbers without moving any incident/reflected segment. Add a visible surface contact, normal, incident and reflected paths at the selected angle, with s/p bases consistently attached to the incidence plane; the analyser belongs on the reflected path. The existing separated incoherent field components and correctly squared projections are useful and should remain. If explaining water's unpolarised returning colour, actually display a separate such component and its constant half-transmission rather than claiming it is represented when it is absent.

### B8 — Slit/disc wave calculations need their mechanism

Do not replace the preserved two-source experiment. For the new single slit and grating cases, show their apertures/lines, a probe and at least a sampled amplitude/phase sum whose intensity gives the displayed point; a thin-film case should show the two interfaces and two reflected paths. For Arago, the current obstacle/paths remain at fixed enlarged dimensions as physical R changes while the curve uses R in a separate formula. This can be honest only with explicitly separate scales and a shared physical state. Show rim contributions with their calculated phase differences at the chosen screen probe and their summed resultant; compute the same approximate intensity from those contributions (or demonstrate convergence to J0²). The central peak must emerge from equal phase, and moving off-centre must visibly change the relative phases. A correct standalone Bessel curve with unchanged generic lines is insufficient.

### B9 — Raman frequency and wavelength must change together

In `w11-raman`, incoming phase is `4πu−2t`; outgoing phase is `4πu*(laser/outNm)−2t`. This keeps temporal frequency fixed and changes the depicted propagation speed. At equal visual speed the outgoing temporal term must also scale by `laser/outNm`, or replace propagating sinusoids with clearly static wavelength glyphs. Keep the physical displayed photon/molecule energy account. Closure: elastic input/output periods match; Stokes oscillates more slowly and anti-Stokes faster, with matching wavelength changes and the same displayed propagation speed.

### B10 — Story-specific state must survive the complete open path

At the inspected baseline, catalog `stories` contains story names only, story links carry only `data-open-lesson`, `m_labs.js` dispatches only lesson ID, and mounts initialise fixed state. Add explicit preset data to the catalog/story link, carry it through `open-lesson`/widget params, apply it before the first rendered frame, and retain return-to-story scroll/focus. Tabla should open a membrane with named nonzero central loading; Raman's sea-glare discussion should open the water-glare preset at/near Brewster, Raman-shift discussion the Raman energy experiment, and Arago the central-rim interference case. Verify the initial control values, first frame and readout from each story, then the return context. Reopening a lesson must not inherit an unrelated story's preset accidentally.

### B11 — Lesson sources must point to the mechanism they claim to ground

The catalog uses repeated convenience source pairs rather than relevant per-lesson sources: every thermal lesson links heat capacity/latent heat even for conduction, convection and Carnot; every optics lesson links Snell/eye even for mirrors and Fizeau; every colour lesson links polarisation/Young even for prisms, sky and Raman. The more relevant `grounding/visual_waves.md` bibliography does not make these catalog records accurate. Replace each record with the relevant source page(s), and add primary historical/spectroscopy sources where those historical constants or Raman distinctions are used. This is a catalog/source-fidelity blocker across the group, separate from numerical correctness.

## Learner explain-backs (three sentences per main group)

**C08, heat:** “A falling weight can warm water because the paddles transfer energy by doing work, even though no hot thing touches it. A hotter spoonful does not necessarily give away more energy than a warm bucket, because how much water there is matters too, and melting can use energy without raising the temperature. Insulation slows energy travelling from the warmer side to the colder side, while evaporation cools the water when escaping molecules carry energy away.” The current reverse-arrow and unselected escape animation weaken the visual evidence for that last sentence; B1/B2 must close.

**C09, waves:** “A heavier pendulum feels more force but is also harder to accelerate, so its mass does not set its period. A travelling crest or compression passes between places while each bit of water or air moves locally, and repeated pushes can add energy when they are timed well. A drum can have places that stay still while other parts vibrate, and a moving horn changes how often its crests reach me.” B3 must make the first sentence visible rather than leaving it entirely to a readout.

**C10, light and images:** “I see the mango when light from a source hits it and then enters my eye. A hole, mirror or refracting surface selects or changes the routes that can arrive, so an image is a pattern made by those routes rather than a picture stuck on the glass. Water weakens my cornea's focusing and goggles restore the air boundary, while even a correctly formed signal arrives after it was emitted because light takes time to travel.” The false mirror hit and false eye focus currently conflict with this explanation; B4/B5 must close.

**C11, wave optics and colour:** “A prism sends different wavelengths in different directions, but a second prism cannot invent wavelengths missing from the selected light. Scattering redirects sunlight, a polariser passes an electric-field component, and waves can reinforce or cancel because their amplitudes arrive with different phases. In Raman scattering the light and the molecule exchange energy, so Stokes light has a lower frequency and anti-Stokes light has a higher frequency.” B6–B9 currently leave key parts as claims without a consistent rendered mechanism.

**S01/S04/S11, story experiments:** “A cogwheel can compare its own rotation with the time light needs to go out and back. An engine accounts for incoming energy as work plus energy sent to a colder place, so none has been destroyed. Opening a story's experiment should start with the particular wheel, drum or light arrangement that explains that story.” The first two claims are supported; the third needs the preset path in B10.

## Gate closure

Keep this initial independent report intact. Append a dated closure table with actual changed code/build identity, independent geometric checks and affected screenshots after B1–B11 are repaired; do not change FAIL to PASS solely because the broad numerical/browser smoke suite passes. The complete browser/theme/mobile/offline requirements remain the parent's separate delivery gate.

---

## Independent correction review — 29 October 2026, 04:34 UTC

The initial findings above are preserved. I reread the actual corrected renderer branches and their shared helpers, reran `node source/tests/test_waves_labs.mjs`, inspected new rendered states, and followed four actual story links through their first frame and return action. The expanded suite passes its reference/invariant, shared geometry, phase-convergence/propagation, and all-34-renderer mount/control checks. **All B1–B11 source corrections pass this independent review.** The final rebuilt pendulum image remains a separate receipt because this review caught and corrected one additional force-direction error after the first correction build; see B3 below.

Evidence identity: fresh built book **mw-f0f0a783930d**, chunk `w_waveslab-MHSG24ZL.js`; final reviewed source `waves_models.mjs` SHA-256 `6a49898becfcb896a941c83c12902989955bc5dcd614d18f58df66a41bbcddb2`. Independent captures are under `source/build/waves-independent-closure/`: 14 default openings (`receipt.json`) plus **18 altered-state/story cases** (`altered-receipt.json`), all with zero page errors. These are real Chromium/SwiftShader rendered images, not canvas stubs. The source-mount tests supplement these images and do not substitute for them. The parent's broader mobile/theme/fallback/offline matrix is separate evidence.

### B closure table

| Finding | Independent closure verdict | Actual evidence |
|---|---|---|
| B1 | PASS | Ice/skin block colour and label, temperature-profile slope and energy arrow now change together. Independently opened Room→ice and inspected its rising left-to-right temperature graph with right-to-left transfer. |
| B2 | PASS | `evaporationSample` exposes sampled speed/energy, eligibility, surface candidate identity, return status and position. The renderer consumes that same state, colours the actual surface candidates red, displays the energy threshold and escape/return counts, and changes the qualitative balance with humidity. May/July/dry views retain the separate physically calculated latent energy and wet-bulb limits. Events explicitly make no rate prediction. |
| B3 | SOURCE PASS; final built image pending | Mass now drives the actual force arrows through `pendulumForces`. This closure review caught a **new Y-sign error** in the first correction: upward-positive tangent Y had to be `−mg sin²θ`, since bob radial is `(sinθ,−cosθ)`. Root corrected the helper; I reread it and reran the suite. Tests now compare gravity minus its radial projection, perpendicularity to the actual string and restoring sign over positive/negative angles, not the earlier wrong radial vector. The f0f0 build predates that last sign correction and is not claimed as its visual proof. |
| B4 | PASS | Actual flat renderer calls `planeMirrorPath`; its hit is the image–eye line intersection with x=0. Curved renderer calls `curvedMirrorRays` and uses a directed .3-height object arrow, shared tip origins and computed inverted/upright image arrow. Checked concave/convex rendered states and the helper's actual ray/image collinearity tests. The tangent-plane paraxial construction is explicitly disclosed. |
| B5 | PASS | Actual renderer consumes `reducedEye`: incoming directions, unchanged central-ray direction, true image distance/height, retinal intersections and blur all use the same conjugates. The out-of-frame object and separately enlarged vertical/inset scales are explicitly stated. In the inspected underwater frame, rays continue toward the true ~42.2 mm focus beyond the 20 mm retina rather than being forced to intersect there; goggles restore the same sharp conjugate as air. |
| B6 | PASS | `skyScatterGeometry` places the scattering vertex inside the shell, computes both shell entries along one solar direction, and supplies those exact points to the renderer. The graph/readout now distinguishes total removed fraction from the small fraction entering an eye. The preserved sky demonstration remains available. |
| B7 | PASS | `waterGlareGeometry` is used for the actual incident/contact/reflected route, surface normal, transverse s/p bases and reflected-path analyser. Inspected the water-glare frame: both paths meet the surface at the named contact. Fresnel components remain separate; a labelled independent water-body component has the correct constant half-transmission account. |
| B8 | PASS | Actual slit/grating/film/Arago renderers now call the same complex sums as their selected point and curve. The new aperture/film geometry, selected probe, arrival-phase indicators and resultant visibly supply the mechanism. Inspected all three diffraction tabs plus Arago centre/off-axis: coherent centre gives a long resultant, off-axis rim phases vary and resultant shrinks. The disc/rim now respond to R, and independently enlarged transverse scales are stated. Numerical convergence to the analytic sinc/grating/film/Bessel limits supplements this visible linkage. |
| B9 | PASS | Actual outgoing Raman renderer uses `ramanPhase`, scaling spatial and temporal phase together. Independent propagation/period tests pass; elastic/Stokes/anti-Stokes frames retain opposite molecular/photon energy changes and explicitly schematic vibration amplitude. |
| B10 | PASS | Inspected `storyPresets` through catalog→story-origin dispatch→core params→mount before control creation/first draw. Independently followed tabla→membrane (Drum 0, load2), Raman→water glare, Raman→Stokes, and light-wave→central Arago. Each first frame had the expected state, and each Return button reopened the originating story. Parent integration separately checks detailed focus/scroll and ordinary-entry reset. |
| B11 | PASS | Every lesson now has mechanism-specific source records. I independently retrieved MIT's resonance-vs-flutter appendix and NIST Camp's PDF, whose background explicitly distinguishes spontaneous Raman and Stokes/anti-Stokes energy exchange; the unrelated-source-pair defect is gone. The Arago DOI resolves to C. Aime's 2020 paper and is relevant; the grounding bibliography's mistaken author attribution was reported to root for correction. Repository/DOI timeouts and their limits are honestly recorded rather than claimed as fresh successful fetches. |

### All 28 acceptance IDs after correction

| ID | Physics/learner-mechanism closure | Basis |
|---|---|---|
| C08.1 | PASS | Weight/paddle/work/temperature account retained and rechecked. |
| C08.2 | PASS | Temperature distributions and sample-total account retained and rechecked. |
| C08.3 | PASS | Preserved contact conduction plus corrected calculated gradient (B1). |
| C08.4 | PASS | Correct hotter-side direction in both insulation cases (B1). |
| C08.5 | PASS | Shared phase/energy/temperature state and representative arrangements retained. |
| C08.6 | PASS | Energetic selection and humidity-dependent qualitative return/escape now visible; coastal circulation and wet-bulb limits retained (B2). |
| C09.1 | SOURCE PASS; final rebuilt force frame pending | Same-period mass comparison and actual shared-scale forces; final sign/projected-gravity correction verified in source (B3). |
| C09.2 | PASS | Integrated transient/work/loss versus separate steady response; independent flutter retained. Limits now describe both transient and steady representation accurately. |
| C09.3 | PASS | Shared surface/parcel state retained; controls now ensure kA≤.189, closing the large-amplitude caveat. |
| C09.4 | PASS | Longitudinal volume/pressure probe and echo round trip retained. |
| C09.5 | PASS | Synthetic independent frequency/amplitude and optional sound; preserved microphone retained. |
| C09.6 | PASS | Actual Bessel modes, nodes, loading estimate and corresponding optional audio retained; loaded story first frame independently verified. |
| C09.7 | PASS | Emission-centred wavefronts and listener/driver cases retained. |
| C10.1 | PASS | Source/object/eye, source removal and obstruction retained. |
| C10.2 | PASS | Finite-hole inversion/blur and extended-source geometry retained; opened-camera interpretation is now explicit. |
| C10.3 | PASS | Renderer-shared reflection construction and directed curved image geometry (B4). |
| C10.4 | PASS | Computed fixed-eye refraction and actual bent-boundary guide retained. |
| C10.5 | PASS | Correct retinal ray/image/blur conjugates and unclamped focus (B5). |
| C10.6 | PASS | Emission/reception geometry retained; Fizeau modern-c prediction is now explicitly distinguished from the historical ~12.6 Hz observation. |
| C11.1 | PASS | True-angle prism/rainbow geometry retained; labelled 12× transverse close view makes dispersion separable, closing the legibility caveat. |
| C11.2 | PASS | Returned-spectrum and cone-response accounts retained. |
| C11.3 | PASS | Actual atmospheric scattering point and shared solar geometry (B6). |
| C11.4 | PASS | Visible water contact/reflection/analyser plus separated unpolarised contribution (B7). |
| C11.5 | PASS | Preserved interference plus actual linked aperture/film/rim phase mechanisms (B8). |
| C11.6 | PASS | Common propagation speed with correct shifted frequency/wavelength and energy exchange (B9). |
| S01 | PASS | Wheel round-trip/phase and calculated extinction account retained. |
| S04 | PASS | Work plus cold rejection conserves input; cyclic illustration limits retained. |
| S11 | PASS | Four actual story-origin preset opens and return actions independently exercised (B10). |

The original three-sentence learner explain-backs remain valid after these corrections. They now have visible support for energetic evaporation, mirror image construction, retinal defocus, atmospheric scattering, water reflection and summed wave phases. The only delivery item withheld in this closure is a **fresh built pendulum force-direction frame after the final B3 sign fix**; broad delivery checks and hardware/learning claims remain outside this independent domain review.

### Final inspection addendum: Fizeau phase-strip origin

An additional concrete renderer inconsistency was caught just before this review closed. **C10.6/S01 require this small correction before their final PASS:** in `w10-fizeau`, the returning-beam state is `cos(relative)<0`, but the strip marker is `40 + phase*92` while the first white gap occupies x40–86. Consequently ~6.1 Hz draws its marker in the white gap (~63) while the readout says tooth, and ~18.1 Hz draws it in the dark tooth (~109) while the readout says gap. Start the marker at the centre of its gap: `40 + ((relative/(2π) + .25) % 1)*92`; this places it at x63 for zero rotation and x109 for the first tooth-centre alignment. Check both sides of each boundary against the readout.

The stated ideal narrow-beam assumption also needs precision: a point beam launched through a gap centre first encounters a tooth edge at half the gap-centre→tooth-centre reference frequency, while the usual c/(4DN) value describes the latter alignment/full-width extinction. Either use an initially gap-filling beam with overlap/transmission through the shifted mask and first full extinction at c/(4DN), or label the narrow-beam account's edge onset separately from the standard tooth-centre/full-aperture extinction reference. This does not change the historical 8633 m/720-tooth account or the correct c/(4DN) reference calculation. Parent was notified immediately; this addendum supersedes the earlier C10.6/S01 PASS until corrected. All other source closure verdicts above stand, with the already noted final-built B3 frame pending.

### Final candidate closure — 29 October 2026, 04:44 UTC

**PASS: all 28 scoped acceptance IDs and B1–B11 are now closed for this independent physics/learner-mechanism gate.** This supersedes the pending C09.1 built-frame and C10.6/S01 addendum statuses above; their earlier findings remain preserved as the audit trail.

Final candidate independently served and inspected: **mw-81c12a9235dc**, waves chunk **w_waveslab-IZ7QAZSV.js**. Reviewed `waves_models.mjs` SHA-256: `0ffee4462f82c9088c2b2a4b028e800df7dd4e0af0de56d8cf50133397ddd237`. Reran the expanded public model/actual-renderer-mount suite successfully. Independently ran `test_labs_browser.py` against the final build for pendulum and Fizeau at **390 and 1440 px**, including their actual control endpoints, changed state, play/pause, drawing inspection, keyboard/focus and screenshot checks: **4/4 cases passed, no page errors**. Receipt and screenshots: `source/build/waves-independent-final/receipt.json` and neighbouring files.

- **C09.1/B3 PASS:** inspected the final changed-state pendulum image: weight points down and the green tangential component points toward the bottom of the arc, consistently with gravity minus its actual radial projection. Mass-dependent force lengths and computed period remain distinct. The final helper and independent projection/restoring-direction tests use the corrected negative tangent Y.
- **C10.6/S01 PASS:** the actual renderer now calls `fizeauReturn`. Its marker begins at the gap centre, while a separate triangular aperture-overlap calculation gives average returned transmission. Readout/diagram explicitly distinguish the gap-centre ray from averaged light, full extinction at tooth-centre alignment, modern-c prediction from Fizeau's historical ~12.6 Hz, and the magnified phase scale. The 4000-phase independent square-mask oracle reproduces the overlap calculation. I additionally changed the real browser control to **0, 6.1, 12.1 and 18.1 Hz**, inspected both former disagreement boundaries, and recorded `fizeau-boundary.json` plus four diagram captures. Marker and readout now agree: 6.1 Hz is just into a tooth with 49.4% average return; 18.1 Hz is just into a gap with 50.1%; 0 gives 100%, and 12.1 gives the expected near-extinction 0.4%.

All other per-ID closure rows remain PASS on their previously recorded source and rendered evidence. No residual blocking physics, source-link or missing-mechanism finding remains from this review. This statement covers the scoped independent domain gate; the parent's separate whole-book browser/offline matrix and unverified real-hardware/learning-outcome boundaries remain as stated above.
