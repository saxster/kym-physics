import Foundation

/// What a demonstration computes, separate from how it is drawn.
enum SubjectTipVisualLogic {
    // MARK: Slider relation

    static func output(of relation: SubjectTipVisual.SliderRelation, first: Double, second: Double) -> Double? {
        switch relation.operation {
        case .multiply:
            return first * second
        case .divide:
            guard second != 0 else { return nil }
            return first / second
        }
    }

    /// The smallest and largest output the two input ranges can produce. Both operations are
    /// monotonic in each input while the divisor keeps one sign, so the extremes sit at corners.
    static func outputRange(of relation: SubjectTipVisual.SliderRelation) -> ClosedRange<Double> {
        let first = relation.inputs.first
        let second = relation.inputs.second
        let corners = [(first.minimum, second.minimum), (first.minimum, second.maximum),
                       (first.maximum, second.minimum), (first.maximum, second.maximum)]
        let values = corners.compactMap { output(of: relation, first: $0.0, second: $0.1) }
        let lower = values.min() ?? 0
        let upper = values.max() ?? 0
        return lower...Swift.max(lower, upper)
    }

    /// The area picture. Multiply: a rectangle `first` wide and `second` tall whose area is the
    /// output. Divide: a rectangle of area `first` that is `second` wide, so its height is the
    /// output (for speed, the area under a speed-time graph is the distance).
    struct AreaModel: Equatable, Sendable {
        var widthFraction: Double
        /// Capped at 1. A divide output above the chart's top is drawn cut off.
        var heightFraction: Double
        var isCutOff: Bool
        /// The output value at the top of the chart.
        var heightScale: Double
    }

    static func areaModel(of relation: SubjectTipVisual.SliderRelation, first: Double, second: Double) -> AreaModel {
        let inputs = relation.inputs
        switch relation.operation {
        case .multiply:
            return AreaModel(widthFraction: fraction(first, of: inputs.first.maximum),
                             heightFraction: fraction(second, of: inputs.second.maximum),
                             isCutOff: false, heightScale: inputs.second.maximum)
        case .divide:
            // Scaling to the largest possible quotient (biggest dividend over the smallest
            // divisor) would flatten every typical case, so the chart tops out at the biggest
            // dividend over the middle divisor and anything taller is shown cut off.
            let middle = (inputs.second.minimum + inputs.second.maximum) / 2
            let scale = niceCeiling(output(of: relation, first: inputs.first.maximum, second: middle) ?? 0)
            let height = scale > 0 ? (output(of: relation, first: first, second: second) ?? 0) / scale : 0
            return AreaModel(widthFraction: fraction(second, of: inputs.second.maximum),
                             heightFraction: Swift.min(1, Swift.max(0, height)), isCutOff: height > 1, heightScale: scale)
        }
    }

    /// The next of 1, 2, 2.5, 5 or 10 times a power of ten at or above `value`.
    static func niceCeiling(_ value: Double) -> Double {
        guard value > 0, value.isFinite else { return 0 }
        let magnitude = pow(10, floor(log10(value)))
        let normalized = value / magnitude
        let step = [1, 2, 2.5, 5, 10].first { normalized <= $0 + 1e-9 } ?? 10
        return step * magnitude
    }

    private static func fraction(_ value: Double, of maximum: Double) -> Double {
        guard maximum > 0 else { return 0 }
        return Swift.min(1, Swift.max(0, value / maximum))
    }

    /// One press of a minus or plus button: moves by `step`, lands on the step grid, stays in range.
    static func stepped(_ value: Double, by direction: Int, step: Double, in range: ClosedRange<Double>) -> Double {
        guard step > 0 else { return clamp(value, range.lowerBound, range.upperBound) }
        let moved = value + Double(direction) * step
        let snapped = range.lowerBound + ((moved - range.lowerBound) / step).rounded() * step
        return clamp(snapped, range.lowerBound, range.upperBound)
    }

    // MARK: Forces

    enum Direction: String, Equatable, Sendable { case left, right }

    enum ForceOutcome: Equatable, Sendable {
        case balanced(moving: Bool)
        case speedsUp
        case slowsDown
        case startsMoving(Direction)

        func sentence(objectName: String) -> String {
            switch self {
            case .balanced(let moving):
                return moving
                    ? "Balanced forces: the \(objectName) keeps moving at a constant speed."
                    : "Balanced forces: the \(objectName) stays still."
            case .speedsUp: return "Unbalanced forces: the \(objectName) speeds up."
            case .slowsDown: return "Unbalanced forces: the \(objectName) slows down."
            case .startsMoving(let direction): return "Unbalanced forces: the \(objectName) starts moving \(direction.rawValue)."
            }
        }
    }

    /// Positive points right.
    static func netForce(left: Double, right: Double) -> Double {
        right - left
    }

    static func forceOutcome(left: Double, right: Double, movingInitially: Bool) -> ForceOutcome {
        let net = netForce(left: left, right: right)
        guard abs(net) > 1e-9 else { return .balanced(moving: movingInitially) }
        let direction: Direction = net > 0 ? .right : .left
        guard movingInitially else { return .startsMoving(direction) }
        return direction == .right ? .speedsUp : .slowsDown
    }

    static func resultantDescription(left: Double, right: Double) -> String {
        let net = netForce(left: left, right: right)
        guard abs(net) > 1e-9 else { return "Resultant force: 0 N" }
        return "Resultant force: \(formatted(abs(net))) N to the \(net > 0 ? "right" : "left")"
    }

    // MARK: Circuits

    static func switchCount(for layout: SubjectTipVisual.CircuitToggle.Layout) -> Int {
        layout == .series ? 1 : 2
    }

    /// Which of the two bulbs light. In series one switch breaks the only loop; in parallel each
    /// switch breaks only its own branch.
    static func litBulbs(layout: SubjectTipVisual.CircuitToggle.Layout, switchesClosed: [Bool]) -> [Bool] {
        switch layout {
        case .series:
            let loopClosed = !switchesClosed.isEmpty && switchesClosed.allSatisfy { $0 }
            return [loopClosed, loopClosed]
        case .parallel:
            return (0..<2).map { switchesClosed.indices.contains($0) && switchesClosed[$0] }
        }
    }

    // MARK: Reflection

    static let incidenceRange = 0.0...80.0

    static func clampedIncidence(_ angle: Double) -> Double {
        Swift.min(incidenceRange.upperBound, Swift.max(incidenceRange.lowerBound, angle))
    }

    /// The law of reflection: both angles are measured from the normal and are equal.
    static func reflectedAngle(forIncidence angle: Double) -> Double {
        clampedIncidence(angle)
    }

    // MARK: Mass and weight

    typealias World = SubjectTipVisual.MassWeight.World

    /// What the balance and the spring scale read for one mass on one world.
    struct MassWeightReading: Equatable, Sendable {
        enum Balance: Equatable, Sendable {
            /// Gravity pulls both pans alike, so the beam levels at the same mass on every world.
            case balanced
            /// Nothing pulls either pan down, so the balance has nothing to compare.
            case noPull
        }

        var world: World
        var mass: Double
        /// In newtons: mass × g.
        var weight: Double
        /// The weight as a share of the heaviest the demonstration can show (the largest mass on
        /// the strongest world): the length of the weight arrow and how far the scale sinks.
        var weightFraction: Double
        /// With no pull the astronaut floats above the spring scale, which reads 0 N.
        var isFloating: Bool
        var balance: Balance
    }

    /// weight (N) = mass (kg) × gravitational field strength (N/kg).
    static func weight(mass: Double, fieldStrength: Double) -> Double {
        mass * fieldStrength
    }

    static func heaviestWeight(of visual: SubjectTipVisual.MassWeight) -> Double {
        let strongest = visual.worlds.map(\.fieldStrength).max() ?? 0
        return weight(mass: visual.mass.maximum, fieldStrength: strongest)
    }

    /// The world at a saved index, kept inside the list; nil only for a visual with no worlds.
    static func world(at index: Int, in visual: SubjectTipVisual.MassWeight) -> World? {
        guard !visual.worlds.isEmpty else { return nil }
        let clamped = Swift.min(visual.worlds.count - 1, Swift.max(0, index))
        return visual.worlds[clamped]
    }

    static func initialWorldIndex(of visual: SubjectTipVisual.MassWeight) -> Int {
        visual.worlds.firstIndex { $0.name == visual.initialWorld } ?? 0
    }

    static func massWeightReading(_ visual: SubjectTipVisual.MassWeight, mass: Double, world: World) -> MassWeightReading {
        let weight = weight(mass: mass, fieldStrength: world.fieldStrength)
        let heaviest = heaviestWeight(of: visual)
        let isFloating = world.fieldStrength <= 0
        return MassWeightReading(world: world, mass: mass, weight: weight,
                                 weightFraction: fraction(weight, of: heaviest),
                                 isFloating: isFloating, balance: isFloating ? .noPull : .balanced)
    }

    /// "on Earth", "on the Moon", "in deep space".
    static func place(of world: World) -> String {
        if world.fieldStrength <= 0 { return "in \(world.name.lowercased())" }
        let needsArticle = ["moon", "sun"].contains(world.name.lowercased())
        return needsArticle ? "on the \(world.name)" : "on \(world.name)"
    }

    /// The VoiceOver summary of the picture.
    static func spokenSummary(_ reading: MassWeightReading) -> String {
        let place = place(of: reading.world)
        let opening = place.prefix(1).uppercased() + place.dropFirst()
        let mass = formatted(reading.mass)
        let kilograms = mass == "1" ? "kilogram" : "kilograms"
        guard reading.balance == .balanced else {
            return "\(opening), nothing pulls, so the balance cannot balance and the spring scale reads 0 newtons "
                + "while the astronaut floats. The mass is still \(mass) \(kilograms)."
        }
        let weight = formatted(reading.weight)
        let newtons = weight == "1" ? "newton" : "newtons"
        return "\(opening), the balance reads \(mass) \(kilograms) and the spring scale reads \(weight) \(newtons)."
    }

    // MARK: Sorting

    struct SortResult: Equatable, Sendable {
        /// nil while an item has not been placed.
        var itemIsCorrect: [Bool?]

        var placed: Int { itemIsCorrect.compactMap { $0 }.count }
        var correct: Int { itemIsCorrect.filter { $0 == true }.count }
        var total: Int { itemIsCorrect.count }
        var allPlaced: Bool { placed == total }
    }

    static func sortResult(_ sort: SubjectTipVisual.SortClassify, placements: [Int?]) -> SortResult {
        let verdicts = sort.items.indices.map { index -> Bool? in
            guard placements.indices.contains(index), let bin = placements[index], sort.bins.indices.contains(bin) else { return nil }
            return sort.bins[bin] == sort.items[index].bin
        }
        return SortResult(itemIsCorrect: verdicts)
    }

    // MARK: Atoms

    /// The first twenty elements: (name, symbol, neutrons in the most common isotope).
    /// The builder never offers more protons than this table can name.
    static let elementTable: [(name: String, symbol: String, commonNeutrons: Int)] = [
        ("Hydrogen", "H", 0), ("Helium", "He", 2), ("Lithium", "Li", 4), ("Beryllium", "Be", 5),
        ("Boron", "B", 6), ("Carbon", "C", 6), ("Nitrogen", "N", 7), ("Oxygen", "O", 8),
        ("Fluorine", "F", 10), ("Neon", "Ne", 10), ("Sodium", "Na", 12), ("Magnesium", "Mg", 12),
        ("Aluminium", "Al", 14), ("Silicon", "Si", 14), ("Phosphorus", "P", 16), ("Sulfur", "S", 16),
        ("Chlorine", "Cl", 18), ("Argon", "Ar", 22), ("Potassium", "K", 20), ("Calcium", "Ca", 20)
    ]

    static let maxBuilderNeutrons = 30
    static let maxBuilderElectrons = 24

    struct AtomReading: Equatable, Sendable {
        var protons: Int
        var neutrons: Int
        var electrons: Int
        var name: String
        var symbol: String
        var massNumber: Int
        /// Protons minus electrons: positive when electrons are missing.
        var charge: Int
        var isIon: Bool
        /// Same protons as the common isotope but a different neutron count.
        var isIsotopeVariant: Bool
        /// Electrons per shell, innermost first, on the beginner 2/8/8 pattern.
        var shells: [Int]

        var valenceElectrons: Int { shells.last ?? 0 }
        var outerShellCapacity: Int { shells.count <= 1 ? 2 : 8 }
        var outerShellVacancies: Int { shells.isEmpty ? 2 : Swift.max(0, outerShellCapacity - valenceElectrons) }
        var hasFullOuterShell: Bool { !shells.isEmpty && valenceElectrons == outerShellCapacity }

        var chargeNotation: String {
            if charge == 0 { return "" }
            if charge == 1 { return "+" }
            if charge == -1 { return "−" }
            return charge > 0 ? "\(charge)+" : "\(abs(charge))−"
        }

        var stabilityNote: String {
            if shells.isEmpty { return "Bare nucleus (no electrons) — strongly attracts electrons." }
            if hasFullOuterShell {
                return "Full outer shell (\(valenceElectrons)/\(outerShellCapacity) e⁻) — stable noble-gas arrangement."
            }
            if valenceElectrons <= 2 {
                let noun = valenceElectrons == 1 ? "electron" : "electrons"
                return "Outer shell has \(valenceElectrons) of \(outerShellCapacity) \(noun) — tends to lose \(valenceElectrons) e⁻ in bonding."
            }
            if outerShellVacancies <= 3 {
                return "Outer shell has \(valenceElectrons) of \(outerShellCapacity) electrons — needs \(outerShellVacancies) more e⁻ by sharing or transfer."
            }
            return "Outer shell has \(valenceElectrons) of \(outerShellCapacity) electrons — can share \(outerShellVacancies) pairs in covalent bonds."
        }

        /// One plain sentence naming what has been built.
        var summary: String {
            var text = "\(name) (\(symbol)): \(protons) protons, \(neutrons) neutrons, \(electrons) electrons. "
            text += "Mass number \(massNumber). "
            if charge == 0 {
                text += "No overall charge."
            } else if charge > 0 {
                text += "A positive ion, charge +\(charge): still \(name.lowercased())."
            } else {
                text += "A negative ion, charge \(charge): still \(name.lowercased())."
            }
            if isIsotopeVariant { text += " An isotope with an unusual neutron count." }
            return text
        }
    }

    /// Fill shells innermost-first with capacities 2, 8, 8, then a final shell for the rest.
    /// Right for every element the builder can name (H to Ca).
    static func electronShells(_ electrons: Int) -> [Int] {
        var remaining = Swift.max(0, electrons)
        var shells: [Int] = []
        for capacity in [2, 8, 8] {
            guard remaining > 0 else { break }
            let taken = Swift.min(capacity, remaining)
            shells.append(taken)
            remaining -= taken
        }
        if remaining > 0 { shells.append(remaining) }
        return shells
    }

    static func atomReading(protons: Int, neutrons: Int, electrons: Int) -> AtomReading {
        let clampedProtons = Int(clamp(Double(protons), 1, Double(elementTable.count)))
        let entry = elementTable[clampedProtons - 1]
        let charge = protons - electrons
        return AtomReading(protons: protons, neutrons: neutrons, electrons: electrons,
                           name: entry.name, symbol: entry.symbol,
                           massNumber: protons + neutrons, charge: charge, isIon: charge != 0,
                           isIsotopeVariant: neutrons != entry.commonNeutrons,
                           shells: electronShells(electrons))
    }

    // MARK: Particle states

    enum ParticleState: String, Equatable, Sendable {
        case solid, liquid, gas

        var label: String { rawValue.capitalized }

        var arrangementSummary: String {
            switch self {
            case .solid: return "Regular lattice, touching"
            case .liquid: return "Close, random clusters"
            case .gas: return "Far apart, random"
            }
        }

        var motionSummary: String {
            switch self {
            case .solid: return "Vibrate about fixed spots"
            case .liquid: return "Slide and tumble past neighbours"
            case .gas: return "Dart rapidly in straight lines"
            }
        }

        var compressibilitySummary: String {
            switch self {
            case .solid: return "Incompressible (no gaps)"
            case .liquid: return "Virtually incompressible"
            case .gas: return "Easily compressed (mostly empty space)"
            }
        }

        func sentence(substance: String) -> String {
            switch self {
            case .solid: return "\(substance) as a solid: particles vibrate in fixed positions, close together in a regular pattern."
            case .liquid: return "\(substance) as a liquid: particles stay close but slide and tumble past each other, so it flows."
            case .gas: return "\(substance) as a gas: particles move freely and fast, far apart, filling the whole space."
            }
        }
    }

    /// Heat is the demonstration's own 0...100 scale: below a third solid, below two thirds liquid.
    static func particleState(heat: Double) -> ParticleState {
        let value = clamp(heat, 0, 100)
        if value < 34 { return .solid }
        if value < 67 { return .liquid }
        return .gas
    }

    // MARK: Periodic grid

    /// The eight main-group columns shown in the beginner periodic map (skipping the d-block gap 3...12).
    static let mainGroups = [1, 2, 13, 14, 15, 16, 17, 18]

    static func compactColumn(for group: Int) -> Int? {
        mainGroups.firstIndex(of: group)
    }

    static func valenceElectrons(for element: SubjectTipVisual.PeriodicGrid.Element) -> Int {
        electronShells(element.atomicNumber).last ?? 0
    }

    static func shellConfiguration(for element: SubjectTipVisual.PeriodicGrid.Element) -> String {
        electronShells(element.atomicNumber).map(String.init).joined(separator: " · ")
    }

    static func periodicElement(at index: Int, in grid: SubjectTipVisual.PeriodicGrid) -> SubjectTipVisual.PeriodicGrid.Element? {
        guard !grid.elements.isEmpty else { return nil }
        return grid.elements[Int(clamp(Double(index), 0, Double(grid.elements.count - 1)))]
    }

    /// The other shown elements sharing this one's family — the column resemblance to notice.
    static func familyMembers(of element: SubjectTipVisual.PeriodicGrid.Element,
                              in grid: SubjectTipVisual.PeriodicGrid) -> [SubjectTipVisual.PeriodicGrid.Element] {
        grid.elements.filter { $0.family == element.family && $0.atomicNumber != element.atomicNumber }
    }

    // MARK: Equation balancing

    static let coefficientRange = 1...6

    struct BalanceTally: Equatable, Sendable {
        var reactants: [String: Int]
        var products: [String: Int]
        /// Every element on either side, sorted for stable display.
        var elements: [String]
        var isBalanced: Bool
        /// Balanced and no common factor divides every coefficient.
        var isSmallest: Bool
    }

    static func balanceTally(_ balance: SubjectTipVisual.EquationBalance, coefficients: [Int?]) -> BalanceTally {
        var reactants: [String: Int] = [:]
        var products: [String: Int] = [:]
        var used: [Int] = []
        for (index, term) in balance.terms.enumerated() {
            let coefficient = Int(clamp(Double(coefficients.indices.contains(index) ? (coefficients[index] ?? 1) : 1),
                                        Double(coefficientRange.lowerBound), Double(coefficientRange.upperBound)))
            used.append(coefficient)
            for (element, count) in term.counts {
                if term.side == .reactant {
                    reactants[element, default: 0] += coefficient * count
                } else {
                    products[element, default: 0] += coefficient * count
                }
            }
        }
        let elements = Set(reactants.keys).union(products.keys).sorted()
        let balanced = !elements.isEmpty && elements.allSatisfy { (reactants[$0] ?? 0) == (products[$0] ?? 0) }
        let divisor = used.reduce(0, gcd)
        return BalanceTally(reactants: reactants, products: products, elements: elements,
                            isBalanced: balanced, isSmallest: balanced && divisor <= 1)
    }

    private static func gcd(_ a: Int, _ b: Int) -> Int { b == 0 ? a : gcd(b, a % b) }

    // MARK: pH

    enum PHKind: Equatable, Sendable {
        case acid, neutral, alkali

        var label: String {
            switch self {
            case .acid: return "Acid"
            case .neutral: return "Neutral"
            case .alkali: return "Alkali"
            }
        }
    }

    static func phKind(_ ph: Int) -> PHKind {
        let value = Int(clamp(Double(ph), 0, 14))
        if value < 7 { return .acid }
        if value > 7 { return .alkali }
        return .neutral
    }

    /// How many times as acidic `ph` is than `reference`: each step down multiplies by ten.
    /// Below 1 means less acidic; the sentence form below keeps the wording honest.
    static func acidityFactor(ph: Int, relativeTo reference: Int) -> Double {
        pow(10.0, Double(reference - ph))
    }

    static func aciditySentence(ph: Int) -> String {
        let value = Int(clamp(Double(ph), 0, 14))
        switch phKind(value) {
        case .neutral: return "pH \(value) is neutral: neither acid nor alkali."
        case .acid:
            let factor = acidityFactor(ph: value, relativeTo: 7)
            return "pH \(value) is an acid, \(formatted(factor)) times as acidic as neutral water."
        case .alkali:
            let factor = acidityFactor(ph: 7, relativeTo: value)
            return "pH \(value) is an alkali, \(formatted(factor)) times as alkaline as neutral water."
        }
    }

    /// The closest everyday example to a pH; ties go to the lower pH.
    static func nearestExample(to ph: Int, in scale: SubjectTipVisual.PHScale) -> SubjectTipVisual.PHScale.Example? {
        scale.examples.min { a, b in
            let da = abs(a.ph - ph), db = abs(b.ph - ph)
            return da == db ? a.ph < b.ph : da < db
        }
    }

    // MARK: Saved position

    static func initialState(for visual: SubjectTipVisual) -> SubjectTipVisualState {
        var state = SubjectTipVisualState()
        switch visual {
        case .sliderRelation(let relation):
            state.first = relation.inputs.first.initial
            state.second = relation.inputs.second.initial
        case .stepSequence:
            break
        case .forceArrows(let forces):
            state.first = forces.leftInitial
            state.second = forces.rightInitial
        case .sortClassify(let sort):
            state.placements = Array(repeating: nil, count: sort.items.count)
        case .circuitToggle(let circuit):
            state.switchesClosed = Array(repeating: true, count: switchCount(for: circuit.layout))
        case .reflection(let mirror):
            state.first = clampedIncidence(mirror.initialAngle)
        case .massWeight(let visual):
            state.first = clamp(visual.mass.initial, visual.mass.minimum, visual.mass.maximum)
            state.step = initialWorldIndex(of: visual)
        case .atomBuilder(let builder):
            state.first = clamp(Double(builder.initialProtons), 1, Double(builder.maxProtons))
            state.second = clamp(Double(builder.initialNeutrons), 0, Double(maxBuilderNeutrons))
            state.step = Int(clamp(Double(builder.initialElectrons), 0, Double(maxBuilderElectrons)))
        case .particleStates(let states):
            state.first = clamp(states.initialHeat, 0, 100)
        case .periodicGrid:
            break
        case .equationBalance(let balance):
            state.placements = Array(repeating: 1, count: balance.terms.count)
        case .phScale(let scale):
            state.first = clamp(Double(scale.initialPH), 0, 14)
        }
        return state
    }

    /// A saved position brought back into range for the tip as it is now. Fields the visual does
    /// not use are reset, and a shape that no longer fits starts over.
    static func restored(_ saved: SubjectTipVisualState, for visual: SubjectTipVisual) -> SubjectTipVisualState {
        var state = initialState(for: visual)
        switch visual {
        case .sliderRelation(let relation):
            state.first = clamp(saved.first, relation.inputs.first.minimum, relation.inputs.first.maximum)
            state.second = clamp(saved.second, relation.inputs.second.minimum, relation.inputs.second.maximum)
        case .stepSequence(let sequence):
            state.step = Int(clamp(Double(saved.step), 0, Double(Swift.max(0, sequence.steps.count - 1))))
        case .forceArrows(let forces):
            state.first = clamp(saved.first, 0, forces.maxForce)
            state.second = clamp(saved.second, 0, forces.maxForce)
        case .sortClassify(let sort):
            guard saved.placements.count == sort.items.count else { break }
            state.placements = saved.placements.map { bin in bin.flatMap { sort.bins.indices.contains($0) ? $0 : nil } }
            state.checked = saved.checked
        case .circuitToggle(let circuit):
            if saved.switchesClosed.count == switchCount(for: circuit.layout) { state.switchesClosed = saved.switchesClosed }
        case .reflection:
            state.first = clampedIncidence(saved.first)
        case .massWeight(let visual):
            state.first = clamp(saved.first, visual.mass.minimum, visual.mass.maximum)
            state.step = Int(clamp(Double(saved.step), 0, Double(Swift.max(0, visual.worlds.count - 1))))
        case .atomBuilder(let builder):
            state.first = clamp(saved.first.rounded(), 1, Double(builder.maxProtons))
            state.second = clamp(saved.second.rounded(), 0, Double(maxBuilderNeutrons))
            state.step = Int(clamp(Double(saved.step), 0, Double(maxBuilderElectrons)))
        case .particleStates:
            state.first = clamp(saved.first, 0, 100)
        case .periodicGrid(let grid):
            state.step = Int(clamp(Double(saved.step), 0, Double(Swift.max(0, grid.elements.count - 1))))
        case .equationBalance(let balance):
            guard saved.placements.count == balance.terms.count else { break }
            state.placements = saved.placements.map { coefficient in
                coefficient.map { Int(clamp(Double($0), Double(coefficientRange.lowerBound), Double(coefficientRange.upperBound))) } ?? 1
            }
        case .phScale:
            state.first = clamp(saved.first.rounded(), 0, 14)
        }
        return state
    }

    private static func clamp(_ value: Double, _ lower: Double, _ upper: Double) -> Double {
        guard value.isFinite else { return lower }
        return Swift.min(upper, Swift.max(lower, value))
    }

    // MARK: Numbers

    /// At most two decimal places and no trailing zeros, with a full stop in every locale.
    static func formatted(_ value: Double) -> String {
        guard value.isFinite else { return "–" }
        let text = String(format: "%.2f", value)
        var trimmed = text.contains(".") ? String(text.reversed().drop(while: { $0 == "0" }).reversed()) : text
        if trimmed.hasSuffix(".") { trimmed.removeLast() }
        return trimmed == "-0" ? "0" : trimmed
    }
}
