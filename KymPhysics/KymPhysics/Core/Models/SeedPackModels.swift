import Foundation

// MARK: - Seed Pack Root

struct KymPhysicsSeedPack: Codable, Sendable {
    let schemaVersion: Int
    let packId: String
    let generatedBy: String
    let volumes: [MovingWorldVolume]
    let chapters: [MovingWorldChapter]
    let stories: [MovingWorldStory]
    let explorers: [MovingWorldExplorer]
    let investigations: [PhysicsInvestigation]
    let widgets: [InteractiveWidgetSpec]
    let examBanks: [PhysicsExamBank]
    let crossDisciplinaryBridges: [CrossDisciplinaryBridge]
    let schoolTextbook: SchoolScienceTextbook
    let schoolQuestions: [SchoolScienceQuestion]
    let diagramPlates: [DiagramRecallPlate]
}

// MARK: - The Moving World (16 Chapters, 4 Volumes, 95 Stories, Explorers, Investigations, Widgets)

struct MovingWorldVolume: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let number: Int
    let title: String
    let chapters: [Int]
}

struct MovingWorldChapter: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let number: Int
    let volumeNumber: Int
    let volumeTitle: String
    let title: String
    let subtitle: String
    let hookSummary: String
    let sections: [MovingWorldSection]
    let callouts: [MovingWorldCallout]
    let keyTerms: [String]
    let widgets: [String]
}

struct MovingWorldSection: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let heading: String
    let excerpt: String
}

struct MovingWorldCallout: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let kind: String      // predict, check, recall, careful, school, home, try, five, case
    let title: String
    let body: String

    var badgeText: String {
        switch kind {
        case "predict": return "Predict first"
        case "check": return "Check understanding"
        case "recall": return "Recall"
        case "careful": return "Common trap"
        case "school": return "School syllabus wording"
        case "home", "try": return "Kitchen / desk experiment"
        case "five": return "5-minute derivation"
        case "case": return "Case study"
        default: return kind.capitalized
        }
    }

    var symbolName: String {
        switch kind {
        case "predict": return "sparkles"
        case "check": return "checkmark.seal"
        case "recall": return "arrow.counterclockwise"
        case "careful": return "exclamationmark.triangle"
        case "school": return "graduationcap"
        case "home", "try": return "house"
        case "five": return "function"
        case "case": return "magnifyingglass.circle"
        default: return "bookmark"
        }
    }
}

struct MovingWorldStory: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let title: String
    let kind: String      // "portrait" | "topic"
    let excerpt: String
}

struct MovingWorldExplorer: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let title: String
    let subtitle: String
    let symbol: String
    let linkedChapters: [Int]
    let summary: String
}

struct PhysicsInvestigation: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let category: String  // "investigations" | "mechanics" | "waves" | "fields"
    let widget: String
    let renderer: String
    let title: String
    let chapter: Int
    let section: String
    let figure: String
    let question: String
    let explanation: String
    let limits: String
    let materials: String
    let procedure: [String]
    let worked: String
    let challenge: String
    let stories: [String]
}

struct InteractiveWidgetSpec: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let title: String
    let chapter: Int
    let is3D: Bool
    let challengePrompt: String
    let cutaway: String
    let idealised: String
    let watchSteps: [WidgetWatchStep]
}

struct WidgetWatchStep: Codable, Equatable, Sendable {
    let title: String
    let caption: String
}

// MARK: - 16 Chapter Exam Banks (507 Exam Questions + 104 Flashcards)

struct PhysicsExamBank: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let chapter: Int
    let title: String
    let objectivesCount: Int
    let cards: [PhysicsExamFlashcard]
    let questions: [PhysicsExamQuestion]
}

struct PhysicsExamFlashcard: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let chapter: Int
    let term: String
    let definition: String
    let example: String
    let confusion: String
    let question: String
    let answer: String
    let formula: String
}

struct PhysicsExamQuestion: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let chapter: Int
    let title: String
    let stage: String     // "guided" | "independent" | "transfer" | "paper"
    let kind: String      // "explain" | "calculate" | "compare" | "graph"
    let prompt: String
    let marks: Int
    let points: [String]
    let model: [String]
    let common: String
    let hints: [String]
    let teach: String
}

// MARK: - Cross-Disciplinary First-Principles Bridges (KymChem & KymBio)

struct CrossDisciplinaryBridge: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let discipline: String // "chemistry" | "biology"
    let sourceBook: String
    let sourceRef: String
    let deepLink: String
    let title: String
    let schoolTopics: [String]
    let movingWorldChapters: [Int]
    let summary: String
    let keyEquation: String
    let microCheckQuestion: String
    let microCheckAnswer: String

    var isChemistry: Bool { discipline == "chemistry" }

    var badgeSymbol: String {
        isChemistry ? "atom" : "leaf.fill"
    }
}

// MARK: - School Textbook: Cambridge Lower Secondary Science 8 (Learner's Book & Workbook)

enum ScienceDisciplineLens: String, CaseIterable, Identifiable, Sendable {
    case physicsCore = "core_physics"
    case physicsPlusBridges = "physics_plus_bridges"
    case allNineUnits = "all_nine_units"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .physicsCore:
            return "Physics units (3, 6, 9)"
        case .physicsPlusBridges:
            return "Physics + Chem/Bio bridges"
        case .allNineUnits:
            return "All 9 Science units"
        }
    }

    var subtitle: String {
        switch self {
        case .physicsCore:
            return "Focused on Unit 3 Forces and energy, Unit 6 Light and Unit 9 Magnetism"
        case .physicsPlusBridges:
            return "Includes thoracic pressure (1.3), dissolving (2.1), atomic structure (5.1), climate (5.3–5.5), skeletal levers (7.4) & energetics (8.1–8.2)"
        case .allNineUnits:
            return "Complete Cambridge Lower Secondary Science 8 Learner's Book and Workbook table of contents"
        }
    }
}

struct SchoolScienceTextbook: Codable, Equatable, Sendable {
    let id: String
    let title: String
    let authors: String
    let publisher: String
    let curriculumCode: String
    let learnersBookTotalPages: Int
    let workbookTotalPages: Int
    let units: [SchoolScienceUnit]

    func units(for lens: ScienceDisciplineLens) -> [SchoolScienceUnit] {
        switch lens {
        case .physicsCore:
            return units.filter { $0.discipline == "core_physics" }
        case .physicsPlusBridges:
            return units.filter { $0.discipline == "core_physics" || $0.discipline == "physics_bridge" }
        case .allNineUnits:
            return units
        }
    }
}

struct SchoolScienceUnit: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let unitNumber: Int
    let title: String
    let discipline: String // "core_physics" | "physics_bridge" | "sibling_science"
    let scienceStrands: [String]
    let twsStrands: [String]
    let scienceInContext: String
    let learnersBookStartPage: Int
    let learnersBookEndPage: Int
    let workbookStartPage: Int
    let workbookEndPage: Int
    let isCompletedInSchool: Bool
    let movingWorldChapters: [Int]
    let bridgeIds: [String]
    let topics: [SchoolScienceTopic]

    var isCorePhysics: Bool { discipline == "core_physics" }
    var isPhysicsBridge: Bool { discipline == "physics_bridge" }

    var disciplineBadgeLabel: String {
        switch discipline {
        case "core_physics": return "Core Physics"
        case "physics_bridge": return "Phys + Chem/Bio Bridge"
        default: return "General Science"
        }
    }
}

struct SchoolScienceTopic: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let code: String
    let title: String
    let learnersBookPage: Int
    let workbookPage: Int
    let discipline: String
    let movingWorldChapters: [Int]
    let linkedWidgets: [String]
    let bridgeIds: [String]
    let summary: String
    let cambridgeWatchouts: [String]
}

struct SchoolScienceQuestion: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let unitNumber: Int
    let topicCode: String
    let sourceBook: String      // "learners_book" | "workbook"
    let bookSection: String
    let tier: String            // "Focus" | "Practice" | "Challenge"
    let commandWord: String
    let marks: Int
    let prompt: String
    let workedExample: String
    let fadedPrompt: String
    let fadedAnswer: String
    let modelAnswer: String
    let markSchemeKeywords: [String]
    let linkedChapter: Int
    let linkedWidget: String

    var sourceBadgeTitle: String {
        sourceBook == "workbook" ? "Workbook · \(tier)" : "Learner's Book"
    }
}

// MARK: - Physics Diagram Recall Plates

struct DiagramRecallPlate: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let title: String
    let sourceRef: String
    let unitNumber: Int
    let chapter: Int
    let figureId: String
    let aspectRatio: Double
    let callouts: [DiagramCalloutPin]
}

struct DiagramCalloutPin: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let label: String
    let x: Double
    let y: Double
    let hint: String
}

// MARK: - Seed Pack Loader

enum SeedPackLoader {
    static let shared: KymPhysicsSeedPack = {
        do {
            return try loadFromBundle()
        } catch {
            return fallbackPack()
        }
    }()

    static func loadFromBundle() throws -> KymPhysicsSeedPack {
        let candidateURLs: [URL?] = [
            Bundle.main.url(forResource: "kymphysics-seed-pack", withExtension: "json", subdirectory: "ContentPacks"),
            Bundle.main.url(forResource: "kymphysics-seed-pack", withExtension: "json"),
            URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/KymPhysics/KymPhysics/Resources/ContentPacks/kymphysics-seed-pack.json")
        ]
        for case let url? in candidateURLs where FileManager.default.fileExists(atPath: url.path) {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode(KymPhysicsSeedPack.self, from: data)
        }
        throw CocoaError(.fileNoSuchFile)
    }

    static func fallbackPack() -> KymPhysicsSeedPack {
        KymPhysicsSeedPack(
            schemaVersion: 1,
            packId: "fallback",
            generatedBy: "fallback",
            volumes: [],
            chapters: [],
            stories: [],
            explorers: [],
            investigations: [],
            widgets: [],
            examBanks: [],
            crossDisciplinaryBridges: [],
            schoolTextbook: SchoolScienceTextbook(
                id: "cambridge-science-8-2ed",
                title: "Cambridge Lower Secondary Science 8",
                authors: "Mary Jones, Diane Fellowes-Freeman & Michael Smyth",
                publisher: "Cambridge University Press",
                curriculumCode: "0893",
                learnersBookTotalPages: 326,
                workbookTotalPages: 202,
                units: []
            ),
            schoolQuestions: [],
            diagramPlates: []
        )
    }
}
