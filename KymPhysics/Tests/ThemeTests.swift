import XCTest
@testable import KymPhysics

final class ThemeTests: XCTestCase {
    // The Standard's contrast is tested in teaching_kit (StandardThemeMatrixTests).
    func testEveryOldThemeChoiceMovesToAStandardTheme() throws {
        let oldIDs = ["journal", "movingWorld", "monsoon", "botanical", "sketchbook", "hearth", "scholar", "dusk"]
        let suite = "KymPhysicsTests.theme.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        let key = StandardThemeStore.subjectAppStorageKey
        let expected = [
            "movingWorld": "parchment", "botanical": "parchment", "sketchbook": "parchment",
            "hearth": "sepia", "scholar": "sepia", "dusk": "dark-graphite"
        ]
        for oldID in oldIDs {
            defaults.set(oldID, forKey: key)
            AppTheme.register(defaults: defaults)
            XCTAssertEqual(defaults.string(forKey: key), expected[oldID] ?? "vivid", oldID)
        }
        defaults.set("no-such-theme", forKey: key)
        AppTheme.register(defaults: defaults)
        XCTAssertEqual(defaults.string(forKey: key), "vivid", "an unknown id becomes Vivid")
        for standardID in [StandardTheme.systemID] + StandardTheme.all.map(\.id) {
            defaults.set(standardID, forKey: key)
            AppTheme.register(defaults: defaults)
            XCTAssertEqual(defaults.string(forKey: key), standardID, "a Standard choice stays put")
        }
        defaults.removeObject(forKey: key)
        AppTheme.register(defaults: defaults)
        XCTAssertNil(defaults.string(forKey: key), "a learner who never chose keeps no stored choice")
        XCTAssertEqual(StandardThemeStore.storedID(in: defaults), "vivid", "and gets Vivid, the default")
        AppTheme.register()
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

    func testLearnHarnessIntegrationEnginesAndCalibration() async throws {
        let pack = SeedPackLoader.shared

        // 1. Proposition Graph (⟹) & simplifyChains (prefer-fewest-premises + cycle-guarded ancestry cover)
        XCTAssertGreaterThanOrEqual(pack.propositionGraph.nodes.count, 20)
        XCTAssertGreaterThanOrEqual(pack.propositionGraph.chains.count, 10)
        XCTAssertEqual(PropositionGraphEngine.simplifyChains(pack.propositionGraph.chains), pack.propositionGraph.chains)

        let syntheticChains = [
            PhysicsDerivationChain(id: "c1", premises: ["A"], conclusion: "B", motivationQuestion: "Q1", chapterNumber: 1),
            PhysicsDerivationChain(id: "c2", premises: ["B"], conclusion: "C", motivationQuestion: "Q2", chapterNumber: 1),
            PhysicsDerivationChain(id: "c3-redundant-subset", premises: ["B", "X"], conclusion: "C", motivationQuestion: "Q3", chapterNumber: 1),
            PhysicsDerivationChain(id: "c4-redundant-ancestry", premises: ["A", "B"], conclusion: "C", motivationQuestion: "Q4", chapterNumber: 1)
        ]
        let simplified = PropositionGraphEngine.simplifyChains(syntheticChains)
        XCTAssertEqual(simplified.map(\.id), ["c1", "c2"])

        let inhalationAncestors = PropositionGraphEngine.ancestors(of: "prop-ch06-thoracic-inhalation", in: pack.propositionGraph)
        XCTAssertTrue(inhalationAncestors.contains(where: { $0.id == "prop-ch06-volume-expansion-drops-pressure" }))
        XCTAssertTrue(inhalationAncestors.contains(where: { $0.id == "prop-ch06-gas-particle-collisions" }))

        // 2. Confidence Verdict Calibration & QuestionProofService (R0/R1 vs R2+ & Auto-Error Autopsy)
        XCTAssertEqual(
            ConfidenceVerdictCalibration.calibrate(isPass: true, coverageFraction: 1.0, confidencePercent: 90, declinedToGuess: false),
            .solidMastery
        )
        XCTAssertEqual(
            ConfidenceVerdictCalibration.calibrate(isPass: true, coverageFraction: 1.0, confidencePercent: 30, declinedToGuess: false),
            .fragileLuckyGuess
        )
        XCTAssertEqual(
            ConfidenceVerdictCalibration.calibrate(isPass: false, coverageFraction: 0.0, confidencePercent: 90, declinedToGuess: false),
            .committedMisconception
        )
        XCTAssertEqual(
            ConfidenceVerdictCalibration.calibrate(isPass: false, coverageFraction: 0.0, confidencePercent: nil, declinedToGuess: true),
            .honestGap
        )

        XCTAssertFalse(HintRung.r0AttentionRedirect.surrendersRetrieval)
        XCTAssertFalse(HintRung.r1PatternRedescription.surrendersRetrieval)
        XCTAssertTrue(HintRung.r2CandidateCluster.surrendersRetrieval)
        XCTAssertTrue(HintRung.r5WorkedStep.surrendersRetrieval)

        let store = await MainActor.run { AppStore(db: DatabaseManager(inMemory: true), pack: pack) }
        let q = try XCTUnwrap(pack.schoolQuestions.first)

        // Declining to guess keeps proof level unseen and records honestGap
        let honestEval = await MainActor.run {
            store.submitQuestionAttempt(
                question: q,
                answerText: "",
                usedAssistance: false,
                confidencePercent: nil,
                declinedToGuess: true
            )
        }
        XCTAssertEqual(honestEval.calibration, .honestGap)
        XCTAssertEqual(honestEval.resultingProofLevel, .unseen)

        // High-confidence miss logs an Error Autopsy in Lab Journal
        let initialJournalCount = await MainActor.run { store.journalEntries.count }
        let missEval = await MainActor.run {
            store.submitQuestionAttempt(
                question: q,
                answerText: "Completely unrelated guess",
                usedAssistance: false,
                confidencePercent: 90,
                declinedToGuess: false,
                answerThinkingText: "Guessed without checking keywords"
            )
        }
        XCTAssertEqual(missEval.calibration, .committedMisconception)
        let afterJournalCount = await MainActor.run { store.journalEntries.count }
        XCTAssertEqual(afterJournalCount, initialJournalCount + 1)

        // R1 hint preserves independent proof when answer passes with >= 70% confidence
        let fullAnswer = q.markSchemeKeywords.joined(separator: " ") + " complete physical explanation"
        let r1PassEval = await MainActor.run {
            store.submitQuestionAttempt(
                question: q,
                answerText: fullAnswer,
                usedAssistance: false,
                confidencePercent: 90,
                declinedToGuess: false,
                maxHintRungUsed: 1
            )
        }
        XCTAssertTrue(r1PassEval.isPass)
        XCTAssertEqual(r1PassEval.resultingProofLevel, .proven)

        // 3. PracticeStreamEngine inactivity constraint
        XCTAssertGreaterThanOrEqual(pack.practiceDemands.count, 6)
        let stream = PracticeStreamEngine.scheduleStream(
            demands: pack.practiceDemands,
            retestDemandIds: ["demand-u6-disc-normal-vs-surface"],
            lastActivePropositionId: "prop-ch13-electromagnet-soft-iron-core"
        )
        XCTAssertEqual(stream.first?.id, "demand-u6-disc-normal-vs-surface")
        for idx in 1..<stream.count {
            XCTAssertNotEqual(stream[idx - 1].propositionId, stream[idx].propositionId)
        }

        // 4. AdaptiveLessonPlanDAG minimal prerequisite tree & missing-foundation rewrite
        let skills = await MainActor.run { store.bktSkills }
        let proofs = await MainActor.run { store.questionProofs }
        let plan = AdaptiveLessonPlanDAG.buildMinimalPlan(
            targetPropositionId: "prop-ch06-thoracic-inhalation",
            graph: pack.propositionGraph,
            skillsByTopic: skills,
            proofsByQuestion: proofs,
            probeOverrides: ["prop-ch06-pressure-area-definition": .solid]
        )
        XCTAssertTrue(plan.prunedSolidIds.contains("prop-ch06-pressure-area-definition"))
        let rewritten = plan.rewritePlanForMissingFoundation("prop-ch06-pressure-area-definition")
        XCTAssertFalse(rewritten.prunedSolidIds.contains("prop-ch06-pressure-area-definition"))

        // 5. LearnerImageSVGAnnotator & MathDisplayRecovery
        let plate = try XCTUnwrap(pack.diagramPlates.first)
        let overlay = LearnerImageSVGAnnotator.buildPlateVerificationOverlay(
            plate: plate,
            revealedCalloutIds: Set(plate.callouts.map(\.id))
        )
        XCTAssertTrue(overlay.validation.isValid, "SVG overlay validation failed: \(overlay.validation.issues)")
        XCTAssertTrue(overlay.svg.contains(LearnerImageSVGAnnotator.placeholderHref))

        let brokenMath = "Angle \u{0009}heta and \u{000C}rac{F}{A} with \\\\Delta x and literal `\\theta`"
        let repairedMath = MathDisplayRecovery.repairForDisplay(brokenMath)
        XCTAssertTrue(repairedMath.contains("\\theta"))
        XCTAssertTrue(repairedMath.contains("\\frac{F}{A}"))
        XCTAssertTrue(repairedMath.contains("\\Delta x"))
        XCTAssertTrue(repairedMath.contains("`\\theta`"))
    }
}
