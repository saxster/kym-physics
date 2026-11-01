import SwiftUI

struct TodayHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var revealedCardId: String? = nil
    @State private var showDailyRitualSheet: Bool = false

    private var physicsUnits: [SchoolScienceUnit] {
        store.pack.schoolTextbook.units(for: .physicsCore)
    }

    private var totalProvenQuestions: Int {
        store.questionProofs.values.filter { $0.level.isIndependentProof }.count
    }

    var body: some View {
        JournalPage(
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
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)

                    ThemePickerMenu()
                }
            }
        ) {
            // 0. Guided 7-Phase Daily Physics Ritual Hero Card
            JournalCard {
                HStack(alignment: .center, spacing: Spacing.md) {
                    Image(systemName: "flame.circle.fill")
                        .font(.system(size: 38))
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
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaPrimary)
                }
            }
            .sheet(isPresented: $showDailyRitualSheet) {
                PhysicsDailyRitualSessionView()
                    .environmentObject(store)
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
                                        Button {
                                            store.selectedUnitNumber = unit.unitNumber
                                            store.selectedTopicCode = topic.code
                                            store.selectedRoom = .schoolScience
                                        } label: {
                                            JournalChip(
                                                title: "\(topic.code) \(topic.title)",
                                                isSelected: store.selectedTopicCode == topic.code
                                            )
                                        }
                                        .buttonStyle(.plain)
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
                                    .buttonStyle(.borderedProminent)
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
                                        .buttonStyle(.borderedProminent)
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
                                .buttonStyle(.borderedProminent)
                                .tint(Color.kymaiaPrimary)
                            }
                        }
                    }
                } else {
                    JournalEmptyState(
                        symbol: "checkmark.circle.fill",
                        title: "All due Physics cards reviewed!",
                        message: "You are caught up for today. Jump into Unit 9 Magnetism or try a 3D Physics Lab."
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
