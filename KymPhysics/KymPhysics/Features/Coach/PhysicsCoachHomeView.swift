import SwiftUI
import AVFoundation

struct PhysicsCoachExchange: Identifiable, Equatable, Sendable {
    let id = UUID()
    let role: String // "coach" | "kym" | "safety"
    let personaLabel: String?
    let text: String
    let linkedEquation: String?
    let suggestedWidgetId: String?
    let suggestedChapter: Int?
    let supportModeLabel: String?
}

struct PhysicsCoachHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var promptInput: String = ""
    @State private var isThinking: Bool = false
    @State private var autoSpeakReplies: Bool = false
    @State private var showingAPIKeySheet: Bool = false
    @State private var showingConstitutionSheet: Bool = false
    @State private var selectedPersona: PhysicsMentorPersona = .feynman
    @State private var selectedGuidanceStyle: TutorGuidanceStyle = .adaptive
    @State private var understandingPhase: UnderstandingPhase = .exploring
    @State private var learnerTurnCount: Int = 0
    @State private var activeSafetyBanner: SafetyScanResult? = nil
    @State private var activeDeliberation: CouncilDeliberation? = nil
    @State private var budgetNotice: String? = nil
    @AppStorage("kymphysics.gemini.apiKey") private var savedGeminiKey: String = ""

    @State private var exchanges: [PhysicsCoachExchange] = [
        PhysicsCoachExchange(
            role: "coach",
            personaLabel: "Richard Feynman",
            text: "Namaste Kym! I'm grounded in your Cambridge Lower Secondary Science 8 book (Units 3, 6 & 9 + Bridges), all 16 chapters of The Moving World, and the Kymaia Tutor Constitution. You are always in charge of how we work: pick your Mentor Soul above or switch Guidance Style anytime (including 'Explain directly' if you want the full breakdown right away). What are we investigating today?",
            linkedEquation: "F_net = m · a   |   M = F × d⊥   |   n₁ sin θ₁ = n₂ sin θ₂   |   B ∝ N · I",
            suggestedWidgetId: "fieldslab",
            suggestedChapter: 13,
            supportModeLabel: "Adaptive · First Principles"
        )
    ]

    private let quickStarters: [(label: String, prompt: String)] = [
        ("Unit 9.3: Why soft iron in an electromagnet?", "Why must the core of a scrapyard electromagnet be made of soft iron instead of steel?"),
        ("Unit 9.2: Earth's magnetic south pole", "Why does the north pole of a compass needle point toward Earth's Geographic North Pole?"),
        ("Unit 3.4 & 7.4: Forearm biceps lever", "How does my forearm work as a lever when my biceps lifts a heavy book?"),
        ("Unit 6.1 & 6.2: Normal line & refraction", "Why do we measure angles of incidence and reflection from the 90° normal instead of the mirror surface?"),
        ("Unit 6.4: Blue shirt in red spotlight", "Why does a bright blue shirt look black when lit only by a pure red spotlight?"),
        ("Unit 3.6 & 1.3: Boyle's law in breathing", "How do particle collisions explain why air rushes into my lungs when my diaphragm flattens?")
    ]

    private var activeAPIKey: String {
        let trimmed = savedGeminiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty { return trimmed }
        return ProcessInfo.processInfo.environment["GEMINI_API_KEY"] ?? ""
    }

    var body: some View {
        JournalPage(
            title: "Socratic Physics & Voice Coach",
            subtitle: "Grounded in Cambridge Science 8 (0893), The Moving World & the Kymaia Tutor Constitution (\(TutorConstitution.version))",
            headerAccessory: {
                HStack(spacing: Spacing.sm) {
                    Toggle(isOn: $autoSpeakReplies) {
                        Label("Voice Readout", systemImage: autoSpeakReplies ? "speaker.wave.3.fill" : "speaker.slash")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .toggleStyle(.button)

                    Button {
                        showingConstitutionSheet = true
                    } label: {
                        Label("Constitution & Guardrails", systemImage: "checkmark.shield.fill")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)

                    Button {
                        showingAPIKeySheet = true
                    } label: {
                        Label(
                            activeAPIKey.isEmpty ? "Offline Socratic Engine" : "Gemini Live Active",
                            systemImage: activeAPIKey.isEmpty ? "cpu" : "sparkles"
                        )
                        .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)

                    ThemePickerMenu()
                }
            }
        ) {
            ChapterExplainerMiniBar()

            // 0. Urgent Child-Safety Banner (if triggered)
            if let safety = activeSafetyBanner, let response = safety.supportiveResponse {
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack {
                            Image(systemName: "heart.text.square.fill")
                                .foregroundStyle(Color.kymaiaError)
                            JournalBadge(text: "Safety First · Tutoring Paused", tone: .warning)
                            Spacer()
                            Button("Dismiss Banner") {
                                activeSafetyBanner = nil
                            }
                            .font(.kymaiaCaption)
                            .buttonStyle(.bordered)
                        }
                        Text(response)
                            .font(.kymaiaReadingBody)
                            .foregroundStyle(Color.kymaiaInk)
                    }
                }
            }

            // 1. Active Context, Phase & Council Bar
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    HStack(spacing: Spacing.sm) {
                        JournalBadge(text: "Active Unit \(store.selectedUnitNumber)", tone: .accent)
                        JournalBadge(text: "Topic \(store.selectedTopicCode ?? "9.1")", tone: .neutral)
                        JournalBadge(text: "Moving World Ch \(store.activeMovingWorldChapter)", tone: .neutral)
                        JournalBadge(text: "Phase: \(understandingPhase.title)", tone: understandingPhase == .mastered ? .positive : .accent)
                        Spacer()
                        Button {
                            conveneAdversarialCouncil()
                        } label: {
                            Label("Convene 3-Agent Council", systemImage: "person.3.sequence.fill")
                                .font(.kymaiaCaption.weight(.semibold))
                        }
                        .buttonStyle(.bordered)
                    }

                    Text("Constitutional Precedence: 1. Safety & Dignity → 2. Truth → 3. Learner Agency (say 'just explain' anytime) → 4. Evidence-Aligned Pedagogy → 5. Bounded Parent Preferences → 6. Mentor Soul.")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
            }

            // 1B. Mentor Soul Picker & Learner Agency Guidance Style Picker
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        HStack {
                            Text("Choose Your Physics Mentor Soul")
                                .font(.kymaiaSubheadline)
                                .foregroundStyle(Color.kymaiaInk)
                            Spacer()
                            Text(selectedPersona.subtitle)
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: Spacing.xs) {
                                ForEach(PhysicsMentorPersona.allCases) { persona in
                                    Button {
                                        selectedPersona = persona
                                    } label: {
                                        JournalChip(
                                            title: persona.displayName,
                                            isSelected: selectedPersona == persona
                                        )
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }

                    Divider()

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        HStack {
                            Text("Learner Agency · How Should I Help You Right Now?")
                                .font(.kymaiaSubheadline)
                                .foregroundStyle(Color.kymaiaInk)
                            Spacer()
                            Text("Say \"just explain\" anytime to skip questions immediately")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: Spacing.xs) {
                                ForEach(TutorGuidanceStyle.allCases) { style in
                                    Button {
                                        selectedGuidanceStyle = style
                                    } label: {
                                        JournalChip(
                                            title: style.title,
                                            isSelected: selectedGuidanceStyle == style
                                        )
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }
            }

            // 1C. Adversarial Council Deliberation Card (when convened)
            if let council = activeDeliberation {
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack {
                            JournalBadge(text: "Adversarial Council Deliberation", tone: .accent)
                            Text(council.topic)
                                .font(.kymaiaSubheadline)
                                .foregroundStyle(Color.kymaiaInk)
                            Spacer()
                            Button("Close") {
                                activeDeliberation = nil
                            }
                            .font(.kymaiaCaption)
                            .buttonStyle(.bordered)
                        }

                        HStack(alignment: .top, spacing: Spacing.md) {
                            VStack(alignment: .leading, spacing: 4) {
                                JournalBadge(text: "Advocate (\(Int(council.advocatePosition.confidence * 100))%)", tone: .positive)
                                Text(council.advocatePosition.recommendation)
                                    .font(.kymaiaCaption.weight(.semibold))
                                    .foregroundStyle(Color.kymaiaInk)
                                ForEach(council.advocatePosition.evidence, id: \.self) { ev in
                                    Text("• \(ev)")
                                        .font(.kymaiaCaption2)
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)

                            VStack(alignment: .leading, spacing: 4) {
                                JournalBadge(text: "Challenger (\(Int(council.challengerPosition.confidence * 100))%)", tone: .warning)
                                Text(council.challengerPosition.recommendation)
                                    .font(.kymaiaCaption.weight(.semibold))
                                    .foregroundStyle(Color.kymaiaInk)
                                ForEach(council.challengerPosition.evidence, id: \.self) { ev in
                                    Text("• \(ev)")
                                        .font(.kymaiaCaption2)
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        Divider()

                        HStack {
                            JournalBadge(text: "Arbiter Verdict: \(council.arbiterVerdict.decision)", tone: .accent)
                            Spacer()
                            Text("Confidence \(Int(council.arbiterVerdict.confidence * 100))%")
                                .font(.kymaiaMonoCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                        Text(council.arbiterVerdict.reasoning)
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaInk)
                    }
                }
            }

            if let budgetNotice {
                JournalCard {
                    HStack {
                        Image(systemName: "info.circle.fill")
                            .foregroundStyle(Color.kymaiaWarning)
                        Text(budgetNotice)
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaInk)
                        Spacer()
                    }
                }
            }

            // 2. Quick Starter Chips
            JournalSection(title: "One-Tap Socratic Starters") {
                FlowLayout(spacing: Spacing.xs) {
                    ForEach(quickStarters, id: \.label) { starter in
                        Button {
                            sendPrompt(starter.prompt)
                        } label: {
                            JournalChip(title: starter.label, isSelected: false)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // 3. Conversation Thread
            JournalSection(title: "Socratic Dialogue") {
                VStack(spacing: Spacing.md) {
                    ForEach(exchanges) { item in
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.sm) {
                                HStack {
                                    JournalBadge(
                                        text: item.role == "kym" ? "Kym" : (item.personaLabel ?? "Physics Coach"),
                                        tone: item.role == "kym" ? .positive : (item.role == "safety" ? .warning : .accent)
                                    )
                                    if let modeLabel = item.supportModeLabel {
                                        JournalBadge(text: modeLabel, tone: .neutral)
                                    }
                                    Spacer()
                                    if item.role != "kym" {
                                        Button {
                                            ChapterExplainerPlayer.shared.playCustomSegments(
                                                title: item.personaLabel ?? "Physics Coach",
                                                subtitle: "Socratic Voice Guidance",
                                                segments: [item.text]
                                            )
                                        } label: {
                                            Label("Speak", systemImage: "speaker.wave.2.fill")
                                                .font(.kymaiaCaption)
                                        }
                                        .buttonStyle(.bordered)
                                        .controlSize(.small)
                                    }
                                }
                                Text(item.text)
                                    .font(.kymaiaReadingBody)
                                    .foregroundStyle(Color.kymaiaInk)
                                if let eq = item.linkedEquation {
                                    Text(eq)
                                        .font(.kymaiaMonoCaption.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaPrimary)
                                        .padding(.top, 2)
                                }

                                if item.role == "coach", (item.suggestedWidgetId != nil || item.suggestedChapter != nil) {
                                    HStack(spacing: Spacing.sm) {
                                        if let wId = item.suggestedWidgetId {
                                            Button {
                                                store.activeWidgetId = wId
                                                store.selectedRoom = .labsExplorers
                                            } label: {
                                                Label("Test in \(wId) Lab", systemImage: "gyroscope")
                                                    .font(.kymaiaCaption.weight(.semibold))
                                            }
                                            .buttonStyle(.bordered)
                                        }
                                        if let ch = item.suggestedChapter {
                                            Button {
                                                store.activeMovingWorldChapter = ch
                                                store.selectedRoom = .movingWorld
                                            } label: {
                                                Label("Read Moving World Ch \(ch)", systemImage: "book.pages")
                                                    .font(.kymaiaCaption)
                                            }
                                            .buttonStyle(.bordered)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if isThinking {
                        HStack(spacing: Spacing.sm) {
                            ProgressView()
                            Text("\(selectedPersona.displayName) is checking your boundary conditions & constitutional guardrails…")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaTextSecondary)
                        }
                    }
                }
            }

            // 4. Input Bar
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    LearnerTextInput(
                        placeholder: "Ask \(selectedPersona.shortLabel) about a force diagram, ray angle, electromagnet, or say 'just explain'...",
                        text: $promptInput
                    )
                    HStack {
                        Button {
                            let text = promptInput.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !text.isEmpty else { return }
                            promptInput = ""
                            sendPrompt(text)
                        } label: {
                            Label("Ask \(selectedPersona.shortLabel)", systemImage: "paperplane.fill")
                                .font(.kymaiaCallout.weight(.semibold))
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaPrimary)
                        .disabled(isThinking)

                        Button {
                            let text = promptInput.trimmingCharacters(in: .whitespacesAndNewlines)
                            let targetPrompt = text.isEmpty ? "Please just explain the current topic directly step by step." : "Just explain directly: \(text)"
                            promptInput = ""
                            sendPrompt(targetPrompt)
                        } label: {
                            Label("Just Explain Directly", systemImage: "text.book.closed.fill")
                                .font(.kymaiaCaption.weight(.semibold))
                        }
                        .buttonStyle(.bordered)
                        .disabled(isThinking)
                    }
                }
            }
        }
        .sheet(isPresented: $showingAPIKeySheet) {
            NavigationStack {
                ScrollView {
                    JournalSection(title: "Optional Gemini API Key (gemini-2.5-flash)") {
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.sm) {
                                SecureField("AIza...", text: $savedGeminiKey)
                                Text("When provided, KymPhysics streams live Socratic responses from Gemini 2.5 Flash governed by TutorConstitution (\(TutorConstitution.version)), DevelopmentalResponseValidator, and AIBudgetLedger. When blank, KymPhysics uses its built-in offline Socratic Physics engine.")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)
                            }
                        }
                    }
                    .padding()
                }
                .navigationTitle("Physics Coach Engine")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") { showingAPIKeySheet = false }
                    }
                }
            }
            .frame(minWidth: 420, minHeight: 240)
        }
        .sheet(isPresented: $showingConstitutionSheet) {
            NavigationStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                HStack {
                                    JournalBadge(text: "Policy Version \(TutorConstitution.version)", tone: .accent)
                                    JournalBadge(text: "On-Device Safety Scanner Active", tone: .positive)
                                }
                                Text("SHA-256 Policy Hash: \(TutorConstitution.policyHash)")
                                    .font(.kymaiaMonoCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)
                            }
                        }

                        JournalCard {
                            Text(TutorConstitution.universalBlock)
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaInk)
                        }

                        JournalCard {
                            Text(TutorConstitution.learnerAgencyBlock)
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaInk)
                        }

                        JournalCard {
                            Text(MotivationalDialoguePolicy.canonicalText)
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaInk)
                        }
                    }
                    .padding()
                }
                .navigationTitle("Kymaia Tutor Constitution")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") { showingConstitutionSheet = false }
                    }
                }
            }
            .frame(minWidth: 540, minHeight: 520)
        }
    }

    private func conveneAdversarialCouncil() {
        let targetUnit = store.pack.schoolTextbook.units.first(where: { $0.unitNumber == store.selectedUnitNumber })
            ?? store.pack.schoolTextbook.units.first!
        let snapshot = store.unitReadiness(for: targetUnit)
        let deliberation = AdversarialCouncilEngine.deliberateOnMastery(
            conceptName: "Unit \(store.selectedUnitNumber) · Topic \(store.selectedTopicCode ?? "9.1")",
            bktMastery: snapshot.averageBKTMastery,
            independentProofFraction: snapshot.independentProofFraction,
            attemptCount: max(1, snapshot.questionsProvenCount + snapshot.questionsSecureCount),
            unresolvedMisconceptionsCount: store.journalEntries.filter { $0.templateKind == "error_autopsy" }.count
        )
        activeDeliberation = deliberation
    }

    private func sendPrompt(_ prompt: String) {
        exchanges.append(
            PhysicsCoachExchange(
                role: "kym",
                personaLabel: "Kym",
                text: prompt,
                linkedEquation: nil,
                suggestedWidgetId: nil,
                suggestedChapter: nil,
                supportModeLabel: nil
            )
        )

        // 1. MANDATORY ON-DEVICE CHILD-SAFETY ESCALATION CHECK BEFORE ANY AI OR TUTORING CALL
        let safetyScan = SafetyEscalationService.scan(prompt)
        if safetyScan.triggered, let supportive = safetyScan.supportiveResponse {
            activeSafetyBanner = safetyScan
            exchanges.append(
                PhysicsCoachExchange(
                    role: "safety",
                    personaLabel: "Safety & Wellbeing Support",
                    text: supportive,
                    linkedEquation: nil,
                    suggestedWidgetId: nil,
                    suggestedChapter: nil,
                    supportModeLabel: "Child-Safety Guardrail"
                )
            )
            Task {
                await SafetyEscalationService.notifyParentIfNeeded(safetyScan, sourceSurface: "physics_coach_chat")
            }
            return
        }

        // 2. Update QuestionTutoringPhasePolicy & Effective Guidance Style (honoring "just explain" opt-outs)
        learnerTurnCount += 1
        understandingPhase = QuestionTutoringPhasePolicy.phase(
            afterTurn: prompt,
            learnerTurnCount: learnerTurnCount,
            current: understandingPhase
        )
        let effectiveStyle = TutorGuidanceStyle.effectiveStyle(
            selectedStyle: selectedGuidanceStyle,
            learnerMessage: prompt
        )
        if effectiveStyle == .explainDirectly && selectedGuidanceStyle != .explainDirectly {
            selectedGuidanceStyle = .explainDirectly
        }

        let key = activeAPIKey
        if !key.isEmpty {
            do {
                try AIBudgetLedger.shared.consumeRequest()
                budgetNotice = nil
            } catch {
                budgetNotice = error.localizedDescription
                let reply = generateGroundedReply(for: prompt, effectiveStyle: effectiveStyle)
                exchanges.append(reply)
                return
            }

            isThinking = true
            let persona = selectedPersona
            Task {
                let reply = await requestGeminiSocraticReply(
                    prompt: prompt,
                    apiKey: key,
                    persona: persona,
                    effectiveStyle: effectiveStyle
                )
                await MainActor.run {
                    isThinking = false
                    exchanges.append(reply)
                    if autoSpeakReplies {
                        ChapterExplainerPlayer.shared.playCustomSegments(
                            title: persona.displayName,
                            subtitle: "Socratic Voice Guidance",
                            segments: [reply.text]
                        )
                    }
                }
            }
        } else {
            let reply = generateGroundedReply(for: prompt, effectiveStyle: effectiveStyle)
            exchanges.append(reply)
            if autoSpeakReplies {
                ChapterExplainerPlayer.shared.playCustomSegments(
                    title: selectedPersona.displayName,
                    subtitle: "Socratic Voice Guidance",
                    segments: [reply.text]
                )
            }
        }
    }

    private func requestGeminiSocraticReply(
        prompt: String,
        apiKey: String,
        persona: PhysicsMentorPersona,
        effectiveStyle: TutorGuidanceStyle
    ) async -> PhysicsCoachExchange {
        let fallback = generateGroundedReply(for: prompt, effectiveStyle: effectiveStyle)
        guard let url = URL(string: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\(apiKey)") else {
            return fallback
        }

        let requestContext = AIRequestContext.learnerDialogue(
            feature: .tutorChat,
            style: effectiveStyle,
            learnerText: prompt
        )
        let soulDoc = AgentSoulLoader.soulDocument(for: persona)

        let domainInstruction = """
        \(soulDoc.toSystemInstruction())

        # KymPhysics Domain & Curriculum Context
        You are mentoring Kym (age 12, Grade 8 in Mumbai), studying Cambridge Lower Secondary Science 8 (0893, especially Unit 3 Forces & Energy, Unit 6 Light, Unit 9 Magnetism) and The Moving World (Chapters 0-15).
        Active context: School Unit \(store.selectedUnitNumber), Topic \(store.selectedTopicCode ?? "9.1"), Moving World Chapter \(store.activeMovingWorldChapter), Understanding Phase: \(understandingPhase.title).
        Highlight exact Cambridge watchouts (e.g., measure optical angles from the 90° normal, soft iron vs steel core in electromagnets, gas particles colliding with container walls, perpendicular distance from the pivot).
        """

        let fullSystemInstruction = TutorConstitution.applying(
            to: domainInstruction,
            context: requestContext,
            guidanceStyle: effectiveStyle
        )

        if let draftText = await callGeminiText(prompt: prompt, systemInstruction: fullSystemInstruction, url: url) {
            let firstReview = DevelopmentalResponseValidator.validate(draftText)
            if firstReview.isValid {
                return PhysicsCoachExchange(
                    role: "coach",
                    personaLabel: persona.displayName,
                    text: draftText,
                    linkedEquation: fallback.linkedEquation,
                    suggestedWidgetId: fallback.suggestedWidgetId,
                    suggestedChapter: fallback.suggestedChapter,
                    supportModeLabel: "\(effectiveStyle.shortLabel) · \(requestContext.dialogueSupportMode.rawValue)"
                )
            }

            // Revision pass if DevelopmentalResponseValidator caught a violation
            let revisionPrompt = prompt + "\n\n" + DevelopmentalResponseValidator.revisionInstruction(for: firstReview)
            if let revisedText = await callGeminiText(prompt: revisionPrompt, systemInstruction: fullSystemInstruction, url: url) {
                let sanitized = DevelopmentalResponseValidator.sanitizeOrFallback(revisedText, context: requestContext)
                return PhysicsCoachExchange(
                    role: "coach",
                    personaLabel: persona.displayName,
                    text: sanitized.text,
                    linkedEquation: fallback.linkedEquation,
                    suggestedWidgetId: fallback.suggestedWidgetId,
                    suggestedChapter: fallback.suggestedChapter,
                    supportModeLabel: "\(effectiveStyle.shortLabel) · Constitutional Guard"
                )
            }
        }

        return fallback
    }

    private func callGeminiText(prompt: String, systemInstruction: String, url: URL) async -> String? {
        let bodyDict: [String: Any] = [
            "system_instruction": ["parts": [["text": systemInstruction]]],
            "contents": [
                ["role": "user", "parts": [["text": prompt]]]
            ]
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 12
        request.httpBody = try? JSONSerialization.data(withJSONObject: bodyDict)

        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let candidates = json["candidates"] as? [[String: Any]],
               let content = candidates.first?["content"] as? [String: Any],
               let parts = content["parts"] as? [[String: Any]],
               let text = parts.first?["text"] as? String {
                let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
                if !trimmed.isEmpty {
                    return trimmed
                }
            }
        } catch {}
        return nil
    }

    private func generateGroundedReply(
        for prompt: String,
        effectiveStyle: TutorGuidanceStyle
    ) -> PhysicsCoachExchange {
        let lower = prompt.lowercased()
        let soul = AgentSoulLoader.soulDocument(for: selectedPersona)
        let catchphrase = soul.personality.catchphrases.first ?? "Let's reason from first principles:"
        let supportMode = MotivationalDialoguePolicy.supportMode(for: effectiveStyle, learnerText: prompt)
        let modeBadge = "\(selectedPersona.shortLabel) · \(effectiveStyle.shortLabel)"

        // If the learner expressed friction ("too hard", "i'm stuck") in adaptive mode, prefix a warm MI-aligned reflection
        let frictionPrefix: String
        if supportMode == .motivational {
            frictionPrefix = "It sounds like this step feels overloaded right now — that's completely normal in physics. We can make it smaller, take one hint, or I can explain it directly.\n\n"
        } else {
            frictionPrefix = ""
        }

        if lower.contains("iron") || lower.contains("electromagnet") || lower.contains("steel") {
            let text: String
            if effectiveStyle == .explainDirectly {
                text = "\(catchphrase)\nDirect Explanation (Topic 9.3 & Moving World Ch 13):\n• An electromagnet uses a **soft iron core** because soft iron is a *temporary* magnetic material: its magnetic domains align strongly when current flows (I > 0), and immediately lose their magnetism when the current is switched OFF.\n• **Steel** is a *permanent* magnetic material: if a scrapyard crane used a steel core, it would stay magnetised when the switch was turned off and could never drop the steel car!"
            } else {
                text = "\(frictionPrefix)\(catchphrase)\nThink about what the scrapyard crane needs to do *after* it moves a steel car over the crusher (Topic 9.3 & Moving World Ch 13):\n1. When electric current flows through the coil, both soft iron and steel become magnetised.\n2. When the driver switches the current OFF, what happens to the magnetic domains in soft iron compared with steel?\n3. Test this in the `fieldslab` simulation — why would a permanent steel core be a problem for a crane?"
            }
            return PhysicsCoachExchange(
                role: "coach",
                personaLabel: selectedPersona.displayName,
                text: text,
                linkedEquation: "B ∝ N · I   (Soft iron: temporary magnet; Steel: permanent magnet)",
                suggestedWidgetId: "fieldslab",
                suggestedChapter: 13,
                supportModeLabel: modeBadge
            )
        } else if lower.contains("compass") || lower.contains("geographic north") || lower.contains("earth") {
            let text: String
            if effectiveStyle == .explainDirectly {
                text = "\(catchphrase)\nDirect Explanation (Topic 9.1 & 9.2):\n• Unlike magnetic poles attract (N attracts S) and like poles repel.\n• Because the **north-seeking pole (N)** of a compass needle is attracted toward Earth's Geographic North Pole, Earth's liquid iron outer core must have a **magnetic SOUTH pole** located near Geographic North!"
            } else {
                text = "\(frictionPrefix)\(catchphrase)\nStart from the fundamental pole rule in Topic 9.1 & 9.2:\n• Do like poles attract or repel?\n• Since the North-seeking pole (N) of your compass needle is pulled toward Earth's Geographic North Pole, what kind of magnetic pole must be hidden deep inside Earth's liquid iron outer core under the Arctic?"
            }
            return PhysicsCoachExchange(
                role: "coach",
                personaLabel: selectedPersona.displayName,
                text: text,
                linkedEquation: "Unlike poles attract: N_compass → S_magnetic (at Geographic North)",
                suggestedWidgetId: "magnetometer",
                suggestedChapter: 13,
                supportModeLabel: modeBadge
            )
        } else if lower.contains("lever") || lower.contains("biceps") || lower.contains("moment") || lower.contains("pivot") {
            let text: String
            if effectiveStyle == .explainDirectly {
                text = "\(catchphrase)\nDirect Explanation (Topic 3.4 & 7.4):\n• Your elbow joint is the **pivot**, your forearm bone (radius/ulna) is the lever, and the principle of moments states M = F × d⊥.\n• Because your biceps tendon attaches ~4 cm from the elbow while the book in your hand is ~32 cm from the elbow (8× further), the biceps must pull with **8× the weight of the book** so that anticlockwise moment equals clockwise moment!"
            } else {
                text = "\(frictionPrefix)\(catchphrase)\nLet's draw the forearm as a lever with the elbow hinge joint as the pivot (Topic 3.4 & Topic 7.4):\n• Your hand holds the book about 32 cm from the elbow pivot, while your biceps tendon attaches only ~4 cm from the elbow.\n• For the forearm to stay balanced horizontally, the anticlockwise moment from the biceps must equal the clockwise moment from the book.\n• Since the biceps is 8× closer to the pivot, how many times larger must its pulling force be?"
            }
            return PhysicsCoachExchange(
                role: "coach",
                personaLabel: selectedPersona.displayName,
                text: text,
                linkedEquation: "M = F × d⊥   ⇒   F_biceps × 4 cm = F_book × 32 cm",
                suggestedWidgetId: "mechanicslab",
                suggestedChapter: 3,
                supportModeLabel: modeBadge
            )
        } else if lower.contains("blue") || lower.contains("filter") || lower.contains("colour") || lower.contains("spotlight") {
            let text: String
            if effectiveStyle == .explainDirectly {
                text = "\(catchphrase)\nDirect Explanation (Topic 6.4 & Moving World Ch 10):\n• White light is a mixture of Red, Green, and Blue (RGB) primary wavelengths.\n• A blue shirt pigment reflects **blue** light and **absorbs** red and green light.\n• Under a pure red spotlight, there is zero blue light to reflect and all the incoming red light is absorbed — so zero light reaches your eye and the shirt appears **black**."
            } else {
                text = "\(frictionPrefix)\(catchphrase)\nRemember how coloured surfaces and filters work by subtraction (Topic 6.4 & Moving World Ch 10):\n• A blue shirt looks blue in white sunlight because its dye reflects blue wavelengths and *absorbs* red and green.\n• If you shine ONLY pure red light onto that blue shirt, is there any blue light available for it to reflect?\n• What happens to the incoming red light, and what colour does your eye see when zero light reaches the retina?"
            }
            return PhysicsCoachExchange(
                role: "coach",
                personaLabel: selectedPersona.displayName,
                text: text,
                linkedEquation: "Primary light: R + G + B = White   |   Blue surface absorbs Red → reflects 0 (Black)",
                suggestedWidgetId: "colourmix",
                suggestedChapter: 10,
                supportModeLabel: modeBadge
            )
        } else if lower.contains("normal") || lower.contains("mirror") || lower.contains("refract") || lower.contains("light") {
            let text: String
            if effectiveStyle == .explainDirectly {
                text = "\(catchphrase)\nDirect Explanation (Topic 6.1 & 6.2 · Moving World Ch 10):\n• In optics we always measure angles from the **normal** — a dashed reference line drawn at **90°** to the surface at the point of incidence — because curved surfaces have a unique perpendicular normal at every point.\n• If a ray makes 25° with the mirror surface, the angle of incidence is i = 90° − 25° = 65°.\n• When light enters a denser medium like glass or water, it slows down and bends **toward the normal** (r < i)."
            } else {
                text = "\(frictionPrefix)\(catchphrase)\nCambridge examiners love testing this in Unit 6.1 & 6.2 (Moving World Ch 10):\n• Always draw the dashed NORMAL line at 90° to the mirror or glass boundary first.\n• If a ray makes a 25° angle with the mirror surface, what is the angle of incidence i between the ray and the 90° normal?\n• When the ray enters glass and slows down, does it bend *toward* the normal or *away* from the normal?"
            }
            return PhysicsCoachExchange(
                role: "coach",
                personaLabel: selectedPersona.displayName,
                text: text,
                linkedEquation: "i = 90° − θ_surface,   r = i (reflection),   Air → Glass bends TOWARD normal",
                suggestedWidgetId: "refraction",
                suggestedChapter: 10,
                supportModeLabel: modeBadge
            )
        } else if lower.contains("lung") || lower.contains("breath") || lower.contains("diaphragm") || lower.contains("pressure") {
            let text: String
            if effectiveStyle == .explainDirectly {
                text = "\(catchphrase)\nDirect Explanation (Topic 3.6 & Topic 1.3):\n• Gas pressure P = F ÷ A is caused by gas particles colliding with the walls of their container.\n• When your diaphragm contracts and flattens, your thoracic cavity **volume V increases**.\n• Spread over a larger volume, air molecules collide *less frequently* with the lung walls, so lung pressure drops below outside atmospheric pressure (101 kPa) and external air is pushed into your lungs."
            } else {
                text = "\(frictionPrefix)\(catchphrase)\nConnect Topic 3.6 (Gas pressure from particle collisions) with Topic 1.3 (Breathing):\n1. When your diaphragm contracts and flattens, what happens to the volume V of your chest cavity?\n2. With the same number of air molecules in a larger volume, do they collide with the alveolar walls more frequently or less frequently?\n3. Once lung pressure drops below outside atmospheric pressure (101 kPa), which way is air pushed?"
            }
            return PhysicsCoachExchange(
                role: "coach",
                personaLabel: selectedPersona.displayName,
                text: text,
                linkedEquation: "P = F_walls ÷ A   |   P₁V₁ = P₂V₂ (at constant T = 37 °C)",
                suggestedWidgetId: "pressuretank",
                suggestedChapter: 6,
                supportModeLabel: modeBadge
            )
        } else {
            return PhysicsCoachExchange(
                role: "coach",
                personaLabel: selectedPersona.displayName,
                text: "\(frictionPrefix)\(catchphrase)\nLet's break that down from first principles:\n1. Identify the system and draw the boundary or free-body arrows.\n2. Which conservation law or invariant relationship applies here (Forces F_net = ma, Moments M = F × d, Pressure P = F ÷ A, Energy conservation, or Wave speed v = fλ)?\n3. Write down your prediction with SI units first, or tap **Just Explain Directly** if you want the complete worked walkthrough right now!",
                linkedEquation: "P = F ÷ A   |   v = d ÷ t   |   v = f · λ",
                suggestedWidgetId: "forces",
                suggestedChapter: store.activeMovingWorldChapter,
                supportModeLabel: modeBadge
            )
        }
    }
}
