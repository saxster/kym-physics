import Combine
import Foundation

// MARK: - Structured AI Contract Protocol

protocol AIStructuredResponseContract: Decodable, Sendable {
    static var contractName: String { get }
    func validateContract() throws
}

struct AIStructuredValidationError: Error, LocalizedError, Equatable, Sendable {
    let reason: String

    var errorDescription: String? {
        reason
    }
}

// MARK: - Question Tutoring Phase Policy & Contracts

enum UnderstandingPhase: String, Codable, CaseIterable, Sendable {
    case exploring
    case deepening
    case confirming
    case mastered

    var title: String {
        switch self {
        case .exploring: return "Exploring"
        case .deepening: return "Deepening"
        case .confirming: return "Confirming"
        case .mastered: return "Mastered"
        }
    }
}

struct TutoringComprehensionVerdictContract: Codable, Equatable, AIStructuredResponseContract {
    static let contractName = "tutoring-comprehension-verdict"

    let understood: Bool
    let feedback: String
    let confidence: Int

    func validateContract() throws {
        guard !feedback.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw AIStructuredValidationError(reason: "feedback is required")
        }
        guard (0...100).contains(confidence) else {
            throw AIStructuredValidationError(reason: "confidence must be between 0 and 100")
        }
    }
}

/// Decides when a question-tutoring conversation moves to its next phase
/// (`exploring` → `deepening` → `confirming` → `mastered`).
///
/// The structured comprehension verdict (`TutoringComprehensionVerdictContract`) is the only
/// evidence that can move her to `confirming` or `mastered` by itself. Without one, the fallback is
/// deliberately conservative: turn counts move the conversation along slowly, and a self-report
/// such as `"I get it"` can only move `exploring` to `deepening`, because saying you understand is not
/// showing it.
enum QuestionTutoringPhasePolicy {
    typealias Phase = UnderstandingPhase

    static let deepeningTurnCount = 6
    static let confirmingTurnCount = 10
    static let masteredConfidence = 70

    static let selfReportPhrases = [
        "i understand", "that makes sense", "oh i see", "got it", "now i know", "i get it"
    ]

    /// Phase after a structured comprehension verdict. Never moves backwards.
    static func phase(after verdict: TutoringComprehensionVerdictContract, current: Phase) -> Phase {
        guard verdict.understood else { return current }
        let proposed: Phase = verdict.confidence >= masteredConfidence ? .mastered : .confirming
        return later(of: current, proposed)
    }

    /// Fallback phase after an ordinary conversational turn, when no structured assessment exists.
    static func phase(afterTurn learnerMessage: String, learnerTurnCount: Int, current: Phase) -> Phase {
        var next = current
        if learnerTurnCount >= deepeningTurnCount, next == .exploring {
            next = .deepening
        } else if learnerTurnCount >= confirmingTurnCount, next == .deepening {
            next = .confirming
        }
        if next == .exploring, isSelfReportOfUnderstanding(learnerMessage) {
            next = .deepening
        }
        return next
    }

    static func isSelfReportOfUnderstanding(_ message: String) -> Bool {
        let lowercased = message.lowercased()
        return selfReportPhrases.contains { lowercased.contains($0) }
    }

    private static func rank(_ phase: Phase) -> Int {
        switch phase {
        case .exploring: return 0
        case .deepening: return 1
        case .confirming: return 2
        case .mastered: return 3
        }
    }

    private static func later(of first: Phase, _ second: Phase) -> Phase {
        rank(second) > rank(first) ? second : first
    }
}

struct TutoringCompareMethodStrategy: Codable, Equatable, Sendable {
    let title: String
    let steps: [String]
    let correctnessNotes: String
    let clarityNotes: String

    enum CodingKeys: String, CodingKey {
        case title, steps
        case correctnessNotes = "correctness_notes"
        case clarityNotes = "clarity_notes"
    }
}

struct TutoringCompareMethodsResponseContract: Codable, Equatable, AIStructuredResponseContract {
    static let contractName = "tutoring-compare-methods"

    let problemSummary: String
    let strategies: [TutoringCompareMethodStrategy]
    let commonMisconceptionWarning: String
    let recommendedMethod: String
    let sourceCitations: [String]

    enum CodingKeys: String, CodingKey {
        case problemSummary = "problem_summary"
        case strategies
        case commonMisconceptionWarning = "common_misconception_warning"
        case recommendedMethod = "recommended_method"
        case sourceCitations = "source_citations"
    }

    func validateContract() throws {
        guard !problemSummary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw AIStructuredValidationError(reason: "problem_summary is required")
        }
        guard (2...3).contains(strategies.count) else {
            throw AIStructuredValidationError(reason: "strategies must contain two or three methods")
        }
        for strategy in strategies {
            guard !strategy.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
                  !strategy.steps.isEmpty,
                  !strategy.correctnessNotes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
                  !strategy.clarityNotes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                throw AIStructuredValidationError(reason: "each strategy needs title, steps, correctness_notes, and clarity_notes")
            }
        }
        guard !recommendedMethod.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw AIStructuredValidationError(reason: "recommended_method is required")
        }
    }
}

// MARK: - Socratic Feedback Engine (4 Graduated Tiers)

enum PhysicsQuestionModality: String, Codable, Sendable {
    case text
    case multipleChoice
    case multiSelect
    case numeric
    case range
    case ordered
    case errorIdentification
}

struct PartialCreditEvaluation: Sendable, Equatable {
    let score: Double // 0.0 ... 1.0
    let userCorrect: [String]
    let userMissing: [String]
}

struct SocraticFeedback: Sendable, Equatable {
    let tier: FeedbackTier
    let headline: String
    let body: String
    let encouragement: String
    let followUp: String?

    enum FeedbackTier: Int, Sendable, Equatable {
        case correct = 1     // Score >= 0.9
        case close = 2       // Score >= 0.6
        case partial = 3     // Score > 0
        case far = 4         // Score == 0
    }

    var tierIcon: String {
        switch tier {
        case .correct: return "checkmark.circle.fill"
        case .close: return "arrow.up.circle.fill"
        case .partial: return "questionmark.circle.fill"
        case .far: return "lightbulb.fill"
        }
    }
}

struct SocraticFeedbackEngine: Sendable {
    func generateFeedback(
        creditResult: PartialCreditEvaluation,
        conceptName: String,
        questionType: PhysicsQuestionModality = .text
    ) -> SocraticFeedback {
        if questionType == .errorIdentification {
            return errorEvalFeedback(creditResult: creditResult, conceptName: conceptName)
        }

        let score = creditResult.score
        if score >= 0.9 {
            return correctTier(creditResult: creditResult, conceptName: conceptName)
        } else if score >= 0.6 {
            return closeTier(creditResult: creditResult, conceptName: conceptName)
        } else if score > 0 {
            return partialTier(creditResult: creditResult, conceptName: conceptName)
        } else {
            return farTier(creditResult: creditResult, conceptName: conceptName, questionType: questionType)
        }
    }

    private func errorEvalFeedback(creditResult: PartialCreditEvaluation, conceptName: String) -> SocraticFeedback {
        let score = creditResult.score
        let gotVerdict = creditResult.userCorrect.contains("verdict")
        let gotId = creditResult.userCorrect.contains("identification")

        if gotVerdict && score >= 0.9 {
            return SocraticFeedback(
                tier: .correct,
                headline: "Sharp eye!",
                body: "You correctly evaluated the solution and identified the key physics issue.",
                encouragement: "This is exactly the kind of critical thinking that experimentalists use.",
                followUp: "Can you construct your own flawed solution for Sparky to spot?"
            )
        } else if gotVerdict && score >= 0.6 {
            return SocraticFeedback(
                tier: .close,
                headline: "Good catch!",
                body: gotVerdict && !gotId
                    ? "You spotted the error! Now describe exactly which physical principle or unit was violated."
                    : "You're close — refine your identification of the specific mistake.",
                encouragement: "Finding errors is harder than solving problems. You're building a rare skill.",
                followUp: "Which conservation law or boundary condition does this error break?"
            )
        } else if gotVerdict && score > 0 {
            return SocraticFeedback(
                tier: .partial,
                headline: "On the right track",
                body: "Good verdict! Now look more carefully at where the mistake actually happens.",
                encouragement: "Evaluating work takes practice. You're developing this skill right now.",
                followUp: "Try checking the units and direction arrows on each step."
            )
        } else {
            return SocraticFeedback(
                tier: .far,
                headline: "Let's look again together",
                body: "Recheck your verdict and compare each step with the physical evidence before deciding whether the solution is correct.",
                encouragement: "Even experts sometimes miss errors on first reading. The key is systematic checking.",
                followUp: nil
            )
        }
    }

    private func correctTier(creditResult: PartialCreditEvaluation, conceptName: String) -> SocraticFeedback {
        SocraticFeedback(
            tier: .correct,
            headline: "Nailed it!",
            body: "You demonstrated solid understanding of \(conceptName).",
            encouragement: "Your physics intuition is building strong foundations.",
            followUp: "Can you predict what happens if we double one of the input quantities?"
        )
    }

    private func closeTier(creditResult: PartialCreditEvaluation, conceptName: String) -> SocraticFeedback {
        let missing = creditResult.userMissing.prefix(2).joined(separator: ", ")
        let body = !missing.isEmpty
            ? "You're very close! You captured most of the key elements. Consider also: \(missing)."
            : "Almost there! Your understanding is strong — just refine the units or boundary details."
        return SocraticFeedback(
            tier: .close,
            headline: "Almost there!",
            body: body,
            encouragement: "Being close shows real understanding. Small adjustments make it lock in.",
            followUp: "What's the connection between what you got right and what you missed?"
        )
    }

    private func partialTier(creditResult: PartialCreditEvaluation, conceptName: String) -> SocraticFeedback {
        let correct = creditResult.userCorrect.prefix(2).joined(separator: ", ")
        let missing = creditResult.userMissing.prefix(2).joined(separator: ", ")
        let body: String
        if !correct.isEmpty && !missing.isEmpty {
            body = "You correctly identified: \(correct). Now think about: \(missing). What connects these ideas?"
        } else if !missing.isEmpty {
            body = "Consider: \(missing). What do you already know about \(conceptName) that might help?"
        } else {
            body = "You're building understanding. What's the core physical relationship behind \(conceptName)?"
        }
        return SocraticFeedback(
            tier: .partial,
            headline: "You're building understanding",
            body: body,
            encouragement: "Every partial understanding is a stepping stone. You're making progress.",
            followUp: "Try explaining \(conceptName) in your own words — what parts feel clearest?"
        )
    }

    private func farTier(
        creditResult: PartialCreditEvaluation,
        conceptName: String,
        questionType: PhysicsQuestionModality
    ) -> SocraticFeedback {
        let missing = creditResult.userMissing.prefix(3).joined(separator: ", ")
        let body: String
        switch questionType {
        case .numeric:
            body = "The number is different from what you expected. Check the formula relationship and SI unit conversions first."
        case .multipleChoice:
            body = "That's not quite it. The right mechanism involves: \(missing). Think about why that direction or law holds."
        default:
            body = missing.isEmpty
                ? "Let's rebuild \(conceptName) from the ground up — start by sketching the diagram or stating the invariant."
                : "Let's rebuild from the ground up. The key elements are: \(missing). Start with the most fundamental one."
        }
        return SocraticFeedback(
            tier: .far,
            headline: "Let's work through this together",
            body: body,
            encouragement: "Not knowing is the first step to knowing. Every physicist started right here.",
            followUp: nil
        )
    }
}

// MARK: - Struggle & Breakthrough Detectors

enum MentoringInterventionType: String, Sendable, Equatable {
    case difficultyAdjustment
    case encouragement
    case microBreak
    case interactiveLabBridge
}

struct StruggleSignal: Sendable, Equatable, Identifiable {
    enum SignalType: String, Sendable, Equatable {
        case repeatedConceptFailure
        case timeExceeded
        case accuracyDrop
        case hintOveruse
    }

    let id = UUID()
    let type: SignalType
    let severity: Double // 0.0 ... 1.0
    let conceptId: String?
    let cardId: String?
    let suggestedIntervention: MentoringInterventionType
    let timestamp: Date
}

@MainActor
final class StruggleDetector: ObservableObject {
    static let conceptFailureThreshold = 3
    static let timeExceededMultiplier: Double = 2.0
    static let accuracyDropThreshold: Double = 50.0
    static let accuracyWindowSize = 10

    private var conceptFailureCounts: [String: Int] = [:]
    private var recentConceptFailureCards: Set<String> = []
    private var recentResults: [Bool] = []
    @Published private(set) var activeSignals: [StruggleSignal] = []

    private let struggleSubject = PassthroughSubject<StruggleSignal, Never>()
    var struggleDetectedPublisher: AnyPublisher<StruggleSignal, Never> {
        struggleSubject.eraseToAnyPublisher()
    }

    func recordResponse(
        cardId: String,
        conceptId: String?,
        wasCorrect: Bool,
        partialCredit: Double? = nil,
        timeTakenMs: Int = 10_000,
        expectedTimeMs: Int = 15_000
    ) {
        let effectiveCorrect = partialCredit.map { $0 >= 0.6 } ?? wasCorrect
        recentResults.append(effectiveCorrect)
        if recentResults.count > Self.accuracyWindowSize {
            recentResults.removeFirst(recentResults.count - Self.accuracyWindowSize)
        }

        var newSignals: [StruggleSignal] = []

        if !effectiveCorrect, let conceptId = conceptId {
            conceptFailureCounts[conceptId, default: 0] += 1
            let failures = conceptFailureCounts[conceptId, default: 0]
            if failures >= Self.conceptFailureThreshold && !recentConceptFailureCards.contains(cardId) {
                recentConceptFailureCards.insert(cardId)
                newSignals.append(
                    StruggleSignal(
                        type: .repeatedConceptFailure,
                        severity: min(1.0, Double(failures) / 5.0),
                        conceptId: conceptId,
                        cardId: cardId,
                        suggestedIntervention: .interactiveLabBridge,
                        timestamp: Date()
                    )
                )
            }
        } else if effectiveCorrect, let conceptId = conceptId {
            conceptFailureCounts[conceptId] = 0
        }

        if expectedTimeMs > 0 {
            let ratio = Double(timeTakenMs) / Double(expectedTimeMs)
            if ratio >= Self.timeExceededMultiplier {
                newSignals.append(
                    StruggleSignal(
                        type: .timeExceeded,
                        severity: min(1.0, (ratio - Self.timeExceededMultiplier) / 3.0 + 0.5),
                        conceptId: conceptId,
                        cardId: cardId,
                        suggestedIntervention: .encouragement,
                        timestamp: Date()
                    )
                )
            }
        }

        if recentResults.count >= 5 {
            let correctCount = recentResults.filter { $0 }.count
            let accuracy = (Double(correctCount) / Double(recentResults.count)) * 100.0
            if accuracy < Self.accuracyDropThreshold {
                newSignals.append(
                    StruggleSignal(
                        type: .accuracyDrop,
                        severity: min(1.0, (Self.accuracyDropThreshold - accuracy) / 30.0 + 0.5),
                        conceptId: conceptId,
                        cardId: cardId,
                        suggestedIntervention: accuracy < 30.0 ? .microBreak : .difficultyAdjustment,
                        timestamp: Date()
                    )
                )
            }
        }

        for signal in newSignals {
            activeSignals.append(signal)
            struggleSubject.send(signal)
        }
    }

    func reset() {
        conceptFailureCounts.removeAll()
        recentConceptFailureCards.removeAll()
        recentResults.removeAll()
        activeSignals.removeAll()
    }
}

struct Breakthrough: Sendable, Equatable, Identifiable {
    let id: String
    let type: BreakthroughType
    let conceptId: String?
    let conceptName: String?
    let message: String
    let celebrationIntensity: Double
    let timestamp: Date

    enum BreakthroughType: String, Sendable, Equatable {
        case conceptMastery
        case accuracySurge
        case weaknessReversal
        case streakMilestone
        case subjectIndependence
    }
}

@MainActor
final class BreakthroughDetector: ObservableObject {
    static let conceptFailureThreshold = 3
    static let conceptRecoveryThreshold = 2
    static let accuracySurgeJump: Double = 30.0
    static let weaknessDropThreshold: Double = 20.0
    static let streakMilestones: Set<Int> = [5, 10, 20, 50]
    private static let windowSize = 10

    private var conceptFailures: [String: Int] = [:]
    private var conceptRecovery: [String: Int] = [:]
    private var recentResults: [Bool] = []
    private var currentStreak: Int = 0
    private var celebratedConcepts: Set<String> = []
    @Published private(set) var latestBreakthrough: Breakthrough?

    private let breakthroughSubject = PassthroughSubject<Breakthrough, Never>()
    var breakthroughPublisher: AnyPublisher<Breakthrough, Never> {
        breakthroughSubject.eraseToAnyPublisher()
    }

    func recordResponse(
        cardId: String,
        conceptId: String?,
        wasCorrect: Bool,
        partialCredit: Double? = nil,
        previousWeaknessScore: Double? = nil,
        currentWeaknessScore: Double? = nil
    ) {
        let effectiveCorrect = partialCredit.map { $0 >= 0.6 } ?? wasCorrect
        if effectiveCorrect {
            currentStreak += 1
        } else {
            currentStreak = 0
        }

        recentResults.append(effectiveCorrect)
        if recentResults.count > Self.windowSize {
            recentResults.removeFirst(recentResults.count - Self.windowSize)
        }

        var breakthroughs: [Breakthrough] = []

        if let conceptId = conceptId {
            if effectiveCorrect {
                let failures = conceptFailures[conceptId, default: 0]
                if failures >= Self.conceptFailureThreshold {
                    conceptRecovery[conceptId, default: 0] += 1
                    if conceptRecovery[conceptId, default: 0] >= Self.conceptRecoveryThreshold
                        && !celebratedConcepts.contains(conceptId) {
                        celebratedConcepts.insert(conceptId)
                        breakthroughs.append(
                            Breakthrough(
                                id: UUID().uuidString,
                                type: .conceptMastery,
                                conceptId: conceptId,
                                conceptName: conceptId,
                                message: "You conquered a tough physics concept! That persistence paid off.",
                                celebrationIntensity: 0.9,
                                timestamp: Date()
                            )
                        )
                    }
                }
            } else {
                conceptFailures[conceptId, default: 0] += 1
                conceptRecovery[conceptId] = 0
            }
        }

        if recentResults.count >= Self.windowSize {
            let mid = Self.windowSize / 2
            let oldWindow = Array(recentResults.prefix(mid))
            let newWindow = Array(recentResults.suffix(mid))
            let oldAccuracy = Double(oldWindow.filter { $0 }.count) / Double(oldWindow.count) * 100
            let newAccuracy = Double(newWindow.filter { $0 }.count) / Double(newWindow.count) * 100
            if newAccuracy - oldAccuracy >= Self.accuracySurgeJump && newAccuracy >= 80 {
                breakthroughs.append(
                    Breakthrough(
                        id: UUID().uuidString,
                        type: .accuracySurge,
                        conceptId: conceptId,
                        conceptName: nil,
                        message: "Your physics accuracy just surged! You're in the zone.",
                        celebrationIntensity: 0.7,
                        timestamp: Date()
                    )
                )
                recentResults = Array(recentResults.suffix(mid))
            }
        }

        if let previous = previousWeaknessScore,
           let current = currentWeaknessScore,
           previous - current >= Self.weaknessDropThreshold {
            breakthroughs.append(
                Breakthrough(
                    id: UUID().uuidString,
                    type: .weaknessReversal,
                    conceptId: conceptId,
                    conceptName: nil,
                    message: "A physics weakness just became a strength. That's real growth.",
                    celebrationIntensity: 0.8,
                    timestamp: Date()
                )
            )
        }

        if Self.streakMilestones.contains(currentStreak) {
            breakthroughs.append(
                Breakthrough(
                    id: UUID().uuidString,
                    type: .streakMilestone,
                    conceptId: conceptId,
                    conceptName: nil,
                    message: "\(currentStreak) in a row! Your first-principles reasoning is locked in.",
                    celebrationIntensity: min(1.0, Double(currentStreak) / 20.0),
                    timestamp: Date()
                )
            )
        }

        for item in breakthroughs {
            latestBreakthrough = item
            breakthroughSubject.send(item)
        }
    }

    func reset() {
        conceptFailures.removeAll()
        conceptRecovery.removeAll()
        recentResults.removeAll()
        currentStreak = 0
        celebratedConcepts.removeAll()
        latestBreakthrough = nil
    }
}

// MARK: - Adversarial Council (Advocate / Challenger / Arbiter)

struct CouncilDeliberation: Sendable, Equatable, Identifiable {
    let id = UUID()
    let topic: String
    let advocatePosition: AgentPosition
    let challengerPosition: AgentPosition
    let arbiterVerdict: ArbiterVerdict
    let timestamp: Date

    struct AgentPosition: Sendable, Equatable {
        let role: AgentRole
        let recommendation: String
        let evidence: [String]
        let confidence: Double

        enum AgentRole: String, Sendable, Equatable {
            case advocate
            case challenger
        }
    }

    struct ArbiterVerdict: Sendable, Equatable {
        let decision: String
        let reasoning: String
        let actionType: CouncilAction
        let confidence: Double

        enum CouncilAction: String, Codable, Sendable, Equatable {
            case increaseDifficulty
            case holdLevel
            case decreaseDifficulty
            case switchApproach
            case celebrateMastery
            case remediatePrerequisite
        }
    }
}

enum AdversarialCouncilEngine {
    /// Deterministic local 3-agent deliberation (Advocate + Challenger + Arbiter) grounded in BKT mastery,
    /// independent proof fraction, and error ledger counts, with optional live Gemini synthesis.
    static func deliberateOnMastery(
        conceptName: String,
        bktMastery: Double,
        independentProofFraction: Double,
        attemptCount: Int,
        unresolvedMisconceptionsCount: Int
    ) -> CouncilDeliberation {
        let advocateEvidence: [String] = [
            "BKT mastery p(L) is \(Int((bktMastery * 100).rounded()))% across \(attemptCount) attempts",
            "Independent Question Proof rate is \(Int((independentProofFraction * 100).rounded()))%"
        ]
        let advocateConfidence = min(0.95, max(0.35, (bktMastery + independentProofFraction) / 2.0))
        let advocate = CouncilDeliberation.AgentPosition(
            role: .advocate,
            recommendation: bktMastery >= 0.78 && independentProofFraction >= 0.7
                ? "Promote \(conceptName) to Secure mastery and unlock synthesis challenges."
                : "Advance \(conceptName) to guided quantitative application.",
            evidence: advocateEvidence,
            confidence: advocateConfidence
        )

        var challengerEvidence: [String] = []
        if unresolvedMisconceptionsCount > 0 {
            challengerEvidence.append("\(unresolvedMisconceptionsCount) misconception(s) still open in the Error Ledger")
        }
        if independentProofFraction < 0.75 {
            challengerEvidence.append("Independent proof fraction (\(Int((independentProofFraction * 100).rounded()))%) is below the 75% unhinted threshold")
        }
        if attemptCount < 3 {
            challengerEvidence.append("Only \(attemptCount) attempt(s) recorded — vulnerable to lucky guesses without spaced transfer")
        }
        if challengerEvidence.isEmpty {
            challengerEvidence.append("Edge-case boundary transfer (inverting variables or changing medium) should be verified once more")
        }
        let challengerConfidence = unresolvedMisconceptionsCount > 0 || independentProofFraction < 0.6 ? 0.82 : 0.45
        let challenger = CouncilDeliberation.AgentPosition(
            role: .challenger,
            recommendation: unresolvedMisconceptionsCount > 0
                ? "Hold promotion until the open misconception in \(conceptName) is falsified in a lab."
                : "Require one unhinted explanation of WHY before promoting \(conceptName).",
            evidence: challengerEvidence,
            confidence: challengerConfidence
        )

        let action: CouncilDeliberation.ArbiterVerdict.CouncilAction
        let decision: String
        let reasoning: String
        let verdictConfidence: Double

        if bktMastery >= 0.85 && independentProofFraction >= 0.75 && unresolvedMisconceptionsCount == 0 && attemptCount >= 3 {
            action = .celebrateMastery
            decision = "Celebrate Mastery & Unlock Transfer Challenge"
            reasoning = "Advocate's evidence of \(Int((bktMastery * 100).rounded()))% BKT mastery and \(Int((independentProofFraction * 100).rounded()))% unhinted proofs with zero open misconceptions outweighs Challenger's caution."
            verdictConfidence = 0.90
        } else if unresolvedMisconceptionsCount > 0 && bktMastery < 0.55 {
            action = .remediatePrerequisite
            decision = "Remediate Misconception in Interactive Physics Lab"
            reasoning = "Challenger identified \(unresolvedMisconceptionsCount) active misconception(s) and BKT mastery below 55%. Run a boundary-condition lab check first."
            verdictConfidence = 0.86
        } else if bktMastery >= 0.72 && independentProofFraction >= 0.60 {
            action = .increaseDifficulty
            decision = "Step Up to Unhinted Cambridge Structured Proof"
            reasoning = "Foundations are solid (\(Int((bktMastery * 100).rounded()))% BKT), so the Arbiter recommends one unhinted multi-mark question to satisfy Challenger's transfer test."
            verdictConfidence = 0.80
        } else {
            action = .holdLevel
            decision = "Hold Level & Consolidate with Two-Step Explanation"
            reasoning = "Arbiter sides with conservative pacing until unhinted Question Proofs cross 75%."
            verdictConfidence = 0.75
        }

        return CouncilDeliberation(
            topic: "Mastery & Readiness: \(conceptName)",
            advocatePosition: advocate,
            challengerPosition: challenger,
            arbiterVerdict: .init(
                decision: decision,
                reasoning: reasoning,
                actionType: action,
                confidence: verdictConfidence
            ),
            timestamp: Date()
        )
    }
}

// MARK: - Quality Gate Service (Answer-Understanding Slot & Content Gate)

struct PhysicsMisconceptionNote: Codable, Sendable, Equatable {
    let belief: String
    let correctiveNote: String
}

enum QualityGateValidator {
    /// Deterministic structural completeness check for a question's answer-understanding pack
    /// (mentor contract `answer_understanding_slot` from `../kym_tutor`).
    static func answerUnderstandingIssues(
        answerText: String?,
        hintLadder: [String],
        misconceptions: [PhysicsMisconceptionNote],
        rubric: [String]
    ) -> [String] {
        func cleaned(_ values: [String]) -> [String] {
            values
                .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                .filter { !$0.isEmpty }
        }

        var issues: [String] = []
        if answerText?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty != false {
            issues.append("answer_text is missing")
        }
        if cleaned(hintLadder).count != 3 {
            issues.append("hint_ladder must contain exactly 3 progressive hints")
        }
        if !(2...3).contains(misconceptions.count) {
            issues.append("misconceptions must contain two or three entries")
        } else if misconceptions.contains(where: {
            $0.belief.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                || $0.correctiveNote.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }) {
            issues.append("each misconception needs a belief and a corrective note")
        }
        if cleaned(rubric).isEmpty {
            issues.append("rubric must contain at least one criterion")
        }
        return issues
    }
}

// MARK: - AI Budget Ledger

enum AIBudgetError: Error, LocalizedError, Equatable {
    case budgetExceeded(dailyCount: Int, dailyLimit: Int, monthlyCount: Int, monthlyLimit: Int)

    var errorDescription: String? {
        switch self {
        case .budgetExceeded(let dCount, let dLimit, let mCount, let mLimit):
            return "AI request budget reached (\(dCount)/\(dLimit) today, \(mCount)/\(mLimit) this month). Offline Socratic Physics Coach remains active."
        }
    }
}

struct AIBudgetSnapshot: Codable, Sendable, Equatable {
    var dailyWindow: String
    var dailyCount: Int
    var monthlyWindow: String
    var monthlyCount: Int
    var dailyLimit: Int
    var monthlyLimit: Int
}

final class AIBudgetLedger: @unchecked Sendable {
    static let shared = AIBudgetLedger()

    private let userDefaults: UserDefaults
    private let calendar: Calendar
    private let storageKey = "kymphysics.AIBudgetLedger.snapshot.v1"
    let dailyLimit: Int
    let monthlyLimit: Int
    private let lock = NSLock()

    init(
        userDefaults: UserDefaults = .standard,
        calendar: Calendar = .current,
        dailyLimit: Int = 120,
        monthlyLimit: Int = 2400
    ) {
        self.userDefaults = userDefaults
        self.calendar = calendar
        self.dailyLimit = dailyLimit
        self.monthlyLimit = monthlyLimit
    }

    func currentSnapshot(now: Date = Date()) -> AIBudgetSnapshot {
        lock.lock()
        defer { lock.unlock() }
        return normalizedSnapshot(now: now)
    }

    @discardableResult
    func consumeRequest(now: Date = Date()) throws -> AIBudgetSnapshot {
        lock.lock()
        defer { lock.unlock() }
        var snapshot = normalizedSnapshot(now: now)
        guard snapshot.dailyCount < dailyLimit,
              snapshot.monthlyCount < monthlyLimit else {
            save(snapshot)
            throw AIBudgetError.budgetExceeded(
                dailyCount: snapshot.dailyCount,
                dailyLimit: dailyLimit,
                monthlyCount: snapshot.monthlyCount,
                monthlyLimit: monthlyLimit
            )
        }
        snapshot.dailyCount += 1
        snapshot.monthlyCount += 1
        save(snapshot)
        return snapshot
    }

    func resetForTesting(now: Date = Date()) {
        lock.lock()
        defer { lock.unlock() }
        let dailyWindow = windowIdentifier(for: now, includeDay: true)
        let monthlyWindow = windowIdentifier(for: now, includeDay: false)
        save(
            AIBudgetSnapshot(
                dailyWindow: dailyWindow,
                dailyCount: 0,
                monthlyWindow: monthlyWindow,
                monthlyCount: 0,
                dailyLimit: dailyLimit,
                monthlyLimit: monthlyLimit
            )
        )
    }

    private func normalizedSnapshot(now: Date) -> AIBudgetSnapshot {
        let dailyWindow = windowIdentifier(for: now, includeDay: true)
        let monthlyWindow = windowIdentifier(for: now, includeDay: false)
        var snapshot: AIBudgetSnapshot
        if let data = userDefaults.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode(AIBudgetSnapshot.self, from: data) {
            snapshot = decoded
        } else {
            snapshot = AIBudgetSnapshot(
                dailyWindow: dailyWindow,
                dailyCount: 0,
                monthlyWindow: monthlyWindow,
                monthlyCount: 0,
                dailyLimit: dailyLimit,
                monthlyLimit: monthlyLimit
            )
        }

        if snapshot.dailyWindow != dailyWindow {
            snapshot.dailyWindow = dailyWindow
            snapshot.dailyCount = 0
        }
        if snapshot.monthlyWindow != monthlyWindow {
            snapshot.monthlyWindow = monthlyWindow
            snapshot.monthlyCount = 0
        }
        snapshot.dailyLimit = dailyLimit
        snapshot.monthlyLimit = monthlyLimit
        return snapshot
    }

    private func save(_ snapshot: AIBudgetSnapshot) {
        if let data = try? JSONEncoder().encode(snapshot) {
            userDefaults.set(data, forKey: storageKey)
        }
    }

    private func windowIdentifier(for date: Date, includeDay: Bool) -> String {
        let components: Set<Calendar.Component> = includeDay ? [.year, .month, .day] : [.year, .month]
        let values = calendar.dateComponents(components, from: date)
        if includeDay {
            return "\(values.year ?? 0)-\(values.month ?? 0)-\(values.day ?? 0)"
        }
        return "\(values.year ?? 0)-\(values.month ?? 0)"
    }
}
