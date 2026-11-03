import Combine
import Foundation
import GRDB
import SwiftUI

enum AppRoom: String, CaseIterable, Identifiable, Sendable {
    case today = "today"
    case schoolScience = "school_science"
    case movingWorld = "moving_world"
    case labsExplorers = "labs_explorers"
    case practiceExams = "practice_exams"
    case labJournal = "lab_journal"
    case coach = "coach"
    case calendar = "calendar"
    case parentMentor = "parent_mentor"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .today: return "Today"
        case .schoolScience: return "School Science 8"
        case .movingWorld: return "The Moving World"
        case .labsExplorers: return "3D Labs & Sensors"
        case .practiceExams: return "Proofs & 507 Exams"
        case .labJournal: return "Lab Notebook"
        case .coach: return "Physics Coach"
        case .calendar: return "Calendar"
        case .parentMentor: return "Dad / Mentor Lens"
        }
    }

    var subtitle: String {
        switch self {
        case .today: return "Daily briefing, 25-min ritual, upcoming Unit 9 Magnetism & due cards"
        case .schoolScience: return "Cambridge Learner's Book 8 & Workbook 8 (Units 3, 6, 9 + Bridges)"
        case .movingWorld: return "16 narrative chapters, 95 stories & 4 volumes"
        case .labsExplorers: return "56 live simulations, 4 Explorers, 126 investigations & iPad sensors"
        case .practiceExams: return "507 exam questions, 16 Wolfram drills, SpeedPhysics & diagram recall"
        case .labJournal: return "Cornell notes, Mumbai Memory Palaces, Vault & Apple Pencil sketches"
        case .coach: return "Socratic AI tutor grounded in your textbook & live simulations"
        case .calendar: return "Science tests, study blocks & timed investigation sessions"
        case .parentMentor: return "Independent proof vs. assisted practice telemetry & printable report"
        }
    }

    var symbol: String {
        switch self {
        case .today: return "sun.max.fill"
        case .schoolScience: return "book.closed.fill"
        case .movingWorld: return "globe.asia.australia.fill"
        case .labsExplorers: return "gyroscope"
        case .practiceExams: return "checkmark.seal.fill"
        case .labJournal: return "pencil.and.scribble"
        case .coach: return "bubble.left.and.text.bubble.right.fill"
        case .calendar: return "calendar"
        case .parentMentor: return "chart.bar.doc.horizontal.fill"
        }
    }
}

@MainActor
final class AppStore: ObservableObject {
    static let shared = AppStore()

    let pack: KymPhysicsSeedPack
    let db: DatabaseManager

    // MARK: - Navigation & Filter State
    @Published var selectedRoom: AppRoom = .today
    @Published var selectedSchoolLens: ScienceDisciplineLens = .physicsCore
    @Published var selectedUnitNumber: Int = 9 // Upcoming Unit 9: Magnetism (Units 3 & 6 ticked ✓)
    @Published var selectedTopicCode: String? = "9.1"
    @Published var activeMovingWorldChapter: Int = 13
    @Published var activeWidgetId: String? = nil
    @Published var activeExplorerId: String? = nil
    @Published var activeDiagramPlateId: String? = nil
    @Published var activePracticeQuestion: SchoolScienceQuestion? = nil
    @Published var activeJournalEntry: LabJournalEntryRecord? = nil
    @Published var syllabusBoard: String = "0893"

    // MARK: - Persisted Learner State
    @Published private(set) var questionProofs: [String: QuestionProofRecord] = [:]
    @Published private(set) var fsrsCards: [FSRSCardRecord] = []
    @Published private(set) var bktSkills: [String: BKTSkillRecord] = [:]
    @Published private(set) var journalEntries: [LabJournalEntryRecord] = []
    @Published private(set) var diagramAttempts: [DiagramRecallAttemptRecord] = []
    @Published private(set) var widgetStamps: [String: WidgetChallengeStampRecord] = [:]
    @Published private(set) var readingProgress: [Int: ChapterReadingProgressRecord] = [:]
    @Published private(set) var deadlines: [SchoolDeadlineRecord] = []
    @Published private(set) var examAttempts: [String: ExamQuestionAttemptRecord] = [:]
    @Published var latestSafetyEscalation: SafetyScanResult? = nil

    init(db: DatabaseManager = .shared, pack: KymPhysicsSeedPack = SeedPackLoader.shared) {
        self.db = db
        self.pack = pack
        reloadAllState()
    }

    func reloadAllState() {
        ingestSharedInboxItemsIfNeeded()
        do {
            try db.statePool.read { conn in
                let proofs = try QuestionProofRecord.fetchAll(conn)
                self.questionProofs = Dictionary(uniqueKeysWithValues: proofs.map { ($0.id, $0) })

                self.fsrsCards = try FSRSCardRecord
                    .order(Column("dueAt").asc)
                    .fetchAll(conn)

                let skills = try BKTSkillRecord.fetchAll(conn)
                self.bktSkills = Dictionary(uniqueKeysWithValues: skills.map { ($0.id, $0) })

                let stamps = try WidgetChallengeStampRecord.fetchAll(conn)
                self.widgetStamps = Dictionary(uniqueKeysWithValues: stamps.map { ($0.id, $0) })

                let progress = try ChapterReadingProgressRecord.fetchAll(conn)
                self.readingProgress = Dictionary(uniqueKeysWithValues: progress.map { ($0.chapterNumber, $0) })

                self.deadlines = try SchoolDeadlineRecord
                    .order(Column("dueAt").asc)
                    .fetchAll(conn)

                let exams = try ExamQuestionAttemptRecord.fetchAll(conn)
                self.examAttempts = Dictionary(uniqueKeysWithValues: exams.map { ($0.id, $0) })
            }

            try db.mnemosynePool.read { conn in
                self.journalEntries = try LabJournalEntryRecord
                    .order(Column("updatedAt").desc)
                    .fetchAll(conn)

                self.diagramAttempts = try DiagramRecallAttemptRecord
                    .order(Column("completedAt").desc)
                    .fetchAll(conn)
            }

            SystemSurfaceSnapshotStore.shared.publishSnapshot(from: self)
        } catch {
            print("Failed to reload KymPhysics state: \(error)")
        }
    }

    private func ingestSharedInboxItemsIfNeeded() {
        let defaults = UserDefaults(suiteName: "group.com.kymaia.science") ?? .standard
        guard let sharedTexts = defaults.stringArray(forKey: "kymphysics.sharedInbox.texts"),
              !sharedTexts.isEmpty else {
            return
        }
        defaults.removeObject(forKey: "kymphysics.sharedInbox.texts")
        let now = Date()
        do {
            try db.mnemosynePool.write { conn in
                for (idx, text) in sharedTexts.enumerated() {
                    let entry = LabJournalEntryRecord(
                        id: "shared-\(Int(now.timeIntervalSince1970))-\(idx)",
                        title: "Shared Physics Note · \(now.formatted(date: .abbreviated, time: .shortened))",
                        templateKind: "cornell",
                        paperStyle: "cornell",
                        linkedTopicCode: selectedTopicCode,
                        linkedChapterNumber: activeMovingWorldChapter,
                        linkedWidgetId: nil,
                        cueColumnText: "Shared from iPadOS Share Sheet",
                        bodyNotesText: text,
                        summaryText: "",
                        hypothesisText: "",
                        independentVarText: "",
                        dependentVarText: "",
                        controlVarsText: "",
                        drawingData: nil,
                        snapshotPNGData: nil,
                        createdAt: now,
                        updatedAt: now
                    )
                    try entry.save(conn)
                }
            }
        } catch {
            print("Failed to ingest shared inbox items: \(error)")
        }
    }

    // MARK: - Computed Queries

    var dueFSRSCards: [FSRSCardRecord] {
        let now = Date()
        return fsrsCards.filter { $0.dueAt <= now }
    }

    var totalExamQuestionsCount: Int {
        pack.examBanks.reduce(0) { $0 + $1.questions.count }
    }

    func unitReadiness(for unit: SchoolScienceUnit) -> UnitReadinessSnapshot {
        ReadinessService.snapshot(
            for: unit,
            pack: pack,
            proofs: Array(questionProofs.values),
            skills: Array(bktSkills.values),
            stamps: Array(widgetStamps.values),
            readingProgress: Array(readingProgress.values)
        )
    }

    func proofLevel(for questionId: String) -> QuestionProofLevel {
        questionProofs[questionId]?.level ?? .unseen
    }

    func questions(forUnit unitNumber: Int, topicCode: String? = nil) -> [SchoolScienceQuestion] {
        pack.schoolQuestions.filter { q in
            q.unitNumber == unitNumber && (topicCode == nil || q.topicCode == topicCode)
        }
    }

    func bridges(forTopic topicCode: String) -> [CrossDisciplinaryBridge] {
        pack.crossDisciplinaryBridges.filter { $0.schoolTopics.contains(topicCode) }
    }

    func bridges(forUnit unitNumber: Int) -> [CrossDisciplinaryBridge] {
        guard let unit = pack.schoolTextbook.units.first(where: { $0.unitNumber == unitNumber }) else {
            return []
        }
        let ids = Set(unit.bridgeIds)
        return pack.crossDisciplinaryBridges.filter { ids.contains($0.id) }
    }

    // MARK: - Mutations

    @discardableResult
    func submitQuestionAttempt(
        question: SchoolScienceQuestion,
        answerText: String,
        usedAssistance: Bool,
        now: Date = Date()
    ) -> QuestionEvaluationResult {
        let safetyScan = PhysicsSafetyGate.scan(answerText)
        if safetyScan.triggered {
            latestSafetyEscalation = safetyScan
            Task {
                await PhysicsSafetyGate.notifyParentIfNeeded(safetyScan, sourceSurface: "question_proof")
            }
            return QuestionEvaluationResult(
                matchedKeywords: [],
                missingKeywords: [],
                coverageFraction: 0.0,
                isPass: false,
                resultingProofLevel: questionProofs[question.id]?.level ?? .unseen,
                feedbackSummary: safetyScan.supportiveResponse ?? "Let's pause the physics question right now and check in with a trusted adult."
            )
        }

        let existing = questionProofs[question.id]
        let (evaluation, record) = QuestionProofService.evaluateAndRecord(
            question: question,
            answerText: answerText,
            usedAssistance: usedAssistance,
            existingProof: existing,
            now: now
        )

        do {
            try db.statePool.write { conn in
                try record.save(conn)
                if let skill = try BKTSkillRecord.fetchOne(conn, key: question.topicCode) {
                    let updatedSkill = BKTEngine.update(
                        skill: skill,
                        isCorrect: evaluation.isPass,
                        usedAssistance: usedAssistance,
                        now: now
                    )
                    try updatedSkill.save(conn)
                }
            }
            reloadAllState()
        } catch {
            print("Failed to save question proof: \(error)")
        }
        return evaluation
    }

    func recordExamQuestionAttempt(question: PhysicsExamQuestion, awardedMarks: Int, answerText: String) {
        let safetyScan = PhysicsSafetyGate.scan(answerText)
        if safetyScan.triggered {
            latestSafetyEscalation = safetyScan
            Task {
                await PhysicsSafetyGate.notifyParentIfNeeded(safetyScan, sourceSurface: "exam_attempt")
            }
            return
        }

        let record = ExamQuestionAttemptRecord(
            id: question.id,
            chapterNumber: question.chapter,
            awardedMarks: min(question.marks, max(0, awardedMarks)),
            maxMarks: question.marks,
            answerText: answerText,
            attemptedAt: Date()
        )
        do {
            try db.statePool.write { conn in
                try record.save(conn)
            }
            reloadAllState()
        } catch {
            print("Failed to save exam question attempt: \(error)")
        }
    }

    func reviewFSRSCard(_ card: FSRSCardRecord, rating: FSRSRating, now: Date = Date()) {
        let updated = IntervalReviewScheduler.schedule(card: card, rating: rating, now: now)
        do {
            try db.statePool.write { conn in
                try updated.save(conn)
                if let skill = try BKTSkillRecord.fetchOne(conn, key: card.topicCode) {
                    let updatedSkill = BKTEngine.update(
                        skill: skill,
                        isCorrect: rating.rawValue >= 3,
                        usedAssistance: false,
                        now: now
                    )
                    try updatedSkill.save(conn)
                }
            }
            reloadAllState()
        } catch {
            print("Failed to update FSRS card: \(error)")
        }
    }

    func earnWidgetChallengeStamp(widgetId: String, chapterNumber: Int, readout: String) {
        let stamp = WidgetChallengeStampRecord(
            id: widgetId,
            chapterNumber: chapterNumber,
            earnedAt: Date(),
            readoutSnapshot: readout
        )
        do {
            try db.statePool.write { conn in
                try stamp.save(conn)
            }
            reloadAllState()
        } catch {
            print("Failed to save widget stamp: \(error)")
        }
    }

    func updateChapterProgress(chapterNumber: Int, fraction: Double, addPrediction: Bool = false, addCheck: Bool = false) {
        let id = String(format: "ch%02d", chapterNumber)
        let current = readingProgress[chapterNumber] ?? ChapterReadingProgressRecord(
            id: id,
            chapterNumber: chapterNumber,
            readFraction: 0,
            predictionsCompleted: 0,
            checksCompleted: 0,
            updatedAt: Date()
        )
        let updated = ChapterReadingProgressRecord(
            id: id,
            chapterNumber: chapterNumber,
            readFraction: max(current.readFraction, min(1.0, fraction)),
            predictionsCompleted: current.predictionsCompleted + (addPrediction ? 1 : 0),
            checksCompleted: current.checksCompleted + (addCheck ? 1 : 0),
            updatedAt: Date()
        )
        do {
            try db.statePool.write { conn in
                try updated.save(conn)
            }
            reloadAllState()
        } catch {
            print("Failed to save chapter progress: \(error)")
        }
    }

    func saveJournalEntry(_ entry: LabJournalEntryRecord) {
        let combinedText = [entry.title, entry.cueColumnText, entry.bodyNotesText, entry.summaryText].joined(separator: " ")
        let safetyScan = PhysicsSafetyGate.scan(combinedText)
        if safetyScan.triggered {
            latestSafetyEscalation = safetyScan
            Task {
                await PhysicsSafetyGate.notifyParentIfNeeded(safetyScan, sourceSurface: "lab_journal")
            }
            return
        }

        var mutable = entry
        mutable.updatedAt = Date()
        do {
            try db.mnemosynePool.write { conn in
                try mutable.save(conn)
            }
            reloadAllState()
        } catch {
            print("Failed to save journal entry: \(error)")
        }
    }

    func freezeWidgetIntoLabLog(
        widget: InteractiveWidgetSpec,
        readout: String,
        snapshotPNGData: Data? = nil
    ) -> LabJournalEntryRecord {
        let now = Date()
        let entry = LabJournalEntryRecord(
            id: "lablog-\(widget.id)-\(Int(now.timeIntervalSince1970))",
            title: "Physics Lab Log: \(widget.title) (Ch \(widget.chapter))",
            templateKind: "lab_log",
            paperStyle: "grid",
            linkedTopicCode: nil,
            linkedChapterNumber: widget.chapter,
            linkedWidgetId: widget.id,
            cueColumnText: "Challenge:\n\(widget.challengePrompt)",
            bodyNotesText: "Live readout:\n\(readout)\n\nMicroscopic / vector cutaway:\n\(widget.cutaway)",
            summaryText: "Model scope note: \(widget.idealised)",
            hypothesisText: widget.challengePrompt,
            independentVarText: "Control parameter adjusted in \(widget.title)",
            dependentVarText: "Measured physical quantity in \(widget.title)",
            controlVarsText: "Boundary conditions & reference frame held constant",
            drawingData: nil,
            snapshotPNGData: snapshotPNGData,
            createdAt: now,
            updatedAt: now
        )
        saveJournalEntry(entry)
        activeJournalEntry = entry
        selectedRoom = .labJournal
        return entry
    }

    func saveScratchpad(
        questionId: String,
        attemptNumber: Int,
        paperStyle: String,
        stampKind: String?,
        drawingData: Data,
        previewPNGData: Data,
        strokeCount: Int
    ) {
        let record = ScratchpadRecord(
            id: "\(questionId)::attempt::\(attemptNumber)",
            questionId: questionId,
            attemptNumber: attemptNumber,
            paperStyle: paperStyle,
            stampKind: stampKind,
            drawingData: drawingData,
            previewPNGData: previewPNGData,
            strokeCount: strokeCount,
            updatedAt: Date()
        )
        do {
            try db.mnemosynePool.write { conn in
                try record.save(conn)
            }
        } catch {
            print("Failed to save scratchpad: \(error)")
        }
    }

    func fetchScratchpad(questionId: String, attemptNumber: Int) -> ScratchpadRecord? {
        let id = "\(questionId)::attempt::\(attemptNumber)"
        return try? db.mnemosynePool.read { conn in
            try ScratchpadRecord.fetchOne(conn, key: id)
        }
    }

    func recordDiagramRecall(
        plate: DiagramRecallPlate,
        mode: String,
        correctCount: Int,
        selfScore: Int,
        drawingData: Data? = nil
    ) {
        let record = DiagramRecallAttemptRecord(
            id: UUID().uuidString,
            plateId: plate.id,
            mode: mode,
            correctCalloutsCount: correctCount,
            totalCalloutsCount: plate.callouts.count,
            drawingData: drawingData,
            selfScore: selfScore,
            completedAt: Date()
        )
        do {
            try db.mnemosynePool.write { conn in
                try record.save(conn)
            }
            reloadAllState()
        } catch {
            print("Failed to save diagram recall attempt: \(error)")
        }
    }

    func addDeadline(title: String, unitNumbersCSV: String, dueAt: Date, kind: String, notes: String) {
        let record = SchoolDeadlineRecord(
            id: UUID().uuidString,
            title: title,
            unitNumbersCSV: unitNumbersCSV,
            dueAt: dueAt,
            kind: kind,
            notes: notes
        )
        do {
            try db.statePool.write { conn in
                try record.save(conn)
            }
            reloadAllState()
        } catch {
            print("Failed to save deadline: \(error)")
        }
    }

    // MARK: - Deep Link Routing (kymphysics://chapter/ch13, kymphysics://unit/9, kymphysics://widget/fieldslab)

    func openDeepLink(_ url: URL) {
        guard url.scheme?.lowercased() == "kymphysics" else { return }
        let host = url.host?.lowercased() ?? ""
        let pathPart = url.pathComponents.dropFirst().first ?? ""

        switch host {
        case "chapter":
            let digits = pathPart.replacingOccurrences(of: "ch", with: "")
            if let ch = Int(digits) {
                activeMovingWorldChapter = ch
                selectedRoom = .movingWorld
            }
        case "unit", "school-unit":
            if let u = Int(pathPart.split(separator: ".").first ?? Substring(pathPart)) {
                selectedUnitNumber = u
                if pathPart.contains(".") {
                    selectedTopicCode = pathPart
                }
                selectedRoom = .schoolScience
            }
        case "topic":
            selectedTopicCode = pathPart
            if let firstDigit = pathPart.split(separator: ".").first, let u = Int(firstDigit) {
                selectedUnitNumber = u
            }
            selectedRoom = .schoolScience
        case "widget", "lab":
            activeWidgetId = pathPart
            selectedRoom = .labsExplorers
        case "explorer":
            activeExplorerId = pathPart
            selectedRoom = .labsExplorers
        case "plate":
            activeDiagramPlateId = pathPart
            selectedRoom = .practiceExams
        case "practice":
            selectedRoom = .practiceExams
        case "journal":
            if let entry = journalEntries.first(where: { $0.id == pathPart }) {
                activeJournalEntry = entry
            }
            selectedRoom = .labJournal
        case "parent":
            selectedRoom = .parentMentor
        default:
            break
        }
    }
}
