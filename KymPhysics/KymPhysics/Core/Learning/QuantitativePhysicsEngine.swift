import Foundation

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
}

struct QuantitativeCheckResult: Equatable, Sendable {
    let isNumericCorrect: Bool
    let isUnitCorrect: Bool
    let parsedNumber: Double?
    let parsedUnit: String
    let feedback: String

    var isFullPass: Bool { isNumericCorrect && isUnitCorrect }
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
            commonUnitTrap: "Dividing by 1000 instead of multiplying when converting km → m."
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
            commonUnitTrap: "Writing 'm' or 's' instead of the compound unit 'm/s'."
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
            commonUnitTrap: "Dividing d₂ ÷ t₂ (48 ÷ 16) works only when the line starts at (0, 0); always use Δd ÷ Δt."
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
            commonUnitTrap: "Adding opposing forces instead of subtracting them."
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
            commonUnitTrap: "Multiplying 480 × 1.2 instead of dividing by the 1.2 m lever arm."
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
            commonUnitTrap: "Forgetting that the biceps sits 10× closer to the elbow pivot than the hand, so it must pull with 10× the weight."
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
            commonUnitTrap: "Forgetting to include the unit km/h."
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
            commonUnitTrap: "Confusing work done (in J) with turning moment (in N m)."
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
            commonUnitTrap: "Multiplying force × area instead of dividing force ÷ area."
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
            commonUnitTrap: "Halving/dividing the pressure when volume shrinks; smaller volume means MORE frequent wall collisions and HIGHER pressure."
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
            commonUnitTrap: "Inverting the fraction (volume ÷ mass) or writing g/cm²."
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
            commonUnitTrap: "Using 45 °C instead of the temperature change ΔT = 20 °C."
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
            commonUnitTrap: "Dividing frequency by wavelength instead of multiplying."
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
            commonUnitTrap: "Writing 35° because the angle was given relative to the mirror surface rather than the 90° normal!"
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
            commonUnitTrap: "Multiplying V × R instead of dividing V ÷ R."
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
            commonUnitTrap: "Including the anomalous reading (11) in the average, which pulls the mean down to 23.75."
        ),
    ]

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
                feedback: "Enter a numerical value and its unit (for example: \( formatNumber(template.expectedValue) ) \(template.expectedUnit))."
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
