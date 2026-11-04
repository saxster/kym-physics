import SwiftUI

/// Unified `⌘K` Omnisearch & Contextual Lookup engine across all KymPhysics rooms and databases.
enum PhysicsOmnisearchEngine {
    enum ResultCategory: String, CaseIterable, Identifiable, Sendable {
        case all = "All"
        case schoolTopic = "School Science 8"
        case chapter = "Moving World Chapters"
        case story = "95 Physics Stories"
        case simulation = "56 Live Simulations"
        case investigation = "126 Investigations"
        case proofQuestion = "School Proofs"
        case examQuestion = "507 Exam Questions"
        case wolfram = "16 Wolfram Drills"
        case notebook = "Lab Notebook"

        var id: String { rawValue }
    }

    struct SearchHit: Identifiable, Sendable {
        let id: String
        let category: ResultCategory
        let title: String
        let subtitle: String
        let badge: String
        let symbol: String
        let deepLinkURL: URL
    }

    @MainActor
    static func search(
        query: String,
        category: ResultCategory = .all,
        in store: AppStore,
        limit: Int = 60
    ) -> [SearchHit] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        var results: [SearchHit] = []

        func matches(_ fields: [String]) -> Bool {
            guard !trimmed.isEmpty else { return true }
            return fields.contains { $0.lowercased().contains(trimmed) }
        }

        // 1. School Science 8 Sub-topics (44 topics)
        if category == .all || category == .schoolTopic {
            for unit in store.pack.schoolTextbook.units {
                for topic in unit.topics {
                    if matches([topic.code, topic.title, topic.summary, unit.title]) {
                        if let url = URL(string: "kymphysics://school-unit/\(topic.code)") {
                            results.append(
                                SearchHit(
                                    id: "topic-\(topic.code)",
                                    category: .schoolTopic,
                                    title: "Topic \(topic.code) · \(topic.title)",
                                    subtitle: "Unit \(unit.unitNumber): \(unit.title) · LB p. \(topic.learnersBookPage) / WB p. \(topic.workbookPage)",
                                    badge: "Unit \(unit.unitNumber)",
                                    symbol: "book.closed.fill",
                                    deepLinkURL: url
                                )
                            )
                        }
                    }
                }
            }
        }

        // 2. Moving World Chapters (16 chapters)
        if category == .all || category == .chapter {
            for ch in store.pack.chapters {
                if matches([ch.title, ch.subtitle, ch.hookSummary, "ch \(ch.number)", "chapter \(ch.number)"] + ch.keyTerms) {
                    if let url = URL(string: "kymphysics://chapter/\(ch.number)") {
                        results.append(
                            SearchHit(
                                id: "ch-\(ch.number)",
                                category: .chapter,
                                title: "Chapter \(ch.number) · \(ch.title)",
                                subtitle: "\(ch.volumeTitle) · \(ch.subtitle)",
                                badge: "Ch \(ch.number)",
                                symbol: "globe.asia.australia.fill",
                                deepLinkURL: url
                            )
                        )
                    }
                }
            }
        }

        // 3. 56 Interactive Simulations
        if category == .all || category == .simulation {
            for w in store.pack.widgets {
                if matches([w.id, w.title, w.challengePrompt, w.cutaway, w.idealised]) {
                    if let url = URL(string: "kymphysics://lab/\(w.id)") {
                        results.append(
                            SearchHit(
                                id: "sim-\(w.id)",
                                category: .simulation,
                                title: w.title,
                                subtitle: "Ch \(w.chapter) · \(w.challengePrompt)",
                                badge: w.is3D ? "3D WebGL" : "2D Canvas",
                                symbol: "gyroscope",
                                deepLinkURL: url
                            )
                        )
                    }
                }
            }
        }

        // 4. 45 School Proof Questions
        if category == .all || category == .proofQuestion {
            for q in store.pack.schoolQuestions {
                if matches([q.topicCode, q.bookSection, q.prompt, q.modelAnswer, q.sourceBook]) {
                    if let url = URL(string: "kymphysics://school-unit/\(q.topicCode)") {
                        results.append(
                            SearchHit(
                                id: "proof-\(q.id)",
                                category: .proofQuestion,
                                title: "\(q.sourceBadgeTitle) · Topic \(q.topicCode) (\(q.bookSection))",
                                subtitle: q.prompt,
                                badge: q.tier,
                                symbol: "checkmark.seal.fill",
                                deepLinkURL: url
                            )
                        )
                    }
                }
            }
        }

        // 5. 16 Wolfram Quantitative Drills
        if category == .all || category == .wolfram {
            for tpl in QuantitativePhysicsEngine.templates {
                if matches([tpl.title, tpl.formulaDisplay, tpl.topicCode, tpl.stepByStepSolution.joined(separator: " ")]) {
                    if let url = URL(string: "kymphysics://practice/wolfram") {
                        results.append(
                            SearchHit(
                                id: "wolfram-\(tpl.id)",
                                category: .wolfram,
                                title: tpl.title,
                                subtitle: "\(tpl.formulaDisplay) · Ch \(tpl.chapter) · Topic \(tpl.topicCode)",
                                badge: "Wolfram Drill",
                                symbol: "function",
                                deepLinkURL: url
                            )
                        )
                    }
                }
            }
        }

        // 6. 95 Stories
        if category == .all || category == .story {
            for story in store.pack.stories {
                if matches([story.title, story.excerpt, story.kind]) {
                    if let url = URL(string: "kymphysics://chapter/\(store.activeMovingWorldChapter)") {
                        results.append(
                            SearchHit(
                                id: "story-\(story.id)",
                                category: .story,
                                title: story.title,
                                subtitle: story.excerpt,
                                badge: story.kind.capitalized,
                                symbol: "sparkles.rectangle.stack.fill",
                                deepLinkURL: url
                            )
                        )
                    }
                }
            }
        }

        // 7. 126 Investigations
        if category == .all || category == .investigation {
            for inv in store.pack.investigations {
                if matches([inv.title, inv.question, inv.explanation, inv.category]) {
                    if let url = URL(string: "kymphysics://explorer/powers-of-ten") {
                        results.append(
                            SearchHit(
                                id: "inv-\(inv.id)",
                                category: .investigation,
                                title: inv.title,
                                subtitle: "\(inv.category.capitalized) · \(inv.question)",
                                badge: "Investigation",
                                symbol: "flask.fill",
                                deepLinkURL: url
                            )
                        )
                    }
                }
            }
        }

        // 8. 507 Exam Questions
        if category == .all || category == .examQuestion {
            for bank in store.pack.examBanks {
                for eq in bank.questions {
                    if matches([eq.title, eq.prompt, eq.model.joined(separator: " "), bank.title, eq.stage]) {
                        if let url = URL(string: "kymphysics://practice/exams/\(bank.chapter)") {
                            results.append(
                                SearchHit(
                                    id: "exam-\(eq.id)",
                                    category: .examQuestion,
                                    title: "Ch \(bank.chapter) (\(bank.title)) · \(eq.marks)m",
                                    subtitle: eq.prompt,
                                    badge: eq.stage.capitalized,
                                    symbol: "doc.text.magnifyingglass",
                                    deepLinkURL: url
                                )
                            )
                        }
                    }
                }
            }
        }

        // 9. Lab Notebook Entries
        if category == .all || category == .notebook {
            for entry in store.journalEntries {
                let topic = entry.linkedTopicCode ?? "9.1"
                if matches([entry.title, topic, entry.bodyNotesText, entry.summaryText]) {
                    if let url = URL(string: "kymphysics://journal/\(entry.id)") {
                        results.append(
                            SearchHit(
                                id: "journal-\(entry.id)",
                                category: .notebook,
                                title: entry.title,
                                subtitle: entry.summaryText.isEmpty ? entry.bodyNotesText : entry.summaryText,
                                badge: "Topic \(topic)",
                                symbol: "pencil.and.scribble",
                                deepLinkURL: url
                            )
                        )
                    }
                }
            }
        }

        return Array(results.prefix(limit))
    }
}

struct PhysicsOmnisearchSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    @State private var query: String = ""
    @State private var selectedCategory: PhysicsOmnisearchEngine.ResultCategory = .all

    private var hits: [PhysicsOmnisearchEngine.SearchHit] {
        PhysicsOmnisearchEngine.search(query: query, category: selectedCategory, in: store)
    }

    var body: some View {
        JournalFocusPage(
            title: "Omnisearch KymPhysics (⌘K)",
            subtitle: "Search 16 chapters, 95 stories, 44 school topics, 56 simulations, 126 investigations, 507 exam questions & Wolfram drills",
            close: { dismiss() },
            headerAccessory: {
                Button("Done") {
                    dismiss()
                }
                .buttonStyle(.bordered)
            }
        ) {
            HStack(spacing: Spacing.sm) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Color.kymaiaPrimary)
                TextField("Search formulas, topics (e.g. 9.3, electromagnet, Snell, moment, pressure, Raman)…", text: $query)
                    .textFieldStyle(.roundedBorder)
                VoiceDictationButton(text: $query)
                if !query.isEmpty {
                    Button {
                        query = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Color.kymaiaMutedInk)
                    }
                    .buttonStyle(.plain)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(PhysicsOmnisearchEngine.ResultCategory.allCases) { cat in
                        StandardFilterChip(cat.rawValue, isSelected: selectedCategory == cat) {
                            selectedCategory = cat
                        }
                    }
                }
            }

            JournalSection(
                title: query.isEmpty ? "Suggested Physics Lookups (\(hits.count))" : "Matching Physics Results (\(hits.count))",
                subtitle: "Tap any result to jump straight to that chapter, topic, simulation, or exam bank"
            ) {
                VStack(spacing: Spacing.sm) {
                    ForEach(hits) { hit in
                        Button {
                            store.openDeepLink(hit.deepLinkURL)
                            dismiss()
                        } label: {
                            JournalCard {
                                HStack(alignment: .top, spacing: Spacing.md) {
                                    Image(systemName: hit.symbol)
                                        .font(.kymaiaSymbolMedium)
                                        .foregroundStyle(Color.kymaiaPrimary)
                                        .frame(width: 32)

                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            JournalBadge(text: hit.category.rawValue, tone: .accent)
                                            JournalBadge(text: hit.badge, tone: .neutral)
                                            Spacer()
                                            Image(systemName: "arrow.up.right.circle.fill")
                                                .foregroundStyle(Color.kymaiaPrimary)
                                        }
                                        Text(hit.title)
                                            .font(.kymaiaHeadline)
                                            .foregroundStyle(Color.kymaiaInk)
                                            .multilineTextAlignment(.leading)
                                        Text(hit.subtitle)
                                            .font(.kymaiaCaption)
                                            .foregroundStyle(Color.kymaiaMutedInk)
                                            .lineLimit(2)
                                            .multilineTextAlignment(.leading)
                                    }
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
        .frame(minWidth: 720, minHeight: 560)
    }
}
