import PencilKit
import PhotosUI
import SwiftUI

struct SchoolScienceHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showingScannerSheet = false
    @State private var scannedPageNotes: String = ""
    @State private var selectedPagePhotoItem: PhotosPickerItem? = nil
    @State private var scannedPageImageData: Data? = nil
    @State private var filterQuestionsByActiveTopic: Bool = false
    @State private var activeScratchpadQuestion: SchoolScienceQuestion? = nil

    private var visibleUnits: [SchoolScienceUnit] {
        store.pack.schoolTextbook.units(for: store.selectedSchoolLens)
    }

    private var activeUnit: SchoolScienceUnit? {
        visibleUnits.first(where: { $0.unitNumber == store.selectedUnitNumber }) ?? visibleUnits.first
    }

    private var activeTopic: SchoolScienceTopic? {
        guard let unit = activeUnit else { return nil }
        return unit.topics.first(where: { $0.code == store.selectedTopicCode }) ?? unit.topics.first
    }

    var body: some View {
        JournalPage(
            title: store.pack.schoolTextbook.title,
            subtitle: "\(store.pack.schoolTextbook.authors) · Learner's Book (326 pp.) & Workbook (202 pp.)",
            headerAccessory: {
                HStack(spacing: Spacing.sm) {
                    PhotosPicker(selection: $selectedPagePhotoItem, matching: .images) {
                        Label("Import Page Photo", systemImage: "photo.badge.plus")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    .onChange(of: selectedPagePhotoItem) { _, newItem in
                        guard let newItem else { return }
                        Task {
                            if let data = try? await newItem.loadTransferable(type: Data.self) {
                                await MainActor.run {
                                    scannedPageImageData = data
                                    if scannedPageNotes.isEmpty {
                                        scannedPageNotes = "Imported Learner's Book / Workbook page photo for Topic \(store.selectedTopicCode ?? "9.1"). Select text directly on the image using VisionKit Live Text."
                                    }
                                }
                            }
                        }
                    }

                    Button {
                        showingScannerSheet = true
                    } label: {
                        Label("Scan Book Page", systemImage: "doc.viewfinder")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    ThemePickerMenu()
                }
            }
        ) {
            // 1. 3-Lens Discipline Filter
            JournalSection(
                title: "Curriculum Lens",
                subtitle: store.selectedSchoolLens.subtitle
            ) {
                HStack(spacing: Spacing.sm) {
                    ForEach(ScienceDisciplineLens.allCases) { lens in
                        Button {
                            store.selectedSchoolLens = lens
                            if let first = store.pack.schoolTextbook.units(for: lens).first,
                               !store.pack.schoolTextbook.units(for: lens).contains(where: { $0.unitNumber == store.selectedUnitNumber }) {
                                store.selectedUnitNumber = first.unitNumber
                                store.selectedTopicCode = first.topics.first?.code
                            }
                        } label: {
                            JournalChip(
                                title: lens.title,
                                isSelected: store.selectedSchoolLens == lens
                            )
                        }
                        .buttonStyle(.plain)
                    }
                    Spacer()
                }
            }

            // 2. Unit Strip
            JournalSection(title: "Units in View") {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Spacing.md) {
                        ForEach(visibleUnits) { unit in
                            let isSelected = activeUnit?.unitNumber == unit.unitNumber
                            let snap = store.unitReadiness(for: unit)
                            Button {
                                store.selectedUnitNumber = unit.unitNumber
                                store.selectedTopicCode = unit.topics.first?.code
                            } label: {
                                JournalCard {
                                    VStack(alignment: .leading, spacing: Spacing.xs) {
                                        HStack {
                                            JournalBadge(
                                                text: unit.disciplineBadgeLabel,
                                                tone: unit.isCorePhysics ? .accent : .neutral
                                            )
                                            Spacer()
                                            JournalBadge(
                                                text: unit.isCompletedInSchool ? "✓ Ticked in book" : "Upcoming",
                                                tone: unit.isCompletedInSchool ? .positive : .warning
                                            )
                                        }
                                        Text("Unit \(unit.unitNumber): \(unit.title)")
                                            .font(.kymaiaHeadline)
                                            .foregroundStyle(Color.kymaiaInk)
                                        Text("LB pp. \(unit.learnersBookStartPage)–\(unit.learnersBookEndPage) · WB pp. \(unit.workbookStartPage)–\(unit.workbookEndPage)")
                                            .font(.kymaiaCaption.monospacedDigit())
                                            .foregroundStyle(Color.kymaiaMutedInk)
                                        Text(snap.readinessBadgeText)
                                            .font(.kymaiaCaption.weight(.semibold))
                                            .foregroundStyle(Color.kymaiaPrimary)
                                    }
                                    .frame(width: 260, alignment: .leading)
                                }
                                .overlay(
                                    RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous)
                                        .stroke(isSelected ? Color.kymaiaPrimary : Color.clear, lineWidth: 2)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            // 3. Active Unit & Sub-Topic Detail
            if let unit = activeUnit {
                JournalSection(
                    title: "Unit \(unit.unitNumber) · \(unit.title) Sub-Topics",
                    subtitle: unit.scienceStrands.joined(separator: " · ")
                ) {
                    FlowLayout(spacing: Spacing.xs) {
                        ForEach(unit.topics) { topic in
                            Button {
                                store.selectedTopicCode = topic.code
                            } label: {
                                JournalChip(
                                    title: "\(topic.code) \(topic.title) (LB p.\(topic.learnersBookPage) / WB p.\(topic.workbookPage))",
                                    isSelected: activeTopic?.code == topic.code
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if let topic = activeTopic {
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.md) {
                                HStack {
                                    JournalBadge(text: "Topic \(topic.code)", tone: .accent)
                                    Text(topic.title)
                                        .font(.kymaiaTitle3)
                                        .foregroundStyle(Color.kymaiaInk)
                                    Spacer()
                                    Text("Learner's Book p. \(topic.learnersBookPage) · Workbook p. \(topic.workbookPage)")
                                        .font(.kymaiaCaption.monospacedDigit())
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                }

                                Text(topic.summary)
                                    .font(.kymaiaReadingBody)
                                    .foregroundStyle(Color.kymaiaInk)

                                // Cambridge Mark-Scheme Watchouts
                                if !topic.cambridgeWatchouts.isEmpty {
                                    VStack(alignment: .leading, spacing: Spacing.xs) {
                                        Label("Cambridge 0893 Mark-Scheme Watchouts", systemImage: "exclamationmark.triangle.fill")
                                            .font(.kymaiaCaption.weight(.bold))
                                            .foregroundStyle(Color.kymaiaWarning)
                                        ForEach(topic.cambridgeWatchouts, id: \.self) { watchout in
                                            Text("• \(watchout)")
                                                .font(.kymaiaCallout)
                                                .foregroundStyle(Color.kymaiaInk)
                                        }
                                    }
                                    .padding(Spacing.md)
                                    .background(
                                        RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                            .fill(Color.kymaiaSelectionFill)
                                    )
                                }

                                // 1-Tap Deep First-Principles Links into The Moving World & Live Labs
                                HStack(spacing: Spacing.sm) {
                                    ForEach(topic.movingWorldChapters, id: \.self) { chNum in
                                        let chTitle = store.pack.chapters.first(where: { $0.number == chNum })?.title ?? "Ch \(chNum)"
                                        Button {
                                            store.activeMovingWorldChapter = chNum
                                            store.selectedRoom = .movingWorld
                                        } label: {
                                            Label("Ch \(chNum): \(chTitle)", systemImage: "book.pages.fill")
                                                .font(.kymaiaCaption.weight(.semibold))
                                        }
                                        .buttonStyle(.borderedProminent)
                                        .tint(Color.kymaiaPrimary)
                                    }

                                    ForEach(topic.linkedWidgets, id: \.self) { wId in
                                        Button {
                                            store.activeWidgetId = wId
                                            store.selectedRoom = .labsExplorers
                                        } label: {
                                            Label("Open \(wId) Lab", systemImage: "gyroscope")
                                                .font(.kymaiaCaption.weight(.semibold))
                                        }
                                        .buttonStyle(.bordered)
                                    }
                                }
                            }
                        }
                    }
                }

                // 4. Cross-Disciplinary First-Principles Bridges (KymChem & KymBio)
                let unitBridges = store.bridges(forUnit: unit.unitNumber)
                if !unitBridges.isEmpty {
                    JournalSection(
                        title: "First-Principles Chemistry & Biology Bridges",
                        subtitle: "Where Physics governs molecules in KymChem and living systems in KymBio"
                    ) {
                        VStack(spacing: Spacing.md) {
                            ForEach(unitBridges) { bridge in
                                CrossDisciplinaryBridgeCard(bridge: bridge)
                            }
                        }
                    }
                }

                // 4b. Scanned / Imported Book Page (VisionKit Live Text + Notes)
                if scannedPageImageData != nil || !scannedPageNotes.isEmpty {
                    JournalSection(
                        title: "Scanned & Imported Book Page (VisionKit Live Text)",
                        subtitle: "Select, copy, or Look Up any printed question or table directly on the page image"
                    ) {
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.md) {
                                if let imageData = scannedPageImageData {
                                    LiveTextPageImage(imageData: imageData)
                                        .frame(maxHeight: 380)
                                        .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
                                }

                                WritingTextEditor(
                                    text: $scannedPageNotes,
                                    placeholder: "Scanned or recognized page notes..."
                                )
                                .frame(minHeight: 90)

                                HStack(spacing: Spacing.sm) {
                                    Button {
                                        let now = Date()
                                        let entry = LabJournalEntryRecord(
                                            id: "scan-\(Int(now.timeIntervalSince1970))",
                                            title: "Scanned Book Page · Unit \(unit.unitNumber) (\(activeTopic?.code ?? "\(unit.unitNumber).1"))",
                                            templateKind: "cornell",
                                            paperStyle: "cornell",
                                            linkedTopicCode: activeTopic?.code,
                                            linkedChapterNumber: activeTopic?.movingWorldChapters.first ?? store.activeMovingWorldChapter,
                                            linkedWidgetId: nil,
                                            cueColumnText: "Learner's Book / Workbook page scan (\(activeTopic?.code ?? ""))",
                                            bodyNotesText: scannedPageNotes,
                                            summaryText: "Saved from School Science 8 Page Scanner.",
                                            hypothesisText: "",
                                            independentVarText: "",
                                            dependentVarText: "",
                                            controlVarsText: "",
                                            drawingData: nil,
                                            snapshotPNGData: scannedPageImageData,
                                            createdAt: now,
                                            updatedAt: now
                                        )
                                        store.saveJournalEntry(entry)
                                        store.activeJournalEntry = entry
                                        store.selectedRoom = .labJournal
                                    } label: {
                                        Label("Save Page to Lab Notebook", systemImage: "square.and.arrow.down.fill")
                                            .font(.kymaiaCaption.weight(.semibold))
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .tint(Color.kymaiaPrimary)

                                    Button("Clear Scanned Page") {
                                        scannedPageImageData = nil
                                        scannedPageNotes = ""
                                    }
                                    .buttonStyle(.bordered)
                                }
                            }
                        }
                    }
                }

                // 5. Learner's Book & Workbook Question Proofs (Worked Example -> Faded -> Independent Proof)
                let allUnitQuestions = store.questions(forUnit: unit.unitNumber)
                let unitQuestions = filterQuestionsByActiveTopic && activeTopic != nil
                    ? store.questions(forUnit: unit.unitNumber, topicCode: activeTopic?.code)
                    : allUnitQuestions

                JournalSection(
                    title: "Learner's Book & Workbook Question Proofs (Unit \(unit.unitNumber))",
                    subtitle: "Assistance is always honest: use the Worked Example or Faded Blank to learn, then answer independently to prove it"
                ) {
                    if !allUnitQuestions.isEmpty, let topic = activeTopic {
                        HStack(spacing: Spacing.xs) {
                            Button {
                                filterQuestionsByActiveTopic = false
                            } label: {
                                JournalChip(
                                    title: "All Unit \(unit.unitNumber) (\(allUnitQuestions.count))",
                                    isSelected: !filterQuestionsByActiveTopic
                                )
                            }
                            .buttonStyle(.plain)

                            Button {
                                filterQuestionsByActiveTopic = true
                            } label: {
                                let topicCount = store.questions(forUnit: unit.unitNumber, topicCode: topic.code).count
                                JournalChip(
                                    title: "Topic \(topic.code) Only (\(topicCount))",
                                    isSelected: filterQuestionsByActiveTopic
                                )
                            }
                            .buttonStyle(.plain)

                            Spacer()
                        }
                    }

                    if unitQuestions.isEmpty {
                        JournalEmptyState(
                            symbol: "arrow.up.forward.app.fill",
                            title: "Sibling Science Unit",
                            message: "This unit is primarily covered in KymBio or KymChem. Switch to Physics Units (3, 6, 9) or tap a bridge above to jump across."
                        )
                    } else {
                        VStack(spacing: Spacing.md) {
                            ForEach(unitQuestions) { question in
                                SchoolQuestionProofCard(
                                    question: question,
                                    onOpenScratchpad: {
                                        activeScratchpadQuestion = question
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showingScannerSheet) {
            DocumentScannerSheet(recognizedText: $scannedPageNotes)
        }
        .sheet(item: $activeScratchpadQuestion) { question in
            PhysicsScratchpadSheet(question: question)
                .environmentObject(store)
        }
    }
}

// MARK: - Cross-Disciplinary Bridge Card

private struct CrossDisciplinaryBridgeCard: View {
    @Environment(\.openURL) private var openURL
    let bridge: CrossDisciplinaryBridge
    @State private var showMicroAnswer = false

    var body: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                HStack {
                    JournalBadge(
                        text: bridge.sourceBook,
                        tone: bridge.isChemistry ? .accent : .positive
                    )
                    Text(bridge.sourceRef)
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                    Spacer()
                    Text("Topics \(bridge.schoolTopics.joined(separator: ", "))")
                        .font(.kymaiaCaption.monospacedDigit())
                        .foregroundStyle(Color.kymaiaSecondary)
                }

                Text(bridge.title)
                    .font(.kymaiaHeadline)
                    .foregroundStyle(Color.kymaiaInk)

                Text(bridge.summary)
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaInk)

                Text(bridge.keyEquation)
                    .font(.system(.callout, design: .monospaced).weight(.semibold))
                    .foregroundStyle(Color.kymaiaPrimary)
                    .padding(.vertical, Spacing.xxs)

                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text("Bridge Micro-Check: \(bridge.microCheckQuestion)")
                        .font(.kymaiaCallout.weight(.medium))
                        .foregroundStyle(Color.kymaiaInk)
                    if showMicroAnswer {
                        Text(bridge.microCheckAnswer)
                            .font(.kymaiaCallout)
                            .foregroundStyle(Color.kymaiaSecondary)
                    }
                    HStack {
                        Button(showMicroAnswer ? "Hide Answer" : "Check Bridge Answer") {
                            showMicroAnswer.toggle()
                        }
                        .buttonStyle(.bordered)

                        if let url = URL(string: bridge.deepLink) {
                            Button {
                                openURL(url)
                            } label: {
                                Label(
                                    bridge.isChemistry ? "Open in KymChem" : "Open in KymBio",
                                    systemImage: "arrow.up.forward.app"
                                )
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Worked Example -> Faded Completion -> Independent Proof Card

struct SchoolQuestionProofCard: View {
    @EnvironmentObject private var store: AppStore
    let question: SchoolScienceQuestion
    let onOpenScratchpad: () -> Void

    @State private var mode: String = "independent" // "worked" | "faded" | "independent"
    @State private var usedAssistanceThisSession = false
    @State private var fadedInput: String = ""
    @State private var independentAnswer: String = ""
    @State private var lastResult: QuestionEvaluationResult? = nil

    private var currentLevel: QuestionProofLevel {
        store.proofLevel(for: question.id)
    }

    var body: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    JournalBadge(text: question.sourceBadgeTitle, tone: .accent)
                    Text("\(question.bookSection) · [\(question.marks) marks]")
                        .font(.kymaiaCaption.monospacedDigit())
                        .foregroundStyle(Color.kymaiaMutedInk)
                    Spacer()
                    JournalBadge(
                        text: currentLevel.displayTitle,
                        tone: currentLevel.isIndependentProof ? .positive : .neutral
                    )
                }

                Text(question.prompt)
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaInk)

                // 3-Tier Scaffold Switcher
                HStack(spacing: Spacing.sm) {
                    Button {
                        mode = "worked"
                        usedAssistanceThisSession = true
                    } label: {
                        JournalChip(title: "1. Worked Example", isSelected: mode == "worked")
                    }
                    .buttonStyle(.plain)

                    Button {
                        mode = "faded"
                        usedAssistanceThisSession = true
                    } label: {
                        JournalChip(title: "2. Faded Blank", isSelected: mode == "faded")
                    }
                    .buttonStyle(.plain)

                    Button {
                        mode = "independent"
                    } label: {
                        JournalChip(title: "3. Independent Proof", isSelected: mode == "independent")
                    }
                    .buttonStyle(.plain)

                    Spacer()

                    Button {
                        onOpenScratchpad()
                    } label: {
                        Label("Pencil Working", systemImage: "pencil.tip.crop.circle")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                }

                if mode == "worked" {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text("Step-by-Step Worked Example (Assisted Mode)")
                            .font(.kymaiaCaption.weight(.bold))
                            .foregroundStyle(Color.kymaiaSecondary)
                        Text(question.workedExample)
                            .font(.kymaiaReadingBody)
                            .foregroundStyle(Color.kymaiaInk)
                    }
                    .padding(Spacing.md)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                            .fill(Color.kymaiaSelectionFill)
                    )
                } else if mode == "faded" {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        Text("Faded Completion (Fill the missing physics terms)")
                            .font(.kymaiaCaption.weight(.bold))
                            .foregroundStyle(Color.kymaiaSecondary)
                        Text(question.fadedPrompt)
                            .font(.kymaiaReadingBody)
                            .foregroundStyle(Color.kymaiaInk)
                        TextField("Type the missing terms...", text: $fadedInput)
                            .textFieldStyle(.roundedBorder)
                        Text("Expected blanks: \(question.fadedAnswer)")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaMutedInk)
                    }
                    .padding(Spacing.md)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                            .fill(Color.kymaiaSelectionFill)
                    )
                }

                // Independent Answer Box (with .writingToolsBehavior(.none) per iOS 27 honesty rule)
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    HStack {
                        Text(usedAssistanceThisSession ? "Guided Answer (Viewed Scaffold)" : "Independent Proof Answer")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaMutedInk)
                        Spacer()
                        if usedAssistanceThisSession {
                            Button("Reset for Fresh Independent Attempt") {
                                usedAssistanceThisSession = false
                                mode = "independent"
                                independentAnswer = ""
                                lastResult = nil
                            }
                            .font(.kymaiaCaption)
                        }
                    }

                    LearnerTextInput(
                        placeholder: "Write your full explanation or calculation with units...",
                        text: $independentAnswer
                    )

                    HStack {
                        Button {
                            lastResult = store.submitQuestionAttempt(
                                question: question,
                                answerText: independentAnswer,
                                usedAssistance: usedAssistanceThisSession
                            )
                        } label: {
                            Label(
                                usedAssistanceThisSession ? "Check Guided Answer" : "Submit Independent Proof",
                                systemImage: "checkmark.seal.fill"
                            )
                            .font(.kymaiaCallout.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                        .disabled(independentAnswer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                        Button {
                            store.activeMovingWorldChapter = question.linkedChapter
                            store.selectedRoom = .movingWorld
                        } label: {
                            Label("Ch \(question.linkedChapter)", systemImage: "book.pages")
                                .font(.kymaiaCaption)
                        }
                        .buttonStyle(.bordered)

                        if !question.linkedWidget.isEmpty {
                            Button {
                                store.activeWidgetId = question.linkedWidget
                                store.selectedRoom = .labsExplorers
                            } label: {
                                Label("Open \(question.linkedWidget)", systemImage: "gyroscope")
                                    .font(.kymaiaCaption)
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }

                if let res = lastResult {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text(res.feedbackSummary)
                            .font(.kymaiaCallout.weight(.semibold))
                            .foregroundStyle(res.isPass ? Color.kymaiaSuccess : Color.kymaiaWarning)
                        Text("Cambridge Model Answer: \(question.modelAnswer)")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaMutedInk)
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

// MARK: - Split-Screen Apple Pencil Physics Scratchpad Sheet with Physics Stamps

struct PhysicsScratchpadSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let question: SchoolScienceQuestion

    @State private var attemptNumber: Int = 1
    @State private var paperStyle: JournalPaperStyle = .grid
    @State private var selectedStamp: String = "free_body_axes"
    @State private var strokeNotes: String = ""
    @State private var pencilDrawingData: Data = Data()
    @State private var pencilSnapshotPNG: Data? = nil

    private let stamps: [(id: String, label: String, symbol: String)] = [
        ("free_body_axes", "Free-Body Axes (+x, +y)", "arrow.up.and.right.circle"),
        ("ray_normal", "Mirror / Boundary + 90° Normal", "line.diagonal"),
        ("formula_triangle", "Formula Triangle (d/v·t, F/P·A, V/I·R)", "triangle"),
        ("distance_time_axes", "Distance–Time Graph Axes", "chart.xyaxis.line")
    ]

    var body: some View {
        JournalFocusPage(
            title: "Physics Pencil Scratchpad · Topic \(question.topicCode)",
            subtitle: "Attempt #\(attemptNumber) (fresh canvas per attempt — never overwrites prior working)"
        ) {
            HStack {
                Button("Close") { dismiss() }
                    .buttonStyle(.bordered)
            }
        } content: {
            VStack(alignment: .leading, spacing: Spacing.md) {
                JournalCard {
                    Text(question.prompt)
                        .font(.kymaiaReadingBody)
                        .foregroundStyle(Color.kymaiaInk)
                }

                HStack(spacing: Spacing.sm) {
                    Text("Stamp:")
                        .font(.kymaiaCaption.weight(.semibold))
                    ForEach(stamps, id: \.id) { stamp in
                        Button {
                            selectedStamp = stamp.id
                        } label: {
                            JournalChip(
                                title: stamp.label,
                                isSelected: selectedStamp == stamp.id
                            )
                        }
                        .buttonStyle(.plain)
                    }
                    Spacer()
                    Button("New Attempt #\(attemptNumber + 1)") {
                        attemptNumber += 1
                        strokeNotes = ""
                        pencilDrawingData = Data()
                        pencilSnapshotPNG = nil
                    }
                    .buttonStyle(.bordered)
                }

                JournalPaperSheet(style: paperStyle, minHeight: 420) {
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        PhysicsStampOverlayView(stampId: selectedStamp)
                            .frame(height: 120)

                        DrawingCanvas(
                            drawingData: $pencilDrawingData,
                            snapshotPNG: $pencilSnapshotPNG,
                            title: "Apple Pencil Working Canvas (Attempt #\(attemptNumber))",
                            subtitle: "Sketch free-body forces, ray paths, or step-by-step algebra — tap Ink → Text to convert handwriting",
                            showGrid: true,
                            initialSize: .standard
                        ) { recognized in
                            if strokeNotes.isEmpty {
                                strokeNotes = recognized
                            } else {
                                strokeNotes += "\n" + recognized
                            }
                        }

                        WritingTextEditor(
                            text: $strokeNotes,
                            placeholder: "Additional typed or OCR-converted equations & notes..."
                        )
                        .frame(minHeight: 100)
                    }
                    .padding(Spacing.md)
                }

                HStack {
                    Button {
                        let data = pencilDrawingData.isEmpty ? Data(strokeNotes.utf8) : pencilDrawingData
                        let preview = pencilSnapshotPNG ?? data
                        store.saveScratchpad(
                            questionId: question.id,
                            attemptNumber: attemptNumber,
                            paperStyle: "grid",
                            stampKind: selectedStamp,
                            drawingData: data,
                            previewPNGData: preview,
                            strokeCount: max(1, data.count)
                        )
                        dismiss()
                    } label: {
                        Label("Save Working to Attempt #\(attemptNumber)", systemImage: "tray.and.arrow.down.fill")
                            .font(.kymaiaCallout.weight(.semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)
                }
            }
        }
        .onAppear {
            if let existing = store.fetchScratchpad(questionId: question.id, attemptNumber: attemptNumber) {
                pencilDrawingData = existing.drawingData
                pencilSnapshotPNG = existing.previewPNGData
            }
        }
    }
}

private struct PhysicsStampOverlayView: View {
    let stampId: String

    var body: some View {
        Canvas { context, size in
            let midX = size.width * 0.5
            let midY = size.height * 0.5
            var path = Path()

            switch stampId {
            case "free_body_axes":
                path.move(to: CGPoint(x: midX - 90, y: midY))
                path.addLine(to: CGPoint(x: midX + 90, y: midY))
                path.move(to: CGPoint(x: midX, y: midY - 55))
                path.addLine(to: CGPoint(x: midX, y: midY + 55))
                let box = CGRect(x: midX - 18, y: midY - 18, width: 36, height: 36)
                context.stroke(Path(box), with: .color(.kymaiaPrimary), lineWidth: 2)
            case "ray_normal":
                path.move(to: CGPoint(x: midX - 120, y: midY + 20))
                path.addLine(to: CGPoint(x: midX + 120, y: midY + 20))
                var normal = Path()
                normal.move(to: CGPoint(x: midX, y: midY - 55))
                normal.addLine(to: CGPoint(x: midX, y: midY + 55))
                context.stroke(normal, with: .color(.kymaiaSecondary), style: StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
            case "formula_triangle":
                path.move(to: CGPoint(x: midX, y: midY - 50))
                path.addLine(to: CGPoint(x: midX - 70, y: midY + 45))
                path.addLine(to: CGPoint(x: midX + 70, y: midY + 45))
                path.closeSubpath()
                path.move(to: CGPoint(x: midX - 42, y: midY + 5))
                path.addLine(to: CGPoint(x: midX + 42, y: midY + 5))
                path.move(to: CGPoint(x: midX, y: midY + 5))
                path.addLine(to: CGPoint(x: midX, y: midY + 45))
            default:
                path.move(to: CGPoint(x: midX - 100, y: midY + 45))
                path.addLine(to: CGPoint(x: midX - 100, y: midY - 45))
                path.move(to: CGPoint(x: midX - 100, y: midY + 45))
                path.addLine(to: CGPoint(x: midX + 100, y: midY + 45))
            }
            context.stroke(path, with: .color(.kymaiaPrimary), lineWidth: 2)
        }
    }
}
