import Foundation

// MARK: - Brilliant-Style Buggy-Rule Trap Diagnostic

/// Represents a specific calculation or conceptual trap that produces a predictable wrong number
/// (e.g. multiplying instead of dividing, using angle to mirror instead of normal, including an anomalous reading).
struct PhysicsBuggyRuleTrap: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let trapName: String
    let buggyValue: Double
    let tolerance: Double
    let diagnosticWhy: String
    let visualFixNudge: String

    init(
        id: String,
        trapName: String,
        buggyValue: Double,
        tolerance: Double = 0.15,
        diagnosticWhy: String,
        visualFixNudge: String
    ) {
        self.id = id
        self.trapName = trapName
        self.buggyValue = buggyValue
        self.tolerance = tolerance
        self.diagnosticWhy = diagnosticWhy
        self.visualFixNudge = visualFixNudge
    }
}

// MARK: - Wolfram-Audited Quantitative Physics Engine (16 Templates + Unit-Aware Evaluator)

struct QuantitativePhysicsTemplate: Identifiable, Equatable, Sendable {
    let id: String
    let chapter: Int
    let unitNumber: Int
    let topicCode: String
    let title: String
    let formulaDisplay: String
    let prompt: String
    let expectedValue: Double
    let tolerance: Double
    let expectedUnit: String
    let acceptedUnits: [String]
    let stepByStepSolution: [String]
    let commonUnitTrap: String
    let visualIntuitionStep: String
    let ahaInvariantStep: String
    let traps: [PhysicsBuggyRuleTrap]

    var chapterNumber: Int { chapter }
    var schoolUnitNumber: Int? { unitNumber }
    var workedSteps: [String] { stepByStepSolution }

    init(
        id: String,
        chapter: Int,
        unitNumber: Int,
        topicCode: String,
        title: String,
        formulaDisplay: String,
        prompt: String,
        expectedValue: Double,
        tolerance: Double,
        expectedUnit: String,
        acceptedUnits: [String],
        stepByStepSolution: [String],
        commonUnitTrap: String,
        visualIntuitionStep: String = "Sketch the physical setup and label every measured quantity in standard SI units before substituting.",
        ahaInvariantStep: String = "Physical laws conserve dimensional balance: the units on the left must match the units combined on the right.",
        traps: [PhysicsBuggyRuleTrap] = []
    ) {
        self.id = id
        self.chapter = chapter
        self.unitNumber = unitNumber
        self.topicCode = topicCode
        self.title = title
        self.formulaDisplay = formulaDisplay
        self.prompt = prompt
        self.expectedValue = expectedValue
        self.tolerance = tolerance
        self.expectedUnit = expectedUnit
        self.acceptedUnits = acceptedUnits
        self.stepByStepSolution = stepByStepSolution
        self.commonUnitTrap = commonUnitTrap
        self.visualIntuitionStep = visualIntuitionStep
        self.ahaInvariantStep = ahaInvariantStep
        self.traps = traps
    }
}

struct QuantitativeCheckResult: Equatable, Sendable {
    let isNumericCorrect: Bool
    let isUnitCorrect: Bool
    let parsedNumber: Double?
    let parsedUnit: String
    let feedback: String
    let matchedTrap: PhysicsBuggyRuleTrap?

    init(
        isNumericCorrect: Bool,
        isUnitCorrect: Bool,
        parsedNumber: Double?,
        parsedUnit: String,
        feedback: String,
        matchedTrap: PhysicsBuggyRuleTrap? = nil
    ) {
        self.isNumericCorrect = isNumericCorrect
        self.isUnitCorrect = isUnitCorrect
        self.parsedNumber = parsedNumber
        self.parsedUnit = parsedUnit
        self.feedback = feedback
        self.matchedTrap = matchedTrap
    }

    var isFullPass: Bool { isNumericCorrect && isUnitCorrect }
    var isFullyCorrect: Bool { isFullPass }
    var parsedValue: Double? { parsedNumber }
}

enum QuantitativePhysicsEngine {
    static let templates: [QuantitativePhysicsTemplate] = [
        QuantitativePhysicsTemplate(
            id: "quant-ch00-unit-conv",
            chapter: 0,
            unitNumber: 3,
            topicCode: "3.2",
            title: "Standard Form & SI Length Conversion",
            formulaDisplay: "1 km = 1000 m = 10³ m",
            prompt: "A laser rangefinder measures the distance to a harbour buoy off Marine Drive as 2.45 km. Convert this distance into metres (include the unit).",
            expectedValue: 2450.0,
            tolerance: 0.5,
            expectedUnit: "m",
            acceptedUnits: ["m", "metres", "meters"],
            stepByStepSolution: [
                "1 km = 1000 m.",
                "Multiply kilometres by 1000: 2.45 × 1000 = 2450 m."
            ],
            commonUnitTrap: "Dividing by 1000 instead of multiplying when converting km → m.",
            visualIntuitionStep: "Each 1 km span contains 1000 individual 1-metre paces, so the count of metres is 1000× larger than the count of kilometres.",
            ahaInvariantStep: "Shrinking the unit size by 1000× (km → m) multiplies the numerical value by 1000×.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch00-div-1000",
                    trapName: "Divided by 1000 Instead of Multiplying",
                    buggyValue: 0.00245,
                    tolerance: 0.0005,
                    diagnosticWhy: "You divided 2.45 by 1000 (0.00245). Because 1 km is 1000 m, there are MORE metres than kilometres!",
                    visualFixNudge: "Multiply 2.45 km × 1000 m/km = 2450 m."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch00-mult-100",
                    trapName: "Multiplied by 100 (Centimetre Prefix Slip)",
                    buggyValue: 245.0,
                    tolerance: 0.5,
                    diagnosticWhy: "You multiplied 2.45 by 100 (245). 'Kilo-' means 10³ = 1000, whereas 'centi-' is 100.",
                    visualFixNudge: "Shift the decimal point 3 places right: 2.45 × 1000 = 2450 m."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch01-speed",
            chapter: 1,
            unitNumber: 3,
            topicCode: "3.2",
            title: "Average Speed from Distance & Time",
            formulaDisplay: "v = d ÷ t",
            prompt: "A sprinter runs 150 m in 20 s along a straight track. Calculate her average speed in m/s.",
            expectedValue: 7.5,
            tolerance: 0.05,
            expectedUnit: "m/s",
            acceptedUnits: ["m/s", "ms^-1", "m s^-1", "m/sec"],
            stepByStepSolution: [
                "Write the relationship: speed = distance ÷ time.",
                "Substitute d = 150 m and t = 20 s: v = 150 ÷ 20 = 7.5 m/s."
            ],
            commonUnitTrap: "Writing 'm' or 's' instead of the compound unit 'm/s'.",
            visualIntuitionStep: "Partition the 150 m track into 20 equal 1-second slices: each 1-second slice is 150 ÷ 20 = 7.5 m long.",
            ahaInvariantStep: "The unit 'm/s' literally tells you the operation: metres (d) divided by seconds (t).",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch01-mult-dt",
                    trapName: "Multiplied Distance by Time (d × t)",
                    buggyValue: 3000.0,
                    tolerance: 1.0,
                    diagnosticWhy: "You multiplied 150 m × 20 s = 3000. Taking longer time for the same distance means slower speed, so time must be in the denominator!",
                    visualFixNudge: "Divide distance by time: 150 m ÷ 20 s = 7.5 m/s."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch01-inverted-td",
                    trapName: "Inverted Ratio (Time ÷ Distance)",
                    buggyValue: 0.13,
                    tolerance: 0.02,
                    diagnosticWhy: "You divided 20 s by 150 m (0.133 s/m, seconds per metre) instead of metres per second.",
                    visualFixNudge: "Put metres on top and seconds on bottom: 150 ÷ 20 = 7.5 m/s."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch01-graph-slope",
            chapter: 1,
            unitNumber: 3,
            topicCode: "3.3",
            title: "Gradient of a Distance–Time Graph",
            formulaDisplay: "v = Δd ÷ Δt = (d₂ − d₁) ÷ (t₂ − t₁)",
            prompt: "On a distance–time graph, a toy cart is at d₁ = 12 m at t₁ = 4 s and reaches d₂ = 48 m at t₂ = 16 s along a straight line. Calculate its speed in m/s.",
            expectedValue: 3.0,
            tolerance: 0.05,
            expectedUnit: "m/s",
            acceptedUnits: ["m/s", "ms^-1", "m s^-1"],
            stepByStepSolution: [
                "Change in distance Δd = 48 m − 12 m = 36 m.",
                "Change in time Δt = 16 s − 4 s = 12 s.",
                "Gradient = speed = 36 m ÷ 12 s = 3.0 m/s."
            ],
            commonUnitTrap: "Dividing d₂ ÷ t₂ (48 ÷ 16) works only when the line starts at (0, 0); always use Δd ÷ Δt.",
            visualIntuitionStep: "Draw the right-angled rise-over-run triangle between (4 s, 12 m) and (16 s, 48 m): vertical rise is 36 m, horizontal run is 12 s.",
            ahaInvariantStep: "Speed on a distance-time graph is the slope Δd ÷ Δt, subtracting the starting coordinates first.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch01-forgot-t1",
                    trapName: "Subtracted d₁ But Divided by Raw t₂ (36 ÷ 16)",
                    buggyValue: 2.25,
                    tolerance: 0.05,
                    diagnosticWhy: "You found Δd = 36 m correctly, but divided by t₂ = 16 s instead of Δt = 16 − 4 = 12 s.",
                    visualFixNudge: "Subtract the starting time too: Δt = 16 − 4 = 12 s, then 36 ÷ 12 = 3.0 m/s."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch01-delta-d-only",
                    trapName: "Reported Distance Change Δd (36) Instead of Gradient",
                    buggyValue: 36.0,
                    tolerance: 0.5,
                    diagnosticWhy: "36 m is the distance travelled Δd, not the speed! You still need to divide by Δt = 12 s.",
                    visualFixNudge: "Divide Δd = 36 m by Δt = 12 s to get 3.0 m/s."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch02-resultant-force",
            chapter: 2,
            unitNumber: 3,
            topicCode: "3.1",
            title: "Resultant Force & Acceleration (Newton's Second Law)",
            formulaDisplay: "F_net = F_forward − F_drag = m × a",
            prompt: "A 60 kg kayak has a forward paddle thrust of 180 N and backward water resistance of 60 N. Calculate the resultant forward force in newtons (N).",
            expectedValue: 120.0,
            tolerance: 0.5,
            expectedUnit: "N",
            acceptedUnits: ["n", "newtons", "newton"],
            stepByStepSolution: [
                "Opposite forces subtract: F_net = F_forward − F_drag.",
                "F_net = 180 N − 60 N = 120 N forward (giving acceleration a = 120 ÷ 60 = 2.0 m/s²)."
            ],
            commonUnitTrap: "Adding opposing forces instead of subtracting them.",
            visualIntuitionStep: "Draw 180 N forward and 60 N backward on the kayak: the 60 N drag cancels 60 N of thrust, leaving 120 N forward.",
            ahaInvariantStep: "Antiparallel forces along a line subtract; parallel forces in the same direction add.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch02-added-drag",
                    trapName: "Added Opposing Drag Force (180 + 60 = 240 N)",
                    buggyValue: 240.0,
                    tolerance: 0.5,
                    diagnosticWhy: "You added 180 N + 60 N = 240 N. Water resistance opposes the kayak's motion, so it subtracts from paddle thrust!",
                    visualFixNudge: "Subtract opposing drag: F_net = 180 N − 60 N = 120 N."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch02-calculated-accel",
                    trapName: "Calculated Acceleration (2.0 m/s²) Instead of Resultant Force (120 N)",
                    buggyValue: 2.0,
                    tolerance: 0.05,
                    diagnosticWhy: "2.0 m/s² is the kayak's acceleration (120 N ÷ 60 kg), whereas the question asks for the resultant forward force in newtons (N).",
                    visualFixNudge: "Report the net force before dividing by mass: 180 N − 60 N = 120 N."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch03-moment-balance",
            chapter: 3,
            unitNumber: 3,
            topicCode: "3.4",
            title: "Principle of Moments on a Balanced Beam",
            formulaDisplay: "F₁ × d₁ = F₂ × d₂",
            prompt: "A child of weight 300 N sits 1.6 m to the left of a seesaw pivot. What downward force (in N) must be applied 1.2 m to the right of the pivot to balance the seesaw?",
            expectedValue: 400.0,
            tolerance: 0.5,
            expectedUnit: "N",
            acceptedUnits: ["n", "newtons", "newton"],
            stepByStepSolution: [
                "Anticlockwise moment = 300 N × 1.6 m = 480 N m.",
                "For equilibrium, clockwise moment = F₂ × 1.2 m = 480 N m.",
                "F₂ = 480 ÷ 1.2 = 400 N."
            ],
            commonUnitTrap: "Multiplying 480 × 1.2 instead of dividing by the 1.2 m lever arm.",
            visualIntuitionStep: "Sitting closer to the pivot (1.2 m vs 1.6 m) gives less leverage, so a larger downward force (400 N) is needed to balance.",
            ahaInvariantStep: "Principle of Moments: F₁ × d₁ = F₂ × d₂ about the pivot in equilibrium.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch03-mult-arm",
                    trapName: "Multiplied Moment by Lever Arm (480 × 1.2 = 576 N)",
                    buggyValue: 576.0,
                    tolerance: 1.0,
                    diagnosticWhy: "You computed 480 × 1.2 = 576 instead of dividing the 480 N·m moment by the 1.2 m distance.",
                    visualFixNudge: "Divide moment by distance: F₂ = 480 N·m ÷ 1.2 m = 400 N."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch03-direct-ratio",
                    trapName: "Inverted Lever Ratio (300 × 1.2 ÷ 1.6 = 225 N)",
                    buggyValue: 225.0,
                    tolerance: 1.0,
                    diagnosticWhy: "You scaled force down with distance (225 N). A shorter lever arm requires MORE force to produce the same 480 N·m torque!",
                    visualFixNudge: "Use F₂ = (300 × 1.6) ÷ 1.2 = 400 N."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch03-moment-only",
                    trapName: "Stopped at Turning Moment (480 N·m)",
                    buggyValue: 480.0,
                    tolerance: 1.0,
                    diagnosticWhy: "480 N·m is the anticlockwise moment, not the force F₂ at 1.2 m.",
                    visualFixNudge: "Divide 480 N·m by 1.2 m to get 400 N."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch03-forearm-biceps",
            chapter: 3,
            unitNumber: 7,
            topicCode: "7.4",
            title: "Biomechanics Bridge: Biceps Force at the Elbow Joint",
            formulaDisplay: "F_biceps × d_in = F_load × d_out",
            prompt: "Kym holds a 15 N physics book in her hand 30 cm from her elbow pivot. Her biceps tendon attaches 3.0 cm from the elbow pivot. Calculate the upward force (in N) her biceps muscle must exert.",
            expectedValue: 150.0,
            tolerance: 0.5,
            expectedUnit: "N",
            acceptedUnits: ["n", "newtons", "newton"],
            stepByStepSolution: [
                "Load moment about elbow = 15 N × 30 cm = 450 N cm.",
                "Biceps moment = F_biceps × 3.0 cm = 450 N cm.",
                "F_biceps = 450 ÷ 3.0 = 150 N."
            ],
            commonUnitTrap: "Forgetting that the biceps sits 10× closer to the elbow pivot than the hand, so it must pull with 10× the weight.",
            visualIntuitionStep: "The biceps tendon pulls at 3 cm while the book pulls down at 30 cm (10× farther out), so the biceps must pull 10× harder than the book's weight.",
            ahaInvariantStep: "Class-3 anatomical levers trade force for range of motion: F_biceps = F_load × (d_out ÷ d_in).",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch03b-moment-450",
                    trapName: "Reported Moment (450 N·cm) Instead of Biceps Force",
                    buggyValue: 450.0,
                    tolerance: 1.0,
                    diagnosticWhy: "450 N·cm is the clockwise load moment (15 N × 30 cm). You still need to divide by the 3.0 cm tendon distance!",
                    visualFixNudge: "Divide 450 N·cm by 3.0 cm = 150 N."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch03b-div-10",
                    trapName: "Divided Load by 10 Instead of Multiplying (1.5 N)",
                    buggyValue: 1.5,
                    tolerance: 0.05,
                    diagnosticWhy: "You computed 15 N ÷ 10 = 1.5 N. Because the tendon is 10× closer to the elbow pivot, it must pull 10× harder, not 10× weaker!",
                    visualFixNudge: "Multiply 15 N × (30 cm ÷ 3.0 cm) = 150 N."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch04-orbital-speed",
            chapter: 4,
            unitNumber: 6,
            topicCode: "6.6",
            title: "Circular Orbit Speed",
            formulaDisplay: "v = 2πr ÷ T",
            prompt: "A satellite moves along a circular path of circumference 42,000 km in a period of 14 hours. Calculate its orbital speed in km/h.",
            expectedValue: 3000.0,
            tolerance: 1.0,
            expectedUnit: "km/h",
            acceptedUnits: ["km/h", "kmh^-1", "km/hr"],
            stepByStepSolution: [
                "Orbital speed = total circumference ÷ orbital period.",
                "v = 42,000 km ÷ 14 h = 3000 km/h."
            ],
            commonUnitTrap: "Forgetting to include the unit km/h.",
            visualIntuitionStep: "The circumference 2πr = 42,000 km is already the full loop distance; dividing by the 14 h loop time gives km travelled each hour.",
            ahaInvariantStep: "Orbital speed is total loop circumference divided by orbital period T.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch04-mult-2pi",
                    trapName: "Multiplied Circumference by 2π Again",
                    buggyValue: 18849.5,
                    tolerance: 20.0,
                    diagnosticWhy: "42,000 km is already the circumference 2πr, not the radius r! No need to multiply by 2π again.",
                    visualFixNudge: "Divide the given circumference 42,000 km directly by 14 h = 3000 km/h."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch04-div-60",
                    trapName: "Divided by 60 (Converted to km/min = 50)",
                    buggyValue: 50.0,
                    tolerance: 0.5,
                    diagnosticWhy: "50 is the speed in km/min (3000 ÷ 60), whereas the question asks for km/h.",
                    visualFixNudge: "Keep time in hours: 42,000 km ÷ 14 h = 3000 km/h."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch05-work-power",
            chapter: 5,
            unitNumber: 3,
            topicCode: "3.1",
            title: "Mechanical Work & Gravitational Potential Store",
            formulaDisplay: "W = F × d = ΔE_p",
            prompt: "A crane lifts a 450 N steel beam vertically upward through a height of 8.0 m. Calculate the mechanical work done in joules (J).",
            expectedValue: 3600.0,
            tolerance: 1.0,
            expectedUnit: "J",
            acceptedUnits: ["j", "joules", "joule", "nm", "n m"],
            stepByStepSolution: [
                "Work done = force × distance moved in the direction of the force.",
                "W = 450 N × 8.0 m = 3600 J."
            ],
            commonUnitTrap: "Confusing work done (in J) with turning moment (in N m).",
            visualIntuitionStep: "Each metre of vertical lift against a 450 N weight transfers 450 J into the gravitational potential store; 8 metres transfers 8 × 450 = 3600 J.",
            ahaInvariantStep: "1 Joule of work equals 1 Newton of force applied along 1 metre of parallel displacement (W = F × d).",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch05-div-fd",
                    trapName: "Divided Force by Height (450 ÷ 8 = 56.25)",
                    buggyValue: 56.25,
                    tolerance: 0.2,
                    diagnosticWhy: "You divided 450 N by 8.0 m (56.25). Lifting higher requires MORE energy, so multiply force by distance!",
                    visualFixNudge: "Multiply W = F × d = 450 N × 8.0 m = 3600 J."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch05-mult-g",
                    trapName: "Multiplied Weight (450 N) by g = 10 Again (36,000 J)",
                    buggyValue: 36000.0,
                    tolerance: 50.0,
                    diagnosticWhy: "450 N is already the weight mg in Newtons (not mass in kg), so multiplying by g = 10 again overcounts by 10×!",
                    visualFixNudge: "Since F = 450 N is already in Newtons, multiply 450 N × 8.0 m = 3600 J."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch06-solid-pressure",
            chapter: 6,
            unitNumber: 3,
            topicCode: "3.5",
            title: "Pressure Between Solids",
            formulaDisplay: "P = F ÷ A",
            prompt: "A rectangular crate weighs 840 N and rests on the floor on a base of area 0.40 m². Calculate the pressure it exerts on the floor in N/m² (or Pa).",
            expectedValue: 2100.0,
            tolerance: 1.0,
            expectedUnit: "Pa",
            acceptedUnits: ["pa", "n/m^2", "n/m²", "n m^-2", "pascals"],
            stepByStepSolution: [
                "Pressure = force ÷ contact area.",
                "P = 840 N ÷ 0.40 m² = 2100 N/m² (2100 Pa)."
            ],
            commonUnitTrap: "Multiplying force × area instead of dividing force ÷ area.",
            visualIntuitionStep: "Because the crate's footprint (0.40 m²) is less than half of a 1 m² square, the pressure per full square metre is more than double 840 N.",
            ahaInvariantStep: "Pressure P = F ÷ A divides perpendicular force by area; dividing by a decimal < 1 produces a larger number.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch06-mult-fa",
                    trapName: "Multiplied Force by Area (840 × 0.40 = 336)",
                    buggyValue: 336.0,
                    tolerance: 1.0,
                    diagnosticWhy: "You multiplied 840 N × 0.40 m² = 336. Smaller area concentrates force into HIGHER pressure, so divide by area!",
                    visualFixNudge: "Divide F by A: 840 N ÷ 0.40 m² = 2100 Pa."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch06-decimal-shift",
                    trapName: "Decimal Place Slip (210 Pa)",
                    buggyValue: 210.0,
                    tolerance: 1.0,
                    diagnosticWhy: "840 ÷ 4 = 210, so 840 ÷ 0.40 is 10× larger: 2100 Pa.",
                    visualFixNudge: "Multiply top and bottom by 10: 8400 ÷ 4 = 2100 Pa."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch06-boyle-gas",
            chapter: 6,
            unitNumber: 3,
            topicCode: "3.6",
            title: "Boyle's Law Gas Compression",
            formulaDisplay: "P₁ V₁ = P₂ V₂",
            prompt: "A sealed syringe holds 60 cm³ of air at a pressure of 100 kPa. The plunger is pushed slowly inward at constant temperature until the volume is 20 cm³. Calculate the new gas pressure in kPa.",
            expectedValue: 300.0,
            tolerance: 0.5,
            expectedUnit: "kPa",
            acceptedUnits: ["kpa", "kilopascals"],
            stepByStepSolution: [
                "At constant temperature, P₁ × V₁ = P₂ × V₂.",
                "100 kPa × 60 cm³ = P₂ × 20 cm³ ⇒ P₂ = 6000 ÷ 20 = 300 kPa."
            ],
            commonUnitTrap: "Halving/dividing the pressure when volume shrinks; smaller volume means MORE frequent wall collisions and HIGHER pressure.",
            visualIntuitionStep: "Crowding the same air molecules into 1/3 of the volume (20 cm³ vs 60 cm³) makes them hit the syringe walls 3× as often!",
            ahaInvariantStep: "At constant temperature, gas pressure and volume are inversely proportional: P₁V₁ = P₂V₂.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch06b-direct-prop",
                    trapName: "Divided Pressure by 3 Instead of Multiplying (33.3 kPa)",
                    buggyValue: 33.33,
                    tolerance: 0.5,
                    diagnosticWhy: "You scaled pressure down with volume (100 ÷ 3 = 33.3 kPa). Compressing a gas into a smaller space increases wall collisions and raises pressure!",
                    visualFixNudge: "Volume shrank by 3× (60 → 20 cm³), so pressure triples: 100 × 3 = 300 kPa."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch06b-pv-product",
                    trapName: "Stopped at P₁ × V₁ Product (6000)",
                    buggyValue: 6000.0,
                    tolerance: 5.0,
                    diagnosticWhy: "6000 kPa·cm³ is the product P₁V₁. Divide by the new volume V₂ = 20 cm³ to find P₂.",
                    visualFixNudge: "Divide 6000 by 20 cm³ = 300 kPa."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch07-density",
            chapter: 7,
            unitNumber: 2,
            topicCode: "2.1",
            title: "Density of a Solid Specimen",
            formulaDisplay: "ρ = m ÷ V",
            prompt: "A brass block has a mass of 168 g and a volume of 20 cm³. Calculate its density in g/cm³.",
            expectedValue: 8.4,
            tolerance: 0.05,
            expectedUnit: "g/cm³",
            acceptedUnits: ["g/cm^3", "g/cm³", "g cm^-3", "g/cc"],
            stepByStepSolution: [
                "Density = mass ÷ volume.",
                "ρ = 168 g ÷ 20 cm³ = 8.4 g/cm³."
            ],
            commonUnitTrap: "Inverting the fraction (volume ÷ mass) or writing g/cm².",
            visualIntuitionStep: "Split the 168 g brass block into 20 identical 1 cm³ cubes: each 1 cm³ cube has a mass of 168 ÷ 20 = 8.4 g.",
            ahaInvariantStep: "Density ρ = m ÷ V is the mass packed into each unit cube (1 cm³).",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch07-inverted-vm",
                    trapName: "Inverted Ratio (Volume ÷ Mass = 0.12)",
                    buggyValue: 0.12,
                    tolerance: 0.02,
                    diagnosticWhy: "You divided volume 20 cm³ by mass 168 g (0.119 cm³/g). Density is grams per cubic centimetre (m ÷ V)!",
                    visualFixNudge: "Divide mass by volume: 168 g ÷ 20 cm³ = 8.4 g/cm³."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch07-mult-mv",
                    trapName: "Multiplied Mass by Volume (3360)",
                    buggyValue: 3360.0,
                    tolerance: 5.0,
                    diagnosticWhy: "You multiplied 168 × 20 = 3360 instead of dividing mass by volume.",
                    visualFixNudge: "Use ρ = m ÷ V = 168 ÷ 20 = 8.4 g/cm³."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch08-thermal-energy",
            chapter: 8,
            unitNumber: 8,
            topicCode: "8.1",
            title: "Specific Heat Capacity & Monsoon Water Warming",
            formulaDisplay: "Q = m c ΔT",
            prompt: "How much thermal energy (in kJ) is transferred when 0.50 kg of water (c = 4.2 kJ/(kg °C)) is heated from 25 °C to 45 °C?",
            expectedValue: 42.0,
            tolerance: 0.2,
            expectedUnit: "kJ",
            acceptedUnits: ["kj", "kilojoules"],
            stepByStepSolution: [
                "Temperature rise ΔT = 45 °C − 25 °C = 20 °C.",
                "Q = m × c × ΔT = 0.50 kg × 4.2 kJ/(kg °C) × 20 °C = 42 kJ."
            ],
            commonUnitTrap: "Using 45 °C instead of the temperature change ΔT = 20 °C.",
            visualIntuitionStep: "Only the 20 °C temperature climb (from 25 °C to 45 °C) requires new heat transfer.",
            ahaInvariantStep: "Thermal energy transfer Q = m·c·ΔT is proportional to temperature change ΔT = T_final − T_initial.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch08-used-tfinal",
                    trapName: "Used Final Temperature (45 °C) Instead of ΔT (20 °C)",
                    buggyValue: 94.5,
                    tolerance: 0.5,
                    diagnosticWhy: "You multiplied by the final temperature 45 °C (giving 94.5 kJ) instead of the temperature rise ΔT = 45 − 25 = 20 °C.",
                    visualFixNudge: "Subtract starting temperature first: ΔT = 45 − 25 = 20 °C, then 0.50 × 4.2 × 20 = 42 kJ."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch08-used-tinitial",
                    trapName: "Used Initial Temperature (25 °C) Instead of ΔT (20 °C)",
                    buggyValue: 52.5,
                    tolerance: 0.5,
                    diagnosticWhy: "You multiplied by the starting temperature 25 °C (52.5 kJ) instead of ΔT = 45 − 25 = 20 °C.",
                    visualFixNudge: "Use ΔT = 20 °C to get 0.50 × 4.2 × 20 = 42 kJ."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch09-wave-equation",
            chapter: 9,
            unitNumber: 6,
            topicCode: "6.3",
            title: "Wave Speed, Frequency & Wavelength",
            formulaDisplay: "v = f × λ",
            prompt: "A tuning fork vibrates at a frequency of 440 Hz and sends a sound wave of wavelength 0.75 m through room air. Calculate the speed of the sound wave in m/s.",
            expectedValue: 330.0,
            tolerance: 0.5,
            expectedUnit: "m/s",
            acceptedUnits: ["m/s", "ms^-1", "m s^-1"],
            stepByStepSolution: [
                "Wave speed = frequency × wavelength.",
                "v = 440 Hz × 0.75 m = 330 m/s."
            ],
            commonUnitTrap: "Dividing frequency by wavelength instead of multiplying.",
            visualIntuitionStep: "The fork launches 440 wave crests every second, and each crest steps forward by 0.75 m — so the wave front advances 440 × 0.75 = 330 m each second.",
            ahaInvariantStep: "Wave speed v = f × λ multiplies cycles per second (Hz) by metres per cycle (m) to yield metres per second (m/s).",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch09-div-flambda",
                    trapName: "Divided Frequency by Wavelength (440 ÷ 0.75 = 586.7)",
                    buggyValue: 586.67,
                    tolerance: 1.0,
                    diagnosticWhy: "You divided 440 by 0.75 (586.7) instead of multiplying f × λ!",
                    visualFixNudge: "Multiply 440 Hz × 0.75 m = 330 m/s."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch09-div-lambdaf",
                    trapName: "Divided Wavelength by Frequency (0.75 ÷ 440)",
                    buggyValue: 0.0017,
                    tolerance: 0.001,
                    diagnosticWhy: "You divided 0.75 m by 440 Hz. Multiply cycles/s by m/cycle to get m/s!",
                    visualFixNudge: "Compute v = 440 × 0.75 = 330 m/s."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch10-reflection-angle",
            chapter: 10,
            unitNumber: 6,
            topicCode: "6.1",
            title: "Law of Reflection & Mirror Grazing Angle",
            formulaDisplay: "i = 90° − θ_mirror,   r = i",
            prompt: "A laser beam strikes a flat plane mirror at an angle of 35° to the mirror surface. Calculate the angle of reflection (measured from the normal) in degrees (°).",
            expectedValue: 55.0,
            tolerance: 0.2,
            expectedUnit: "°",
            acceptedUnits: ["°", "deg", "degrees", "degree"],
            stepByStepSolution: [
                "The normal is at 90° to the mirror surface.",
                "Angle of incidence i = 90° − 35° = 55°.",
                "By the law of reflection, angle of reflection r = i = 55°."
            ],
            commonUnitTrap: "Writing 35° because the angle was given relative to the mirror surface rather than the 90° normal!",
            visualIntuitionStep: "Draw the dashed 90° normal perpendicular to the mirror: the 35° grazing wedge and the angle of incidence i add up to 90°.",
            ahaInvariantStep: "All angles in optics (i, r) are measured from the 90° normal line, never from the mirror surface.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch10-grazing-35",
                    trapName: "Used Grazing Angle to Mirror Surface (35°) Instead of Normal",
                    buggyValue: 35.0,
                    tolerance: 0.5,
                    diagnosticWhy: "35° is the angle between the ray and the mirror surface! Angle of incidence and reflection are always measured from the 90° normal.",
                    visualFixNudge: "Subtract from 90°: i = 90° − 35° = 55°, so r = 55°."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch10-double-110",
                    trapName: "Doubled Angle Between Incident & Reflected Rays (110°)",
                    buggyValue: 110.0,
                    tolerance: 0.5,
                    diagnosticWhy: "110° is the total angle between the incident and reflected rays (i + r). The angle of reflection r alone is 55°.",
                    visualFixNudge: "Measure from the normal to the reflected ray: r = 55°."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch12-ohms-law",
            chapter: 12,
            unitNumber: 9,
            topicCode: "9.3",
            title: "Ohm's Law in an Electromagnet Coil",
            formulaDisplay: "I = V ÷ R",
            prompt: "An electromagnet coil has a resistance of 6.0 Ω and is connected across a 9.0 V battery. Calculate the electric current flowing through the coil in amps (A).",
            expectedValue: 1.5,
            tolerance: 0.05,
            expectedUnit: "A",
            acceptedUnits: ["a", "amps", "amp", "amperes"],
            stepByStepSolution: [
                "By Ohm's law, current I = voltage V ÷ resistance R.",
                "I = 9.0 V ÷ 6.0 Ω = 1.5 A."
            ],
            commonUnitTrap: "Multiplying V × R instead of dividing V ÷ R.",
            visualIntuitionStep: "Voltage V = 9.0 V pushes charge while resistance R = 6.0 Ω restricts it, so current is push divided by opposition.",
            ahaInvariantStep: "Ohm's Law: I = V ÷ R — doubling resistance halves current for a fixed battery voltage.",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch12-mult-vr",
                    trapName: "Multiplied Voltage by Resistance (9.0 × 6.0 = 54 A)",
                    buggyValue: 54.0,
                    tolerance: 0.5,
                    diagnosticWhy: "You multiplied 9.0 V × 6.0 Ω = 54. Higher resistance opposes current flow, so you must divide V by R!",
                    visualFixNudge: "Divide V by R: 9.0 V ÷ 6.0 Ω = 1.5 A."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch12-inverted-rv",
                    trapName: "Inverted Ohm's Law (R ÷ V = 0.67 A)",
                    buggyValue: 0.67,
                    tolerance: 0.03,
                    diagnosticWhy: "You divided resistance 6.0 Ω by voltage 9.0 V (0.67) instead of V ÷ R.",
                    visualFixNudge: "Put voltage on top: I = 9.0 V ÷ 6.0 Ω = 1.5 A."
                )
            ]
        ),
        QuantitativePhysicsTemplate(
            id: "quant-ch13-electromagnet-mean",
            chapter: 13,
            unitNumber: 9,
            topicCode: "9.4",
            title: "Electromagnet Investigation: Excluding Anomalous Readings",
            formulaDisplay: "Mean = sum of valid repeats ÷ count of valid repeats",
            prompt: "For a 60-turn electromagnet, Kym records four repeat trials for the number of paperclips lifted: 27, 29, 11, and 28 clips. Excluding the anomalous reading, calculate the mean number of paperclips.",
            expectedValue: 28.0,
            tolerance: 0.1,
            expectedUnit: "clips",
            acceptedUnits: ["clips", "paperclips", "clip", ""],
            stepByStepSolution: [
                "Identify 11 as an anomalous result (far below 27, 29, 28).",
                "Exclude 11 and average the three repeatable readings: (27 + 29 + 28) ÷ 3 = 84 ÷ 3 = 28 clips."
            ],
            commonUnitTrap: "Including the anomalous reading (11) in the average, which pulls the mean down to 23.75.",
            visualIntuitionStep: "Trials 1, 2, and 4 cluster tightly at 27–29 clips; Trial 3 (11 clips) is a slip where the switch opened early and must be crossed out first.",
            ahaInvariantStep: "Scientific repeatability excludes anomalous outliers before averaging and divides by the count of valid trials (3, not 4).",
            traps: [
                PhysicsBuggyRuleTrap(
                    id: "trap-ch13-included-outlier",
                    trapName: "Included Anomalous Reading (11) in Mean (23.75)",
                    buggyValue: 23.75,
                    tolerance: 0.25,
                    diagnosticWhy: "You averaged all 4 numbers (27+29+11+28) ÷ 4 = 23.75, letting the anomalous reading (11) skew the mean!",
                    visualFixNudge: "Exclude 11 first, then divide the 3 concordant readings by 3: (27+29+28) ÷ 3 = 28 clips."
                ),
                PhysicsBuggyRuleTrap(
                    id: "trap-ch13-div-by-4",
                    trapName: "Excluded Outlier From Sum But Still Divided by 4 (21)",
                    buggyValue: 21.0,
                    tolerance: 0.2,
                    diagnosticWhy: "You summed the 3 valid readings (84) correctly, but divided by 4 instead of 3!",
                    visualFixNudge: "With 3 valid repeats remaining, divide 84 ÷ 3 = 28 clips."
                )
            ]
        )
    ]

    static func templates(forChapter chapterNumber: Int) -> [QuantitativePhysicsTemplate] {
        templates.filter { $0.chapter == chapterNumber }
    }

    static func templates(forSchoolUnit unitNumber: Int) -> [QuantitativePhysicsTemplate] {
        templates.filter { $0.unitNumber == unitNumber }
    }

    static func evaluate(input: String, against template: QuantitativePhysicsTemplate) -> QuantitativeCheckResult {
        let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
        let pattern = #"([-+]?\d+(?:\.\d+)?(?:/\d+(?:\.\d+)?)?)\s*(.*)"#
        guard let regex = try? NSRegularExpression(pattern: pattern),
              let match = regex.firstMatch(in: trimmed, range: NSRange(trimmed.startIndex..., in: trimmed)),
              let numRange = Range(match.range(at: 1), in: trimmed) else {
            return QuantitativeCheckResult(
                isNumericCorrect: false,
                isUnitCorrect: false,
                parsedNumber: nil,
                parsedUnit: "",
                feedback: "Enter a numerical value and its unit (for example: \(formatNumber(template.expectedValue)) \(template.expectedUnit))."
            )
        }

        let numToken = String(trimmed[numRange])
        let unitToken: String
        if let uRange = Range(match.range(at: 2), in: trimmed) {
            unitToken = String(trimmed[uRange]).trimmingCharacters(in: .whitespacesAndNewlines)
        } else {
            unitToken = ""
        }

        let parsedVal: Double?
        if numToken.contains("/") {
            let parts = numToken.split(separator: "/")
            if parts.count == 2, let n = Double(parts[0]), let d = Double(parts[1]), d != 0 {
                parsedVal = n / d
            } else {
                parsedVal = nil
            }
        } else {
            parsedVal = Double(numToken)
        }

        guard let value = parsedVal else {
            return QuantitativeCheckResult(
                isNumericCorrect: false,
                isUnitCorrect: false,
                parsedNumber: nil,
                parsedUnit: unitToken,
                feedback: "Could not parse the number in '\(numToken)'."
            )
        }

        let numericOK = abs(value - template.expectedValue) <= template.tolerance
        let normalizedUnit = unitToken.lowercased()
            .replacingOccurrences(of: "degrees", with: "°")
            .replacingOccurrences(of: "degree", with: "°")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        let unitOK: Bool
        if template.acceptedUnits.contains("") && normalizedUnit.isEmpty {
            unitOK = true
        } else {
            unitOK = template.acceptedUnits.contains { $0.lowercased() == normalizedUnit }
        }

        if !numericOK,
           let matchedTrap = template.traps.first(where: { abs(value - $0.buggyValue) <= $0.tolerance }) {
            return QuantitativeCheckResult(
                isNumericCorrect: false,
                isUnitCorrect: unitOK,
                parsedNumber: value,
                parsedUnit: unitToken,
                feedback: "Buggy-Rule Trap Caught (\(matchedTrap.trapName)): \(matchedTrap.diagnosticWhy) Fix: \(matchedTrap.visualFixNudge)",
                matchedTrap: matchedTrap
            )
        }

        let feedback: String
        if numericOK && unitOK {
            feedback = "Exact match: \(formatNumber(value)) \(template.expectedUnit). Both magnitude and unit are spot on."
        } else if numericOK && !unitOK {
            feedback = "Your number (\(formatNumber(value))) is right, but check the unit! Expected \(template.expectedUnit). Watchout: \(template.commonUnitTrap)"
        } else {
            feedback = "Not quite (\(formatNumber(value))). Hint: use \(template.formulaDisplay). Watchout: \(template.commonUnitTrap)"
        }

        return QuantitativeCheckResult(
            isNumericCorrect: numericOK,
            isUnitCorrect: unitOK,
            parsedNumber: value,
            parsedUnit: unitToken,
            feedback: feedback
        )
    }

    private static func formatNumber(_ value: Double) -> String {
        if abs(value.rounded() - value) < 0.001 {
            return String(Int(value.rounded()))
        }
        return String(format: "%.2f", value)
    }
}
