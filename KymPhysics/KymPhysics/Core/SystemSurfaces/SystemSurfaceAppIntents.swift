import AppIntents
import CoreSpotlight
import Foundation
import SwiftUI
#if canImport(ActivityKit) && os(iOS)
import ActivityKit

struct PhysicsLabLiveActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var currentTrialNumber: Int
        var totalTrials: Int
        var elapsedSeconds: Int
        var latestReadout: String
    }

    var investigationTitle: String
    var topicCode: String
}
#endif

// MARK: - Shared App Group Snapshot Store (for Siri AppIntents, Widgets & Sibling Science Apps)

struct KymPhysicsSystemSnapshot: Codable, Sendable {
    let updatedAt: Date
    let dueCardsCount: Int
    let provenQuestionsCount: Int
    let totalQuestionsCount: Int
    let nextDeadlineTitle: String
    let nextDeadlineDate: Date?
    let activeUnitTitle: String
    let activeChapterTitle: String
}

final class SystemSurfaceSnapshotStore: @unchecked Sendable {
    static let shared = SystemSurfaceSnapshotStore()

    private let snapshotKey = "kymphysics.system.snapshot.v1"

    private var sharedDefaults: UserDefaults {
        UserDefaults(suiteName: "group.com.kymaia.science") ?? .standard
    }

    @MainActor
    func publishSnapshot(from store: AppStore) {
        let proven = store.questionProofs.values.filter { $0.level.isIndependentProof }.count
        let nextDeadline = store.deadlines.first
        let unitTitle = store.pack.schoolTextbook.units.first(where: { $0.unitNumber == store.selectedUnitNumber })?.title ?? "Magnetism"
        let chTitle = store.pack.chapters.first(where: { $0.number == store.activeMovingWorldChapter })?.title ?? "Magnets and motors"

        let snapshot = KymPhysicsSystemSnapshot(
            updatedAt: Date(),
            dueCardsCount: store.dueFSRSCards.count,
            provenQuestionsCount: proven,
            totalQuestionsCount: store.pack.schoolQuestions.count,
            nextDeadlineTitle: nextDeadline?.title ?? "Unit 9: Magnetism Check",
            nextDeadlineDate: nextDeadline?.dueAt,
            activeUnitTitle: unitTitle,
            activeChapterTitle: chTitle
        )

        if let data = try? JSONEncoder().encode(snapshot) {
            sharedDefaults.set(data, forKey: snapshotKey)
        }
        KymPhysicsSpotlightIndexer.indexSeedPackIfNeeded(pack: store.pack)
    }

    func loadSnapshot() -> KymPhysicsSystemSnapshot {
        if let data = sharedDefaults.data(forKey: snapshotKey),
           let decoded = try? JSONDecoder().decode(KymPhysicsSystemSnapshot.self, from: data) {
            return decoded
        }
        return KymPhysicsSystemSnapshot(
            updatedAt: Date(),
            dueCardsCount: 18,
            provenQuestionsCount: 0,
            totalQuestionsCount: 18,
            nextDeadlineTitle: "Unit 9: Magnetism — Topic & Workbook proof",
            nextDeadlineDate: Date().addingTimeInterval(5 * 86_400),
            activeUnitTitle: "Magnetism",
            activeChapterTitle: "Magnets and motors"
        )
    }
}

// MARK: - CoreSpotlight Semantic Indexer

enum KymPhysicsSpotlightIndexer {
    private static var hasIndexed = false

    static func indexSeedPackIfNeeded(pack: KymPhysicsSeedPack) {
        guard !hasIndexed else { return }
        hasIndexed = true

        var items: [CSSearchableItem] = []

        for unit in pack.schoolTextbook.units where unit.isCorePhysics || unit.isPhysicsBridge {
            for topic in unit.topics {
                let attr = CSSearchableItemAttributeSet(contentType: .text)
                attr.title = "Science 8 · Topic \(topic.code): \(topic.title)"
                attr.contentDescription = "\(topic.summary) (Learner's Book p. \(topic.learnersBookPage), Workbook p. \(topic.workbookPage))"
                attr.keywords = ["Physics", "Science 8", topic.code, topic.title, unit.title]
                let item = CSSearchableItem(
                    uniqueIdentifier: "kymphysics://topic/\(topic.code)",
                    domainIdentifier: "com.kymaia.physics.school",
                    attributeSet: attr
                )
                items.append(item)
            }
        }

        for ch in pack.chapters {
            let attr = CSSearchableItemAttributeSet(contentType: .text)
            attr.title = "The Moving World · Ch \(ch.number): \(ch.title)"
            attr.contentDescription = ch.subtitle
            attr.keywords = ["Physics", "Moving World", ch.title] + ch.keyTerms
            let item = CSSearchableItem(
                uniqueIdentifier: "kymphysics://chapter/ch\(String(format: "%02d", ch.number))",
                domainIdentifier: "com.kymaia.physics.movingworld",
                attributeSet: attr
            )
            items.append(item)
        }

        CSSearchableIndex.default().indexSearchableItems(items) { _ in }
    }
}

// MARK: - 10 Siri & Apple Intelligence AppIntents

struct CheckDuePhysicsCardsIntent: AppIntent {
    static var title: LocalizedStringResource = "Check Due Physics Cards"
    static var description = IntentDescription("Speaks how many Physics flashcards and Question Proofs are due today without opening the app.")
    static var openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let snap = SystemSurfaceSnapshotStore.shared.loadSnapshot()
        return .result(
            dialog: "You have \(snap.dueCardsCount) Physics cards ready for review, and \(snap.provenQuestionsCount) of \(snap.totalQuestionsCount) school Science questions proven. Your current focus is \(snap.activeUnitTitle)."
        )
    }
}

struct CheckNextScienceTestIntent: AppIntent {
    static var title: LocalizedStringResource = "When Is My Next Physics or Science Test"
    static var description = IntentDescription("Reports the next scheduled school Physics or Science assessment and readiness status.")
    static var openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let snap = SystemSurfaceSnapshotStore.shared.loadSnapshot()
        return .result(
            dialog: "Your next scheduled check is \(snap.nextDeadlineTitle). You have proven \(snap.provenQuestionsCount) of \(snap.totalQuestionsCount) school textbook questions so far."
        )
    }
}

struct StartPhysicsDailyReviewIntent: AppIntent {
    static var title: LocalizedStringResource = "Start Physics Daily Review"
    static var description = IntentDescription("Opens KymPhysics directly to Today's FSRS spaced-repetition & Question Proof queue.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedRoom = .today
        return .result(dialog: "Opening your KymPhysics daily review.")
    }
}

struct OpenMagnetismUnitIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Unit 9 Magnetism"
    static var description = IntentDescription("Opens Cambridge Lower Secondary Science 8 Unit 9: Magnetism in KymPhysics.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedUnitNumber = 9
        AppStore.shared.selectedTopicCode = "9.1"
        AppStore.shared.selectedRoom = .schoolScience
        return .result(dialog: "Opening Science 8 Unit 9: Magnetism.")
    }
}

struct OpenForcesEnergyUnitIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Unit 3 Forces and Energy"
    static var description = IntentDescription("Opens Cambridge Lower Secondary Science 8 Unit 3: Forces and energy in KymPhysics.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedUnitNumber = 3
        AppStore.shared.selectedTopicCode = "3.4"
        AppStore.shared.selectedRoom = .schoolScience
        return .result(dialog: "Opening Science 8 Unit 3: Forces and energy.")
    }
}

struct OpenLightUnitIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Unit 6 Light"
    static var description = IntentDescription("Opens Cambridge Lower Secondary Science 8 Unit 6: Light in KymPhysics.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedUnitNumber = 6
        AppStore.shared.selectedTopicCode = "6.1"
        AppStore.shared.selectedRoom = .schoolScience
        return .result(dialog: "Opening Science 8 Unit 6: Light.")
    }
}

struct OpenMovingWorldReaderIntent: AppIntent {
    static var title: LocalizedStringResource = "Read The Moving World Physics Book"
    static var description = IntentDescription("Opens The Moving World interactive Physics textbook reader.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedRoom = .movingWorld
        return .result(dialog: "Opening The Moving World reader.")
    }
}

struct OpenPhysicsSensorLabsIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Physics 3D Labs and Explorers"
    static var description = IntentDescription("Opens the 56 interactive Physics simulations, 4 Explorers and iPad sensor bench.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedRoom = .labsExplorers
        return .result(dialog: "Opening Physics 3D Labs, Sensors and Explorers.")
    }
}

struct OpenPhysicsDiagramRecallIntent: AppIntent {
    static var title: LocalizedStringResource = "Practice Physics Ray and Force Diagrams"
    static var description = IntentDescription("Opens Apple Pencil Physics Diagram Recall for force arrows, ray optics and magnetic fields.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedRoom = .practiceExams
        return .result(dialog: "Opening Apple Pencil Physics Diagram Recall and Exam Prep.")
    }
}

struct AskPhysicsCoachIntent: AppIntent {
    static var title: LocalizedStringResource = "Ask Socratic Physics Coach"
    static var description = IntentDescription("Opens the Socratic Physics Coach grounded in Cambridge Science 8 and The Moving World.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        AppStore.shared.selectedRoom = .coach
        return .result(dialog: "Opening your Socratic Physics Coach.")
    }
}

struct KymPhysicsAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CheckDuePhysicsCardsIntent(),
            phrases: [
                "How many Physics cards are due in \(.applicationName)",
                "Check my Physics review in \(.applicationName)"
            ],
            shortTitle: "Due Physics Cards",
            systemImageName: "rectangle.stack.fill"
        )
        AppShortcut(
            intent: CheckNextScienceTestIntent(),
            phrases: [
                "When is my next Physics test in \(.applicationName)",
                "Check my Science exam readiness in \(.applicationName)"
            ],
            shortTitle: "Next Physics Test",
            systemImageName: "calendar.badge.clock"
        )
        AppShortcut(
            intent: StartPhysicsDailyReviewIntent(),
            phrases: [
                "Start Physics review in \(.applicationName)",
                "Open today's Physics queue in \(.applicationName)"
            ],
            shortTitle: "Start Daily Review",
            systemImageName: "sun.max.fill"
        )
        AppShortcut(
            intent: OpenMagnetismUnitIntent(),
            phrases: [
                "Open Unit 9 Magnetism in \(.applicationName)",
                "Study Electromagnets in \(.applicationName)"
            ],
            shortTitle: "Unit 9 Magnetism",
            systemImageName: "bolt.horizontal.circle.fill"
        )
        AppShortcut(
            intent: OpenForcesEnergyUnitIntent(),
            phrases: [
                "Open Unit 3 Forces and Energy in \(.applicationName)",
                "Study Turning Forces in \(.applicationName)"
            ],
            shortTitle: "Unit 3 Forces & Energy",
            systemImageName: "gyroscope"
        )
        AppShortcut(
            intent: OpenLightUnitIntent(),
            phrases: [
                "Open Unit 6 Light in \(.applicationName)",
                "Study Refraction and Rainbows in \(.applicationName)"
            ],
            shortTitle: "Unit 6 Light",
            systemImageName: "light.max"
        )
        AppShortcut(
            intent: OpenMovingWorldReaderIntent(),
            phrases: [
                "Read The Moving World in \(.applicationName)",
                "Open Physics textbook in \(.applicationName)"
            ],
            shortTitle: "The Moving World",
            systemImageName: "book.pages.fill"
        )
        AppShortcut(
            intent: OpenPhysicsSensorLabsIntent(),
            phrases: [
                "Open Physics Labs in \(.applicationName)",
                "Launch Powers of Ten Explorer in \(.applicationName)"
            ],
            shortTitle: "3D Labs & Explorers",
            systemImageName: "cube.transparent.fill"
        )
        AppShortcut(
            intent: OpenPhysicsDiagramRecallIntent(),
            phrases: [
                "Practice Physics diagrams in \(.applicationName)",
                "Open Physics Exam Prep in \(.applicationName)"
            ],
            shortTitle: "Diagrams & Exams",
            systemImageName: "pencil.and.ruler.fill"
        )
        AppShortcut(
            intent: AskPhysicsCoachIntent(),
            phrases: [
                "Ask Physics Coach in \(.applicationName)",
                "Start Socratic Physics tutor in \(.applicationName)"
            ],
            shortTitle: "Physics Coach",
            systemImageName: "bubble.left.and.text.bubble.right.fill"
        )
    }
}
