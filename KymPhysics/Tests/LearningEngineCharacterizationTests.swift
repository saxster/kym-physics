import Foundation
import Testing
@testable import KymPhysics

/// Pins every output field of the review scheduler and the BKT engine. A fixed table of cards
/// (new, learning, mature, lapsed, future-dated) goes through every rating at two review times,
/// plus one chained run; a fixed table of skills goes through every correct/assisted pair, plus one
/// chained run. The JSON dump is compared against a committed golden file.
///
/// To regenerate the golden file deliberately: `KYM_RECORD_LEARNING_GOLDEN=1 swift test --filter LearningEngineCharacterization`.
@Suite("Learning engine characterization")
struct LearningEngineCharacterizationTests {
    private static let goldenURL = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .appendingPathComponent("Golden/learning-engines.json")

    private static let day: TimeInterval = 86_400
    private static let t0 = Date(timeIntervalSince1970: 1_793_000_000)

    private struct CardCase: Encodable {
        let label: String
        let rating: Int
        let now: Date
        let input: FSRSCardRecord
        let output: FSRSCardRecord
    }

    private struct SkillCase: Encodable {
        let label: String
        let isCorrect: Bool
        let usedAssistance: Bool
        let now: Date
        let input: BKTSkillRecord
        let output: BKTSkillRecord
    }

    private struct Rating: Encodable {
        let rawValue: Int
        let title: String
    }

    private struct Dump: Encodable {
        let ratings: [Rating]
        let cards: [CardCase]
        let skills: [SkillCase]
    }

    @Test("The scheduler and BKT engine produce the same outputs as the golden file")
    func enginesMatchGolden() throws {
        let dump = try Self.dumpEngines()
        if ProcessInfo.processInfo.environment["KYM_RECORD_LEARNING_GOLDEN"] == "1" {
            try FileManager.default.createDirectory(
                at: Self.goldenURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            try dump.write(to: Self.goldenURL, atomically: true, encoding: .utf8)
        }
        let golden = try String(contentsOf: Self.goldenURL, encoding: .utf8)
        #expect(dump == golden, "Learning engine outputs drifted from Tests/Golden/learning-engines.json")
    }

    // MARK: - Tables

    private static func card(
        _ id: String, stability: Double, difficulty: Double, reps: Int, lapses: Int, state: Int,
        lastReviewOffsetDays: Double?
    ) -> FSRSCardRecord {
        FSRSCardRecord(
            id: id,
            topicCode: "T-\(id)",
            chapterNumber: 3,
            frontPrompt: "front \(id)",
            backAnswer: "back \(id)",
            stability: stability,
            difficulty: difficulty,
            elapsedDays: 0.75,
            scheduledDays: 2,
            reps: reps,
            lapses: lapses,
            state: state,
            dueAt: t0.addingTimeInterval(-0.25 * day),
            lastReviewAt: lastReviewOffsetDays.map { t0.addingTimeInterval($0 * day) }
        )
    }

    private static let cards: [FSRSCardRecord] = [
        card("new", stability: 0, difficulty: 5, reps: 0, lapses: 0, state: 0, lastReviewOffsetDays: nil),
        card("learning", stability: 1.2, difficulty: 4.4, reps: 1, lapses: 0, state: 1, lastReviewOffsetDays: -1),
        card("mature", stability: 12.5, difficulty: 6.1, reps: 6, lapses: 1, state: 2, lastReviewOffsetDays: -13.25),
        card("lapsed", stability: 0.3, difficulty: 9.7, reps: 4, lapses: 3, state: 3, lastReviewOffsetDays: -0.5),
        card("easy-future", stability: 40, difficulty: 1.2, reps: 10, lapses: 0, state: 2, lastReviewOffsetDays: 1)
    ]

    private static func skill(
        _ id: String, pLearned: Double, pTransit: Double, pSlip: Double, pGuess: Double,
        independent: Int, assisted: Int
    ) -> BKTSkillRecord {
        BKTSkillRecord(
            id: id,
            title: "Skill \(id)",
            pLearned: pLearned,
            pTransit: pTransit,
            pSlip: pSlip,
            pGuess: pGuess,
            independentEvidenceCount: independent,
            assistedEvidenceCount: assisted,
            updatedAt: t0.addingTimeInterval(-2 * day)
        )
    }

    private static let skills: [BKTSkillRecord] = [
        skill("floor", pLearned: 0.05, pTransit: 0.1, pSlip: 0.1, pGuess: 0.2, independent: 0, assisted: 0),
        skill("low", pLearned: 0.3, pTransit: 0.1, pSlip: 0.1, pGuess: 0.2, independent: 2, assisted: 1),
        skill("near-cap", pLearned: 0.66, pTransit: 0.3, pSlip: 0.05, pGuess: 0.25, independent: 4, assisted: 3),
        skill("high", pLearned: 0.9, pTransit: 0.15, pSlip: 0.2, pGuess: 0.3, independent: 8, assisted: 0),
        skill("ceiling", pLearned: 0.99, pTransit: 0.4, pSlip: 0.02, pGuess: 0.1, independent: 12, assisted: 5),
        skill("zero-guess", pLearned: 0, pTransit: 0.1, pSlip: 0.1, pGuess: 0, independent: 0, assisted: 0),
        skill("certain-guess", pLearned: 0, pTransit: 0.1, pSlip: 0.1, pGuess: 1, independent: 0, assisted: 0)
    ]

    // MARK: - Dump

    private static func dumpEngines() throws -> String {
        let reviewTimes = [t0, t0.addingTimeInterval(3.7 * day)]
        var cardCases: [CardCase] = []
        for input in cards {
            for now in reviewTimes {
                for rating in FSRSRating.allCases {
                    let output = IntervalReviewScheduler.schedule(card: input, rating: rating, now: now)
                    cardCases.append(CardCase(label: input.id, rating: rating.rawValue, now: now, input: input, output: output))
                }
            }
        }
        var chained = cards[0]
        var chainNow = t0
        for (step, rating) in [FSRSRating.good, .good, .hard, .again, .easy, .good].enumerated() {
            let output = IntervalReviewScheduler.schedule(card: chained, rating: rating, now: chainNow)
            cardCases.append(CardCase(label: "chain-\(step)", rating: rating.rawValue, now: chainNow, input: chained, output: output))
            chained = output
            chainNow = chainNow.addingTimeInterval((output.scheduledDays + 0.3) * day)
        }

        let updateTime = t0.addingTimeInterval(0.6 * day)
        var skillCases: [SkillCase] = []
        for input in skills {
            for isCorrect in [true, false] {
                for usedAssistance in [false, true] {
                    let output = BKTEngine.update(skill: input, isCorrect: isCorrect, usedAssistance: usedAssistance, now: updateTime)
                    skillCases.append(SkillCase(
                        label: input.id, isCorrect: isCorrect, usedAssistance: usedAssistance,
                        now: updateTime, input: input, output: output
                    ))
                }
            }
        }
        var tracked = skills[1]
        var trackNow = t0
        let events: [(Bool, Bool)] = [(true, true), (true, false), (false, false), (true, true), (true, false), (true, false), (false, true)]
        for (step, event) in events.enumerated() {
            trackNow = trackNow.addingTimeInterval(day)
            let output = BKTEngine.update(skill: tracked, isCorrect: event.0, usedAssistance: event.1, now: trackNow)
            skillCases.append(SkillCase(
                label: "chain-\(step)", isCorrect: event.0, usedAssistance: event.1,
                now: trackNow, input: tracked, output: output
            ))
            tracked = output
        }

        let dump = Dump(
            ratings: FSRSRating.allCases.map { Rating(rawValue: $0.rawValue, title: $0.title) },
            cards: cardCases,
            skills: skillCases
        )
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .secondsSince1970
        let data = try encoder.encode(dump)
        return String(decoding: data, as: UTF8.self) + "\n"
    }
}
