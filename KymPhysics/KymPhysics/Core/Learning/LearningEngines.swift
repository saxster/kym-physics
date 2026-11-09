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


// MARK: - Brilliant-Style Visual Intuition → "Aha!" Invariant → Symbolic Formula Bridge

struct PhysicsFormulaTermMapping: Identifiable, Codable, Hashable, Sendable {
    var id: String { symbol }
    let symbol: String
    let visualPart: String
    let meaning: String
    let colorRole: String // "accent" | "success" | "warning" | "secondary"
}

struct PhysicsIntuitionFormulaBridge: Codable, Hashable, Sendable {
    let chapterNumber: Int
    let concreteAction: String
    let ahaInvariant: String
    let formulaDisplay: String
    let atlasFigureRef: String
    let termMappings: [PhysicsFormulaTermMapping]

    /// Generates an interactive "What happens if...?" perturbation question for a selected term chip.
    func perturbationPrompt(for term: PhysicsFormulaTermMapping) -> String {
        "Perturbation Check: If you double \(term.symbol) (\(term.visualPart.lowercased())) while holding the other quantities fixed, how does the physical system respond?"
    }

    /// Explains how perturbing a specific term scales the physical relationship and why.
    func perturbationExplanation(for term: PhysicsFormulaTermMapping) -> String {
        let sym = term.symbol.trimmingCharacters(in: .whitespacesAndNewlines)
        if formulaDisplay.contains("²") && (formulaDisplay.contains("\(sym)²") || sym.contains("²")) {
            return "Square-law scaling: Because \(sym) appears squared in \(formulaDisplay), doubling \(term.visualPart.lowercased()) multiplies its effect by 2² = 4×."
        } else if formulaDisplay.contains("/ \(sym)") || formulaDisplay.contains("/\(sym)") || formulaDisplay.contains("÷ \(sym)") {
            return "Inverse scaling: Because \(sym) sits in the denominator of \(formulaDisplay), doubling \(term.visualPart.lowercased()) spreads the effect across twice the denominator and halves the result."
        } else {
            return "Direct physical coupling: \(sym) (\(term.meaning)) scales \(formulaDisplay) in direct proportion inside \(term.visualPart.lowercased())."
        }
    }
}

enum PhysicsIntuitionBridgeCatalog {
    static let allBridges: [PhysicsIntuitionFormulaBridge] = [
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 0,
            concreteAction: "Pace out the length of a Mumbai local train platform in footsteps, then time a passing fast train with your wristwatch.",
            ahaInvariant: "Every physical law compares measurements expressed in consistent base SI units (m, kg, s, A) and orders of magnitude (10ⁿ).",
            formulaDisplay: "x = M × 10ⁿ (SI Base Units: m, kg, s)",
            atlasFigureRef: "Powers-of-Ten Scale Slider & SI Unit Converter",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "M", visualPart: "Significant Mantissa (1 ≤ M < 10)", meaning: "Precision measured by your instrument", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "10ⁿ", visualPart: "Order-of-Magnitude Step", meaning: "How many powers of ten above or below 1 metre/second", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "SI", visualPart: "Dimensional Unit Tag", meaning: "Guarantees both sides of an equation represent the same physical quantity", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 1,
            concreteAction: "Watch the speedometer of a BEST bus climb steadily from u to v while plotting its velocity against stopwatch ticks.",
            ahaInvariant: "On any velocity-time graph, the slope is acceleration (Δv / Δt) and the shaded area underneath is the exact distance travelled.",
            formulaDisplay: "v = u + a · t   &   s = u · t + ½ · a · t²",
            atlasFigureRef: "Velocity-Time Area & Slope Kinematics Lab",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "u", visualPart: "Baseline Rectangle Height", meaning: "Initial velocity at t = 0 s", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "a", visualPart: "Ramp Slope (Δv / Δt)", meaning: "Rate of change of velocity in m/s²", colorRole: "warning"),
                PhysicsFormulaTermMapping(symbol: "t²", visualPart: "Growing Triangle Area", meaning: "Time affects both how fast you get and how long you travel at that higher speed", colorRole: "success")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 2,
            concreteAction: "Pull a heavy luggage trolley across Dadar station: compare the forward pull arrow against the backward floor friction arrow.",
            ahaInvariant: "Motion changes only when forces are unbalanced — acceleration equals the net vector sum ΣF divided by inertial mass m.",
            formulaDisplay: "a = F_net / m = (F_drive - F_drag) / m",
            atlasFigureRef: "Free-Body Vector Tug-of-War Sandbox",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "F_net", visualPart: "Unbalanced Resultant Arrow", meaning: "Vector sum of all pushes, pulls, and friction in Newtons", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "m", visualPart: "Inertial Mass Block", meaning: "Resistance of matter to changing its velocity (kg)", colorRole: "warning"),
                PhysicsFormulaTermMapping(symbol: "a", visualPart: "Velocity Change Rate", meaning: "Resulting acceleration in the direction of F_net (m/s²)", colorRole: "success")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 3,
            concreteAction: "Push open a heavy classroom door near the handle vs near the hinges, or balance two different weights on a playground seesaw.",
            ahaInvariant: "A force's turning effect (moment) grows with perpendicular distance from the pivot; balance requires clockwise moment = anticlockwise moment.",
            formulaDisplay: "M = F × d   (Equilibrium: F₁ · d₁ = F₂ · d₂)",
            atlasFigureRef: "Seesaw Torque & Biceps Lever Fulcrum Lab",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "F", visualPart: "Downward Weight / Pull Arrow", meaning: "Applied force in Newtons (N)", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "d", visualPart: "Perpendicular Lever Arm", meaning: "Distance from the pivot/fulcrum to the line of action (m)", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "M", visualPart: "Pivot Twist Arc", meaning: "Turning moment in Newton-metres (N·m)", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 4,
            concreteAction: "Whirl a ball on a string overhead: feel how the inward string tension spikes when you spin it twice as fast.",
            ahaInvariant: "Moving in a circle at constant speed still means constantly changing velocity direction toward the centre.",
            formulaDisplay: "F_c = m · v² / r",
            atlasFigureRef: "Circular Orbit & Centripetal Tension Vector Lab",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "v²", visualPart: "Tangential Speed Arrow", meaning: "Doubling speed quadruples the inward force needed to bend the path", colorRole: "warning"),
                PhysicsFormulaTermMapping(symbol: "r", visualPart: "Turn Radius Circle", meaning: "Tighter curves (smaller r) demand sharper inward force", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "F_c", visualPart: "Inward Centre-Seeking Pull", meaning: "Centripetal force supplied by gravity, friction, or tension (N)", colorRole: "accent")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 5,
            concreteAction: "Release a rollercoaster car from the top of a track and watch its gravitational height bar pour directly into its speed bar.",
            ahaInvariant: "Total energy in a closed system never vanishes — work done by a force transfers energy joule-for-joule between stores.",
            formulaDisplay: "E_p = m · g · h   ⇄   E_k = ½ · m · v²",
            atlasFigureRef: "Rollercoaster Energy Store Bar-Chart Sandbox",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "h", visualPart: "Track Elevation Above Baseline", meaning: "Vertical height storing gravitational potential energy (m)", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "v²", visualPart: "Speedometer Squared Readout", meaning: "Kinetic energy grows with the square of speed", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "m", visualPart: "Cart Mass (Cancels in Free Fall!)", meaning: "Appears on both sides, so drop speed is independent of mass", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 6,
            concreteAction: "Press a drawing pin into noticeboard cork: the flat thumb-head feels gentle while the tiny sharp tip pierces effortlessly with the same force.",
            ahaInvariant: "Pressure measures how concentrated a force is per unit area; in fluids and gases, particle collisions transmit pressure in all directions.",
            formulaDisplay: "P = F / A   &   P_fluid = ρ · g · h",
            atlasFigureRef: "Bed-of-Nails Solid Pressure & Syringe Gas Particle Lab",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "F", visualPart: "Total Normal Push", meaning: "Perpendicular force applied across the surface (N)", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "A", visualPart: "Contact Footprint Patch", meaning: "Surface area in m² (shrinking A spikes pressure P)", colorRole: "warning"),
                PhysicsFormulaTermMapping(symbol: "P", visualPart: "Force Concentration Heatmap", meaning: "Pressure in Pascals (1 Pa = 1 N/m²)", colorRole: "success")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 7,
            concreteAction: "Lower an irregular brass statue into a water cylinder and compare its mass on a balance against the volume of water it pushes aside.",
            ahaInvariant: "Density is an intrinsic fingerprint of how tightly mass is packed into volume; objects float when ρ_object < ρ_fluid.",
            formulaDisplay: "ρ = m / V = m / (V_final - V_initial)",
            atlasFigureRef: "Archimedes Displacement & Particle Packing Tank",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "m", visualPart: "Total Particle Mass", meaning: "Mass measured on a top-pan balance (g or kg)", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "V", visualPart: "Displaced Water Rise (ΔV)", meaning: "3D space occupied by the object (cm³ or m³)", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "ρ", visualPart: "Lattice Packing Tightness", meaning: "Density in g/cm³ or kg/m³", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 8,
            concreteAction: "Feel the afternoon Arabian Sea breeze at Marine Drive: land heats up faster than seawater because water has a huge specific heat capacity.",
            ahaInvariant: "Temperature measures average kinetic energy per particle; thermal energy (heat) depends on total mass, material capacity c, and ΔT.",
            formulaDisplay: "Q = m · c · ΔT",
            atlasFigureRef: "Monsoon Sea-Breeze Convection & Specific Heat Lab",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "m", visualPart: "Total Substance Mass", meaning: "Twice the mass of water needs twice the joules for the same ΔT", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "c", visualPart: "Thermal Bucket Size", meaning: "Specific heat capacity — joules needed per kg per °C", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "ΔT", visualPart: "Thermometer Climb (T_f - T_i)", meaning: "Change in temperature, never the raw starting reading", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 9,
            concreteAction: "Pluck a tanpura string and watch the oscilloscope trace: higher pitch packs more wave cycles per second, while louder sound raises crest height.",
            ahaInvariant: "Wave speed is set by the medium, so frequency and wavelength trade off inversely: v = f · λ.",
            formulaDisplay: "v = f · λ   (T = 1 / f)",
            atlasFigureRef: "Oscilloscope Pitch/Loudness & Wave Tank Simulator",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "f", visualPart: "Oscillations per Second (Pitch)", meaning: "Frequency in Hertz (Hz = s⁻¹)", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "λ", visualPart: "Crest-to-Crest Spacing", meaning: "Wavelength in metres (m)", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "v", visualPart: "Wavefront Propagation Speed", meaning: "Speed of sound/wave set by the medium (m/s)", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 10,
            concreteAction: "Shine a laser pointer onto a plane mirror and into a glass block, always measuring angles from the dashed 90° normal line.",
            ahaInvariant: "Light reflects at equal angles to the normal (θ_i = θ_r) and bends toward the normal when slowing down in a denser medium.",
            formulaDisplay: "θ_i = θ_r (from Normal)   &   n₁ · sin(θ₁) = n₂ · sin(θ₂)",
            atlasFigureRef: "Optical Bench Ray Tracer & RGB Colour Prism",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "θ_i", visualPart: "Incident Wedge to 90° Normal", meaning: "90° minus the glancing surface angle", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "n", visualPart: "Optical Slowdown Factor (c / v)", meaning: "Refractive index of glass/water relative to air", colorRole: "warning"),
                PhysicsFormulaTermMapping(symbol: "θ₂", visualPart: "Refracted Ray Bend", meaning: "Bends toward the normal when entering higher n", colorRole: "success")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 11,
            concreteAction: "Send water ripples through a narrow harbour gap or shine laser light through two slits to see bright and dark interference fringes.",
            ahaInvariant: "Waves superpose: when two crests arrive in step they reinforce (constructive); crest-on-trough cancels to darkness (destructive).",
            formulaDisplay: "Δx = m · λ   (Constructive)   &   c = f · λ",
            atlasFigureRef: "Double-Slit Wave Interference & EM Spectrum Explorer",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "Δx", visualPart: "Path Difference Between Two Rays", meaning: "Extra distance one wave travels to reach the screen", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "λ", visualPart: "Single Wavelength Step", meaning: "Whole-wavelength steps keep crests locked in phase", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "m", visualPart: "Fringe Order Integer (0, ±1, ±2…)", meaning: "Counts how many full wavelengths offset the two paths", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 12,
            concreteAction: "Build a torch circuit with a battery, ammeter, and nichrome wire: adding cells boosts push (V), while longer wire adds resistance (R).",
            ahaInvariant: "Charge is conserved at every junction, and current through a conductor is proportional to voltage divided by resistance.",
            formulaDisplay: "I = V / R   &   P = V · I",
            atlasFigureRef: "Series/Parallel Circuit Builder & Ohm's Law Bench",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "V", visualPart: "Battery Potential Push", meaning: "Energy transferred per coulomb of charge (Volts)", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "R", visualPart: "Lattice Collision Bottleneck", meaning: "Electrical resistance opposing charge flow (Ohms Ω)", colorRole: "warning"),
                PhysicsFormulaTermMapping(symbol: "I", visualPart: "Ammeter Charge Flow Rate", meaning: "Current in Amperes (coulombs per second)", colorRole: "success")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 13,
            concreteAction: "Wind insulated copper wire around a soft-iron nail, connect a variable DC supply, and count how many steel paperclips the nail lifts.",
            ahaInvariant: "Moving electric charges create magnetic fields: solenoid strength grows with coil turns (N), current (I), and a soft-iron core.",
            formulaDisplay: "B ∝ μ_core · N · I   &   F_motor = B · I · L",
            atlasFigureRef: "Electromagnet Crane & DC Motor Commutator Lab",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "N", visualPart: "Number of Solenoid Loops", meaning: "Each turn adds its magnetic field lines down the core", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "I", visualPart: "Coil Current Slider (A)", meaning: "Stronger current magnetises the domains more intensely", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "μ_core", visualPart: "Soft-Iron Core Material", meaning: "Multiplies field strength while still demagnetising when switched off", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 14,
            concreteAction: "Carry a tilted globe around a lamp: notice how Mumbai's summer happens when the Northern Hemisphere tilts toward the Sun, not because Earth is closer.",
            ahaInvariant: "Earth's 23.5° axial tilt stays pointed at Polaris all year, changing sunlight angle and day length across the orbit.",
            formulaDisplay: "I_surface = I₀ · sin(α_sun)   (Axial Tilt = 23.5°)",
            atlasFigureRef: "23.5° Axial Tilt Seasons & Lunar Phase Orbit Simulator",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "α_sun", visualPart: "Solar Altitude Angle Above Horizon", meaning: "High overhead sun concentrates energy onto a small footprint", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "I₀", visualPart: "Incoming Solar Beam Flux", meaning: "Top-of-atmosphere solar power before geometric spreading", colorRole: "success"),
                PhysicsFormulaTermMapping(symbol: "23.5°", visualPart: "Fixed Spin-Axis Tilt", meaning: "Causes opposite seasons in Northern and Southern hemispheres", colorRole: "warning")
            ]
        ),
        PhysicsIntuitionFormulaBridge(
            chapterNumber: 15,
            concreteAction: "Hold a square card 1 m from a point lamp, then move to 2 m and 3 m: the shadow covers 4 squares at 2 m and 9 squares at 3 m.",
            ahaInvariant: "Both gravity and starlight spread out over spheres of area 4πr², obeying an inverse-square law (1/r²) across cosmic distances.",
            formulaDisplay: "F_g = G · m₁ · m₂ / r²   &   I = L / (4 · π · r²)",
            atlasFigureRef: "Inverse-Square Sphere & Exoplanet Transit Light-Curve Lab",
            termMappings: [
                PhysicsFormulaTermMapping(symbol: "r²", visualPart: "Expanding Spherical Shell (4πr²)", meaning: "Tripling distance spreads flux/gravity over 3² = 9× the area", colorRole: "warning"),
                PhysicsFormulaTermMapping(symbol: "m₁·m₂", visualPart: "Interacting Gravitational Masses", meaning: "Both bodies pull on each other with equal and opposite force", colorRole: "accent"),
                PhysicsFormulaTermMapping(symbol: "I", visualPart: "Detector Brightness Patch", meaning: "Apparent brightness in W/m² arriving at telescope", colorRole: "success")
            ]
        )
    ]

    static func bridge(for chapterNumber: Int) -> PhysicsIntuitionFormulaBridge {
        allBridges.first(where: { $0.chapterNumber == chapterNumber }) ?? allBridges[0]
    }
}

extension MovingWorldChapter {
    var intuitionToFormula: PhysicsIntuitionFormulaBridge {
        PhysicsIntuitionBridgeCatalog.bridge(for: number)
    }
}

// MARK: - Concreteness Fading Progression (Concrete Phenomenon → Diagram → Symbolic Law)

enum ConcretenessFadingStage: String, CaseIterable, Codable, Sendable {
    case concrete = "Concrete Phenomenon"
    case pictorial = "Vector / Ray / Field Diagram"
    case abstractSymbolic = "Symbolic Law & SI Proof"

    var subtitle: String {
        switch self {
        case .concrete:
            return "Manipulate the physical setup and observe what changes before touching a formula."
        case .pictorial:
            return "Translate the physical action into a labelled free-body, ray, or field diagram."
        case .abstractSymbolic:
            return "Compress the invariant into symbolic physics notation with full SI units."
        }
    }

    var badgeIcon: String {
        switch self {
        case .concrete: return "hand.tap.fill"
        case .pictorial: return "arrow.up.right.and.arrow.down.left.rectangle"
        case .abstractSymbolic: return "function"
        }
    }
}

enum ConcretenessFadingEngine {
    static func recommendedStage(forProofMode proofMode: Int, proofLevel: QuestionProofLevel = .unseen) -> ConcretenessFadingStage {
        if proofLevel.isIndependentProof || proofMode >= 2 {
            return .abstractSymbolic
        }
        switch proofMode {
        case 0:
            return .concrete
        case 1:
            return .pictorial
        default:
            return .abstractSymbolic
        }
    }

    static func stagePrompt(for stage: ConcretenessFadingStage, unitTitle: String) -> String {
        switch stage {
        case .concrete:
            return "Concrete Stage (\(unitTitle)): Slide the physical controls below and watch how the live measurement responds before writing an equation."
        case .pictorial:
            return "Diagram Stage (\(unitTitle)): Match each physical arrow or ray on the diagram to the blank in the faded derivation."
        case .abstractSymbolic:
            return "Symbolic Stage (\(unitTitle)): State the governing formula, substitute SI values with units, and justify why the law holds."
        }
    }
}

// MARK: - Interactive Physics Manipulative Sandbox Engine

enum PhysicsManipulativeKind: String, CaseIterable, Codable, Sendable {
    case leverMomentBalance = "Seesaw Moments & Pressure Balance"
    case rayNormalRefraction = "Optical Normal & Wave Bench"
    case electromagnetSolenoidField = "Electromagnet Solenoid & Circuit Rig"
}

struct PhysicsManipulativeSpec: Sendable, Equatable {
    let kind: PhysicsManipulativeKind
    let title: String
    let instruction: String
    let primaryLabel: String
    let primaryRange: ClosedRange<Double>
    let primaryStep: Double
    let defaultPrimary: Double
    let secondaryLabel: String
    let secondaryRange: ClosedRange<Double>
    let secondaryStep: Double
    let defaultSecondary: Double
    let targetInvariantHint: String
}

struct PhysicsManipulativeState: Sendable, Equatable {
    var primaryValue: Double
    var secondaryValue: Double
    var ironCoreInserted: Bool = true
}

enum PhysicsManipulativeEngine {
    /// Maps any Cambridge Lower Secondary Science 8 question or unit to its interactive physical manipulative.
    static func spec(for question: SchoolScienceQuestion, unitNumber: Int? = nil) -> PhysicsManipulativeSpec {
        let text = (question.bookSection + " " + question.prompt + " " + question.workedExample).lowercased()
        let unit = unitNumber ?? question.unitNumber

        if unit == 6 || text.contains("mirror") || text.contains("normal") || text.contains("refract") || text.contains("ray") || text.contains("prism") || text.contains("spectrum") || text.contains("wavelength") || text.contains("galaxy") || text.contains("asteroid") {
            return PhysicsManipulativeSpec(
                kind: .rayNormalRefraction,
                title: "Optical Normal & Refraction Ray Bench",
                instruction: "Drag the glancing angle to the mirror/glass surface and the medium refractive index n. Watch how θ_i = 90° - θ_surface is always measured from the 90° normal!",
                primaryLabel: "Angle to Mirror/Boundary Surface (°)",
                primaryRange: 10...80,
                primaryStep: 5,
                defaultPrimary: 35,
                secondaryLabel: "Medium Refractive Index (n)",
                secondaryRange: 1.0...2.0,
                secondaryStep: 0.1,
                defaultSecondary: 1.5,
                targetInvariantHint: "Angles in optics are ALWAYS measured from the 90° normal: θ_i = 90° - θ_surface, and higher n bends rays toward the normal."
            )
        } else if unit == 9 || unit == 2 || unit == 8 || text.contains("electromagnet") || text.contains("magnet") || text.contains("coil") || text.contains("solenoid") || text.contains("current") || text.contains("paperclip") || text.contains("iron") || text.contains("compass") {
            return PhysicsManipulativeSpec(
                kind: .electromagnetSolenoidField,
                title: "Electromagnet Solenoid & Core Sandbox",
                instruction: "Adjust coil turns (N), electric current (I), and toggle the soft-iron core to test how magnetic field strength and paperclip lift scale.",
                primaryLabel: "Number of Coil Turns (N)",
                primaryRange: 10...80,
                primaryStep: 10,
                defaultPrimary: 40,
                secondaryLabel: "Coil Current I (Amperes)",
                secondaryRange: 0.5...4.0,
                secondaryStep: 0.5,
                defaultSecondary: 2.0,
                targetInvariantHint: "Field strength scales with amp-turns (N × I) and soft-iron core permeability; soft iron demagnetises cleanly when current switches off."
            )
        } else {
            return PhysicsManipulativeSpec(
                kind: .leverMomentBalance,
                title: "Moments, Speed & Pressure Balance Bench",
                instruction: "Slide the applied Force (N) and Lever Arm / Area / Time to test turning moments (M = F × d), pressure (P = F / A), and speed (v = d / t).",
                primaryLabel: "Applied Force F / Distance (N or m)",
                primaryRange: 50...600,
                primaryStep: 25,
                defaultPrimary: 300,
                secondaryLabel: "Lever Arm d / Contact Area / Time",
                secondaryRange: 0.5...4.0,
                secondaryStep: 0.25,
                defaultSecondary: 1.5,
                targetInvariantHint: "Moment M = F × d multiplies force by perpendicular pivot distance; Pressure P = F ÷ A divides force by contact area."
            )
        }
    }

    static func liveSummary(spec: PhysicsManipulativeSpec, state: PhysicsManipulativeState) -> String {
        switch spec.kind {
        case .leverMomentBalance:
            let moment = state.primaryValue * state.secondaryValue
            let pressureOrRatio = state.primaryValue / max(state.secondaryValue, 0.01)
            return String(
                format: "Moment M = F × d = %.0f × %.2f = %.1f N·m  |  Ratio (F ÷ A or d ÷ t) = %.1f",
                state.primaryValue,
                state.secondaryValue,
                moment,
                pressureOrRatio
            )
        case .rayNormalRefraction:
            let surfaceAngle = state.primaryValue
            let thetaI = max(0, 90.0 - surfaceAngle)
            let thetaR = thetaI
            let n = max(1.0, state.secondaryValue)
            let sinRefracted = min(1.0, sin(thetaI * .pi / 180.0) / n)
            let thetaRefracted = asin(sinRefracted) * 180.0 / .pi
            return String(
                format: "θ_surface = %.0f° ⇒ Angle to Normal θ_i = 90° - %.0f° = %.0f° | Reflected θ_r = %.0f° | Refracted in n=%.1f: θ₂ = %.1f°",
                surfaceAngle,
                surfaceAngle,
                thetaI,
                thetaR,
                n,
                thetaRefracted
            )
        case .electromagnetSolenoidField:
            let ampTurns = state.primaryValue * state.secondaryValue
            let coreFactor = state.ironCoreInserted ? 1.0 : 0.25
            let clips = Int((ampTurns * 0.35 * coreFactor).rounded())
            let coreName = state.ironCoreInserted ? "Soft-Iron Core (temporary magnet)" : "Air Core (weak field)"
            return String(
                format: "Amp-Turns = %.0f turns × %.1f A = %.0f A·turns (%@) ⇒ Lifts ~%d paperclips",
                state.primaryValue,
                state.secondaryValue,
                ampTurns,
                coreName,
                clips
            )
        }
    }

    private static func inferUnit(from questionId: String) -> Int? {
        let lower = questionId.lowercased()
        for u in 1...9 {
            if lower.contains("u\(u)") || lower.contains("unit\(u)") || lower.contains("u0\(u)") {
                return u
            }
        }
        return nil
    }
}

// MARK: - Non-Leaking Faded Step Evaluator (Replaces Answer Leak in Stage 2)

struct PhysicsFadedStepEvaluation: Sendable, Equatable {
    let isComplete: Bool
    let matchedCount: Int
    let totalCount: Int
    let feedback: String
    let nextNudge: String
}

enum PhysicsFadedStepEvaluator {
    /// Evaluates the student's Stage 2 Faded Blank attempt against `expectedFadedAnswer` WITHOUT leaking the target string.
    static func evaluateFadedStep(
        studentInput: String,
        expectedFadedAnswer: String,
        workedHint: String
    ) -> PhysicsFadedStepEvaluation {
        let trimmed = studentInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return PhysicsFadedStepEvaluation(
                isComplete: false,
                matchedCount: 0,
                totalCount: 1,
                feedback: "Fill in the missing physical terms, numbers, or units for the blank(s) first.",
                nextNudge: "Check the structure of the faded prompt and identify what physical quantity or unit belongs in each blank."
            )
        }

        let targetTokens = extractKeyTokens(from: expectedFadedAnswer)
        guard !targetTokens.isEmpty else {
            let passed = trimmed.count >= 3
            return PhysicsFadedStepEvaluation(
                isComplete: passed,
                matchedCount: passed ? 1 : 0,
                totalCount: 1,
                feedback: passed ? "Step verified! Now advance to Stage 3 (Independent Proof) to write the full argument from memory." : "Add the missing physical term to complete the blank.",
                nextNudge: "Re-read the faded line and supply the missing concept."
            )
        }

        let normalizedStudent = trimmed.lowercased()
        let matched = targetTokens.filter { token in
            normalizedStudent.contains(token)
        }
        let ratio = Double(matched.count) / Double(targetTokens.count)
        let isComplete = ratio >= 0.65 || (targetTokens.count >= 3 && matched.count >= 2)

        if isComplete {
            return PhysicsFadedStepEvaluation(
                isComplete: true,
                matchedCount: matched.count,
                totalCount: targetTokens.count,
                feedback: "Faded step verified (\(matched.count)/\(targetTokens.count) key physical anchors matched)! Advance to Stage 3 (Independent Proof).",
                nextNudge: "Close the scaffold and write the complete explanation or calculation in Stage 3."
            )
        } else {
            let missingCount = max(1, targetTokens.count - matched.count)
            return PhysicsFadedStepEvaluation(
                isComplete: false,
                matchedCount: matched.count,
                totalCount: targetTokens.count,
                feedback: "You matched \(matched.count) of \(targetTokens.count) key anchors in the faded blanks (\(missingCount) still missing).",
                nextNudge: "Check both the numerical relationship and the precise scientific vocabulary (e.g. normal, moment, pivot, anomalous, poles, collision)."
            )
        }
    }

    private static func extractKeyTokens(from expected: String) -> [String] {
        let stopwords: Set<String> = [
            "the", "and", "for", "with", "that", "this", "from", "into", "when", "than", "then", "they", "their", "have", "will", "are", "was", "were"
        ]
        let raw = expected.lowercased()
            .components(separatedBy: CharacterSet.alphanumerics.inverted)
            .filter { !$0.isEmpty }
        var seen = Set<String>()
        var result: [String] = []
        for token in raw {
            let isNumber = token.rangeOfCharacter(from: .decimalDigits) != nil
            if (isNumber || token.count >= 3) && !stopwords.contains(token) && !seen.contains(token) {
                seen.insert(token)
                result.append(token)
            }
        }
        return result
    }
}

// MARK: - Brilliant-Style Elaborative Interrogation ("Why Does This Law Work?")

struct ElaborativeInterrogationPrompt: Sendable, Equatable {
    let questionPrompt: String
    let options: [String]
    let correctIndex: Int
    let explanation: String
}

enum ElaborativeInterrogationEngine {
    static func prompt(for question: SchoolScienceQuestion) -> ElaborativeInterrogationPrompt {
        let text = (question.bookSection + " " + question.prompt + " " + question.workedExample).lowercased()

        if text.contains("mirror") || text.contains("normal") || text.contains("refract") || text.contains("ray") || text.contains("prism") || text.contains("light") {
            return ElaborativeInterrogationPrompt(
                questionPrompt: "Why must optical angles always be measured from the 90° normal rather than the mirror or glass surface?",
                options: [
                    "Because the normal defines the unique perpendicular axis to the boundary (even on curved surfaces) and governs how wavefronts slow down or reflect.",
                    "Because protractors can only measure angles starting at 90 degrees.",
                    "Because light rays always travel along the normal line inside glass."
                ],
                correctIndex: 0,
                explanation: "Exactly: a single perpendicular normal line is well-defined at any point on flat or curved boundaries, and wavefront refraction depends on the angle to that perpendicular."
            )
        } else if text.contains("electromagnet") || text.contains("magnet") || text.contains("iron") || text.contains("coil") || text.contains("compass") || text.contains("pole") {
            return ElaborativeInterrogationPrompt(
                questionPrompt: "Why does an electromagnet use a soft-iron core instead of a permanent steel core?",
                options: [
                    "Soft iron concentrates magnetic flux strongly when current flows, but loses its magnetism immediately when current is switched off.",
                    "Soft iron has higher electrical resistance so no current can flow through the copper wire.",
                    "Steel cannot be magnetised by an electric current at all."
                ],
                correctIndex: 0,
                explanation: "Spot on: an electromagnet's superpower is being switchable — soft iron gives high magnetic permeability during operation and demagnetises cleanly when switched off."
            )
        } else if text.contains("moment") || text.contains("pivot") || text.contains("lever") || text.contains("seesaw") || text.contains("pressure") || text.contains("speed") {
            return ElaborativeInterrogationPrompt(
                questionPrompt: "Why must every physical calculation check dimensional balance and perpendicular geometry before plugging in numbers?",
                options: [
                    "Because formulas like M = F × d and P = F / A express physical cause-and-effect (perpendicular leverage or force concentration over area), not arbitrary number combinations.",
                    "Because multiplying all given numbers together always produces the largest mark-scheme score.",
                    "Because units can be ignored until the final sentence."
                ],
                correctIndex: 0,
                explanation: "Right: checking whether increasing the denominator should shrink or grow the outcome catches inverted ratios and unit traps immediately."
            )
        } else {
            return ElaborativeInterrogationPrompt(
                questionPrompt: "Why does scientific reasoning require linking the observable measurement to the underlying particle, field, or force mechanism?",
                options: [
                    "Because a complete scientific proof pairs what changes (the observation) with the conserved physical law or particle mechanism causing it.",
                    "Because repeating the question stem in different words is sufficient for full marks.",
                    "Because anomalous outliers should always be included to make the sample size larger."
                ],
                correctIndex: 0,
                explanation: "Correct: Cambridge Science 8 mark schemes award credit for connecting the macroscopic observation to the underlying physical/particle mechanism."
            )
        }
    }
}

// MARK: - Spot-the-Flaw Misconception Repair Catalog (Triggered on High-Confidence Misses)

struct PhysicsSpotTheFlawItem: Identifiable, Sendable, Equatable {
    let id: String
    let title: String
    let scenario: String
    let steps: [String]
    let flawedStepIndex: Int
    let explanation: String
}

enum PhysicsSpotTheFlawCatalog {
    static let items: [PhysicsSpotTheFlawItem] = [
        PhysicsSpotTheFlawItem(
            id: "flaw-optics-normal",
            title: "Spot the Flaw: Plane Mirror Glancing Angle",
            scenario: "Rohan shines a ray at a plane mirror so the angle between the ray and the mirror surface is 35°. Tap the step where his reasoning goes wrong:",
            steps: [
                "Step 1: The ray makes an angle of 35° with the flat mirror surface.",
                "Step 2: Therefore, the angle of incidence θ_i is 35°.",
                "Step 3: By the law of reflection (θ_i = θ_r), the angle of reflection is equal to θ_i."
            ],
            flawedStepIndex: 1,
            explanation: "Step 2 is the flaw! Angle of incidence θ_i is measured from the 90° normal, not the mirror surface: θ_i = 90° - 35° = 55°."
        ),
        PhysicsSpotTheFlawItem(
            id: "flaw-electromagnet-outlier",
            title: "Spot the Flaw: Electromagnet Paperclip Mean",
            scenario: "Ananya tests a 40-turn electromagnet 4 times and records 28, 29, 12, and 27 paperclips. Tap the flawed step in her analysis:",
            steps: [
                "Step 1: Record all four repeat trials for 40 turns: 28, 29, 12, and 27 paperclips.",
                "Step 2: Add all four readings together (28 + 29 + 12 + 27 = 96) and divide by 4 to get a mean of 24 paperclips.",
                "Step 3: Plot the mean number of paperclips against the number of turns on the graph."
            ],
            flawedStepIndex: 1,
            explanation: "Step 2 is the flaw! Trial 3 (12 paperclips) is an anomalous outlier and must be excluded before averaging the remaining 3 concordant readings: (28 + 29 + 27) ÷ 3 = 28."
        ),
        PhysicsSpotTheFlawItem(
            id: "flaw-moments-pressure",
            title: "Spot the Flaw: Seesaw Equilibrium & Pressure Units",
            scenario: "Kabir balances a 300 N weight at 1.8 m from a pivot using a 450 N weight on the other side. Tap the flawed step:",
            steps: [
                "Step 1: Calculate the anticlockwise moment: M₁ = 300 N × 1.8 m = 540 N·m.",
                "Step 2: Since 450 N is 1.5× heavier than 300 N, place the 450 N weight 1.5× farther from the pivot: d₂ = 1.8 m × 1.5 = 2.7 m.",
                "Step 3: Check that clockwise and anticlockwise moments are measured in N·m."
            ],
            flawedStepIndex: 1,
            explanation: "Step 2 is the flaw! Because F₁·d₁ = F₂·d₂, a 1.5× heavier force must sit closer to the pivot: d₂ = 540 N·m ÷ 450 N = 1.2 m."
        )
    ]

    static func item(for question: SchoolScienceQuestion) -> PhysicsSpotTheFlawItem {
        let text = (question.bookSection + " " + question.prompt + " " + question.workedExample).lowercased()
        if text.contains("mirror") || text.contains("normal") || text.contains("refract") || text.contains("ray") || text.contains("light") {
            return items[0]
        } else if text.contains("electromagnet") || text.contains("magnet") || text.contains("paperclip") || text.contains("anomalous") || text.contains("coil") {
            return items[1]
        } else {
            return items[2]
        }
    }
}

// MARK: - Brilliant-Style Interactive Chapter Beat Engine

enum PhysicsChapterBeatKind: String, Codable, Sendable {
    case everydayHook = "Mumbai Hook & Prediction"
    case proseInsight = "Concept Discovery"
    case calloutGate = "Interactive Check Gate"
    case interactiveLabAndFormula = "Visual Bridge & Lab"
    case misconceptionDebate = "Who Is Right & Why?"
    case chapterSynthesis = "Invariant Summary"
}

struct PhysicsChapterBeat: Identifiable, Sendable, Equatable {
    let id: String
    let index: Int
    let totalBeats: Int
    let kind: PhysicsChapterBeatKind
    let title: String
    let narrativeBody: String
    let section: MovingWorldSection?
    let callout: MovingWorldCallout?
    let requiresInteractionToAdvance: Bool

    var spokenScript: String {
        var parts: [String] = ["Beat \(index + 1) of \(totalBeats): \(title).", narrativeBody]
        if let callout {
            parts.append("\(callout.title). \(callout.body)")
        }
        return parts.joined(separator: " ")
    }
}

enum PhysicsChapterBeatEngine {
    /// Decomposes any *Moving World* chapter into a sequence of bite-sized interactive Brilliant/SmartyMe beats.
    static func beats(for chapter: MovingWorldChapter) -> [PhysicsChapterBeat] {
        var rawBeats: [(PhysicsChapterBeatKind, String, String, MovingWorldSection?, MovingWorldCallout?, Bool)] = []

        let predictCallout = chapter.callouts.first(where: { $0.kind == "predict" }) ?? chapter.callouts.first
        let hookText = chapter.hookSummary.isEmpty ? chapter.subtitle : chapter.hookSummary
        rawBeats.append((
            .everydayHook,
            "Ch \(chapter.number) Hook: \(chapter.title)",
            hookText,
            nil,
            predictCallout,
            predictCallout != nil
        ))

        let checkCallouts = chapter.callouts.filter { $0.id != predictCallout?.id }
        for (idx, section) in chapter.sections.prefix(4).enumerated() {
            let pairedCallout = idx < checkCallouts.count ? checkCallouts[idx] : nil
            let body = section.excerpt.isEmpty ? chapter.subtitle : section.excerpt
            rawBeats.append((
                pairedCallout != nil ? .calloutGate : .proseInsight,
                section.heading,
                body,
                section,
                pairedCallout,
                pairedCallout != nil && (pairedCallout?.kind == "check" || pairedCallout?.kind == "predict")
            ))
        }

        let bridge = chapter.intuitionToFormula
        rawBeats.append((
            .interactiveLabAndFormula,
            "Visual Intuition → Formula: \(bridge.formulaDisplay)",
            "\(bridge.concreteAction) → Invariant: \(bridge.ahaInvariant)",
            nil,
            nil,
            false
        ))

        let debate = PhysicsDebateCatalog.scenario(forChapter: chapter.number)
        rawBeats.append((
            .misconceptionDebate,
            "Peer Physics Debate: \(debate.title)",
            "\(debate.speakerAName) vs \(debate.speakerBName) — \(debate.contextPrompt)",
            nil,
            nil,
            true
        ))

        let vocabSummary = chapter.keyTerms.isEmpty
            ? "Lock in the governing law (\(bridge.formulaDisplay)) and test your understanding in the quantitative drill."
            : "Key concepts locked: \(chapter.keyTerms.prefix(6).joined(separator: " · ")). Governing law: \(bridge.formulaDisplay)."
        rawBeats.append((
            .chapterSynthesis,
            "Chapter \(chapter.number) Invariant Synthesis",
            vocabSummary,
            nil,
            nil,
            false
        ))

        let total = rawBeats.count
        return rawBeats.enumerated().map { idx, tuple in
            PhysicsChapterBeat(
                id: "ch\(chapter.number)-beat-\(idx)",
                index: idx,
                totalBeats: total,
                kind: tuple.0,
                title: tuple.1,
                narrativeBody: tuple.2,
                section: tuple.3,
                callout: tuple.4,
                requiresInteractionToAdvance: tuple.5
            )
        }
    }
}

// MARK: - SmartyMe & Brilliant Peer Misconception Debate Engine ("Who Is Right & Why?")

struct PhysicsDebateChoice: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let label: String
    let isCorrect: Bool
    let socraticRebuttal: String
}

struct PhysicsDebateScenario: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let chapterNumber: Int
    let schoolUnitNumber: Int
    let title: String
    let contextPrompt: String
    let speakerAName: String
    let speakerAClaim: String
    let speakerBName: String
    let speakerBClaim: String
    let choices: [PhysicsDebateChoice]
    let invariantTakeaway: String
}

struct PhysicsDebateEvaluation: Sendable, Equatable {
    let isCorrect: Bool
    let feedback: String
    let invariantTakeaway: String
}

enum PhysicsDebateEngine {
    static func evaluate(choiceId: String, in scenario: PhysicsDebateScenario) -> PhysicsDebateEvaluation {
        guard let choice = scenario.choices.first(where: { $0.id == choiceId }) else {
            return PhysicsDebateEvaluation(
                isCorrect: false,
                feedback: "Select which classmate's physical reasoning holds up.",
                invariantTakeaway: scenario.invariantTakeaway
            )
        }
        return PhysicsDebateEvaluation(
            isCorrect: choice.isCorrect,
            feedback: choice.socraticRebuttal,
            invariantTakeaway: scenario.invariantTakeaway
        )
    }
}

enum PhysicsDebateCatalog {
    static let allScenarios: [PhysicsDebateScenario] = [
        PhysicsDebateScenario(
            id: "debate-ch00-units",
            chapterNumber: 0,
            schoolUnitNumber: 3,
            title: "Fast Local Train: 72 km/h vs 25 m/s",
            contextPrompt: "Aarav and Zoya compare a Mumbai local train travelling at 72 km/h with a gust of monsoon wind moving at 25 m/s.",
            speakerAName: "Aarav",
            speakerAClaim: "72 is much bigger than 25, so the 72 km/h train is moving nearly three times faster than the 25 m/s wind!",
            speakerBName: "Zoya",
            speakerBClaim: "You can't compare raw numbers with different units! 72 km/h ÷ 3.6 = 20 m/s, so the 25 m/s wind is actually faster.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Aarav is right — 72 is greater than 25.",
                    isCorrect: false,
                    socraticRebuttal: "Careful! 1 km/h is a much smaller speed unit than 1 m/s because 1 hour is 3600 seconds. Always convert to the same SI unit first."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Zoya is right — converting 72 km/h ÷ 3.6 gives 20 m/s, which is slower than 25 m/s.",
                    isCorrect: true,
                    socraticRebuttal: "Spot on! 72,000 m ÷ 3600 s = 20 m/s. Once both speeds are in m/s, 25 m/s beats 20 m/s."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Both are moving at the exact same speed once converted.",
                    isCorrect: false,
                    socraticRebuttal: "Check the division: 72 ÷ 3.6 = 20 m/s, whereas the wind is 25 m/s (which is 90 km/h)."
                )
            ],
            invariantTakeaway: "Physical quantities can only be compared or added when expressed in identical SI units (1 m/s = 3.6 km/h)."
        ),
        PhysicsDebateScenario(
            id: "debate-ch01-vt-graph",
            chapterNumber: 1,
            schoolUnitNumber: 3,
            title: "Horizontal Line on a Velocity-Time Graph",
            contextPrompt: "Kabir and Meera inspect a velocity-time graph where a cyclist's line is flat and horizontal at v = 8 m/s from t = 2 s to t = 10 s.",
            speakerAName: "Kabir",
            speakerAClaim: "Because the graph line is completely flat, the cyclist has stopped and is standing still at the 8 m mark.",
            speakerBName: "Meera",
            speakerBClaim: "That's a distance-time graph rule! On a velocity-time graph, a flat line at 8 m/s means constant speed with zero acceleration, covering 8 × 8 = 64 m.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Kabir is right — a flat horizontal line always means the object is stationary.",
                    isCorrect: false,
                    socraticRebuttal: "Check the vertical axis label! The y-axis is velocity v (m/s), not distance. At v = 8 m/s, the cyclist moves 8 metres every second."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Meera is right — on a v-t graph, a flat line at 8 m/s means constant velocity (a = 0) and 64 m travelled.",
                    isCorrect: true,
                    socraticRebuttal: "Bravo! Always read the axes first: slope on v-t is acceleration (0 m/s²) and area under the line (8 m/s × 8 s = 64 m) is distance."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "The cyclist is accelerating at 8 m/s².",
                    isCorrect: false,
                    socraticRebuttal: "Acceleration is the slope Δv/Δt. Since velocity stays at 8 m/s without rising, Δv = 0 and acceleration is 0 m/s²."
                )
            ],
            invariantTakeaway: "On a distance-time graph, flat = stationary; on a velocity-time graph, flat at v > 0 = constant speed with zero acceleration."
        ),
        PhysicsDebateScenario(
            id: "debate-ch02-constant-speed-force",
            chapterNumber: 2,
            schoolUnitNumber: 3,
            title: "Does Constant Velocity Require a Net Forward Force?",
            contextPrompt: "A delivery van cruises along the Bandra-Worli Sea Link at a steady 60 km/h against 400 N of air and road drag.",
            speakerAName: "Rohan",
            speakerAClaim: "Since the van is moving forward, the forward engine thrust must be greater than the 400 N drag force.",
            speakerBName: "Ananya",
            speakerBClaim: "No! Because velocity is constant (acceleration = 0), the forward thrust must exactly equal 400 N so the net force is zero.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Rohan is right — forward motion always requires forward force to beat drag.",
                    isCorrect: false,
                    socraticRebuttal: "That's Aristotle's pre-Newtonian trap! If forward thrust beat drag, F_net > 0 would make the van speed up past 60 km/h."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Ananya is right — constant velocity means zero acceleration and balanced forces (F_thrust = 400 N).",
                    isCorrect: true,
                    socraticRebuttal: "Exactly! Newton's First Law guarantees that balanced forces (F_net = 0) keep a moving object cruising at constant velocity."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Neither — at constant speed, the engine exerts 0 N of force.",
                    isCorrect: false,
                    socraticRebuttal: "With 400 N of backward drag present, the engine must supply 400 N forward so the two forces cancel to F_net = 0 N."
                )
            ],
            invariantTakeaway: "Unbalanced net force causes acceleration (change in velocity), not velocity itself; steady cruising means ΣF = 0."
        ),
        PhysicsDebateScenario(
            id: "debate-ch03-seesaw-moments",
            chapterNumber: 3,
            schoolUnitNumber: 3,
            title: "Balancing Unequal Weights on a Seesaw",
            contextPrompt: "On a playground seesaw, Dev (300 N) sits 2.0 m left of the pivot. Priya weighs 600 N (twice as heavy) and wants to balance the beam horizontally.",
            speakerAName: "Dev",
            speakerAClaim: "Since Priya weighs twice as much (600 N), she must sit twice as far from the pivot at 4.0 m.",
            speakerBName: "Priya",
            speakerBClaim: "Wait — moments are F × d! To match Dev's 300 × 2.0 = 600 N·m moment, my 600 N weight must sit at half the distance: 1.0 m.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Dev is right — double the weight needs double the distance (4.0 m).",
                    isCorrect: false,
                    socraticRebuttal: "If 600 N sat at 4.0 m, the clockwise moment would be 2400 N·m vs 600 N·m, slamming Priya's side to the ground!"
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Priya is right — F₁·d₁ = F₂·d₂, so 600 N × 1.0 m = 600 N·m balances 300 N × 2.0 m.",
                    isCorrect: true,
                    socraticRebuttal: "Spot on! For a fixed turning moment, force and perpendicular distance from the pivot are inversely proportional."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Unequal weights can never balance a horizontal seesaw.",
                    isCorrect: false,
                    socraticRebuttal: "They balance whenever their turning moments about the pivot are equal: F₁·d₁ = F₂·d₂."
                )
            ],
            invariantTakeaway: "Principle of Moments: Equilibrium requires clockwise moment (F₂·d₂) = anticlockwise moment (F₁·d₁) about the pivot."
        ),
        PhysicsDebateScenario(
            id: "debate-ch04-circular-release",
            chapterNumber: 4,
            schoolUnitNumber: 3,
            title: "When the String Snaps in Circular Motion",
            contextPrompt: "A hammer-thrower spins a metal ball anticlockwise in a horizontal circle overhead. Suddenly the cable snaps when the ball is at the northernmost point (moving West).",
            speakerAName: "Kabir",
            speakerAClaim: "An outward 'centrifugal force' flings the ball straight North away from the centre of the circle.",
            speakerBName: "Zoya",
            speakerBClaim: "The moment inward tension vanishes, Newton's First Law takes over and the ball flies straight West along the tangent.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Kabir is right — it flies straight outward (North) away from the centre.",
                    isCorrect: false,
                    socraticRebuttal: "There is no outward push acting on the ball! The cable only pulled inward; once cut, F_net horizontal is zero."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Zoya is right — with zero inward force, the ball continues in a straight line along its instantaneous tangent (West).",
                    isCorrect: true,
                    socraticRebuttal: "Exact physics! Sparks off a grinding wheel and mud off a spinning tyre always fly along the straight-line tangent."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "It keeps curving in a wider circle for one more turn.",
                    isCorrect: false,
                    socraticRebuttal: "Curving requires a continuous inward force. The instant the cable snaps, the horizontal path becomes a straight line."
                )
            ],
            invariantTakeaway: "Circular motion requires a continuous inward centripetal force; removing it sends the object straight along the tangent."
        ),
        PhysicsDebateScenario(
            id: "debate-ch05-braking-distance",
            chapterNumber: 5,
            schoolUnitNumber: 3,
            title: "Doubling Speed vs Braking Distance",
            contextPrompt: "A car travelling at 30 km/h needs 10 m of braking distance to stop under maximum tyre friction. What happens to the braking distance if the driver doubles speed to 60 km/h?",
            speakerAName: "Aarav",
            speakerAClaim: "Doubling the speed doubles the braking distance from 10 m to 20 m.",
            speakerBName: "Meera",
            speakerBClaim: "Brakes must remove kinetic energy E_k = ½mv²! Doubling speed quadruples E_k, so braking distance quadruples from 10 m to 40 m.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Aarav is right — 2× speed means 2× braking distance (20 m).",
                    isCorrect: false,
                    socraticRebuttal: "Thinking distance doubles with speed, but braking work W = F_brake × d must cancel E_k = ½mv², which grows with v²!"
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Meera is right — 2× speed means 2² = 4× kinetic energy, requiring 4 × 10 m = 40 m to stop.",
                    isCorrect: true,
                    socraticRebuttal: "Brilliant! Because E_k = ½mv² = F_brake · d, doubling v multiplies stopping distance by 2² = 4."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Braking distance stays 10 m if the brakes apply the same force.",
                    isCorrect: false,
                    socraticRebuttal: "With the same braking force F, 4× as much kinetic energy requires 4× the distance (W = F·d)."
                )
            ],
            invariantTakeaway: "Work-Energy Theorem: F_brake · d = ½mv², so doubling speed quadruples kinetic energy and quadruples braking distance."
        ),
        PhysicsDebateScenario(
            id: "debate-ch06-camel-knife-pressure",
            chapterNumber: 6,
            schoolUnitNumber: 3,
            title: "Why Sharp Knives Cut and Camel Feet Don't Sink",
            contextPrompt: "Rohan and Ananya compare a sharp kitchen knife (tiny blade edge area) with a camel's wide footpad on desert sand.",
            speakerAName: "Rohan",
            speakerAClaim: "A sharp knife increases the force of your hand, while a camel's wide foot reduces the camel's weight.",
            speakerBName: "Ananya",
            speakerBClaim: "Neither changes the force or weight! P = F / A: a tiny blade area concentrates the same force into huge pressure, while a wide foot spreads weight into low pressure.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Rohan is right — sharp blades multiply force and wide feet reduce weight.",
                    isCorrect: false,
                    socraticRebuttal: "Don't confuse force F with pressure P! A camel weighs the same N regardless of shoe size."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Ananya is right — P = F / A holds force constant while changing contact area A inversely with pressure P.",
                    isCorrect: true,
                    socraticRebuttal: "Spot on! Shrinking area A in the denominator of P = F / A magnifies pressure without changing your hand's force."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Pressure equals F × A, so larger area gives larger pressure.",
                    isCorrect: false,
                    socraticRebuttal: "If P = F × A were true, snowshoes would make you sink deeper into snow! Pressure is F ÷ A."
                )
            ],
            invariantTakeaway: "Solid pressure P = F / A is inversely proportional to contact area A for a given perpendicular force F."
        ),
        PhysicsDebateScenario(
            id: "debate-ch07-particle-expansion",
            chapterNumber: 7,
            schoolUnitNumber: 2,
            title: "Why Does a Brass Ball Expand When Heated?",
            contextPrompt: "In the school lab, a heated brass sphere no longer fits through its metal ring gauge until it cools down.",
            speakerAName: "Dev",
            speakerAClaim: "When heated, each individual copper and zinc atom swells up and becomes a bigger atom.",
            speakerBName: "Zoya",
            speakerBClaim: "Atoms themselves stay the same size! Heating increases their kinetic energy, so they vibrate with larger amplitude and push slightly farther apart.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Dev is right — individual atoms expand like tiny balloons when heated.",
                    isCorrect: false,
                    socraticRebuttal: "Classic particle-model trap! Individual atoms/molecules do not grow or shrink during thermal expansion or state changes."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Zoya is right — particle size is invariant; faster thermal vibrations increase the average spacing between atoms.",
                    isCorrect: true,
                    socraticRebuttal: "Exact particle physics! Thermal expansion is an increase in average inter-particle spacing driven by stronger vibrations."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Heat creates extra brass atoms inside the sphere, increasing both mass and volume.",
                    isCorrect: false,
                    socraticRebuttal: "Mass and atom count are strictly conserved during heating; only inter-particle spacing increases (slightly lowering density ρ = m/V)."
                )
            ],
            invariantTakeaway: "In the particle model, atoms/molecules never expand or change mass when heated — only their kinetic energy and spacing change."
        ),
        PhysicsDebateScenario(
            id: "debate-ch08-metal-wood-cold",
            chapterNumber: 8,
            schoolUnitNumber: 2,
            title: "Metal Bench vs Wooden Bench on a Cool Morning",
            contextPrompt: "At 7 AM in an air-conditioned classroom at 20 °C, Kabir touches a steel desk leg and a wooden desktop.",
            speakerAName: "Kabir",
            speakerAClaim: "The steel leg feels freezing cold because metal is at a lower temperature (around 10 °C) than the wood.",
            speakerBName: "Meera",
            speakerBClaim: "A thermometer reads 20 °C for both! Steel is a thermal conductor with free electrons that conduct heat away from your 37 °C skin much faster than wood.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Kabir is right — metals naturally stay several degrees colder than wood in the same room.",
                    isCorrect: false,
                    socraticRebuttal: "Both objects have been in the 20 °C room all night and are in thermal equilibrium at the exact same temperature!"
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Meera is right — both are at 20 °C, but steel's high thermal conductivity drains heat from your 37 °C fingers rapidly.",
                    isCorrect: true,
                    socraticRebuttal: "Spot on! Skin thermoreceptors sense the rate of heat loss, not absolute temperature."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Coldness particles flow from the metal into your hand.",
                    isCorrect: false,
                    socraticRebuttal: "There is no such thing as 'coldness' flowing — thermal energy always flows from hotter (37 °C hand) to cooler (20 °C desk)."
                )
            ],
            invariantTakeaway: "Objects in thermal equilibrium share the same temperature; conductors feel colder below body temperature because they conduct heat out of skin faster."
        ),
        PhysicsDebateScenario(
            id: "debate-ch09-sound-vacuum-amplitude",
            chapterNumber: 9,
            schoolUnitNumber: 6,
            title: "Does Louder Sound Travel Faster in Air?",
            contextPrompt: "During a Mumbai thunderstorm, Aarav and Priya debate whether a deafening thunderclap travels faster through the air than a quiet whisper.",
            speakerAName: "Aarav",
            speakerAClaim: "A louder sound has much more energy, so its wave crests travel through air much faster than a whisper.",
            speakerBName: "Priya",
            speakerBClaim: "Loudness is wave amplitude, not wave speed! In the same air at the same temperature, a shout and a whisper travel at the exact same ~340 m/s.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Aarav is right — higher amplitude pushes the wave forward at higher speed.",
                    isCorrect: false,
                    socraticRebuttal: "If louder notes travelled faster, a concert orchestra heard from the back row would have loud drums arrive before soft violins!"
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Priya is right — amplitude sets loudness while frequency sets pitch; wave speed (~340 m/s) depends only on the medium (air temperature/state).",
                    isCorrect: true,
                    socraticRebuttal: "Exactly! Wave speed is a property of the medium, while amplitude controls loudness and frequency controls pitch."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Higher frequency (higher pitch) notes travel faster through air.",
                    isCorrect: false,
                    socraticRebuttal: "Higher f simply pairs with shorter λ so that v = f·λ remains constant (~340 m/s) in air."
                )
            ],
            invariantTakeaway: "Sound speed depends on the medium (fastest in solids, zero in vacuum); amplitude sets loudness and frequency sets pitch."
        ),
        PhysicsDebateScenario(
            id: "debate-ch10-mirror-refraction",
            chapterNumber: 10,
            schoolUnitNumber: 6,
            title: "Mirror Glancing Angle & Red + Green Stage Spotlights",
            contextPrompt: "A ray of red light and a ray of green light overlap on a white screen after reflecting off a mirror where the ray made a 30° angle with the mirror surface.",
            speakerAName: "Rohan",
            speakerAClaim: "The angle of reflection is 30°, and overlapping red + green light beams make brown/muddy paint colour.",
            speakerBName: "Ananya",
            speakerBClaim: "Angle to the 90° normal is 90° - 30° = 60°, and additive RGB light mixing of Red + Green produces bright Yellow light!",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Rohan is right — θ_r = 30° and red + green makes brown.",
                    isCorrect: false,
                    socraticRebuttal: "Two traps in one! Optical angles are measured from the 90° normal (90° - 30° = 60°), and light mixes additively (R + G = Yellow)."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Ananya is right — θ_i = θ_r = 60° from the normal, and additive Red + Green light stimulates cones to see Yellow.",
                    isCorrect: true,
                    socraticRebuttal: "Double bullseye! Always measure from the 90° normal, and remember RGB additive light mixing: R+G=Yellow, R+B=Magenta, G+B=Cyan, R+G+B=White."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "θ_r = 60°, but red + green light makes cyan.",
                    isCorrect: false,
                    socraticRebuttal: "Green + Blue light makes Cyan; Red + Green light makes Yellow."
                )
            ],
            invariantTakeaway: "Measure optical angles from the 90° normal (θ_i = 90° - θ_surface), and distinguish additive RGB light mixing from subtractive filters."
        ),
        PhysicsDebateScenario(
            id: "debate-ch11-prism-dispersion",
            chapterNumber: 11,
            schoolUnitNumber: 6,
            title: "Why Does Violet Bend More Than Red in a Glass Prism?",
            contextPrompt: "White sunlight enters a triangular glass prism and spreads into the spectrum ROYGBIV. Kabir and Zoya compare the red and violet rays.",
            speakerAName: "Kabir",
            speakerAClaim: "Red light has a longer wavelength, so glass slows it down the most and bends red through the largest angle.",
            speakerBName: "Zoya",
            speakerBClaim: "Higher-frequency violet light slows down slightly more in glass (higher n) than red light, so violet refracts through the largest angle!",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Kabir is right — red bends the most in a glass prism.",
                    isCorrect: false,
                    socraticRebuttal: "Look at any prism diagram: red stays at the top (least deviated) while violet bends sharpest toward the prism base!"
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Zoya is right — violet has higher frequency, slows down more in glass, and refracts through a larger angle than red.",
                    isCorrect: true,
                    socraticRebuttal: "Spot on! Dispersion happens because glass has a slightly higher refractive index n for violet (short λ, high f) than for red (long λ, low f)."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "The prism paints colours onto the white ray without changing wave speed.",
                    isCorrect: false,
                    socraticRebuttal: "Newton proved with a second inverted prism that white light already contains all spectral frequencies; refraction just separates them by speed."
                )
            ],
            invariantTakeaway: "In prism dispersion, violet light (highest frequency, shortest wavelength) slows down most in glass and refracts most; red refracts least."
        ),
        PhysicsDebateScenario(
            id: "debate-ch12-current-consumption",
            chapterNumber: 12,
            schoolUnitNumber: 9,
            title: "Is Electric Current 'Used Up' by a Lamp?",
            contextPrompt: "In a series circuit with a battery, two ammeters A₁ (before the bulb) and A₂ (after the bulb) measure the current flowing through a glowing filament lamp.",
            speakerAName: "Dev",
            speakerAClaim: "Ammeter A₂ after the bulb will read less current than A₁ because the bulb uses up electric current to make light and heat.",
            speakerBName: "Priya",
            speakerBClaim: "Charge is never used up! Every electron entering the bulb leaves it per second, so A₁ = A₂; it is electrical energy (voltage drop) that transfers to light and heat.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Dev is right — current is consumed inside the glowing filament, so A₂ < A₁.",
                    isCorrect: false,
                    socraticRebuttal: "If electrons vanished inside the bulb, charge conservation would be violated! Current is the flow rate of conserved electrons."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Priya is right — current is identical everywhere in a single series loop (A₁ = A₂); energy per charge (V) is what transfers.",
                    isCorrect: true,
                    socraticRebuttal: "Exact circuit physics! Just like water in a closed pipe, the flow rate (current I) is identical before and after the waterwheel."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Current flows out of both terminals of the battery and collides inside the bulb.",
                    isCorrect: false,
                    socraticRebuttal: "Current circulates in a continuous one-way loop around the circuit; energy is transferred as charges pass through the filament's resistance."
                )
            ],
            invariantTakeaway: "Conservation of charge: current I is identical at every point in a series loop; bulbs transfer electrical energy (V), never charge."
        ),
        PhysicsDebateScenario(
            id: "debate-ch13-electromagnet-core",
            chapterNumber: 13,
            schoolUnitNumber: 9,
            title: "Scrapyard Crane: Soft-Iron Core vs Steel Core",
            contextPrompt: "Engineers are choosing the core material for a giant electromagnet crane that lifts scrap cars and drops them into a recycling bay when switched off.",
            speakerAName: "Kabir",
            speakerAClaim: "Use a hard steel core! Steel makes permanent magnets, so it will hold onto the cars forever even when the electricity is turned off.",
            speakerBName: "Meera",
            speakerBClaim: "That would be a disaster — the crane could never drop the scrap! Use a soft-iron core so it magnetises strongly with current and releases immediately when switched off.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Kabir is right — steel is best for an electromagnet core because it stays magnetised permanently.",
                    isCorrect: false,
                    socraticRebuttal: "If the core stayed magnetised after switching off the current, the scrap cars would stay stuck to the crane forever!"
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Meera is right — soft iron provides strong temporary magnetisation and demagnetises as soon as current stops.",
                    isCorrect: true,
                    socraticRebuttal: "100% Cambridge Science 8 Unit 9 mastery! Soft iron's magnetic domains align easily with coil current and relax when current is switched off."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Use a copper or aluminium core because all metals are strongly magnetic.",
                    isCorrect: false,
                    socraticRebuttal: "Watch out! Copper and aluminium are good electrical conductors, NOT magnetic materials (only iron, nickel, cobalt, and steel are ferromagnetic)."
                )
            ],
            invariantTakeaway: "Electromagnets use a soft-iron core (not steel or copper) so the strong magnetic field can be switched cleanly on and off."
        ),
        PhysicsDebateScenario(
            id: "debate-ch14-seasons-tilt",
            chapterNumber: 14,
            schoolUnitNumber: 6,
            title: "What Causes Summer and Winter on Earth?",
            contextPrompt: "Earth is actually closest to the Sun (perihelion) in early January and farthest in July. Aarav and Zoya explain why Mumbai has summer in May and Australia has winter in July.",
            speakerAName: "Aarav",
            speakerAClaim: "Summer happens whenever Earth swings closer to the Sun in its oval orbit, heating the whole planet at once.",
            speakerBName: "Zoya",
            speakerBClaim: "If distance caused seasons, January would be summer worldwide! Seasons happen because Earth's 23.5° tilted axis points one hemisphere toward steeper, longer sunlight while the other tilts away.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Aarav is right — Earth's changing distance to the Sun causes summer and winter.",
                    isCorrect: false,
                    socraticRebuttal: "Disproved by two facts: (1) Northern and Southern hemispheres have opposite seasons at the same time, and (2) Earth is closest to the Sun in January!"
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Zoya is right — Earth's 23.5° axial tilt changes solar altitude angle (beam concentration) and daylight hours across the two hemispheres.",
                    isCorrect: true,
                    socraticRebuttal: "Spot on! Steep overhead sunlight concentrates solar watts onto a smaller patch of ground and shines for more hours per day."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Earth's axis flips back and forth by 47° every six months.",
                    isCorrect: false,
                    socraticRebuttal: "Earth's spin axis stays pointed in the same direction in space (toward Polaris) as Earth orbits the Sun."
                )
            ],
            invariantTakeaway: "Seasons are caused by Earth's constant 23.5° axial tilt changing sunlight angle and day length — why N and S hemispheres have opposite seasons."
        ),
        PhysicsDebateScenario(
            id: "debate-ch15-milky-way-asteroids",
            chapterNumber: 15,
            schoolUnitNumber: 6,
            title: "Solar System vs Milky Way Galaxy & Asteroid Orbits",
            contextPrompt: "Rohan and Ananya review Cambridge Science 8 Unit 6.3–6.4 on planetary systems, asteroids, and the Milky Way galaxy.",
            speakerAName: "Rohan",
            speakerAClaim: "The Milky Way is just another name for our Solar System, and asteroids sit stationary in space like a wall of rocks.",
            speakerBName: "Ananya",
            speakerBClaim: "The Milky Way is a vast spiral galaxy of ~200 billion stars (our Sun is just one star in it!), and asteroids in the belt between Mars and Jupiter actively orbit the Sun under gravity.",
            choices: [
                PhysicsDebateChoice(
                    id: "a",
                    label: "Rohan is right — the Milky Way is our 8-planet Solar System and asteroids hang motionless.",
                    isCorrect: false,
                    socraticRebuttal: "Any stationary rock near the Sun would fall straight into the Sun under gravity! And our Solar System is just one tiny star system inside the Milky Way galaxy."
                ),
                PhysicsDebateChoice(
                    id: "b",
                    label: "Ananya is right — the Milky Way contains billions of stars (including our Sun), and asteroids orbit the Sun mainly between Mars and Jupiter.",
                    isCorrect: true,
                    socraticRebuttal: "Exact Cambridge Science 8 Unit 6 mastery! Gravity holds planets, dwarf planets, and asteroids in orbit around the Sun, while billions of stars + stellar dust/gas form the Milky Way galaxy."
                ),
                PhysicsDebateChoice(
                    id: "c",
                    label: "Asteroids orbit the Moon between Earth and Mars.",
                    isCorrect: false,
                    socraticRebuttal: "The main asteroid belt orbits the Sun between the orbits of Mars (rocky) and Jupiter (gas giant)."
                )
            ],
            invariantTakeaway: "Hierarchy of the cosmos: Moons orbit planets → Planets & asteroids (between Mars and Jupiter) orbit the Sun → Billions of stars orbit the Milky Way galaxy."
        )
    ]

    static func scenario(forChapter chapterNumber: Int) -> PhysicsDebateScenario {
        allScenarios.first(where: { $0.chapterNumber == chapterNumber }) ?? allScenarios[0]
    }

    static func scenarios(forSchoolUnit unitNumber: Int) -> [PhysicsDebateScenario] {
        let matches = allScenarios.filter { $0.schoolUnitNumber == unitNumber }
        return matches.isEmpty ? [allScenarios[10], allScenarios[13], allScenarios[3]] : matches
    }
}

// MARK: - SmartyMe + Brilliant 15-Minute Daily Physics Flow Composer

enum DailyPhysicsFlowStageKind: String, CaseIterable, Codable, Sendable {
    case memoryLock = "1. FSRS Memory Lock"
    case conceptBeat = "2. Concept Discovery Beat"
    case misconceptionImmunity = "3. Misconception Immunity"
    case workbookProof = "4. School Workbook Proof"

    var estimatedMinutes: Int {
        switch self {
        case .memoryLock: return 3
        case .conceptBeat: return 4
        case .misconceptionImmunity: return 4
        case .workbookProof: return 4
        }
    }

    var systemImage: String {
        switch self {
        case .memoryLock: return "bolt.heart.fill"
        case .conceptBeat: return "sparkles.rectangle.stack.fill"
        case .misconceptionImmunity: return "person.2.wave.2.fill"
        case .workbookProof: return "checkmark.seal.text.page.fill"
        }
    }
}

struct DailyPhysicsFlowStage: Identifiable, Sendable, Equatable {
    var id: String { kind.rawValue }
    let kind: DailyPhysicsFlowStageKind
    let title: String
    let subtitle: String
    let estimatedMinutes: Int
}

struct DailyPhysicsFlowPlan: Sendable, Equatable {
    let totalMinutes: Int
    let stages: [DailyPhysicsFlowStage]
    let dueCards: [FSRSCardRecord]
    let targetChapter: MovingWorldChapter
    let targetBeat: PhysicsChapterBeat
    let targetDebate: PhysicsDebateScenario
    let targetQuantitativeTemplate: QuantitativePhysicsTemplate
    let targetQuestion: SchoolScienceQuestion
}

enum DailyPhysicsFlowEngine {
    /// Builds a deterministic 15-minute, 4-stage SmartyMe + Brilliant daily physics flow.
    static func buildPlan(
        chapters: [MovingWorldChapter],
        schoolQuestions: [SchoolScienceQuestion],
        cards: [FSRSCardRecord],
        readingProgress: [Int: ChapterReadingProgressRecord],
        questionProofs: [String: QuestionProofRecord],
        preferredChapterNumber: Int? = nil,
        preferredUnitNumber: Int? = nil
    ) -> DailyPhysicsFlowPlan? {
        guard let firstChapter = chapters.first,
              let firstQuestion = schoolQuestions.first else {
            return nil
        }

        let chosenChapter: MovingWorldChapter = {
            if let pref = preferredChapterNumber,
               let match = chapters.first(where: { $0.number == pref }) {
                return match
            }
            return chapters.first(where: { ch in
                (readingProgress[ch.number]?.readFraction ?? 0) < 0.99
            }) ?? firstChapter
        }()

        let now = Date()
        let dueList = cards.filter { $0.dueAt <= now }
        let activeCards = dueList.isEmpty ? Array(cards.prefix(3)) : Array(dueList.prefix(4))

        let beats = PhysicsChapterBeatEngine.beats(for: chosenChapter)
        let hookBeat = beats.first ?? PhysicsChapterBeat(
            id: "fallback-beat",
            index: 0,
            totalBeats: 1,
            kind: .everydayHook,
            title: chosenChapter.title,
            narrativeBody: chosenChapter.subtitle,
            section: nil,
            callout: nil,
            requiresInteractionToAdvance: false
        )

        let debate = PhysicsDebateCatalog.scenario(forChapter: chosenChapter.number)
        let quantTemplate = QuantitativePhysicsEngine.templates(forChapter: chosenChapter.number).first
            ?? QuantitativePhysicsEngine.templates[0]

        let unitFiltered: [SchoolScienceQuestion] = {
            if let unit = preferredUnitNumber {
                let matches = schoolQuestions.filter { $0.unitNumber == unit }
                if !matches.isEmpty { return matches }
            }
            let coreMatches = schoolQuestions.filter { [9, 6, 3].contains($0.unitNumber) }
            return coreMatches.isEmpty ? schoolQuestions : coreMatches
        }()

        let chosenQuestion = unitFiltered.first(where: { q in
            questionProofs[q.id]?.level.isIndependentProof != true
        }) ?? unitFiltered.first ?? firstQuestion

        let stages: [DailyPhysicsFlowStage] = [
            DailyPhysicsFlowStage(
                kind: .memoryLock,
                title: "FSRS Memory Lock (\(activeCards.count) cards)",
                subtitle: dueList.isEmpty ? "Warm-up retrieval review to keep physics laws sharp" : "Clear \(activeCards.count) due spaced-repetition cards",
                estimatedMinutes: 3
            ),
            DailyPhysicsFlowStage(
                kind: .conceptBeat,
                title: "Ch \(chosenChapter.number) Discovery Beat & Formula Bridge",
                subtitle: "\(chosenChapter.title) — \(chosenChapter.intuitionToFormula.formulaDisplay)",
                estimatedMinutes: 4
            ),
            DailyPhysicsFlowStage(
                kind: .misconceptionImmunity,
                title: "Debate & Trap Check: \(debate.title)",
                subtitle: "\(debate.speakerAName) vs \(debate.speakerBName) + \(quantTemplate.title)",
                estimatedMinutes: 4
            ),
            DailyPhysicsFlowStage(
                kind: .workbookProof,
                title: "Workbook Proof: \(chosenQuestion.bookSection) (\(chosenQuestion.commandWord))",
                subtitle: "\(chosenQuestion.sourceBadgeTitle) · Topic \(chosenQuestion.topicCode)",
                estimatedMinutes: 4
            )
        ]

        return DailyPhysicsFlowPlan(
            totalMinutes: stages.reduce(0) { $0 + $1.estimatedMinutes },
            stages: stages,
            dueCards: activeCards,
            targetChapter: chosenChapter,
            targetBeat: hookBeat,
            targetDebate: debate,
            targetQuantitativeTemplate: quantTemplate,
            targetQuestion: chosenQuestion
        )
    }
}
