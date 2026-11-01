import Foundation
import SwiftUI

// MARK: - Canonical Mission Identifier & Track

/// Canonical identifier for each mission in the Arduino course.
enum ArduinoMissionID: String, CaseIterable, Hashable, Sendable {
    case firstLight = "first-light"
    case morseLamp = "morse-lamp"
    case diaryAlarm = "diary-alarm"
    case beamGuard = "beam-guard"
    case sonarSweep = "sonar-sweep"
    case truthMeter = "truth-meter"
    case feederCam = "feeder-cam"
    case visitorCounter = "visitor-counter"
    case dawnLogger = "dawn-logger"
    case fieldAgent = "field-agent"
}

/// Introduction to Electronics with Arduino: spy and nature missions.
/// Authored build-along content. Completing a build log entry is a self-report
/// only; it never writes mastery, readiness or Question Proof (see CONTEXT.md).
enum ArduinoTrack: String, CaseIterable, Identifiable, Sendable {
    case foundation = "Agent training"
    case spyGadget = "Spy gadget missions"
    case natureWatch = "Nature watch missions"
    case capstone = "Final mission"

    static var spyGadgets: ArduinoTrack { .spyGadget }

    var id: String { rawValue }

    var title: String { rawValue }

    var subtitle: String {
        switch self {
        case .foundation:
            return "Learn the circuit loop and digital outputs"
        case .spyGadget:
            return "Motion, light, sound & skin resistance"
        case .natureWatch:
            return "Outdoor sensors, sleep power & CSV data"
        case .capstone:
            return "Combine your sensors to answer a real question"
        }
    }

    var symbol: String {
        switch self {
        case .foundation: return "lightbulb.fill"
        case .spyGadget: return "binoculars.fill"
        case .natureWatch: return "leaf.fill"
        case .capstone: return "flag.checkered"
        }
    }
}

// MARK: - Links, Pinout & Specs

struct ArduinoLink: Identifiable, Hashable, Sendable {
    let title: String
    let detail: String
    let urlString: String
    let isVideo: Bool
    var id: String { urlString }
    var url: URL? { URL(string: urlString) }
}

enum ArduinoWireTone: String, CaseIterable, Hashable, Sendable {
    case power
    case ground
    case signal
    case analog
    case pwm
    case secondary
}

struct ArduinoPinConnection: Identifiable, Hashable, Sendable {
    var id: String { "\(pin)-\(connectsTo)" }
    let pin: String
    let wireTone: ArduinoWireTone
    let connectsTo: String
    let purpose: String
}

struct ArduinoSpec: Identifiable, Hashable, Sendable {
    var id: String { label }
    let label: String
    let value: String
}

// MARK: - Interactive What-If Parameters

struct ArduinoParamChoice: Identifiable, Hashable, Sendable {
    var id: Int { value }
    let label: String
    let value: Int
    let codeReplacement: String
    let summary: String
}

enum ArduinoParamKind: Hashable, Sendable {
    case choices([ArduinoParamChoice])
    case range(min: Int, max: Int, step: Int, unit: String, codeTemplate: String)
}

struct ArduinoParam: Identifiable, Hashable, Sendable {
    let id: String
    let label: String
    let partFragment: String
    let codeTarget: String
    let defaultValue: Int
    let kind: ArduinoParamKind

    func replacementText(for value: Int) -> String {
        switch kind {
        case .choices(let choices):
            return choices.first { $0.value == value }?.codeReplacement ?? codeTarget
        case .range(_, _, _, _, let template):
            return template.replacingOccurrences(of: "%d", with: "\(value)")
        }
    }

    func applying(value: Int, to code: String) -> String {
        guard !codeTarget.isEmpty, value != defaultValue else { return code }
        return code.replacingOccurrences(of: codeTarget, with: replacementText(for: value))
    }
}

// MARK: - Sonar Target Material Acoustics

enum ArduinoSonarTarget: String, CaseIterable, Identifiable, Sendable {
    case hardBook = "Hard book"
    case cardboardBox = "Cardboard box"
    case roundBall = "Round ball"
    case softCushion = "Soft cushion"

    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .hardBook: return "book.closed.fill"
        case .cardboardBox: return "shippingbox.fill"
        case .roundBall: return "basketball.fill"
        case .softCushion: return "pillow.fill"
        }
    }

    var jitterCm: Int {
        switch self {
        case .hardBook: return 0
        case .cardboardBox: return 1
        case .roundBall: return 6
        case .softCushion: return 0
        }
    }

    var missRate: Double {
        switch self {
        case .hardBook, .cardboardBox: return 0.0
        case .roundBall: return 0.15
        case .softCushion: return 1.0
        }
    }

    var swallowsPulse: Bool {
        missRate >= 1.0
    }

    var acousticNote: String {
        switch self {
        case .hardBook:
            return "Flat hard cover reflects a crisp 40 kHz echo (±0 cm jitter, 0% miss)."
        case .cardboardBox:
            return "Corrugated cardboard reflects cleanly with ±1 cm edge scatter."
        case .roundBall:
            return "Curved ball scatters sound sideways (±6 cm jitter, \(Int(missRate * 100))% glance misses)."
        case .softCushion:
            return "Soft fabric absorbs the 40 kHz ping (\(Int(missRate * 100))% loss) -> pulseIn() returns 0 us timeout -> 400 cm fallback."
        }
    }

    func simulatedDistanceCm(trueDistanceCm: Int) -> Int {
        if swallowsPulse { return 400 }
        switch self {
        case .hardBook: return trueDistanceCm
        case .cardboardBox: return min(180, trueDistanceCm + 1)
        case .roundBall: return min(180, trueDistanceCm + 9)
        case .softCushion: return 400
        }
    }
}

// MARK: - Uno R3 & Breadboard Interactive Landmarks

struct ArduinoBoardLandmark: Identifiable, Hashable, Sendable {
    let id: String
    let title: String
    let shortLabel: String
    let symbol: String
    let anchorX: CGFloat
    let anchorY: CGFloat
    let subtitle: String
    let detail: String
    let specs: [ArduinoSpec]
}

extension ArduinoMissionCatalog {
    static let boardLandmarks: [ArduinoBoardLandmark] = [
        ArduinoBoardLandmark(
            id: "usb",
            title: "USB Port (Power + Serial)",
            shortLabel: "USB Port",
            symbol: "cable.connector",
            anchorX: 0.10,
            anchorY: 0.32,
            subtitle: "5V safe power & 9600 baud Serial link",
            detail: "Your USB cable carries both safe 5-volt power and your uploaded sketch. Once the sketch is running, the same wire carries Serial.println() messages and Serial Plotter graphs back to your screen.",
            specs: [
                ArduinoSpec(label: "Supply voltage", value: "5.0V USB regulated"),
                ArduinoSpec(label: "Serial baud", value: "9600 bits / sec")
            ]
        ),
        ArduinoBoardLandmark(
            id: "mcu",
            title: "ATmega328P Microcontroller",
            shortLabel: "ATmega328P",
            symbol: "cpu",
            anchorX: 0.36,
            anchorY: 0.55,
            subtitle: "The 16 MHz brain running setup() and loop()",
            detail: "This black chip runs setup() once when powered on, then repeats loop() thousands of times a second. It remembers your sketch in Flash memory even when unplugged.",
            specs: [
                ArduinoSpec(label: "Clock speed", value: "16 MHz"),
                ArduinoSpec(label: "Memory", value: "32 KB Flash · 2 KB SRAM")
            ]
        ),
        ArduinoBoardLandmark(
            id: "digital",
            title: "Digital Pins D0–D13 & ~PWM",
            shortLabel: "Digital D0–D13",
            symbol: "switch.2",
            anchorX: 0.38,
            anchorY: 0.16,
            subtitle: "5V HIGH or 0V LOW switches + tone() output",
            detail: "Digital pins either listen (INPUT / INPUT_PULLUP) or push 5V out (OUTPUT). Pins marked with ~ (3, 5, 6, 9, 10, 11) can switch fast for PWM dimming, servo angles, and piezo tones. Keep D0/D1 free while uploading.",
            specs: [
                ArduinoSpec(label: "Logic levels", value: "HIGH = 5V · LOW = 0V"),
                ArduinoSpec(label: "Max pin current", value: "20 mA safe")
            ]
        ),
        ArduinoBoardLandmark(
            id: "analog",
            title: "Analog Inputs A0–A5",
            shortLabel: "Analog A0–A5",
            symbol: "waveform.path.ecg",
            anchorX: 0.45,
            anchorY: 0.82,
            subtitle: "10-bit voltmeter (0 to 1023 steps)",
            detail: "Unlike digital pins that only know YES or NO, analog pins measure shades of voltage between 0V and 5V and turn them into a number from 0 to 1023 for light sensors and foil finger pads.",
            specs: [
                ArduinoSpec(label: "ADC range", value: "0–1023 (10-bit)"),
                ArduinoSpec(label: "Step size", value: "~4.9 mV per unit")
            ]
        ),
        ArduinoBoardLandmark(
            id: "power",
            title: "Power Header (5V, 3.3V, GND)",
            shortLabel: "5V & GND",
            symbol: "bolt.fill",
            anchorX: 0.24,
            anchorY: 0.82,
            subtitle: "Every circuit starts at 5V or a pin and returns to GND",
            detail: "Every sensor and LED needs a complete loop back to GND (0 volts). Connect the Uno's 5V and GND pins to your breadboard's + and - rails so every part can share them.",
            specs: [
                ArduinoSpec(label: "Main rail", value: "5V DC output"),
                ArduinoSpec(label: "Return path", value: "3x GND pins (0V)")
            ]
        ),
        ArduinoBoardLandmark(
            id: "reset",
            title: "RESET Button",
            shortLabel: "RESET",
            symbol: "arrow.counterclockwise.circle",
            anchorX: 0.14,
            anchorY: 0.18,
            subtitle: "Restarts setup() from line 1 on demand",
            detail: "Pressing RESET restarts your program from the top of setup() without unplugging USB — essential when calibrating the Truth Meter's 50-sample calm baseline or restarting a visitor tally.",
            specs: [
                ArduinoSpec(label: "Action", value: "Re-runs setup()"),
                ArduinoSpec(label: "Flash sketch", value: "Kept safe in memory")
            ]
        ),
        ArduinoBoardLandmark(
            id: "breadboard",
            title: "Breadboard 5-Hole Row Rule",
            shortLabel: "Breadboard Rows",
            symbol: "square.grid.3x3.topleft.filled",
            anchorX: 0.80,
            anchorY: 0.50,
            subtitle: "5 holes in a numbered row share one metal clip",
            detail: "Inside the breadboard, each numbered half-row of 5 holes (a-e or f-j) is connected by a hidden metal spring clip. To connect an LED leg to a resistor, plug them into different holes of the SAME numbered row. The middle ravine separates left from right.",
            specs: [
                ArduinoSpec(label: "Row clip", value: "5 holes (a-e / f-j)"),
                ArduinoSpec(label: "Side rails", value: "Long + (5V) & - (GND)")
            ]
        )
    ]
}

// MARK: - Mission Model & Shared Views

struct ArduinoMission: Identifiable, Hashable, Sendable {
    let missionID: ArduinoMissionID
    var id: String { missionID.rawValue }
    let track: ArduinoTrack
    let number: String
    let title: String
    let hook: String
    let conceptTitle: String
    let concept: String
    let symbol: String
    let visualKind: String
    let visualAlt: String
    let minutes: String
    let level: String
    let needsAdultSetup: Bool
    let parts: [String]
    let wiring: [ArduinoPinConnection]
    let specs: [ArduinoSpec]
    let params: [ArduinoParam]
    let steps: [String]
    let code: String
    let codeWalkthrough: [String]
    let notice: [String]
    let challenge: String
    let safety: String
    let links: [ArduinoLink]

    /// Shared helper to toggle a selected part and synchronize the matching parameter highlight.
    func togglePartSelection(
        at index: Int,
        selectedPartIndex: inout Int?,
        focusedParamID: inout String?
    ) {
        if selectedPartIndex == index {
            selectedPartIndex = nil
            focusedParamID = nil
        } else {
            selectedPartIndex = index
            let part = parts[index]
            focusedParamID = params.first(where: {
                part.localizedCaseInsensitiveContains($0.partFragment)
            })?.id
        }
    }
}

/// Shared 2x2 specifications grid used on both the Uno board tour and mission detail pages.
struct ArduinoSpecsGrid: View {
    let specs: [ArduinoSpec]

    var body: some View {
        LazyVGrid(
            columns: [
                GridItem(.flexible(minimum: 120), spacing: Theme.Spacing.small, alignment: .leading),
                GridItem(.flexible(minimum: 120), spacing: Theme.Spacing.small, alignment: .leading)
            ],
            alignment: .leading,
            spacing: Theme.Spacing.small
        ) {
            ForEach(specs) { spec in
                VStack(alignment: .leading, spacing: 2) {
                    Text(spec.label)
                        .font(.kymaiaCaption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                    Text(spec.value)
                        .font(.kymaiaMonoCaption.weight(.semibold))
                        .foregroundStyle(Theme.Colors.primaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.horizontal, Theme.Spacing.small)
                .padding(.vertical, Theme.Spacing.xs)
                .frame(maxWidth: .infinity, alignment: .leading)
                .journalIllustrationSurface()
                .journalIllustrationClip()
            }
        }
    }
}

/// A learner-kept build log, stored as one comma-joined string in AppStorage.
enum ArduinoBuildLog {
    /// The one AppStorage key both the gallery and mission pages must use.
    static let storageKey = "arduinoMissionsBuilt"

    static func encode(_ built: Set<String>) -> String {
        built.sorted().joined(separator: ",")
    }

    static func decode(_ stored: String, validIDs: Set<String>) -> Set<String> {
        guard !stored.isEmpty else { return [] }
        let parts = stored.split(separator: ",").map(String.init)
        return Set(parts).intersection(validIDs)
    }

    static func toggling(_ id: String, in built: Set<String>) -> Set<String> {
        var next = built
        if next.contains(id) {
            next.remove(id)
        } else {
            next.insert(id)
        }
        return next
    }
}

// MARK: - Internal Token Bridges to Kymaia Design System

// Resolve the global tokens without assuming the macOS or iPad module name.
private typealias ArduinoDesignSpacing = Spacing

extension Theme {
    enum Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = ArduinoDesignSpacing.xs
        static let small: CGFloat = ArduinoDesignSpacing.sm
        static let medium: CGFloat = ArduinoDesignSpacing.md
        static let large: CGFloat = ArduinoDesignSpacing.lg
        static let xl: CGFloat = ArduinoDesignSpacing.xl
        static let xxl: CGFloat = ArduinoDesignSpacing.xxl
    }

    enum Radius {
        static let xs: CGFloat = CornerRadius.micro
        static let small: CGFloat = CornerRadius.small
        static let medium: CGFloat = CornerRadius.medium
    }

    enum Stroke {
        static let hairline: CGFloat = StrokeWidth.light
    }

    enum Colors {
        static var accent: Color { .kymaiaPrimary }
        static var primaryText: Color { .kymaiaInk }
        static var secondaryText: Color { .kymaiaMutedInk }
        static var secondaryBackground: Color { .kymaiaControlFill }
        static var border: Color { .kymaiaHairline }
        static var success: Color { .kymaiaSuccess }
        static var warning: Color { .kymaiaWarning }
        static var error: Color { .kymaiaError }
    }
}

extension Font {
    static var kymaiaMonoCaption: Font { .kymaiaCodeMath }
    static var kymaiaCode: Font { .kymaiaCodeMath }
    static var kymaiaTitle1: Font { .kymaiaPageTitle }
}

extension Animation {
    static var kymaiaSpring: Animation { .kymaiaStandard }
}

extension View {
    func readout() -> some View {
        padding(.horizontal, Spacing.sm)
            .padding(.vertical, Spacing.xs)
            .background(Color.kymaiaControlFill, in: Capsule())
    }
}

