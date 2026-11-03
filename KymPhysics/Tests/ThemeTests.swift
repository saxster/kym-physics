import XCTest
@testable import KymPhysics

final class ThemeTests: XCTestCase {
    func testDefaultThemeIsAppleJournal() {
        XCTAssertEqual(CuratedColorScheme.defaultScheme, .journal)
        XCTAssertEqual(CuratedColorScheme.allCases.count, 8)
        XCTAssertTrue(CuratedColorScheme.allCases.contains(.movingWorld))
        XCTAssertTrue(CuratedColorScheme.allCases.contains(.monsoon))
    }

    func testAllEightThemesMeetWCAGContrastStandards() {
        for scheme in CuratedColorScheme.allCases {
            let p = scheme.palette
            let n = p.neutrals

            // Primary ink on background and card surface >= 7.0:1 (WCAG AAA)
            XCTAssertGreaterThanOrEqual(
                n.ink.light.contrastRatio(with: p.background.light), 7.0,
                "\(scheme.rawValue) light ink vs background failed AAA"
            )
            XCTAssertGreaterThanOrEqual(
                n.ink.light.contrastRatio(with: n.surface.light), 7.0,
                "\(scheme.rawValue) light ink vs surface failed AAA"
            )
            XCTAssertGreaterThanOrEqual(
                n.ink.dark.contrastRatio(with: p.background.dark), 7.0,
                "\(scheme.rawValue) dark ink vs background failed AAA"
            )
            XCTAssertGreaterThanOrEqual(
                n.ink.dark.contrastRatio(with: n.surface.dark), 7.0,
                "\(scheme.rawValue) dark ink vs surface failed AAA"
            )

            // Muted & tertiary ink on surface >= 4.5:1 (WCAG AA)
            XCTAssertGreaterThanOrEqual(
                n.mutedInk.light.contrastRatio(with: n.surface.light), 4.5,
                "\(scheme.rawValue) light mutedInk vs surface failed AA"
            )
            XCTAssertGreaterThanOrEqual(
                n.tertiaryInk.light.contrastRatio(with: n.surface.light), 4.5,
                "\(scheme.rawValue) light tertiaryInk vs surface failed AA"
            )
            XCTAssertGreaterThanOrEqual(
                n.mutedInk.dark.contrastRatio(with: n.surface.dark), 4.5,
                "\(scheme.rawValue) dark mutedInk vs surface failed AA"
            )
            XCTAssertGreaterThanOrEqual(
                n.tertiaryInk.dark.contrastRatio(with: n.surface.dark), 4.5,
                "\(scheme.rawValue) dark tertiaryInk vs surface failed AA"
            )

            // Primary & secondary accents on surface >= 4.5:1 (WCAG AA)
            XCTAssertGreaterThanOrEqual(
                p.primary.light.contrastRatio(with: n.surface.light), 4.5,
                "\(scheme.rawValue) light primary vs surface failed AA"
            )
            XCTAssertGreaterThanOrEqual(
                p.secondary.light.contrastRatio(with: n.surface.light), 4.5,
                "\(scheme.rawValue) light secondary vs surface failed AA"
            )
            XCTAssertGreaterThanOrEqual(
                p.primary.dark.contrastRatio(with: n.surface.dark), 4.5,
                "\(scheme.rawValue) dark primary vs surface failed AA"
            )
            XCTAssertGreaterThanOrEqual(
                p.secondary.dark.contrastRatio(with: n.surface.dark), 4.5,
                "\(scheme.rawValue) dark secondary vs surface failed AA"
            )
        }
    }

    func testSeedPackCompletenessAndSchoolScienceSpine() {
        let pack = SeedPackLoader.shared
        XCTAssertEqual(pack.chapters.count, 16)
        XCTAssertEqual(pack.volumes.count, 4)
        XCTAssertEqual(pack.stories.count, 95)
        XCTAssertEqual(pack.explorers.count, 4)
        XCTAssertGreaterThanOrEqual(pack.investigations.count, 109)
        XCTAssertGreaterThanOrEqual(pack.widgets.count, 45)
        XCTAssertEqual(pack.examBanks.count, 16)

        let totalExamQuestions = pack.examBanks.reduce(0) { $0 + $1.questions.count }
        XCTAssertEqual(totalExamQuestions, 507)

        // Verify 9-unit Cambridge Lower Secondary Science 8 spine & 3-Lens filter
        XCTAssertEqual(pack.schoolTextbook.units.count, 9)
        let physicsUnits = pack.schoolTextbook.units(for: .physicsCore)
        XCTAssertEqual(physicsUnits.map(\.unitNumber), [3, 6, 9])

        // Verify Kym's pencil tick status: Units 3 and 6 covered (true), Unit 9 upcoming (false)
        let unit3 = physicsUnits.first(where: { $0.unitNumber == 3 })!
        let unit6 = physicsUnits.first(where: { $0.unitNumber == 6 })!
        let unit9 = physicsUnits.first(where: { $0.unitNumber == 9 })!
        XCTAssertTrue(unit3.isCompletedInSchool)
        XCTAssertTrue(unit6.isCompletedInSchool)
        XCTAssertFalse(unit9.isCompletedInSchool)
        XCTAssertEqual(unit3.topics.count, 7)
        XCTAssertEqual(unit6.topics.count, 6)
        XCTAssertEqual(unit9.topics.count, 4)

        // Verify expanded School Science 8 Question Bank (45 pre-seeded Learner's Book + Workbook questions)
        XCTAssertGreaterThanOrEqual(pack.schoolQuestions.count, 45)
        XCTAssertEqual(pack.crossDisciplinaryBridges.count, 8)
        XCTAssertEqual(pack.diagramPlates.count, 12)
    }

    func testArduinoMissionsSubjectTipsAndSystemSurfaceSnapshots() {
        let tips = PhysicsSubjectTipsLoader.loadPhysicsTips()
        XCTAssertEqual(tips.count, 8)

        let missions = ArduinoMissionCatalog.allMissions
        XCTAssertEqual(missions.count, 10)

        let loaded = SystemSurfaceSnapshotStore.shared.loadSnapshot()
        XCTAssertFalse(loaded.activeUnitTitle.isEmpty)
        XCTAssertFalse(loaded.activeChapterTitle.isEmpty)
    }

    func testPedagogicalHonestyInQuestionProofAndBKT() {
        let pack = SeedPackLoader.shared
        let q = pack.schoolQuestions.first(where: { $0.topicCode == "9.3" })!
        let day1 = Date(timeIntervalSince1970: 1_762_000_000)
        let day2 = day1.addingTimeInterval(86_400 * 2)

        // 1. Assisted attempt never claims independent proof
        let (evalAssisted, recAssisted) = QuestionProofService.evaluateAndRecord(
            question: q,
            answerText: q.modelAnswer,
            usedAssistance: true,
            existingProof: nil,
            now: day1
        )
        XCTAssertTrue(evalAssisted.isPass)
        XCTAssertEqual(recAssisted.level, .assisted)
        XCTAssertFalse(recAssisted.level.isIndependentProof)

        // 2. Independent pass on Day 1 -> .proven
        let (_, recDay1) = QuestionProofService.evaluateAndRecord(
            question: q,
            answerText: q.modelAnswer,
            usedAssistance: false,
            existingProof: recAssisted,
            now: day1
        )
        XCTAssertEqual(recDay1.level, .proven)
        XCTAssertEqual(recDay1.independentPassDays, 1)

        // 3. Independent pass on Day 2 -> .secure
        let (_, recDay2) = QuestionProofService.evaluateAndRecord(
            question: q,
            answerText: q.modelAnswer,
            usedAssistance: false,
            existingProof: recDay1,
            now: day2
        )
        XCTAssertEqual(recDay2.level, .secure)
        XCTAssertEqual(recDay2.independentPassDays, 2)
    }

    func testWolframQuantitativePhysicsTemplatesAndUnits() {
        XCTAssertEqual(QuantitativePhysicsEngine.templates.count, 16)

        let speedTpl = QuantitativePhysicsEngine.templates.first(where: { $0.id == "quant-ch01-speed" })!
        let passRes = QuantitativePhysicsEngine.evaluate(input: "7.5 m/s", against: speedTpl)
        XCTAssertTrue(passRes.isFullPass)

        let unitTrapRes = QuantitativePhysicsEngine.evaluate(input: "7.5 km", against: speedTpl)
        XCTAssertTrue(unitTrapRes.isNumericCorrect)
        XCTAssertFalse(unitTrapRes.isUnitCorrect)
        XCTAssertFalse(unitTrapRes.isFullPass)
    }

    func testThreeDatabaseInMemoryMigrationsAndSeeding() throws {
        let db = DatabaseManager(inMemory: true)
        XCTAssertNotNil(db.kbPool)
        XCTAssertNotNil(db.statePool)
        XCTAssertNotNil(db.mnemosynePool)

        try db.kbPool.read { conn in
            let chapterCount = try Int.fetchOne(conn, sql: "SELECT COUNT(*) FROM kb_chapters") ?? 0
            let unitCount = try Int.fetchOne(conn, sql: "SELECT COUNT(*) FROM kb_school_units") ?? 0
            let questionCount = try Int.fetchOne(conn, sql: "SELECT COUNT(*) FROM kb_school_questions") ?? 0
            XCTAssertEqual(chapterCount, 16)
            XCTAssertEqual(unitCount, 9)
            XCTAssertGreaterThanOrEqual(questionCount, 45)
        }

        try db.statePool.read { conn in
            let cardCount = try FSRSCardRecord.fetchCount(conn)
            let skillCount = try BKTSkillRecord.fetchCount(conn)
            XCTAssertGreaterThanOrEqual(cardCount, 90)
            XCTAssertEqual(skillCount, 44)
        }
    }

    @MainActor
    func testPhase8ParitySubsystems() {
        // 1. 7-Phase Daily Physics Ritual
        XCTAssertEqual(PhysicsDailyRitualEngine.phasesInOrder().count, 7)
        XCTAssertGreaterThanOrEqual(PhysicsDailyRitualEngine.affirmations.count, 3)
        XCTAssertGreaterThanOrEqual(PhysicsDailyRitualEngine.curiosityHooks.count, 3)

        // 2. SpeedPhysics Mental Gym
        XCTAssertEqual(SpeedPhysicsGymEngine.Track.allCases.count, 3)
        XCTAssertGreaterThanOrEqual(SpeedPhysicsGymEngine.allItems.count, 12)
        for track in SpeedPhysicsGymEngine.Track.allCases {
            XCTAssertFalse(SpeedPhysicsGymEngine.items(for: track).isEmpty)
        }

        // 3. Mumbai Physics Memory Palaces
        XCTAssertEqual(PhysicsMemoryPalaceCatalog.allPalaces.count, 4)
        let emPalace = PhysicsMemoryPalaceCatalog.allPalaces.first(where: { $0.id == "palace-marine-drive-em" })!
        XCTAssertEqual(emPalace.stops.count, 7)
        let dispPalace = PhysicsMemoryPalaceCatalog.allPalaces.first(where: { $0.id == "palace-western-line-dispersion" })!
        XCTAssertEqual(dispPalace.stops.count, 7)

        // 4. Two-Voice Socratic Dialogue Builder
        let ch13 = SeedPackLoader.shared.chapters.first(where: { $0.number == 13 })!
        let dialogue = PhysicsTwoVoiceDialogueBuilder.buildDialogue(for: ch13)
        XCTAssertGreaterThanOrEqual(dialogue.count, 4)

        // 5. Omnisearch & Parent Mentor Report
        let store = AppStore(db: DatabaseManager(inMemory: true), pack: SeedPackLoader.shared)
        let electromagnetHits = PhysicsOmnisearchEngine.search(query: "electromagnet", in: store)
        XCTAssertFalse(electromagnetHits.isEmpty)

        let report = ParentMentorReportGenerator.generateMarkdownReport(for: store)
        XCTAssertTrue(report.contains("KymPhysics — Grade 8 Mentor & Proof Telemetry Report"))
        XCTAssertTrue(report.contains("Unit 9"))
    }

    @MainActor
    func testAIMentoringConstitutionGuardrailsAndSouls() throws {
        // 1. TutorConstitution version, SHA-256 hash & composition
        XCTAssertEqual(TutorConstitution.version, "2026-11-03.v2")
        XCTAssertEqual(TutorConstitution.policyHash.count, 64)
        let composed = TutorConstitution.applying(
            to: "Focus on Unit 9.3 Electromagnets.",
            context: .learnerDialogue(feature: .tutorChat, requestedStyle: .adaptive, learnerText: "Why soft iron?")
        )
        XCTAssertTrue(composed.contains("TUTOR CONSTITUTION — VERSION"))
        XCTAssertTrue(composed.contains("LEARNER AGENCY AND NON-MANIPULATION"))
        XCTAssertTrue(composed.contains("AUTONOMY-SUPPORTIVE EDUCATIONAL DIALOGUE"))

        // 2. Learner Agency immediate opt-outs ("just explain", "stop asking", "give me the answer", "explain directly")
        XCTAssertEqual(
            MotivationalDialoguePolicy.resolvedStyle(requested: .askMeQuestions, learnerText: "Please just explain how refraction works"),
            .explainDirectly
        )
        XCTAssertEqual(
            MotivationalDialoguePolicy.resolvedStyle(requested: .askMeQuestions, learnerText: "Please explain directly without questions"),
            .explainDirectly
        )
        XCTAssertEqual(
            MotivationalDialoguePolicy.resolvedStyle(requested: .adaptive, learnerText: "Stop asking and give me the answer"),
            .explainDirectly
        )
        XCTAssertEqual(
            MotivationalDialoguePolicy.supportMode(for: .adaptive, learnerText: "I'm stuck and this is too hard"),
            .motivational
        )
        // Idempotence & learnerAssessment agency inclusion
        let assessInstruction = TutorConstitution.applying(to: "Grade strictly.", context: .learnerAssessment)
        XCTAssertTrue(assessInstruction.contains("LEARNER AGENCY AND NON-MANIPULATION"))
        XCTAssertEqual(TutorConstitution.applying(to: assessInstruction, context: .learnerAssessment), assessInstruction)

        // 3. DevelopmentalResponseValidator catches all 7 prohibited categories
        XCTAssertTrue(DevelopmentalResponseValidator.validate("Great job tracing the 90-degree normal line!").isValid)
        let secretCheck = DevelopmentalResponseValidator.validate("Keep this between us and don't tell your parent.")
        XCTAssertFalse(secretCheck.isValid)
        XCTAssertTrue(secretCheck.violations.contains(.secrecy))
        let tranceCheck = DevelopmentalResponseValidator.validate("As you relax, your unconscious mind will absorb formulas.")
        XCTAssertFalse(tranceCheck.isValid)
        XCTAssertTrue(tranceCheck.violations.contains(.covertSuggestion))
        let sanitized = DevelopmentalResponseValidator.sanitizeOrFallback("Keep this between us.", context: .learnerChat)
        XCTAssertEqual(sanitized.text, DevelopmentalResponseValidator.safeFallback)

        // 4. On-Device Child-Safety Escalation Scanner & AppStore surface gating
        XCTAssertFalse(PhysicsSafetyGate.scan("Why does a blue shirt look black in red light?").triggered)
        let crisisScan = PhysicsSafetyGate.scan("I feel completely hopeless and want to hurt myself")
        XCTAssertTrue(crisisScan.triggered)
        XCTAssertNotNil(crisisScan.supportiveResponse)
        XCTAssertTrue(crisisScan.supportiveResponse?.contains("112") == true || crisisScan.supportiveResponse?.contains("trusted adult") == true)
        XCTAssertTrue(PhysicsSafetyGate.scan("Someone hits me and I feel hopeless").triggered)

        let testStore = AppStore(db: DatabaseManager(inMemory: true), pack: SeedPackLoader.shared)
        let sampleQuestion = SeedPackLoader.shared.schoolQuestions.first!
        let interceptedEval = testStore.submitQuestionAttempt(
            question: sampleQuestion,
            answerText: "I want to hurt myself",
            usedAssistance: false
        )
        XCTAssertFalse(interceptedEval.isPass)
        XCTAssertNotNil(testStore.latestSafetyEscalation)
        XCTAssertNil(testStore.questionProofs[sampleQuestion.id])

        // 5. Agent Soul Documents & Bounded Parent Overrides
        XCTAssertEqual(PhysicsMentorPersona.allCases.count, 7)
        for persona in PhysicsMentorPersona.allCases {
            let soul = AgentSoulLoader.soulDocument(for: persona)
            XCTAssertEqual(soul.personaId, persona.rawValue)
            XCTAssertFalse(soul.exampleExchanges.isEmpty, "Bundled JSON soul for \(persona.rawValue) must load exampleExchanges")
            XCTAssertFalse(soul.toSystemInstruction().isEmpty)
        }
        XCTAssertTrue(AgentSoulOverridePolicy.isAllowed(key: "tone", value: "warm"))
        XCTAssertFalse(AgentSoulOverridePolicy.isAllowed(key: "tone", value: "sarcastic"))
        XCTAssertFalse(AgentSoulOverridePolicy.isAllowed(key: "ignore_constitution", value: "true"))

        // 6. QuestionTutoringPhasePolicy conservative progression
        var phase: UnderstandingPhase = .exploring
        phase = QuestionTutoringPhasePolicy.phase(afterTurn: "I get it now!", learnerTurnCount: 1, current: phase)
        XCTAssertEqual(phase, .deepening) // Self-report can only advance exploring -> deepening
        phase = QuestionTutoringPhasePolicy.phase(afterTurn: "I get it!", learnerTurnCount: 2, current: phase)
        XCTAssertEqual(phase, .deepening) // Never jumps to confirming/mastered on self-report alone
        let verdict = TutoringComprehensionVerdictContract(understood: true, feedback: "Solid explanation of soft iron domains.", confidence: 85)
        try verdict.validateContract()
        phase = QuestionTutoringPhasePolicy.phase(after: verdict, current: phase)
        XCTAssertEqual(phase, .mastered)

        // 7. SocraticFeedbackEngine, StruggleDetector, BreakthroughDetector, AdversarialCouncil & QualityGate
        let socraticEngine = SocraticFeedbackEngine()
        let tier1 = socraticEngine.generateFeedback(creditResult: .init(score: 0.95, userCorrect: ["normal"], userMissing: []), conceptName: "Refraction")
        XCTAssertEqual(tier1.tier, .correct)
        let tier3 = socraticEngine.generateFeedback(creditResult: .init(score: 0.4, userCorrect: ["incidence"], userMissing: ["normal line"]), conceptName: "Refraction")
        XCTAssertEqual(tier3.tier, .partial)

        let struggle = StruggleDetector()
        struggle.recordResponse(cardId: "c1", conceptId: "9.3", wasCorrect: false)
        struggle.recordResponse(cardId: "c2", conceptId: "9.3", wasCorrect: false)
        struggle.recordResponse(cardId: "c3", conceptId: "9.3", wasCorrect: false)
        XCTAssertFalse(struggle.activeSignals.isEmpty)

        let breakthrough = BreakthroughDetector()
        breakthrough.recordResponse(cardId: "c1", conceptId: "9.3", wasCorrect: false)
        breakthrough.recordResponse(cardId: "c2", conceptId: "9.3", wasCorrect: false)
        breakthrough.recordResponse(cardId: "c3", conceptId: "9.3", wasCorrect: false)
        breakthrough.recordResponse(cardId: "c4", conceptId: "9.3", wasCorrect: true)
        breakthrough.recordResponse(cardId: "c5", conceptId: "9.3", wasCorrect: true)
        XCTAssertEqual(breakthrough.latestBreakthrough?.type, .conceptMastery)

        let council = AdversarialCouncilEngine.deliberateOnMastery(
            conceptName: "Unit 9.3 Electromagnets",
            bktMastery: 0.90,
            independentProofFraction: 0.85,
            attemptCount: 5,
            unresolvedMisconceptionsCount: 0
        )
        XCTAssertEqual(council.arbiterVerdict.actionType, .celebrateMastery)

        let gateIssues = QualityGateValidator.answerUnderstandingIssues(
            answerText: "Soft iron loses its magnetism when the current stops.",
            hintLadder: ["Hint 1", "Hint 2", "Hint 3"],
            misconceptions: [
                .init(belief: "Steel makes a better electromagnet core", correctiveNote: "Steel stays permanently magnetised so the crane cannot release scrap iron"),
                .init(belief: "More battery cells weaken the field", correctiveNote: "Higher current I increases field strength B ∝ N·I")
            ],
            rubric: ["States soft iron is a temporary magnet", "Contrasts with permanent steel"]
        )
        XCTAssertTrue(gateIssues.isEmpty)
    }
}
