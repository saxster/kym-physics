import Foundation

struct STEMComputationalClaim: Codable, Equatable, Sendable {
    var id: String?
    var expression: String?
    var expected: String?
}

/// The school subjects with a tips library. Each case carries everything that differs between
/// subjects, so the catalogue, the More row and the screens never switch on the subject.
enum SubjectTipSubject: String, Codable, CaseIterable, Sendable {
    case geometry, chemistry, physics, biology

    var name: String {
        switch self {
        case .geometry: return "Geometry"
        case .chemistry: return "Chemistry"
        case .physics: return "Physics"
        case .biology: return "Biology"
        }
    }

    var title: String { "\(name) Tips" }

    var purpose: String { "Play with a \(rawValue) idea and see why it happens." }

    var symbol: String {
        switch self {
        case .geometry: return "triangle"
        case .chemistry: return "flask"
        case .physics: return "atom"
        case .biology: return "leaf"
        }
    }

    var idPrefix: String {
        switch self {
        case .geometry: return "GEO"
        case .chemistry: return "CHE"
        case .physics: return "PHY"
        case .biology: return "BIO"
        }
    }

    var packFileName: String { "subject-tips-\(rawValue)-v1.json" }
}

struct SubjectTip: Codable, Identifiable, Equatable, Sendable {
    struct WorkedExample: Codable, Equatable, Sendable {
        var problem: String
        var steps: [String]
        var answer: String
    }

    struct GoDeeper: Codable, Equatable, Sendable {
        var workedExamples: [WorkedExample]
        var mistakes: [String]
        var realWorld: String
    }

    /// A self-check question. The answer is revealed on request and nothing is scored.
    struct PracticeQuestion: Codable, Equatable, Sendable {
        var question: String
        var answer: String
        var explanation: String
    }

    var id: String
    var version: Int
    var subject: SubjectTipSubject
    var strand: String
    var title: String
    var summary: String
    var prediction: String
    var why: String
    var whenToUse: String
    var watchFor: String
    var explainPrompt: String
    var visual: SubjectTipVisual
    var goDeeper: GoDeeper
    var practice: [PracticeQuestion]
    var syllabusRefs: [String]
    var sources: [String]
    var rights: String
    var reviewedOn: String
    var computationalClaims: [STEMComputationalClaim]?
}

struct SubjectTipsPack: Codable, Sendable {
    var schemaVersion: Int
    var subject: SubjectTipSubject
    var tips: [SubjectTip]
}

/// A reusable interactive demonstration, chosen by the pack's `kind` field.
enum SubjectTipVisual: Equatable, Sendable {
    case sliderRelation(SliderRelation)
    case stepSequence(StepSequence)
    case forceArrows(ForceArrows)
    case sortClassify(SortClassify)
    case circuitToggle(CircuitToggle)
    case reflection(PlaneMirror)
    case massWeight(MassWeight)
    case atomBuilder(AtomBuilder)
    case particleStates(ParticleStates)
    case periodicGrid(PeriodicGrid)
    case equationBalance(EquationBalance)
    case phScale(PHScale)

    enum Kind: String, Codable, CaseIterable, Sendable {
        case sliderRelation, stepSequence, forceArrows, sortClassify, circuitToggle, reflection, massWeight
        case atomBuilder, particleStates, periodicGrid, equationBalance, phScale
    }

    var kind: Kind {
        switch self {
        case .sliderRelation: return .sliderRelation
        case .stepSequence: return .stepSequence
        case .forceArrows: return .forceArrows
        case .sortClassify: return .sortClassify
        case .circuitToggle: return .circuitToggle
        case .reflection: return .reflection
        case .massWeight: return .massWeight
        case .atomBuilder: return .atomBuilder
        case .particleStates: return .particleStates
        case .periodicGrid: return .periodicGrid
        case .equationBalance: return .equationBalance
        case .phScale: return .phScale
        }
    }

    /// output = first × second, or first ÷ second.
    struct SliderRelation: Codable, Equatable, Sendable {
        enum Operation: String, Codable, Sendable { case multiply, divide }

        struct Input: Codable, Equatable, Sendable {
            var name: String
            var symbol: String
            var unit: String
            var minimum: Double
            var maximum: Double
            var step: Double
            var initial: Double

            private enum CodingKeys: String, CodingKey {
                case name, symbol, unit, step, initial
                case minimum = "min"
                case maximum = "max"
            }
        }

        struct Output: Codable, Equatable, Sendable {
            var name: String
            var symbol: String
            var unit: String
        }

        /// Exactly two inputs, so the relation can never be missing an operand.
        struct Inputs: Codable, Equatable, Sendable {
            var first: Input
            var second: Input

            init(first: Input, second: Input) {
                self.first = first
                self.second = second
            }

            init(from decoder: Decoder) throws {
                var container = try decoder.unkeyedContainer()
                guard container.count == 2 else {
                    throw DecodingError.dataCorruptedError(in: container, debugDescription: "sliderRelation needs exactly two inputs")
                }
                first = try container.decode(Input.self)
                second = try container.decode(Input.self)
            }

            func encode(to encoder: Encoder) throws {
                var container = encoder.unkeyedContainer()
                try container.encode(first)
                try container.encode(second)
            }
        }

        var formula: String
        var operation: Operation
        var inputs: Inputs
        var output: Output
        var observation: String
    }

    struct StepSequence: Codable, Equatable, Sendable {
        struct Step: Codable, Equatable, Sendable {
            var title: String
            var caption: String
            var symbol: String
        }

        var steps: [Step]
    }

    /// Horizontal forces on one object. A positive resultant points right, the object's
    /// direction of travel when `movingInitially` is true.
    struct ForceArrows: Codable, Equatable, Sendable {
        var objectName: String
        var leftLabel: String
        var rightLabel: String
        var leftInitial: Double
        var rightInitial: Double
        var maxForce: Double
        var stepSize: Double
        var movingInitially: Bool
    }

    struct SortClassify: Codable, Equatable, Sendable {
        struct Item: Codable, Equatable, Sendable {
            var label: String
            var bin: String
            var reason: String
        }

        var prompt: String
        var bins: [String]
        var items: [Item]
    }

    /// A battery and two bulbs: one switch on a series loop, or one switch per parallel branch.
    struct CircuitToggle: Codable, Equatable, Sendable {
        enum Layout: String, Codable, Sendable { case series, parallel }

        var layout: Layout
        var observation: String
    }

    struct PlaneMirror: Codable, Equatable, Sendable {
        var initialAngle: Double
        var observation: String
    }

    /// One mass weighed two ways on a choice of worlds. A pan balance compares it with kilogram
    /// masses, so it reads the same wherever there is gravity; a spring scale measures the pull
    /// on it, so it reads weight = mass × g.
    struct MassWeight: Codable, Equatable, Sendable {
        struct MassRange: Codable, Equatable, Sendable {
            var minimum: Double
            var maximum: Double
            var step: Double
            var initial: Double

            private enum CodingKeys: String, CodingKey {
                case step, initial
                case minimum = "min"
                case maximum = "max"
            }
        }

        struct World: Codable, Equatable, Sendable {
            var name: String
            /// Gravitational field strength in N/kg. 0 is deep space, far from any planet.
            var fieldStrength: Double

            private enum CodingKeys: String, CodingKey {
                case name
                case fieldStrength = "g"
            }
        }

        var mass: MassRange
        var worlds: [World]
        var initialWorld: String
        var observation: String
    }

    /// Build an atom particle by particle. Protons run 1...`maxProtons` (the builder never
    /// offers an element the logic cannot name); neutrons and electrons are free within the
    /// picture's limits so isotopes and ions can be discovered, not just described.
    struct AtomBuilder: Codable, Equatable, Sendable {
        var maxProtons: Int
        var initialProtons: Int
        var initialNeutrons: Int
        var initialElectrons: Int
        var observation: String
    }

    /// One substance's particles at a learner-set heat (0...100 on the demonstration's own
    /// scale — deliberately not degrees, so different substances can share the picture).
    struct ParticleStates: Codable, Equatable, Sendable {
        var substance: String
        var initialHeat: Double
        var observation: String
    }

    /// A tappable corner of the periodic table. Column is the group (1...18), row the period.
    /// `family` groups elements that behave alike; the view tints by family name.
    struct PeriodicGrid: Codable, Equatable, Sendable {
        struct Element: Codable, Equatable, Sendable {
            var symbol: String
            var name: String
            var atomicNumber: Int
            var column: Int
            var row: Int
            var family: String
            var fact: String
        }

        var elements: [Element]
        var observation: String
    }

    /// Balance an equation by changing molecule counts (coefficients), never formulas.
    /// Each term carries its own atom headcount so the tallies need no formula parsing.
    struct EquationBalance: Codable, Equatable, Sendable {
        struct Term: Codable, Equatable, Sendable {
            enum Side: String, Codable, Sendable { case reactant, product }

            var formula: String
            var side: Side
            /// Element symbol → atoms per molecule, e.g. H2O is ["H": 2, "O": 1].
            var counts: [String: Int]
        }

        var terms: [Term]
        var observation: String
    }

    /// The pH scale with everyday anchors. The learner walks pH 0...14 and meets the
    /// nearest example; `initialPH` starts somewhere interesting rather than neutral.
    struct PHScale: Codable, Equatable, Sendable {
        struct Example: Codable, Equatable, Sendable {
            var name: String
            var ph: Int
        }

        var examples: [Example]
        var initialPH: Int
        var observation: String
    }
}

extension SubjectTipVisual: Codable {
    private enum CodingKeys: String, CodingKey { case kind }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        switch try container.decode(Kind.self, forKey: .kind) {
        case .sliderRelation: self = .sliderRelation(try SliderRelation(from: decoder))
        case .stepSequence: self = .stepSequence(try StepSequence(from: decoder))
        case .forceArrows: self = .forceArrows(try ForceArrows(from: decoder))
        case .sortClassify: self = .sortClassify(try SortClassify(from: decoder))
        case .circuitToggle: self = .circuitToggle(try CircuitToggle(from: decoder))
        case .reflection: self = .reflection(try PlaneMirror(from: decoder))
        case .massWeight: self = .massWeight(try MassWeight(from: decoder))
        case .atomBuilder: self = .atomBuilder(try AtomBuilder(from: decoder))
        case .particleStates: self = .particleStates(try ParticleStates(from: decoder))
        case .periodicGrid: self = .periodicGrid(try PeriodicGrid(from: decoder))
        case .equationBalance: self = .equationBalance(try EquationBalance(from: decoder))
        case .phScale: self = .phScale(try PHScale(from: decoder))
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(kind, forKey: .kind)
        switch self {
        case .sliderRelation(let payload): try payload.encode(to: encoder)
        case .stepSequence(let payload): try payload.encode(to: encoder)
        case .forceArrows(let payload): try payload.encode(to: encoder)
        case .sortClassify(let payload): try payload.encode(to: encoder)
        case .circuitToggle(let payload): try payload.encode(to: encoder)
        case .reflection(let payload): try payload.encode(to: encoder)
        case .massWeight(let payload): try payload.encode(to: encoder)
        case .atomBuilder(let payload): try payload.encode(to: encoder)
        case .particleStates(let payload): try payload.encode(to: encoder)
        case .periodicGrid(let payload): try payload.encode(to: encoder)
        case .equationBalance(let payload): try payload.encode(to: encoder)
        case .phScale(let payload): try payload.encode(to: encoder)
        }
    }
}

enum SubjectTipStage: Int, Codable, CaseIterable, Sendable {
    case predict, explore, explain, practise

    var label: String {
        switch self {
        case .predict: return "Predict"
        case .explore: return "Explore"
        case .explain: return "Explain"
        case .practise: return "Practise"
        }
    }

    var progress: String { "\(label) · \(rawValue + 1) of \(Self.allCases.count)" }
}

/// Where the learner left the demonstration. Each visual reads only its own fields:
/// sliderRelation and forceArrows use `first` and `second` (the two inputs, or the left and
/// right forces), reflection uses `first` (the angle of incidence), stepSequence `step`,
/// circuitToggle `switchesClosed`, sortClassify `placements` (a bin index per item) and
/// `checked`, and massWeight `first` (the mass) and `step` (the chosen world's index).
/// atomBuilder uses `first` (protons), `second` (neutrons) and `step` (electrons);
/// particleStates and phScale use `first` (the heat, or the pH); periodicGrid uses `step`
/// (the selected element's index); equationBalance uses `placements` (a coefficient per term).
/// `SubjectTipVisualLogic.restored(_:for:)` keeps every field in range.
struct SubjectTipVisualState: Codable, Equatable, Sendable {
    var first = 0.0
    var second = 0.0
    var step = 0
    var switchesClosed: [Bool] = []
    var placements: [Int?] = []
    var checked = false
}

/// Reading state is a bookmark and the learner's own notes, never a mastery or assessment result.
struct SubjectTipReading: Codable, Equatable, Sendable {
    var isSaved = false
    var stage = SubjectTipStage.predict
    var visualState = SubjectTipVisualState()
    var prediction = ""
    var explanation = ""
    var revealedPractice: Set<Int> = []
}
