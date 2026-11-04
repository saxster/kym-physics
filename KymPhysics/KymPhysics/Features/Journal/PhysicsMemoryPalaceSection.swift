import SwiftUI

/// Mumbai Physics Memory Palace (`../kym_tutor/Features/Palace/PalaceWalkthroughView.swift` adapted for Grade 8 Physics):
/// Spatial method-of-loci walkthroughs anchored in Kym's everyday Mumbai landmarks.
enum PhysicsMemoryPalaceCatalog {
    enum ScaffoldingStage: Int, CaseIterable, Identifiable, Sendable {
        case fullLoci = 0
        case cueOnly = 1
        case transferRecall = 2

        var id: Int { rawValue }

        var title: String {
            switch self {
            case .fullLoci: return "1. Full Loci & Physics Law"
            case .cueOnly: return "2. Mumbai Landmark Cue Only"
            case .transferRecall: return "3. Blank Order Recall"
            }
        }
    }

    struct LocusStop: Identifiable, Sendable, Equatable {
        let id: String
        let orderIndex: Int
        let landmarkName: String
        let sensoryCue: String
        let physicsConcept: String
        let quantitativeFact: String
        let normalizedPoint: CGPoint
    }

    struct Palace: Identifiable, Sendable, Equatable {
        let id: String
        let title: String
        let mumbaiRoute: String
        let topicRef: String
        let summary: String
        let stops: [LocusStop]
    }

    static let allPalaces: [Palace] = [
        // 1. Marine Drive Promenade — Electromagnetic Spectrum
        Palace(
            id: "palace-marine-drive-em",
            title: "Marine Drive Promenade · The 7 Electromagnetic Wave Regions",
            mumbaiRoute: "Walk north along the Queen's Necklace from Nariman Point to Girgaon Chowpatty (Long λ → Short λ, Low f → High f)",
            topicRef: "Moving World Ch 11 · Ladder of Light",
            summary: "All 7 regions travel at c = 3 × 10⁸ m/s in vacuum and obey c = f × λ. Walking north from Nariman Point shrinks wavelength λ and boosts frequency f and photon energy.",
            stops: [
                LocusStop(
                    id: "em-1",
                    orderIndex: 1,
                    landmarkName: "1. Nariman Point Radio Mast",
                    sensoryCue: "Giant coastal broadcast tower humming in the sea breeze",
                    physicsConcept: "Radio Waves (Longest wavelength, Lowest frequency)",
                    quantitativeFact: "λ > 0.1 m (up to km) · Used for FM/AM broadcasting and radar",
                    normalizedPoint: CGPoint(x: 0.14, y: 0.82)
                ),
                LocusStop(
                    id: "em-2",
                    orderIndex: 2,
                    landmarkName: "2. Oberoi Trident Rooftop 5G Dish",
                    sensoryCue: "Steaming masala chai warmed in a microwave oven by the promenade",
                    physicsConcept: "Microwaves",
                    quantitativeFact: "λ ≈ 1 mm to 10 cm · Absorbed by water molecules & used for satellite links",
                    normalizedPoint: CGPoint(x: 0.24, y: 0.70)
                ),
                LocusStop(
                    id: "em-3",
                    orderIndex: 3,
                    landmarkName: "3. Warm Tetrapod Concrete Boulders",
                    sensoryCue: "Sun-baked sea-wall tetrapods radiating invisible evening warmth",
                    physicsConcept: "Infrared (IR) Radiation",
                    quantitativeFact: "λ ≈ 700 nm to 1 mm · Emitted by all warm objects; thermal imaging & remotes",
                    normalizedPoint: CGPoint(x: 0.36, y: 0.56)
                ),
                LocusStop(
                    id: "em-4",
                    orderIndex: 4,
                    landmarkName: "4. Queen's Necklace Golden Streetlights",
                    sensoryCue: "Dazzling arc of visible colours from sunset Red (700 nm) to Violet (400 nm)",
                    physicsConcept: "Visible Light (ROYGBIV)",
                    quantitativeFact: "λ = 400 nm (Violet) to 700 nm (Red) · The narrow band human retinas detect",
                    normalizedPoint: CGPoint(x: 0.50, y: 0.44)
                ),
                LocusStop(
                    id: "em-5",
                    orderIndex: 5,
                    landmarkName: "5. Wankhede Stadium Floodlight Glow",
                    sensoryCue: "Fluorescent white cricket shirts glowing bright violet-blue under UV lamps",
                    physicsConcept: "Ultraviolet (UV)",
                    quantitativeFact: "λ ≈ 10 nm to 400 nm · Causes fluorescence, vitamin D synthesis & sunburn",
                    normalizedPoint: CGPoint(x: 0.64, y: 0.34)
                ),
                LocusStop(
                    id: "em-6",
                    orderIndex: 6,
                    landmarkName: "6. Saifee Hospital Diagnostic Arch",
                    sensoryCue: "Glass-fronted hospital overlooking Charni Road showing white bone radiographs",
                    physicsConcept: "X-Rays",
                    quantitativeFact: "λ ≈ 0.01 nm to 10 nm · High-frequency ionising waves transmitted by soft tissue, absorbed by bone",
                    normalizedPoint: CGPoint(x: 0.78, y: 0.24)
                ),
                LocusStop(
                    id: "em-7",
                    orderIndex: 7,
                    landmarkName: "7. Chowpatty Cosmic Ray Beacon",
                    sensoryCue: "Supernova lightning burst high above Malabar Hill",
                    physicsConcept: "Gamma Rays (Shortest wavelength, Highest frequency)",
                    quantitativeFact: "λ < 0.01 nm · Emitted by radioactive nuclei & cosmic events; medical radiotherapy",
                    normalizedPoint: CGPoint(x: 0.88, y: 0.16)
                )
            ]
        ),

        // 2. Western Line — Prism Dispersion & Colour Filters (Unit 6.3–6.4)
        Palace(
            id: "palace-western-line-dispersion",
            title: "Churchgate → Bandra Fast Local · Prism Dispersion & RGB Colour Filters",
            mumbaiRoute: "7 stations along the Western Line mapping the exact refraction order of white light through a glass prism",
            topicRef: "School Unit 6.3 & 6.4 · Moving World Ch 10",
            summary: "White light is a mixture of 7 spectrum colours. In glass, Red light slows down the least (refracted through the smallest angle at the top of the spectrum) while Violet light slows down the most (refracted through the largest angle at the bottom).",
            stops: [
                LocusStop(
                    id: "disp-1",
                    orderIndex: 1,
                    landmarkName: "1. Churchgate Red Brick Facade",
                    sensoryCue: "Crimson heritage dome at the southern terminus — bends the LEAST",
                    physicsConcept: "Red (Longest visible λ ≈ 700 nm · Fastest in glass · Least refracted)",
                    quantitativeFact: "Primary additive colour (R). A red filter transmits ONLY red light and absorbs G & B.",
                    normalizedPoint: CGPoint(x: 0.15, y: 0.20)
                ),
                LocusStop(
                    id: "disp-2",
                    orderIndex: 2,
                    landmarkName: "2. Marine Lines Marigold Garland Stall",
                    sensoryCue: "Bright orange marigold strings outside the footbridge",
                    physicsConcept: "Orange (Second in spectrum order)",
                    quantitativeFact: "Refracted slightly more than Red as wave speed in glass decreases.",
                    normalizedPoint: CGPoint(x: 0.27, y: 0.30)
                ),
                LocusStop(
                    id: "disp-3",
                    orderIndex: 3,
                    landmarkName: "3. Charni Road Kaali-Peeli Taxi Roof",
                    sensoryCue: "Row of vivid yellow taxi roofs gleaming in the sun",
                    physicsConcept: "Yellow (Red + Green additive mix)",
                    quantitativeFact: "In RGB light addition, Red light + Green light overlapping on a white screen makes Yellow.",
                    normalizedPoint: CGPoint(x: 0.39, y: 0.40)
                ),
                LocusStop(
                    id: "disp-4",
                    orderIndex: 4,
                    landmarkName: "4. Mahalaxmi Racecourse Emerald Turf",
                    sensoryCue: "Lush green grass oval right beside the tracks",
                    physicsConcept: "Green (λ ≈ 530 nm · Middle of the visible spectrum)",
                    quantitativeFact: "Primary additive colour (G). Green grass looks black under pure red light because it absorbs red!",
                    normalizedPoint: CGPoint(x: 0.51, y: 0.50)
                ),
                LocusStop(
                    id: "disp-5",
                    orderIndex: 5,
                    landmarkName: "5. Worli Sea-Face Arabian Blue Horizon",
                    sensoryCue: "Deep blue sea spray visible from the bridge",
                    physicsConcept: "Blue (λ ≈ 470 nm · Primary additive colour B)",
                    quantitativeFact: "Refracted much more strongly than red or green; Red + Green + Blue = White light.",
                    normalizedPoint: CGPoint(x: 0.63, y: 0.62)
                ),
                LocusStop(
                    id: "disp-6",
                    orderIndex: 6,
                    landmarkName: "6. Dadar Indigo Denim Market",
                    sensoryCue: "Stacks of deep indigo fabric beside Platform 1",
                    physicsConcept: "Indigo (Between Blue and Violet)",
                    quantitativeFact: "High refractive index n in crown glass bends indigo sharply toward the prism base.",
                    normalizedPoint: CGPoint(x: 0.75, y: 0.73)
                ),
                LocusStop(
                    id: "disp-7",
                    orderIndex: 7,
                    landmarkName: "7. Bandra Worli Sea Link Violet Twilight",
                    sensoryCue: "Violet LED cable stays bending sharply down to the water — bends the MOST",
                    physicsConcept: "Violet (Shortest visible λ ≈ 400 nm · Slowest in glass · Most refracted)",
                    quantitativeFact: "Exam golden rule: Violet slows down the most on entering glass, so it refracts through the largest angle!",
                    normalizedPoint: CGPoint(x: 0.87, y: 0.84)
                )
            ]
        ),

        // 3. Nehru Science Centre Worli — Energy Stores & Transfers
        Palace(
            id: "palace-nehru-energy",
            title: "Nehru Science Centre (Worli) · 6 Core Energy Stores & Conservation",
            mumbaiRoute: "Walk through the outdoor Energy Park & indoor galleries at Worli",
            topicRef: "Moving World Ch 5 · Conservation of Energy",
            summary: "Energy cannot be created or destroyed — only transferred between stores via Mechanical work, Electrical current, Heating, or Radiation (light/sound).",
            stops: [
                LocusStop(
                    id: "en-1",
                    orderIndex: 1,
                    landmarkName: "1. Outdoor Giant Roller Coaster Loop",
                    sensoryCue: "Steel ball perched high at the top of the track before release",
                    physicsConcept: "Gravitational Potential Store (E_p = m g h)",
                    quantitativeFact: "Doubling height h doubles E_p; transferred to Kinetic store as the ball descends.",
                    normalizedPoint: CGPoint(x: 0.18, y: 0.25)
                ),
                LocusStop(
                    id: "en-2",
                    orderIndex: 2,
                    landmarkName: "2. Bottom of the Valley Speed Trap",
                    sensoryCue: "Ball whistling past the photogate at maximum speed",
                    physicsConcept: "Kinetic Energy Store (E_k = ½ m v²)",
                    quantitativeFact: "Because speed v is squared, doubling speed quadruples kinetic energy (4× braking distance!).",
                    normalizedPoint: CGPoint(x: 0.34, y: 0.65)
                ),
                LocusStop(
                    id: "en-3",
                    orderIndex: 3,
                    landmarkName: "3. Giant Coiled Trampoline Spring",
                    sensoryCue: "Heavy steel spring compressing at the end of the track",
                    physicsConcept: "Elastic Potential Store (F = k x, E_e = ½ k x²)",
                    quantitativeFact: "Stored whenever an elastic object is stretched, squashed, or twisted within its limit of proportionality.",
                    normalizedPoint: CGPoint(x: 0.50, y: 0.35)
                ),
                LocusStop(
                    id: "en-4",
                    orderIndex: 4,
                    landmarkName: "4. Battery & Solar Cell Pavilion",
                    sensoryCue: "Lead-acid batteries and glucose snack bars in the cafeteria",
                    physicsConcept: "Chemical Energy Store",
                    quantitativeFact: "Stored in chemical bonds of fuels, food, and batteries; transferred by electrical current or respiration.",
                    normalizedPoint: CGPoint(x: 0.68, y: 0.68)
                ),
                LocusStop(
                    id: "en-5",
                    orderIndex: 5,
                    landmarkName: "5. Electromagnet Crane Exhibit",
                    sensoryCue: "Copper coil lifting scrap iron discs when the 12 V switch closes",
                    physicsConcept: "Magnetic & Electrostatic Field Stores (Unit 9.1–9.3)",
                    quantitativeFact: "Repelling north poles or attracting opposite charges store potential energy in the invisible field.",
                    normalizedPoint: CGPoint(x: 0.84, y: 0.30)
                )
            ]
        ),

        // 4. Gateway of India — Cosmic Distance Ladder
        Palace(
            id: "palace-gateway-cosmos",
            title: "Gateway of India (Apollo Bunder) · Powers-of-Ten Cosmic Ladder",
            mumbaiRoute: "Zoom outward from a raindrop on the basalt arch to the Milky Way Galaxy",
            topicRef: "Unit 9.4 · Moving World Ch 0, Ch 14 & Ch 15",
            summary: "Every step up the cosmic ladder multiplies length scale by powers of ten, linking atomic nuclei to planetary magnetic shields and galaxies.",
            stops: [
                LocusStop(
                    id: "cos-1",
                    orderIndex: 1,
                    landmarkName: "1. Basalt Crystal Atom in the Gateway Arch",
                    sensoryCue: "Iron and silicon atoms locked in the yellow Kharodi basalt stone",
                    physicsConcept: "Atomic Scale (10⁻¹⁰ m = 0.1 nm)",
                    quantitativeFact: "Unpaired electron spins in iron (Fe) atoms align in domains to create ferromagnetism (Unit 9.1).",
                    normalizedPoint: CGPoint(x: 0.16, y: 0.78)
                ),
                LocusStop(
                    id: "cos-2",
                    orderIndex: 2,
                    landmarkName: "2. The 26-Metre Gateway Archway",
                    sensoryCue: "Standing beneath the central dome looking out at Mumbai Harbour",
                    physicsConcept: "Human & Architectural Scale (10⁰ m to 10¹ m)",
                    quantitativeFact: "1 m is our base SI unit of length; sound at 340 m/s crosses the arch in ~0.08 s.",
                    normalizedPoint: CGPoint(x: 0.38, y: 0.58)
                ),
                LocusStop(
                    id: "cos-3",
                    orderIndex: 3,
                    landmarkName: "3. Earth's Outer Core Dynamo Beneath Our Feet",
                    sensoryCue: "Convecting liquid iron 3,000 km below Mumbai generating Earth's magnetic shield",
                    physicsConcept: "Planetary Scale (R_Earth ≈ 6.4 × 10⁶ m) · Unit 9.2",
                    quantitativeFact: "Earth's geographic North Pole is actually a magnetic SOUTH pole — that's why a compass N-pole points north!",
                    normalizedPoint: CGPoint(x: 0.62, y: 0.40)
                ),
                LocusStop(
                    id: "cos-4",
                    orderIndex: 4,
                    landmarkName: "4. Sun–Earth Orbit & The Milky Way",
                    sensoryCue: "Sunlight taking 8 minutes 20 seconds to reach the Arabian Sea",
                    physicsConcept: "Astronomical Unit (1 AU ≈ 1.5 × 10¹¹ m) & Galaxy (10²¹ m)",
                    quantitativeFact: "Our Solar System is one star system among ~200 billion stars in the Milky Way galaxy (Unit 3.1 / Ch 15).",
                    normalizedPoint: CGPoint(x: 0.86, y: 0.22)
                )
            ]
        )
    ]
}

struct PhysicsMemoryPalaceSection: View {
    @State private var selectedPalaceId: String = PhysicsMemoryPalaceCatalog.allPalaces.first?.id ?? "palace-marine-drive-em"
    @State private var scaffoldingStage: PhysicsMemoryPalaceCatalog.ScaffoldingStage = .fullLoci
    @State private var selectedStopIndex: Int = 0
    @State private var recallAttempt: String = ""
    @State private var recallChecked: Bool = false

    private var activePalace: PhysicsMemoryPalaceCatalog.Palace {
        PhysicsMemoryPalaceCatalog.allPalaces.first(where: { $0.id == selectedPalaceId })
            ?? PhysicsMemoryPalaceCatalog.allPalaces[0]
    }

    private var activeStop: PhysicsMemoryPalaceCatalog.LocusStop {
        activePalace.stops[min(max(0, selectedStopIndex), max(0, activePalace.stops.count - 1))]
    }

    var body: some View {
        JournalSection(
            title: "5. Mumbai Physics Memory Palaces (Spatial Method of Loci)",
            subtitle: "Anchor multi-step physics sequences (EM Spectrum, Prism Dispersion, Energy Stores & Cosmic Scales) along real Mumbai routes"
        ) {
            // Palace Picker
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(PhysicsMemoryPalaceCatalog.allPalaces) { palace in
                        StandardFilterChip(palace.title, isSelected: selectedPalaceId == palace.id) {
                            selectedPalaceId = palace.id
                            selectedStopIndex = 0
                            recallAttempt = ""
                            recallChecked = false
                        }
                    }
                }
            }

            // Scaffolding Stage Picker
            Picker("Fading Stage", selection: $scaffoldingStage) {
                ForEach(PhysicsMemoryPalaceCatalog.ScaffoldingStage.allCases) { stage in
                    Text(stage.title).tag(stage)
                }
            }
            .pickerStyle(.segmented)

            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    HStack {
                        JournalBadge(text: activePalace.topicRef, tone: .accent)
                        Spacer()
                        Text("Locus \(selectedStopIndex + 1) of \(activePalace.stops.count)")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)
                    }

                    Text(activePalace.mumbaiRoute)
                        .font(.kymaiaHeadline)
                        .foregroundStyle(Color.kymaiaInk)

                    Text(activePalace.summary)
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)

                    // Interactive Spatial Route Canvas
                    GeometryReader { geo in
                        ZStack {
                            RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                .fill(Color.kymaiaSurface)

                            Canvas { context, size in
                                guard activePalace.stops.count >= 2 else { return }
                                var path = Path()
                                for (idx, stop) in activePalace.stops.enumerated() {
                                    let pt = CGPoint(
                                        x: stop.normalizedPoint.x * size.width,
                                        y: stop.normalizedPoint.y * size.height
                                    )
                                    if idx == 0 {
                                        path.move(to: pt)
                                    } else {
                                        path.addLine(to: pt)
                                    }
                                }
                                context.stroke(
                                    path,
                                    with: .color(Color.kymaiaPrimary.opacity(0.45)),
                                    style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round, dash: [6, 4])
                                )
                            }

                            ForEach(Array(activePalace.stops.enumerated()), id: \.element.id) { idx, stop in
                                let isSelected = idx == selectedStopIndex
                                Button {
                                    selectedStopIndex = idx
                                    recallChecked = false
                                } label: {
                                    VStack(spacing: 2) {
                                        ZStack {
                                            Circle()
                                                .fill(isSelected ? Color.kymaiaPrimary : Color.kymaiaSurfaceElevated)
                                                .frame(width: isSelected ? 36 : 28, height: isSelected ? 36 : 28)
                                            Circle()
                                                .strokeBorder(Color.kymaiaPrimary, lineWidth: 2)
                                                .frame(width: isSelected ? 36 : 28, height: isSelected ? 36 : 28)
                                            Text("\(stop.orderIndex)")
                                                .font(.kymaiaCaption.weight(.bold))
                                                .foregroundStyle(isSelected ? Color.kymaiaBackground : Color.kymaiaInk)
                                        }
                                        Text(
                                            scaffoldingStage == .fullLoci
                                                ? stop.physicsConcept.components(separatedBy: " ").first ?? stop.landmarkName
                                                : "Stop \(stop.orderIndex)"
                                        )
                                        .font(.kymaiaCaption2.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaInk)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Capsule().fill(Color.kymaiaSurfaceElevated))
                                    }
                                }
                                .buttonStyle(.plain)
                                .position(
                                    x: stop.normalizedPoint.x * geo.size.width,
                                    y: stop.normalizedPoint.y * geo.size.height
                                )
                            }
                        }
                    }
                    .frame(height: 220)

                    // Active Stop Details Card
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack {
                            Label(activeStop.landmarkName, systemImage: "mappin.and.ellipse")
                                .font(.kymaiaTitle3)
                                .foregroundStyle(Color.kymaiaPrimary)
                            Spacer()
                        }

                        if scaffoldingStage != .transferRecall {
                            Text("Mumbai Sensory Hook: \(activeStop.sensoryCue)")
                                .font(.kymaiaCallout)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }

                        if scaffoldingStage == .fullLoci || recallChecked {
                            Text(activeStop.physicsConcept)
                                .font(.kymaiaHeadline)
                                .foregroundStyle(Color.kymaiaInk)
                            Text(activeStop.quantitativeFact)
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaInk)
                        } else {
                            LearnerTextInput(
                                placeholder: "Which physics region/colour/store is anchored at \(activeStop.landmarkName)?",
                                text: $recallAttempt,
                                purpose: .retrieval
                            )
                            Button {
                                recallChecked = true
                            } label: {
                                Label("Reveal Locus Physics Anchor", systemImage: "eye.fill")
                                    .font(.kymaiaCaption.weight(.semibold))
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(Color.kymaiaPrimary)
                        }
                    }
                    .padding(Spacing.md)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                            .fill(Color.kymaiaSurface)
                    )

                    HStack {
                        Button {
                            if selectedStopIndex > 0 {
                                selectedStopIndex -= 1
                                recallChecked = false
                            }
                        } label: {
                            Label("Previous Stop", systemImage: "chevron.left")
                                .font(.kymaiaCaption.weight(.semibold))
                        }
                        .buttonStyle(.bordered)
                        .disabled(selectedStopIndex == 0)

                        Spacer()

                        Button {
                            if selectedStopIndex + 1 < activePalace.stops.count {
                                selectedStopIndex += 1
                                recallChecked = false
                            } else {
                                selectedStopIndex = 0
                                recallChecked = false
                            }
                        } label: {
                            Label(
                                selectedStopIndex + 1 < activePalace.stops.count ? "Walk to Next Stop →" : "Loop Back to Stop 1",
                                systemImage: "figure.walk"
                            )
                            .font(.kymaiaCallout.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                    }
                }
            }
        }
    }
}
