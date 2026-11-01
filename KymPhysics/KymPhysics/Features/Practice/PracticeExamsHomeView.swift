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
            title: "Proofs, 507 Exam Questions & Diagram Recall",
            subtitle: "16 Chapter Exam Banks · 16 Wolfram Quantitative Drills · Apple Pencil Physics Diagram Recall",
            headerAccessory: {
                ThemePickerMenu()
            }
        ) {
            // 1. Mode Switcher
            HStack(spacing: Spacing.sm) {
                Button { selectedSection = "exams" } label: {
                    JournalChip(
                        title: "507 Chapter Exam Questions (\(store.examAttempts.count) done)",
                        isSelected: selectedSection == "exams"
                    )
                }
                .buttonStyle(.plain)

                Button { selectedSection = "wolfram" } label: {
                    JournalChip(
                        title: "16 Wolfram Quantitative Drills",
                        isSelected: selectedSection == "wolfram"
                    )
                }
                .buttonStyle(.plain)

                Button { selectedSection = "diagrams" } label: {
                    JournalChip(
                        title: "Apple Pencil Diagram Recall (\(store.pack.diagramPlates.count) Plates)",
                        isSelected: selectedSection == "diagrams"
                    )
                }
                .buttonStyle(.plain)

                Button { selectedSection = "papers" } label: {
                    JournalChip(
                        title: "17 Printable & Interactive Papers",
                        isSelected: selectedSection == "papers"
                    )
                }
                .buttonStyle(.plain)

                Button { selectedSection = "speedgym" } label: {
                    JournalChip(
                        title: "SpeedPhysics Mental Gym",
                        isSelected: selectedSection == "speedgym"
                    )
                }
                .buttonStyle(.plain)

                Spacer()
            }

            if selectedSection == "wolfram" {
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
                                Button {
                                    selectedExamChapter = bank.chapter
                                } label: {
                                    JournalChip(
                                        title: "Ch \(bank.chapter) · \(bank.title) (\(bank.questions.count))",
                                        isSelected: selectedExamChapter == bank.chapter
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    HStack(spacing: Spacing.xs) {
                        ForEach(["all", "guided", "independent", "transfer", "paper"], id: \.self) { st in
                            Button {
                                selectedStage = st
                            } label: {
                                JournalChip(
                                    title: st == "all" ? "All Stages" : st.capitalized,
                                    isSelected: selectedStage == st
                                )
                            }
                            .buttonStyle(.plain)
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

                if !question.hints.isEmpty {
                    Text("Hint: \(question.hints.joined(separator: " "))")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }

                LearnerTextInput(
                    placeholder: "Write your physics explanation or calculation with units...",
                    text: $learnerAnswer
                )

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
                                answerText: learnerAnswer
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
                                Text(res.feedback)
                                    .font(.kymaiaCallout.weight(.semibold))
                                    .foregroundStyle(res.isFullPass ? Color.kymaiaSuccess : Color.kymaiaWarning)
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
                        Button {
                            selectedPlateId = plate.id
                            revealedPins.removeAll()
                        } label: {
                            JournalChip(
                                title: "U\(plate.unitNumber) · \(plate.title)",
                                isSelected: activePlate.id == plate.id
                            )
                        }
                        .buttonStyle(.plain)
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
                        Button { scaffoldMode = "label_only" } label: {
                            JournalChip(title: "1. Label Callouts", isSelected: scaffoldMode == "label_only")
                        }
                        .buttonStyle(.plain)

                        Button { scaffoldMode = "ghost_scaffold" } label: {
                            JournalChip(title: "2. Ghost Scaffold", isSelected: scaffoldMode == "ghost_scaffold")
                        }
                        .buttonStyle(.plain)

                        Button { scaffoldMode = "blank_recall" } label: {
                            JournalChip(title: "3. Blank Memory Sketch", isSelected: scaffoldMode == "blank_recall")
                        }
                        .buttonStyle(.plain)

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

                    HStack {
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
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                    }
                }
            }
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
                        Button {
                            selectedPaperFile = item.id
                        } label: {
                            JournalChip(
                                title: item.label,
                                isSelected: selectedPaperFile == item.id
                            )
                        }
                        .buttonStyle(.plain)
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
