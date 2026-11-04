import SwiftUI

/// Loads `subject-tips-physics-v1.json` from the app bundle and presents the complete
/// interactive Physics Subject Tips library (Predict → Explore Visual → Explain → Practise).
enum PhysicsSubjectTipsLoader {
    static func loadPhysicsTips() -> [SubjectTip] {
        let candidateBundles: [Bundle] = [Bundle.main] + Bundle.allBundles
        for bundle in candidateBundles {
            if let url = bundle.url(forResource: "subject-tips-physics-v1", withExtension: "json")
                ?? bundle.url(forResource: "subject-tips-physics-v1", withExtension: "json", subdirectory: "ContentPacks"),
               let data = try? Data(contentsOf: url),
               let pack = try? JSONDecoder().decode(SubjectTipsPack.self, from: data) {
                return pack.tips
            }
        }

        // Dev fallback path when running tests or local previews
        let fallbackURL = URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/KymPhysics/KymPhysics/Resources/ContentPacks/subject-tips-physics-v1.json")
        if let data = try? Data(contentsOf: fallbackURL),
           let pack = try? JSONDecoder().decode(SubjectTipsPack.self, from: data) {
            return pack.tips
        }
        return []
    }
}

struct PhysicsSubjectTipsView: View {
    @State private var tips: [SubjectTip] = PhysicsSubjectTipsLoader.loadPhysicsTips()
    @State private var selectedStrand: String = "All"
    @State private var searchText: String = ""
    @State private var selectedTip: SubjectTip?
    @State private var readingsByTipId: [String: SubjectTipReading] = [:]

    private var strands: [String] {
        let unique = Array(Set(tips.map(\.strand))).sorted()
        return ["All"] + unique
    }

    private var filteredTips: [SubjectTip] {
        tips.filter { tip in
            let matchesStrand = (selectedStrand == "All") || (tip.strand == selectedStrand)
            guard matchesStrand else { return false }
            let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            guard !query.isEmpty else { return true }
            return tip.title.lowercased().contains(query)
                || tip.summary.lowercased().contains(query)
                || tip.strand.lowercased().contains(query)
                || tip.syllabusRefs.contains { $0.lowercased().contains(query) }
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.lg) {
            // Header & search
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    JournalEyebrow(symbol: "lightbulb.max.fill", tint: .kymaiaAccent, text: "Interactive Physics Concept Studio · Cambridge Stage 8")
                    Text("First-Principles Visual Tips & Exam Watchouts")
                        .font(.kymaiaSectionTitle)
                        .foregroundStyle(Color.kymaiaTextPrimary)
                    Text("Every tip follows a 4-step studio loop — **1. Predict → 2. Explore the live interactive visual → 3. Explain in your own words → 4. Practise** with instant mark-scheme reveals.")
                        .font(.kymaiaCallout)
                        .foregroundStyle(Color.kymaiaTextSecondary)

                    HStack(spacing: Spacing.sm) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(Color.kymaiaTextTertiary)
                        TextField("Search forces, speed, moments, pressure, reflection, refraction, circuits…", text: $searchText)
                            .textFieldStyle(.plain)
                            .font(.kymaiaBody)
                    }
                    .padding(.horizontal, Spacing.md)
                    .padding(.vertical, Spacing.sm)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                            .fill(Color.kymaiaSurface)
                    )

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            ForEach(strands, id: \.self) { strand in
                                Button(strand) {
                                    selectedStrand = strand
                                }
                                .buttonStyle(KymaiaOptionButtonStyle(isSelected: selectedStrand == strand))
                            }
                        }
                    }
                }
            }

            if let activeTip = selectedTip ?? filteredTips.first {
                // Split or stacked selector + active tip studio
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Spacing.sm) {
                        ForEach(filteredTips) { tip in
                            let isSelected = activeTip.id == tip.id
                            let isBookmarked = readingsByTipId[tip.id]?.isSaved == true
                            Button {
                                selectedTip = tip
                            } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 6) {
                                        Image(systemName: tip.visual.kind.symbol)
                                            .font(.kymaiaSymbolSmall)
                                            .foregroundStyle(isSelected ? Color.kymaiaBackground : Color.kymaiaAccent)
                                        Text(tip.strand)
                                            .font(.kymaiaCaption)
                                            .foregroundStyle(isSelected ? Color.kymaiaBackground.opacity(0.9) : Color.kymaiaTextSecondary)
                                        if isBookmarked {
                                            Image(systemName: "bookmark.fill")
                                                .font(.kymaiaCaption2)
                                                .foregroundStyle(isSelected ? Color.kymaiaBackground : Color.kymaiaWarning)
                                        }
                                    }
                                    Text(tip.title)
                                        .font(.kymaiaSubheadline.weight(.semibold))
                                        .foregroundStyle(isSelected ? Color.kymaiaBackground : Color.kymaiaTextPrimary)
                                        .lineLimit(2)
                                        .multilineTextAlignment(.leading)
                                    Text(tip.visual.kind.activity)
                                        .font(.kymaiaCaption)
                                        .foregroundStyle(isSelected ? Color.kymaiaBackground.opacity(0.85) : Color.kymaiaAccent)
                                }
                                .padding(Spacing.md)
                                .frame(width: 250, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                        .fill(isSelected ? Color.kymaiaAccent : Color.kymaiaSurfaceElevated)
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                        .strokeBorder(isSelected ? Color.kymaiaAccent : Color.kymaiaSurfaceBorder, lineWidth: 1)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                PhysicsSubjectTipStudioCard(
                    tip: activeTip,
                    reading: bindingForTip(activeTip)
                )
            }
        }
    }

    private func bindingForTip(_ tip: SubjectTip) -> Binding<SubjectTipReading> {
        Binding(
            get: {
                readingsByTipId[tip.id] ?? SubjectTipReading(visualState: SubjectTipVisualLogic.initialState(for: tip.visual))
            },
            set: { newValue in
                readingsByTipId[tip.id] = newValue
            }
        )
    }
}

private struct PhysicsSubjectTipStudioCard: View {
    let tip: SubjectTip
    @Binding var reading: SubjectTipReading

    var body: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.lg) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        JournalEyebrow(symbol: tip.visual.kind.symbol, tint: .kymaiaAccent, text: "\(tip.strand) · \(tip.visual.kind.activity)")
                        Text(tip.title)
                            .font(.kymaiaTitle2)
                            .foregroundStyle(Color.kymaiaTextPrimary)
                        Text(tip.summary)
                            .font(.kymaiaSerifProse)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                    }
                    Spacer()
                    Button {
                        reading.isSaved.toggle()
                    } label: {
                        Label(
                            reading.isSaved ? "Saved" : "Bookmark",
                            systemImage: reading.isSaved ? "bookmark.fill" : "bookmark"
                        )
                    }
                    .buttonStyle(SessionGhostButtonStyle())
                }

                // 4-Stage Stepper Bar
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(reading.stage.progress)
                        .font(.kymaiaEyebrow)
                        .textCase(.uppercase)
                        .foregroundStyle(Color.kymaiaMutedInk)
                    HStack(spacing: Spacing.xs) {
                        ForEach(SubjectTipStage.allCases, id: \.self) { stg in
                            Capsule()
                                .fill(stg.rawValue <= reading.stage.rawValue ? Color.kymaiaAccent : Color.kymaiaControlFill)
                                .frame(height: 5)
                        }
                    }
                    FlowLayout(spacing: Spacing.xs) {
                        ForEach(SubjectTipStage.allCases, id: \.self) { item in
                            let label = ["1. Predict", "2. Explore Visual", "3. Explain", "4. Practise"][item.rawValue]
                            Button(label) {
                                reading.stage = item
                            }
                            .buttonStyle(KymaiaOptionButtonStyle(isSelected: reading.stage == item))
                        }
                    }
                }

                switch reading.stage {
                case .predict:
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        Text(tip.prediction)
                            .font(.kymaiaSerifPrompt)
                            .foregroundStyle(Color.kymaiaTextPrimary)
                        TextField("Commit to your prediction first…", text: $reading.prediction, axis: .vertical)
                            .learnerTextInput(.retrieval)
                        HStack(spacing: Spacing.sm) {
                            Button("Explore the interactive model →") {
                                reading.stage = .explore
                            }
                            .buttonStyle(JournalCapsuleButtonStyle())

                            Button("Skip to demonstration") {
                                reading.stage = .explore
                            }
                            .buttonStyle(SessionGhostButtonStyle())
                        }
                    }

                case .explore:
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        if !reading.prediction.isEmpty {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Your prediction")
                                    .font(.kymaiaCaption.weight(.semibold))
                                    .foregroundStyle(Color.kymaiaTextSecondary)
                                Text(reading.prediction)
                                    .font(.kymaiaBody)
                            }
                            .padding(Spacing.sm)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .journalIllustrationSurface()
                        }

                        SubjectTipVisualView(visual: tip.visual, state: $reading.visualState)
                            .padding(Spacing.md)
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                    .fill(Color.kymaiaSurface)
                            )

                        Text("Why it works")
                            .font(.kymaiaTitle3)
                        Text(tip.why)
                            .font(.kymaiaSerifProse)
                            .foregroundStyle(Color.kymaiaTextPrimary)

                        Button("Continue to 3. Explain →") {
                            reading.stage = .explain
                        }
                        .buttonStyle(JournalCapsuleButtonStyle())
                    }

                case .explain:
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        Text(tip.explainPrompt)
                            .font(.kymaiaSerifPrompt)
                        TextField("Explain the physical mechanism in your own words…", text: $reading.explanation, axis: .vertical)
                            .learnerTextInput(.retrieval)
                        HStack(spacing: Spacing.sm) {
                            Button("Continue to 4. Practise →") {
                                reading.stage = .practise
                            }
                            .buttonStyle(JournalCapsuleButtonStyle())

                            Button("Back to Visual") {
                                reading.stage = .explore
                            }
                            .buttonStyle(SessionGhostButtonStyle())
                        }
                    }

                case .practise:
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        SubjectTipPracticeList(questions: tip.practice, revealed: $reading.revealedPractice)
                        Button("Back to Visual Demonstration") {
                            reading.stage = .explore
                        }
                        .buttonStyle(SessionGhostButtonStyle())
                    }
                }

                Divider().overlay(Color.kymaiaHairline)

                VStack(alignment: .leading, spacing: Spacing.sm) {
                    Text("When it helps in exams")
                        .font(.kymaiaTitle3)
                    Text(tip.whenToUse)
                        .font(.kymaiaSerifProse)

                    Text("Cambridge Watchout")
                        .font(.kymaiaTitle3)
                        .foregroundStyle(Color.kymaiaWarning)
                    Text(tip.watchFor)
                        .font(.kymaiaSerifProse)
                }

                SubjectTipGoDeeper(goDeeper: tip.goDeeper)
                SubjectTipSources(tip: tip)
            }
        }
    }
}
