import SwiftUI

/// Guided 25-Minute 7-Phase Daily Physics Ritual Session (`RitualPhase`), ported and adapted from
/// `../kym_tutor/KymaiaTutor/KymaiaTutor/Features/Session/` and `Features/Emotional/TherapeuticPromptView.swift`.
enum PhysicsDailyRitualEngine {
    struct IdentityAffirmation: Sendable, Equatable {
        let headline: String
        let subheadline: String
        let mumbaiAnchor: String
    }

    static let affirmations: [IdentityAffirmation] = [
        IdentityAffirmation(
            headline: "You don't memorize physics formulas — you see the invisible forces behind the moving world.",
            subheadline: "Every mistake in a derivation or ray diagram is high-precision telemetry showing where your physical intuition is sharpening.",
            mumbaiAnchor: "From the 1500 V DC overhead catenary of the Western Line to the refraction of monsoon rainbows over Marine Drive, Mumbai is your live laboratory."
        ),
        IdentityAffirmation(
            headline: "Confusion is the exact sensation of a new mental model forming.",
            subheadline: "When a moment calculation or magnetic field question feels hard, slow down, draw the free-body or field arrows first, and let the conservation laws do the work.",
            mumbaiAnchor: "Just as C.V. Raman questioned why the sea looks deep blue, every great physicist starts by asking a simple 'why?' and testing it honestly."
        ),
        IdentityAffirmation(
            headline: "Independent proof beats passive reading every single time.",
            subheadline: "Even one Workbook Challenge question solved from blank paper with your own reasoning builds permanent neural pathways.",
            mumbaiAnchor: "Take a calm breath, state the physical law in plain words first, and then translate it into SI symbols and units."
        )
    ]

    struct CuriosityHookItem: Sendable, Equatable {
        let title: String
        let question: String
        let reveal: String
        let chapterNumber: Int
    }

    static let curiosityHooks: [CuriosityHookItem] = [
        CuriosityHookItem(
            title: "Why doesn't an iron core stay permanently magnetized in an electromagnet crane?",
            question: "Tomorrow in Unit 9.3 / Ch 13: Why must scrap-yard electromagnets use soft iron rather than hard steel for their core?",
            reveal: "Soft iron aligns its magnetic domains instantly when current flows ($B \\propto N \\cdot I$), and loses its magnetism the instant the switch opens — so the crane can actually drop the scrap steel!",
            chapterNumber: 13
        ),
        CuriosityHookItem(
            title: "Why does a red dress look pitch black under a pure green stage spotlight?",
            question: "Unit 6.4 / Ch 10: What happens at the surface of a red pigment when only green wavelengths ($530\\text{ nm}$) hit it?",
            reveal: "A red surface reflects red light and absorbs green and blue light. When only green light shines on it, all the green light is absorbed and zero light reflects into your eye — so it appears black!",
            chapterNumber: 10
        ),
        CuriosityHookItem(
            title: "Why do your ears pop faster diving $3\\text{ m}$ in a swimming pool than riding an elevator up $30\\text{ m}$?",
            question: "Unit 3.6 / Ch 6: How does $\\Delta P = \\rho g \\Delta h$ compare between water and air?",
            reveal: "Water is about $800\\times$ denser than air ($1000\\text{ kg/m}^3$ vs $1.2\\text{ kg/m}^3$), so just $3\\text{ m}$ of water adds nearly $30\\text{ kPa}$ of hydrostatic pressure!",
            chapterNumber: 6
        )
    ]

    static func phasesInOrder() -> [RitualPhase] {
        RitualPhase.allCases
    }
}

/// Ported and adapted from `../kym_tutor/KymaiaTutor/KymaiaTutor/Features/Emotional/TherapeuticPromptView.swift`.
/// Appears when Kym hits friction or requests a calm cognitive reset during the Struggle Zone.
struct TherapeuticPromptCard: View {
    let validationMessage: String
    let encouragementMessage: String
    let reframeSuggestion: String
    var onContinue: () -> Void
    var onDismiss: () -> Void

    @State private var breathePhase: String = "Inhale 4s"
    @State private var isBreathingActive: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack(spacing: Spacing.xs) {
                Image(systemName: "heart.text.square.fill")
                    .font(.body)
                    .foregroundStyle(Color.kymaiaPrimary)
                Text("Pause & Reset · Physicist's Mindset")
                    .font(.kymaiaSubheadline.weight(.semibold))
                    .foregroundStyle(Color.kymaiaTextPrimary)
                Spacer()
                Button {
                    onDismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.kymaiaTextSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Dismiss pause card")
            }

            Text(validationMessage)
                .font(.kymaiaBody)
                .foregroundStyle(Color.kymaiaTextPrimary)
                .fixedSize(horizontal: false, vertical: true)

            Text(encouragementMessage)
                .font(.kymaiaCallout)
                .foregroundStyle(Color.kymaiaTextSecondary)
                .fixedSize(horizontal: false, vertical: true)

            HStack(alignment: .top, spacing: Spacing.xs) {
                Image(systemName: "lightbulb.fill")
                    .font(.caption)
                    .foregroundStyle(Color.kymaiaWarning)
                    .padding(.top, 2)
                Text(reframeSuggestion)
                    .font(.kymaiaCallout.weight(.medium))
                    .foregroundStyle(Color.kymaiaTextPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(Spacing.sm)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                    .fill(Color.kymaiaWarning.opacity(0.10))
            )

            HStack(spacing: Spacing.sm) {
                Button {
                    isBreathingActive.toggle()
                    breathePhase = isBreathingActive ? "Inhale 4s · Hold 7s · Exhale 8s" : "Inhale 4s"
                } label: {
                    Label(isBreathingActive ? breathePhase : "4-7-8 Calm Breath", systemImage: "wind")
                        .font(.kymaiaCaption.weight(.semibold))
                }
                .buttonStyle(.bordered)
                .tint(Color.kymaiaSecondary)

                Spacer()

                Button {
                    onContinue()
                } label: {
                    Label("I'm Ready to Try Again", systemImage: "arrow.right.circle.fill")
                        .font(.kymaiaCallout.weight(.semibold))
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.kymaiaPrimary)
            }
        }
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous)
                .fill(Color.kymaiaSurfaceElevated)
        )
        .overlay(
            RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous)
                .strokeBorder(Color.kymaiaPrimary.opacity(0.35), lineWidth: StrokeWidth.standard)
        )
    }
}

/// Ported and adapted from `../kym_tutor/KymaiaTutor/KymaiaTutor/Features/Session/BreakthroughCelebrationView.swift`.
struct BreakthroughCelebrationCard: View {
    let conceptTitle: String
    let detailMessage: String
    var onContinue: () -> Void

    @State private var appeared = false

    var body: some View {
        VStack(spacing: Spacing.md) {
            ZStack {
                Circle()
                    .fill(Color.kymaiaGold.opacity(0.16))
                    .frame(width: 96, height: 96)
                    .scaleEffect(appeared ? 1.06 : 0.85)
                Image(systemName: "sparkles")
                    .font(.system(size: 40, weight: .semibold))
                    .foregroundStyle(Color.kymaiaGold)
            }

            Text("Breakthrough Unlocked!")
                .font(.kymaiaDisplayHero)
                .foregroundStyle(Color.kymaiaTextPrimary)

            Text(conceptTitle)
                .font(.kymaiaTitle3)
                .foregroundStyle(Color.kymaiaPrimary)
                .multilineTextAlignment(.center)

            Text(detailMessage)
                .font(.kymaiaBody)
                .foregroundStyle(Color.kymaiaTextSecondary)
                .multilineTextAlignment(.center)

            Button {
                onContinue()
            } label: {
                Label("Lock Into Long-Term Memory", systemImage: "checkmark.seal.fill")
                    .font(.kymaiaCallout.weight(.semibold))
            }
            .buttonStyle(.borderedProminent)
            .tint(Color.kymaiaPrimary)
        }
        .padding(Spacing.lg)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous)
                .fill(Color.kymaiaSurfaceElevated)
        )
        .overlay(
            RoundedRectangle(cornerRadius: CornerRadius.lg, style: .continuous)
                .strokeBorder(Color.kymaiaGold.opacity(0.55), lineWidth: StrokeWidth.emphasis)
        )
        .onAppear {
            withAnimation(KymaiaMotion.celebration) {
                appeared = true
            }
        }
    }
}

struct PhysicsDailyRitualSessionView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    @State private var currentPhaseIndex: Int = 0
    @State private var warmCardRevealed: Bool = false
    @State private var warmCardsCompleted: Int = 0
    @State private var struggleAnswer: String = ""
    @State private var struggleScratchpad: Data = Data()
    @State private var struggleSubmitted: Bool = false
    @State private var showTherapeuticReset: Bool = false
    @State private var curiosityRevealed: Bool = false
    @State private var reflectionTakeaway: String = ""
    @State private var reflectionConfidence: Int = 4

    private let phases = RitualPhase.allCases

    private var currentPhase: RitualPhase {
        phases[min(max(0, currentPhaseIndex), phases.count - 1)]
    }

    private var activeAffirmation: PhysicsDailyRitualEngine.IdentityAffirmation {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        return PhysicsDailyRitualEngine.affirmations[dayOfYear % PhysicsDailyRitualEngine.affirmations.count]
    }

    private var activeCuriosityHook: PhysicsDailyRitualEngine.CuriosityHookItem {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        return PhysicsDailyRitualEngine.curiosityHooks[dayOfYear % PhysicsDailyRitualEngine.curiosityHooks.count]
    }

    private var struggleQuestion: SchoolScienceQuestion? {
        store.pack.schoolQuestions.first(where: { $0.unitNumber == 9 })
            ?? store.pack.schoolQuestions.first
    }

    var body: some View {
        JournalFocusPage(
            title: "25-Minute Daily Physics Ritual",
            subtitle: "Phase \(currentPhaseIndex + 1) of \(phases.count) · \(currentPhase.displayName) (\(currentPhase.durationLabel))",
            headerAccessory: {
                Button("Close Ritual") {
                    dismiss()
                }
                .buttonStyle(.bordered)
            }
        ) {
            // Phase Stepper Strip
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(Array(phases.enumerated()), id: \.element.rawValue) { idx, phase in
                        Button {
                            currentPhaseIndex = idx
                        } label: {
                            JournalChip(
                                title: "\(idx + 1). \(phase.displayName)",
                                isSelected: currentPhaseIndex == idx
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            ProgressView(value: Double(currentPhaseIndex + 1), total: Double(phases.count))
                .tint(Color.kymaiaPrimary)

            switch currentPhase {
            case .identityPrime:
                identityPrimePhaseView
            case .warmRetrieval:
                warmRetrievalPhaseView
            case .struggleZone:
                struggleZonePhaseView
            case .breakthrough:
                breakthroughPhaseView
            case .curiosityHook:
                curiosityHookPhaseView
            case .reflection:
                reflectionPhaseView
            case .complete:
                completePhaseView
            }
        }
        .frame(minWidth: 740, minHeight: 620)
    }

    // MARK: - Phase 1: Identity Prime
    private var identityPrimePhaseView: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    JournalBadge(text: "Phase 1 · Identity Prime (30s)", tone: .accent)
                    Spacer()
                    Text("Set your physicist's lens before touching any equation")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }

                Text(activeAffirmation.headline)
                    .font(.kymaiaTitle2)
                    .foregroundStyle(Color.kymaiaInk)

                Text(activeAffirmation.subheadline)
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaInk)

                HStack(alignment: .top, spacing: Spacing.sm) {
                    Image(systemName: "tram.fill")
                        .foregroundStyle(Color.kymaiaPrimary)
                    Text(activeAffirmation.mumbaiAnchor)
                        .font(.kymaiaCallout)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
                .padding(Spacing.md)
                .background(
                    RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                        .fill(Color.kymaiaSurface)
                )

                HStack {
                    Spacer()
                    Button {
                        advancePhase()
                    } label: {
                        Label("Begin Warm Retrieval (3 min)", systemImage: "arrow.right.circle.fill")
                            .font(.kymaiaCallout.weight(.semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)
                }
            }
        }
    }

    // MARK: - Phase 2: Warm Retrieval
    private var warmRetrievalPhaseView: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    JournalBadge(text: "Phase 2 · Warm Retrieval (3 min)", tone: .positive)
                    Spacer()
                    Text("\(warmCardsCompleted) of \(min(3, max(1, store.dueFSRSCards.count))) warm-up cards reviewed")
                        .font(.kymaiaCaption.weight(.semibold))
                        .foregroundStyle(Color.kymaiaSuccess)
                }

                if let card = store.dueFSRSCards.first {
                    Text("Topic \(card.topicCode) · Guaranteed-Win Spaced Retrieval")
                        .font(.kymaiaCaption.weight(.semibold))
                        .foregroundStyle(Color.kymaiaPrimary)

                    Text(card.frontPrompt)
                        .font(.kymaiaTitle3)
                        .foregroundStyle(Color.kymaiaInk)

                    if warmCardRevealed {
                        Text(card.backAnswer)
                            .font(.kymaiaReadingBody)
                            .foregroundStyle(Color.kymaiaInk)
                            .padding(Spacing.md)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                    .fill(Color.kymaiaSurface)
                            )

                        HStack(spacing: Spacing.sm) {
                            ForEach(FSRSRating.allCases) { rating in
                                Button {
                                    store.reviewFSRSCard(card, rating: rating)
                                    warmCardRevealed = false
                                    warmCardsCompleted += 1
                                    if warmCardsCompleted >= 3 {
                                        advancePhase()
                                    }
                                } label: {
                                    Text(rating.title)
                                        .font(.kymaiaCaption.weight(.semibold))
                                        .padding(.horizontal, Spacing.md)
                                        .padding(.vertical, Spacing.xs)
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(rating == .easy || rating == .good ? Color.kymaiaSuccess : Color.kymaiaWarning)
                            }
                        }
                    } else {
                        Button {
                            warmCardRevealed = true
                        } label: {
                            Label("Reveal Answer", systemImage: "eye.fill")
                                .font(.kymaiaCallout.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                    }
                } else {
                    Text("All FSRS warm-up cards are caught up for today!")
                        .font(.kymaiaHeadline)
                        .foregroundStyle(Color.kymaiaSuccess)
                }

                HStack {
                    Spacer()
                    Button {
                        advancePhase()
                    } label: {
                        Label("Enter Struggle Zone (15 min)", systemImage: "flame.fill")
                            .font(.kymaiaCallout.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                }
            }
        }
    }

    // MARK: - Phase 3: Struggle Zone
    private var struggleZonePhaseView: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    HStack {
                        JournalBadge(text: "Phase 3 · Productive Struggle Zone (15 min)", tone: .warning)
                        Spacer()
                        Button {
                            showTherapeuticReset.toggle()
                        } label: {
                            Label("Feeling Stuck? Pause & Reframe", systemImage: "heart.text.square.fill")
                                .font(.kymaiaCaption.weight(.semibold))
                        }
                        .buttonStyle(.bordered)
                        .tint(Color.kymaiaPrimary)
                    }

                    if let q = struggleQuestion {
                        Text("\(q.sourceBadgeTitle) · Topic \(q.topicCode) (\(q.bookSection))")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)

                        Text(q.prompt)
                            .font(.kymaiaTitle3)
                            .foregroundStyle(Color.kymaiaInk)

                        LearnerTextInput(
                            placeholder: "Write or dictate your full physical reasoning and units before checking…",
                            text: $struggleAnswer,
                            purpose: .retrieval
                        )

                        PencilWritingCanvas(
                            drawingData: $struggleScratchpad,
                            minHeight: 150,
                            placeholder: "Draw the field lines, ray normal, or free-body arrows with Apple Pencil…"
                        )

                        if struggleSubmitted {
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                Text("Cambridge Mark-Scheme Model Answer")
                                    .font(.kymaiaCaption.weight(.bold))
                                    .foregroundStyle(Color.kymaiaSuccess)
                                Text(q.modelAnswer)
                                    .font(.kymaiaReadingBody)
                                    .foregroundStyle(Color.kymaiaInk)
                            }
                            .padding(Spacing.md)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                    .fill(Color.kymaiaSuccess.opacity(0.10))
                            )
                        }

                        HStack(spacing: Spacing.md) {
                            Button {
                                struggleSubmitted = true
                                store.submitQuestionAttempt(
                                    question: q,
                                    answerText: struggleAnswer,
                                    usedAssistance: showTherapeuticReset
                                )
                            } label: {
                                Label("Commit Proof & Check Mark Scheme", systemImage: "checkmark.seal.fill")
                                    .font(.kymaiaCallout.weight(.semibold))
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(Color.kymaiaPrimary)
                            .disabled(struggleAnswer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && struggleScratchpad.isEmpty)

                            if struggleSubmitted {
                                Button {
                                    advancePhase()
                                } label: {
                                    Label("Celebrate Breakthrough →", systemImage: "sparkles")
                                        .font(.kymaiaCallout.weight(.semibold))
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(Color.kymaiaSuccess)
                            }
                        }
                    }
                }
            }

            if showTherapeuticReset {
                TherapeuticPromptCard(
                    validationMessage: "It is completely normal for Unit 9 Magnetism or multi-step physics proofs to feel knotty at first.",
                    encouragementMessage: "You don't need the whole paragraph at once. Start by naming the single physical cause (force, field, or particle collision).",
                    reframeSuggestion: "First-principles step: Draw the object or field lines first, label the direction arrow (N → S or high P → low P), and state what stays conserved.",
                    onContinue: {
                        showTherapeuticReset = false
                    },
                    onDismiss: {
                        showTherapeuticReset = false
                    }
                )
            }
        }
    }

    // MARK: - Phase 4: Breakthrough
    private var breakthroughPhaseView: some View {
        BreakthroughCelebrationCard(
            conceptTitle: struggleQuestion.map { "Topic \($0.topicCode) · \($0.bookSection)" } ?? "Unit 9 Magnetism Proof",
            detailMessage: "You committed your own explanation and verified the mark-scheme keywords without skipping the struggle.",
            onContinue: {
                advancePhase()
            }
        )
    }

    // MARK: - Phase 5: Curiosity Hook
    private var curiosityHookPhaseView: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    JournalBadge(text: "Phase 5 · Curiosity Hook (1 min)", tone: .accent)
                    Spacer()
                    Text("Moving World Ch \(activeCuriosityHook.chapterNumber)")
                        .font(.kymaiaCaption.weight(.semibold))
                        .foregroundStyle(Color.kymaiaPrimary)
                }

                Text(activeCuriosityHook.title)
                    .font(.kymaiaTitle2)
                    .foregroundStyle(Color.kymaiaInk)

                Text(activeCuriosityHook.question)
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaInk)

                if curiosityRevealed {
                    Text(activeCuriosityHook.reveal)
                        .font(.kymaiaReadingBody)
                        .foregroundStyle(Color.kymaiaInk)
                        .padding(Spacing.md)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                .fill(Color.kymaiaSurface)
                        )
                }

                HStack {
                    Button {
                        curiosityRevealed.toggle()
                    } label: {
                        Label(curiosityRevealed ? "Hide Mechanism" : "Reveal Physical Mechanism", systemImage: "sparkles")
                            .font(.kymaiaCallout.weight(.semibold))
                    }
                    .buttonStyle(.bordered)

                    Spacer()

                    Button {
                        advancePhase()
                    } label: {
                        Label("Continue to Reflection (1 min)", systemImage: "arrow.right.circle.fill")
                            .font(.kymaiaCallout.weight(.semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)
                }
            }
        }
    }

    // MARK: - Phase 6: Reflection
    private var reflectionPhaseView: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    JournalBadge(text: "Phase 6 · Metacognitive Reflection (1 min)", tone: .neutral)
                    Spacer()
                }

                Text("In one sentence, what is the clearest physical insight you are taking away from today's session?")
                    .font(.kymaiaHeadline)
                    .foregroundStyle(Color.kymaiaInk)

                LearnerTextInput(
                    placeholder: "Type or dictate your 1-sentence physics takeaway…",
                    text: $reflectionTakeaway,
                    purpose: .retrieval
                )

                HStack {
                    Text("Confidence in today's concept:")
                        .font(.kymaiaCaption.weight(.semibold))
                        .foregroundStyle(Color.kymaiaMutedInk)
                    Picker("Confidence", selection: $reflectionConfidence) {
                        ForEach(1...5, id: \.self) { level in
                            Text("\(level)/5").tag(level)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                HStack {
                    Spacer()
                    Button {
                        if !reflectionTakeaway.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                            let now = Date()
                            let entry = LabJournalEntryRecord(
                                id: "ritual-\(Int(now.timeIntervalSince1970))",
                                title: "Daily Physics Ritual Reflection · Topic \(store.selectedTopicCode ?? "9.1")",
                                templateKind: "calibration",
                                paperStyle: "lined",
                                linkedTopicCode: store.selectedTopicCode ?? "9.1",
                                linkedChapterNumber: store.activeMovingWorldChapter,
                                linkedWidgetId: nil,
                                cueColumnText: "Confidence: \(reflectionConfidence)/5",
                                bodyNotesText: reflectionTakeaway,
                                summaryText: reflectionTakeaway,
                                hypothesisText: "",
                                independentVarText: "",
                                dependentVarText: "",
                                controlVarsText: "",
                                drawingData: struggleScratchpad.isEmpty ? nil : struggleScratchpad,
                                snapshotPNGData: nil,
                                createdAt: now,
                                updatedAt: now
                            )
                            store.saveJournalEntry(entry)
                        }
                        advancePhase()
                    } label: {
                        Label("Save Reflection & Complete Ritual", systemImage: "checkmark.circle.fill")
                            .font(.kymaiaCallout.weight(.semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)
                }
            }
        }
    }

    // MARK: - Phase 7: Complete
    private var completePhaseView: some View {
        JournalCard {
            VStack(spacing: Spacing.md) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(Color.kymaiaSuccess)

                Text("Today's 25-Minute Physics Ritual Complete!")
                    .font(.kymaiaTitle1)
                    .foregroundStyle(Color.kymaiaInk)

                Text("You completed Warm Spaced Retrieval, tackled a Cambridge Science 8 Question Proof in the Struggle Zone, previewed tomorrow's Curiosity Hook, and logged your reflection in your Lab Notebook.")
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaMutedInk)
                    .multilineTextAlignment(.center)

                Button {
                    dismiss()
                } label: {
                    Label("Return to Today in Physics", systemImage: "house.fill")
                        .font(.kymaiaCallout.weight(.semibold))
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.kymaiaPrimary)
            }
            .padding(Spacing.lg)
            .frame(maxWidth: .infinity)
        }
    }

    private func advancePhase() {
        if currentPhaseIndex + 1 < phases.count {
            currentPhaseIndex += 1
        }
    }
}
