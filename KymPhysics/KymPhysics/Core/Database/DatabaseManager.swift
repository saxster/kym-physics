import Foundation
import GRDB

// MARK: - Question Proof Level (from KymaiaTutor)

enum QuestionProofLevel: String, Codable, CaseIterable, Sendable {
    case unseen
    case assisted       // Used hint, worked example, or faded completion
    case shaky          // Attempted independently but missed mark-scheme keywords
    case proven         // Answered independently on the current day
    case secure         // Proven across 2+ spaced calendar days

    var displayTitle: String {
        switch self {
        case .unseen: return "Not tried yet"
        case .assisted: return "Assisted practice"
        case .shaky: return "Needs another try"
        case .proven: return "Proven today"
        case .secure: return "Secure across days"
        }
    }

    var isIndependentProof: Bool {
        self == .proven || self == .secure
    }
}

// MARK: - GRDB Records

struct QuestionProofRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "question_proofs"

    var id: String                  // questionId
    var unitNumber: Int
    var topicCode: String
    var proofLevel: String          // QuestionProofLevel.rawValue
    var independentPassDays: Int
    var lastIndependentPassDayKey: String?
    var lastAttemptAt: Date
    var lastAnswerText: String
    var lastUsedAssistance: Bool
    var matchedKeywordsCSV: String
    var missingKeywordsCSV: String

    var level: QuestionProofLevel {
        QuestionProofLevel(rawValue: proofLevel) ?? .unseen
    }
}

struct FSRSCardRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "fsrs_cards"

    var id: String
    var topicCode: String
    var chapterNumber: Int
    var frontPrompt: String
    var backAnswer: String
    var stability: Double
    var difficulty: Double
    var elapsedDays: Double
    var scheduledDays: Double
    var reps: Int
    var lapses: Int
    var state: Int                  // 0=new, 1=learning, 2=review, 3=relearning
    var dueAt: Date
    var lastReviewAt: Date?
}

struct BKTSkillRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "bkt_skills"

    var id: String                  // topicCode or chapterId
    var title: String
    var pLearned: Double
    var pTransit: Double
    var pSlip: Double
    var pGuess: Double
    var independentEvidenceCount: Int
    var assistedEvidenceCount: Int
    var updatedAt: Date
}

struct LabJournalEntryRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "lab_journal_entries"

    var id: String
    var title: String
    var templateKind: String        // free, cornell, outline, sketch, lab_log
    var paperStyle: String          // blank, lined, grid, dots, cornell
    var linkedTopicCode: String?
    var linkedChapterNumber: Int?
    var linkedWidgetId: String?
    var cueColumnText: String
    var bodyNotesText: String
    var summaryText: String
    var hypothesisText: String
    var independentVarText: String
    var dependentVarText: String
    var controlVarsText: String
    var drawingData: Data?
    var snapshotPNGData: Data?
    var createdAt: Date
    var updatedAt: Date
}

struct ScratchpadRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "question_scratchpads"

    var id: String                  // questionId + "::attempt::" + attemptNumber
    var questionId: String
    var attemptNumber: Int
    var paperStyle: String
    var stampKind: String?          // free_body_axes, ray_normal, formula_triangle, distance_time_axes
    var drawingData: Data
    var previewPNGData: Data
    var strokeCount: Int
    var updatedAt: Date
}

struct DiagramRecallAttemptRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "diagram_recall_attempts"

    var id: String
    var plateId: String
    var mode: String                // label_only, ghost_scaffold, blank_recall
    var correctCalloutsCount: Int
    var totalCalloutsCount: Int
    var drawingData: Data?
    var selfScore: Int              // 1..5
    var completedAt: Date
}

struct WidgetChallengeStampRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "widget_challenge_stamps"

    var id: String                  // widgetId
    var chapterNumber: Int
    var earnedAt: Date
    var readoutSnapshot: String
}

struct ChapterReadingProgressRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "chapter_reading_progress"

    var id: String                  // ch00..ch15
    var chapterNumber: Int
    var readFraction: Double
    var predictionsCompleted: Int
    var checksCompleted: Int
    var updatedAt: Date
}

struct SchoolDeadlineRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "school_deadlines"

    var id: String
    var title: String
    var unitNumbersCSV: String      // e.g. "3,6,9"
    var dueAt: Date
    var kind: String                // unit_test, practical, workbook_due
    var notes: String
}

struct ExamQuestionAttemptRecord: Codable, FetchableRecord, PersistableRecord, Identifiable, Equatable, Sendable {
    static let databaseTableName = "exam_question_attempts"

    var id: String                  // examQuestionId
    var chapterNumber: Int
    var awardedMarks: Int
    var maxMarks: Int
    var answerText: String
    var attemptedAt: Date
}

// MARK: - 3-Database GRDB Manager (KB + State + Mnemosyne + Shared Science Spine)

final class DatabaseManager: Sendable {
    static let shared = DatabaseManager()

    let kbPool: DatabaseWriter
    let statePool: DatabaseWriter
    let mnemosynePool: DatabaseWriter

    init(inMemory: Bool = false) {
        if inMemory {
            let kb = try! DatabaseQueue()
            let state = try! DatabaseQueue()
            let mnem = try! DatabaseQueue()
            self.kbPool = kb
            self.statePool = state
            self.mnemosynePool = mnem
        } else {
            let baseDir = Self.resolveDatabaseDirectory()
            try? FileManager.default.createDirectory(at: baseDir, withIntermediateDirectories: true)
            let kbURL = baseDir.appendingPathComponent("kb.sqlite")
            let stateURL = baseDir.appendingPathComponent("state.sqlite")
            let mnemURL = baseDir.appendingPathComponent("mnemosyne.sqlite")
            self.kbPool = try! DatabasePool(path: kbURL.path)
            self.statePool = try! DatabasePool(path: stateURL.path)
            self.mnemosynePool = try! DatabasePool(path: mnemURL.path)
        }

        try! Self.migrateKB(kbPool)
        try! Self.migrateState(statePool)
        try! Self.migrateMnemosyne(mnemosynePool)
        try! seedInitialDataIfNeeded()
    }

    private static func resolveDatabaseDirectory() -> URL {
        // Only the iPad build holds the app-group entitlement. macOS returns a group path even without it,
        // and then refuses the database there (SQLite error 23, authorization denied) unless the app was
        // started from a terminal, so the Mac build keeps its data in Application Support.
        #if os(iOS)
        if let groupURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.kymaia.science") {
            return groupURL.appendingPathComponent("KymPhysicsDB", isDirectory: true)
        }
        #endif
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        return appSupport.appendingPathComponent("KymPhysics", isDirectory: true)
    }

    private static func migrateKB(_ writer: DatabaseWriter) throws {
        var migrator = DatabaseMigrator()
        migrator.registerMigration("v1_kb") { db in
            try db.create(table: "kb_metadata", ifNotExists: true) { t in
                t.primaryKey("key", .text)
                t.column("value", .text).notNull()
            }
            try db.create(table: "kb_chapters", ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("number", .integer).notNull()
                t.column("volumeNumber", .integer).notNull()
                t.column("title", .text).notNull()
                t.column("subtitle", .text).notNull()
            }
            try db.create(table: "kb_school_units", ifNotExists: true) { t in
                t.primaryKey("unitNumber", .integer)
                t.column("title", .text).notNull()
                t.column("discipline", .text).notNull()
                t.column("isCompletedInSchool", .boolean).notNull()
            }
            try db.create(table: "kb_school_questions", ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("unitNumber", .integer).notNull()
                t.column("topicCode", .text).notNull()
                t.column("prompt", .text).notNull()
                t.column("marks", .integer).notNull()
            }
        }
        try migrator.migrate(writer)
    }

    private static func migrateState(_ writer: DatabaseWriter) throws {
        var migrator = DatabaseMigrator()
        migrator.registerMigration("v1_state") { db in
            try db.create(table: QuestionProofRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("unitNumber", .integer).notNull()
                t.column("topicCode", .text).notNull()
                t.column("proofLevel", .text).notNull()
                t.column("independentPassDays", .integer).notNull().defaults(to: 0)
                t.column("lastIndependentPassDayKey", .text)
                t.column("lastAttemptAt", .datetime).notNull()
                t.column("lastAnswerText", .text).notNull()
                t.column("lastUsedAssistance", .boolean).notNull()
                t.column("matchedKeywordsCSV", .text).notNull()
                t.column("missingKeywordsCSV", .text).notNull()
            }

            try db.create(table: FSRSCardRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("topicCode", .text).notNull()
                t.column("chapterNumber", .integer).notNull()
                t.column("frontPrompt", .text).notNull()
                t.column("backAnswer", .text).notNull()
                t.column("stability", .double).notNull()
                t.column("difficulty", .double).notNull()
                t.column("elapsedDays", .double).notNull()
                t.column("scheduledDays", .double).notNull()
                t.column("reps", .integer).notNull()
                t.column("lapses", .integer).notNull()
                t.column("state", .integer).notNull()
                t.column("dueAt", .datetime).notNull()
                t.column("lastReviewAt", .datetime)
            }

            try db.create(table: BKTSkillRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("title", .text).notNull()
                t.column("pLearned", .double).notNull()
                t.column("pTransit", .double).notNull()
                t.column("pSlip", .double).notNull()
                t.column("pGuess", .double).notNull()
                t.column("independentEvidenceCount", .integer).notNull()
                t.column("assistedEvidenceCount", .integer).notNull()
                t.column("updatedAt", .datetime).notNull()
            }

            try db.create(table: WidgetChallengeStampRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("chapterNumber", .integer).notNull()
                t.column("earnedAt", .datetime).notNull()
                t.column("readoutSnapshot", .text).notNull()
            }

            try db.create(table: ChapterReadingProgressRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("chapterNumber", .integer).notNull()
                t.column("readFraction", .double).notNull()
                t.column("predictionsCompleted", .integer).notNull()
                t.column("checksCompleted", .integer).notNull()
                t.column("updatedAt", .datetime).notNull()
            }

            try db.create(table: SchoolDeadlineRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("title", .text).notNull()
                t.column("unitNumbersCSV", .text).notNull()
                t.column("dueAt", .datetime).notNull()
                t.column("kind", .text).notNull()
                t.column("notes", .text).notNull()
            }

            try db.create(table: ExamQuestionAttemptRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("chapterNumber", .integer).notNull()
                t.column("awardedMarks", .integer).notNull()
                t.column("maxMarks", .integer).notNull()
                t.column("answerText", .text).notNull()
                t.column("attemptedAt", .datetime).notNull()
            }
        }
        try migrator.migrate(writer)
    }

    private static func migrateMnemosyne(_ writer: DatabaseWriter) throws {
        var migrator = DatabaseMigrator()
        migrator.registerMigration("v1_mnemosyne") { db in
            try db.create(table: LabJournalEntryRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("title", .text).notNull()
                t.column("templateKind", .text).notNull()
                t.column("paperStyle", .text).notNull()
                t.column("linkedTopicCode", .text)
                t.column("linkedChapterNumber", .integer)
                t.column("linkedWidgetId", .text)
                t.column("cueColumnText", .text).notNull()
                t.column("bodyNotesText", .text).notNull()
                t.column("summaryText", .text).notNull()
                t.column("hypothesisText", .text).notNull()
                t.column("independentVarText", .text).notNull()
                t.column("dependentVarText", .text).notNull()
                t.column("controlVarsText", .text).notNull()
                t.column("drawingData", .blob)
                t.column("snapshotPNGData", .blob)
                t.column("createdAt", .datetime).notNull()
                t.column("updatedAt", .datetime).notNull()
            }

            try db.create(table: ScratchpadRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("questionId", .text).notNull()
                t.column("attemptNumber", .integer).notNull()
                t.column("paperStyle", .text).notNull()
                t.column("stampKind", .text)
                t.column("drawingData", .blob).notNull()
                t.column("previewPNGData", .blob).notNull()
                t.column("strokeCount", .integer).notNull()
                t.column("updatedAt", .datetime).notNull()
            }

            try db.create(table: DiagramRecallAttemptRecord.databaseTableName, ifNotExists: true) { t in
                t.primaryKey("id", .text)
                t.column("plateId", .text).notNull()
                t.column("mode", .text).notNull()
                t.column("correctCalloutsCount", .integer).notNull()
                t.column("totalCalloutsCount", .integer).notNull()
                t.column("drawingData", .blob)
                t.column("selfScore", .integer).notNull()
                t.column("completedAt", .datetime).notNull()
            }
        }
        try migrator.migrate(writer)
    }

    func seedInitialDataIfNeeded() throws {
        let pack = SeedPackLoader.shared
        let now = Date()

        try kbPool.write { db in
            try db.execute(
                sql: "INSERT OR REPLACE INTO kb_metadata (key, value) VALUES (?, ?)",
                arguments: ["packId", pack.packId]
            )
            for ch in pack.chapters {
                try db.execute(
                    sql: "INSERT OR REPLACE INTO kb_chapters (id, number, volumeNumber, title, subtitle) VALUES (?, ?, ?, ?, ?)",
                    arguments: [ch.id, ch.number, ch.volumeNumber, ch.title, ch.subtitle]
                )
            }
            for unit in pack.schoolTextbook.units {
                try db.execute(
                    sql: "INSERT OR REPLACE INTO kb_school_units (unitNumber, title, discipline, isCompletedInSchool) VALUES (?, ?, ?, ?)",
                    arguments: [unit.unitNumber, unit.title, unit.discipline, unit.isCompletedInSchool]
                )
            }
            for q in pack.schoolQuestions {
                try db.execute(
                    sql: "INSERT OR REPLACE INTO kb_school_questions (id, unitNumber, topicCode, prompt, marks) VALUES (?, ?, ?, ?, ?)",
                    arguments: [q.id, q.unitNumber, q.topicCode, q.prompt, q.marks]
                )
            }
        }

        try statePool.write { db in
            // Idempotently ensure all school textbook questions + chapter flashcards exist in FSRS queue
            for q in pack.schoolQuestions {
                let cardId = "card-\(q.id)"
                if try FSRSCardRecord.fetchOne(db, key: cardId) == nil {
                    let card = FSRSCardRecord(
                        id: cardId,
                        topicCode: q.topicCode,
                        chapterNumber: q.linkedChapter,
                        frontPrompt: q.prompt,
                        backAnswer: q.modelAnswer,
                        stability: 1.8,
                        difficulty: 4.5,
                        elapsedDays: 0,
                        scheduledDays: 1,
                        reps: 0,
                        lapses: 0,
                        state: 0,
                        dueAt: now,
                        lastReviewAt: nil
                    )
                    try card.insert(db)
                }
            }

            for bank in pack.examBanks {
                for c in bank.cards.prefix(3) {
                    let cardId = "examcard-\(c.id)"
                    if try FSRSCardRecord.fetchOne(db, key: cardId) == nil {
                        let card = FSRSCardRecord(
                            id: cardId,
                            topicCode: "Ch\(c.chapter)",
                            chapterNumber: c.chapter,
                            frontPrompt: "\(c.term): \(c.question)",
                            backAnswer: c.answer,
                            stability: 2.2,
                            difficulty: 4.2,
                            elapsedDays: 0,
                            scheduledDays: 1,
                            reps: 0,
                            lapses: 0,
                            state: 0,
                            dueAt: now,
                            lastReviewAt: nil
                        )
                        try card.insert(db)
                    }
                }
            }

            let existingSkills = try BKTSkillRecord.fetchCount(db)
            if existingSkills == 0 {
                for unit in pack.schoolTextbook.units {
                    for topic in unit.topics {
                        let initialPLearned = unit.isCompletedInSchool ? 0.58 : 0.25
                        let skill = BKTSkillRecord(
                            id: topic.code,
                            title: "\(topic.code) \(topic.title)",
                            pLearned: initialPLearned,
                            pTransit: 0.18,
                            pSlip: 0.10,
                            pGuess: 0.15,
                            independentEvidenceCount: 0,
                            assistedEvidenceCount: 0,
                            updatedAt: now
                        )
                        try skill.save(db)
                    }
                }
            }

            let existingDeadlines = try SchoolDeadlineRecord.fetchCount(db)
            if existingDeadlines == 0 {
                let cal = Calendar.current
                let unit9Check = SchoolDeadlineRecord(
                    id: "deadline-u9-magnetism",
                    title: "Unit 9: Magnetism — Topic & Workbook proof",
                    unitNumbersCSV: "9",
                    dueAt: cal.date(byAdding: .day, value: 5, to: now) ?? now,
                    kind: "unit_test",
                    notes: "Magnetic fields (9.1), Earth as a giant magnet (9.2), Electromagnets (9.3) and Investigating electromagnets (9.4) — LB pp. 293–320, WB pp. 184–202."
                )
                let physicsCheckpoint = SchoolDeadlineRecord(
                    id: "deadline-physics-checkpoint",
                    title: "Physics Checkpoint Revision (Units 3, 6 & 9)",
                    unitNumbersCSV: "3,6,9",
                    dueAt: cal.date(byAdding: .day, value: 14, to: now) ?? now,
                    kind: "unit_test",
                    notes: "Spaced retrieval across Unit 3 Forces and energy, Unit 6 Light and Unit 9 Magnetism."
                )
                try unit9Check.save(db)
                try physicsCheckpoint.save(db)
            }
        }

        try mnemosynePool.write { db in
            let existingEntries = try LabJournalEntryRecord.fetchCount(db)
            if existingEntries == 0 {
                let starter = LabJournalEntryRecord(
                    id: "journal-starter-u9-electromagnet",
                    title: "Unit 9.3 & Ch 13 — Why electromagnets use a soft iron core",
                    templateKind: "cornell",
                    paperStyle: "cornell",
                    linkedTopicCode: "9.3",
                    linkedChapterNumber: 13,
                    linkedWidgetId: "fieldslab",
                    cueColumnText: "1. Three parts of an electromagnet?\n2. Why soft iron instead of steel?\n3. Three ways to make an electromagnet stronger?",
                    bodyNotesText: "• Components: insulated wire coil (solenoid) + d.c. cell/power supply + soft iron core.\n• Soft iron magnetises strongly when current flows and loses its magnetism immediately when switched off; steel stays permanently magnetised.\n• Strength increases with: (1) more turns on the coil, (2) larger current (measured with an ammeter in series), (3) inserting a soft iron core.",
                    summaryText: "An electric current in a coil creates a switchable magnetic field; a soft iron core multiplies field strength while allowing instant release when switched off.",
                    hypothesisText: "",
                    independentVarText: "",
                    dependentVarText: "",
                    controlVarsText: "",
                    drawingData: nil,
                    snapshotPNGData: nil,
                    createdAt: now,
                    updatedAt: now
                )
                try starter.save(db)
            }
        }
    }
}
