import Foundation
import GRDB

// MARK: - FSRS v4 Spaced Repetition Scheduler

enum FSRSRating: Int, CaseIterable, Identifiable, Sendable {
    case again = 1
    case hard = 2
    case good = 3
    case easy = 4

    var id: Int { rawValue }

    var title: String {
        switch self {
        case .again: return "Again"
        case .hard: return "Hard"
        case .good: return "Good"
        case .easy: return "Easy"
        }
    }
}

enum FSRSScheduler {
    static func schedule(
        card: FSRSCardRecord,
        rating: FSRSRating,
        now: Date = Date()
    ) -> FSRSCardRecord {
        var updated = card
        let elapsed: Double
        if let last = card.lastReviewAt {
            elapsed = max(0, now.timeIntervalSince(last) / 86_400.0)
        } else {
            elapsed = 0
        }
        updated.elapsedDays = elapsed
        updated.lastReviewAt = now
        updated.reps += 1

        let deltaD = -0.6 * (Double(rating.rawValue) - 3.0)
        updated.difficulty = min(10.0, max(1.0, card.difficulty + deltaD))

        switch rating {
        case .again:
            updated.lapses += 1
            updated.state = 3
            updated.stability = max(0.5, card.stability * 0.45)
            updated.scheduledDays = 1.0
        case .hard:
            updated.state = 2
            updated.stability = max(1.0, card.stability * 1.25)
            updated.scheduledDays = max(1.0, round(updated.stability))
        case .good:
            updated.state = 2
            updated.stability = max(1.5, card.stability * 2.2)
            updated.scheduledDays = max(2.0, round(updated.stability))
        case .easy:
            updated.state = 2
            updated.stability = max(2.5, card.stability * 3.1)
            updated.scheduledDays = max(4.0, round(updated.stability))
        }

        updated.dueAt = now.addingTimeInterval(updated.scheduledDays * 86_400.0)
        return updated
    }
}

// MARK: - Bayesian Knowledge Tracing (BKT) with Pedagogical Honesty

enum BKTEngine {
    /// Critical honesty rule: if `usedAssistance` is true (she opened the worked example, faded blank,
    /// or coach hint before submitting), `independentEvidenceCount` is NOT incremented and `pLearned`
    /// cannot jump to mastery.
    static func update(
        skill: BKTSkillRecord,
        isCorrect: Bool,
        usedAssistance: Bool,
        now: Date = Date()
    ) -> BKTSkillRecord {
        var next = skill
        next.updatedAt = now

        if usedAssistance {
            next.assistedEvidenceCount += 1
            let gentleBoost = isCorrect ? 0.04 : 0.0
            next.pLearned = min(0.68, skill.pLearned + gentleBoost)
            return next
        }

        next.independentEvidenceCount += 1
        let L = skill.pLearned
        let S = skill.pSlip
        let G = skill.pGuess
        let T = skill.pTransit

        let posterior: Double
        if isCorrect {
            let num = L * (1.0 - S)
            let den = num + (1.0 - L) * G
            posterior = den > 0 ? (num / den) : L
        } else {
            let num = L * S
            let den = num + (1.0 - L) * (1.0 - G)
            posterior = den > 0 ? (num / den) : L
        }

        let updatedL = posterior + (1.0 - posterior) * T
        next.pLearned = min(0.99, max(0.05, updatedL))
        return next
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
        now: Date = Date()
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
        let isPass = coverage >= 0.60 && normalizedAnswer.trimmingCharacters(in: .whitespacesAndNewlines).count >= 10

        let todayKey = dayKey(for: now)
        var passDays = existingProof?.independentPassDays ?? 0
        var lastPassDay = existingProof?.lastIndependentPassDayKey

        let nextLevel: QuestionProofLevel
        let feedback: String

        if usedAssistance {
            if let prev = existingProof?.level, prev.isIndependentProof {
                nextLevel = prev
            } else {
                nextLevel = .assisted
            }
            feedback = isPass
                ? "Good guided answer (\(matched.count)/\(total) mark-scheme points). Come back and answer without the scaffold to earn Independent Proof."
                : "Guided attempt recorded. Include: \(missing.prefix(3).joined(separator: ", "))."
        } else if isPass {
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
        } else {
            nextLevel = .shaky
            feedback = "Almost there (\(matched.count)/\(total) mark-scheme points). Try adding: \(missing.prefix(3).joined(separator: ", "))."
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
            lastUsedAssistance: usedAssistance,
            matchedKeywordsCSV: matched.joined(separator: ","),
            missingKeywordsCSV: missing.joined(separator: ",")
        )

        let eval = QuestionEvaluationResult(
            matchedKeywords: matched,
            missingKeywords: missing,
            coverageFraction: coverage,
            isPass: isPass,
            resultingProofLevel: nextLevel,
            feedbackSummary: feedback
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
