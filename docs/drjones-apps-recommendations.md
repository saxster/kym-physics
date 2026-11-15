# Ideas from Dr Jones Physics for The Moving World

Research date: 15 November 2026. Scope: research and recommendations. No textbook implementation, build, test, publication or deployment took place.

My strongest recommendation is to make more of the existing figures into experiments with a question worth answering. The book already has breadth. The opportunity is to give the reader more control over what to investigate and better ways to connect observations to an explanation.

I surveyed the [apps hub](https://www.drjonesphysics.com/apps) and all 15 subject collections linked from it, including circular motion, astronomy, general skills and the miscellaneous apps. I inspected 19 selected app interfaces and their visible controls or explanations, including Motion Lab's Analyse and Practice panels. This was a content and interaction-design investigation, not an exhaustive functional test. Direct web fetching returned 403 errors; browser access worked. Catalogue descriptions support some recommendations; the evidence appendix identifies which apps I inspected in detail.

The proposed textbook activities below are my adaptations. They are not claims that Dr Jones implements those exact activities, that every interaction is missing from this book, or that learner outcomes have been measured.

## What the book already has

The [reader guide](../source/src/front/howto.md) and [README](../README.md) establish the intended reader: a twelve-year-old in Mumbai, following a historical adventure with optional school preparation. Saved predictions, recurring misconceptions, live figures, optional depth, local notes, phone experiments and offline reading are already part of the book.

The four current lesson catalogues contain 126 entries: [42 mechanics](../source/lessons/mechanics.json), [34 waves](../source/lessons/waves.json), [33 fields](../source/lessons/fields.json) and [17 everyday investigations](../source/lessons/investigations.json). The [investigation verification record](joy-verification.md) describes trial tables, repeated measurements, graphs, model comparison, source labels and exports. The [exam coverage record](exam-all-chapters-verification.md) reports 507 questions and spaced review. Those records describe previous verification; I did not rerun it for this research.

These recommendations should deepen those systems. They should preserve the historical story, the permission to think without writing, and a clear first action on a small screen.

## The first six I would choose

| Priority | Recommendation | Why it comes first | Likely relative effort |
| --- | --- | --- | --- |
| 1 | Keep earlier runs visible for comparison | Makes changing one variable meaningful across many existing figures | Small to medium per suitable figure |
| 2 | Link the scene, graphs and quantities at one instant | Connects mathematical descriptions to visible motion | Medium |
| 3 | Add measurement mysteries to selected figures | Gives existing probes, graphs and notebooks a purpose | Small to medium for existing models |
| 4 | Make rival historical models predict different evidence | Fits the book's identity and turns history into reasoning | Medium, with historical checking |
| 5 | Add short design challenges | Gives learners agency and a reason to revisit a model | Medium; much larger for free construction |
| 6 | Make uncertainty visible in a few investigations | Teaches what measurements justify, using the existing evidence records | Medium |

Effort is a design estimate, not an implementation quote. Each needs a short specification against the actual figure before scheduling.

## Detailed recommendations

### 1. Link the moving scene, graphs and quantities

[Motion Lab](https://www.drjonesphysics.com/motion) coordinates displacement, velocity and acceleration graphs with a track and a shared time cursor. Its Analyse panel exposes gradients, areas and a table of values.

Extend our existing motion lessons so one paused instant highlights the cart, its displacement, its velocity arrow and the corresponding graph points. Keep equations optional at first. A reader should be able to point to what each quantity describes. This would give the book a stronger bridge between a moving object and the mathematics used to explain it.

### 2. Let the reader author a journey

Motion Lab also supports editable stages and dragging graph corners. Adapt that idea into “make a lift start, cruise and stop” or “draw a journey that returns home.” The existing `m-graph` lesson is a natural starting point.

The new value is authorship. The reader must decide what a graph means before the animation supplies an answer. Start with a few movable points and a short journey, then offer deeper graph tools. [Source](https://www.drjonesphysics.com/motion).

### 3. Keep the previous attempt on screen

[Projectile Lab](https://www.drjonesphysics.com/projectiles) explicitly offers retained trajectories for comparison. Borrow this wherever a previous run remains intelligible: projectile paths, cooling curves, circuit readings and oscillations.

“Keep this run” should retain a labelled trace and the settings that produced it. Then ask the reader to change one thing. Two visible results make a comparison possible without requiring the reader to remember the exact shape of an earlier animation. Limit the number of traces so the picture stays readable.

### 4. Give selected figures a few purposeful modes

Several inspected apps combine exploration, analysis and practice. Our version could offer a simple first encounter, an investigation and an optional challenge, all using the same model.

For a spring, that might mean watching what a load does, measuring several extensions, then identifying an unknown load. Reuse the book's current prediction and review records. This would provide a way into deeper work without opening several separate tools or exposing every control immediately. [Inspiration](https://www.drjonesphysics.com/motion).

### 5. Turn selected figures into measurement mysteries

Motion Lab has a control for concealing numerical values; [Stellar Spectra Lab](https://www.drjonesphysics.com/stellar-spectra) and [Exoplanet Detection Lab](https://www.drjonesphysics.com/exoplanet) expose challenge sections.

In our book, hide the property to be inferred while leaving usable evidence. Ask for an unknown resistance, a pendulum length, a material's density or a star's motion. Let the reader choose a measurement and explain the conclusion. This gives existing probes and observation tables a purpose beyond collecting numbers. Make it an optional challenge, with a route back to open exploration.

### 6. Let historical theories compete on evidence

[Newton's Refraction Error](https://www.drjonesphysics.com/corpuscles) contrasts corpuscular and wave explanations, beginning with an observation both can describe and then discussing a measurement that distinguishes them.

That structure would suit this book extremely well. Present a disputed question, let the reader inspect each explanation's prediction, then reveal the decisive evidence. Candidates include light in water, the centre of an atom and competing accounts of planetary motion. The learning goal is to explain why an attractive theory became inadequate. Check each historical sequence independently before implementing it.

### 7. Make random and systematic error visibly different

The [Uncertainties & Graphing Toolkit](https://www.drjonesphysics.com/alevel-uncertainty) uses a target to distinguish scattered readings from a consistent offset.

Adapt that into a stopwatch or ruler investigation. Show how repeated readings change an estimate with random variation, then introduce a zero error that repetition cannot fix. Our notebook already records repeats and resolution. This would explain why those fields matter. Use concrete readings first; keep formal propagation of uncertainty in optional depth.

### 8. Teach instrument reading in tiny, relevant encounters

The [Vernier app](https://www.drjonesphysics.com/vernier) offers calliper and micrometer readings, random measurements, checking and worked guidance.

Borrow the short interaction at the moment a measurement becomes useful. Begin with rulers, measuring cylinders, timers and graph scales; introduce specialist instruments only when needed. Ask the reader to mark a value, then show which divisions determine it. The reason is practical: a learner can know a formula and still misread its inputs.

### 9. Save the evidence behind a discovery

Circuit Explorer has a data logger and Motion Lab offers a table export. Our book already has stronger general notebook and export foundations, so another export button would add little.

Instead, make “save this finding” capture the prediction, settings, selected observations, graph and reader's claim together. Keep simulated and physical observations clearly labelled. That would turn the notebook into a record the reader can revisit and question. [Circuit source](https://www.drjonesphysics.com/circuit-explorer); [existing evidence support](joy-verification.md).

### 10. Draw a shape and discover its balance point

The [Centre of Mass Explorer](https://www.drjonesphysics.com/com) lets users choose or draw a shape, guess its centre and suspend it using plumb lines. It states the uniform-sheet assumption.

Extend our balance investigation with a drawn cardboard shape and two virtual suspension tests, followed by an optional paper version. An asymmetric shape makes the guess interesting. The reader gets to construct something and discover why a measurement can outperform visual intuition. A useful extension is a shape whose centre lies outside its material.

### 11. Make stopping distance a controlled comparison

The [Stopping Distance app](https://www.drjonesphysics.com/stopping-distance) puts two cars beside each other and separates thinking distance from braking distance, with road and driver conditions.

Use a Mumbai road scenario and km/h. Ask which comparison isolates speed, reaction time or grip, then show the two stopping positions together. Our model should state its assumptions and use checked parameters. This connects motion, forces and energy to an understandable decision. It also exposes why changing several conditions at once cannot identify a single cause.

### 12. Give projectile motion a destination

[Projectile Lab](https://www.drjonesphysics.com/projectiles) includes a target, gravity presets and comparison situations such as dropping versus throwing.

Build short missions around our existing projectile model: land a ball in a basket, send it over a wall, or predict what changes on the Moon. Ask for a prediction before firing. Keep the first task visual and introduce calculations later. Targets give the reader a reason to care about angle and speed, while paired trials can separate horizontal and vertical motion.

### 13. Use collisions as detective problems

The forces catalogue includes a [Momentum Lab](https://www.drjonesphysics.com/momentum), which I surveyed at catalogue level.

Our existing momentum lesson could show the aftermath of a collision and ask the reader to reconstruct one missing fact from masses and motion. Rewind, inspect before and after, and distinguish momentum from kinetic energy. The appeal is the mystery; the educational value is deciding which conservation rule can answer which question. Use a small set of understandable cases before adding arbitrary collisions.

### 14. Put loads on a bridge and predict the supports

[Bridge Forces](https://www.drjonesphysics.com/bridge-forces) and [Moments](https://www.drjonesphysics.com/moments) appear in the forces catalogue.

Adapt their subject into a plank with two support readings and a movable person or load. Ask where the load must stand to produce a given pair of readings, then connect it to a ruler experiment. Our torque and support lessons already provide foundations. This creates a physical reason to use moments and links the symbols to quantities a reader could measure.

### 15. Let the reader build and repair small circuits

[Circuit Explorer](https://www.drjonesphysics.com/circuit-explorer) combines a component bin, ready-made circuits, meters, current and power overlays, and data logging.

Our circuit lessons already include probes and useful component models. Add a few constrained construction tasks: protect an LED, keep one lamp on when another switch opens, or find a wiring fault using a meter. A handful of allowed connections would be a sensible first version. This would add agency without immediately requiring a full circuit editor.

### 16. Make a circuit do a useful job

The electricity collection includes [potential-divider applications](https://www.drjonesphysics.com/potential-dividers), thermistors and light-dependent resistors.

Offer an automatic night-light or temperature-alarm challenge. Start with its behaviour: when should it switch, and which observation shows it works? Reveal the circuit explanation and optional equations afterward. This connects the reader's understanding of components to a device with a purpose. It would be especially useful as a transfer task after the current circuit lessons.

### 17. Use one wave laboratory to connect several effects

The inspected [Ripple Tank](https://www.drjonesphysics.com/ripple) exposes source patterns, obstacles, slits, frequency and a refraction region in one workspace.

Our book already covers these wave topics. A shared stage could help the reader compare them: move an obstacle, narrow a gap, introduce a shallow region and explain which aspects change. Retain a marked point or crest so the display remains interpretable. The value is continuity between phenomena that otherwise look like separate diagrams.

### 18. Distinguish a travelling wave from travelling matter

The waves catalogue includes [slinky and wave-type models](https://www.drjonesphysics.com/waves-apps).

Add a persistent marker to one particle in a suitable existing sound or wave figure, with a trace of that particle's motion beside the travelling disturbance. Ask the reader to follow the marker before naming the wave type. This targets a particular misunderstanding: particles can oscillate locally while a disturbance travels across the scene. Keep the representation honest about the medium being modelled.

### 19. Connect what the reader hears to what the graph shows

The inspected [Doppler Train](https://www.drjonesphysics.com/doppler-train) combines a moving source, frequency readings, an oscilloscope and a detector explanation.

Build on our existing audio figures so a moving source has a visible emitted frequency, received frequency and corresponding wave spacing. A train or passing vehicle provides a familiar setting. Sound should start only on request, with a complete visual equivalent. Hearing and measuring the same event would make the difference between pitch, source motion and received frequency easier to investigate.

### 20. Let optical design have consequences

[Telescope Builder](https://www.drjonesphysics.com/telescope-builder) connects optical layout and eyepiece views to aperture, focal lengths, magnification, field of view and resolution.

Begin with a small challenge: choose a view that contains the Moon, then one that separates two close stars. Later compare instruments. The point is to encounter a tradeoff and explain it. Our existing lens and eye models could support a simpler design activity before the full telescope case. Keep advanced calculations optional.

### 21. Link a thermal graph to the particle explanation

The materials catalogue includes [temperature-time graphs and particle models](https://www.drjonesphysics.com/slg-apps).

Coordinate these in one selected book investigation: heating changes a particle view, an energy account and a temperature graph together. Pause during a change of state and ask where the supplied energy is going. The gain would come from connecting representations already taught separately. Include a note that the particle drawing is a model, and avoid implying that particles themselves expand when a substance is heated.

### 22. Measure the same quantity in different ways

The inspected [Specific Heat Capacity simulation](https://www.drjonesphysics.com/shc) offers power-and-time, joulemeter, and voltage-current-time methods.

Adapt the general pattern into a question about method choice. Give the reader different instruments and ask how each could estimate energy supplied. Then discuss what the reading omits, such as energy transferred to the surroundings. This is a useful step beyond selecting numbers for a formula. Our existing evidence records could hold the methods and their assumptions side by side.

### 23. Identify an unknown object using density and buoyancy

[Density](https://www.drjonesphysics.com/density) and [Archimedes' Principle](https://www.drjonesphysics.com/archimedes) are catalogue inspirations.

Use our current buoyancy and measurement models for an unknown-object investigation. Let the reader choose a mass reading, displaced volume or apparent weight. Ask which evidence rules out a proposed material and whether a hollow object changes the conclusion. This connects equations to inference and creates a good bridge into a household experiment. It should extend the existing buoyancy lesson rather than duplicate it.

### 24. Follow one mathematical pattern across chapters

The inspected [Inverse Square app](https://www.drjonesphysics.com/inverse-square) places several physical examples under a shared distance relationship.

Make a short return trail through light, gravity and electric fields. Each stop should ask what changes at twice the distance and why the relationship applies in that model. Include a counterexample, such as a collimated beam over a limited distance, so the pattern does not become an indiscriminate rule. Field strength and intensity need their own physical explanations; shared algebra does not make them the same quantity.

### 25. Connect motors, generators and speakers as machines

The [magnetism collection](https://www.drjonesphysics.com/magnetism-apss) includes motors, generators, transformers and a loudspeaker.

Our book already has these topics. Offer a short trail that asks what each machine takes in, what changes inside it and what it produces. Let readers predict force, motion or induced voltage in a selected paused state. A speaker can connect electric current to force, motion and sound across chapters. This would make the applications reinforce each other instead of becoming separate animations to remember.

### 26. Read a star's hidden properties from its spectrum

[Stellar Spectra Lab](https://www.drjonesphysics.com/stellar-spectra) coordinates spectrum, temperature, line identification and motion. It explicitly distinguishes line strength from elemental abundance.

Extend our existing spectra lesson into an unknown-star case. Give evidence first, ask which claims it supports, then reveal the star. Start with identifying a matching line pattern, later add temperature or motion. This gives the reader an answer to “how can anyone know what a distant star is made of?” Preserve the source's useful warning against treating every stronger line as more of that element.

### 27. Discover why an undetected planet may still exist

[Exoplanet Detection Lab](https://www.drjonesphysics.com/exoplanet) uses one system for transits, radial velocity and astrometry, with signals that change with system properties and viewing geometry.

Adapt this as a case about evidence and selection effects. Let a reader discover a planet by a brightness dip, then rotate the orbit until the dip vanishes. Ask what that missing signal permits them to conclude. Begin with transits; offer stellar wobble later. The central idea is broadly useful: the method affects what can be found.

### 28. Let the reader repeat a historical measurement of the world

The [astronomy collection](https://www.drjonesphysics.com/gcse-astro) includes Eratosthenes and Aristarchus, shadows, parallax and sunspot motion.

Choose one as a fuller investigation in our historical narrative. Earth-size estimation is a strong candidate because simple angles connect a local observation to a planetary quantity. Keep the geometry and assumptions visible, then compare with the known result. A later parallax activity could revisit the same reasoning at a larger scale. These are catalogue-based inspirations, not app behaviours I tested.

### 29. Show a noisy run beside the statistical expectation

The inspected [Half-Life Lab](https://www.drjonesphysics.com/halflifelab) places random decay around a predicted curve and offers different sample sizes.

Our decay ensemble investigation already exists. Deepen it with retained runs, a visible expectation and a prompt about what changes when the sample grows. Ask whether one uneven run disproves the model. Distinguish nuclei remaining, activity and detector count rate, including background when appropriate. This teaches the reader to expect variation and evaluate it, rather than treating every imperfect graph as failure.

### 30. Make correcting an error part of the puzzle

[Honeycomb Trail](https://www.drjonesphysics.com/honeycomb) asks pupils to move through statements that satisfy a rule and can add a task correcting rejected statements.

Borrow the correction step for our recurring misconceptions. A short trail might contain statements about forces on a moving object; after choosing a route, the reader repairs one tempting mistake and explains why. The worthwhile part is the explanation, not the hidden word. Avoid making every review a game, and provide a simple list version for readers who prefer it.

### 31. Generate a fresh case from a known question

The inspected [Worksheet Generator](https://www.drjonesphysics.com/pwg) offers parameterised questions, matching answers, repeatable seeds and printable formats. The [Retrieval Practice Toolkit](https://www.drjonesphysics.com/retrieval-practice-toolkit) offers topic selection and small sets of revealable cards.

Our book already has a substantial question bank and spaced review. Add selected “try another case” variants that preserve the physics while changing the numbers or situation. Carry a challenge's settings into its question and worked explanation. A seed should recreate the same case for discussion. Offer a paper experiment sheet when it helps the reader use physical apparatus.

### 32. Help readers find an activity by what they want to do

The [apps hub](https://www.drjonesphysics.com/apps) gives the collection clear subject entrances, while individual labs have recognisable purposes.

Our existing investigation directory already filters by objects and duration. Add a small set of curated routes such as “make something work,” “find a hidden property,” “test an explanation” and “measure it yourself.” Each route should return to the chapter that gives it meaning. A Mumbai train journey, kitchen heating investigation or rooftop sky question could tie several existing figures together. This is an adaptation of the collection's navigability, not a feature I observed on Dr Jones.

## What I would leave out of the first pass

- A full duplicate catalogue of simulations. Existing topic coverage is already substantial.
- A separate scoring, progress or spaced-review system. Reuse the current notebook and exam preparation.
- A control panel with every variable visible on first opening. Several inspected labs address older learners; this reader needs an inviting first action.
- An A-Level syllabus expansion. Advanced examples can be optional destinations when they strengthen the story.
- A live UK power-station map as a default feature. Its application idea is interesting, but an Indian context and a clear teaching question would need separate work and data checking.
- Surface reskins of the same interaction. A new appearance alone would not justify displacing work on comparison, measurement and explanation.

I would retain the book's own prose and visual identity, write original implementations, and acknowledge Dr Jones as an inspiration. Reusing any source code, artwork or exact text would need its actual licence checked; this report does not establish permission for those assets.

## A concrete first learning sequence

Use the existing motion model for a train leaving a station. Ask the reader to sketch its velocity graph, run the motion with linked graphs, keep the trace, and change just the braking stage. Then hide one quantity and ask the reader to infer it from the graph. Save the prediction, comparison and explanation in the existing notebook. A later question can ask how the same reasoning applies to a lift.

That one sequence would exercise the most valuable ideas here before committing to a large set of new apps. Its success should be judged by whether a learner can explain the changed motion and graph, not by time spent or buttons pressed.

## Evidence and limits

Collections surveyed in the browser: [forces](https://www.drjonesphysics.com/forces-apps), [waves](https://www.drjonesphysics.com/waves-apps), [electricity](https://www.drjonesphysics.com/electricity-apps1), [heat](https://www.drjonesphysics.com/heat-apps), [materials](https://www.drjonesphysics.com/slg-apps), [general skills](https://www.drjonesphysics.com/general-apps), [radioactivity](https://www.drjonesphysics.com/radioactivity-apps), [circular motion](https://www.drjonesphysics.com/circshm-apps), [astronomy](https://www.drjonesphysics.com/gcse-astro), [turning points](https://www.drjonesphysics.com/turning-points-in-physics), [energy](https://www.drjonesphysics.com/energy-apps), [magnetism](https://www.drjonesphysics.com/magnetism-apss), [quantum](https://www.drjonesphysics.com/quantum-apps), [fields](https://www.drjonesphysics.com/a-level-fields-apps) and [miscellaneous](https://www.drjonesphysics.com/random-cool-apps1).

Detailed interface inspection: Motion Lab, Circuit Explorer, Projectile Lab, Centre of Mass Explorer, Specific Heat Capacity, Newton's Refraction Error, Exoplanet Detection Lab, Honeycomb Trail, Uncertainties & Graphing Toolkit, Ripple Tank, Stopping Distance, Inverse Square, Vernier, Doppler Train, Stellar Spectra Lab, Half-Life Lab, Telescope Builder, Worksheet Generator and Retrieval Practice Toolkit. Links appear beside the associated recommendations above. Some apps are embedded from the author's `hookean1-dotcom.github.io/apps` collection; their public wrapper pages are used as the stable source links here.

I read visible controls and explanations and opened Motion Lab's analysis and practice panels. I did not validate the underlying numerical models, complete every challenge, test audio, generate or inspect downloadable files, run a device matrix, or test learner comprehension. Catalogue-only suggestions are identified in the relevant entries. All effectiveness claims in this report are pedagogical reasons for choosing a design, not measured outcomes.

The current-book comparison is a bounded reading of the catalogues and reader documentation. It is not a claim that every proposed interaction is absent from every existing figure. Before implementation, check the chosen figure and define the smallest addition that earns its place.
