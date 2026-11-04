import SwiftUI

struct LabJournalHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var activeSection: String = "notebook" // "notebook" | "vault" | "mindmap" | "fortress"
    @State private var selectedEntryId: String? = nil
    @State private var coverNotesForSelfTest: Bool = false

    // Editable fields for the active entry
    @State private var draftTitle: String = ""
    @State private var draftTemplate: String = "cornell" // "cornell" | "lab_log" | "error_log" | "teach_back" | "calibration"
    @State private var draftPaper: String = "cornell"
    @State private var draftCues: String = ""
    @State private var draftBody: String = ""
    @State private var draftSummary: String = ""
    @State private var draftHypothesis: String = ""
    @State private var draftIndepVar: String = ""
    @State private var draftDepVar: String = ""
    @State private var draftControlVars: String = ""
    @State private var draftDrawingData: Data = Data()
    @State private var draftSnapshotPNG: Data? = nil

    private var activeEntry: LabJournalEntryRecord? {
        if let id = selectedEntryId ?? store.activeJournalEntry?.id,
           let match = store.journalEntries.first(where: { $0.id == id }) {
            return match
        }
        return store.journalEntries.first
    }

    var body: some View {
        JournalPage(
            title: "Lab Notebook, Learn-by-Heart Vault & Thinking Fortress",
            subtitle: "Cornell & Lab Composers · Progressive Deletion Vault · 16-Chapter Concept Mind-Map · Misconception Buster",
            headerAccessory: {
                StandardThemeMenu()
            }
        ) {
            // Top Studio Switcher
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    Button { activeSection = "notebook" } label: {
                        JournalChip(title: "1. Lab Notebook & 5 Composers", isSelected: activeSection == "notebook")
                    }
                    .buttonStyle(.plain)

                    Button { activeSection = "vault" } label: {
                        JournalChip(title: "2. Learn by Heart Vault (Progressive Deletion)", isSelected: activeSection == "vault")
                    }
                    .buttonStyle(.plain)

                    Button { activeSection = "mindmap" } label: {
                        JournalChip(title: "3. Interactive Physics Mind-Map", isSelected: activeSection == "mindmap")
                    }
                    .buttonStyle(.plain)

                    Button { activeSection = "fortress" } label: {
                        JournalChip(title: "4. Thinking Fortress (Misconception Buster)", isSelected: activeSection == "fortress")
                    }
                    .buttonStyle(.plain)

                    Button { activeSection = "palace" } label: {
                        JournalChip(title: "5. Mumbai Physics Memory Palaces", isSelected: activeSection == "palace")
                    }
                    .buttonStyle(.plain)
                }
            }

            switch activeSection {
            case "vault":
                PhysicsLearnByHeartVaultSection()
            case "mindmap":
                PhysicsConceptMindMapSection()
            case "fortress":
                PhysicsThinkingFortressSection()
            case "palace":
                PhysicsMemoryPalaceSection()
            default:
                notebookComposerSection
            }
        }
    }

    // MARK: - 1. Lab Notebook & 5 Composers (Cornell, Lab Log, Error Log, Feynman Teach-Back, Confidence Calibration)

    @ViewBuilder
    private var notebookComposerSection: some View {
        // Template creation bar
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.sm) {
                Button {
                    createNewEntry(
                        templateKind: "cornell",
                        paperStyle: "cornell",
                        title: "Cornell Notes · Topic \(store.selectedTopicCode ?? "9.1")",
                        cues: "1. Core physical law & equation?\n2. Microscopic or vector cause?\n3. Cambridge exam watchout?",
                        body: "• Write key derivations, ray/force rules, and examples here."
                    )
                } label: {
                    Label("+ Cornell Sheet", systemImage: "rectangle.split.2x1")
                }
                .buttonStyle(JournalCapsuleButtonStyle())

                Button {
                    createNewEntry(
                        templateKind: "lab_log",
                        paperStyle: "grid",
                        title: "Physics Lab Log · Ch \(store.activeMovingWorldChapter) Investigation",
                        cues: "Trial Table:\nTrial 1:\nTrial 2:\nTrial 3:\nMean (excluding anomalies):",
                        body: "Observations, gradient calculation, and sources of random/systematic error."
                    )
                } label: {
                    Label("+ Lab Log", systemImage: "chart.xyaxis.line")
                }
                .buttonStyle(.bordered)

                Button {
                    createNewEntry(
                        templateKind: "error_log",
                        paperStyle: "lined",
                        title: "Error Autopsy · Topic \(store.selectedTopicCode ?? "3.4") Trap",
                        cues: "1. What trap caught me?\n2. Exact mark-scheme phrase I missed?\n3. New trigger rule:",
                        body: "What I originally thought:\n\nWhy First-Principles Physics says otherwise:\n\nHow I will spot this in 5 seconds next time:"
                    )
                } label: {
                    Label("+ Error Autopsy", systemImage: "exclamationmark.triangle")
                }
                .buttonStyle(.bordered)

                Button {
                    createNewEntry(
                        templateKind: "teach_back",
                        paperStyle: "lined",
                        title: "Feynman Teach-Back · Ch \(store.activeMovingWorldChapter)",
                        cues: "1. Explain to a 10-year-old without jargon\n2. Everyday Mumbai analogy\n3. Where the analogy breaks down",
                        body: "Plain-English explanation:\n\nMumbai analogy (local train / monsoon / cricket):\n\nExact equation that sharpens it:"
                    )
                } label: {
                    Label("+ Feynman Teach-Back", systemImage: "person.wave.2")
                }
                .buttonStyle(.bordered)

                Button {
                    createNewEntry(
                        templateKind: "calibration",
                        paperStyle: "grid",
                        title: "Confidence Calibration · Unit \(store.selectedUnitNumber)",
                        cues: "Pre-test prediction (%):\nActual score (%):\nCalibration gap:",
                        body: "Topics where I was overconfident:\n\nTopics where I knew more than I thought:\n\nNext 20-minute focus block:"
                    )
                } label: {
                    Label("+ Confidence Calibration", systemImage: "gauge.with.dots.needle.67percent")
                }
                .buttonStyle(.bordered)
            }
        }

        // Saved Entries Strip
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.xs) {
                ForEach(store.journalEntries) { entry in
                    Button {
                        selectedEntryId = entry.id
                        loadDraft(from: entry)
                    } label: {
                        JournalChip(
                            title: entry.title,
                            isSelected: activeEntry?.id == entry.id
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }

        if let entry = activeEntry {
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    HStack {
                        JournalBadge(text: templateBadgeLabel(for: draftTemplate), tone: .accent)
                        if let topCode = entry.linkedTopicCode {
                            JournalBadge(text: "Topic \(topCode)", tone: .neutral)
                        }
                        if let ch = entry.linkedChapterNumber {
                            JournalBadge(text: "Ch \(ch)", tone: .neutral)
                        }
                        Spacer()
                        Toggle("Cover Right Column & Test Me", isOn: $coverNotesForSelfTest)
                            .toggleStyle(.button)
                            .font(.kymaiaCaption.weight(.semibold))

                        Button {
                            saveCurrentDraft(base: entry)
                        } label: {
                            Label("Save Sheet", systemImage: "checkmark.circle.fill")
                                .font(.kymaiaCaption.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                    }

                    TextField("Sheet Title", text: $draftTitle)
                        .font(.kymaiaTitle3)
                        .textFieldStyle(.roundedBorder)

                    if draftTemplate == "lab_log" {
                        LazyVGrid(
                            columns: [GridItem(.flexible(), spacing: Spacing.md), GridItem(.flexible(), spacing: Spacing.md)],
                            spacing: Spacing.sm
                        ) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Independent Variable (Changed, x-axis)")
                                    .font(.kymaiaCaption.weight(.bold))
                                TextField("e.g. Number of turns on coil (N)", text: $draftIndepVar)
                                    .textFieldStyle(.roundedBorder)
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Dependent Variable (Measured, y-axis)")
                                    .font(.kymaiaCaption.weight(.bold))
                                TextField("e.g. Paperclips lifted (mean of 3 repeats)", text: $draftDepVar)
                                    .textFieldStyle(.roundedBorder)
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Controlled Variables (Kept constant)")
                                    .font(.kymaiaCaption.weight(.bold))
                                TextField("e.g. Current I (ammeter), same soft iron core", text: $draftControlVars)
                                    .textFieldStyle(.roundedBorder)
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Prediction / Hypothesis")
                                    .font(.kymaiaCaption.weight(.bold))
                                TextField("Physical mechanism prediction...", text: $draftHypothesis)
                                    .textFieldStyle(.roundedBorder)
                            }
                        }
                    }

                    // Two-Column Paper Sheet
                    JournalPaperSheet(style: draftTemplate == "lab_log" ? .grid : .cornell, minHeight: 340) {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            HStack(alignment: .top, spacing: Spacing.md) {
                                VStack(alignment: .leading, spacing: Spacing.xs) {
                                    Text("Cue Prompts, Equations & Prompts (30%)")
                                        .font(.kymaiaCaption.weight(.bold))
                                        .foregroundStyle(Color.kymaiaSecondary)
                                    WritingTextEditor(
                                        text: $draftCues,
                                        placeholder: "Write cue questions, symbols, and formulas..."
                                    )
                                    .frame(minHeight: 200)
                                }
                                .frame(maxWidth: 260)

                                Divider()

                                VStack(alignment: .leading, spacing: Spacing.xs) {
                                    Text("Notes, Derivations, Autopsy & Explanations (70%)")
                                        .font(.kymaiaCaption.weight(.bold))
                                        .foregroundStyle(Color.kymaiaPrimary)
                                    if coverNotesForSelfTest {
                                        VStack(spacing: Spacing.sm) {
                                            Image(systemName: "eye.slash.fill")
                                                .font(.largeTitle)
                                                .foregroundStyle(Color.kymaiaPrimary)
                                            Text("Right column covered for active recall! Answer the cue prompts on the left out loud or with Apple Pencil, then tap to uncover.")
                                                .font(.kymaiaCallout)
                                                .multilineTextAlignment(.center)
                                            Button("Uncover Notes") {
                                                coverNotesForSelfTest = false
                                            }
                                            .buttonStyle(.borderedProminent)
                                        }
                                        .frame(maxWidth: .infinity, minHeight: 200)
                                    } else {
                                        WritingTextEditor(
                                            text: $draftBody,
                                            placeholder: "Record observations, free-body notes, ray paths, or repeat trials..."
                                        )
                                        .frame(minHeight: 200)
                                    }
                                }
                            }

                            Divider()

                            // Embedded Apple Pencil Canvas for Diagrams & Equations
                            DrawingCanvas(
                                drawingData: $draftDrawingData,
                                snapshotPNG: $draftSnapshotPNG,
                                title: "Apple Pencil Lab Sketch & Equations",
                                subtitle: "Draw apparatus diagrams, ray paths, or circuit schematics — tap Ink → Text to append handwriting",
                                showGrid: true,
                                initialSize: .compact
                            ) { recognizedText in
                                if draftBody.isEmpty {
                                    draftBody = recognizedText
                                } else {
                                    draftBody += "\n" + recognizedText
                                }
                            }

                            Divider()

                            VStack(alignment: .leading, spacing: 4) {
                                Text("2-Sentence First-Principles Summary (Bottom Band)")
                                    .font(.kymaiaCaption.weight(.bold))
                                    .foregroundStyle(Color.kymaiaMutedInk)
                                TextField("Distil the core physical law in your own words...", text: $draftSummary)
                                    .textFieldStyle(.roundedBorder)
                            }
                        }
                        .padding(Spacing.md)
                    }
                }
            }
            .onAppear {
                loadDraft(from: entry)
            }
            .onChange(of: entry.id) { _, _ in
                loadDraft(from: entry)
            }
        }
    }

    private func templateBadgeLabel(for kind: String) -> String {
        switch kind {
        case "lab_log": return "Physics Lab Log"
        case "error_log": return "Error Autopsy"
        case "teach_back": return "Feynman Teach-Back"
        case "calibration": return "Confidence Calibration"
        default: return "Cornell Sheet"
        }
    }

    private func loadDraft(from entry: LabJournalEntryRecord) {
        draftTitle = entry.title
        draftTemplate = entry.templateKind
        draftPaper = entry.paperStyle
        draftCues = entry.cueColumnText
        draftBody = entry.bodyNotesText
        draftSummary = entry.summaryText
        draftHypothesis = entry.hypothesisText
        draftIndepVar = entry.independentVarText
        draftDepVar = entry.dependentVarText
        draftControlVars = entry.controlVarsText
        draftDrawingData = entry.drawingData ?? Data()
        draftSnapshotPNG = entry.snapshotPNGData
    }

    private func saveCurrentDraft(base: LabJournalEntryRecord) {
        var updated = base
        updated.title = draftTitle
        updated.templateKind = draftTemplate
        updated.paperStyle = draftPaper
        updated.cueColumnText = draftCues
        updated.bodyNotesText = draftBody
        updated.summaryText = draftSummary
        updated.hypothesisText = draftHypothesis
        updated.independentVarText = draftIndepVar
        updated.dependentVarText = draftDepVar
        updated.controlVarsText = draftControlVars
        updated.drawingData = draftDrawingData.isEmpty ? nil : draftDrawingData
        updated.snapshotPNGData = draftSnapshotPNG
        store.saveJournalEntry(updated)
    }

    private func createNewEntry(
        templateKind: String,
        paperStyle: String,
        title: String,
        cues: String,
        body: String
    ) {
        let now = Date()
        let entry = LabJournalEntryRecord(
            id: "journal-\(Int(now.timeIntervalSince1970))-\(UUID().uuidString.prefix(4))",
            title: title,
            templateKind: templateKind,
            paperStyle: paperStyle,
            linkedTopicCode: store.selectedTopicCode,
            linkedChapterNumber: store.activeMovingWorldChapter,
            linkedWidgetId: store.activeWidgetId,
            cueColumnText: cues,
            bodyNotesText: body,
            summaryText: "",
            hypothesisText: "",
            independentVarText: "",
            dependentVarText: "",
            controlVarsText: "",
            drawingData: nil,
            snapshotPNGData: nil,
            createdAt: now,
            updatedAt: now
        )
        store.saveJournalEntry(entry)
        selectedEntryId = entry.id
        loadDraft(from: entry)
    }
}

// MARK: - 2. Learn by Heart Vault (Progressive Deletion for Physics Laws, Formulas & Definitions)

private struct PhysicsVaultItem: Identifiable {
    let id: String
    let category: String
    let title: String
    let topicRef: String
    let formula: String
    let canonicalText: String
}

private struct PhysicsLearnByHeartVaultSection: View {
    @State private var selectedItemIndex: Int = 0
    @State private var maskStage: Int = 0 // 0 = Full, 1 = 25% hidden, 2 = 50% hidden, 3 = First letters, 4 = Blank recall
    @State private var recallAttempt: String = ""
    @State private var recallFeedback: String = ""
    @State private var pencilAttemptData: Data = Data()

    private let items: [PhysicsVaultItem] = [
        PhysicsVaultItem(
            id: "vault-newton-1",
            category: "Forces & Motion",
            title: "Balanced Forces & Constant Velocity (Topic 3.1 / Ch 2)",
            topicRef: "Unit 3.1 · Ch 2",
            formula: "ΣF = 0 N  ⇒  v = constant",
            canonicalText: "When the forces acting on an object are balanced, the resultant force is zero newtons, so a stationary object stays stationary and a moving object continues moving at constant speed in a straight line."
        ),
        PhysicsVaultItem(
            id: "vault-speed",
            category: "Kinematics",
            title: "Average Speed & Distance–Time Gradient (Topics 3.2–3.3 / Ch 1)",
            topicRef: "Units 3.2–3.3 · Ch 1",
            formula: "v = d ÷ t   (m/s)",
            canonicalText: "Speed equals total distance divided by total time taken in metres per second; on a distance-time graph, the gradient of the line equals the speed, and a flat horizontal line means the object is stationary."
        ),
        PhysicsVaultItem(
            id: "vault-moments",
            category: "Turning Forces",
            title: "Principle of Moments in Equilibrium (Topic 3.4 / Ch 3)",
            topicRef: "Unit 3.4 · Ch 3",
            formula: "M = F × d⊥   (N m)",
            canonicalText: "The moment of a force equals the force multiplied by the perpendicular distance from the pivot; for a balanced beam in equilibrium, the total clockwise moment about the pivot equals the total anticlockwise moment."
        ),
        PhysicsVaultItem(
            id: "vault-solid-pressure",
            category: "Pressure",
            title: "Solid Contact Pressure (Topic 3.5 / Ch 6)",
            topicRef: "Unit 3.5 · Ch 6",
            formula: "P = F ÷ A   (Pa or N/cm²)",
            canonicalText: "Pressure equals force divided by contact area; concentrating the same force over a smaller surface area produces a much larger pressure, whereas spreading the force over a larger area reduces the pressure."
        ),
        PhysicsVaultItem(
            id: "vault-gas-pressure",
            category: "Particles & Pressure",
            title: "Particle Model of Gas Pressure & Heating (Topic 3.6 / Ch 6–7)",
            topicRef: "Unit 3.6 · Ch 6",
            formula: "P = F_walls ÷ A",
            canonicalText: "Gas particles move rapidly and randomly, colliding with the walls of their container to exert an outward force per unit area; heating the gas increases particle kinetic energy so they move faster and collide with the walls more frequently and with greater force."
        ),
        PhysicsVaultItem(
            id: "vault-diffusion",
            category: "Kinetic Theory",
            title: "Diffusion Down a Concentration Gradient (Topic 3.7 / Ch 7)",
            topicRef: "Unit 3.7 · Ch 7",
            formula: "⟨E_k⟩ ∝ T",
            canonicalText: "Diffusion is the net movement of particles from a region of higher concentration to a region of lower concentration caused by the random thermal motion and collisions of individual particles."
        ),
        PhysicsVaultItem(
            id: "vault-reflection",
            category: "Optics",
            title: "Law of Reflection in a Plane Mirror (Topic 6.1 / Ch 10)",
            topicRef: "Unit 6.1 · Ch 10",
            formula: "θ_i = θ_r   (measured from the 90° normal)",
            canonicalText: "The angle of incidence equals the angle of reflection, where both angles are always measured between the light ray and the normal line drawn at ninety degrees perpendicular to the mirror surface."
        ),
        PhysicsVaultItem(
            id: "vault-refraction",
            category: "Optics",
            title: "Refraction Across Media Boundaries (Topic 6.2 / Ch 10)",
            topicRef: "Unit 6.2 · Ch 10",
            formula: "n₁ sin θ₁ = n₂ sin θ₂",
            canonicalText: "When light enters a denser medium like glass or water at an angle it slows down and bends toward the normal; when light leaves glass or water into air it speeds up and bends away from the normal."
        ),
        PhysicsVaultItem(
            id: "vault-dispersion-colour",
            category: "Optics",
            title: "Prism Dispersion & Primary Light Colours (Topics 6.3–6.4 / Ch 10)",
            topicRef: "Units 6.3–6.4 · Ch 10",
            formula: "Red + Green + Blue = White Light",
            canonicalText: "A prism disperses white light into red, orange, yellow, green, blue, indigo, and violet because red slows down least and bends least while violet slows down most and bends most; the three primary colours of light are red, green, and blue."
        ),
        PhysicsVaultItem(
            id: "vault-magnetic-fields",
            category: "Magnetism",
            title: "Magnetic Field Lines & Earth's Core Dynamo (Topics 9.1–9.2 / Ch 13)",
            topicRef: "Units 9.1–9.2 · Ch 13",
            formula: "Field arrows: North → South",
            canonicalText: "Magnetic field lines always point from North to South outside a magnet, never cross, and are closest together at the poles where the field is strongest; Earth's Geographic North Pole lies near a magnetic south pole."
        ),
        PhysicsVaultItem(
            id: "vault-electromagnet",
            category: "Electromagnetism",
            title: "Electromagnet Strength & Soft Iron Core (Topics 9.3–9.4 / Ch 13)",
            topicRef: "Units 9.3–9.4 · Ch 13",
            formula: "B ∝ N · I   (with soft iron core)",
            canonicalText: "An electromagnet is made stronger by increasing the number of turns on the coil, increasing the electric current measured with an ammeter in series, and inserting a soft iron core that magnetises easily and demagnetises as soon as the current is switched off."
        ),
        PhysicsVaultItem(
            id: "vault-energy-conservation",
            category: "Conservation Laws",
            title: "Conservation of Energy & Exothermic/Endothermic Transfers (Ch 5 & Unit 8)",
            topicRef: "Unit 8.1–8.2 · Ch 5",
            formula: "ΔE_total = 0   (1 W = 1 J/s)",
            canonicalText: "Energy cannot be created or destroyed, only transferred between stores; an exothermic process transfers thermal energy to the surroundings raising temperature, while an endothermic process absorbs thermal energy from the surroundings lowering temperature."
        )
    ]

    private var activeItem: PhysicsVaultItem {
        items[min(max(selectedItemIndex, 0), items.count - 1)]
    }

    var body: some View {
        JournalSection(
            title: "Learn by Heart Vault · Progressive Deletion",
            subtitle: "Master exact Cambridge mark-scheme definitions, laws, and equations by progressively fading words until you can write the full law from memory"
        ) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { idx, item in
                        Button {
                            selectedItemIndex = idx
                            recallAttempt = ""
                        } label: {
                            JournalChip(
                                title: "\(item.topicRef) · \(item.title)",
                                isSelected: selectedItemIndex == idx
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    HStack {
                        JournalBadge(text: activeItem.category, tone: .accent)
                        JournalBadge(text: activeItem.topicRef, tone: .neutral)
                        Spacer()
                        Text(activeItem.formula)
                            .font(.kymaiaMonoCaption)
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, 4)
                            .background(Capsule().fill(Color.kymaiaAccent.opacity(0.14)))
                    }

                    Text(activeItem.title)
                        .font(.kymaiaTitle2)
                        .foregroundStyle(Color.kymaiaTextPrimary)

                    // 5-Stage Progressive Deletion Stepper
                    Picker("Fading Stage", selection: $maskStage) {
                        Text("1. Full Text").tag(0)
                        Text("2. 25% Faded").tag(1)
                        Text("3. 50% Faded").tag(2)
                        Text("4. First Letters").tag(3)
                        Text("5. Blank Recall").tag(4)
                    }
                    .pickerStyle(.segmented)

                    Text(maskedText(for: activeItem.canonicalText, stage: maskStage))
                        .font(.kymaiaSerifPrompt)
                        .foregroundStyle(Color.kymaiaTextPrimary)
                        .padding(Spacing.md)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                .fill(Color.kymaiaSurface)
                        )

                    HStack(alignment: .top, spacing: Spacing.xs) {
                        TextField("Type or recite the complete law from memory…", text: $recallAttempt, axis: .vertical)
                            .learnerTextInput(.retrieval)
                        VoiceDictationButton(text: $recallAttempt, label: "Recite Aloud")
                    }

                    HStack(spacing: Spacing.sm) {
                        Button {
                            let canonicalWords = Set(
                                activeItem.canonicalText
                                    .lowercased()
                                    .components(separatedBy: CharacterSet.alphanumerics.inverted)
                                    .filter { $0.count >= 4 }
                            )
                            let attemptWords = Set(
                                recallAttempt
                                    .lowercased()
                                    .components(separatedBy: CharacterSet.alphanumerics.inverted)
                                    .filter { $0.count >= 4 }
                            )
                            let matched = canonicalWords.intersection(attemptWords).count
                            let total = max(1, canonicalWords.count)
                            let pct = Int(round((Double(matched) / Double(total)) * 100.0))
                            recallFeedback = "Matched \(matched)/\(total) key physics terms (\(pct)%). " + (pct >= 80 ? "Ready for Stage \(min(4, maskStage + 1))!" : "Compare with Stage 1 Full Text to catch any missing mark-scheme words.")
                        } label: {
                            Label("Check Recall Accuracy", systemImage: "checkmark.seal.fill")
                                .font(.kymaiaCaption.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                        .disabled(recallAttempt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                        if !recallFeedback.isEmpty {
                            Text(recallFeedback)
                                .font(.kymaiaCaption.weight(.semibold))
                                .foregroundStyle(Color.kymaiaPrimary)
                        }
                    }

                    PencilWritingCanvas(
                        drawingData: $pencilAttemptData,
                        minHeight: 140,
                        placeholder: "Or write the equation and definition from memory with Apple Pencil…"
                    )
                }
            }
        }
    }

    private func maskedText(for text: String, stage: Int) -> String {
        guard stage > 0 else { return text }
        if stage >= 4 {
            return "Write the complete law and equation from memory without any visual prompts."
        }
        let words = text.components(separatedBy: " ")
        return words.enumerated().map { idx, word in
            let clean = word.trimmingCharacters(in: .punctuationCharacters)
            guard clean.count > 3 else { return word }
            switch stage {
            case 1:
                return (idx % 4 == 1) ? String(repeating: "—", count: min(clean.count, 6)) : word
            case 2:
                return (idx % 2 == 1) ? String(repeating: "—", count: min(clean.count, 6)) : word
            case 3:
                let firstChar = word.prefix(1)
                return "\(firstChar)\(String(repeating: "·", count: max(2, clean.count - 1)))"
            default:
                return word
            }
        }.joined(separator: " ")
    }
}

// MARK: - 3. Interactive Physics Concept Mind-Map (16 Chapters + 9 School Units + 4 Unifying Pillars)

private struct PhysicsMindMapNode: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let equation: String
    let chapter: Int
    let unitNumber: Int
    let widgetId: String
    let x: Double
    let y: Double
    let connections: [String]
}

private struct PhysicsConceptMindMapSection: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedNodeId: String = "node-electromagnetism"

    private let nodes: [PhysicsMindMapNode] = [
        PhysicsMindMapNode(
            id: "node-measurement",
            title: "Ch 0 · Scale & Measurement",
            subtitle: "SI units, powers of 10, density ρ = m/V",
            equation: "ρ = m ÷ V",
            chapter: 0,
            unitNumber: 2,
            widgetId: "investigations",
            x: 0.16,
            y: 0.22,
            connections: ["node-kinematics", "node-particles"]
        ),
        PhysicsMindMapNode(
            id: "node-kinematics",
            title: "Ch 1 & U3.2–3.3 · Motion & Graphs",
            subtitle: "Speed, velocity, acceleration & d–t / v–t gradients",
            equation: "v = Δx/Δt,  a = Δv/Δt",
            chapter: 1,
            unitNumber: 3,
            widgetId: "graphwalk",
            x: 0.38,
            y: 0.18,
            connections: ["node-forces", "node-gravity"]
        ),
        PhysicsMindMapNode(
            id: "node-forces",
            title: "Ch 2 & U3.1 · Forces & Newton",
            subtitle: "Balanced/unbalanced forces, free-body vectors & drag",
            equation: "F_net = m · a",
            chapter: 2,
            unitNumber: 3,
            widgetId: "forces",
            x: 0.62,
            y: 0.18,
            connections: ["node-moments", "node-pressure", "node-energy"]
        ),
        PhysicsMindMapNode(
            id: "node-moments",
            title: "Ch 3 & U3.4/U7.4 · Moments & Levers",
            subtitle: "Turning effect, pivots & skeletal biomechanics",
            equation: "M = F × d⊥",
            chapter: 3,
            unitNumber: 3,
            widgetId: "mechanicslab",
            x: 0.84,
            y: 0.24,
            connections: ["node-energy"]
        ),
        PhysicsMindMapNode(
            id: "node-gravity",
            title: "Ch 4, 14, 15 & U6.5–6.6 · Gravity & Cosmos",
            subtitle: "Orbits, Moon phases, seasons, asteroids & galaxies",
            equation: "W = m · g",
            chapter: 14,
            unitNumber: 6,
            widgetId: "seasons",
            x: 0.18,
            y: 0.52,
            connections: ["node-waves"]
        ),
        PhysicsMindMapNode(
            id: "node-energy",
            title: "Ch 5 & U8.1–8.2 · Energy & Power",
            subtitle: "Stores, work W = Fd, Sankey efficiency & enthalpy",
            equation: "E_k = ½mv²,  E_p = mgh",
            chapter: 5,
            unitNumber: 8,
            widgetId: "energystores",
            x: 0.50,
            y: 0.48,
            connections: ["node-particles", "node-waves", "node-electromagnetism"]
        ),
        PhysicsMindMapNode(
            id: "node-pressure",
            title: "Ch 6 & U3.5–3.6/U1.3 · Pressure & Buoyancy",
            subtitle: "Solid P = F/A, liquid depth P = ρgh & Boyle's chest law",
            equation: "P = F ÷ A,  P = ρgh",
            chapter: 6,
            unitNumber: 3,
            widgetId: "pressuretank",
            x: 0.82,
            y: 0.52,
            connections: ["node-particles"]
        ),
        PhysicsMindMapNode(
            id: "node-particles",
            title: "Ch 7–8 & U3.7 · Kinetic Particles & Monsoon",
            subtitle: "Diffusion, Brownian motion, conduction, convection & IR",
            equation: "⟨E_k⟩ = (3/2)k_B T",
            chapter: 7,
            unitNumber: 3,
            widgetId: "expansion",
            x: 0.34,
            y: 0.78,
            connections: ["node-waves"]
        ),
        PhysicsMindMapNode(
            id: "node-waves",
            title: "Ch 9–11 & U6.1–6.4 · Sound, Ray Optics & Colour",
            subtitle: "Ragas, reflection θ_i = θ_r, refraction, prisms & RGB light",
            equation: "v = f · λ,  n₁sinθ₁ = n₂sinθ₂",
            chapter: 10,
            unitNumber: 6,
            widgetId: "refraction",
            x: 0.62,
            y: 0.80,
            connections: ["node-electromagnetism"]
        ),
        PhysicsMindMapNode(
            id: "node-electromagnetism",
            title: "Ch 12–13 & U9.1–9.4 · Circuits & Electromagnets",
            subtitle: "Current, voltage, magnetic fields, Earth's core & solenoids",
            equation: "V = I · R,  B ∝ N · I",
            chapter: 13,
            unitNumber: 9,
            widgetId: "fieldslab",
            x: 0.86,
            y: 0.80,
            connections: []
        )
    ]

    private var activeNode: PhysicsMindMapNode {
        nodes.first(where: { $0.id == selectedNodeId }) ?? nodes[0]
    }

    var body: some View {
        JournalSection(
            title: "Interactive Physics Concept Mind-Map",
            subtitle: "Tap any node on the canvas to trace how conservation laws, vectors, particles, waves, and fields connect all 16 chapters and 9 school units"
        ) {
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    GeometryReader { geo in
                        ZStack {
                            RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                .fill(Color.kymaiaSurface)

                            // Edges
                            Canvas { context, size in
                                for node in nodes {
                                    let p1 = CGPoint(x: node.x * size.width, y: node.y * size.height)
                                    for targetId in node.connections {
                                        if let target = nodes.first(where: { $0.id == targetId }) {
                                            let p2 = CGPoint(x: target.x * size.width, y: target.y * size.height)
                                            var line = Path()
                                            line.move(to: p1)
                                            line.addLine(to: p2)
                                            let isHighlighted = (node.id == selectedNodeId || target.id == selectedNodeId)
                                            context.stroke(
                                                line,
                                                with: .color(isHighlighted ? Color.kymaiaAccent : Color.kymaiaSurfaceBorder),
                                                lineWidth: isHighlighted ? 2.5 : 1.2
                                            )
                                        }
                                    }
                                }
                            }

                            // Interactive Node Pills
                            ForEach(nodes) { node in
                                let isSelected = node.id == selectedNodeId
                                Button {
                                    selectedNodeId = node.id
                                } label: {
                                    VStack(spacing: 2) {
                                        Text(node.title)
                                            .font(.kymaiaCaption.weight(.bold))
                                            .foregroundStyle(isSelected ? .white : Color.kymaiaTextPrimary)
                                        Text(node.equation)
                                            .font(.kymaiaMonoCaption)
                                            .foregroundStyle(isSelected ? .white.opacity(0.9) : Color.kymaiaAccent)
                                    }
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(
                                        Capsule()
                                            .fill(isSelected ? Color.kymaiaAccent : Color.kymaiaSurfaceElevated)
                                            .shadow(color: .black.opacity(0.08), radius: 4, y: 1)
                                    )
                                    .overlay(
                                        Capsule()
                                            .strokeBorder(isSelected ? Color.kymaiaAccent : Color.kymaiaSurfaceBorder, lineWidth: 1.5)
                                    )
                                }
                                .buttonStyle(.plain)
                                .position(
                                    x: node.x * geo.size.width,
                                    y: node.y * geo.size.height
                                )
                            }
                        }
                    }
                    .frame(height: 360)

                    // Selected Node Detail Bar
                    HStack(alignment: .center, spacing: Spacing.md) {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: Spacing.xs) {
                                JournalBadge(text: "Moving World Ch \(activeNode.chapter)", tone: .accent)
                                JournalBadge(text: "School Unit \(activeNode.unitNumber)", tone: .neutral)
                                Text(activeNode.equation)
                                    .font(.kymaiaMonoCaption)
                                    .foregroundStyle(Color.kymaiaAccent)
                            }
                            Text(activeNode.title)
                                .font(.kymaiaTitle3)
                            Text(activeNode.subtitle)
                                .font(.kymaiaCallout)
                                .foregroundStyle(Color.kymaiaTextSecondary)
                        }

                        Spacer()

                        Button {
                            store.activeMovingWorldChapter = activeNode.chapter
                            store.selectedRoom = .movingWorld
                        } label: {
                            Label("Open Ch \(activeNode.chapter)", systemImage: "book.pages")
                        }
                        .buttonStyle(.bordered)

                        Button {
                            store.selectedUnitNumber = activeNode.unitNumber
                            store.selectedRoom = .schoolScience
                        } label: {
                            Label("School Unit \(activeNode.unitNumber)", systemImage: "graduationcap")
                        }
                        .buttonStyle(.bordered)

                        Button {
                            store.activeWidgetId = activeNode.widgetId
                            store.selectedRoom = .labsExplorers
                        } label: {
                            Label("Launch 3D Lab", systemImage: "gyroscope")
                        }
                        .buttonStyle(JournalCapsuleButtonStyle())
                    }
                }
            }
        }
    }
}

// MARK: - 4. Thinking Fortress (Physics Misconception & Claim Buster)

private struct PhysicsFortressClaim: Identifiable {
    let id: String
    let topicRef: String
    let statement: String
    let isSoundPhysics: Bool
    let firstPrinciplesProof: String
}

private struct PhysicsThinkingFortressSection: View {
    @State private var verdicts: [String: Bool] = [:] // true = marked Sound Physics, false = marked Misconception Trap
    @State private var notes: [String: String] = [:]

    private let claims: [PhysicsFortressClaim] = [
        PhysicsFortressClaim(
            id: "claim-1",
            topicRef: "Unit 3.1 · Ch 2",
            statement: "“If a cyclist is moving forward at a steady 10 m/s, her forward driving force MUST be greater than the backward air resistance and friction.”",
            isSoundPhysics: false,
            firstPrinciplesProof: "MISCONCEPTION TRAP! At steady speed in a straight line (acceleration = 0), the forward driving force is EQUAL to the backward resistive force (resultant force = 0 N). A larger forward force would make her speed up!"
        ),
        PhysicsFortressClaim(
            id: "claim-2",
            topicRef: "Unit 9.2 · Ch 13",
            statement: "“Because the north-seeking pole of a compass needle points toward Earth's Geographic North Pole, Earth's Geographic North Pole must contain a magnetic south pole.”",
            isSoundPhysics: true,
            firstPrinciplesProof: "SOUND PHYSICS! Unlike magnetic poles attract (N attracts S). For the North pole of a compass needle to be pulled northward, the magnetic pole inside the Arctic must have south-seeking polarity."
        ),
        PhysicsFortressClaim(
            id: "claim-3",
            topicRef: "Unit 6.4 · Ch 10",
            statement: "“A bright blue shirt illuminated only by a pure red stage spotlight will look purple (magenta) to the audience.”",
            isSoundPhysics: false,
            firstPrinciplesProof: "MISCONCEPTION TRAP! A blue pigment only reflects blue wavelengths and absorbs red wavelengths. When only red light hits it, all the red light is absorbed and zero light reflects to the eye, so the shirt looks BLACK."
        ),
        PhysicsFortressClaim(
            id: "claim-4",
            topicRef: "Unit 3.6 · Ch 6",
            statement: "“Heating a sealed rigid canister of gas increases its pressure because the individual gas molecules expand and swell up to fill more space.”",
            isSoundPhysics: false,
            firstPrinciplesProof: "MISCONCEPTION TRAP! Atoms and molecules NEVER expand when heated. Heating increases their kinetic energy so they move faster, colliding with the container walls more frequently and with greater force per collision."
        ),
        PhysicsFortressClaim(
            id: "claim-5",
            topicRef: "Unit 9.3 · Ch 13",
            statement: "“A scrapyard crane electromagnet uses a soft iron core rather than a steel core because soft iron loses its magnetism immediately when the current is switched off.”",
            isSoundPhysics: true,
            firstPrinciplesProof: "SOUND PHYSICS! Steel is a hard magnetic material that stays permanently magnetised (so the crane could never drop the scrap car!), whereas soft iron demagnetises as soon as the switch opens."
        ),
        PhysicsFortressClaim(
            id: "claim-6",
            topicRef: "Ch 12 · Circuits",
            statement: "“Electric current is gradually used up as it passes through each bulb in a series circuit, so less current returns to the negative terminal of the battery.”",
            isSoundPhysics: false,
            firstPrinciplesProof: "MISCONCEPTION TRAP! Charge is strictly conserved: the electric current (rate of flow of electrons, in amps) is IDENTICAL at every single point around a series loop. It is electrical ENERGY (voltage) that is transferred to thermal and light energy in the bulbs."
        ),
        PhysicsFortressClaim(
            id: "claim-7",
            topicRef: "Ch 14 · Seasons",
            statement: "“Summer is warmer than winter because Earth's elliptical orbit brings Earth closer to the Sun in June.”",
            isSoundPhysics: false,
            firstPrinciplesProof: "MISCONCEPTION TRAP! Earth is actually closest to the Sun (perihelion) in early January! Seasons are caused by Earth's 23.4° axial tilt: when a hemisphere tilts toward the Sun, sunlight hits at a steeper angle (higher concentration per m²) for more hours per day."
        ),
        PhysicsFortressClaim(
            id: "claim-8",
            topicRef: "Unit 6.1 · Ch 10",
            statement: "“If a light ray strikes a plane mirror at a grazing angle of 20° to the mirror surface, the angle of incidence is 70° and the angle of reflection is 70°.”",
            isSoundPhysics: true,
            firstPrinciplesProof: "SOUND PHYSICS! Optical angles are always measured from the 90° normal, never from the mirror surface: i = 90° − 20° = 70°, and r = i = 70°."
        )
    ]

    var body: some View {
        JournalSection(
            title: "Thinking Fortress · Physics Misconception & Claim Buster",
            subtitle: "Test your physical intuition against the 8 classic traps that fool 80% of exam candidates"
        ) {
            VStack(spacing: Spacing.md) {
                ForEach(claims) { claim in
                    let userVerdict = verdicts[claim.id]
                    let isCorrect = (userVerdict != nil) && (userVerdict == claim.isSoundPhysics)

                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            HStack {
                                JournalBadge(text: claim.topicRef, tone: .accent)
                                Spacer()
                                if userVerdict != nil {
                                    JournalBadge(
                                        text: isCorrect ? "Defended ✓" : "Trapped — Review Proof!",
                                        tone: isCorrect ? .positive : .warning
                                    )
                                }
                            }

                            Text(claim.statement)
                                .font(.kymaiaSerifPrompt)
                                .foregroundStyle(Color.kymaiaTextPrimary)

                            HStack(spacing: Spacing.sm) {
                                Button {
                                    verdicts[claim.id] = true
                                } label: {
                                    Label("Sound Physics ✓", systemImage: "checkmark.shield.fill")
                                }
                                .buttonStyle(KymaiaOptionButtonStyle(isSelected: userVerdict == true))

                                Button {
                                    verdicts[claim.id] = false
                                } label: {
                                    Label("Misconception Trap ✗", systemImage: "exclamationmark.shield.fill")
                                }
                                .buttonStyle(KymaiaOptionButtonStyle(isSelected: userVerdict == false))
                            }

                            if userVerdict != nil {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(claim.firstPrinciplesProof)
                                        .font(.kymaiaCallout)
                                        .foregroundStyle(isCorrect ? Color.kymaiaSuccess : Color.kymaiaWarning)
                                }
                                .padding(Spacing.sm)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.sm, style: .continuous)
                                        .fill(Color.kymaiaSurface)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
