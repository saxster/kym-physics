import SwiftUI

struct TodayHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var revealedCardId: String? = nil
    @State private var showDailyRitualSheet: Bool = false
    @State private var show15MinFlowSheet: Bool = false

    private var dailyFlowPlan: DailyPhysicsFlowPlan? {
        DailyPhysicsFlowEngine.buildPlan(
            chapters: store.pack.chapters,
            schoolQuestions: store.pack.schoolQuestions,
            cards: store.fsrsCards,
            readingProgress: store.readingProgress,
            questionProofs: store.questionProofs,
            preferredChapterNumber: store.activeMovingWorldChapter,
            preferredUnitNumber: store.selectedUnitNumber
        )
    }

    private var physicsUnits: [SchoolScienceUnit] {
        store.pack.schoolTextbook.units(for: .physicsCore)
    }

    private var totalProvenQuestions: Int {
        store.questionProofs.values.filter { $0.level.isIndependentProof }.count
    }

    var body: some View {
        JournalPage(
            eyebrow: AppRoom.today.title,
            title: "Today in Physics",
            subtitle: "Cambridge Lower Secondary Science 8 · The Moving World",
            headerAccessory: {
                HStack(spacing: Spacing.sm) {
                    Button {
                        showDailyRitualSheet = true
                    } label: {
                        Label("Start 25-Min Daily Ritual", systemImage: "sparkles")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(BrassButtonStyle())

                    StandardThemeMenu()
                }
            }
        ) {
            // 0. Guided 7-Phase Daily Physics Ritual Hero Card
            JournalCard {
                HStack(alignment: .center, spacing: Spacing.md) {
                    Image(systemName: "flame.circle.fill")
                        .font(PhysicsFigureType.ritualHeroGlyph)
                        .foregroundStyle(Color.kymaiaPrimary)

                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: Spacing.xs) {
                            JournalBadge(text: "7-Phase Guided Loop · 25 min", tone: .accent)
                            JournalBadge(text: "Identity Prime → Warm Retrieval → Struggle Zone → Breakthrough", tone: .neutral)
                        }
                        Text("Ready for Today's Guided Physics Ritual?")
                            .font(.kymaiaHeadline)
                            .foregroundStyle(Color.kymaiaInk)
                        Text("Walks through 3 guaranteed-win FSRS cards, 1 independent Workbook/Learner's Book proof with Apple Pencil & spoken dictation, a curiosity hook, and a 1-sentence lab reflection.")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaMutedInk)
                    }

                    Spacer()

                    Button {
                        showDailyRitualSheet = true
                    } label: {
                        Label("Launch Ritual", systemImage: "play.fill")
                            .font(.kymaiaCallout.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    .tint(Color.kymaiaPrimary)
                }
            }
            .sheet(isPresented: $showDailyRitualSheet) {
                PhysicsDailyRitualSessionView()
                    .environmentObject(store)
            }
            .sheet(isPresented: $show15MinFlowSheet) {
                if let plan = dailyFlowPlan {
                    DailyPhysicsFlowPlayerSheet(plan: plan)
                        .environmentObject(store)
                }
            }

            // 0b. SmartyMe + Brilliant 15-Minute Daily Physics Flow Card
            if let plan = dailyFlowPlan {
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        HStack(alignment: .center, spacing: Spacing.sm) {
                            JournalBadge(text: "SmartyMe × Brilliant · \(plan.totalMinutes) min", tone: .accent)
                            JournalBadge(text: "4 Bite-Sized Interactive Stages", tone: .neutral)
                            Spacer()
                            Button {
                                show15MinFlowSheet = true
                            } label: {
                                Label("Start 15-Min Physics Flow", systemImage: "bolt.circle.fill")
                                    .font(.kymaiaCallout.weight(.semibold))
                            }
                            .buttonStyle(BrassButtonStyle())
                        }

                        Text("Today's 15-Minute Micro-Mastery Flow")
                            .font(.kymaiaHeadline)
                            .foregroundStyle(Color.kymaiaInk)

                        LazyVGrid(
                            columns: [
                                GridItem(.flexible(), spacing: Spacing.sm),
                                GridItem(.flexible(), spacing: Spacing.sm)
                            ],
                            spacing: Spacing.sm
                        ) {
                            ForEach(plan.stages) { stage in
                                HStack(alignment: .top, spacing: Spacing.xs) {
                                    Image(systemName: stage.kind.systemImage)
                                        .foregroundStyle(Color.kymaiaPrimary)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("\(stage.kind.rawValue) (\(stage.estimatedMinutes)m)")
                                            .font(.kymaiaCaption.weight(.bold))
                                            .foregroundStyle(Color.kymaiaInk)
                                        Text(stage.title)
                                            .font(.kymaiaCaption)
                                            .foregroundStyle(Color.kymaiaMutedInk)
                                            .lineLimit(1)
                                    }
                                    Spacer()
                                }
                                .padding(Spacing.sm)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                                        .fill(Color.kymaiaControlFill)
                                )
                            }
                        }
                    }
                }

                // Visual Intuition -> "Aha!" Invariant -> Symbolic Formula Spotlight
                JournalSection(
                    title: "Today's Visual Intuition → Formula Bridge (Ch \(plan.targetChapter.number))",
                    subtitle: "Tap any symbol chip to run a Brilliant-style perturbation check before touching an equation"
                ) {
                    PhysicsIntuitionFormulaBridgeCard(bridge: plan.targetChapter.intuitionToFormula)
                }
            }

            // 1. Glance Metrics Strip
            JournalSection(title: "At a glance") {
                LazyVGrid(
                    columns: [
                        GridItem(.flexible(), spacing: Spacing.md),
                        GridItem(.flexible(), spacing: Spacing.md),
                        GridItem(.flexible(), spacing: Spacing.md),
                        GridItem(.flexible(), spacing: Spacing.md)
                    ],
                    spacing: Spacing.md
                ) {
                    JournalGlanceTile(
                        label: "Due cards",
                        value: "\(store.dueFSRSCards.count)",
                        detail: "FSRS spaced retrieval",
                        symbol: "rectangle.stack.fill"
                    )
                    JournalGlanceTile(
                        label: "School proofs",
                        value: "\(totalProvenQuestions)/\(store.pack.schoolQuestions.count)",
                        detail: "Independent pass",
                        symbol: "checkmark.seal.fill"
                    )
                    JournalGlanceTile(
                        label: "Exam bank",
                        value: "\(store.examAttempts.count)/\(store.totalExamQuestionsCount)",
                        detail: "16 chapter papers",
                        symbol: "doc.text.magnifyingglass"
                    )
                    JournalGlanceTile(
                        label: "Lab stamps",
                        value: "\(store.widgetStamps.count)/\(store.pack.widgets.count)",
                        detail: "Interactive physics labs",
                        symbol: "seal.fill"
                    )
                }
            }

            // 2. Upcoming Unit 9: Magnetism Spotlight + Covered Units 3 & 6
            JournalSection(
                title: "Your School Physics Units",
                subtitle: "Units 3 & 6 ticked ✓ in your Learner's Book 8 · Unit 9 Magnetism is up next"
            ) {
                VStack(spacing: Spacing.md) {
                    ForEach(physicsUnits) { unit in
                        let snap = store.unitReadiness(for: unit)
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.sm) {
                                HStack(alignment: .firstTextBaseline) {
                                    JournalBadge(
                                        text: unit.isCompletedInSchool ? "Covered in school ✓" : "Upcoming unit",
                                        tone: unit.isCompletedInSchool ? .positive : .accent
                                    )
                                    Text("Unit \(unit.unitNumber) · \(unit.title)")
                                        .font(.kymaiaHeadline)
                                        .foregroundStyle(Color.kymaiaInk)
                                    Spacer()
                                    JournalBadge(text: snap.readinessBadgeText, tone: .neutral)
                                }

                                Text("Learner's Book pp. \(unit.learnersBookStartPage)–\(unit.learnersBookEndPage) · Workbook pp. \(unit.workbookStartPage)–\(unit.workbookEndPage) · \(unit.topics.count) sub-topics")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)

                                FlowLayout(spacing: Spacing.xs) {
                                    ForEach(unit.topics) { topic in
                                        StandardFilterChip("\(topic.code) \(topic.title)", isSelected: store.selectedTopicCode == topic.code) {
                                            store.selectedUnitNumber = unit.unitNumber
                                            store.selectedTopicCode = topic.code
                                            store.selectedRoom = .schoolScience
                                        }
                                    }
                                }

                                HStack(spacing: Spacing.md) {
                                    Button {
                                        store.selectedUnitNumber = unit.unitNumber
                                        store.selectedTopicCode = unit.topics.first?.code
                                        store.selectedRoom = .schoolScience
                                    } label: {
                                        Label("Open Unit \(unit.unitNumber)", systemImage: "book.closed.fill")
                                            .font(.kymaiaCallout.weight(.semibold))
                                    }
                                    .buttonStyle(.bordered)
                                    .tint(Color.kymaiaPrimary)

                                    if let firstCh = unit.movingWorldChapters.first {
                                        Button {
                                            store.activeMovingWorldChapter = firstCh
                                            store.selectedRoom = .movingWorld
                                        } label: {
                                            Label("Read Moving World Ch \(firstCh)", systemImage: "globe.asia.australia.fill")
                                                .font(.kymaiaCallout)
                                        }
                                        .buttonStyle(.bordered)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 3. FSRS Spaced Retrieval Queue
            JournalSection(
                title: "Today's Spaced Retrieval Queue",
                subtitle: "Retrieve from memory before flipping — honest ratings train your FSRS interval"
            ) {
                if let topCard = store.dueFSRSCards.first {
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            HStack {
                                JournalBadge(text: "Topic \(topCard.topicCode) · Ch \(topCard.chapterNumber)", tone: .accent)
                                Spacer()
                                Text("\(store.dueFSRSCards.count) due now")
                                    .font(.kymaiaCaption.monospacedDigit())
                                    .foregroundStyle(Color.kymaiaMutedInk)
                            }

                            Text(topCard.frontPrompt)
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaInk)

                            if revealedCardId == topCard.id {
                                Divider()
                                Text("Model Answer")
                                    .font(.kymaiaCaption.weight(.semibold))
                                    .foregroundStyle(Color.kymaiaSecondary)
                                Text(topCard.backAnswer)
                                    .font(.kymaiaReadingBody)
                                    .foregroundStyle(Color.kymaiaInk)

                                HStack(spacing: Spacing.sm) {
                                    ForEach(FSRSRating.allCases, id: \.rawValue) { rating in
                                        Button {
                                            store.reviewFSRSCard(topCard, rating: rating)
                                            revealedCardId = nil
                                        } label: {
                                            Text(rating.title)
                                                .font(.kymaiaCallout.weight(.semibold))
                                                .frame(maxWidth: .infinity, minHeight: AccessibilityLayout.minTouchTarget)
                                        }
                                        .buttonStyle(.bordered)
                                        .tint(rating == .again ? Color.kymaiaWarning : Color.kymaiaPrimary)
                                    }
                                }
                            } else {
                                Button {
                                    revealedCardId = topCard.id
                                } label: {
                                    Label("Reveal Model Answer", systemImage: "eye.fill")
                                        .font(.kymaiaCallout.weight(.semibold))
                                        .frame(minHeight: AccessibilityLayout.minTouchTarget)
                                }
                                .buttonStyle(.bordered)
                                .tint(Color.kymaiaPrimary)
                            }
                        }
                    }
                } else {
                    EmptyStateCard(
                        eyebrow: "Review",
                        title: "All due Physics cards reviewed!",
                        subtitle: "You are caught up for today. Jump into Unit 9 Magnetism or try a 3D Physics Lab."
                    )
                }
            }

            // 4. Featured Explorers & Next Deadlines
            JournalSection(
                title: "Front-Matter Explorers & Upcoming Deadlines",
                subtitle: "Sweep 41 orders of magnitude, inspect the Mumbai sky, or plan your next Science check"
            ) {
                LazyVGrid(
                    columns: [GridItem(.flexible(), spacing: Spacing.md), GridItem(.flexible(), spacing: Spacing.md)],
                    spacing: Spacing.md
                ) {
                    ForEach(store.pack.explorers) { explorer in
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                HStack {
                                    Image(systemName: explorer.symbol)
                                        .foregroundStyle(Color.kymaiaPrimary)
                                    Text(explorer.title)
                                        .font(.kymaiaHeadline)
                                        .foregroundStyle(Color.kymaiaInk)
                                    Spacer()
                                }
                                Text(explorer.subtitle)
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)
                                Button {
                                    store.activeExplorerId = explorer.id
                                    store.selectedRoom = .labsExplorers
                                } label: {
                                    Label("Launch Explorer", systemImage: "arrow.up.right.square")
                                        .font(.kymaiaCaption.weight(.semibold))
                                }
                                .buttonStyle(.bordered)
                                .padding(.top, Spacing.xs)
                            }
                        }
                    }
                }
            }
        }
    }
}


// MARK: - SmartyMe × Brilliant 15-Minute Daily Physics Flow Sheet

struct DailyPhysicsFlowPlayerSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let plan: DailyPhysicsFlowPlan

    @State private var currentStageIndex: Int = 0
    @State private var currentCardIndex: Int = 0
    @State private var revealedCardBack: Bool = false
    @State private var quantInput: String = ""
    @State private var quantResult: QuantitativeCheckResult? = nil
    @State private var proofInput: String = ""
    @State private var proofResult: QuestionEvaluationResult? = nil
    @State private var audioNarrator = ChapterAudioNarrator()

    private var activeStage: DailyPhysicsFlowStage {
        plan.stages[min(max(0, currentStageIndex), plan.stages.count - 1)]
    }

    var body: some View {
        JournalFocusPage(
            title: "15-Minute Daily Physics Flow",
            subtitle: "\(activeStage.kind.rawValue) · \(activeStage.estimatedMinutes) min",
            close: {
                audioNarrator.stop()
                dismiss()
            },
            headerAccessory: {
                HStack(spacing: Spacing.xs) {
                    ForEach(Array(plan.stages.enumerated()), id: \.element.id) { idx, stage in
                        StandardFilterChip(stage.kind.rawValue, isSelected: currentStageIndex == idx) {
                            currentStageIndex = idx
                        }
                    }
                }
            }
        ) {
            VStack(alignment: .leading, spacing: Spacing.lg) {
                switch activeStage.kind {
                case .memoryLock:
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            HStack {
                                JournalBadge(text: "Stage 1 · 3 min", tone: .accent)
                                Text(activeStage.title)
                                    .font(.kymaiaHeadline)
                                Spacer()
                                Text("Card \(min(currentCardIndex + 1, max(1, plan.dueCards.count))) of \(max(1, plan.dueCards.count))")
                                    .font(.kymaiaCaption.monospacedDigit())
                                    .foregroundStyle(Color.kymaiaMutedInk)
                            }

                            if currentCardIndex < plan.dueCards.count {
                                let card = plan.dueCards[currentCardIndex]
                                Text(card.frontPrompt)
                                    .font(.kymaiaReadingBody)
                                    .foregroundStyle(Color.kymaiaInk)

                                if revealedCardBack {
                                    Divider()
                                    Text(card.backAnswer)
                                        .font(.kymaiaReadingBody)
                                        .foregroundStyle(Color.kymaiaSuccess)

                                    HStack(spacing: Spacing.sm) {
                                        ForEach(FSRSRating.allCases, id: \.rawValue) { rating in
                                            Button {
                                                store.reviewFSRSCard(card, rating: rating)
                                                revealedCardBack = false
                                                if currentCardIndex + 1 < plan.dueCards.count {
                                                    currentCardIndex += 1
                                                } else {
                                                    currentStageIndex = 1
                                                }
                                            } label: {
                                                Text(rating.title)
                                                    .font(.kymaiaCaption.weight(.semibold))
                                                    .frame(maxWidth: .infinity, minHeight: AccessibilityLayout.minTouchTarget)
                                            }
                                            .buttonStyle(.bordered)
                                        }
                                    }
                                } else {
                                    Button {
                                        revealedCardBack = true
                                    } label: {
                                        Label("Reveal Answer & Rate Retrieval", systemImage: "eye.fill")
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .tint(Color.kymaiaPrimary)
                                }
                            } else {
                                Text("Memory Lock complete! Advance to Stage 2.")
                                    .font(.kymaiaCallout)
                                    .foregroundStyle(Color.kymaiaSuccess)
                            }
                        }
                    }

                case .conceptBeat:
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            HStack {
                                JournalBadge(text: "Stage 2 · 4 min", tone: .accent)
                                Text(plan.targetBeat.title)
                                    .font(.kymaiaHeadline)
                                Spacer()
                                Button {
                                    audioNarrator.narrateBeat(plan.targetBeat, chapterId: plan.targetChapter.id)
                                } label: {
                                    Label(
                                        audioNarrator.isSpeaking ? "Pause Audio" : "Listen (\(audioNarrator.speedLabel))",
                                        systemImage: audioNarrator.isSpeaking ? "pause.circle.fill" : "headphones"
                                    )
                                }
                                .buttonStyle(SessionGhostButtonStyle())
                            }

                            Text(plan.targetBeat.narrativeBody)
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaInk)
                        }
                    }

                    PhysicsIntuitionFormulaBridgeCard(bridge: plan.targetChapter.intuitionToFormula)

                case .misconceptionImmunity:
                    PhysicsDebateCardView(scenario: plan.targetDebate)

                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            HStack {
                                JournalBadge(text: "Quantitative Trap Check", tone: .warning)
                                Text(plan.targetQuantitativeTemplate.title)
                                    .font(.kymaiaHeadline)
                                Spacer()
                                Text(plan.targetQuantitativeTemplate.formulaDisplay)
                                    .font(.kymaiaMonospaced.weight(.bold))
                                    .foregroundStyle(Color.kymaiaPrimary)
                            }

                            Text(plan.targetQuantitativeTemplate.prompt)
                                .font(.kymaiaReadingBody)

                            PhysicsSymbolRibbon(text: $quantInput)

                            HStack(spacing: Spacing.sm) {
                                TextField(
                                    "Value + SI unit (e.g. \(Int(plan.targetQuantitativeTemplate.expectedValue)) \(plan.targetQuantitativeTemplate.expectedUnit))",
                                    text: $quantInput
                                )
                                .textFieldStyle(.roundedBorder)

                                Button("Check Answer") {
                                    quantResult = QuantitativePhysicsEngine.evaluate(
                                        input: quantInput,
                                        against: plan.targetQuantitativeTemplate
                                    )
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(Color.kymaiaPrimary)
                            }

                            if let qRes = quantResult {
                                if let trap = qRes.matchedTrap {
                                    PhysicsBuggyRuleTrapBanner(trap: trap)
                                } else {
                                    Text(qRes.feedback)
                                        .font(.kymaiaCallout.weight(.semibold))
                                        .foregroundStyle(qRes.isFullPass ? Color.kymaiaSuccess : Color.kymaiaWarning)
                                }
                            }
                        }
                    }

                case .workbookProof:
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            HStack {
                                JournalBadge(text: "Stage 4 · 4 min", tone: .success)
                                Text("\(plan.targetQuestion.sourceBadgeTitle) · \(plan.targetQuestion.bookSection)")
                                    .font(.kymaiaHeadline)
                                Spacer()
                            }

                            Text(plan.targetQuestion.prompt)
                                .font(.kymaiaReadingBody)

                            PhysicsManipulativeSandboxCard(
                                spec: PhysicsManipulativeEngine.spec(for: plan.targetQuestion)
                            ) { stamped in
                                if proofInput.isEmpty {
                                    proofInput = stamped
                                } else {
                                    proofInput += "\n" + stamped
                                }
                            }

                            PhysicsSymbolRibbon(text: $proofInput)

                            LearnerTextInput(
                                placeholder: "Write your independent proof with physical reasoning and SI units...",
                                text: $proofInput
                            )

                            Button {
                                proofResult = store.submitQuestionAttempt(
                                    question: plan.targetQuestion,
                                    answerText: proofInput,
                                    usedAssistance: false
                                )
                            } label: {
                                Label("Submit Workbook Proof", systemImage: "checkmark.seal.fill")
                            }
                            .buttonStyle(BrassButtonStyle())
                            .disabled(proofInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                            if let pRes = proofResult {
                                Text(pRes.feedbackSummary)
                                    .font(.kymaiaCallout.weight(.semibold))
                                    .foregroundStyle(pRes.isPass ? Color.kymaiaSuccess : Color.kymaiaWarning)
                            }
                        }
                    }
                }

                // Stage Footer Navigation
                HStack {
                    if currentStageIndex > 0 {
                        Button("Previous Stage") {
                            currentStageIndex -= 1
                        }
                        .buttonStyle(SessionGhostButtonStyle())
                    }
                    Spacer()
                    if currentStageIndex + 1 < plan.stages.count {
                        Button {
                            currentStageIndex += 1
                        } label: {
                            Label("Next Stage (\(currentStageIndex + 2)/\(plan.stages.count))", systemImage: "arrow.right.circle.fill")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                    } else {
                        Button {
                            audioNarrator.stop()
                            dismiss()
                        } label: {
                            Label("Complete 15-Min Physics Flow ✓", systemImage: "checkmark.seal.fill")
                        }
                        .buttonStyle(BrassButtonStyle())
                    }
                }
            }
        }
        .frame(minWidth: 760, minHeight: 620)
    }
}
