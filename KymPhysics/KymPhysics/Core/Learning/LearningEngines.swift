import Foundation
import GRDB

// The review scheduler (FSRSScheduler, FSRS v5), BKTEngine and FSRSRating live in the shared
// KymLearning package. These conformances let the engines read and write the app's GRDB records.
extension FSRSCardRecord: ReviewCard {}

extension FSRSScheduler {
    /// This app's review schedule: FSRS v5, and a card rated again comes back the next day.
    static let app = FSRSScheduler(relearningStepDays: 1)
}
extension BKTSkillRecord: BKTSkill {}

// MARK: - LearnHarness Confidence Stops & Verdict Calibration

enum LearnerConfidenceStop: Int, CaseIterable, Codable, Identifiable, Sendable {
    case zero = 0
    case thirty = 30
    case fifty = 50
    case seventy = 70
    case ninety = 90
    case hundred = 100

    var id: Int { rawValue }

    var label: String {
        "\(rawValue)%"
    }
}

enum ConfidenceVerdictCalibration: String, Codable, Equatable, Sendable {
    case solidMastery = "solid"
    case fragileLuckyGuess = "fragile_guess"
    case committedMisconception = "committed_misconception"
    case shakyNearMiss = "near_miss"
    case honestGap = "honest_gap"

    var badgeTitle: String {
        switch self {
        case .solidMastery: return "Solid Mastery"
        case .fragileLuckyGuess: return "Fragile / Lucky Guess"
        case .committedMisconception: return "High-Confidence Miss"
        case .shakyNearMiss: return "Near Miss"
        case .honestGap: return "Honest Gap (No Guess)"
        }
    }

    static func calibrate(
        isPass: Bool,
        coverageFraction: Double,
        confidencePercent: Int?,
        declinedToGuess: Bool
    ) -> ConfidenceVerdictCalibration {
        if declinedToGuess {
            return .honestGap
        }
        if isPass {
            if let conf = confidencePercent, conf <= 30 {
                return .fragileLuckyGuess
            }
            return .solidMastery
        }
        if let conf = confidencePercent, conf >= 70, coverageFraction < 0.35 {
            return .committedMisconception
        }
        return .shakyNearMiss
    }
}

// MARK: - Question Proof Service (Worked Example -> Faded -> Independent Proof)

struct QuestionEvaluationResult: Equatable, Sendable {
    let matchedKeywords: [String]
    let missingKeywords: [String]
    let coverageFraction: Double
    let isPass: Bool
    let resultingProofLevel: QuestionProofLevel
    let feedbackSummary: String
    var calibration: ConfidenceVerdictCalibration = .solidMastery
}

enum QuestionProofService {
    static func dayKey(for date: Date, calendar: Calendar = .current) -> String {
        let comps = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", comps.year ?? 2026, comps.month ?? 1, comps.day ?? 1)
    }

    static func evaluateAndRecord(
        question: SchoolScienceQuestion,
        answerText: String,
        usedAssistance: Bool,
        existingProof: QuestionProofRecord?,
        now: Date = Date(),
        confidencePercent: Int? = nil,
        declinedToGuess: Bool = false,
        readingThinkingText: String = "",
        answerThinkingText: String = "",
        maxHintRungUsed: Int = 0
    ) -> (result: QuestionEvaluationResult, record: QuestionProofRecord) {
        let normalizedAnswer = answerText.lowercased()
        var matched: [String] = []
        var missing: [String] = []

        for kw in question.markSchemeKeywords {
            if normalizedAnswer.contains(kw.lowercased()) {
                matched.append(kw)
            } else {
                missing.append(kw)
            }
        }

        let total = max(1, question.markSchemeKeywords.count)
        let coverage = Double(matched.count) / Double(total)
        let isPass = !declinedToGuess && coverage >= 0.60 && normalizedAnswer.trimmingCharacters(in: .whitespacesAndNewlines).count >= 10

        // Hint rungs R0-R1 preserve independent retrieval eligibility; R2+ surrenders retrieval.
        let effectiveAssistance = usedAssistance || maxHintRungUsed >= 2

        let calibration = ConfidenceVerdictCalibration.calibrate(
            isPass: isPass,
            coverageFraction: coverage,
            confidencePercent: confidencePercent,
            declinedToGuess: declinedToGuess
        )

        let todayKey = dayKey(for: now)
        var passDays = existingProof?.independentPassDays ?? 0
        var lastPassDay = existingProof?.lastIndependentPassDayKey

        let nextLevel: QuestionProofLevel
        let feedback: String

        if declinedToGuess {
            nextLevel = existingProof?.level ?? .unseen
            feedback = "Honest gap recorded — declining to guess avoids false fluency. Let's build from the underlying premises first."
        } else if effectiveAssistance {
            if let prev = existingProof?.level, prev.isIndependentProof {
                nextLevel = prev
            } else {
                nextLevel = .assisted
            }
            feedback = isPass
                ? "Good guided answer (\(matched.count)/\(total) mark-scheme points). Come back and answer without the scaffold to earn Independent Proof."
                : "Guided attempt recorded. Include: \(missing.prefix(3).joined(separator: ", "))."
        } else if isPass {
            if let conf = confidencePercent, conf <= 30 {
                nextLevel = .shaky
                feedback = "Correct (\(matched.count)/\(total) points) with low confidence (\(conf)%). Scheduled for re-verification tomorrow so a lucky guess isn't mistaken for mastery."
            } else {
                if lastPassDay != todayKey {
                    passDays += 1
                    lastPassDay = todayKey
                }
                if passDays >= 2 {
                    nextLevel = .secure
                    feedback = "Secure across \(passDays) separate days (\(matched.count)/\(total) mark-scheme points)."
                } else {
                    nextLevel = .proven
                    feedback = "Proven independently today (\(matched.count)/\(total) mark-scheme points). Prove it on one more day to lock it as Secure."
                }
            }
        } else {
            nextLevel = .shaky
            if calibration == .committedMisconception, let conf = confidencePercent {
                feedback = "High-confidence miss (\(conf)% confidence, \(matched.count)/\(total) points). Logged to Error Autopsy — check: \(missing.prefix(3).joined(separator: ", "))."
            } else {
                feedback = "Almost there (\(matched.count)/\(total) mark-scheme points). Try adding: \(missing.prefix(3).joined(separator: ", "))."
            }
        }

        let record = QuestionProofRecord(
            id: question.id,
            unitNumber: question.unitNumber,
            topicCode: question.topicCode,
            proofLevel: nextLevel.rawValue,
            independentPassDays: passDays,
            lastIndependentPassDayKey: lastPassDay,
            lastAttemptAt: now,
            lastAnswerText: answerText,
            lastUsedAssistance: effectiveAssistance,
            matchedKeywordsCSV: matched.joined(separator: ","),
            missingKeywordsCSV: missing.joined(separator: ","),
            confidencePercent: confidencePercent,
            declinedToGuess: declinedToGuess,
            readingThinkingText: readingThinkingText,
            answerThinkingText: answerThinkingText,
            maxHintRungUsed: maxHintRungUsed
        )

        let eval = QuestionEvaluationResult(
            matchedKeywords: matched,
            missingKeywords: missing,
            coverageFraction: coverage,
            isPass: isPass,
            resultingProofLevel: nextLevel,
            feedbackSummary: feedback,
            calibration: calibration
        )
        return (eval, record)
    }
}

// MARK: - Three-Stage Readiness Service (Material In -> Checked Learning -> Independent Proof)

struct UnitReadinessSnapshot: Equatable, Sendable {
    let unitNumber: Int
    let topicsCount: Int
    let chaptersReadCount: Int
    let widgetsStampedCount: Int
    let questionsTotal: Int
    let questionsAssistedCount: Int
    let questionsProvenCount: Int
    let questionsSecureCount: Int
    let averageBKTMastery: Double

    var independentProofFraction: Double {
        guard questionsTotal > 0 else { return 0 }
        return Double(questionsProvenCount + questionsSecureCount) / Double(questionsTotal)
    }

    var readinessBadgeText: String {
        if questionsTotal > 0 && questionsSecureCount == questionsTotal {
            return "Exam-ready"
        } else if questionsProvenCount + questionsSecureCount > 0 {
            return "\(questionsProvenCount + questionsSecureCount)/\(questionsTotal) proven"
        } else if questionsAssistedCount > 0 {
            return "Guided practice"
        } else {
            return "Ready to start"
        }
    }
}

enum ReadinessService {
    static func snapshot(
        for unit: SchoolScienceUnit,
        pack: KymPhysicsSeedPack,
        proofs: [QuestionProofRecord],
        skills: [BKTSkillRecord],
        stamps: [WidgetChallengeStampRecord],
        readingProgress: [ChapterReadingProgressRecord]
    ) -> UnitReadinessSnapshot {
        let unitQuestions = pack.schoolQuestions.filter { $0.unitNumber == unit.unitNumber }
        let unitProofs = proofs.filter { $0.unitNumber == unit.unitNumber }
        let assisted = unitProofs.filter { $0.level == .assisted || $0.level == .shaky }.count
        let proven = unitProofs.filter { $0.level == .proven }.count
        let secure = unitProofs.filter { $0.level == .secure }.count

        let topicCodes = Set(unit.topics.map(\.code))
        let unitSkills = skills.filter { topicCodes.contains($0.id) }
        let avgMastery = unitSkills.isEmpty
            ? 0.0
            : unitSkills.map(\.pLearned).reduce(0, +) / Double(unitSkills.count)

        let linkedChSet = Set(unit.movingWorldChapters)
        let chaptersRead = readingProgress.filter { linkedChSet.contains($0.chapterNumber) && $0.readFraction >= 0.5 }.count
        let stampsCount = stamps.filter { linkedChSet.contains($0.chapterNumber) }.count

        return UnitReadinessSnapshot(
            unitNumber: unit.unitNumber,
            topicsCount: unit.topics.count,
            chaptersReadCount: chaptersRead,
            widgetsStampedCount: stampsCount,
            questionsTotal: unitQuestions.count,
            questionsAssistedCount: assisted,
            questionsProvenCount: proven,
            questionsSecureCount: secure,
            averageBKTMastery: avgMastery
        )
    }
}

// MARK: - LearnHarness First-Principles Proposition Graph Engine (⟹)

enum PropositionGraphEngine {
    static func chainKey(_ chain: PhysicsDerivationChain) -> String {
        let sortedPremises = chain.premises.sorted().joined(separator: ",")
        return "\(sortedPremises)=>\(chain.conclusion)"
    }

    /// Port of LearnHarness `simplifyChains` (`src/core/graph.ts`):
    /// 1. Prefer-fewest-premises: drops `B` if another chain `A` to the same conclusion has `premises(A) ⊂ premises(B)`.
    /// 2. Transitive ancestry-cover (cycle-guarded): drops `B` if another chain `A` to the same conclusion has all of `premises(A)`
    ///    covered by `premises(B)` or their upstream ancestors without routing through `B`.
    static func simplifyChains(_ chains: [PhysicsDerivationChain]) -> [PhysicsDerivationChain] {
        var unique: [PhysicsDerivationChain] = []
        var seenKeys = Set<String>()
        for c in chains {
            var seenP = Set<String>()
            let dedupPremises = c.premises.filter { seenP.insert($0).inserted }
            let normalized = PhysicsDerivationChain(
                id: c.id,
                premises: dedupPremises,
                conclusion: c.conclusion,
                motivationQuestion: c.motivationQuestion,
                chapterNumber: c.chapterNumber
            )
            let key = chainKey(normalized)
            if seenKeys.insert(key).inserted {
                unique.append(normalized)
            }
        }

        // Rule 1: Prefer-fewest-premises (strict subset)
        let afterSubset = unique.filter { b in
            let bSet = Set(b.premises)
            for a in unique where a.id != b.id && a.conclusion == b.conclusion {
                let aSet = Set(a.premises)
                if aSet.count < bSet.count && aSet.isSubset(of: bSet) {
                    return false
                }
            }
            return true
        }

        func ancestors(of nodeIds: Set<String>, excludingChainId: String, pool: [PhysicsDerivationChain]) -> Set<String> {
            var visited = nodeIds
            var frontier = Array(nodeIds)
            while let current = frontier.popLast() {
                for ch in pool where ch.id != excludingChainId && ch.conclusion == current {
                    for p in ch.premises where !visited.contains(p) {
                        visited.insert(p)
                        frontier.append(p)
                    }
                }
            }
            return visited
        }

        // Rule 2: Transitive ancestry-cover (cycle-guarded)
        var kept = afterSubset
        var idx = 0
        while idx < kept.count {
            let b = kept[idx]
            let bSet = Set(b.premises)
            let reachableFromB = ancestors(of: bSet, excludingChainId: b.id, pool: kept)
            let isRedundant = kept.contains { a in
                guard a.id != b.id, a.conclusion == b.conclusion else { return false }
                let aSet = Set(a.premises)
                guard aSet != bSet else { return false }
                return aSet.isSubset(of: reachableFromB)
            }
            if isRedundant {
                kept.remove(at: idx)
            } else {
                idx += 1
            }
        }
        return kept
    }

    static func ancestors(of conclusionId: String, in graph: PhysicsPropositionGraph) -> [PhysicsPropositionNode] {
        var visited = Set<String>()
        var orderedIds: [String] = []
        var frontier = [conclusionId]
        while let current = frontier.first {
            frontier.removeFirst()
            for chain in graph.chains where chain.conclusion == current {
                for p in chain.premises where !visited.contains(p) {
                    visited.insert(p)
                    orderedIds.append(p)
                    frontier.append(p)
                }
            }
        }
        let byId = Dictionary(uniqueKeysWithValues: graph.nodes.map { ($0.id, $0) })
        return orderedIds.compactMap { byId[$0] }
    }

    static func consequences(of premiseId: String, in graph: PhysicsPropositionGraph) -> [PhysicsPropositionNode] {
        var visited = Set<String>()
        var orderedIds: [String] = []
        var frontier = [premiseId]
        while let current = frontier.first {
            frontier.removeFirst()
            for chain in graph.chains where chain.premises.contains(current) {
                let c = chain.conclusion
                if !visited.contains(c) {
                    visited.insert(c)
                    orderedIds.append(c)
                    frontier.append(c)
                }
            }
        }
        let byId = Dictionary(uniqueKeysWithValues: graph.nodes.map { ($0.id, $0) })
        return orderedIds.compactMap { byId[$0] }
    }
}

// MARK: - LearnHarness Practice Stream Engine (Inactivity Constraint & Capability Modes)

enum PracticeStreamEngine {
    private static func modeRank(_ mode: String) -> Int {
        switch mode {
        case "recall": return 0
        case "discrimination": return 1
        case "composition": return 2
        default: return 3
        }
    }

    /// Orders practice demands (`recall -> discrimination -> composition`) while enforcing LearnHarness's
    /// inactivity constraint: no two consecutive demands may target the same `propositionId` whenever an
    /// alternative proposition is available. Demands whose IDs are in `retestDemandIds` are prioritized.
    static func scheduleStream(
        demands: [PhysicsPracticeDemand],
        retestDemandIds: Set<String> = [],
        lastActivePropositionId: String? = nil
    ) -> [PhysicsPracticeDemand] {
        var pool = demands.sorted { lhs, rhs in
            let lhsRetest = retestDemandIds.contains(lhs.id) ? 0 : 1
            let rhsRetest = retestDemandIds.contains(rhs.id) ? 0 : 1
            if lhsRetest != rhsRetest { return lhsRetest < rhsRetest }
            let lRank = modeRank(lhs.mode)
            let rRank = modeRank(rhs.mode)
            if lRank != rRank { return lRank < rRank }
            return lhs.id < rhs.id
        }

        var result: [PhysicsPracticeDemand] = []
        var previousProp = lastActivePropositionId

        while !pool.isEmpty {
            if let nextIdx = pool.firstIndex(where: { $0.propositionId != previousProp }) {
                let chosen = pool.remove(at: nextIdx)
                result.append(chosen)
                previousProp = chosen.propositionId
            } else {
                let chosen = pool.removeFirst()
                result.append(chosen)
                previousProp = chosen.propositionId
            }
        }
        return result
    }
}
