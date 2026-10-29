# Grounding and verification: heat, waves and optics experiments

29 October 2026. These are original teaching scenes, calculations and diagrams for `source/lessons/waves.json`. Existing chapter widgets remain the primary demonstrations. This note records the additional lessons’ mathematical meaning and limits. No third-party animation or artwork was copied.

## Sources

The chapter grounding notes `ch08.md`–`ch11.md` supply the source spine and checked constants. The following primary/authoritative pages were also inspected for the new models:

- OpenStax, *College Physics 2e*, [14.2](https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity), [14.3](https://openstax.org/books/college-physics-2e/pages/14-3-phase-change-and-latent-heat), [14.5](https://openstax.org/books/college-physics-2e/pages/14-5-conduction), [14.6](https://openstax.org/books/college-physics-2e/pages/14-6-convection): heat capacity, phase changes, conduction and convection.
- OpenStax [15.4 Carnot engine](https://openstax.org/books/college-physics-2e/pages/15-4-carnots-perfect-heat-engine-the-second-law-of-thermodynamics-restated): reversible efficiency and rejected energy. Reversible efficiency is a bound, not the efficiency of a particular animated piston.
- MIT OCW [8.03SC](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/): oscillator, wave, interference and polarisation source spine already mapped in the chapter grounding.
- Daniel A. Russell, Penn State Acoustics, [circular membrane modes](https://www.acs.psu.edu/drussell/Demos/MembraneCircle/Circle.html): nodal diameters, Bessel modes and frequency ratios. Ideas and independently evaluated equations only; this page’s ND animations are not adapted or embedded.
- OpenStax [25.3 Snell’s law](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [25.5 dispersion](https://openstax.org/books/college-physics-2e/pages/25-5-dispersion-the-rainbow-and-prisms), [26.1 the eye](https://openstax.org/books/college-physics-2e/pages/26-1-physics-of-the-eye).
- OpenStax [27.3 Young interference](https://openstax.org/books/college-physics-2e/pages/27-3-youngs-double-slit-experiment), [27.8 polarisation](https://openstax.org/books/college-physics-2e/pages/27-8-polarization), and *University Physics 3* [1.7](https://openstax.org/books/university-physics-volume-3/pages/1-7-polarization): field projection, Malus’s law and Brewster’s angle.
- C. V. Raman’s Nobel lecture is linked from the existing chapter research. A fresh fetch of the Nobel lecture PDF returned 403; no new historical claim was inferred from that unavailable fetch. Raman energy accounting is independently derived from conservation and the existing Chapter 11.6 grounding. Stokes/anti-Stokes definitions were cross-checked against the spectroscopy literature linked in the catalog.

OpenStax/MIT derivative ideas retain the book’s CC BY-NC-SA credit and sharing conditions. Original scene geometry and formula code are part of this book. Russell’s animations were not used.

## Public model boundary and reference values

`live/waves_models.mjs` has no DOM, pixel coordinates or renderer dependency. The values below are independently computed reference cases used by `tests/test_waves_labs.mjs`.

| Model | Definition and numerical reference | Limits |
|---|---|---|
| Joule | Q=mgh; ΔT=Q/(m_water c). A 10 kg weight through 20 m gives 1960 J. | Insulated ideal calorimeter; motion timing is illustrative. |
| Water cooling | mcΔT, c=4186 J/(kg K): 10 kg from 40 to 30 °C gives 418600 J; 5 g from 90 to 30 gives 1255.8 J. | Constant heat capacity. |
| Speed distribution | Maxwell translational speed density, molecular mass 2.9915e−26 kg and exact Boltzmann constant. Numerical integral is 1 at 30, 40 and 90 °C. | Describes classical translation, not all liquid internal energy. Heat-capacity account is separate. |
| Insulation | Q̇=AΔT/Σ(L/k). 2 cm wool, k=.04, A=.01 m², ΔT=20 K gives .4 W. | Steady 1D conduction; no claim of transient skin burn behaviour. |
| Water phases | 1 kg at −20 °C: 42 kJ warming ice; 334 kJ melting; 418.6 kJ warming liquid; 2256 kJ boiling. | Atmospheric pressure; constants rounded consistently with book. |
| Evaporation | 2400 J/g warm-water latent energy. May/July/dry-inland wet-bulb cases are the book’s fixed illustrative cases. | No weather feed or inferred evaporation rate. |
| Convection | Air density ρ≈353/T_K at one common pressure. Warmer air is less dense. | Prescribed circulation topology; not CFD or a monsoon forecast. |
| Engine | η=f(1−Tc/Th); output+rejection=input. At 600/300 K, f=.5 and Qin=100 J: 25 J work, 75 J rejected. | No particular engine cycle or pressure-volume path claimed. |
| Pendulum | T≈2π√(L/g)[1+θ²/16+11θ⁴/3072]. 1 m small-angle period 2.007089923 s for g=9.8. | Point mass, no damping, amplitude expansion capped at 40°. |
| Driven oscillator | x''+2ζω0x'+ω0²x=F sinωt; ω0=π. RK4 integrates drive work and damping loss with state. | Linear oscillator. Steady response graph is distinct from current transient. |
| Flutter | Cycle-averaged energy envelope exp[2(.12 feedback−.1 damping)t]. | Prescribed torsional energy feedback, not a critical-wind-speed or bridge-collapse prediction. |
| Water wave | k=2π/λ, ω²=gk; parcel radius A exp(kz), phase kx−ωt. Parcel returns after one period. | Linear deep water; omits Stokes drift and breaking. |
| Sound | ξ=A cos(kx−ωt); pressure perturbation proportional to sin(kx−ωt), opposite the spatial displacement derivative. | Regular markers are mean positions, not a molecular lattice. Display time slowed 300×; displacement enlarged. |
| Echo | t=2d/c: 50 m at 349 m/s returns in 0.286533 s. | Flat ideal reflector. |
| Membrane | J_m(α_m r) cos(mθ), roots 2.40482556, 3.83170597, 5.13562230. Rim displacement is zero. | Central loading uses one-basis Rayleigh estimates with the same trial shapes; NOT an exact loaded-tabla solution. Frequencies are not forced to harmonic ratios. |
| Doppler | f_received=f(c−v_listener)/(c−v_source), velocities projected towards the selected listener. 300 Hz, source 22 m/s, c349 → 320.183486 Hz; co-moving driver receives 300 Hz. | Radial still-air model; sparse drawn crests. |
| Pinhole | Image H b/D; geometric point-blur width a(1+b/D); admitted light ∝ a². 1 m object, D3 m, b.3 m → .1 m image. | Geometric optics; no diffraction optimum. Lower diagram frames aperture/longitudinal spacing separately. |
| Flat/curved mirror | Virtual flat image remains equally far behind. Paraxial 1/f=1/do+1/di and M=−di/do for curved comparison. | Curved drawing is a paraxial model, not an exact spoon ray trace. Infinity is displayed as a model limit, never put into geometry. |
| Refraction/coin | Snell n1 sin i=n2 sin r; coin surface hit solved by bisection with fixed eye, rim and coin. At 45° air→water n1.333 gives 32.036723°. | Tumbler is an illustrative geometry with explicit dimensions. |
| Bent guide | Exact ray/circle intersections in a 1–2 radius annulus, reflecting v−2(v·n)n. n1.5 critical incidence 41.810315°. | 2D ray model; trace ends at first transmitting contact. |
| Reduced eye | Air cornea 34 D; lens accommodation16–20 D; 20 mm retinal distance. Water reduces corneal power by refractive-index contrast. | Educational reduced eye, not prescription/medical model. Retinal blur is an illustrative Gaussian driven by focus error. |
| Light clocks/Fizeau | t=d/c. At D8633 m and N720 teeth, first extinction f=c/(4DN)=12.05775553 Hz. | Circular schematic Jupiter/Earth geometry; no ephemeris. The wheel phase marker magnifies one gap-to-tooth interval. |
| Prism/rainbow | Snell at each interface; crown-glass n660=1.512, n410=1.530; water1.331→1.342. Prism i49.2°, apex60°. Droplet ray has one internal reflection. | Interpolated index over offered band; spherical drops; no intensity caustic solver. |
| Reflectance | Returned spectrum = source spectrum × reflectance. Independent approximate L/M/S sensitivity integrals. | Illustrative curves; not a calibrated colour appearance model. |
| Sky | Spherical uniform-shell path; relative Rayleigh optical depth∝λ⁻⁴. Direct transmission exp(−τ) and removed fraction1−exp(−τ). | Single-scattering explanatory model; enlarged drawn atmosphere; no atmospheric radiative-transfer certification. |
| Polarisation | Malus cos²α. Water glare after analyser=(Rs sin²α+Rp cos²α)/2; Fresnel Rp=0 at tanθB=n2/n1. | Incoherent components shown separately. Their 3D amplitudes are magnified together; physical intensities stay in graph/readout. |
| Interference | Exact two-path difference from source coordinates; I/Imax=cos²(πΔ/λ). | Coherent equal point sources; envelope separate. |
| Slit/grating/film | Fraunhofer sinc²; eight-source grating; film sin²(2πnt/λ) including one phase reversal. | Normalised relative intensity, equal reflection amplitudes in film. |
| Arago | Near-axis rim contribution J0²(2πRr/(λL)); centre exactly 1 after normalisation. | Not full Fresnel screen irradiance; scene dimensions magnified separately. |
| Raman | Reciprocal-wavelength shift. 532 nm with 1000 cm−1 → Stokes561.892691 nm, anti505.127231 nm; molecule/photon energy changes cancel. | Schematic vibration/line intensities; no particular molecule claimed. |

## Teaching and source traps explicitly avoided

- Every particle marker represents many particles. Water temperature is not computed from a few cartoon markers.
- Fixed particle size across phase changes; melting ice becomes denser by a consistent representative spacing ratio. Phase energy plateaux and phase fractions share one state.
- Wave particle displacement and pressure use the correct relative phase. A marked water parcel follows the model orbit; the travelling crest is a different object.
- The central-loaded membrane remains labelled a Rayleigh approximation. Optional audio uses exactly the displayed mode frequency and stops before a control changes it.
- Rays are calculated teaching geometry; transparent Three.js materials do not decide refraction. The curved guide uses real curved-boundary intersections.
- Reflection image extensions are explanatory and are distinguished from physical incoming/reflected paths by colour/text. The ideal focus limit does not generate infinite coordinates.
- Intensity and electric-field amplitude are distinct. Water glare uses both incoherent polarisation components and an analyser projection.
- Arago uses a wave-amplitude model, rather than a painted bright dot. The approximation is stated beside it.
- Raman’s photon energy changes by the opposite of the molecular change. A changed colour is not caused by a coloured material being invented by the scene.

## Verification

- `node source/tests/test_waves_labs.mjs`: reference calculations, limiting cases, work/energy invariant, Maxwell normalisation, wave-orbit return, membrane rim boundary and curved-guide reflection/escape limits.
- Built-book interaction, fallback, keyboard, resize, focus, theme and opt-in-resource checks use `tests/test_labs_browser.py`; receipts/screenshots are recorded by the parent integration run. Source review does not substitute for those browser checks.

## Independent-gate corrections, 29 October 2026

The initial `gates/visual-waves-independent.md` report remains unchanged. The following source corrections address its B1–B11 findings; independent rebuilt screenshots and the integration/mobile matrix are separate evidence owned by the integration gate.

| Finding | Actual implementation and direct verification |
|---|---|
| B1 | Reservoir colour, named block temperatures, arrow and temperature gradient now reverse together for room→ice. The room remains the right-hand 30 °C reservoir. |
| B2 | `evaporationSample` creates a deterministic modest energy ensemble. Only energetic surface candidates leave their liquid positions; the same markers traverse escape or returning trajectories. Higher humidity increases the returning fraction. The animation is a declared illustrative batch, not a claimed molecular/Matka rate. The selected grams determine the separate correct latent-energy account. |
| B3 | The actual force components are `pendulumForces(m,θ)`, with red weight and green tangential arrows at one declared 0.07 px/N scale. 10→20 kg doubles both vectors while period stays fixed. Components are tested perpendicular to the string. |
| B4 | Flat reflection consumes `planeMirrorPath`, whose vector reflection and collinearity are tested across distances and observer offsets. Curved object/image arrows and both paraxial rays consume `curvedMirrorRays`: each starts at the same 0.3 m tip and intersects the stated image conjugate. No infinity enters geometry. |
| B5 | `reducedEye` computes accommodation, true focus, object/image height, incoming/outgoing slopes and all retinal intercepts together. Every ray intersects the calculated conjugate; the centre ray keeps its slope. The visible near-eye segments are clipped, with independently enlarged longitudinal/transverse framing stated. Farther underwater focus is never moved to a false viewport cap. The inverted retinal image uses −H×retinalDistance/objectDistance and the calculated pupil blur span; the Gaussian raster rendering is illustrative. |
| B6 | `skyScatterGeometry` places the event inside the drawn air shell and computes both shell entries along the same solar direction. Tests sample every offered solar angle's incoming/scattered segments to rule out crossing the opaque planet. Blue graph explicitly counts total removed light, including other directions. |
| B7 | `waterGlareGeometry` puts incidence/reflection at the actual y=−0.8 surface, with equal normal angles and correct s/p bases. The analyser sits on the reflected route. Two incoherent projected components remain separate; an additional labelled green unpolarised water-colour account 0.080→0.040 is independent of filter rotation. |
| B8 | Single slit, eight-line grating and Arago use the same sampled complex-amplitude sums in the plotted intensity, selected point and visible phasors. Single slit uses 64 midpoint samples; grating uses exactly eight; near-axis Arago uses 96 rim samples with phase −2πRr cosφ/(λL), equal at centre and varied off-axis. Obstacle geometry responds to R; separate transverse scales are explicit. Film shows two interfaces and normal-incidence returns with π reversal on the upper reflection. Its actual two-phasor sum generates its spectrum. Tests compare the sums to sinc², grating, film and Bessel limits. |
| B9 | `ramanPhase` scales both spatial and temporal terms by λin/λout. Translation at the same visual velocity preserves phase for all three cases; Stokes has longer temporal period and anti-Stokes shorter. Tests use those propagation identities. |
| B10 | Catalog `storyPresets` is passed by the widget before controls or first draw. Tabla starts Drum 0/load 2; Raman sea discussion starts water glare at 53.1°; Raman energy starts Stokes; Arago starts at the central peak. No unrelated prior state is inherited. Renderer-mount tests verify first-frame slider values, selected tabs and readouts against these records. Parent owns story return scroll/focus and full browser open path. |
| B11 | Every catalog lesson now has relevant mechanism-specific links. Historical originals and specific spectroscopy sources supplement the mechanism sources below. |

Additional presentation corrections: the deep-water controls now keep kA≤0.189; the pinhole apparatus is explicitly an opened camera cutaway; prism dispersion has a labelled 12× transverse close view alongside its unmodified true-angle rays; the resonance limits distinguish the integrated transient from the separate steady response curve.

### Mechanism-specific source additions

- [MIT *Foundations of Computer Vision*, Imaging §5.3](https://visionbook.mit.edu/imaging.html): actual pinhole projection, image selection and aperture width/blur tradeoff. Inspected successfully during this correction.
- [Fizeau, *Comptes rendus* 29 (1849), original p.92 scan](https://skullsinthestars.com/wp-content/uploads/2008/03/fizeau92.pdf): original scan linked as a primary historical document, rather than the hosting blog as authority. Its French transcription gives approximate 8633 m, 720 teeth and observed first eclipse around 12.6 Hz. The lesson predicts 12.058 Hz using modern c and explicitly distinguishes the historical observation. The p.90–92 scans were retrieved successfully; the original archive's old HTML link now renders empty.
- [Raman and Kumar, *Musical drums with harmonic overtones* (1920), IAS repository](https://repository.ias.ac.in/52555/): original-paper abstract describes central distributed loading and an additional peripheral ring. Inspected successfully; the lesson does not claim its one-shape Rayleigh approximation reproduces all these structural features or exact harmonic tuning.
- [Raman, *The Colour of the Sea* (1921)](https://www.nature.com/articles/108367a0): inspected original abstract describing removal of surface reflection using a rotated Nicol near the polarising angle. The water-body return in our demonstration is a deliberately simple independent unpolarised component, not a complete optical model of the sea.
- [NIST, Camp, *Broadband Coherent Anti-Stokes Raman Scattering*, background pp.3–5](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=918413): inspected successfully; distinguishes spontaneous inelastic scattering and photon/vibration exchange before discussing coherent methods. The lesson uses the spontaneous energy accounting only; it does not represent CARS phase matching or coherent amplification. [Krishnan's original diary archive](https://collections.archives.ncbs.res.in/handle/42412/4108) grounds the historical connection.
- OpenStax [single-slit diffraction](https://openstax.org/books/college-physics-2e/pages/27-5-single-slit-diffraction), [multiple-slit diffraction](https://openstax.org/books/college-physics-2e/pages/27-4-multiple-slit-diffraction), and [thin-film interference](https://openstax.org/books/college-physics-2e/pages/27-7-thin-film-interference) were inspected successfully for their particular aperture and phase mechanisms.
- [Maryland's actual Poisson-spot experiment](https://lecdem.physics.umd.edu/m/m2/1687-m2-03.html) was inspected. [C. Aime (2020), *Fresnel diffraction of multiple disks on axis*](https://doi.org/10.1051/0004-6361/201937208) supplies the near-axis J₀ context; search-indexed paper text was available, but direct DOI retrieval failed in this pass. No complete multi-disc formula is claimed or copied.
- [NOAA's molecular scattering explanation](https://gml.noaa.gov/grad/about/redsky/) and [NASA's Rayleigh scattering treatment](https://acd-ext.gsfc.nasa.gov/anonftp/acd/daac_ozone/Lecture4/Text/Lecture_4/rayleigh.html) distinguish angularly redirected light and preferential short-wavelength removal. Our shell/optical-depth formulas remain explicitly simplified derivations.
- [TU Delft Ocean Waves notes](https://ocw.tudelft.nl/wp-content/uploads/Part_1.pdf) specifically illustrate deep-water shrinking circular particle paths. Search-indexed text was available; direct PDF retrieval timed out during this pass. The lesson's linear-wave equations and kA restriction are stated and numerically tested independently. Penn State membrane source also timed out on this fresh revisit; no new successful fetch is claimed.

### Correction verification boundary

`node source/tests/test_waves_labs.mjs` now includes the independent geometric and propagation checks above and mounts all 34 actual renderers with finite-argument canvas/geometry checks, all slider endpoints and tabs, plus story first-frame presets. This source-level test does not certify browser layout, source availability forever, hardware rendering, mobile touch or story-return focus. Those remain the separate rebuilt integration evidence; no build or broad browser run was performed during this correction pass.

### Final Fizeau phase check

The strip marker begins at the centre of the launch gap. Its tooth/gap position is computed from the same phase as the selected midpoint ray. This individual-ray state is distinct from detector transmission averaged over launch phase: for equal-width tooth and gap, the overlap fraction is 1−|wrapped phase|/π, first zero at π. The numerical test independently samples both square-wave apertures over 4,000 wheel phases and compares the overlap with the displayed model. Thus the full-extinction reference is not confused with the earlier disappearance of a single midpoint ray.

## Fresh visual refinement, 29 October 2026

The fresh live paired boards `source/build/visual-audit-20261029/boards-before/w9-pendulum.png`, `w9-water.png` and `w8-samples.png` exposed teaching/readability gaps at both 390 and 1440 px. These changes retain the underlying models and explicitly distinguish display quantities:

- **Pendulum:** the default newton-scaled vectors were smaller than, or buried in, the bob marker. The diagram now depicts gravitational **g** and the **tangential acceleration Ftan/m**, using one fixed 5.2 logical pixels per m/s² for both bobs, with arrow tails offset outside the marker. Actual weight and tangential pull remain in newtons in the readout. Red g is not the bob's total constrained acceleration; the green arrow is only its tangential component. The explanation states that the string also keeps the bob on a circular path. The unchanged displayed oscillation is harmonic at the corrected period, not an exact nonlinear time integration. At equal length/angle, 10→100 kg changes weight 98→980 N while the depicted acceleration and clock remain unchanged.
- **Water:** the physical 3 cm orbit occupied only a few pixels and was not perceptible as a loop. The main view retains its physical amplitude. A framed 3D copy and a calculated right-hand inset show the **same** surface parcel at **40× displacement magnification in both directions**, using the same physical state and clock. At 3 cm amplitude the 2D inset radius is 60 logical px while the main side-view radius is 1.5 px. The copy is an inspection view, not another particle leaving the liquid. Mean position stays fixed. Wave dispersion, depth decay, kA bound and 0.4× physical-time mapping are unchanged.
- **Samples:** the equal marker counts alone did not make a 2000-fold amount change visible. The enlarged marker windows are now explicitly statistical sampling windows. Thin 3D amount bars, plus separate amount and cooling-energy bar pairs, use shared linear scales. For 5 g at 90 °C versus 10 kg at 40 °C, the amount ratio is 0.0005 and energy ratio is 1255.8/418600 = 0.003. For 10 kg at 90 °C the energy ratio is 6. The temperature distributions remain unchanged when only amount changes. No container volume or literal particle count is inferred from the equally enlarged windows.
- **Playback:** 21 pure-parameter wave/optics lessons hide the no-op global Play control. The 13 time-varying lessons retain it; the separate opt-in synthetic tone action remains. A real-renderer test compares actual canvas/geometry state at two times and requires the Play flag to match observed motion, rather than trusting a copied ID list.

`node source/tests/test_waves_labs.mjs` passes all previous physics references/limits, 34 real mounts and source-level endpoint/preset checks, plus actual-renderer mass-independent acceleration geometry, amount/energy bar ratios, same-parcel40× mappings in both views and playback/motion correspondence. Rebuilt visual inspection and independent closure are still required; these source tests do not certify that the new layout is readable.

Further fresh-screen findings, 29 October 2026:

- Sound shows both `sin(phase)` relative pressure and `cos(phase)` displacement
  divided by its own amplitude. The red tracked parcel follows the same
  displacement model, around a fixed black mean. The two curves’ quarter-cycle
  difference represents pressure from local crowding, not a particle travelling
  to the listener.
- Convection arrows reverse with the common-pressure density contrast and
  disappear at equal temperature. The circulation remains a schematic; no
  weather speed prediction is implied.
- Flat-mirror selected paths now originate at the drawn arrow tip, not its base.
  Adding0.3m to the existing point-source construction preserves the equal-angle
  relation and places the virtual tip at equal height behind the mirror.
- Young’s two arrival amplitudes each have normalised length1/2; their actual
  resultant is `(1+exp(i2πΔ/λ))/2`, so its squared length equals the existing exact
  path-distance intensity. The transverse route sketch is explicitly enlarged.
- Raman incoming/outgoing bars use one0..3.2eV scale. Their difference is exactly
  the opposite signed molecular vibrational-energy change. Spectral peak heights
  remain enlarged and wavelength ticks are explicit.
- The retinal inset now depicts one point’s spread, with40logicalpx/mm in every
  mode and distance. The blur-disc radius is20,000times its SI diameter, and its
  centre uses40,000times its signed SI image height. A2px centre mark remains at
  zero blur. Offered near/far object states stay inside the panel; no saturated
  blur filter erases the whole comparison.
- Flutter’s3D deck uses the model angle. A separate side view multiplies that
  angle by4 and prints the unscaled angle. Doppler’s initial still picture starts
  after0.14s of simulated emission so a crest train is visible immediately; the
  existing subsonic source/listener formula and repeating time window remain.

Actual renderer traces/geometry verify these display contracts in
`source/tests/test_waves_labs.mjs`. The independent root reviewer checked their
physics and the waves agent independently checked the mechanics patch. Fresh
candidate/live screenshot acceptance is tracked separately in the per-ID ledger.

Mode-specific controls were closed against actual renderer state: equal30°C
sea/land temperatures hide playback; string modes disable drum loading; a linear
polarised-beam comparison disables water incidence; film wavelength is active
only for the soap-film calculation, and screen position only for aperture/grating
calculations; curved mirrors disable the flat-mirror observer control. In the
Doppler driver case the disabled listener control displays the source velocity,
while the independent platform-listener value is retained and restored on return.
Actual renderer tests exercise every mode and a22→60m/s source change with300Hz
receipt, followed by restoration of a−15m/s independent listener.
