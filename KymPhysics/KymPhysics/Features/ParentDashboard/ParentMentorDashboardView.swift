import SwiftUI

/// Generates a clean, printable Markdown progress report for Kym's Dad / Mentor.
enum ParentMentorReportGenerator {
    @MainActor
    static func generateMarkdownReport(for store: AppStore) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short

        let physicsUnits = store.pack.schoolTextbook.units(for: .physicsCore)
        let independentProofs = store.questionProofs.values.filter { $0.level.isIndependentProof }.count
        let supportedProofs = store.questionProofs.values.filter { $0.level == .assisted || $0.level == .shaky }.count
        let totalSchoolQuestions = store.pack.schoolQuestions.count

        var lines: [String] = [
            "# KymPhysics — Grade 8 Mentor & Proof Telemetry Report",
            "**Learner:** Kymaia (Grade 8 · Mumbai)  ",
            "**Generated:** \(formatter.string(from: Date()))  ",
            "**Curriculum:** Cambridge Lower Secondary Science 8 (Units 3, 6, 9 + Bridges) & *The Moving World* (Chapters 0–15)",
            "",
            "## 1. Executive Proof Summary (Independent vs. Assisted)",
            "- **Independent School Question Proofs:** \(independentProofs) / \(totalSchoolQuestions)",
            "- **Hint-Supported Practice Attempts:** \(supportedProofs)",
            "- **507 Chapter Exam Bank Attempts:** \(store.examAttempts.count) / \(store.totalExamQuestionsCount)",
            "- **Interactive Simulation Challenge Stamps:** \(store.widgetStamps.count) / \(store.pack.widgets.count)",
            "- **Apple Pencil Diagram Recall Attempts:** \(store.diagramAttempts.count)",
            "- **Due FSRS Spaced Retrieval Cards:** \(store.dueFSRSCards.count)",
            "",
            "## 2. School Physics Units Breakdown (Units 3, 6, 9)"
        ]

        for unit in physicsUnits {
            let snap = store.unitReadiness(for: unit)
            let readinessPct = Int(round(snap.independentProofFraction * 100))
            let provenTotal = snap.questionsProvenCount + snap.questionsSecureCount
            lines.append("- **Unit \(unit.unitNumber): \(unit.title)** (\(unit.isCompletedInSchool ? "Covered in School ✓" : "Upcoming Unit")) — Readiness: **\(readinessPct)%** · Independent Proofs: **\(provenTotal)/\(snap.questionsTotal)** · Mean BKT Mastery: **\(Int(round(snap.averageBKTMastery * 100)))%**")
        }

        lines.append("")
        lines.append("## 3. Dinner-Table Socratic Conversation Starters for Dad")
        lines.append("1. **Unit 9.2–9.3 (Earth's Magnetic Shield & Electromagnets):** Ask Kym why a compass north pole points toward geographic North (because geographic North is actually a magnetic South pole!) and why scrap-yard cranes use soft iron rather than steel.")
        lines.append("2. **Unit 6.2–6.4 (Refraction & RGB Colour Filters):** Ask Kym why violet bends more than red in a glass prism, and what colour a green leaf appears under pure red light.")
        lines.append("3. **Unit 3.4–3.6 (Moments & Particle Pressure):** Ask Kym why gas pressure rises when heated at constant volume (both collision frequency and collision force increase).")

        return lines.joined(separator: "\n")
    }
}

/// Ported and adapted from `../kym_tutor/Features/ParentDashboard`:
/// Dedicated Dad / Mentor Lens separating Independent Proofs from Assisted Practice across Units 3, 6, and 9.
struct ParentMentorDashboardView: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedOverridePersona: PhysicsMentorPersona = .feynman
    @State private var selectedToneOverride: String = "warm"
    @State private var selectedPacingOverride: String = "learner-led"
    @State private var selectedLengthOverride: String = "balanced"
    @State private var selectedAnalogyOverride: String = "use-when-helpful"
    @State private var overrideStatusMessage: String? = nil

    private var physicsUnits: [SchoolScienceUnit] {
        store.pack.schoolTextbook.units(for: .physicsCore)
    }

    private var independentProofCount: Int {
        store.questionProofs.values.filter { $0.level.isIndependentProof }.count
    }

    private var supportedAttemptCount: Int {
        store.questionProofs.values.filter { $0.level == .assisted || $0.level == .shaky }.count
    }

    private var markdownReport: String {
        ParentMentorReportGenerator.generateMarkdownReport(for: store)
    }

    var body: some View {
        JournalPage(
            title: "Dad / Mentor Lens · Proof Telemetry & Socratic Prompts",
            subtitle: "True Independent Proof vs. Assisted Practice across Cambridge Science 8 (Units 3, 6, 9) & The Moving World",
            headerAccessory: {
                HStack(spacing: Spacing.sm) {
                    ShareLink(
                        item: markdownReport,
                        subject: Text("KymPhysics Progress & Proof Report"),
                        message: Text("Here is Kym's latest Physics Proof & BKT Mastery telemetry.")
                    ) {
                        Label("Export Progress Report", systemImage: "square.and.arrow.up")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)

                    ThemePickerMenu()
                }
            }
        ) {
            // 1. High-Signal Telemetry Strip
            JournalSection(
                title: "1. Independent Proof vs. Assisted Practice",
                subtitle: "In KymPhysics, hints and coached walk-throughs never inflate mastery — only unassisted recall counts as Proven"
            ) {
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
                        label: "Independent Proofs",
                        value: "\(independentProofCount)/\(store.pack.schoolQuestions.count)",
                        detail: "Unassisted pass",
                        symbol: "checkmark.seal.fill"
                    )
                    JournalGlanceTile(
                        label: "Assisted Practice",
                        value: "\(supportedAttemptCount)",
                        detail: "Coached / hint used",
                        symbol: "lifepreserver.fill"
                    )
                    JournalGlanceTile(
                        label: "507 Exam Bank",
                        value: "\(store.examAttempts.count)/\(store.totalExamQuestionsCount)",
                        detail: "Self-marked papers",
                        symbol: "doc.text.magnifyingglass"
                    )
                    JournalGlanceTile(
                        label: "Lab & Diagram Work",
                        value: "\(store.widgetStamps.count + store.diagramAttempts.count)",
                        detail: "\(store.widgetStamps.count) labs · \(store.diagramAttempts.count) sketches",
                        symbol: "pencil.and.ruler.fill"
                    )
                }
            }

            // 2. Unit-by-Unit Readiness & Topic Proof Breakdown
            JournalSection(
                title: "2. Cambridge Science 8 Physics Units (Units 3, 6, 9)",
                subtitle: "Tap any topic to open its Learner's Book 8 & Workbook 8 Question Proofs"
            ) {
                VStack(spacing: Spacing.md) {
                    ForEach(physicsUnits) { unit in
                        let snap = store.unitReadiness(for: unit)
                        let readinessPct = Int(round(snap.independentProofFraction * 100))
                        let provenTotal = snap.questionsProvenCount + snap.questionsSecureCount
                        JournalCard {
                            VStack(alignment: .leading, spacing: Spacing.sm) {
                                HStack {
                                    JournalBadge(
                                        text: unit.isCompletedInSchool ? "Covered in School ✓" : "Upcoming Unit",
                                        tone: unit.isCompletedInSchool ? .positive : .accent
                                    )
                                    Text("Unit \(unit.unitNumber): \(unit.title)")
                                        .font(.kymaiaTitle3)
                                        .foregroundStyle(Color.kymaiaInk)
                                    Spacer()
                                    JournalBadge(text: snap.readinessBadgeText, tone: .neutral)
                                }

                                ProgressView(value: Double(readinessPct), total: 100.0)
                                    .tint(Color.kymaiaPrimary)

                                HStack(spacing: Spacing.lg) {
                                    Text("Independent Proofs: \(provenTotal)/\(snap.questionsTotal)")
                                        .font(.kymaiaCaption.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaInk)
                                    Text("Mean BKT Mastery: \(Int(round(snap.averageBKTMastery * 100)))%")
                                        .font(.kymaiaCaption.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaPrimary)
                                    Text("Chapters Read: \(snap.chaptersReadCount) · Labs Stamped: \(snap.widgetsStampedCount)")
                                        .font(.kymaiaCaption)
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                }

                                FlowLayout(spacing: Spacing.xs) {
                                    ForEach(unit.topics) { topic in
                                        let skill = store.bktSkills[topic.code]
                                        let pct = Int(round((skill?.pLearned ?? 0.35) * 100))
                                        Button {
                                            store.selectedUnitNumber = unit.unitNumber
                                            store.selectedTopicCode = topic.code
                                            store.selectedRoom = .schoolScience
                                        } label: {
                                            JournalChip(
                                                title: "\(topic.code) \(topic.title) (\(pct)%)",
                                                isSelected: false
                                            )
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 3. Dinner-Table Socratic Prompts for Dad
            JournalSection(
                title: "3. 5-Minute Dinner-Table Socratic Prompts for Dad",
                subtitle: "High-leverage questions you can ask Kym on a walk along Marine Drive or over dinner — no screen required"
            ) {
                VStack(spacing: Spacing.md) {
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            HStack {
                                JournalBadge(text: "Unit 9.2 & 9.3 · Magnetism & Electromagnets", tone: .accent)
                                Spacer()
                            }
                            Text("\"Why does the North pole of your hiking compass point toward Earth's geographic North Pole — and why must a scrap-yard electromagnet use a soft iron core instead of hard steel?\"")
                                .font(.kymaiaHeadline)
                                .foregroundStyle(Color.kymaiaInk)
                            Text("What to listen for: Opposite magnetic poles attract, so Earth's geographic North Pole is actually a magnetic SOUTH pole! And soft iron magnetizes strongly when current flows (B ∝ N·I) but demagnetizes the instant current stops so the crane can drop the scrap iron.")
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                    }

                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            HStack {
                                JournalBadge(text: "Unit 6.2–6.4 · Refraction, Dispersion & Colour", tone: .accent)
                                Spacer()
                            }
                            Text("\"When white sunlight enters a glass prism, why does violet bend through a sharper angle than red — and what colour does a bright red cricket ball look under a pure green lamp?\"")
                                .font(.kymaiaHeadline)
                                .foregroundStyle(Color.kymaiaInk)
                            Text("What to listen for: Shorter-wavelength violet light slows down more in glass than red light (higher refractive index n), so it refracts further toward the base. A red ball reflects red and absorbs green, so under pure green light zero light reflects and it looks black.")
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                    }

                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            HStack {
                                JournalBadge(text: "Unit 3.4–3.6 · Moments & Particle Pressure", tone: .accent)
                                Spacer()
                            }
                            Text("\"Using the particle model, what two things happen inside a sealed bicycle tyre when it sits in the hot Mumbai afternoon sun?\"")
                                .font(.kymaiaHeadline)
                                .foregroundStyle(Color.kymaiaInk)
                            Text("What to listen for: Heating increases the average kinetic energy of the air molecules so they move faster; they hit the inside walls (1) more frequently and (2) with greater force per collision, increasing F/A = pressure.")
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                    }
                }
            }

            // 4. Recent Lab Notebook & Error Autopsy Entries
            JournalSection(
                title: "4. Kym's Recent Lab Notebook, Reflections & Error Autopsies (\(store.journalEntries.count))",
                subtitle: "Tap any entry to inspect Kym's Cornell notes, Feynman Teach-Backs, and Apple Pencil diagrams"
            ) {
                VStack(spacing: Spacing.sm) {
                    ForEach(store.journalEntries.prefix(6)) { entry in
                        let topic = entry.linkedTopicCode ?? "9.1"
                        Button {
                            store.activeJournalEntry = entry
                            store.selectedRoom = .labJournal
                        } label: {
                            JournalCard {
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            JournalBadge(text: entry.templateKind.uppercased(), tone: .accent)
                                            JournalBadge(text: "Topic \(topic)", tone: .neutral)
                                        }
                                        Text(entry.title)
                                            .font(.kymaiaHeadline)
                                            .foregroundStyle(Color.kymaiaInk)
                                        Text(entry.summaryText.isEmpty ? entry.bodyNotesText : entry.summaryText)
                                            .font(.kymaiaCaption)
                                            .foregroundStyle(Color.kymaiaMutedInk)
                                            .lineLimit(2)
                                    }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // 5. Tutor Constitution, Bounded Soul Preferences & Adversarial Council
            JournalSection(
                title: "5. Tutor Constitution, Safety Guardrails & Bounded Soul Preferences",
                subtitle: "Safety, truthfulness, learner agency, and evidence-aligned pedagogy always outrank persona or parent overrides"
            ) {
                let budget = AIBudgetLedger.shared.currentSnapshot()
                VStack(spacing: Spacing.md) {
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            HStack(spacing: Spacing.sm) {
                                JournalBadge(text: "Constitution \(TutorConstitution.version)", tone: .accent)
                                JournalBadge(text: "On-Device Crisis Scanner Active", tone: .positive)
                                JournalBadge(
                                    text: "AI Budget: \(budget.dailyCount)/\(budget.dailyLimit) today · \(budget.monthlyCount)/\(budget.monthlyLimit) mo",
                                    tone: .neutral
                                )
                                Spacer()
                            }
                            Text("SHA-256 Policy Hash: \(TutorConstitution.policyHash)")
                                .font(.kymaiaMonoCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                            Text("Precedence Hierarchy: (1) Safety, privacy & human dignity → (2) Truth & non-deception → (3) Learner agency & healthy development → (4) Evidence-aligned pedagogy → (5) Allowlisted parent preferences → (6) Mentor Soul persona.")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaInk)
                        }
                    }

                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            HStack {
                                Text("Allowlisted Parent Soul Preferences (\(selectedOverridePersona.displayName))")
                                    .font(.kymaiaSubheadline)
                                    .foregroundStyle(Color.kymaiaInk)
                                Spacer()
                                Picker("Persona", selection: $selectedOverridePersona) {
                                    ForEach(PhysicsMentorPersona.allCases) { persona in
                                        Text(persona.shortLabel).tag(persona)
                                    }
                                }
                                .pickerStyle(.menu)
                            }

                            HStack(spacing: Spacing.md) {
                                Picker("Tone", selection: $selectedToneOverride) {
                                    ForEach(AgentSoulOverrideKey.tone.allowedValues, id: \.self) { val in
                                        Text(val.capitalized).tag(val)
                                    }
                                }
                                Picker("Pacing", selection: $selectedPacingOverride) {
                                    ForEach(AgentSoulOverrideKey.pacing.allowedValues, id: \.self) { val in
                                        Text(val.capitalized).tag(val)
                                    }
                                }
                                Picker("Length", selection: $selectedLengthOverride) {
                                    ForEach(AgentSoulOverrideKey.responseLength.allowedValues, id: \.self) { val in
                                        Text(val.capitalized).tag(val)
                                    }
                                }
                                Picker("Analogies", selection: $selectedAnalogyOverride) {
                                    ForEach(AgentSoulOverrideKey.analogyPreference.allowedValues, id: \.self) { val in
                                        Text(val).tag(val)
                                    }
                                }
                            }

                            HStack {
                                Button {
                                    do {
                                        try AgentSoulLoader.saveOverride(persona: selectedOverridePersona, key: AgentSoulOverrideKey.tone.rawValue, value: selectedToneOverride)
                                        try AgentSoulLoader.saveOverride(persona: selectedOverridePersona, key: AgentSoulOverrideKey.pacing.rawValue, value: selectedPacingOverride)
                                        try AgentSoulLoader.saveOverride(persona: selectedOverridePersona, key: AgentSoulOverrideKey.responseLength.rawValue, value: selectedLengthOverride)
                                        try AgentSoulLoader.saveOverride(persona: selectedOverridePersona, key: AgentSoulOverrideKey.analogyPreference.rawValue, value: selectedAnalogyOverride)
                                        overrideStatusMessage = "Saved bounded preferences for \(selectedOverridePersona.displayName) (\(selectedToneOverride), \(selectedPacingOverride), \(selectedLengthOverride))."
                                    } catch {
                                        overrideStatusMessage = error.localizedDescription
                                    }
                                } label: {
                                    Label("Save Allowlisted Preferences", systemImage: "checkmark.shield")
                                        .font(.kymaiaCaption.weight(.semibold))
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(Color.kymaiaPrimary)

                                if let overrideStatusMessage {
                                    Text(overrideStatusMessage)
                                        .font(.kymaiaCaption)
                                        .foregroundStyle(Color.kymaiaSuccess)
                                }
                            }
                        }
                    }
                }
            }
        }
        .onAppear {
            syncSoulOverridesFromStorage()
        }
        .onChange(of: selectedOverridePersona) { _, _ in
            syncSoulOverridesFromStorage()
        }
    }

    private func syncSoulOverridesFromStorage() {
        let overrides = AgentSoulLoader.soulDocument(for: selectedOverridePersona).parentOverrides ?? [:]
        selectedToneOverride = overrides[AgentSoulOverrideKey.tone.rawValue] ?? "warm"
        selectedPacingOverride = overrides[AgentSoulOverrideKey.pacing.rawValue] ?? "learner-led"
        selectedLengthOverride = overrides[AgentSoulOverrideKey.responseLength.rawValue] ?? "balanced"
        selectedAnalogyOverride = overrides[AgentSoulOverrideKey.analogyPreference.rawValue] ?? "use-when-helpful"
    }
}
