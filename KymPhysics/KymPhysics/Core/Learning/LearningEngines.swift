import Foundation
import GRDB

// The review scheduler (IntervalReviewScheduler), BKTEngine and FSRSRating live in the shared
// KymLearning package. These conformances let the engines read and write the app's GRDB records.
extension FSRSCardRecord: IntervalReviewCard {}
extension BKTSkillRecord: BKTSkill {}

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
