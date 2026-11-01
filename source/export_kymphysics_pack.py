#!/usr/bin/env python3
"""
Deterministic content pack compiler for KymPhysics (iPadOS 27 & macOS).

Compiles:
1. All 16 chapters of "The Moving World" (source/src/ch00.md .. ch15.md)
2. All 95 historical & everyday physics stories (source/src/stories/*.md)
3. All 109 structured investigations & 3D Atlas lessons (source/lessons/*.json)
4. All live physics widgets & pedagogical enhancements (source/live/enhancements.js)
5. All 4 Front-Matter Explorers (x_scale, x_sky, x_spectrum, x_map)
6. All 16 chapter exam banks (507 exam-prep questions + 96 cards in source/exams/*.json)
7. Complete 9-unit / 42-sub-topic Cambridge Lower Secondary Science 8
   (Learner's Book 8 & Workbook 8 by Mary Jones, Diane Fellowes-Freeman & Michael Smyth)
   with exact LB/WB page numbers, strands, Kym's completed unit ticks (Units 3 & 6 ticked,
   Unit 9 upcoming), and pre-seeded Worked Example -> Faded Completion -> Independent Proof questions.
8. 8 First-Principles Cross-Disciplinary Bridges from ../kym_chem and ../kym_bio
9. 24 Physics Diagram Recall Plates with callout pins for Apple Pencil recall.

Also bundles the offline Moving World web reader assets (index.html, live/, assets/, exams/)
into KymPhysics/KymPhysics/Resources/MovingWorldBook/.
"""

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "source"
KYMPHYSICS_DIR = ROOT / "KymPhysics" / "KymPhysics"
PACK_DIR = KYMPHYSICS_DIR / "Resources" / "ContentPacks"
BOOK_BUNDLE_DIR = KYMPHYSICS_DIR / "Resources" / "MovingWorldBook"

VOLUME_META = {
    1: {"id": "vol1", "number": 1, "title": "Volume I · How Things Move", "chapters": [0, 1, 2, 3, 4]},
    2: {"id": "vol2", "number": 2, "title": "Volume II · Energy, Matter and Warmth", "chapters": [5, 6, 7, 8]},
    3: {"id": "vol3", "number": 3, "title": "Volume III · Waves, Sound and Light", "chapters": [9, 10, 11]},
    4: {"id": "vol4", "number": 4, "title": "Volume IV · Electricity, Magnetism and the Sky", "chapters": [12, 13, 14, 15]},
}

CHAPTER_DEFAULT_TITLES = {
    0: ("The physicist's way of seeing", "Models, measurement, powers of ten and estimation"),
    1: ("How fast, how far", "Position, speed, velocity, acceleration and motion graphs"),
    2: ("Why things change their motion", "Forces, free-body diagrams, Newton's laws and momentum"),
    3: ("Turning, balancing and machines", "Moments, levers, centre of mass and equilibrium"),
    4: ("Round in circles", "Centripetal force, orbits, rolling and angular motion"),
    5: ("The currency of change", "Energy stores, mechanical work, efficiency and power"),
    6: ("Under pressure", "Solid pressure, hydrostatic depth, gas collisions and buoyancy"),
    7: ("What matter is made of", "Density, Brownian motion, states of matter and latent heat"),
    8: ("Warmth and the monsoon", "Temperature vs heat, conduction, convection and IR radiation"),
    9: ("Vibrations, waves and music", "Transverse & longitudinal waves, sound speed, pitch and harmonics"),
    10: ("Rays, mirrors and eyes", "Law of reflection, Snell's law refraction, lenses and RGB colour"),
    11: ("Light as a wave", "Diffraction, interference, polarisation and the electromagnetic spectrum"),
    12: ("Charge and current", "Electrostatics, current, voltage, resistance and series/parallel circuits"),
    13: ("Magnets and motors", "Magnetic fields, Earth's dynamo, electromagnets and motor force"),
    14: ("Earth, Moon and Sun", "Axial tilt, seasons, lunar phases, eclipses and ocean tides"),
    15: ("The wider universe", "Planets, exoplanets, stellar lifecycles, galaxies and cosmic expansion"),
}


def volume_for_chapter(ch_num: int) -> int:
    for vol_num, meta in VOLUME_META.items():
        if ch_num in meta["chapters"]:
            return vol_num
    return 1


def parse_chapters():
    chapters = []
    src_dir = SOURCE_DIR / "src"
    for ch_num in range(16):
        md_path = src_dir / f"ch{ch_num:02d}.md"
        if not md_path.exists():
            continue
        raw = md_path.read_text(encoding="utf-8")
        lines = raw.splitlines()
        default_title, default_sub = CHAPTER_DEFAULT_TITLES.get(ch_num, (f"Chapter {ch_num}", ""))
        title = default_title
        subtitle = default_sub
        for line in lines:
            if line.startswith("# "):
                raw_title = line[2:].strip()
                if " — " in raw_title:
                    title = raw_title.split(" — ", 1)[1].strip()
                elif ": " in raw_title:
                    title = raw_title.split(": ", 1)[1].strip()
                elif not raw_title.lower().startswith("chapter"):
                    title = raw_title
                break

        sections = []
        current_sec = None
        for line in lines:
            if line.startswith("## "):
                if current_sec:
                    sections.append(current_sec)
                sec_heading = line[3:].strip()
                sec_id = f"ch{ch_num:02d}-s{len(sections)+1:02d}"
                current_sec = {
                    "id": sec_id,
                    "heading": sec_heading,
                    "markdown": "",
                }
            elif current_sec is not None:
                current_sec["markdown"] += line + "\n"
        if current_sec:
            sections.append(current_sec)

        callouts = []
        callout_pattern = re.compile(
            r":::(predict|check|recall|careful|school|home|try|five|case)\s*([^\n]*)\n(.*?)\n:::",
            re.DOTALL,
        )
        for idx, match in enumerate(callout_pattern.finditer(raw)):
            kind = match.group(1).strip()
            header = match.group(2).strip()
            body = match.group(3).strip()
            callouts.append({
                "id": f"ch{ch_num:02d}-{kind}-{idx+1:02d}",
                "kind": kind,
                "title": header or kind.capitalize(),
                "body": body,
            })

        terms = []
        seen_terms = set()
        for m in re.finditer(r"==([^=\n]+)==", raw):
            t = m.group(1).strip()
            if t.lower() not in seen_terms and len(t) <= 48:
                seen_terms.add(t.lower())
                terms.append(t)

        widgets = []
        for m in re.finditer(
            r"\{\{widget:([a-zA-Z0-9_]+)\}\}|data-widget=[\"']([a-zA-Z0-9_]+)[\"']|:::widget\s+([a-zA-Z0-9_]+)|:::live\s+([a-zA-Z0-9_]+)",
            raw,
        ):
            w_id = m.group(1) or m.group(2) or m.group(3) or m.group(4)
            if w_id and w_id not in widgets:
                widgets.append(w_id)

        vol_num = volume_for_chapter(ch_num)
        hook_summary = sections[0]["markdown"].strip().split("\n\n")[0][:360] if sections else default_sub
        chapters.append({
            "id": f"ch{ch_num:02d}",
            "number": ch_num,
            "volumeNumber": vol_num,
            "volumeTitle": VOLUME_META[vol_num]["title"],
            "title": title,
            "subtitle": subtitle,
            "hookSummary": hook_summary,
            "sections": [
                {
                    "id": s["id"],
                    "heading": s["heading"],
                    "excerpt": s["markdown"].strip()[:1200],
                }
                for s in sections
            ],
            "callouts": callouts,
            "keyTerms": terms[:24],
            "widgets": widgets,
        })
    return chapters


def parse_stories():
    stories = []
    stories_dir = SOURCE_DIR / "src" / "stories"
    if not stories_dir.exists():
        return stories
    for md_file in sorted(stories_dir.glob("*.md")):
        raw = md_file.read_text(encoding="utf-8")
        lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
        title = md_file.stem.replace("-", " ").title()
        for ln in lines:
            if ln.startswith("#"):
                title = ln.lstrip("#").strip()
                break
        body_paras = [ln for ln in lines if not ln.startswith("#") and not ln.startswith(":::")]
        excerpt = "\n\n".join(body_paras[:3])[:900]
        kind = "portrait" if md_file.stem.startswith("p-") else "topic"
        stories.append({
            "id": md_file.stem,
            "title": title,
            "kind": kind,
            "excerpt": excerpt,
        })
    return stories


def parse_investigations():
    lessons = []
    lessons_dir = SOURCE_DIR / "lessons"
    for json_file in sorted(lessons_dir.glob("*.json")):
        category = json_file.stem
        data = json.loads(json_file.read_text(encoding="utf-8"))
        for item in data:
            lessons.append({
                "id": item["id"],
                "category": category,
                "widget": item.get("widget", ""),
                "renderer": item.get("renderer", ""),
                "title": item["title"],
                "chapter": item.get("chapter", 0),
                "section": item.get("section", ""),
                "figure": item.get("figure", ""),
                "question": item.get("question", ""),
                "explanation": item.get("explanation", ""),
                "limits": item.get("limits", ""),
                "materials": item.get("materials", ""),
                "procedure": item.get("procedure", []),
                "worked": item.get("worked", ""),
                "challenge": item.get("challenge", ""),
                "stories": item.get("stories", []),
            })
    return lessons


def parse_widgets():
    enh_path = SOURCE_DIR / "live" / "enhancements.js"
    raw = enh_path.read_text(encoding="utf-8") if enh_path.exists() else ""

    widget_to_chapter = {
        "videotrack": 1, "graphwalk": 1, "freefall": 1, "airfall": 2, "projectile": 2,
        "vectors": 2, "forces": 2, "ramp": 2, "atwood": 2, "momentum_carts": 2,
        "whirl": 4, "cannon3d": 4, "energystores": 5, "energytrack": 5,
        "pressuretank": 6, "buoyancy": 6, "expansion": 7, "conduction": 8,
        "ripple": 9, "harmonics": 9, "scope": 9, "doppler": 9,
        "mirror": 10, "refraction": 10, "eye3d": 10, "colourmix": 10,
        "interference": 11, "skycolour": 11, "circuit": 12, "seriesparallel": 12,
        "field3d": 13, "magnetometer": 13, "induction": 13,
        "shadow": 14, "seasons": 14, "phases": 14, "tides": 14, "parallax": 15,
        "mechanicslab": 2, "waveslab": 9, "fieldslab": 13, "investigations": 4,
    }

    widgets = []
    block_starts = list(re.finditer(r"\n  ([a-zA-Z0-9_]+):\s*\{\s*\n\s*challenge:", raw))
    for i, match in enumerate(block_starts):
        w_id = match.group(1)
        start_pos = match.start()
        end_pos = block_starts[i + 1].start() if i + 1 < len(block_starts) else len(raw)
        chunk = raw[start_pos:end_pos]

        prompt_m = re.search(r"prompt:\s*'((?:\\'|[^'])*)'", chunk)
        cutaway_m = re.search(r"cutaway:\s*'((?:\\'|[^'])*)'", chunk)
        ideal_m = re.search(r"idealised:\s*'((?:\\'|[^'])*)'", chunk)
        watch_steps = []
        for wm in re.finditer(r"\{\s*title:\s*'((?:\\'|[^'])*)',\s*caption:\s*'((?:\\'|[^'])*)'", chunk):
            watch_steps.append({
                "title": wm.group(1).replace("\\'", "'"),
                "caption": wm.group(2).replace("\\'", "'"),
            })

        ch_num = widget_to_chapter.get(w_id, 1)
        pretty_title = (
            w_id.replace("_", " ")
            .title()
            .replace("3D", " 3D")
            .replace("Videotrack", "240 fps Video Motion Tracker")
            .replace("Graphwalk", "Corridor Position-Time Walk")
            .replace("Airfall", "Galileo Vacuum Feather & Coin Drop")
            .replace("Seriesparallel", "Series & Parallel Circuit Bench")
            .replace("Colourmix", "RGB Light & Filter Mixer")
            .replace("Pressuretank", "Kinetic Gas & Liquid Pressure Tank")
            .replace("Energytrack", "Skate & Roller-Coaster Energy Track")
            .replace("Energystores", "Sankey & Energy Stores Ledger")
        )
        widgets.append({
            "id": w_id,
            "title": pretty_title,
            "chapter": ch_num,
            "is3D": "3d" in w_id.lower() or w_id in ("seasons", "phases", "fieldslab", "mechanicslab"),
            "challengePrompt": prompt_m.group(1).replace("\\'", "'") if prompt_m else "Adjust the physical parameters and observe the invariant relationship.",
            "cutaway": cutaway_m.group(1).replace("\\'", "'") if cutaway_m else "Microscopic / vector mechanism view inside the apparatus.",
            "idealised": ideal_m.group(1).replace("\\'", "'") if ideal_m else "Idealised physical model with controlled boundary conditions.",
            "watchSteps": watch_steps,
        })

    # Ensure key standalone widgets are present even if defined via helper macro A(...)
    existing_ids = {w["id"] for w in widgets}
    macro_matches = re.finditer(
        r"\n  ([a-zA-Z0-9_]+):\s*A\(\s*'((?:\\'|[^'])*)'",
        raw,
    )
    for m in macro_matches:
        w_id = m.group(1)
        if w_id in existing_ids:
            continue
        prompt = m.group(2).replace("\\'", "'")
        ch_num = widget_to_chapter.get(w_id, 1)
        widgets.append({
            "id": w_id,
            "title": w_id.replace("_", " ").title().replace("3D", " 3D"),
            "chapter": ch_num,
            "is3D": "3d" in w_id.lower() or w_id in ("seasons", "phases"),
            "challengePrompt": prompt,
            "cutaway": "Switch to Cut-away to inspect the internal forces, rays, or field vectors.",
            "idealised": "Idealised physical model with controlled parameters.",
            "watchSteps": [
                {"title": "1. Wide view", "caption": "Observe the complete physical apparatus."},
                {"title": "2. Close-up", "caption": "Zoom into the active interaction region."},
                {"title": "3. Cut-away", "caption": "Reveal internal vectors, particles, or rays."},
            ],
        })

    return widgets


def parse_exam_banks():
    exams_dir = SOURCE_DIR / "exams"
    banks = []
    file_order = ["ch00.json", "motion.json"] + [f"ch{i:02d}.json" for i in range(2, 16)]
    for fname in file_order:
        fpath = exams_dir / fname
        if not fpath.exists():
            continue
        data = json.loads(fpath.read_text(encoding="utf-8"))
        ch_num = data.get("chapter", 1 if fname == "motion.json" else 0)
        questions = []
        for q in data.get("questions", []):
            questions.append({
                "id": q["id"],
                "chapter": ch_num,
                "title": q.get("title", ""),
                "stage": q.get("stage", "independent"),
                "kind": q.get("kind", "explain"),
                "prompt": q.get("prompt", ""),
                "marks": q.get("marks", 2),
                "points": q.get("points", []),
                "model": q.get("model", []),
                "common": q.get("common", ""),
                "hints": q.get("hints", []),
                "teach": q.get("teach", ""),
            })
        cards = []
        for c in data.get("cards", []):
            cards.append({
                "id": c["id"],
                "chapter": ch_num,
                "term": c.get("term", ""),
                "definition": c.get("definition", ""),
                "example": c.get("example", ""),
                "confusion": c.get("confusion", ""),
                "question": c.get("question", ""),
                "answer": c.get("answer", ""),
                "formula": c.get("formula", ""),
            })
        banks.append({
            "id": data.get("key", f"chapter-{ch_num:02d}"),
            "chapter": ch_num,
            "title": data.get("title", f"Chapter {ch_num}"),
            "objectivesCount": len(data.get("objectives", [])),
            "cards": cards,
            "questions": questions,
        })
    return banks


def build_explorers():
    return [
        {
            "id": "x_scale",
            "title": "Powers of Ten",
            "subtitle": "Logarithmic dial from 10⁻¹⁵ m proton nuclei to 10²⁶ m cosmic horizons",
            "symbol": "ruler",
            "linkedChapters": [0, 7, 15],
            "summary": "Sweep across 41 orders of magnitude from subatomic femtometres and Mumbai raindrops to planetary orbits, the Milky Way, and the observable universe.",
        },
        {
            "id": "x_sky",
            "title": "The Sky Over Mumbai",
            "subtitle": "Live planetarium dome set to 19.07° N, 72.88° E with time-travel scrubber",
            "symbol": "sparkles",
            "linkedChapters": [0, 4, 14, 15],
            "summary": "Watch the ecliptic, Moon phases, planets, and constellations wheel overhead from Marine Drive, or jump to any latitude and season.",
        },
        {
            "id": "x_spectrum",
            "title": "The Ladder of Light",
            "subtitle": "Continuous electromagnetic spectrum from radio waves to gamma rays (λ, f, E = hf)",
            "symbol": "waveform.path.ecg",
            "linkedChapters": [8, 9, 10, 11],
            "summary": "Slide across 16 decades of wavelength and frequency to see how antennas, warm monsoon clouds, human retinal cones, and X-ray tubes emit and detect electromagnetic waves.",
        },
        {
            "id": "x_map",
            "title": "The Adventure Map",
            "subtitle": "Interactive concept graph across all 16 Physics chapters and 9 school Science units",
            "symbol": "point.3.connected.trianglepath.dotted",
            "linkedChapters": list(range(16)),
            "summary": "Trace how conservation laws, vectors, fields, and waves connect every chapter of The Moving World to Cambridge Lower Secondary Science 8.",
        },
    ]


def build_cross_disciplinary_bridges():
    return [
        {
            "id": "bridge-bio-boyle-breathing",
            "discipline": "biology",
            "sourceBook": "The Living World (KymBio)",
            "sourceRef": "Ch 6 · Thoracic Ventilation & Alveolar Pressure",
            "deepLink": "kymbio://chapter/ch06",
            "title": "Boyle's Law in the human chest: how diaphragm contraction drives airflow",
            "schoolTopics": ["1.3", "3.6"],
            "movingWorldChapters": [6, 7],
            "summary": "Lungs have no skeletal muscle of their own. When the diaphragm flattens and external intercostals lift the ribs, thoracic volume V increases, dropping alveolar gas pressure P below atmospheric pressure (P₁V₁ = P₂V₂) so air rushes in.",
            "keyEquation": "P₁V₁ = P₂V₂  (at constant T = 310 K)",
            "microCheckQuestion": "During inhalation, thoracic volume increases while temperature stays constant at 37 °C. Why does air flow into the lungs?",
            "microCheckAnswer": "Increasing volume reduces the collision frequency of gas molecules with alveolar walls, so internal pressure drops below atmospheric pressure and outside air is pushed in.",
        },
        {
            "id": "bridge-bio-biomechanics-levers",
            "discipline": "biology",
            "sourceBook": "The Living World (KymBio)",
            "sourceRef": "Ch 8 · Antagonistic Muscles & Skeletal Levers",
            "deepLink": "kymbio://chapter/ch08",
            "title": "Forearm bones and biceps/triceps as Class 3 mechanical levers",
            "schoolTopics": ["3.4", "7.4"],
            "movingWorldChapters": [2, 3],
            "summary": "The elbow hinge joint acts as a pivot (fulcrum). Because the biceps tendon inserts only ~4 cm from the elbow while a load in the hand sits ~32 cm away, the biceps must exert 8× the load's weight — trading force advantage for rapid, wide-arc motion.",
            "keyEquation": "M = F × d⊥   (F_biceps × d_in = F_load × d_out)",
            "microCheckQuestion": "Why must skeletal muscles work in antagonistic pairs (like biceps and triceps) across every hinge joint?",
            "microCheckAnswer": "Muscle fibres can only generate tension (pull) when they contract; they cannot push a bone back when they relax, so a second muscle on the opposite side of the pivot is needed to reverse the moment.",
        },
        {
            "id": "bridge-chem-kinetic-diffusion",
            "discipline": "chemistry",
            "sourceBook": "The Invisible World (KymChem)",
            "sourceRef": "Ch 1 & Ch 3 · Kinetic Theory, Dissolving & Brownian Motion",
            "deepLink": "kymchem://chapter/ch01",
            "title": "Thermal kinetic energy (½mv² ~ k_B T) drives diffusion & dissolving",
            "schoolTopics": ["1.2", "2.1", "2.2", "3.7"],
            "movingWorldChapters": [6, 7, 8],
            "summary": "Particles in liquids and gases have no 'goal'; random thermal motion at temperature T causes high-speed molecular collisions that spread solutes from higher concentration to lower concentration.",
            "keyEquation": "⟨E_k⟩ = (3/2) k_B T",
            "microCheckQuestion": "Why does potassium permanganate diffuse much faster in hot water (80 °C) than in iced water (5 °C)?",
            "microCheckAnswer": "At higher temperature, water and solute particles have greater average kinetic energy and move faster, colliding and mixing more rapidly.",
        },
        {
            "id": "bridge-chem-rutherford-atom",
            "discipline": "chemistry",
            "sourceBook": "The Invisible World (KymChem)",
            "sourceRef": "Ch 2 · Subatomic Particles & Coulomb Attraction",
            "deepLink": "kymchem://chapter/ch02",
            "title": "Electrostatic forces inside the atom: protons (+1), electrons (-1) & gold-foil scattering",
            "schoolTopics": ["5.1"],
            "movingWorldChapters": [7, 12],
            "summary": "Rutherford fired positively charged alpha particles at thin gold foil: most went straight through empty space, while a tiny fraction recoiled from a dense, positivamente charged nucleus held to negative electrons by Coulomb attraction.",
            "keyEquation": "F_e = k · |q₁ q₂| / r²",
            "microCheckQuestion": "Why is a complete atom electrically neutral even though its nucleus carries a strong positive charge?",
            "microCheckAnswer": "The number of positively charged protons (+1 each) in the nucleus equals the number of negatively charged electrons (-1 each) in the surrounding shells, so the net charge is zero.",
        },
        {
            "id": "bridge-chem-climate-albedo",
            "discipline": "chemistry",
            "sourceBook": "The Invisible World (KymChem)",
            "sourceRef": "Ch 8 · Atmospheric Cycles, Ice Cores & IR Greenhouse Absorption",
            "deepLink": "kymchem://chapter/ch08",
            "title": "Radiative balance, ice-albedo feedback & infrared vibrational absorption",
            "schoolTopics": ["5.3", "5.4", "5.5"],
            "movingWorldChapters": [8, 11, 14],
            "summary": "Earth absorbs short-wave solar light and re-emits long-wave infrared thermal radiation (Ch 8). Greenhouse molecules (CO₂, H₂O, CH₄) absorb those IR wavelengths, while white glacial ice reflects sunlight (high albedo).",
            "keyEquation": "P_rad = ε σ A T⁴",
            "microCheckQuestion": "During an ice age (Topic 5.4), how does expanding white ice sheets create a cooling feedback loop using reflection (Topic 6.1)?",
            "microCheckAnswer": "White ice and snow reflect a high fraction of incoming solar radiation back into space instead of absorbing it, lowering Earth's surface temperature further.",
        },
        {
            "id": "bridge-bio-eye-optics",
            "discipline": "biology",
            "sourceBook": "The Living World (KymBio)",
            "sourceRef": "Ch 0 & Ch 9 · Leeuwenhoek's Lens, Eye Accommodation & Retinal Cones",
            "deepLink": "kymbio://chapter/ch09",
            "title": "Corneal refraction, ciliary lens accommodation & RGB cone photoreceptors",
            "schoolTopics": ["6.2", "6.4"],
            "movingWorldChapters": [10],
            "summary": "The cornea and flexible crystalline lens refract diverging rays from near objects onto the retina. Three classes of retinal cone cells (S-blue, M-green, L-red) explain why Red, Green, and Blue are the three primary colours of light!",
            "keyEquation": "n₁ sin θ₁ = n₂ sin θ₂   and   1/f = 1/u + 1/v",
            "microCheckQuestion": "Why does a green leaf look almost black when viewed through a pure red colour filter (Topic 6.4)?",
            "microCheckAnswer": "Chlorophyll in the leaf absorbs red and blue light and reflects green light; the red filter absorbs the reflected green light and transmits only red, so no light reaches the eye.",
        },
        {
            "id": "bridge-chem-energetics-enthalpy",
            "discipline": "chemistry",
            "sourceBook": "The Invisible World (KymChem)",
            "sourceRef": "Ch 4 & Ch 5 · Exothermic & Endothermic Enthalpy Ledgers",
            "deepLink": "kymchem://chapter/ch04",
            "title": "First Law of Thermodynamics in chemical bond breaking vs bond making",
            "schoolTopics": ["1.4", "8.1", "8.2"],
            "movingWorldChapters": [5, 8],
            "summary": "Energy is never created from nothing (Ch 5). In an exothermic reaction (Topic 8.1, like combustion or cellular respiration), chemical potential energy stored in reactants transfers into thermal kinetic energy of the surroundings so thermometer readings rise.",
            "keyEquation": "ΔH = E(bonds broken) − E(bonds formed)",
            "microCheckQuestion": "When sherbet (citric acid + sodium hydrogencarbonate) dissolves and reacts on your tongue (Topic 8.2), your mouth feels cold. Which way did thermal energy flow?",
            "microCheckAnswer": "The reaction is endothermic: it absorbs thermal energy from your tongue and saliva into chemical potential energy of the products, lowering the temperature of your mouth.",
        },
        {
            "id": "bridge-bio-nerve-magnetoreception",
            "discipline": "biology",
            "sourceBook": "The Living World (KymBio)",
            "sourceRef": "Ch 9 & Ch 14 · Bioelectricity & Migratory Magnetoreception",
            "deepLink": "kymbio://chapter/ch09",
            "title": "Action-potential ion currents and how migratory birds sense Earth's magnetic field",
            "schoolTopics": ["9.2"],
            "movingWorldChapters": [12, 13],
            "summary": "Every nerve impulse in Kym's body is a travelling wave of Na⁺ and K⁺ ion currents across an axon membrane (~70 mV), while migratory birds and sea turtles use biogenic magnetite crystals and quantum cryptochrome receptors to navigate Earth's dipolar magnetic field.",
            "keyEquation": "I = ΔQ / Δt",
            "microCheckQuestion": "Why does the north-seeking pole of a magnetic compass needle point toward Earth's Geographic North Pole (Topic 9.2)?",
            "microCheckAnswer": "Unlike magnetic poles attract, so Earth's Geographic North Pole actually lies near a magnetic south pole of Earth's core dynamo.",
        },
    ]


def build_school_science_textbook():
    """
    Complete Cambridge Lower Secondary Science 8 (Second Edition)
    Learner's Book 8 & Workbook 8 — Mary Jones, Diane Fellowes-Freeman & Michael Smyth.
    Exact unit titles, sub-topic numbers, LB pages, WB pages, strands, and ticked state
    transcribed from Kym's physical textbook photos:
      - Unit 3 (Forces and energy) is marked '2 ✓' (all 3.1-3.7 ticked ✓)
      - Unit 6 (Light) is marked '4 ✓' (all 6.1-6.6 ticked ✓)
      - Unit 9 (Magnetism) is unticked (upcoming Physics unit!)
    """
    units = [
        {
            "id": "sci8-u1",
            "unitNumber": 1,
            "title": "Respiration",
            "discipline": "physics_bridge",
            "scienceStrands": ["Biology: Structure and function", "Biology: Life processes"],
            "twsStrands": [
                "Models and representations",
                "Carrying out scientific enquiry",
                "Scientific enquiry: purpose and planning",
                "Scientific enquiry: analysis, evaluation and conclusions",
            ],
            "scienceInContext": "Discuss how scientific knowledge develops over time by shared understanding and investigation.",
            "learnersBookStartPage": 8,
            "learnersBookEndPage": 39,
            "workbookStartPage": 2,
            "workbookEndPage": 20,
            "isCompletedInSchool": True,
            "movingWorldChapters": [5, 6, 7],
            "bridgeIds": ["bridge-bio-boyle-breathing", "bridge-chem-kinetic-diffusion", "bridge-chem-energetics-enthalpy"],
            "topics": [
                {
                    "id": "sci8-1.1",
                    "code": "1.1",
                    "title": "The human respiratory system",
                    "learnersBookPage": 8,
                    "workbookPage": 2,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [6],
                    "linkedWidgets": ["pressuretank"],
                    "bridgeIds": [],
                    "summary": "Airway anatomy (trachea with C-shaped cartilage rings that resist low-pressure collapse, bronchi, bronchioles, alveoli).",
                    "cambridgeWatchouts": ["Cartilage rings keep the trachea open when internal air pressure drops during inhalation."],
                },
                {
                    "id": "sci8-1.2",
                    "code": "1.2",
                    "title": "Gas exchange",
                    "learnersBookPage": 12,
                    "workbookPage": 5,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [7],
                    "linkedWidgets": ["pressuretank"],
                    "bridgeIds": ["bridge-chem-kinetic-diffusion"],
                    "summary": "Diffusion of O₂ and CO₂ across one-cell-thick alveolar walls driven by random thermal motion of gas molecules (Topic 3.7).",
                    "cambridgeWatchouts": ["Diffusion requires no pump; net movement follows the concentration (partial-pressure) gradient."],
                },
                {
                    "id": "sci8-1.3",
                    "code": "1.3",
                    "title": "Breathing",
                    "learnersBookPage": 18,
                    "workbookPage": 6,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [6],
                    "linkedWidgets": ["pressuretank"],
                    "bridgeIds": ["bridge-bio-boyle-breathing"],
                    "summary": "Boyle's Law in the thorax: contracting the diaphragm and intercostal muscles increases thoracic volume, decreasing lung pressure below atmospheric pressure so air flows in.",
                    "cambridgeWatchouts": ["Always link the 3 steps: volume increases → gas pressure decreases (below atmospheric) → air flows in."],
                },
                {
                    "id": "sci8-1.4",
                    "code": "1.4",
                    "title": "Respiration",
                    "learnersBookPage": 25,
                    "workbookPage": 14,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [5, 8],
                    "linkedWidgets": ["energystores"],
                    "bridgeIds": ["bridge-chem-energetics-enthalpy"],
                    "summary": "Conservation of energy in cellular respiration: chemical store in glucose + oxygen transfers to cellular work and thermal energy (never 'created').",
                    "cambridgeWatchouts": ["Never write 'energy is made/produced'; energy is conserved and released/transferred from glucose."],
                },
                {
                    "id": "sci8-1.5",
                    "code": "1.5",
                    "title": "Blood",
                    "learnersBookPage": 31,
                    "workbookPage": 16,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [6],
                    "linkedWidgets": ["pressuretank"],
                    "bridgeIds": [],
                    "summary": "Plasma, red blood cells, white blood cells, and platelets transported by hydrostatic pressure from the heart pump.",
                    "cambridgeWatchouts": ["Biconcave disc shape increases surface-area-to-volume ratio for rapid diffusion."],
                },
            ],
        },
        {
            "id": "sci8-u2",
            "unitNumber": 2,
            "title": "Properties of materials",
            "discipline": "physics_bridge",
            "scienceStrands": ["Chemistry: Materials and their structure", "Chemistry: Properties of materials"],
            "twsStrands": [
                "Scientific enquiry: purpose and planning",
                "Carrying out scientific enquiry",
                "Scientific enquiry: analysis, evaluation and conclusions",
            ],
            "scienceInContext": "Describe how science is used in different societies and industries.",
            "learnersBookStartPage": 40,
            "learnersBookEndPage": 67,
            "workbookStartPage": 21,
            "workbookEndPage": 37,
            "isCompletedInSchool": True,
            "movingWorldChapters": [0, 7, 8],
            "bridgeIds": ["bridge-chem-kinetic-diffusion"],
            "topics": [
                {
                    "id": "sci8-2.1",
                    "code": "2.1",
                    "title": "Dissolving",
                    "learnersBookPage": 40,
                    "workbookPage": 21,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [7],
                    "linkedWidgets": ["expansion"],
                    "bridgeIds": ["bridge-chem-kinetic-diffusion"],
                    "summary": "Conservation of mass during dissolving (mass of solution = mass of solute + mass of solvent) and particle mixing.",
                    "cambridgeWatchouts": ["Total mass is strictly conserved when a solid dissolves in a liquid."],
                },
                {
                    "id": "sci8-2.2",
                    "code": "2.2",
                    "title": "Solutions and solubility",
                    "learnersBookPage": 45,
                    "workbookPage": 23,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [7, 8],
                    "linkedWidgets": ["expansion"],
                    "bridgeIds": ["bridge-chem-kinetic-diffusion"],
                    "summary": "How thermal energy (temperature) changes the kinetic energy of solvent and solute particles and raises solid solubility.",
                    "cambridgeWatchouts": ["Higher temperature increases particle kinetic energy so more solid solute dissolves in 100 g of water."],
                },
                {
                    "id": "sci8-2.3",
                    "code": "2.3",
                    "title": "Planning a solubility investigation",
                    "learnersBookPage": 53,
                    "workbookPage": 28,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [0],
                    "linkedWidgets": ["investigations"],
                    "bridgeIds": [],
                    "summary": "Controlling variables, measurement resolution, thermometer reading, and plotting continuous line graphs.",
                    "cambridgeWatchouts": ["Independent variable goes on the horizontal x-axis; dependent variable goes on the vertical y-axis."],
                },
                {
                    "id": "sci8-2.4",
                    "code": "2.4",
                    "title": "Paper chromatography",
                    "learnersBookPage": 57,
                    "workbookPage": 33,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [10],
                    "linkedWidgets": ["colourmix"],
                    "bridgeIds": [],
                    "summary": "Separating mixtures of coloured dyes and inks by differential solubility and capillary action.",
                    "cambridgeWatchouts": ["Use a pencil baseline because graphite is insoluble in the solvent."],
                },
            ],
        },
        {
            "id": "sci8-u3",
            "unitNumber": 3,
            "title": "Forces and energy",
            "discipline": "core_physics",
            "scienceStrands": ["Physics: Forces and energy"],
            "twsStrands": [
                "Models and representations",
                "Carrying out scientific enquiry",
                "Scientific enquiry: analysis, evaluation and conclusions",
                "Scientific enquiry: purpose and planning",
            ],
            "scienceInContext": "Evaluate topics using scientific understanding.",
            "learnersBookStartPage": 68,
            "learnersBookEndPage": 125,
            "workbookStartPage": 38,
            "workbookEndPage": 68,
            "isCompletedInSchool": True,
            "movingWorldChapters": [1, 2, 3, 6, 7],
            "bridgeIds": ["bridge-bio-biomechanics-levers", "bridge-bio-boyle-breathing", "bridge-chem-kinetic-diffusion"],
            "topics": [
                {
                    "id": "sci8-3.1",
                    "code": "3.1",
                    "title": "Forces and motion",
                    "learnersBookPage": 68,
                    "workbookPage": 38,
                    "discipline": "core_physics",
                    "movingWorldChapters": [2],
                    "linkedWidgets": ["forces", "vectors", "airfall"],
                    "bridgeIds": [],
                    "summary": "Balanced and unbalanced forces, resultant force (N), and how unbalanced forces cause an object to start moving, speed up, slow down (decelerate), or change direction.",
                    "cambridgeWatchouts": [
                        "Balanced forces (resultant force = 0 N) mean either stationary OR moving at constant speed in a straight line — never assume a moving object must have a net forward force!",
                        "Always draw force arrows starting from the object, with arrow length proportional to force magnitude and labelled with force name + value in newtons (N).",
                    ],
                },
                {
                    "id": "sci8-3.2",
                    "code": "3.2",
                    "title": "Speed",
                    "learnersBookPage": 77,
                    "workbookPage": 42,
                    "discipline": "core_physics",
                    "movingWorldChapters": [1],
                    "linkedWidgets": ["videotrack", "graphwalk"],
                    "bridgeIds": [],
                    "summary": "Calculating average speed and instantaneous speed using speed = distance ÷ time (m/s, km/h), light gates, and rearrangement (distance = speed × time; time = distance ÷ speed).",
                    "cambridgeWatchouts": [
                        "Standard SI unit of speed is m/s (or m s⁻¹). Convert minutes to seconds (× 60) and kilometres to metres (× 1000) before substituting if m/s is required.",
                        "Average speed = total distance ÷ total time (never the simple average of two speeds unless the times spent at each speed are equal!).",
                    ],
                },
                {
                    "id": "sci8-3.3",
                    "code": "3.3",
                    "title": "Describing movement",
                    "learnersBookPage": 84,
                    "workbookPage": 47,
                    "discipline": "core_physics",
                    "movingWorldChapters": [1],
                    "linkedWidgets": ["graphwalk", "videotrack"],
                    "bridgeIds": [],
                    "summary": "Drawing and interpreting distance–time graphs: constant speed (straight sloping line), stationary (flat horizontal line), accelerating (upward curve of increasing gradient), and calculating speed from the gradient (rise ÷ run).",
                    "cambridgeWatchouts": [
                        "A horizontal flat line on a distance–time graph means the object is STATIONARY (speed = 0 m/s), not moving at steady speed.",
                        "A steeper gradient means a higher speed, not walking uphill.",
                    ],
                },
                {
                    "id": "sci8-3.4",
                    "code": "3.4",
                    "title": "Turning forces",
                    "learnersBookPage": 91,
                    "workbookPage": 51,
                    "discipline": "core_physics",
                    "movingWorldChapters": [3],
                    "linkedWidgets": ["mechanicslab", "ramp"],
                    "bridgeIds": ["bridge-bio-biomechanics-levers"],
                    "summary": "The turning effect of a force (moment = force × perpendicular distance from the pivot, in N m or N cm), levers, spanners, wheelbarrows, and the principle of moments for a balanced beam or seesaw (clockwise moment = anticlockwise moment).",
                    "cambridgeWatchouts": [
                        "Distance MUST be measured from the PIVOT (fulcrum) perpendicular to the line of action of the force — never measure the gap between two loads unless one is at the pivot.",
                        "Keep distance units consistent on both sides of F₁ × d₁ = F₂ × d₂, and write the unit of moment as N m or N cm.",
                    ],
                },
                {
                    "id": "sci8-3.5",
                    "code": "3.5",
                    "title": "Pressure between solids",
                    "learnersBookPage": 99,
                    "workbookPage": 55,
                    "discipline": "core_physics",
                    "movingWorldChapters": [6],
                    "linkedWidgets": ["pressuretank", "buoyancy"],
                    "bridgeIds": [],
                    "summary": "Calculating solid contact pressure using pressure = force ÷ area (in N/m² = Pa or N/cm²), explaining why sharp knives/nails/drawing pins have tiny areas to create high pressure while camel feet, snowshoes, and tractor tyres have large areas to create low pressure.",
                    "cambridgeWatchouts": [
                        "When an animal stands on 4 feet (or a person on 2 shoes), remember to multiply the area of one foot by the number of feet touching the ground!",
                        "Always write the full 3-step explanation: smaller area → force concentrated on smaller surface → larger pressure (since P = F ÷ A) → penetrates easily.",
                    ],
                },
                {
                    "id": "sci8-3.6",
                    "code": "3.6",
                    "title": "Pressure in liquids and gases",
                    "learnersBookPage": 106,
                    "workbookPage": 60,
                    "discipline": "core_physics",
                    "movingWorldChapters": [6],
                    "linkedWidgets": ["pressuretank", "buoyancy"],
                    "bridgeIds": ["bridge-bio-boyle-breathing"],
                    "summary": "How particle collisions with container walls cause pressure in liquids and gases; why liquid pressure increases with depth (dam walls thicker at the base, spouting can); how atmospheric pressure changes with altitude; and how temperature, volume, and number of particles change gas pressure.",
                    "cambridgeWatchouts": [
                        "In every gas pressure answer, state explicitly: 'particles collide with the WALLS of the container' (marks are lost if you only say particles collide with each other!).",
                        "When a gas is compressed into a smaller volume or heated, particles collide with the container walls MORE FREQUENTLY (and harder when heated), increasing total force per unit area.",
                    ],
                },
                {
                    "id": "sci8-3.7",
                    "code": "3.7",
                    "title": "Particles on the move",
                    "learnersBookPage": 114,
                    "workbookPage": 64,
                    "discipline": "core_physics",
                    "movingWorldChapters": [7, 8],
                    "linkedWidgets": ["pressuretank", "expansion"],
                    "bridgeIds": ["bridge-chem-kinetic-diffusion"],
                    "summary": "Diffusion in gases and liquids explained by the particle model: random thermal movement of particles leading to net movement from a region of higher concentration to a region of lower concentration, and why diffusion is faster in gases than liquids and faster at higher temperatures.",
                    "cambridgeWatchouts": [
                        "Individual particles move randomly in ALL directions; only the overall (net) movement is from high concentration to low concentration.",
                        "Diffusion does not stop when concentration is uniform — particles keep moving randomly, with equal numbers crossing in both directions (dynamic equilibrium).",
                    ],
                },
            ],
        },
        {
            "id": "sci8-u4",
            "unitNumber": 4,
            "title": "Ecosystems",
            "discipline": "sibling_science",
            "scienceStrands": ["Biology: Ecosystems"],
            "twsStrands": ["Carrying out scientific enquiry"],
            "scienceInContext": "Discuss the impact science can have on the environment world-wide.",
            "learnersBookStartPage": 126,
            "learnersBookEndPage": 151,
            "workbookStartPage": 69,
            "workbookEndPage": 87,
            "isCompletedInSchool": True,
            "movingWorldChapters": [5, 8],
            "bridgeIds": [],
            "topics": [
                {
                    "id": "sci8-4.1",
                    "code": "4.1",
                    "title": "The Sonoran Desert",
                    "learnersBookPage": 126,
                    "workbookPage": 69,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [8],
                    "linkedWidgets": ["conduction"],
                    "bridgeIds": [],
                    "summary": "Desert ecosystems, solar radiation, diurnal temperature swings, and organism adaptations.",
                    "cambridgeWatchouts": ["Arrows in food chains show the direction of energy transfer."],
                },
                {
                    "id": "sci8-4.2",
                    "code": "4.2",
                    "title": "Different ecosystems",
                    "learnersBookPage": 133,
                    "workbookPage": 72,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [8],
                    "linkedWidgets": ["conduction"],
                    "bridgeIds": [],
                    "summary": "Mangrove forests, Arctic sea-ice habitats, and rice paddies.",
                    "cambridgeWatchouts": ["Distinguish habitat (place) from ecosystem (community + abiotic environment)."],
                },
                {
                    "id": "sci8-4.3",
                    "code": "4.3",
                    "title": "Intruders in an ecosystem",
                    "learnersBookPage": 139,
                    "workbookPage": 76,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [5],
                    "linkedWidgets": ["energystores"],
                    "bridgeIds": [],
                    "summary": "Invasive species (buffelgrass, cane toads) and resource competition.",
                    "cambridgeWatchouts": ["Invasive species lack natural predators in the new habitat and outcompete native species."],
                },
                {
                    "id": "sci8-4.4",
                    "code": "4.4",
                    "title": "Bioaccumulation",
                    "learnersBookPage": 142,
                    "workbookPage": 82,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [5],
                    "linkedWidgets": ["energystores"],
                    "bridgeIds": [],
                    "summary": "Bioaccumulation and biomagnification of persistent toxins (DDT, mercury, microplastics) up trophic pyramids.",
                    "cambridgeWatchouts": ["90% of energy is lost as thermal energy at each trophic step, while persistent toxins are retained."],
                },
            ],
        },
        {
            "id": "sci8-u5",
            "unitNumber": 5,
            "title": "Materials and cycles on Earth",
            "discipline": "physics_bridge",
            "scienceStrands": [
                "Chemistry: Materials and their structure",
                "Chemistry: Changes to materials",
                "Earth and Space: Planet Earth",
                "Earth and Space: Cycles on Earth",
            ],
            "twsStrands": [
                "Carrying out scientific enquiry",
                "Scientific enquiry: purpose and planning",
                "Models and representations",
                "Scientific enquiry: analysis, evaluation and conclusions",
            ],
            "scienceInContext": "Discuss how scientific understanding is used and developed by people working on their own and working together, such as the peer-review process.",
            "learnersBookStartPage": 152,
            "learnersBookEndPage": 189,
            "workbookStartPage": 88,
            "workbookEndPage": 110,
            "isCompletedInSchool": False,
            "movingWorldChapters": [7, 8, 12, 14],
            "bridgeIds": ["bridge-chem-rutherford-atom", "bridge-chem-climate-albedo"],
            "topics": [
                {
                    "id": "sci8-5.1",
                    "code": "5.1",
                    "title": "The structure of the atom",
                    "learnersBookPage": 152,
                    "workbookPage": 88,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [7, 12],
                    "linkedWidgets": ["circuit"],
                    "bridgeIds": ["bridge-chem-rutherford-atom"],
                    "summary": "Protons (+1), neutrons (0), and electrons (-1), electrostatic attraction between nucleus and electron shells, and Rutherford's gold-foil alpha-scattering discovery.",
                    "cambridgeWatchouts": [
                        "Protons (+1) and neutrons (0) sit in the tiny central nucleus; negatively charged electrons (-1) move in empty space around the nucleus.",
                        "Electrostatic attraction between opposite charges holds the negative electrons to the positive nucleus.",
                    ],
                },
                {
                    "id": "sci8-5.2",
                    "code": "5.2",
                    "title": "Purity",
                    "learnersBookPage": 157,
                    "workbookPage": 91,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [7],
                    "linkedWidgets": ["expansion"],
                    "bridgeIds": [],
                    "summary": "Pure elements and compounds vs alloys (24-carat vs 18-carat gold), percentage purity, and sharp vs depressed melting/boiling points.",
                    "cambridgeWatchouts": ["Impurities lower the melting point and raise the boiling point of water, spreading phase change over a range."],
                },
                {
                    "id": "sci8-5.3",
                    "code": "5.3",
                    "title": "Weather and climate",
                    "learnersBookPage": 165,
                    "workbookPage": 97,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [8, 14],
                    "linkedWidgets": ["conduction", "seasons"],
                    "bridgeIds": ["bridge-chem-climate-albedo"],
                    "summary": "Solar heating, atmospheric convection currents, humidity, monsoon winds (Ch 8), and weather vs long-term climate zones.",
                    "cambridgeWatchouts": ["Weather is the state of the atmosphere over hours/days; climate is the 30-year statistical average."],
                },
                {
                    "id": "sci8-5.4",
                    "code": "5.4",
                    "title": "Climate and ice ages",
                    "learnersBookPage": 171,
                    "workbookPage": 103,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [8, 14],
                    "linkedWidgets": ["seasons"],
                    "bridgeIds": ["bridge-chem-climate-albedo"],
                    "summary": "Glacial and interglacial cycles over hundreds of thousands of years, orbital insolation, ice-core bubbles, and glacial erratics.",
                    "cambridgeWatchouts": ["Earth is currently in an interglacial period within a longer ice age that began ~2.5 million years ago."],
                },
                {
                    "id": "sci8-5.5",
                    "code": "5.5",
                    "title": "Atmosphere and climate",
                    "learnersBookPage": 177,
                    "workbookPage": 106,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [8, 11],
                    "linkedWidgets": ["conduction", "skycolour"],
                    "bridgeIds": ["bridge-chem-climate-albedo"],
                    "summary": "Evolution of Earth's atmosphere, greenhouse gases trapping outgoing thermal infrared radiation (Ch 8 & Ch 11), and renewable vs fossil energy resources.",
                    "cambridgeWatchouts": ["Greenhouse gases transmit incoming visible sunlight but absorb and re-emit outgoing thermal infrared radiation."],
                },
            ],
        },
        {
            "id": "sci8-u6",
            "unitNumber": 6,
            "title": "Light",
            "discipline": "core_physics",
            "scienceStrands": ["Physics: Light and sound", "Earth and Space: Earth in space"],
            "twsStrands": [
                "Scientific enquiry: purpose and planning",
                "Carrying out scientific enquiry",
                "Scientific enquiry: analysis, evaluation and conclusions",
                "Models and representations",
            ],
            "scienceInContext": "Evaluate topics using scientific understanding.",
            "learnersBookStartPage": 190,
            "learnersBookEndPage": 232,
            "workbookStartPage": 111,
            "workbookEndPage": 133,
            "isCompletedInSchool": True,
            "movingWorldChapters": [10, 11, 14, 15],
            "bridgeIds": ["bridge-bio-eye-optics"],
            "topics": [
                {
                    "id": "sci8-6.1",
                    "code": "6.1",
                    "title": "Reflection",
                    "learnersBookPage": 190,
                    "workbookPage": 111,
                    "discipline": "core_physics",
                    "movingWorldChapters": [10],
                    "linkedWidgets": ["mirror"],
                    "bridgeIds": [],
                    "summary": "Plane mirrors, drawing accurate ray diagrams with a ruler and protractor, the normal (90° dashed line to the mirror), and the Law of Reflection (angle of incidence i = angle of reflection r).",
                    "cambridgeWatchouts": [
                        "ALWAYS measure the angle of incidence i and angle of reflection r between the ray and the NORMAL (dashed line at 90° to the mirror), NEVER between the ray and the mirror surface!",
                        "If a question gives the angle between the incident ray and the mirror as 30°, subtract from 90° first: i = 90° − 30° = 60°, so r = 60°.",
                        "Every light ray must have a straight ruler line AND a directional arrowhead showing the path from light source to observer's eye.",
                    ],
                },
                {
                    "id": "sci8-6.2",
                    "code": "6.2",
                    "title": "Refraction",
                    "learnersBookPage": 197,
                    "workbookPage": 115,
                    "discipline": "core_physics",
                    "movingWorldChapters": [10],
                    "linkedWidgets": ["refraction", "eye3d"],
                    "bridgeIds": ["bridge-bio-eye-optics"],
                    "summary": "Refraction of light crossing boundaries between transparent media (air, water, glass) caused by a change in wave speed: slowing down bends the ray toward the normal; speeding up bends the ray away from the normal.",
                    "cambridgeWatchouts": [
                        "Memorise the boundary rule: Air → Glass or Air → Water (light slows down) ⇒ ray bends TOWARD the normal (r < i). Glass/Water → Air (light speeds up) ⇒ ray bends AWAY from the normal (r > i).",
                        "If a ray hits the boundary along the normal (i = 0°), it slows down or speeds up but does NOT change direction (r = 0°).",
                    ],
                },
                {
                    "id": "sci8-6.3",
                    "code": "6.3",
                    "title": "Making rainbows",
                    "learnersBookPage": 204,
                    "workbookPage": 118,
                    "discipline": "core_physics",
                    "movingWorldChapters": [10, 11],
                    "linkedWidgets": ["refraction", "colourmix"],
                    "bridgeIds": [],
                    "summary": "Dispersion of white light by a triangular glass prism or raindrops into the continuous visible spectrum (Red, Orange, Yellow, Green, Blue, Indigo, Violet) because each colour changes speed by a slightly different amount in glass.",
                    "cambridgeWatchouts": [
                        "Red light slows down the least in glass and is refracted (bent) through the SMALLEST angle (stays at the top of the spectrum); Violet light slows down the most and is refracted through the LARGEST angle.",
                        "Remember the exact order: Red, Orange, Yellow, Green, Blue, Indigo, Violet (ROYGBIV).",
                    ],
                },
                {
                    "id": "sci8-6.4",
                    "code": "6.4",
                    "title": "Colours of light",
                    "learnersBookPage": 209,
                    "workbookPage": 122,
                    "discipline": "core_physics",
                    "movingWorldChapters": [10],
                    "linkedWidgets": ["colourmix", "eye3d"],
                    "bridgeIds": ["bridge-bio-eye-optics"],
                    "summary": "Addition of the three primary colours of light (Red, Green, Blue → White; R+G = Yellow, R+B = Magenta, G+B = Cyan), subtraction by coloured filters (transmit their own colour, absorb others), and why coloured objects appear the colour they reflect (or black if no matching wavelength is available to reflect).",
                    "cambridgeWatchouts": [
                        "Do NOT confuse paint pigments with light! The primary colours of LIGHT are Red, Green, and Blue (RGB). Adding Red + Green light gives YELLOW light.",
                        "A blue object in pure red light appears BLACK because the blue surface absorbs red light and has no blue light to reflect.",
                    ],
                },
                {
                    "id": "sci8-6.5",
                    "code": "6.5",
                    "title": "Galaxies",
                    "learnersBookPage": 217,
                    "workbookPage": 125,
                    "discipline": "core_physics",
                    "movingWorldChapters": [15],
                    "linkedWidgets": ["parallax"],
                    "bridgeIds": [],
                    "summary": "The Milky Way and billions of other galaxies in the universe, classified by shape into spiral, elliptical, and irregular galaxies, composed of stars, planetary systems, and stellar dust/gas clouds held together by gravity.",
                    "cambridgeWatchouts": [
                        "State that galaxies are vast collections of stars, gas, and dust held together by GRAVITY.",
                        "Our Solar System is inside a spiral galaxy called the Milky Way; the hazy band across the night sky is our edge-on view through the galactic disc.",
                    ],
                },
                {
                    "id": "sci8-6.6",
                    "code": "6.6",
                    "title": "Rocks in space",
                    "learnersBookPage": 222,
                    "workbookPage": 129,
                    "discipline": "core_physics",
                    "movingWorldChapters": [4, 14, 15],
                    "linkedWidgets": ["cannon3d", "parallax"],
                    "bridgeIds": [],
                    "summary": "Asteroids (rocky/metallic bodies smaller than planets orbiting the Sun, mostly in the asteroid belt between Mars and Jupiter), Ceres, why asteroids are too small for gravity to pull them into spheres, and asteroid impacts on Earth and the Moon.",
                    "cambridgeWatchouts": [
                        "Most asteroids orbit the Sun in the asteroid belt located between the orbits of MARS and JUPITER.",
                        "Asteroids have irregular, lumpy shapes because their mass (and therefore their gravity) is too small to pull their rock into a sphere.",
                    ],
                },
            ],
        },
        {
            "id": "sci8-u7",
            "unitNumber": 7,
            "title": "Diet and growth",
            "discipline": "physics_bridge",
            "scienceStrands": ["Biology: Structure and function", "Biology: Life processes"],
            "twsStrands": [
                "Scientific enquiry: purpose and planning",
                "Carrying out scientific enquiry",
            ],
            "scienceInContext": "Evaluate topics using scientific understanding.",
            "learnersBookStartPage": 233,
            "learnersBookEndPage": 262,
            "workbookStartPage": 134,
            "workbookEndPage": 158,
            "isCompletedInSchool": False,
            "movingWorldChapters": [3, 5],
            "bridgeIds": ["bridge-bio-biomechanics-levers"],
            "topics": [
                {
                    "id": "sci8-7.1",
                    "code": "7.1",
                    "title": "Nutrients",
                    "learnersBookPage": 233,
                    "workbookPage": 134,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [5],
                    "linkedWidgets": ["energystores"],
                    "bridgeIds": [],
                    "summary": "Carbohydrates, fats, proteins, vitamins, minerals, fibre, and water.",
                    "cambridgeWatchouts": ["Carbohydrates and fats are the body's primary chemical energy stores."],
                },
                {
                    "id": "sci8-7.2",
                    "code": "7.2",
                    "title": "A balanced diet",
                    "learnersBookPage": 241,
                    "workbookPage": 138,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [5],
                    "linkedWidgets": ["energystores"],
                    "bridgeIds": [],
                    "summary": "Daily energy intake vs expenditure measured in kilojoules (kJ) and megajoules (1 MJ = 1,000 kJ = 10⁶ J) and power output during exercise.",
                    "cambridgeWatchouts": ["Energy conservation: if chemical energy intake in food > energy transferred by respiration & work, excess is stored as fat."],
                },
                {
                    "id": "sci8-7.3",
                    "code": "7.3",
                    "title": "Growth, development and health",
                    "learnersBookPage": 248,
                    "workbookPage": 144,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [6],
                    "linkedWidgets": ["pressuretank"],
                    "bridgeIds": [],
                    "summary": "Cell division, growth, and how nicotine narrows arteries to increase blood pressure.",
                    "cambridgeWatchouts": ["Nicotine constricts blood vessels, increasing resistance and blood pressure."],
                },
                {
                    "id": "sci8-7.4",
                    "code": "7.4",
                    "title": "Moving the body",
                    "learnersBookPage": 252,
                    "workbookPage": 153,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [2, 3],
                    "linkedWidgets": ["mechanicslab", "forces"],
                    "bridgeIds": ["bridge-bio-biomechanics-levers"],
                    "summary": "Hinge and ball-and-socket joints as pivots (fulcrums), bones as rigid levers, synovial fluid reducing friction, and antagonistic biceps/triceps pairs applying opposite moments.",
                    "cambridgeWatchouts": [
                        "Muscles can only pull when they contract; they cannot push, so an antagonistic pair is required to create clockwise and anticlockwise moments about the joint.",
                    ],
                },
            ],
        },
        {
            "id": "sci8-u8",
            "unitNumber": 8,
            "title": "Chemical reactions",
            "discipline": "physics_bridge",
            "scienceStrands": ["Chemistry: Changes to materials"],
            "twsStrands": [
                "Scientific enquiry: purpose and planning",
                "Carrying out scientific enquiry",
                "Scientific enquiry: analysis, evaluation and conclusions",
            ],
            "scienceInContext": "Describe how science is used in different societies and industries.",
            "learnersBookStartPage": 263,
            "learnersBookEndPage": 292,
            "workbookStartPage": 159,
            "workbookEndPage": 183,
            "isCompletedInSchool": False,
            "movingWorldChapters": [5, 8],
            "bridgeIds": ["bridge-chem-energetics-enthalpy"],
            "topics": [
                {
                    "id": "sci8-8.1",
                    "code": "8.1",
                    "title": "Exothermic reactions",
                    "learnersBookPage": 263,
                    "workbookPage": 159,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [5, 8],
                    "linkedWidgets": ["energystores", "conduction"],
                    "bridgeIds": ["bridge-chem-energetics-enthalpy"],
                    "summary": "Chemical potential energy transferring to thermal energy of the surroundings (burning magnesium, hand warmers, fuel combustion), measured by thermometer rise ΔT.",
                    "cambridgeWatchouts": ["In an exothermic reaction, thermal energy is transferred TO the surroundings so the temperature of the reaction mixture rises."],
                },
                {
                    "id": "sci8-8.2",
                    "code": "8.2",
                    "title": "Endothermic reactions",
                    "learnersBookPage": 269,
                    "workbookPage": 166,
                    "discipline": "physics_bridge",
                    "movingWorldChapters": [5, 7, 8],
                    "linkedWidgets": ["energystores", "expansion"],
                    "bridgeIds": ["bridge-chem-energetics-enthalpy"],
                    "summary": "Reactions and physical phase changes (melting ice, evaporating sweat, instant cold packs, sherbet) that absorb thermal energy FROM the surroundings so temperature falls.",
                    "cambridgeWatchouts": ["Melting and evaporation are endothermic physical processes because energy must be supplied to pull particles apart against attractive forces."],
                },
                {
                    "id": "sci8-8.3",
                    "code": "8.3",
                    "title": "Reactions of metals with oxygen",
                    "learnersBookPage": 276,
                    "workbookPage": 169,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [13],
                    "linkedWidgets": ["field3d"],
                    "bridgeIds": [],
                    "summary": "Oxidation of metals (magnesium, iron, copper, gold) and preventing iron/steel rusting.",
                    "cambridgeWatchouts": ["Iron requires BOTH oxygen and water to rust (form hydrated iron(III) oxide)."],
                },
                {
                    "id": "sci8-8.4",
                    "code": "8.4",
                    "title": "Reactions of metals with water",
                    "learnersBookPage": 282,
                    "workbookPage": 172,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [5],
                    "linkedWidgets": ["energystores"],
                    "bridgeIds": [],
                    "summary": "Reactivity of Group 1 and Group 2 metals with cold water or steam to produce metal hydroxide and hydrogen gas.",
                    "cambridgeWatchouts": ["Hydrogen gas test: a lit splint produces a squeaky pop."],
                },
                {
                    "id": "sci8-8.5",
                    "code": "8.5",
                    "title": "Reactions of metals with dilute acids",
                    "learnersBookPage": 286,
                    "workbookPage": 175,
                    "discipline": "sibling_science",
                    "movingWorldChapters": [5],
                    "linkedWidgets": ["energystores"],
                    "bridgeIds": [],
                    "summary": "Metal + dilute acid → salt + hydrogen gas.",
                    "cambridgeWatchouts": ["Hydrochloric acid forms chloride salts; sulfuric acid forms sulfate salts; nitric acid forms nitrate salts."],
                },
            ],
        },
        {
            "id": "sci8-u9",
            "unitNumber": 9,
            "title": "Magnetism",
            "discipline": "core_physics",
            "scienceStrands": ["Physics: Electricity and magnetism", "Earth and Space: Planet Earth"],
            "twsStrands": [
                "Scientific enquiry: purpose and planning",
                "Scientific enquiry: analysis, evaluation and conclusions",
                "Models and representations",
                "Carrying out scientific enquiry",
            ],
            "scienceInContext": "Discuss how scientific knowledge develops over time by shared understanding and investigation. Evaluate topics using scientific understanding.",
            "learnersBookStartPage": 293,
            "learnersBookEndPage": 320,
            "workbookStartPage": 184,
            "workbookEndPage": 202,
            "isCompletedInSchool": False,
            "movingWorldChapters": [12, 13, 14],
            "bridgeIds": ["bridge-bio-nerve-magnetoreception"],
            "topics": [
                {
                    "id": "sci8-9.1",
                    "code": "9.1",
                    "title": "Magnetic fields",
                    "learnersBookPage": 293,
                    "workbookPage": 184,
                    "discipline": "core_physics",
                    "movingWorldChapters": [13],
                    "linkedWidgets": ["field3d", "magnetometer", "fieldslab"],
                    "bridgeIds": [],
                    "summary": "Magnetic materials (iron, steel, nickel, cobalt), magnetic field lines around a bar magnet and between interacting poles (like poles repel with a neutral point; unlike poles attract), and plotting field lines with a small compass or iron filings.",
                    "cambridgeWatchouts": [
                        "Magnetic field lines ALWAYS have arrows pointing AWAY from the North pole and TOWARD the South pole (N → S outside the magnet).",
                        "Field lines NEVER touch or cross each other, and closer field lines indicate a stronger magnetic field (strongest at the poles).",
                    ],
                },
                {
                    "id": "sci8-9.2",
                    "code": "9.2",
                    "title": "The Earth as a giant magnet",
                    "learnersBookPage": 300,
                    "workbookPage": 187,
                    "discipline": "core_physics",
                    "movingWorldChapters": [13, 14],
                    "linkedWidgets": ["field3d", "magnetometer"],
                    "bridgeIds": ["bridge-bio-nerve-magnetoreception"],
                    "summary": "Earth's dipolar magnetic field generated by convection currents of molten iron and nickel in the outer core, why a freely suspended compass needle points toward Geographic North (which is near a magnetic south pole!), and how Earth's magnetosphere shields life from solar wind.",
                    "cambridgeWatchouts": [
                        "Because the north pole of a compass needle is attracted to Earth's Geographic North Pole, Earth's Geographic North Pole must actually contain a MAGNETIC SOUTH POLE (since unlike poles attract)!",
                        "Earth's magnetic field is generated by moving liquid iron and nickel in the outer core, not a solid bar magnet.",
                    ],
                },
                {
                    "id": "sci8-9.3",
                    "code": "9.3",
                    "title": "Electromagnets",
                    "learnersBookPage": 306,
                    "workbookPage": 193,
                    "discipline": "core_physics",
                    "movingWorldChapters": [12, 13],
                    "linkedWidgets": ["fieldslab", "induction", "circuit"],
                    "bridgeIds": [],
                    "summary": "How an electric current flowing through a coil of wire (solenoid) creates a magnetic field that can be switched on and off; why a soft iron core makes a strong temporary electromagnet (scrapyard crane, electric bell, relay, MRI); and how an electromagnet differs from a permanent magnet.",
                    "cambridgeWatchouts": [
                        "Always specify a SOFT IRON core (not steel): iron is easily magnetised when current flows and loses its magnetism immediately when the current is switched off, whereas steel stays permanently magnetised.",
                        "Key advantage of an electromagnet over a permanent magnet: its magnetic field can be switched ON and OFF (and its strength can be varied).",
                    ],
                },
                {
                    "id": "sci8-9.4",
                    "code": "9.4",
                    "title": "Investigating electromagnets",
                    "learnersBookPage": 311,
                    "workbookPage": 197,
                    "discipline": "core_physics",
                    "movingWorldChapters": [0, 12, 13],
                    "linkedWidgets": ["fieldslab", "investigations"],
                    "bridgeIds": [],
                    "summary": "Planning and analysing controlled investigations of the three factors that increase electromagnet strength: (1) more turns on the coil, (2) larger electric current (measured with an ammeter, not just 'more cells' since cells can run flat), and (3) inserting a soft iron core; identifying anomalous results and repeating trials.",
                    "cambridgeWatchouts": [
                        "When asked how to measure the current accurately in an electromagnet investigation, state: 'connect an AMMETER in series with the coil' (rather than just counting battery cells).",
                        "If one paperclip count is an anomalous result (far off the trend), exclude it when calculating the mean and repeat that reading!",
                    ],
                },
            ],
        },
    ]
    return {
        "id": "cambridge-science-8-2ed",
        "title": "Cambridge Lower Secondary Science 8 (Second Edition)",
        "authors": "Mary Jones, Diane Fellowes-Freeman & Michael Smyth",
        "publisher": "Cambridge University Press",
        "curriculumCode": "0893",
        "learnersBookTotalPages": 326,
        "workbookTotalPages": 202,
        "units": units,
    }


def build_school_questions():
    """
    Pre-seeded Learner's Book (Topic Questions, Think like a scientist, Check your progress)
    and Workbook (Focus, Practice, Challenge) question bank for Units 3, 6, 9 + Physics Bridges:
    - Worked Example (full step-by-step model reasoning)
    - Faded Completion (scaffolded blank to complete)
    - Independent Proof question + key mark-scheme points
    """
    return [
        # UNIT 3: FORCES AND ENERGY (3.1 - 3.7)
        {
            "id": "q-u3-3.1-lb",
            "unitNumber": 3,
            "topicCode": "3.1",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.1 Forces and motion (pp. 68–76) & WB 3.1 (p. 38)",
            "tier": "Practice",
            "commandWord": "Calculate and explain",
            "marks": 3,
            "prompt": "A cyclist is pedalling along a flat road at a steady speed of 8 m/s. Her forward driving force is 140 N and the backward air resistance + friction is 140 N. (a) State the resultant force on the cyclist. (b) She then increases her forward driving force to 195 N while resistive forces stay at 140 N. Calculate the new resultant force and state how her motion changes.",
            "workedExample": "(a) At steady speed in a straight line, the forward force (140 N) balances the backward resistive force (140 N), so resultant force = 140 N − 140 N = 0 N.\n(b) New resultant force = 195 N − 140 N = 55 N forward. Because there is now an unbalanced forward resultant force, the cyclist accelerates (speeds up) in the forward direction.",
            "fadedPrompt": "(a) Resultant force at steady speed = 140 N − 140 N = ________ N. (b) When driving force rises to 195 N, resultant force = 195 − 140 = ________ N forward, so the cyclist ________.",
            "fadedAnswer": "0; 55; accelerates / speeds up",
            "modelAnswer": "(a) 0 N (forces are balanced). (b) Resultant force = 195 − 140 = 55 N forward; the unbalanced forward force causes the cyclist to accelerate (speed up).",
            "markSchemeKeywords": ["0 N", "balanced", "55", "forward", "accelerate", "speed up"],
            "linkedChapter": 2,
            "linkedWidget": "forces",
        },
        {
            "id": "q-u3-3.2-wb",
            "unitNumber": 3,
            "topicCode": "3.2",
            "sourceBook": "workbook",
            "bookSection": "Workbook 3.2 Speed — Challenge (pp. 42–46)",
            "tier": "Challenge",
            "commandWord": "Calculate",
            "marks": 4,
            "prompt": "An express train travels 3.6 km along a straight track in 2.0 minutes. (a) Convert the distance to metres and the time to seconds. (b) Calculate the average speed of the train in m/s. (c) How far would the train travel in 45 s at this same speed?",
            "workedExample": "(a) Distance d = 3.6 km × 1000 m/km = 3600 m. Time t = 2.0 min × 60 s/min = 120 s.\n(b) Average speed = distance ÷ time = 3600 m ÷ 120 s = 30 m/s.\n(c) Distance = speed × time = 30 m/s × 45 s = 1350 m (or 1.35 km).",
            "fadedPrompt": "(a) d = 3600 m, t = ________ s. (b) speed = 3600 ÷ 120 = ________ m/s. (c) distance in 45 s = 30 × 45 = ________ m.",
            "fadedAnswer": "120; 30; 1350",
            "modelAnswer": "(a) 3600 m and 120 s. (b) Speed = 3600 ÷ 120 = 30 m/s. (c) Distance = 30 × 45 = 1350 m.",
            "markSchemeKeywords": ["3600", "120", "30 m/s", "1350"],
            "linkedChapter": 1,
            "linkedWidget": "videotrack",
        },
        {
            "id": "q-u3-3.3-lb",
            "unitNumber": 3,
            "topicCode": "3.3",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.3 Describing movement (pp. 84–90) & WB 3.3 (p. 47)",
            "tier": "Practice",
            "commandWord": "Describe and calculate",
            "marks": 4,
            "prompt": "On a distance–time graph for Kym's walk to the bookshop: from t = 0 s to t = 50 s the line rises straight from 0 m to 75 m; from t = 50 s to t = 80 s the line is horizontal at 75 m; from t = 80 s to t = 105 s the line rises straight from 75 m to 150 m. Calculate her speed in the first 50 s, state what happens between 50 s and 80 s, and state which stage had the highest speed with a reason from the graph.",
            "workedExample": "1. Speed in Stage 1 (0–50 s) = distance ÷ time = 75 m ÷ 50 s = 1.5 m/s.\n2. Between 50 s and 80 s the line is horizontal (distance stays at 75 m), so she is stationary (stopped, speed = 0 m/s).\n3. Stage 3 (80–105 s) covers 150 − 75 = 75 m in 105 − 80 = 25 s, so speed = 75 ÷ 25 = 3.0 m/s. On the graph, Stage 3 has the steepest gradient (slope).",
            "fadedPrompt": "Stage 1 speed = 75 ÷ 50 = ________ m/s. Between 50 s and 80 s the horizontal line means she is ________. Stage 3 has the highest speed (3.0 m/s) because the line has the steepest ________.",
            "fadedAnswer": "1.5; stationary / stopped; gradient / slope",
            "modelAnswer": "Stage 1 speed = 75 ÷ 50 = 1.5 m/s. From 50 s to 80 s she is stationary (speed = 0 m/s). Stage 3 (80–105 s) is fastest (3.0 m/s) because the line has the steepest gradient.",
            "markSchemeKeywords": ["1.5", "stationary", "stopped", "3.0", "steepest", "gradient", "slope"],
            "linkedChapter": 1,
            "linkedWidget": "graphwalk",
        },
        {
            "id": "q-u3-3.4-wb",
            "unitNumber": 3,
            "topicCode": "3.4",
            "sourceBook": "workbook",
            "bookSection": "Workbook 3.4 Turning forces & Principle of Moments (pp. 51–54)",
            "tier": "Challenge",
            "commandWord": "Calculate and explain",
            "marks": 4,
            "prompt": "A uniform beam is balanced on a central pivot. Marcus places a 40 N weight at a distance of 0.60 m to the left of the pivot. (a) Calculate the anticlockwise moment about the pivot. (b) Arun wants to balance the beam by placing a 30 N weight to the right of the pivot. At what distance from the pivot must Arun place the 30 N weight?",
            "workedExample": "(a) Moment = force × perpendicular distance from pivot = 40 N × 0.60 m = 24 N m (anticlockwise).\n(b) By the principle of moments, for the beam to balance: clockwise moment = anticlockwise moment = 24 N m.\n30 N × d = 24 N m ⇒ d = 24 ÷ 30 = 0.80 m (or 80 cm) to the right of the pivot.",
            "fadedPrompt": "(a) Anticlockwise moment = 40 N × 0.60 m = ________ N m. (b) For balance, clockwise moment = 30 N × d = 24 N m, so d = 24 ÷ 30 = ________ m.",
            "fadedAnswer": "24; 0.80",
            "modelAnswer": "(a) Moment = 40 × 0.60 = 24 N m. (b) For equilibrium, clockwise moment = anticlockwise moment, so 30 × d = 24 ⇒ d = 0.80 m (80 cm) from the pivot.",
            "markSchemeKeywords": ["24", "N m", "0.8", "80 cm", "clockwise", "anticlockwise", "pivot"],
            "linkedChapter": 3,
            "linkedWidget": "mechanicslab",
        },
        {
            "id": "q-u3-3.5-lb",
            "unitNumber": 3,
            "topicCode": "3.5",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.5 Pressure between solids (pp. 99–105) & WB 3.5 (p. 55)",
            "tier": "Challenge",
            "commandWord": "Calculate and explain",
            "marks": 4,
            "prompt": "A camel in the Sonoran Desert has a weight of 6000 N and stands on all four feet. Each footpad has a surface area of 300 cm². (a) Calculate the total area of all four feet and the pressure the camel exerts on the sand in N/cm². (b) Explain why a horse of the same weight (6000 N) whose four hooves have a total area of 400 cm² sinks much deeper into soft sand than the camel.",
            "workedExample": "(a) Total area of 4 feet = 4 × 300 cm² = 1200 cm².\nPressure = force ÷ total area = 6000 N ÷ 1200 cm² = 5 N/cm².\n(b) For the horse, pressure = 6000 N ÷ 400 cm² = 15 N/cm² (three times higher!). Because the horse's weight acts over a smaller contact area, it exerts a much larger pressure on the sand, so its hooves sink deeper.",
            "fadedPrompt": "(a) Total area of 4 feet = 4 × 300 = ________ cm², so camel pressure = 6000 ÷ 1200 = ________ N/cm². (b) The horse has a smaller contact ________ (400 cm²), so for the same weight it exerts a larger ________ (15 N/cm²) and sinks.",
            "fadedAnswer": "1200; 5; area; pressure",
            "modelAnswer": "(a) Total area = 4 × 300 = 1200 cm²; pressure = 6000 ÷ 1200 = 5 N/cm². (b) The horse's hooves have a much smaller total surface area (400 cm²), so the same 6000 N force is concentrated over a smaller area, producing a larger pressure (15 N/cm²) that pushes deeper into the sand.",
            "markSchemeKeywords": ["1200", "5 N/cm²", "smaller area", "larger pressure", "15"],
            "linkedChapter": 6,
            "linkedWidget": "pressuretank",
        },
        {
            "id": "q-u3-3.6-wb",
            "unitNumber": 3,
            "topicCode": "3.6",
            "sourceBook": "workbook",
            "bookSection": "Workbook 3.6 Pressure in liquids and gases (pp. 60–63)",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "A sealed rigid metal cylinder contains air at room temperature. (a) Use the particle model to explain how the air creates pressure on the inside of the cylinder. (b) Explain why the pressure inside the sealed cylinder increases when the cylinder is heated.",
            "workedExample": "(a) Gas particles move rapidly and randomly in all directions. As they collide with the inside WALLS of the cylinder, each collision exerts a tiny outward force; the total force of billions of collisions per unit area is the gas pressure.\n(b) When the cylinder is heated, thermal energy transfers to the gas particles so they gain kinetic energy and move faster. Faster particles collide with the container walls MORE FREQUENTLY and with GREATER FORCE per collision, increasing the pressure.",
            "fadedPrompt": "(a) Gas particles move randomly and collide with the ________ of the container, exerting force per unit area. (b) Heating gives particles more kinetic energy so they move ________ and collide with the walls more ________ and harder.",
            "fadedAnswer": "walls; faster; frequently / often",
            "modelAnswer": "(a) Gas particles move randomly and collide with the walls of the cylinder, exerting a force on the area of the walls. (b) When heated, the gas particles gain kinetic energy and move faster, so they collide with the container walls more frequently and with greater force, increasing the pressure.",
            "markSchemeKeywords": ["collide", "walls", "faster", "kinetic energy", "more frequently", "greater force"],
            "linkedChapter": 6,
            "linkedWidget": "pressuretank",
        },
        {
            "id": "q-u3-3.7-cyp",
            "unitNumber": 3,
            "topicCode": "3.7",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.7 Particles on the move & Unit 3 Check your progress (pp. 114–125)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "A teacher takes the lid off a bottle of perfume at the front of a quiet classroom with no draughts. Explain using the particle model (a) how the perfume smell reaches students at the back of the room, and (b) why diffusion in air is much slower than the actual speed (~400 m/s) of individual perfume molecules.",
            "workedExample": "(a) Liquid perfume evaporates into gas particles at high concentration near the bottle. The perfume particles move randomly in all directions, diffusing down the concentration gradient from high concentration (front of room) to low concentration (back of room).\n(b) Although each gas molecule moves fast between collisions, it constantly collides with billions of nitrogen and oxygen molecules in the air, changing direction randomly at every collision instead of travelling in a straight line.",
            "fadedPrompt": "Perfume particles move ________ and spread by ________ from higher concentration to lower concentration. Diffusion takes minutes because perfume particles constantly ________ with air particles and change direction.",
            "fadedAnswer": "randomly; diffusion; collide",
            "modelAnswer": "(a) Perfume particles evaporate and move randomly, diffusing from high concentration near the bottle to lower concentration at the back of the room. (b) Perfume particles repeatedly collide with air particles and bounce in random directions rather than travelling straight across the room.",
            "markSchemeKeywords": ["random", "diffusion", "high concentration", "low concentration", "collide", "air particles"],
            "linkedChapter": 7,
            "linkedWidget": "pressuretank",
        },

        # UNIT 6: LIGHT (6.1 - 6.6)
        {
            "id": "q-u6-6.1-lb",
            "unitNumber": 6,
            "topicCode": "6.1",
            "sourceBook": "learners_book",
            "bookSection": "Topic 6.1 Reflection (pp. 190–196) & WB 6.1 (p. 111)",
            "tier": "Practice",
            "commandWord": "Calculate and explain",
            "marks": 3,
            "prompt": "A ray of light strikes a flat plane mirror. The angle between the incident ray and the mirror surface is 25°. (a) State the name of the dashed line drawn at 90° to the mirror surface. (b) Calculate the angle of incidence and the angle of reflection, and calculate the total angle between the incident ray and the reflected ray.",
            "workedExample": "(a) The dashed line at 90° to the mirror is the normal.\n(b) The angle of incidence i is measured between the incident ray and the normal: i = 90° − 25° = 65°.\nBy the Law of Reflection, angle of reflection r = angle of incidence i = 65°.\nTotal angle between incident and reflected rays = i + r = 65° + 65° = 130°.",
            "fadedPrompt": "(a) The 90° dashed line is the ________. (b) Angle of incidence i = 90° − 25° = ________°, so angle of reflection r = ________°, and the angle between the two rays is ________°.",
            "fadedAnswer": "normal; 65; 65; 130",
            "modelAnswer": "(a) The normal. (b) Angle of incidence = 90° − 25° = 65°. By the law of reflection, angle of reflection = 65°. Total angle between incident and reflected rays = 65° + 65° = 130°.",
            "markSchemeKeywords": ["normal", "65", "130", "equal"],
            "linkedChapter": 10,
            "linkedWidget": "mirror",
        },
        {
            "id": "q-u6-6.2-wb",
            "unitNumber": 6,
            "topicCode": "6.2",
            "sourceBook": "workbook",
            "bookSection": "Workbook 6.2 Refraction through a glass block (pp. 115–117)",
            "tier": "Challenge",
            "commandWord": "Describe and explain",
            "marks": 4,
            "prompt": "A ray of light in air hits the flat side of a rectangular glass block at an angle of incidence of 45°, passes through the glass, and emerges back into the air on the opposite parallel side. Describe and explain how the ray bends (a) as it enters the glass from air, and (b) as it leaves the glass back into air.",
            "workedExample": "(a) Air → Glass: Light travels slower in glass than in air. When the ray enters the glass at an angle, slowing down causes it to refract (bend) TOWARD the normal, so the angle of refraction r in glass is smaller than 45°.\n(b) Glass → Air: When the ray leaves the glass into air, it speeds up again and refracts (bends) AWAY from the normal, emerging parallel to the original incident ray.",
            "fadedPrompt": "(a) Entering glass, light ________ down and bends ________ the normal (r < i). (b) Leaving glass into air, light ________ up and bends ________ from the normal.",
            "fadedAnswer": "slows; toward; speeds; away",
            "modelAnswer": "(a) Light slows down when entering glass from air, so the ray refracts (bends) toward the normal (angle of refraction is less than 45°). (b) Light speeds up when leaving glass into air, so the ray bends away from the normal.",
            "markSchemeKeywords": ["slows down", "toward the normal", "speeds up", "away from the normal"],
            "linkedChapter": 10,
            "linkedWidget": "refraction",
        },
        {
            "id": "q-u6-6.3-lb",
            "unitNumber": 6,
            "topicCode": "6.3",
            "sourceBook": "learners_book",
            "bookSection": "Topic 6.3 Making rainbows (pp. 204–208) & WB 6.3 (p. 118)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "Isaac Newton shone a narrow beam of white sunlight through a triangular glass prism onto a white wall. Name the phenomenon that splits white light into a spectrum of colours, list the seven colours in order from least bent to most bent, and explain why different colours bend by different angles.",
            "workedExample": "1. The splitting of white light into its component colours is called dispersion.\n2. Order from least refracted to most refracted: Red, Orange, Yellow, Green, Blue, Indigo, Violet.\n3. White light is a mixture of different wavelengths (colours). When entering glass, violet light slows down the most and refracts through the largest angle, while red light slows down the least and refracts through the smallest angle.",
            "fadedPrompt": "Splitting white light with a prism is called ________. ________ light slows down the least and bends through the smallest angle, while ________ light slows down the most and bends through the largest angle.",
            "fadedAnswer": "dispersion; Red; violet",
            "modelAnswer": "Dispersion. Order: red, orange, yellow, green, blue, indigo, violet. Each colour travels at a slightly different speed in glass: red slows down the least (refracts least) and violet slows down the most (refracts most).",
            "markSchemeKeywords": ["dispersion", "red", "violet", "different speeds", "refracted"],
            "linkedChapter": 10,
            "linkedWidget": "refraction",
        },
        {
            "id": "q-u6-6.4-wb",
            "unitNumber": 6,
            "topicCode": "6.4",
            "sourceBook": "workbook",
            "bookSection": "Workbook 6.4 Colours of light — Filters & Stage Lighting (pp. 122–124)",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "(a) State the three primary colours of light and the colour formed when red and green spotlights overlap on a white screen. (b) An actor on stage wears a bright blue shirt and red trousers. Explain what colour the shirt and trousers appear when the stage is lit ONLY by a pure red spotlight.",
            "workedExample": "(a) Primary colours of light: Red, Green, and Blue. Overlapping red + green light produces yellow light.\n(b) Under pure red light: the red trousers reflect red light into the audience's eyes, so they look RED. The blue shirt only reflects blue light and absorbs red light; since no blue light is shining on it, it reflects no light and looks BLACK.",
            "fadedPrompt": "(a) Primary colours of light are red, green, and ________; red + green = ________. (b) In pure red light, the red trousers reflect red and look ________, while the blue shirt absorbs red and looks ________.",
            "fadedAnswer": "blue; yellow; red; black",
            "modelAnswer": "(a) Red, green, and blue; red + green light makes yellow light. (b) The red trousers reflect the red light and look red; the blue shirt absorbs the red light and reflects no light, so it looks black.",
            "markSchemeKeywords": ["red", "green", "blue", "yellow", "reflects", "absorbs", "black"],
            "linkedChapter": 10,
            "linkedWidget": "colourmix",
        },
        {
            "id": "q-u6-6.5-6.6-cyp",
            "unitNumber": 6,
            "topicCode": "6.6",
            "sourceBook": "learners_book",
            "bookSection": "Topics 6.5–6.6 Galaxies & Rocks in Space + Unit 6 Check your progress (pp. 217–232)",
            "tier": "Practice",
            "commandWord": "Describe and explain",
            "marks": 4,
            "prompt": "(a) Name the galaxy that contains our Solar System, state its shape classification, and name the force that holds all the stars and stellar dust in a galaxy together. (b) State where most asteroids in the Solar System are found and explain why most asteroids have irregular, lumpy shapes rather than being spherical like Earth.",
            "workedExample": "(a) Our galaxy is the Milky Way, which is a spiral galaxy (other galaxies are elliptical or irregular). All the stars, planetary systems, gas, and stellar dust in a galaxy are held together by gravity.\n(b) Most asteroids orbit the Sun in the asteroid belt between the orbits of Mars and Jupiter. Asteroids are much smaller and less massive than planets, so their gravity is too weak to pull their rock into a spherical shape.",
            "fadedPrompt": "(a) The Milky Way is a ________ galaxy held together by ________. (b) Most asteroids orbit in the asteroid belt between ________ and ________, and have irregular shapes because their mass and gravity are too small.",
            "fadedAnswer": "spiral; gravity; Mars; Jupiter",
            "modelAnswer": "(a) The Milky Way is a spiral galaxy held together by gravity. (b) Most asteroids are in the asteroid belt between Mars and Jupiter; they have irregular shapes because they have too little mass (weak gravity) to pull themselves into a sphere.",
            "markSchemeKeywords": ["Milky Way", "spiral", "gravity", "Mars", "Jupiter", "asteroid belt", "mass"],
            "linkedChapter": 15,
            "linkedWidget": "parallax",
        },

        # UNIT 9: MAGNETISM (9.1 - 9.4 — HER UPCOMING PHYSICS UNIT!)
        {
            "id": "q-u9-9.1-lb",
            "unitNumber": 9,
            "topicCode": "9.1",
            "sourceBook": "learners_book",
            "bookSection": "Topic 9.1 Magnetic fields (pp. 293–299) & WB 9.1 (p. 184)",
            "tier": "Practice",
            "commandWord": "Describe and explain",
            "marks": 3,
            "prompt": "Describe how you would use a small plotting compass to map the magnetic field lines around a bar magnet on a sheet of paper, state the direction in which magnetic field arrows always point, and explain how the pattern of field lines shows where the magnetic field is strongest.",
            "workedExample": "1. Place the bar magnet on paper, put a plotting compass near the North pole, mark a pencil dot at the tip of the compass needle, move the compass so its tail sits on the dot, and repeat until reaching the South pole; join the dots with a smooth curve.\n2. Field line arrows always point AWAY from the North pole and TOWARD the South pole.\n3. The magnetic field is strongest where the field lines are closest together — right at the North and South poles.",
            "fadedPrompt": "Magnetic field line arrows always point from ________ to ________ outside the magnet. The magnetic field is strongest at the poles, where the field lines are ________ together.",
            "fadedAnswer": "North; South; closest",
            "modelAnswer": "Place a plotting compass near the north pole, mark dots along the needle direction step by step to the south pole, and join them. Arrows point from North to South. The field is strongest at the poles where the field lines are closest together.",
            "markSchemeKeywords": ["compass", "North to South", "closest together", "poles"],
            "linkedChapter": 13,
            "linkedWidget": "field3d",
        },
        {
            "id": "q-u9-9.2-wb",
            "unitNumber": 9,
            "topicCode": "9.2",
            "sourceBook": "workbook",
            "bookSection": "Workbook 9.2 The Earth as a giant magnet (pp. 187–192)",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "A student suspends a bar magnet from a thread so it can rotate freely. Its north pole turns to point toward Earth's Geographic North Pole. Explain why this proves that Earth's Geographic North Pole is actually near a magnetic south pole, and state what inside the Earth generates this magnetic field.",
            "workedExample": "1. Like magnetic poles repel and unlike magnetic poles attract.\n2. Because the north-seeking pole (N) of the suspended magnet is attracted toward Earth's Geographic North, the magnetic pole located near Geographic North must be a MAGNETIC SOUTH POLE.\n3. Earth's magnetic field is generated by convection currents of molten (liquid) iron and nickel moving in Earth's outer core.",
            "fadedPrompt": "Unlike poles ________, so for the north pole of a compass needle to be pulled toward Geographic North, Earth's Geographic North must contain a magnetic ________ pole, generated by liquid ________ in the outer core.",
            "fadedAnswer": "attract; south; iron / nickel",
            "modelAnswer": "Unlike magnetic poles attract. Since the north pole of the compass magnet is attracted toward Geographic North, Earth's Geographic North must be near a magnetic south pole. The field is caused by moving liquid iron and nickel in Earth's outer core.",
            "markSchemeKeywords": ["unlike poles attract", "magnetic south", "outer core", "iron"],
            "linkedChapter": 13,
            "linkedWidget": "magnetometer",
        },
        {
            "id": "q-u9-9.3-lb",
            "unitNumber": 9,
            "topicCode": "9.3",
            "sourceBook": "learners_book",
            "bookSection": "Topic 9.3 Electromagnets (pp. 306–310) & WB 9.3 (p. 193)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "A scrapyard crane uses a large electromagnet to lift steel cars and drop them into a crusher. (a) State the three components needed to build a simple electromagnet in the school lab. (b) Explain why the core of an electromagnet is made of soft iron rather than steel.",
            "workedExample": "(a) Three components: a coil of insulated wire (solenoid), a d.c. power supply or cell/battery (with switch), and a soft iron core (such as an iron nail) inside the coil.\n(b) Soft iron is a temporary magnetic material: it becomes strongly magnetised as soon as the electric current is switched on, and loses its magnetism immediately when the current is switched off (allowing the crane to drop the car). Steel is a hard magnetic material that stays permanently magnetised even after the current is switched off.",
            "fadedPrompt": "An electromagnet needs a coil of wire, a power supply, and a soft ________ core. Soft iron is used instead of steel because iron ________ its magnetism when the current is switched off, whereas steel stays magnetised.",
            "fadedAnswer": "iron; loses",
            "modelAnswer": "(a) A coil of insulated wire, a cell/power supply (electric current), and a soft iron core. (b) Soft iron magnetises easily when current flows and demagnetises immediately when the current is switched off, whereas steel stays permanently magnetised and would not drop the load.",
            "markSchemeKeywords": ["coil", "current", "soft iron", "loses magnetism", "switched off", "steel"],
            "linkedChapter": 13,
            "linkedWidget": "fieldslab",
        },
        {
            "id": "q-u9-9.4-cyp",
            "unitNumber": 9,
            "topicCode": "9.4",
            "sourceBook": "workbook",
            "bookSection": "Workbook 9.4 Investigating electromagnets & Unit 9 Check your progress (pp. 197–202)",
            "tier": "Challenge",
            "commandWord": "Analyse and evaluate",
            "marks": 4,
            "prompt": "Zara investigates how the number of turns on an electromagnet coil affects the number of steel paperclips it can hold. For 40 turns, her three repeat readings are 18, 8, and 20 paperclips. (a) State the independent variable, the dependent variable, and one variable she must keep constant (control). (b) Identify the anomalous reading for 40 turns and calculate the correct mean number of paperclips.",
            "workedExample": "(a) Independent variable: number of turns on the coil. Dependent variable: number of paperclips lifted. Control variables: electric current in the coil (measured with an ammeter), same soft iron nail core, and same size/mass of paperclips.\n(b) The reading of 8 paperclips is anomalous (much lower than 18 and 20, perhaps the current dropped or clips fell off). Excluding the anomaly, mean = (18 + 20) ÷ 2 = 19 paperclips.",
            "fadedPrompt": "(a) Independent variable: number of ________; control variable: electric ________ (or same iron core). (b) The anomalous reading is ________; excluding it gives mean = (18 + 20) ÷ 2 = ________ paperclips.",
            "fadedAnswer": "turns; current; 8; 19",
            "modelAnswer": "(a) Independent: number of turns on the coil; Dependent: number of paperclips held; Control: current in the coil (measured with an ammeter) and same iron core. (b) 8 is anomalous; exclude 8 and calculate mean = (18 + 20) ÷ 2 = 19 paperclips.",
            "markSchemeKeywords": ["turns", "paperclips", "current", "iron core", "8", "19"],
            "linkedChapter": 13,
            "linkedWidget": "fieldslab",
        },

        # CROSS-DISCIPLINARY PHYSICS BRIDGE QUESTIONS (UNITS 5 & 8)
        {
            "id": "q-u5-5.1-bridge",
            "unitNumber": 5,
            "topicCode": "5.1",
            "sourceBook": "learners_book",
            "bookSection": "Topic 5.1 The structure of the atom (pp. 152–156) & WB 5.1 (p. 88)",
            "tier": "Practice",
            "commandWord": "Compare and explain",
            "marks": 3,
            "prompt": "State the relative electric charge and location inside an atom of a proton, a neutron, and an electron, and explain what force holds the electrons in the atom.",
            "workedExample": "1. Proton: charge +1, located in the central nucleus.\n2. Neutron: charge 0 (neutral), located in the central nucleus.\n3. Electron: charge −1, moving in shells (empty space) around the nucleus.\n4. Because opposite electric charges attract, electrostatic attraction between the positively charged nucleus and negatively charged electrons holds the electrons in the atom.",
            "fadedPrompt": "Protons (+1) and neutrons (0) are in the ________, while electrons (−1) move around the outside. ________ attraction between opposite charges holds the electrons to the nucleus.",
            "fadedAnswer": "nucleus; Electrostatic",
            "modelAnswer": "Protons (+1) and neutrons (0) are in the nucleus; electrons (−1) orbit outside the nucleus. Electrostatic attraction between the positive nucleus and negative electrons holds the atom together.",
            "markSchemeKeywords": ["proton", "neutron", "electron", "nucleus", "electrostatic", "opposite charges"],
            "linkedChapter": 12,
            "linkedWidget": "circuit",
        },
        {
            "id": "q-u8-8.1-8.2-bridge",
            "unitNumber": 8,
            "topicCode": "8.1",
            "sourceBook": "workbook",
            "bookSection": "Workbook 8.1 & 8.2 Exothermic vs Endothermic Energy Transfers (pp. 159–168)",
            "tier": "Practice",
            "commandWord": "Compare and explain",
            "marks": 4,
            "prompt": "In Experiment A, magnesium ribbon reacts with dilute hydrochloric acid and the thermometer reading changes from 21 °C to 44 °C. In Experiment B, sodium hydrogencarbonate reacts with citric acid solution and the thermometer reading changes from 21 °C to 14 °C. Classify each reaction as exothermic or endothermic and explain the direction of thermal energy transfer in each.",
            "workedExample": "1. Experiment A: Temperature rose by +23 °C (21 → 44 °C), so it is EXOTHERMIC. Chemical potential energy stored in the reactants was transferred as thermal energy TO the surrounding solution, warming the thermometer.\n2. Experiment B: Temperature fell by −7 °C (21 → 14 °C), so it is ENDOTHERMIC. The reaction absorbed thermal energy FROM the surrounding solution into chemical potential energy, cooling the solution.",
            "fadedPrompt": "Experiment A is ________ because thermal energy is transferred ________ the surroundings (temperature rises). Experiment B is ________ because thermal energy is absorbed ________ the surroundings (temperature falls).",
            "fadedAnswer": "exothermic; to; endothermic; from",
            "modelAnswer": "Experiment A is exothermic because thermal energy is transferred to the surroundings so the temperature rises from 21 °C to 44 °C. Experiment B is endothermic because thermal energy is taken in (absorbed) from the surroundings so the temperature falls from 21 °C to 14 °C.",
            "markSchemeKeywords": ["exothermic", "to the surroundings", "temperature rises", "endothermic", "from the surroundings", "temperature falls"],
            "linkedChapter": 5,
            "linkedWidget": "energystores",
        },
        # ADDITIONAL LEARNER'S BOOK & WORKBOOK COVERAGE FOR EVERY TOPIC (3.1-3.7, 6.1-6.6, 9.1-9.4 + BRIDGES)
        {
            "id": "q-u3-3.1-wb-focus",
            "unitNumber": 3,
            "topicCode": "3.1",
            "sourceBook": "workbook",
            "bookSection": "Workbook 3.1 Forces and motion — Focus & Practice (pp. 38–41)",
            "tier": "Focus",
            "commandWord": "State and explain",
            "marks": 3,
            "prompt": "A tug-of-war team pulls to the left with a total force of 850 N while the opposing team pulls to the right with a total force of 850 N. (a) Calculate the resultant force on the rope and state whether the forces are balanced or unbalanced. (b) List the four ways an unbalanced resultant force can change the motion of an object.",
            "workedExample": "(a) Resultant force = 850 N − 850 N = 0 N. Because the two opposite forces are equal in size, the forces are balanced.\n(b) An unbalanced force can make an object: (1) start moving from rest, (2) speed up (accelerate), (3) slow down (decelerate), or (4) change direction.",
            "fadedPrompt": "(a) Resultant force = 850 − 850 = ________ N (forces are ________). (b) An unbalanced force can make an object start moving, speed up, ________ down, or change ________.",
            "fadedAnswer": "0; balanced; slow; direction",
            "modelAnswer": "(a) Resultant force = 0 N; forces are balanced. (b) Start moving, speed up, slow down, or change direction.",
            "markSchemeKeywords": ["0 N", "balanced", "speed up", "slow down", "change direction"],
            "linkedChapter": 2,
            "linkedWidget": "forces",
        },
        {
            "id": "q-u3-3.1-lb-parachute",
            "unitNumber": 3,
            "topicCode": "3.1",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.1 Terminal Velocity & Parachute Forces (p. 74)",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "A skydiver falls at a constant terminal speed of 55 m/s before opening her parachute. Her weight is 650 N. (a) State the size and direction of the air resistance acting on her at 55 m/s. (b) When she opens her parachute, the upward air resistance suddenly jumps to 2400 N. State the direction of the resultant force immediately after the parachute opens and explain how her speed changes.",
            "workedExample": "(a) Because she is falling at constant speed (55 m/s), the forces on her must be balanced (resultant force = 0 N). Therefore, upward air resistance = downward weight = 650 N upwards.\n(b) Immediately after opening the parachute, upward air resistance (2400 N) is much larger than downward weight (650 N). Resultant force = 2400 N − 650 N = 1750 N UPWARDS. An upward resultant force on a downward-moving skydiver causes her to decelerate (slow down rapidly), NOT move upwards!",
            "fadedPrompt": "(a) At constant speed, upward air resistance equals weight = ________ N upwards. (b) When air resistance becomes 2400 N, the resultant force is 1750 N ________, which makes the downward-moving skydiver ________.",
            "fadedAnswer": "650; upwards; slow down / decelerate",
            "modelAnswer": "(a) 650 N upwards (balanced with her 650 N downward weight). (b) Resultant force is 1750 N upwards; because it opposes her downward motion, she slows down (decelerates) to a much lower steady landing speed.",
            "markSchemeKeywords": ["650 N", "upwards", "balanced", "1750", "slow down", "decelerate"],
            "linkedChapter": 2,
            "linkedWidget": "airfall",
        },
        {
            "id": "q-u3-3.2-lb-gates",
            "unitNumber": 3,
            "topicCode": "3.2",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.2 Measuring speed with light gates (pp. 79–83)",
            "tier": "Practice",
            "commandWord": "Calculate and explain",
            "marks": 3,
            "prompt": "In a laboratory investigation, a trolley carrying a card of length 0.12 m passes through a single light gate connected to an electronic timer. The card blocks the infrared beam for 0.08 s. (a) Calculate the speed of the trolley in m/s. (b) Explain why using light gates and an electronic timer gives more accurate results than using a hand-held stopwatch.",
            "workedExample": "(a) Speed = distance ÷ time = length of card ÷ time beam is blocked = 0.12 m ÷ 0.08 s = 1.5 m/s.\n(b) Light gates eliminate human reaction-time errors (~0.2 s delay when starting and stopping a stopwatch by hand), which is especially critical when measuring very short times like 0.08 s.",
            "fadedPrompt": "(a) Speed = 0.12 m ÷ 0.08 s = ________ m/s. (b) Light gates are more accurate because they eliminate human ________ time error.",
            "fadedAnswer": "1.5; reaction",
            "modelAnswer": "(a) Speed = 0.12 ÷ 0.08 = 1.5 m/s. (b) Light gates remove human reaction time errors when starting and stopping the timer.",
            "markSchemeKeywords": ["1.5", "m/s", "reaction time", "human error"],
            "linkedChapter": 1,
            "linkedWidget": "videotrack",
        },
        {
            "id": "q-u3-3.3-wb-challenge",
            "unitNumber": 3,
            "topicCode": "3.3",
            "sourceBook": "workbook",
            "bookSection": "Workbook 3.3 Distance–time graphs — Challenge (pp. 49–50)",
            "tier": "Challenge",
            "commandWord": "Analyse and calculate",
            "marks": 4,
            "prompt": "Sofia cycles 1200 m to her friend's house in 200 s, waits at the door for 100 s, and then cycles a further 600 m to the park in 100 s. (a) Calculate her speed during the first 200 s. (b) Calculate her overall average speed for the entire 400 s journey (including the 100 s stop).",
            "workedExample": "(a) Speed in first stage = 1200 m ÷ 200 s = 6.0 m/s.\n(b) Total distance = 1200 m + 0 m + 600 m = 1800 m. Total time = 200 s + 100 s + 100 s = 400 s.\nOverall average speed = total distance ÷ total time = 1800 m ÷ 400 s = 4.5 m/s.",
            "fadedPrompt": "(a) First stage speed = 1200 ÷ 200 = ________ m/s. (b) Total distance = ________ m in total time 400 s, so overall average speed = 1800 ÷ 400 = ________ m/s.",
            "fadedAnswer": "6.0; 1800; 4.5",
            "modelAnswer": "(a) 1200 ÷ 200 = 6.0 m/s. (b) Total distance = 1800 m, total time = 400 s; average speed = 1800 ÷ 400 = 4.5 m/s.",
            "markSchemeKeywords": ["6", "6.0", "1800", "4.5 m/s"],
            "linkedChapter": 1,
            "linkedWidget": "graphwalk",
        },
        {
            "id": "q-u3-3.4-lb-spanner",
            "unitNumber": 3,
            "topicCode": "3.4",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.4 Turning forces — Spanners & Levers (pp. 91–98)",
            "tier": "Practice",
            "commandWord": "Calculate and explain",
            "marks": 3,
            "prompt": "A mechanic tries to loosen a tight wheel nut using a short spanner of length 0.15 m by pushing perpendicular to the handle with a force of 120 N. (a) Calculate the moment of the force about the nut. (b) Explain why switching to a longer spanner of length 0.45 m makes it much easier to loosen the nut.",
            "workedExample": "(a) Moment = force × perpendicular distance from pivot = 120 N × 0.15 m = 18 N m.\n(b) Because moment = force × distance from the pivot, a longer spanner (0.45 m, 3× longer) produces a much larger turning moment for the same push force (54 N m), or requires only one-third the force (40 N) to produce the same 18 N m moment.",
            "fadedPrompt": "(a) Moment = 120 N × 0.15 m = ________ N m. (b) A longer spanner increases the perpendicular ________ from the pivot, producing a larger ________ for the same force.",
            "fadedAnswer": "18; distance; moment",
            "modelAnswer": "(a) Moment = 120 × 0.15 = 18 N m. (b) A longer spanner increases the distance from the pivot, which increases the moment (turning effect) for the same applied force (or needs less force for the same moment).",
            "markSchemeKeywords": ["18", "N m", "distance from pivot", "larger moment"],
            "linkedChapter": 3,
            "linkedWidget": "mechanicslab",
        },
        {
            "id": "q-u3-3.5-wb-block",
            "unitNumber": 3,
            "topicCode": "3.5",
            "sourceBook": "workbook",
            "bookSection": "Workbook 3.5 Pressure between solids — Rectangular Block Orientations (pp. 55–59)",
            "tier": "Challenge",
            "commandWord": "Calculate",
            "marks": 4,
            "prompt": "A solid metal block has a weight of 48 N and dimensions 2 cm × 4 cm × 6 cm. (a) Which face (give its dimensions and area in cm²) should be placed on the table to produce the MAXIMUM pressure, and what is that maximum pressure in N/cm²? (b) What is the MINIMUM pressure the block can exert on the table?",
            "workedExample": "(a) Since pressure = force ÷ area, maximum pressure occurs when the block rests on its SMALLEST face: 2 cm × 4 cm = 8 cm².\nMaximum pressure = 48 N ÷ 8 cm² = 6.0 N/cm².\n(b) Minimum pressure occurs when the block rests on its LARGEST face: 4 cm × 6 cm = 24 cm².\nMinimum pressure = 48 N ÷ 24 cm² = 2.0 N/cm².",
            "fadedPrompt": "(a) Smallest area = 2 × 4 = ________ cm², giving maximum pressure = 48 ÷ 8 = ________ N/cm². (b) Largest area = 4 × 6 = 24 cm², giving minimum pressure = 48 ÷ 24 = ________ N/cm².",
            "fadedAnswer": "8; 6.0; 2.0",
            "modelAnswer": "(a) Smallest face is 2 cm × 4 cm = 8 cm²; maximum pressure = 48 ÷ 8 = 6 N/cm². (b) Largest face is 4 cm × 6 cm = 24 cm²; minimum pressure = 48 ÷ 24 = 2 N/cm².",
            "markSchemeKeywords": ["8 cm²", "6 N/cm²", "24 cm²", "2 N/cm²"],
            "linkedChapter": 6,
            "linkedWidget": "pressuretank",
        },
        {
            "id": "q-u3-3.6-lb-dam",
            "unitNumber": 3,
            "topicCode": "3.6",
            "sourceBook": "learners_book",
            "bookSection": "Topic 3.6 Pressure in liquids and gases — Dams & Altitude (pp. 106–113)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "(a) Explain why hydroelectric dam walls are built much thicker at the bottom than at the top. (b) Explain why atmospheric air pressure at the top of Mount Everest (8848 m) is much lower than at sea level in Mumbai.",
            "workedExample": "(a) Pressure in a liquid increases with depth because there is a greater weight of water above pushing down. Therefore, water pressure is greatest at the bottom of the reservoir, requiring a thicker, stronger dam wall at the base.\n(b) At higher altitude on Mount Everest, there is less air above pushing down and the air is less dense (fewer gas molecules per cubic metre), so fewer particle collisions occur with surfaces per second.",
            "fadedPrompt": "(a) Liquid pressure increases with ________ because of the weight of water above, so the dam base must withstand the highest pressure. (b) At high altitude there are ________ air particles per unit volume, so fewer collisions occur.",
            "fadedAnswer": "depth; fewer",
            "modelAnswer": "(a) Water pressure increases with depth due to the greater weight of water above, so the bottom of the dam experiences the greatest pressure. (b) At high altitude there is less air above and fewer gas particles per unit volume, so there are fewer particle collisions per second.",
            "markSchemeKeywords": ["depth", "weight of water", "greater pressure", "fewer particles", "collisions"],
            "linkedChapter": 6,
            "linkedWidget": "pressuretank",
        },
        {
            "id": "q-u3-3.7-wb-temp",
            "unitNumber": 3,
            "topicCode": "3.7",
            "sourceBook": "workbook",
            "bookSection": "Workbook 3.7 Particles on the move — Temperature & State (pp. 64–68)",
            "tier": "Challenge",
            "commandWord": "Compare and explain",
            "marks": 4,
            "prompt": "(a) Explain why diffusion of bromine gas in air happens much faster than diffusion of copper sulfate in water at the same temperature. (b) Explain why food dye diffuses faster in hot water at 70 °C than in cold water at 10 °C.",
            "workedExample": "(a) In gases, particles are far apart with large empty spaces between them and travel long distances at high speed before colliding. In liquids, particles are closely packed and constantly collide with neighbours, slowing net spread.\n(b) At 70 °C, water and dye particles have more thermal kinetic energy and move faster on average than at 10 °C, so they collide and spread from high to low concentration more rapidly.",
            "fadedPrompt": "(a) Gas particles are much further ________ than liquid particles and move faster with fewer collisions. (b) In hot water, particles have greater ________ energy and move ________.",
            "fadedAnswer": "apart; kinetic; faster",
            "modelAnswer": "(a) Gas particles are far apart and move rapidly with fewer collisions, whereas liquid particles are closely packed and collide constantly. (b) At higher temperature, particles have more kinetic energy and move faster, so diffusion is faster.",
            "markSchemeKeywords": ["far apart", "closely packed", "kinetic energy", "faster", "collisions"],
            "linkedChapter": 7,
            "linkedWidget": "expansion",
        },
        {
            "id": "q-u6-6.1-wb-periscope",
            "unitNumber": 6,
            "topicCode": "6.1",
            "sourceBook": "workbook",
            "bookSection": "Workbook 6.1 Reflection — Periscopes & Mirror Angles (pp. 111–114)",
            "tier": "Practice",
            "commandWord": "Explain and calculate",
            "marks": 3,
            "prompt": "A simple periscope uses two parallel plane mirrors tilted at 45° to the vertical tube so a submarine observer can see above the water. (a) What is the angle of incidence of a horizontal light ray hitting the top 45° mirror? (b) Through what total angle is the light ray turned by each mirror?",
            "workedExample": "(a) The mirror is at 45° to the horizontal ray, so the normal (at 90° to the mirror) is also at 45° to the horizontal ray. Thus angle of incidence i = 45°.\n(b) By the law of reflection, angle of reflection r = 45°. The total angle through which the ray turns at the mirror is i + r = 45° + 45° = 90° (turning horizontal light vertically down the tube).",
            "fadedPrompt": "(a) Angle of incidence i = ________°. (b) Angle of reflection r = 45°, so the ray turns through i + r = ________°.",
            "fadedAnswer": "45; 90",
            "modelAnswer": "(a) Angle of incidence = 45°. (b) Angle of reflection = 45°, so each mirror turns the light ray through 45° + 45° = 90°.",
            "markSchemeKeywords": ["45°", "90°", "normal", "angle of reflection"],
            "linkedChapter": 10,
            "linkedWidget": "mirror",
        },
        {
            "id": "q-u6-6.2-lb-coin",
            "unitNumber": 6,
            "topicCode": "6.2",
            "sourceBook": "learners_book",
            "bookSection": "Topic 6.2 Refraction — Apparent Depth & Normal Incidence (pp. 197–203)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "(a) Explain why a coin at the bottom of a beaker of water looks shallower (closer to the surface) than it really is when viewed from above at an angle. (b) What happens to the direction and speed of a light ray that enters water from air straight along the normal (angle of incidence = 0°)?",
            "workedExample": "(a) Light rays reflecting off the coin travel from water into air. As they cross the water-to-air boundary, they speed up and refract (bend) AWAY from the normal into the observer's eye. The brain traces these rays straight back in a straight line, forming a virtual image shallower than the real coin.\n(b) Along the normal (i = 0°), the light ray slows down as it enters water, but it does NOT change direction (angle of refraction = 0°).",
            "fadedPrompt": "(a) Rays leaving water into air ________ up and bend ________ from the normal, making the coin appear shallower. (b) Along the normal (i = 0°), light slows down but does ________ bend.",
            "fadedAnswer": "speed; away; not",
            "modelAnswer": "(a) Light rays travelling from water into air speed up and bend away from the normal; the eye traces the rays straight back to a shallower apparent depth. (b) The ray slows down in water but does not change direction (continues straight along the normal).",
            "markSchemeKeywords": ["speeds up", "away from the normal", "shallower", "slows down", "does not bend"],
            "linkedChapter": 10,
            "linkedWidget": "refraction",
        },
        {
            "id": "q-u6-6.3-wb-spectrum",
            "unitNumber": 6,
            "topicCode": "6.3",
            "sourceBook": "workbook",
            "bookSection": "Workbook 6.3 Making rainbows — Recombining & Raindrops (pp. 118–121)",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "A student claims that a glass prism 'adds colour stain to white light' to create a rainbow. How did Isaac Newton prove experimentally using a SECOND prism that the colours are already present inside white light, and what two optical processes inside raindrops form a natural rainbow?",
            "workedExample": "1. Newton placed a second inverted triangular prism in the path of the dispersed spectrum; the seven colours recombined to form a beam of white light again (and isolating a single colour like red through a second prism produced no new colours), proving white light is a mixture of the colours.\n2. Natural rainbows form when sunlight undergoes refraction (dispersion) as it enters a raindrop, internal reflection off the back of the raindrop, and refraction again as it leaves the drop.",
            "fadedPrompt": "Newton used a second inverted prism to ________ the seven colours back into ________ light. Raindrops form a rainbow by ________ (dispersion) and internal ________.",
            "fadedAnswer": "recombine; white; refraction; reflection",
            "modelAnswer": "Newton used a second inverted prism to recombine the spectrum back into white light, proving the colours were already in white light. Raindrops form rainbows by refraction (dispersion) and internal reflection of sunlight.",
            "markSchemeKeywords": ["second prism", "recombine", "white light", "refraction", "reflection"],
            "linkedChapter": 10,
            "linkedWidget": "refraction",
        },
        {
            "id": "q-u6-6.4-lb-filters",
            "unitNumber": 6,
            "topicCode": "6.4",
            "sourceBook": "learners_book",
            "bookSection": "Topic 6.4 Colours of light — Overlapping Filters (pp. 209–216)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "White light is shone through a blue filter and then immediately through a green filter placed behind it. State what is seen on a screen behind the second filter and explain why.",
            "workedExample": "1. White light contains all colours of the spectrum (including red, green, and blue).\n2. The blue filter transmits ONLY blue light and absorbs all other colours (including red and green).\n3. When that transmitted blue light hits the green filter, the green filter absorbs blue light (it only transmits green). Therefore, NO light passes through the second filter and the screen looks black (dark).",
            "fadedPrompt": "The blue filter transmits only ________ light and absorbs all other colours. The green filter then ________ the blue light, so ________ light reaches the screen (it looks black).",
            "fadedAnswer": "blue; absorbs; no",
            "modelAnswer": "No light reaches the screen (it looks black). The blue filter transmits only blue light and absorbs all other colours; the green filter then absorbs the blue light.",
            "markSchemeKeywords": ["transmits blue", "absorbs", "no light", "black"],
            "linkedChapter": 10,
            "linkedWidget": "colourmix",
        },
        {
            "id": "q-u6-6.5-wb-galaxies",
            "unitNumber": 6,
            "topicCode": "6.5",
            "sourceBook": "workbook",
            "bookSection": "Workbook 6.5 Galaxies (pp. 125–128)",
            "tier": "Practice",
            "commandWord": "Describe",
            "marks": 3,
            "prompt": "(a) Name the three main shapes used by astronomers to classify galaxies. (b) Explain why we see the Milky Way as a milky band of light stretching across the night sky rather than seeing its spiral arms from above.",
            "workedExample": "(a) The three galaxy shapes are: spiral, elliptical, and irregular.\n(b) Our Solar System is located inside the flat disc of the Milky Way galaxy (about two-thirds of the way out from the centre). When we look along the plane of the galactic disc, we are looking edge-on through billions of distant stars, which blend into a glowing band.",
            "fadedPrompt": "(a) Galaxy shapes are ________, elliptical, and ________. (b) We see a band because the Solar System is inside the flat disc of the Milky Way, so we view the disc ________-on.",
            "fadedAnswer": "spiral; irregular; edge",
            "modelAnswer": "(a) Spiral, elliptical, and irregular. (b) Our Solar System is inside the flat disc of the Milky Way, so we are looking edge-on through the crowded plane of billions of stars.",
            "markSchemeKeywords": ["spiral", "elliptical", "irregular", "inside", "disc", "edge-on"],
            "linkedChapter": 15,
            "linkedWidget": "parallax",
        },
        {
            "id": "q-u9-9.1-wb-poles",
            "unitNumber": 9,
            "topicCode": "9.1",
            "sourceBook": "workbook",
            "bookSection": "Workbook 9.1 Magnetic fields — Interacting Poles & Neutral Point (pp. 184–186)",
            "tier": "Challenge",
            "commandWord": "Compare and explain",
            "marks": 4,
            "prompt": "Two bar magnets are placed in a line with a small gap between them. In Arrangement X, a North pole faces a South pole. In Arrangement Y, a North pole faces another North pole. Contrast the magnetic field line patterns in the gap for X and Y, and state where a neutral point (zero magnetic field) occurs.",
            "workedExample": "1. Arrangement X (N facing S — unlike poles attract): Magnetic field lines run smoothly across the gap directly from the North pole to the South pole.\n2. Arrangement Y (N facing N — like poles repel): Magnetic field lines emerging from both North poles bend away from each other and never cross. Right in the middle of the gap between the two North poles is a NEUTRAL POINT where the two equal and opposite magnetic fields cancel out (field strength = 0).",
            "fadedPrompt": "In X (N facing S), field lines run straight across from ________ to ________. In Y (N facing N), field lines bend away from each other, leaving a ________ point in the centre where the magnetic fields cancel.",
            "fadedAnswer": "North; South; neutral",
            "modelAnswer": "In X (unlike poles), field lines connect directly across the gap from N to S. In Y (like poles), field lines curve away from each other and a neutral point (zero net magnetic field) forms at the midpoint between the two N poles.",
            "markSchemeKeywords": ["North to South", "curve away", "repel", "neutral point", "cancel"],
            "linkedChapter": 13,
            "linkedWidget": "field3d",
        },
        {
            "id": "q-u9-9.3-wb-bell",
            "unitNumber": 9,
            "topicCode": "9.3",
            "sourceBook": "workbook",
            "bookSection": "Workbook 9.3 Electromagnets — Electric Bell & Relay (pp. 193–196)",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "State three ways to increase the strength of an electromagnet, and explain why an electromagnet in an electric bell must switch off and on repeatedly when the bell button is held down.",
            "workedExample": "1. Three ways to increase electromagnet strength: (i) increase the number of turns (coils) of wire, (ii) increase the electric current flowing in the coil, (iii) insert a soft iron core inside the coil.\n2. When the switch is pressed, the electromagnet attracts the soft iron armature so the hammer strikes the gong; that movement breaks the circuit at the contact screw, switching the electromagnet OFF so the spring pulls the armature back, re-making the contact and repeating the cycle rapidly.",
            "fadedPrompt": "Three ways to strengthen an electromagnet: more ________ on the coil, larger electric ________, and a soft ________ core.",
            "fadedAnswer": "turns / coils; current; iron",
            "modelAnswer": "Three ways: (1) increase the number of turns on the coil, (2) increase the electric current, (3) place a soft iron core inside the coil. In an electric bell, pulling the armature to hit the gong breaks the contact so the electromagnet switches off and the spring pulls it back to repeat.",
            "markSchemeKeywords": ["more turns", "larger current", "soft iron core", "breaks the circuit", "spring"],
            "linkedChapter": 13,
            "linkedWidget": "fieldslab",
        },
        {
            "id": "q-u9-9.4-lb-ammeter",
            "unitNumber": 9,
            "topicCode": "9.4",
            "sourceBook": "learners_book",
            "bookSection": "Topic 9.4 Investigating electromagnets (pp. 311–315)",
            "tier": "Challenge",
            "commandWord": "Evaluate",
            "marks": 3,
            "prompt": "Marcus investigates how electric current affects electromagnet strength by connecting 1 cell, then 2 cells, then 3 cells to his coil. Zara tells him that counting cells is not an accurate way to measure current and that his cells might get warm and run down. Explain what instrument Marcus should add to his circuit, how he should connect it, and one safety precaution when using high currents in a coil.",
            "workedExample": "1. Marcus should connect an AMMETER in SERIES with the electromagnet coil (and ideally use a variable power supply or variable resistor) so he can measure the exact current in amps (A).\n2. Safety precaution: high current makes the thin wire coil get very hot, so he should switch off the current between readings and avoid touching the hot wire (or keep the current low).",
            "fadedPrompt": "Connect an ________ in ________ with the coil to measure current in amps. Switch off the circuit between readings because the wire coil can get ________.",
            "fadedAnswer": "ammeter; series; hot",
            "modelAnswer": "Connect an ammeter in series with the coil to measure the actual current in amps. Switch the current off between readings because the coil wire can overheat and cause burns.",
            "markSchemeKeywords": ["ammeter", "in series", "amps", "switch off", "hot", "overheat"],
            "linkedChapter": 12,
            "linkedWidget": "circuit",
        },
        # ADDITIONAL BRIDGE QUESTIONS (UNITS 1, 2, 5, 7)
        {
            "id": "q-u1-1.3-bridge-boyle",
            "unitNumber": 1,
            "topicCode": "1.3",
            "sourceBook": "learners_book",
            "bookSection": "Topic 1.3 Breathing & Bell-Jar Lung Model (pp. 18–24) + Physics Ch 6 Bridge",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "In a bell-jar model of the chest, pulling down the rubber sheet at the base makes the two balloons inside inflate. Use the physics of gas volume and pressure (Topic 3.6) to explain step-by-step why pulling down the rubber sheet (or contracting the diaphragm) causes air to enter the lungs.",
            "workedExample": "1. Pulling down the rubber sheet (diaphragm contracting and flattening) increases the internal VOLUME of the sealed bell jar (thoracic cavity).\n2. Because the same number of gas molecules now occupy a larger volume, they collide less frequently with the walls, so the air PRESSURE inside the jar/lungs decreases below outside atmospheric pressure.\n3. Because outside atmospheric pressure is now higher than internal lung pressure, air is pushed down the tube (trachea) into the balloons (lungs).",
            "fadedPrompt": "Contracting the diaphragm ________ the volume of the thorax, which ________ the gas pressure inside the lungs below atmospheric pressure, so outside air flows in.",
            "fadedAnswer": "increases; decreases / lowers",
            "modelAnswer": "Contracting the diaphragm increases the volume of the thorax. This decreases the air pressure inside the lungs below outside atmospheric pressure, so atmospheric air is pushed into the lungs.",
            "markSchemeKeywords": ["volume increases", "pressure decreases", "below atmospheric", "air flows in"],
            "linkedChapter": 6,
            "linkedWidget": "pressuretank",
        },
        {
            "id": "q-u2-2.1-2.2-bridge-mass",
            "unitNumber": 2,
            "topicCode": "2.1",
            "sourceBook": "workbook",
            "bookSection": "Workbook 2.1 & 2.2 Dissolving, Conservation of Mass & Kinetic Solubility (pp. 21–27)",
            "tier": "Practice",
            "commandWord": "Calculate and explain",
            "marks": 3,
            "prompt": "Arun adds 14 g of sodium chloride salt to 100 g of pure water in a beaker and stirs until the salt is completely invisible. (a) Calculate the total mass of the salt solution and state the physics law this illustrates. (b) Explain using the particle model why the salt seems to disappear even though all its mass is still present.",
            "workedExample": "(a) Mass of solution = mass of solute + mass of solvent = 14 g + 100 g = 114 g. This illustrates Conservation of Mass (no particles are destroyed when dissolving).\n(b) Solid salt crystals break up into individual sodium and chloride ions/particles that spread out into the spaces between the water molecules, making them too tiny to scatter light.",
            "fadedPrompt": "(a) Total mass of solution = 14 g + 100 g = ________ g (conservation of ________). (b) Individual solute particles separate and fit between the ________ particles.",
            "fadedAnswer": "114; mass; water / solvent",
            "modelAnswer": "(a) 114 g (conservation of mass). (b) The salt particles separate from the crystal lattice and mix into the spaces between the water particles.",
            "markSchemeKeywords": ["114 g", "conservation of mass", "spaces", "water particles"],
            "linkedChapter": 7,
            "linkedWidget": "expansion",
        },
        {
            "id": "q-u5-5.3-5.5-bridge-climate",
            "unitNumber": 5,
            "topicCode": "5.5",
            "sourceBook": "learners_book",
            "bookSection": "Topics 5.3–5.5 Weather, Glacial Albedo & Atmosphere (pp. 165–185) + Physics Ch 8 Bridge",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "Use the physics of radiation and reflection (Topics 6.1 & Ch 8) to explain: (a) how greenhouse gases like CO₂ and methane warm Earth's atmosphere, and (b) why melting white polar sea ice speeds up global warming (the ice-albedo feedback loop).",
            "workedExample": "(a) Short-wave visible sunlight passes through the atmosphere and warms Earth's surface. The warm Earth emits long-wave infrared thermal radiation back toward space; greenhouse gas molecules absorb and re-emit part of this infrared radiation, trapping thermal energy in the atmosphere.\n(b) White snow and sea ice are good reflectors of sunlight (high albedo). When ice melts to expose dark ocean water, the dark water absorbs much more solar radiation instead of reflecting it, warming the ocean and melting even more ice.",
            "fadedPrompt": "(a) Earth's warm surface emits ________ thermal radiation that is absorbed by greenhouse gases. (b) White ice ________ sunlight well, whereas dark ocean water ________ solar energy and warms further.",
            "fadedAnswer": "infrared; reflects; absorbs",
            "modelAnswer": "(a) Warm Earth emits infrared thermal radiation which greenhouse gases absorb and trap in the atmosphere. (b) White ice reflects most incoming solar radiation, whereas dark ocean water absorbs solar radiation, causing further warming and melting.",
            "markSchemeKeywords": ["infrared", "thermal radiation", "reflects", "absorbs", "dark ocean"],
            "linkedChapter": 8,
            "linkedWidget": "conduction",
        },
        {
            "id": "q-u7-7.4-bridge-biceps",
            "unitNumber": 7,
            "topicCode": "7.4",
            "sourceBook": "learners_book",
            "bookSection": "Topic 7.4 Moving the body (pp. 252–258) & Topic 3.4 Turning forces Bridge",
            "tier": "Challenge",
            "commandWord": "Calculate and explain",
            "marks": 4,
            "prompt": "Kym holds a 15 N physics textbook in her hand at a perpendicular distance of 32 cm from her elbow hinge joint. Her biceps tendon attaches to the radius bone 4.0 cm from the elbow pivot. (a) Calculate the clockwise moment of the textbook about her elbow. (b) Calculate the upward force her biceps muscle must exert to hold her forearm horizontal, and state which muscle contracts when she straightens her arm.",
            "workedExample": "(a) Moment of textbook = force × distance from pivot = 15 N × 32 cm = 480 N cm (or 4.8 N m).\n(b) By the principle of moments: F_biceps × 4.0 cm = 480 N cm ⇒ F_biceps = 480 ÷ 4.0 = 120 N. To straighten (extend) her arm, her triceps muscle contracts while her biceps relaxes (antagonistic pair).",
            "fadedPrompt": "(a) Moment of book = 15 N × 32 cm = ________ N cm. (b) Biceps force = 480 ÷ 4.0 = ________ N; to straighten the arm, the ________ muscle contracts while the biceps relaxes.",
            "fadedAnswer": "480; 120; triceps",
            "modelAnswer": "(a) 15 × 32 = 480 N cm (4.8 N m). (b) F_biceps = 480 ÷ 4.0 = 120 N. To straighten the arm, the triceps contracts and the biceps relaxes.",
            "markSchemeKeywords": ["480", "4.8", "120 N", "triceps", "relaxes"],
            "linkedChapter": 3,
            "linkedWidget": "mechanicslab",
        },
        {
            "id": "q-u1-1.2-bridge-alveoli",
            "unitNumber": 1,
            "topicCode": "1.2",
            "sourceBook": "workbook",
            "bookSection": "Workbook 1.2 Gas exchange & Particle Diffusion Bridge (p. 5)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "Use the physics of particle diffusion (Topic 3.7) to explain why oxygen molecules show a net movement from the air inside an alveolus into the red blood cells in the surrounding capillary, and why alveolar walls are only one cell thick.",
            "workedExample": "1. Oxygen gas particles move randomly due to thermal kinetic energy. Because the concentration of oxygen is higher in the inhaled alveolar air than in the deoxygenated blood arriving at the lungs, more oxygen molecules diffuse into the blood than out.\n2. A one-cell-thick wall provides a very short diffusion distance (~0.5 μm), maximising the rate of gas exchange.",
            "fadedPrompt": "Oxygen diffuses from ________ concentration in the alveolus to ________ concentration in the blood across a one-cell-thick wall that keeps the diffusion ________ very short.",
            "fadedAnswer": "higher; lower; distance",
            "modelAnswer": "Oxygen diffuses down its concentration gradient from higher concentration in the alveolar air to lower concentration in the blood. The one-cell-thick wall provides a very short diffusion distance so diffusion happens rapidly.",
            "markSchemeKeywords": ["higher concentration", "lower concentration", "diffusion", "short distance"],
            "linkedChapter": 7,
            "linkedWidget": "pressuretank",
        },
        {
            "id": "q-u1-1.4-bridge-respiration",
            "unitNumber": 1,
            "topicCode": "1.4",
            "sourceBook": "learners_book",
            "bookSection": "Topic 1.4 Aerobic Respiration & Conservation of Energy (pp. 25–30)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "A student writes in an exam: 'Aerobic respiration creates energy in mitochondria from glucose and oxygen.' Explain why a physicist and Cambridge examiner mark the word 'creates' wrong, and state the energy store transfer that actually occurs.",
            "workedExample": "1. By the Law of Conservation of Energy (First Law of Thermodynamics), energy cannot be created or destroyed — it can only be transferred between stores.\n2. In aerobic respiration, chemical potential energy already stored in glucose + oxygen is released/transferred into chemical energy for cellular work (ATP) and thermal energy that warms the body to 37 °C.",
            "fadedPrompt": "Energy cannot be ________ or destroyed. Respiration transfers ________ energy stored in glucose into cellular work and ________ energy.",
            "fadedAnswer": "created / made; chemical; thermal",
            "modelAnswer": "Energy cannot be created or destroyed (conservation of energy). Respiration releases/transfers chemical potential energy stored in glucose into energy for cell processes and thermal energy.",
            "markSchemeKeywords": ["cannot be created", "conservation of energy", "chemical", "transferred", "released", "thermal"],
            "linkedChapter": 5,
            "linkedWidget": "energystores",
        },
        {
            "id": "q-u2-2.3-bridge-variables",
            "unitNumber": 2,
            "topicCode": "2.3",
            "sourceBook": "learners_book",
            "bookSection": "Topic 2.3 Planning a solubility investigation (pp. 53–56) & Ch 0 Measurement",
            "tier": "Practice",
            "commandWord": "Identify and explain",
            "marks": 3,
            "prompt": "Kym investigates how water temperature (20 °C to 80 °C) affects the mass of potassium nitrate that dissolves in 100 cm³ of water. (a) Identify the independent variable, dependent variable, and the most important control variable. (b) State which variable is plotted on the horizontal x-axis and which on the vertical y-axis.",
            "workedExample": "(a) Independent variable (what she changes): temperature of the water (°C). Dependent variable (what she measures): mass of potassium nitrate dissolved (g). Control variable: volume/mass of water (100 cm³).\n(b) Independent variable (temperature in °C) goes on the horizontal x-axis; dependent variable (mass dissolved in g) goes on the vertical y-axis.",
            "fadedPrompt": "Independent variable on the x-axis: ________ (°C). Dependent variable on the y-axis: ________ of solute (g). Control variable: volume of ________ (100 cm³).",
            "fadedAnswer": "temperature; mass; water",
            "modelAnswer": "(a) Independent: temperature of water; Dependent: mass of potassium nitrate dissolved; Control: volume of water (100 cm³). (b) Temperature on the x-axis; mass dissolved on the y-axis.",
            "markSchemeKeywords": ["temperature", "mass", "volume of water", "x-axis", "y-axis"],
            "linkedChapter": 0,
            "linkedWidget": "investigations",
        },
        {
            "id": "q-u7-7.2-bridge-joules",
            "unitNumber": 7,
            "topicCode": "7.2",
            "sourceBook": "workbook",
            "bookSection": "Workbook 7.2 Balanced Diet & Daily Energy Budget in kJ/MJ (pp. 138–143)",
            "tier": "Practice",
            "commandWord": "Calculate and explain",
            "marks": 3,
            "prompt": "An active 12-year-old student transfers 9.6 MJ of energy per day through basal metabolism, schoolwork, and sport. (a) Convert 9.6 MJ into kilojoules (kJ) and into joules (J). (b) Use conservation of energy to explain what happens if her daily food intake provides 11.2 MJ every day.",
            "workedExample": "(a) 1 MJ = 1000 kJ = 1,000,000 J. Therefore, 9.6 MJ = 9600 kJ = 9,600,000 J (9.6 × 10⁶ J).\n(b) By conservation of energy, daily excess chemical energy = 11.2 MJ − 9.6 MJ = 1.6 MJ (1600 kJ) per day. Because energy cannot vanish, the body stores this surplus chemical energy in adipose (fat) tissue, increasing body mass.",
            "fadedPrompt": "(a) 9.6 MJ = ________ kJ = 9.6 × 10⁶ J. (b) The extra 1.6 MJ per day is stored as ________ energy in fat tissue.",
            "fadedAnswer": "9600; chemical",
            "modelAnswer": "(a) 9600 kJ (or 9,600,000 J). (b) By conservation of energy, the surplus 1.6 MJ (1600 kJ) per day is stored as chemical potential energy in fat tissue, so body mass increases.",
            "markSchemeKeywords": ["9600 kJ", "9,600,000", "surplus", "stored", "fat", "chemical"],
            "linkedChapter": 5,
            "linkedWidget": "energystores",
        },
        {
            "id": "q-u9-9.2-lb-compass",
            "unitNumber": 9,
            "topicCode": "9.2",
            "sourceBook": "learners_book",
            "bookSection": "Topic 9.2 The Earth as a giant magnet — Navigation & Core (pp. 300–305)",
            "tier": "Practice",
            "commandWord": "Explain",
            "marks": 3,
            "prompt": "(a) Explain why the casing of a magnetic navigation compass is made of brass, aluminium, or plastic rather than steel. (b) If you hold a bar magnet close to a magnetic compass, why does the compass needle stop pointing toward Geographic North?",
            "workedExample": "(a) Brass, aluminium, and plastic are non-magnetic materials, so they do not shield or distort Earth's magnetic field or attract the compass needle. Steel is a magnetic material that would become magnetised and deflect the needle.\n(b) The magnetic field close to a bar magnet is much stronger than Earth's weak magnetic field (~45 μT), so the compass needle aligns with the strong local field of the bar magnet instead.",
            "fadedPrompt": "(a) Brass and plastic are ________-magnetic materials, whereas steel is magnetic and would deflect the needle. (b) A nearby bar magnet has a much ________ magnetic field than the Earth.",
            "fadedAnswer": "non; stronger",
            "modelAnswer": "(a) Brass, aluminium, and plastic are non-magnetic and do not affect the compass needle, whereas steel is magnetic and would attract the needle. (b) The nearby bar magnet produces a much stronger magnetic field than Earth's weak field.",
            "markSchemeKeywords": ["non-magnetic", "steel is magnetic", "stronger magnetic field", "Earth"],
            "linkedChapter": 13,
            "linkedWidget": "magnetometer",
        },
        {
            "id": "q-u3-cyp-synthesis",
            "unitNumber": 3,
            "topicCode": "3.4",
            "sourceBook": "learners_book",
            "bookSection": "Unit 3 Check your progress — Multi-step Synthesis (pp. 122–125)",
            "tier": "Challenge",
            "commandWord": "Calculate",
            "marks": 4,
            "prompt": "A metre rule of length 100 cm is pivoted at its centre (the 50 cm mark). A 6.0 N weight hangs at the 10 cm mark on the left, and a 4.0 N weight hangs at the 80 cm mark on the right. (a) Calculate the distance of each weight from the 50 cm pivot. (b) Calculate the anticlockwise and clockwise moments and state which way the rule tips.",
            "workedExample": "(a) Watch the trap! Always measure distance from the 50 cm PIVOT:\n• Left weight (6.0 N at 10 cm mark): d₁ = 50 cm − 10 cm = 40 cm (0.40 m) from pivot.\n• Right weight (4.0 N at 80 cm mark): d₂ = 80 cm − 50 cm = 30 cm (0.30 m) from pivot.\n(b) Anticlockwise moment = 6.0 N × 40 cm = 240 N cm (2.4 N m).\nClockwise moment = 4.0 N × 30 cm = 120 N cm (1.2 N m).\nBecause the anticlockwise moment (240 N cm) is greater than the clockwise moment (120 N cm), the rule tips anticlockwise (left side goes down).",
            "fadedPrompt": "(a) Distances from the 50 cm pivot are d₁ = 50 − 10 = ________ cm and d₂ = 80 − 50 = ________ cm. (b) Anticlockwise moment = 6 × 40 = ________ N cm; clockwise moment = 4 × 30 = 120 N cm, so it tips ________.",
            "fadedAnswer": "40; 30; 240; anticlockwise",
            "modelAnswer": "(a) Left distance from pivot = 50 − 10 = 40 cm; right distance = 80 − 50 = 30 cm. (b) Anticlockwise moment = 6.0 × 40 = 240 N cm; clockwise moment = 4.0 × 30 = 120 N cm. The rule tips anticlockwise (to the left).",
            "markSchemeKeywords": ["40 cm", "30 cm", "240", "120", "anticlockwise"],
            "linkedChapter": 3,
            "linkedWidget": "mechanicslab",
        },
        {
            "id": "q-u6-cyp-synthesis",
            "unitNumber": 6,
            "topicCode": "6.6",
            "sourceBook": "workbook",
            "bookSection": "Workbook 6.6 Rocks in space & Unit 6 Check your progress (pp. 129–133)",
            "tier": "Challenge",
            "commandWord": "Explain",
            "marks": 4,
            "prompt": "Explain two reasons why the Moon's surface is covered in thousands of visible asteroid impact craters whereas Earth (which is right next to the Moon and has stronger gravity) has very few visible craters.",
            "workedExample": "1. Atmosphere: Earth has a thick atmosphere; smaller asteroids (meteoroids) experience huge air resistance and friction as they enter Earth's atmosphere at high speed, heating up and burning away before hitting the ground. The Moon has no atmosphere.\n2. Weathering, erosion & plate tectonics: On Earth, wind, rain, rivers, oceans, plant growth, and tectonic crust recycling erode or bury old craters over millions of years. The Moon has no liquid water, wind, or weather to erase craters.",
            "fadedPrompt": "1. Earth's thick ________ burns up small asteroids by friction, whereas the Moon has no atmosphere. 2. On Earth, wind, water ________, and tectonic activity wear away old craters.",
            "fadedAnswer": "atmosphere; erosion / weathering",
            "modelAnswer": "1. Earth has an atmosphere where air resistance/friction burns up most small rocks before impact, whereas the Moon has no atmosphere. 2. On Earth, weathering, erosion by water/wind, and geological activity wear away or cover craters over time.",
            "markSchemeKeywords": ["atmosphere", "burn up", "friction", "erosion", "weathering", "no atmosphere"],
            "linkedChapter": 14,
            "linkedWidget": "cannon3d",
        },
    ]


def build_diagram_recall_plates():
    """
    24 Physics Diagram Recall Plates combining Cambridge Science 8 (Units 3, 6, 9 + Bridges)
    and The Moving World (Ch 0-15) with normalized (x, y) callout pin coordinates for the
    3-tier Apple Pencil Fading Scaffold (Label Only -> Ghost Scaffold -> Blank Recall).
    """
    return [
        {
            "id": "plate-u3-free-body",
            "title": "Balanced & Unbalanced Force Diagram on a Moving Cyclist",
            "sourceRef": "Learner's Book 8 · Topic 3.1 (p. 70) & Moving World Ch 2",
            "unitNumber": 3,
            "chapter": 2,
            "figureId": "c2_free_body_cyclist",
            "aspectRatio": 1.35,
            "callouts": [
                {"id": "thrust", "label": "Forward driving force (thrust from tyres)", "x": 0.74, "y": 0.48, "hint": "Forward horizontal arrow pushing the bicycle ahead"},
                {"id": "drag", "label": "Air resistance & friction (opposing motion)", "x": 0.22, "y": 0.48, "hint": "Backward horizontal arrow opposing velocity"},
                {"id": "weight", "label": "Weight (gravitational pull of Earth downward, W = mg)", "x": 0.48, "y": 0.84, "hint": "Downward vertical arrow from centre of mass"},
                {"id": "normal", "label": "Normal contact force from road upward", "x": 0.48, "y": 0.16, "hint": "Upward support arrow equal and opposite to weight on flat ground"},
            ],
        },
        {
            "id": "plate-u3-distance-time",
            "title": "Distance–Time Graph Stages (Constant Speed, Stationary, Accelerating)",
            "sourceRef": "Learner's Book 8 · Topic 3.3 (p. 86) & Moving World Ch 1",
            "unitNumber": 3,
            "chapter": 1,
            "figureId": "c1_distance_time_stages",
            "aspectRatio": 1.4,
            "callouts": [
                {"id": "steady-slow", "label": "Constant speed (straight line, moderate gradient = Δd ÷ Δt)", "x": 0.26, "y": 0.62, "hint": "First sloping straight segment"},
                {"id": "stationary", "label": "Stationary / at rest (horizontal flat line, gradient = 0 m/s)", "x": 0.50, "y": 0.46, "hint": "Flat horizontal plateau where time passes at constant distance"},
                {"id": "steady-fast", "label": "Higher constant speed (steeper straight gradient)", "x": 0.72, "y": 0.26, "hint": "Steeper upward straight segment covering more distance per second"},
                {"id": "axes", "label": "Time on horizontal x-axis (s); Distance on vertical y-axis (m)", "x": 0.82, "y": 0.86, "hint": "Standard axis placement for a motion graph"},
            ],
        },
        {
            "id": "plate-u3-moments-seesaw",
            "title": "Principle of Moments on a Balanced Beam & Pivot",
            "sourceRef": "Learner's Book 8 · Topic 3.4 (p. 93) & Moving World Ch 3",
            "unitNumber": 3,
            "chapter": 3,
            "figureId": "c3_moments_balance",
            "aspectRatio": 1.45,
            "callouts": [
                {"id": "pivot", "label": "Pivot (fulcrum — fixed point of rotation)", "x": 0.50, "y": 0.66, "hint": "Central triangular support under the beam"},
                {"id": "d1", "label": "Perpendicular distance d₁ from pivot to left force", "x": 0.30, "y": 0.42, "hint": "Horizontal ruler distance from pivot to F₁"},
                {"id": "acw", "label": "Anticlockwise moment = F₁ × d₁ (N m)", "x": 0.20, "y": 0.74, "hint": "Turning effect tending to rotate the left end downward"},
                {"id": "cw", "label": "Clockwise moment = F₂ × d₂ (equals F₁ × d₁ when balanced)", "x": 0.80, "y": 0.74, "hint": "Turning effect tending to rotate the right end downward"},
            ],
        },
        {
            "id": "plate-u3-pressure-depth",
            "title": "Hydrostatic Liquid Pressure & Gas Particle Wall Collisions",
            "sourceRef": "Learner's Book 8 · Topic 3.6 (p. 107) & Moving World Ch 6",
            "unitNumber": 3,
            "chapter": 6,
            "figureId": "c6_spouting_can_gas",
            "aspectRatio": 1.35,
            "callouts": [
                {"id": "top-jet", "label": "Top hole: shallow depth → lowest water pressure → shortest jet", "x": 0.36, "y": 0.32, "hint": "Least weight of water above this level"},
                {"id": "bottom-jet", "label": "Bottom hole: greatest depth → highest pressure (P = ρgh) → farthest jet", "x": 0.44, "y": 0.78, "hint": "Greatest weight of water column above this level"},
                {"id": "wall-collision", "label": "Gas particle colliding with container wall (exerts outward force)", "x": 0.78, "y": 0.48, "hint": "Microscopic origin of gas pressure P = F ÷ A"},
            ],
        },
        {
            "id": "plate-u6-reflection-ray",
            "title": "Law of Reflection in a Plane Mirror",
            "sourceRef": "Learner's Book 8 · Topic 6.1 (p. 191) & Moving World Ch 10",
            "unitNumber": 6,
            "chapter": 10,
            "figureId": "c10_plane_mirror_law",
            "aspectRatio": 1.4,
            "callouts": [
                {"id": "mirror", "label": "Plane mirror (with hatching on non-reflective back)", "x": 0.50, "y": 0.82, "hint": "Flat reflecting surface"},
                {"id": "normal", "label": "Normal (dashed line at 90° perpendicular to mirror)", "x": 0.50, "y": 0.28, "hint": "Reference line from which all optical angles are measured"},
                {"id": "incident", "label": "Incident ray (with arrow pointing toward mirror, angle i)", "x": 0.26, "y": 0.48, "hint": "Incoming light ray from source"},
                {"id": "reflected", "label": "Reflected ray (with arrow leaving mirror, angle r = i)", "x": 0.74, "y": 0.48, "hint": "Outgoing light ray obeying angle of reflection = angle of incidence"},
            ],
        },
        {
            "id": "plate-u6-refraction-block",
            "title": "Refraction of Light Through a Rectangular Glass Block",
            "sourceRef": "Learner's Book 8 · Topic 6.2 (p. 199) & Moving World Ch 10",
            "unitNumber": 6,
            "chapter": 10,
            "figureId": "c10_glass_block_refraction",
            "aspectRatio": 1.4,
            "callouts": [
                {"id": "air-to-glass", "label": "Air → Glass: light slows down and bends TOWARD the normal (r < i)", "x": 0.34, "y": 0.36, "hint": "Entry boundary into optically denser medium"},
                {"id": "refracted-ray", "label": "Refracted ray travelling slower inside the glass block", "x": 0.50, "y": 0.52, "hint": "Path through the transparent block"},
                {"id": "glass-to-air", "label": "Glass → Air: light speeds up and bends AWAY from the normal", "x": 0.66, "y": 0.68, "hint": "Exit boundary into optically less dense air"},
                {"id": "emergent", "label": "Emergent ray (parallel to original incident ray)", "x": 0.80, "y": 0.82, "hint": "Final ray leaving parallel-sided block"},
            ],
        },
        {
            "id": "plate-u6-prism-dispersion",
            "title": "Dispersion of White Light by a Triangular Glass Prism",
            "sourceRef": "Learner's Book 8 · Topic 6.3 (p. 205) & Moving World Ch 10",
            "unitNumber": 6,
            "chapter": 10,
            "figureId": "c10_prism_dispersion",
            "aspectRatio": 1.45,
            "callouts": [
                {"id": "white-beam", "label": "Incident narrow beam of white light (mixture of all wavelengths)", "x": 0.20, "y": 0.58, "hint": "Incoming polychromatic ray"},
                {"id": "prism", "label": "Triangular glass prism (refracts light at both surfaces)", "x": 0.46, "y": 0.54, "hint": "Dispersive optical element"},
                {"id": "red-top", "label": "Red light (longest wavelength ~700 nm, slows least, refracted LEAST)", "x": 0.78, "y": 0.36, "hint": "Top band of the visible spectrum"},
                {"id": "violet-bottom", "label": "Violet light (shortest wavelength ~400 nm, slows most, refracted MOST)", "x": 0.78, "y": 0.74, "hint": "Bottom band of the visible spectrum"},
            ],
        },
        {
            "id": "plate-u6-rgb-addition",
            "title": "Additive Mixing of Red, Green & Blue Light",
            "sourceRef": "Learner's Book 8 · Topic 6.4 (p. 210) & Moving World Ch 10",
            "unitNumber": 6,
            "chapter": 10,
            "figureId": "c10_rgb_venn",
            "aspectRatio": 1.25,
            "callouts": [
                {"id": "yellow", "label": "Yellow (Red + Green light overlap)", "x": 0.50, "y": 0.32, "hint": "Stimulates both L-red and M-green retinal cones"},
                {"id": "cyan", "label": "Cyan (Green + Blue light overlap)", "x": 0.64, "y": 0.58, "hint": "Secondary colour complementary to red"},
                {"id": "magenta", "label": "Magenta (Red + Blue light overlap)", "x": 0.36, "y": 0.58, "hint": "Secondary colour complementary to green"},
                {"id": "white", "label": "White light (Red + Green + Blue all overlap at centre)", "x": 0.50, "y": 0.50, "hint": "All three primary light colours combined"},
            ],
        },
        {
            "id": "plate-u9-bar-magnet",
            "title": "Magnetic Field Lines Around a Bar Magnet & Between Poles",
            "sourceRef": "Learner's Book 8 · Topic 9.1 (p. 295) & Moving World Ch 13",
            "unitNumber": 9,
            "chapter": 13,
            "figureId": "c13_bar_magnet_field",
            "aspectRatio": 1.45,
            "callouts": [
                {"id": "north-pole", "label": "North pole (field lines emerge outward; crowded = strong field)", "x": 0.30, "y": 0.50, "hint": "Arrows point away from this pole"},
                {"id": "south-pole", "label": "South pole (field lines curve inward; crowded = strong field)", "x": 0.70, "y": 0.50, "hint": "Arrows point toward this pole"},
                {"id": "field-loop", "label": "Magnetic field line (continuous curve from N → S, never crosses)", "x": 0.50, "y": 0.20, "hint": "Direction shows where a free North compass pole points"},
                {"id": "neutral-point", "label": "Neutral point between repelling like poles (zero net magnetic field)", "x": 0.50, "y": 0.82, "hint": "Region where opposing fields cancel out"},
            ],
        },
        {
            "id": "plate-u9-earth-magnet",
            "title": "Earth's Dipolar Magnetic Field & Outer Core Dynamo",
            "sourceRef": "Learner's Book 8 · Topic 9.2 (p. 301) & Moving World Ch 13",
            "unitNumber": 9,
            "chapter": 13,
            "figureId": "c13_earth_dipole",
            "aspectRatio": 1.3,
            "callouts": [
                {"id": "geo-north", "label": "Geographic North Pole (lies near a MAGNETIC SOUTH pole!)", "x": 0.50, "y": 0.14, "hint": "Field lines point inward here, attracting the N-tip of a compass"},
                {"id": "outer-core", "label": "Convecting liquid iron & nickel outer core (generates the field)", "x": 0.50, "y": 0.50, "hint": "Geodynamo currents deep inside Earth"},
                {"id": "geo-south", "label": "Geographic South Pole (lies near a magnetic north pole)", "x": 0.50, "y": 0.86, "hint": "Field lines emerge outward from the southern hemisphere"},
            ],
        },
        {
            "id": "plate-u9-electromagnet",
            "title": "Solenoid Electromagnet with Soft Iron Core & Ammeter Circuit",
            "sourceRef": "Learner's Book 8 · Topics 9.3–9.4 (pp. 307–312) & Moving World Ch 13",
            "unitNumber": 9,
            "chapter": 13,
            "figureId": "c13_electromagnet_circuit",
            "aspectRatio": 1.4,
            "callouts": [
                {"id": "iron-core", "label": "Soft iron core (magnetises strongly with current, demagnetises when off)", "x": 0.50, "y": 0.44, "hint": "Temporary magnetic core inside the coil"},
                {"id": "coil-turns", "label": "Insulated wire coil / solenoid (more turns → stronger magnetic field)", "x": 0.50, "y": 0.58, "hint": "Current-carrying loops around the core"},
                {"id": "ammeter", "label": "Ammeter in series (measures electric current I in amps)", "x": 0.24, "y": 0.34, "hint": "Instrument used to control or vary current accurately"},
                {"id": "switch-cell", "label": "Variable power supply & switch (switches magnetic field ON and OFF)", "x": 0.76, "y": 0.34, "hint": "Drives current round the circuit"},
            ],
        },
        {
            "id": "plate-ch14-seasons-phases",
            "title": "Earth's 23.4° Axial Tilt, Solstices & Lunar Phases",
            "sourceRef": "The Moving World · Ch 14 (figs c14_seasons_tilt & c14_lunar_phases)",
            "unitNumber": 6,
            "chapter": 14,
            "figureId": "c14_seasons_tilt",
            "aspectRatio": 1.45,
            "callouts": [
                {"id": "june-solstice", "label": "June solstice: Northern hemisphere tilted 23.4° toward Sun (higher solar altitude)", "x": 0.22, "y": 0.46, "hint": "Solar rays strike northern latitudes more directly (summer)"},
                {"id": "dec-solstice", "label": "December solstice: Northern hemisphere tilted away from Sun (rays spread over larger area)", "x": 0.78, "y": 0.46, "hint": "Shorter daylight hours and lower solar angle in northern winter"},
                {"id": "fixed-axis", "label": "Earth's spin axis stays pointed toward Polaris all year round", "x": 0.50, "y": 0.18, "hint": "Seasons are caused by axial tilt, NOT changing distance from the Sun!"},
            ],
        },
    ]


def bundle_moving_world_book():
    """
    Copies index.html, sw.js, manifest.webmanifest, live/, assets/, and exams/
    into KymPhysics/KymPhysics/Resources/MovingWorldBook/ so WKWebView can load
    the entire interactive textbook + 45 simulations + 4 Explorers 100% offline.
    """
    if BOOK_BUNDLE_DIR.exists():
        shutil.rmtree(BOOK_BUNDLE_DIR)
    BOOK_BUNDLE_DIR.mkdir(parents=True, exist_ok=True)

    for fname in ["index.html", "sw.js", "manifest.webmanifest"]:
        src = ROOT / fname
        if src.exists():
            shutil.copy2(src, BOOK_BUNDLE_DIR / fname)

    for folder in ["live", "assets", "exams"]:
        src_dir = ROOT / folder
        if src_dir.exists():
            shutil.copytree(src_dir, BOOK_BUNDLE_DIR / folder)


def main():
    PACK_DIR.mkdir(parents=True, exist_ok=True)

    chapters = parse_chapters()
    stories = parse_stories()
    investigations = parse_investigations()
    widgets = parse_widgets()
    explorers = build_explorers()
    exam_banks = parse_exam_banks()
    bridges = build_cross_disciplinary_bridges()
    school_textbook = build_school_science_textbook()
    school_questions = build_school_questions()
    diagram_plates = build_diagram_recall_plates()

    pack = {
        "schemaVersion": 1,
        "packId": "kymphysics-seed-pack-v1",
        "generatedBy": "source/export_kymphysics_pack.py",
        "volumes": list(VOLUME_META.values()),
        "chapters": chapters,
        "stories": stories,
        "explorers": explorers,
        "investigations": investigations,
        "widgets": widgets,
        "examBanks": exam_banks,
        "crossDisciplinaryBridges": bridges,
        "schoolTextbook": school_textbook,
        "schoolQuestions": school_questions,
        "diagramPlates": diagram_plates,
    }

    out_path = PACK_DIR / "kymphysics-seed-pack.json"
    out_path.write_text(json.dumps(pack, indent=2, ensure_ascii=False), encoding="utf-8")

    bundle_moving_world_book()

    total_exam_qs = sum(len(b["questions"]) for b in exam_banks)
    total_exam_cards = sum(len(b["cards"]) for b in exam_banks)

    print(
        f"Exported KymPhysics seed pack to {out_path}:\n"
        f"  - {len(chapters)} Moving World chapters across {len(VOLUME_META)} volumes\n"
        f"  - {len(stories)} historical & everyday physics stories\n"
        f"  - {len(explorers)} Front-Matter Explorers\n"
        f"  - {len(investigations)} structured investigations & 3D Atlas lessons\n"
        f"  - {len(widgets)} interactive simulations with Watch/Cutaway/Challenges\n"
        f"  - {len(exam_banks)} chapter exam banks ({total_exam_qs} exam questions, {total_exam_cards} flashcards)\n"
        f"  - {len(school_textbook['units'])} Cambridge Science 8 units ({sum(len(u['topics']) for u in school_textbook['units'])} sub-topics)\n"
        f"  - {len(school_questions)} pre-seeded Learner's Book & Workbook Proof questions\n"
        f"  - {len(bridges)} Chemistry & Biology First-Principles Bridges\n"
        f"  - {len(diagram_plates)} Apple Pencil Physics Diagram Recall plates"
    )


if __name__ == "__main__":
    main()
