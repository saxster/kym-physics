import SwiftUI
import WebKit

struct PracticeExamsHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedSection: String = "exams" // "exams" | "papers" | "wolfram" | "diagrams"
    @State private var selectedExamChapter: Int = 13     // Default Ch 13 Magnets & motors (Unit 9)
    @State private var selectedStage: String = "all"     // "all" | "guided" | "independent" | "transfer" | "paper"
    @State private var selectedPaperFile: String = "ch13" // "ch00"..."ch15" or "mixed"

    private var activeExamBank: PhysicsExamBank? {
        store.pack.examBanks.first(where: { $0.chapter == selectedExamChapter }) ?? store.pack.examBanks.first
    }

    private var filteredExamQuestions: [PhysicsExamQuestion] {
        guard let bank = activeExamBank else { return [] }
        if selectedStage == "all" { return bank.questions }
        return bank.questions.filter { $0.stage == selectedStage }
    }

    var body: some View {
        JournalPage(
            eyebrow: AppRoom.practiceExams.title,
            title: "Proofs, 507 Exam Questions & Diagram Recall",
            subtitle: "16 Chapter Exam Banks · 16 Wolfram Quantitative Drills · Apple Pencil Physics Diagram Recall",
            headerAccessory: {
                StandardThemeMenu()
            }
        ) {
            // 1. Mode Switcher
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    StandardFilterChip("507 Chapter Exam Questions (\(store.examAttempts.count) done)", isSelected: selectedSection == "exams") { selectedSection = "exams" }

                    StandardFilterChip("Discrimination & Premise Lab (\(store.pack.practiceDemands.count))", isSelected: selectedSection == "demands") { selectedSection = "demands" }

                    StandardFilterChip("16 Wolfram Quantitative Drills", isSelected: selectedSection == "wolfram") { selectedSection = "wolfram" }

                    StandardFilterChip("Apple Pencil Diagram Recall (\(store.pack.diagramPlates.count) Plates)", isSelected: selectedSection == "diagrams") { selectedSection = "diagrams" }

                    StandardFilterChip("17 Printable & Interactive Papers", isSelected: selectedSection == "papers") { selectedSection = "papers" }

                    StandardFilterChip("SpeedPhysics Mental Gym", isSelected: selectedSection == "speedgym") { selectedSection = "speedgym" }
                }
            }

            if selectedSection == "demands" {
                LearnHarnessPracticeDemandsSection()
            } else if selectedSection == "wolfram" {
                WolframQuantitativeDrillsSection()
            } else if selectedSection == "diagrams" {
                PhysicsDiagramRecallSection()
            } else if selectedSection == "papers" {
                InteractivePrintableExamPapersSection(selectedPaperFile: $selectedPaperFile)
            } else if selectedSection == "speedgym" {
                SpeedPhysicsGymSection()
            } else {
                // 507 Chapter Exam Questions Bank
                JournalSection(
                    title: "Chapter Exam Banks (507 Grade 8 Questions + 104 Flashcards)",
                    subtitle: "Select any chapter of The Moving World to practice Guided, Independent, Transfer, and Exam-Paper questions"
                ) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            ForEach(store.pack.examBanks) { bank in
                                StandardFilterChip("Ch \(bank.chapter) · \(bank.title) (\(bank.questions.count))", isSelected: selectedExamChapter == bank.chapter) {
                                    selectedExamChapter = bank.chapter
                                }
                            }
                        }
                    }

                    HStack(spacing: Spacing.xs) {
                        ForEach(["all", "guided", "independent", "transfer", "paper"], id: \.self) { st in
                            StandardFilterChip(st == "all" ? "All Stages" : st.capitalized, isSelected: selectedStage == st) {
                                selectedStage = st
                            }
                        }
                        Spacer()
                    }

                    VStack(spacing: Spacing.md) {
                        ForEach(filteredExamQuestions) { q in
                            ExamQuestionPracticeCard(question: q)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Individual Exam Question Card

private struct ExamQuestionPracticeCard: View {
    @EnvironmentObject private var store: AppStore
    let question: PhysicsExamQuestion

    @State private var learnerAnswer: String = ""
    @State private var showMarkScheme: Bool = false
    @State private var checkedPoints: Set<Int> = []
    @State private var selectedConfidence: Int? = nil
    @State private var declinedToGuess: Bool = false
    @State private var readingThinkingText: String = ""
    @State private var answerThinkingText: String = ""
    @State private var revealedHintRung: Int = -1

    private var recordedAttempt: ExamQuestionAttemptRecord? {
        store.examAttempts[question.id]
    }

    var body: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                HStack {
                    JournalBadge(text: "Ch \(question.chapter) · \(question.stage.capitalized)", tone: .accent)
                    JournalBadge(text: "\(question.marks) marks", tone: .neutral)
                    Text(question.title)
                        .font(.kymaiaHeadline)
                        .foregroundStyle(Color.kymaiaInk)
                    Spacer()
                    if let att = recordedAttempt {
                        JournalBadge(text: "Scored \(att.awardedMarks)/\(att.maxMarks)", tone: .positive)
                    }
                }

                Text(question.prompt)
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaInk)

                ThinkingOutLoudField(
                    readingThinkingText: $readingThinkingText,
                    answerThinkingText: $answerThinkingText
                )

                LearnerTextInput(
                    placeholder: "Write your physics explanation or calculation with units...",
                    text: $learnerAnswer
                )

                ConfidenceRailView(
                    selectedConfidence: $selectedConfidence,
                    declinedToGuess: $declinedToGuess,
                    isDisabled: showMarkScheme
                )

                if !question.hints.isEmpty {
                    HStack(spacing: Spacing.xs) {
                        Button {
                            revealedHintRung = min(question.hints.count - 1, revealedHintRung + 1)
                        } label: {
                            Label(
                                revealedHintRung < 0 ? "Request R0 Redirect Hint" : "Next Hint Rung (R\(min(5, revealedHintRung + 1)))",
                                systemImage: "lightbulb"
                            )
                            .font(.kymaiaCaption.weight(.semibold))
                        }
                        .buttonStyle(.bordered)
                        .disabled(revealedHintRung >= question.hints.count - 1)

                        if revealedHintRung >= 0, let rung = HintRung(rawValue: min(5, revealedHintRung)) {
                            JournalBadge(
                                text: rung.retrievalPolicyBadge,
                                tone: rung.surrendersRetrieval ? .warning : .positive
                            )
                        }
                    }

                    if revealedHintRung >= 0 {
                        ForEach(0...min(revealedHintRung, question.hints.count - 1), id: \.self) { idx in
                            Text("R\(idx): \(question.hints[idx])")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                    }
                }

                HStack {
                    Button(showMarkScheme ? "Hide Mark Scheme" : "Check Against Mark Scheme") {
                        showMarkScheme.toggle()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)

                    if showMarkScheme {
                        Button("Record Score (\(checkedPoints.count)/\(question.marks))") {
                            store.recordExamQuestionAttempt(
                                question: question,
                                awardedMarks: checkedPoints.count,
                                answerText: learnerAnswer,
                                confidencePercent: selectedConfidence,
                                declinedToGuess: declinedToGuess,
                                readingThinkingText: readingThinkingText,
                                answerThinkingText: answerThinkingText,
                                maxHintRungUsed: max(0, revealedHintRung)
                            )
                        }
                        .buttonStyle(.bordered)
                    }
                }

                if showMarkScheme {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text("Mark-Scheme Points (tick each point your answer earned):")
                            .font(.kymaiaCaption.weight(.bold))
                            .foregroundStyle(Color.kymaiaSecondary)

                        ForEach(Array(question.points.enumerated()), id: \.offset) { idx, pt in
                            Button {
                                if checkedPoints.contains(idx) {
                                    checkedPoints.remove(idx)
                                } else {
                                    checkedPoints.insert(idx)
                                }
                            } label: {
                                HStack(alignment: .top, spacing: Spacing.xs) {
                                    Image(systemName: checkedPoints.contains(idx) ? "checkmark.square.fill" : "square")
                                        .foregroundStyle(Color.kymaiaPrimary)
                                    Text(pt)
                                        .font(.kymaiaCallout)
                                        .foregroundStyle(Color.kymaiaInk)
                                        .multilineTextAlignment(.leading)
                                }
                            }
                            .buttonStyle(.plain)
                        }

                        if !question.common.isEmpty {
                            Text("Common misconception to avoid: \(question.common)")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaWarning)
                                .padding(.top, Spacing.xxs)
                        }
                    }
                    .padding(Spacing.md)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                            .fill(Color.kymaiaSelectionFill)
                    )
                }
            }
        }
    }
}

// MARK: - 16 Wolfram-Audited Quantitative Physics Drills

private struct WolframQuantitativeDrillsSection: View {
    @State private var inputs: [String: String] = [:]
    @State private var results: [String: QuantitativeCheckResult] = [:]
    @State private var revealedSolutions: Set<String> = []

    var body: some View {
        JournalSection(
            title: "16 Wolfram-Audited Quantitative Physics Drills",
            subtitle: "Evaluates both exact numerical magnitude (including fractions) and SI unit dimensions"
        ) {
            VStack(spacing: Spacing.md) {
                ForEach(QuantitativePhysicsEngine.templates) { tpl in
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            HStack {
                                JournalBadge(text: "Ch \(tpl.chapter) · Topic \(tpl.topicCode)", tone: .accent)
                                Text(tpl.title)
                                    .font(.kymaiaHeadline)
                                    .foregroundStyle(Color.kymaiaInk)
                                Spacer()
                                Text(tpl.formulaDisplay)
                                    .font(.system(.caption, design: .monospaced).weight(.semibold))
                                    .foregroundStyle(Color.kymaiaPrimary)
                            }

                            Text(tpl.prompt)
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaInk)

                            VStack(alignment: .leading, spacing: Spacing.xxs) {
                                Text("Visual Intuition: \(tpl.visualIntuitionStep)")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)
                                Text("Aha! Invariant: \(tpl.ahaInvariantStep)")
                                    .font(.kymaiaCaption.weight(.medium))
                                    .foregroundStyle(Color.kymaiaSecondary)
                            }

                            HStack(spacing: Spacing.sm) {
                                TextField(
                                    "Value + unit (e.g. \(Int(tpl.expectedValue)) \(tpl.expectedUnit))",
                                    text: Binding(
                                        get: { inputs[tpl.id] ?? "" },
                                        set: { inputs[tpl.id] = $0 }
                                    )
                                )
                                .textFieldStyle(.roundedBorder)
                                .frame(maxWidth: 320)

                                Button("Verify Value & Unit") {
                                    let ans = inputs[tpl.id] ?? ""
                                    results[tpl.id] = QuantitativePhysicsEngine.evaluate(input: ans, against: tpl)
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(Color.kymaiaPrimary)

                                Button(revealedSolutions.contains(tpl.id) ? "Hide Steps" : "Show Worked Steps") {
                                    if revealedSolutions.contains(tpl.id) {
                                        revealedSolutions.remove(tpl.id)
                                    } else {
                                        revealedSolutions.insert(tpl.id)
                                    }
                                }
                                .buttonStyle(.bordered)
                            }

                            if let res = results[tpl.id] {
                                if let trap = res.matchedTrap {
                                    PhysicsBuggyRuleTrapBanner(trap: trap)
                                } else {
                                    Text(res.feedback)
                                        .font(.kymaiaCallout.weight(.semibold))
                                        .foregroundStyle(res.isFullPass ? Color.kymaiaSuccess : Color.kymaiaWarning)
                                }
                            }

                            if revealedSolutions.contains(tpl.id) {
                                VStack(alignment: .leading, spacing: Spacing.xxs) {
                                    ForEach(tpl.stepByStepSolution, id: \.self) { step in
                                        Text("• \(step)")
                                            .font(.kymaiaCallout)
                                            .foregroundStyle(Color.kymaiaInk)
                                    }
                                    Text("Unit Trap: \(tpl.commonUnitTrap)")
                                        .font(.kymaiaCaption)
                                        .foregroundStyle(Color.kymaiaWarning)
                                }
                                .padding(Spacing.sm)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.sm, style: .continuous)
                                        .fill(Color.kymaiaSelectionFill)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Apple Pencil Physics Diagram Recall (3-Tier Fading Scaffold)

private struct PhysicsDiagramRecallSection: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedPlateId: String? = nil
    @State private var scaffoldMode: String = "label_only" // "label_only" | "ghost_scaffold" | "blank_recall"
    @State private var revealedPins: Set<String> = []
    @State private var sketchNotes: String = ""
    @State private var pencilDrawingData: Data = Data()
    @State private var pencilSnapshotPNG: Data? = nil
    @State private var showSVGOverlay: Bool = false

    private var activePlate: DiagramRecallPlate {
        if let id = selectedPlateId ?? store.activeDiagramPlateId,
           let found = store.pack.diagramPlates.first(where: { $0.id == id }) {
            return found
        }
        return store.pack.diagramPlates.first ?? DiagramRecallPlate(
            id: "plate-u9-electromagnet",
            title: "Solenoid Electromagnet with Soft Iron Core",
            sourceRef: "Unit 9.3",
            unitNumber: 9,
            chapter: 13,
            figureId: "c13_electromagnet",
            aspectRatio: 1.4,
            callouts: []
        )
    }

    var body: some View {
        JournalSection(
            title: "Apple Pencil Physics Diagram Recall",
            subtitle: "3-Tier Fading Scaffold: 1. Label Callouts -> 2. Ghost Outlines -> 3. Blank Memory Sketch"
        ) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(store.pack.diagramPlates) { plate in
                        StandardFilterChip("U\(plate.unitNumber) · \(plate.title)", isSelected: activePlate.id == plate.id) {
                            selectedPlateId = plate.id
                            revealedPins.removeAll()
                        }
                    }
                }
            }

            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    HStack {
                        JournalBadge(text: "Unit \(activePlate.unitNumber) · Ch \(activePlate.chapter)", tone: .accent)
                        Text(activePlate.title)
                            .font(.kymaiaTitle3)
                            .foregroundStyle(Color.kymaiaInk)
                        Spacer()
                        Text(activePlate.sourceRef)
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaMutedInk)
                    }

                    HStack(spacing: Spacing.sm) {
                        StandardFilterChip("1. Label Callouts", isSelected: scaffoldMode == "label_only") { scaffoldMode = "label_only" }

                        StandardFilterChip("2. Ghost Scaffold", isSelected: scaffoldMode == "ghost_scaffold") { scaffoldMode = "ghost_scaffold" }

                        StandardFilterChip("3. Blank Memory Sketch", isSelected: scaffoldMode == "blank_recall") { scaffoldMode = "blank_recall" }

                        Spacer()
                        Button("Reveal All Master Labels") {
                            revealedPins = Set(activePlate.callouts.map(\.id))
                        }
                        .buttonStyle(.bordered)
                    }

                    // Interactive Callout Pin Canvas + Pencil Sheet
                    JournalPaperSheet(style: .grid, minHeight: 300) {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            ForEach(Array(activePlate.callouts.enumerated()), id: \.element.id) { idx, pin in
                                let isRevealed = revealedPins.contains(pin.id)
                                HStack(alignment: .top, spacing: Spacing.sm) {
                                    JournalBadge(text: "Pin \(idx + 1)", tone: isRevealed ? .positive : .accent)
                                    VStack(alignment: .leading, spacing: 2) {
                                        if scaffoldMode != "blank_recall" {
                                            Text("Hint: \(pin.hint)")
                                                .font(.kymaiaCaption)
                                                .foregroundStyle(Color.kymaiaMutedInk)
                                        }
                                        if isRevealed {
                                            Text(pin.label)
                                                .font(.kymaiaCallout.weight(.semibold))
                                                .foregroundStyle(Color.kymaiaPrimary)
                                        } else {
                                            Button("Tap after sketching label #\(idx + 1) to verify") {
                                                revealedPins.insert(pin.id)
                                            }
                                            .font(.kymaiaCaption.weight(.semibold))
                                        }
                                    }
                                    Spacer()
                                }
                                .padding(.vertical, 2)
                            }

                            Divider()

                            DrawingCanvas(
                                drawingData: $pencilDrawingData,
                                snapshotPNG: $pencilSnapshotPNG,
                                title: "Apple Pencil Diagram & Callout Sketch (\(activePlate.title))",
                                subtitle: "Draw force vectors, normal lines, ray angles, or magnetic field arrows — squeeze/double-tap Pencil to toggle eraser",
                                showGrid: true,
                                initialSize: .standard
                            ) { recognizedText in
                                if sketchNotes.isEmpty {
                                    sketchNotes = recognizedText
                                } else {
                                    sketchNotes += "\n" + recognizedText
                                }
                            }

                            WritingTextEditor(
                                text: $sketchNotes,
                                placeholder: "Draw above with Apple Pencil (or convert ink to text via Vision OCR) and add written callout notes here..."
                            )
                            .frame(minHeight: 80)
                        }
                        .padding(Spacing.md)
                    }

                    HStack(spacing: Spacing.sm) {
                        Button {
                            store.recordDiagramRecall(
                                plate: activePlate,
                                mode: scaffoldMode,
                                correctCount: revealedPins.count,
                                selfScore: revealedPins.count == activePlate.callouts.count ? 5 : 4,
                                drawingData: pencilDrawingData.isEmpty ? Data(sketchNotes.utf8) : pencilDrawingData
                            )
                        } label: {
                            Label("Record Diagram Recall (\(revealedPins.count)/\(activePlate.callouts.count) verified)", systemImage: "checkmark.seal.fill")
                                .font(.kymaiaCallout.weight(.semibold))
                                .monospacedDigit()
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)

                        Button {
                            showSVGOverlay.toggle()
                        } label: {
                            Label(
                                showSVGOverlay ? "Hide SVG Callout Overlay" : "Verify with SVG Callout Overlay",
                                systemImage: "viewfinder.rectangular"
                            )
                            .font(.kymaiaCallout.weight(.semibold))
                        }
                        .buttonStyle(.bordered)
                    }

                    if showSVGOverlay {
                        let overlay = LearnerImageSVGAnnotator.buildPlateVerificationOverlay(
                            plate: activePlate,
                            revealedCalloutIds: revealedPins
                        )
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            HStack {
                                JournalBadge(
                                    text: overlay.validation.isValid ? "SVG Geometry Verified" : "Placement Warning",
                                    tone: overlay.validation.isValid ? .positive : .warning
                                )
                                Text("Coordinate space: \(Int(overlay.validation.naturalWidth))×\(Int(overlay.validation.naturalHeight)) · \(LearnerImageSVGAnnotator.placeholderHref)")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)
                                    .monospacedDigit()
                            }

                            ForEach(overlay.annotations) { ann in
                                HStack(spacing: Spacing.xs) {
                                    Image(systemName: ann.isCorrect ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                                        .foregroundStyle(ann.isCorrect ? Color.kymaiaSuccess : Color.kymaiaWarning)
                                    Text(ann.label)
                                        .font(.kymaiaCaption.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaInk)
                                    Spacer()
                                    Text("anchor (\(Int(ann.anchorX)), \(Int(ann.anchorY)))")
                                        .font(.kymaiaCaption)
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                        .monospacedDigit()
                                }
                            }
                        }
                        .padding(Spacing.sm)
                        .background(
                            RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                .fill(Color.kymaiaSelectionFill)
                        )
                    }
                }
            }
        }
    }
}

// MARK: - LearnHarness Practice Stream (Recall, Discrimination & Composition + R0..R5 Hint Ladder)

private struct LearnHarnessPracticeDemandsSection: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedModeFilter: String = "all" // "all" | "recall" | "discrimination" | "composition"
    @State private var retestDemandIds: Set<String> = []
    @State private var lastActivePropositionId: String? = nil

    private var scheduledDemands: [PhysicsPracticeDemand] {
        let base = PracticeStreamEngine.scheduleStream(
            demands: store.pack.practiceDemands,
            retestDemandIds: retestDemandIds,
            lastActivePropositionId: lastActivePropositionId
        )
        if selectedModeFilter == "all" { return base }
        return base.filter { $0.mode == selectedModeFilter }
    }

    var body: some View {
        JournalSection(
            title: "LearnHarness Capability Demands (Recall · Discrimination · Composition)",
            subtitle: "Enforces the proposition inactivity constraint across consecutive items and grades hints on a 6-rung ladder (R0–R1 preserve independent retrieval; R2–R5 schedule fresh-surface re-verification)"
        ) {
            HStack(spacing: Spacing.xs) {
                StandardFilterChip("All Modes (\(store.pack.practiceDemands.count))", isSelected: selectedModeFilter == "all") {
                    selectedModeFilter = "all"
                }
                StandardFilterChip("Recall", isSelected: selectedModeFilter == "recall") {
                    selectedModeFilter = "recall"
                }
                StandardFilterChip("Discrimination (Confusable Pairs)", isSelected: selectedModeFilter == "discrimination") {
                    selectedModeFilter = "discrimination"
                }
                StandardFilterChip("Composition (Multi-Premise ⟹)", isSelected: selectedModeFilter == "composition") {
                    selectedModeFilter = "composition"
                }
                Spacer()
            }

            VStack(spacing: Spacing.md) {
                ForEach(scheduledDemands) { demand in
                    PracticeDemandCard(
                        demand: demand,
                        isQueuedForRetest: retestDemandIds.contains(demand.id),
                        onEvaluated: { needsRetest, propId in
                            lastActivePropositionId = propId
                            if needsRetest {
                                retestDemandIds.insert(demand.id)
                            } else {
                                retestDemandIds.remove(demand.id)
                            }
                        }
                    )
                }
            }
        }
    }
}

private struct PracticeDemandCard: View {
    let demand: PhysicsPracticeDemand
    let isQueuedForRetest: Bool
    let onEvaluated: (Bool, String) -> Void

    @State private var learnerAnswer: String = ""
    @State private var readingThinking: String = ""
    @State private var answerThinking: String = ""
    @State private var selectedConfidence: Int? = nil
    @State private var declinedToGuess: Bool = false
    @State private var currentHintRung: Int = -1
    @State private var isCommitted: Bool = false
    @State private var diagnosisSummary: String = ""
    @State private var calibrationBadge: ConfidenceVerdictCalibration? = nil

    var body: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                HStack(spacing: Spacing.xs) {
                    JournalBadge(text: "Ch \(demand.chapter) · Topic \(demand.topicCode)", tone: .accent)
                    JournalBadge(text: demand.mode.capitalized, tone: demand.mode == "discrimination" ? .warning : .neutral)
                    if demand.modifier != "standard" {
                        JournalBadge(text: demand.modifier.replacingOccurrences(of: "_", with: " ").capitalized, tone: .accent)
                    }
                    if isQueuedForRetest {
                        JournalBadge(text: "Queued for Fresh Retest", tone: .warning)
                    }
                    Spacer()
                    if let cal = calibrationBadge {
                        JournalBadge(
                            text: cal.badgeTitle,
                            tone: cal == .solidMastery ? .positive : .warning
                        )
                    }
                }

                Text(demand.title)
                    .font(.kymaiaHeadline)
                    .foregroundStyle(Color.kymaiaInk)

                Text(demand.situationPrompt)
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaInk)

                ThinkingOutLoudField(
                    readingThinkingText: $readingThinking,
                    answerThinkingText: $answerThinking
                )

                LearnerTextInput(
                    placeholder: "Commit to your explanation or calculation before revealing the steps...",
                    text: $learnerAnswer
                )

                ConfidenceRailView(
                    selectedConfidence: $selectedConfidence,
                    declinedToGuess: $declinedToGuess,
                    isDisabled: isCommitted
                )

                HStack(spacing: Spacing.xs) {
                    Button {
                        currentHintRung = min(demand.hintLadderR0ToR5.count - 1, currentHintRung + 1)
                    } label: {
                        let nextR = min(5, currentHintRung + 1)
                        Label(
                            currentHintRung < 0 ? "R0 Attention Redirect" : "Next Hint Rung (R\(nextR))",
                            systemImage: "lightbulb"
                        )
                        .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    .disabled(currentHintRung >= demand.hintLadderR0ToR5.count - 1)

                    if currentHintRung >= 0, let rung = HintRung(rawValue: min(5, currentHintRung)) {
                        JournalBadge(
                            text: rung.retrievalPolicyBadge,
                            tone: rung.surrendersRetrieval ? .warning : .positive
                        )
                    }

                    Spacer()

                    Button(isCommitted ? "Re-evaluate Answer" : "Commit & Check Demand") {
                        evaluateDemand()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)
                }

                if currentHintRung >= 0 {
                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        ForEach(0...min(currentHintRung, demand.hintLadderR0ToR5.count - 1), id: \.self) { idx in
                            Text(demand.hintLadderR0ToR5[idx])
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                    }
                    .padding(Spacing.sm)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.sm, style: .continuous)
                            .fill(Color.kymaiaSurface)
                    )
                }

                if isCommitted {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        if !diagnosisSummary.isEmpty {
                            Text(diagnosisSummary)
                                .font(.kymaiaCallout.weight(.semibold))
                                .foregroundStyle(Color.kymaiaInk)
                        }

                        Text("Separating Feature: \(demand.separatingFeature)")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)

                        ForEach(demand.committedSolutionSteps, id: \.self) { step in
                            Text("• \(step)")
                                .font(.kymaiaCallout)
                                .foregroundStyle(Color.kymaiaInk)
                        }

                        Text("Misconception Watchout: \(demand.commonMisconception)")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaWarning)
                    }
                    .padding(Spacing.md)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                            .fill(Color.kymaiaSelectionFill)
                    )
                }
            }
        }
    }

    private func evaluateDemand() {
        let lower = learnerAnswer.lowercased()
        let matched = demand.markSchemeKeywords.filter { lower.contains($0.lowercased()) }
        let total = max(1, demand.markSchemeKeywords.count)
        let coverage = Double(matched.count) / Double(total)
        let isPass = !declinedToGuess && coverage >= 0.60 && lower.trimmingCharacters(in: .whitespacesAndNewlines).count >= 10

        let cal = ConfidenceVerdictCalibration.calibrate(
            isPass: isPass,
            coverageFraction: coverage,
            confidencePercent: selectedConfidence,
            declinedToGuess: declinedToGuess
        )
        calibrationBadge = cal
        isCommitted = true

        if isPass && currentHintRung < 2 && cal == .solidMastery {
            diagnosisSummary = "Independent mastery verified (\(matched.count)/\(total) key points, highest hint rung: \(currentHintRung < 0 ? "none" : "R\(currentHintRung)"))."
            onEvaluated(false, demand.propositionId)
        } else {
            let diag = PracticeDiagnosticEngine.diagnoseMiss(
                demand: demand,
                answerText: learnerAnswer,
                confidencePercent: selectedConfidence,
                declinedToGuess: declinedToGuess
            )
            if currentHintRung < diag.nextRung.rawValue {
                currentHintRung = diag.nextRung.rawValue
            }
            diagnosisSummary = "\(diag.missKind.title): \(diag.coachingPrompt)"
            onEvaluated(true, demand.propositionId)
        }
    }
}

// MARK: - 17 Interactive & Printable HTML Exam Papers (MovingWorldBook/exams/ch00.html - ch15.html + mixed.html)

private struct InteractivePrintableExamPapersSection: View {
    @Binding var selectedPaperFile: String

    private let paperFiles: [(id: String, label: String)] = {
        var list = (0...15).map { ch in
            (String(format: "ch%02d", ch), "Ch \(ch) Paper")
        }
        list.insert(("mixed", "Full Mixed Physics Paper"), at: 0)
        return list
    }()

    var body: some View {
        JournalSection(
            title: "17 Interactive & Printable Physics Exam Papers",
            subtitle: "Complete chapter and mixed exam papers from MovingWorldBook/exams/ with step-by-step mark schemes and print layout"
        ) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(paperFiles, id: \.id) { item in
                        StandardFilterChip(item.label, isSelected: selectedPaperFile == item.id) {
                            selectedPaperFile = item.id
                        }
                    }
                }
            }

            JournalCard {
                MovingWorldExamPaperWebView(paperName: selectedPaperFile)
                    .frame(minHeight: 680)
                    .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
            }
        }
    }
}

#if os(macOS)
private struct MovingWorldExamPaperWebView: NSViewRepresentable {
    let paperName: String

    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        loadPaper(in: webView)
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        loadPaper(in: webView)
    }

    private func loadPaper(in webView: WKWebView) {
        let candidates: [URL?] = [
            Bundle.main.url(forResource: paperName, withExtension: "html", subdirectory: "MovingWorldBook/exams"),
            URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/KymPhysics/KymPhysics/Resources/MovingWorldBook/exams/\(paperName).html"),
            URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/exams/\(paperName).html")
        ]
        for case let url? in candidates where FileManager.default.fileExists(atPath: url.path) {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent().deletingLastPathComponent())
            return
        }
    }
}
#else
private struct MovingWorldExamPaperWebView: UIViewRepresentable {
    let paperName: String

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        loadPaper(in: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        loadPaper(in: webView)
    }

    private func loadPaper(in webView: WKWebView) {
        if let url = Bundle.main.url(forResource: paperName, withExtension: "html", subdirectory: "MovingWorldBook/exams") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent().deletingLastPathComponent())
        }
    }
}
#endif
