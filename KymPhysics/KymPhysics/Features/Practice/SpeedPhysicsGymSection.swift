import SwiftUI

/// SpeedPhysics Mental Gym (`../kym_tutor/Features/SpeedMath` adapted for Grade 8 Physics):
/// Rapid-fire fluency sprints for SI Unit Conversions, Formula Rearrangements, and Chapter 0 Fermi Estimation.
enum SpeedPhysicsGymEngine {
    enum Track: String, CaseIterable, Identifiable, Sendable {
        case siUnits = "SI Unit & Area/Volume Prefix Reflex"
        case formulaRearrange = "Formula Triangle Rearrangement Sprint"
        case fermiEstimation = "Ch 0 Fermi Order-of-Magnitude Gym"

        var id: String { rawValue }

        var subtitle: String {
            switch self {
            case .siUnits:
                return "Eliminate the #1 Cambridge Science 8 calculation trap: cm² → m², km/h → m/s, mA → A, kPa → Pa, g/cm³ → kg/m³"
            case .formulaRearrange:
                return "Instant algebraic rearrangement of P = F/A, v = d/t, M = F·d⊥, V = I·R, v = f·λ, and ρ = m/V"
            case .fermiEstimation:
                return "Moving World Ch 0 powers-of-ten mental estimation for real Mumbai and everyday physical systems"
            }
        }
    }

    struct SprintItem: Identifiable, Sendable, Equatable {
        let id: String
        let track: Track
        let prompt: String
        let options: [String]
        let correctOption: String
        let mentalShortcut: String
        let topicRef: String
    }

    static let allItems: [SprintItem] = [
        // Track 1: SI Units & Area/Volume Prefix Reflex
        SprintItem(
            id: "si-cm2-m2",
            track: .siUnits,
            prompt: "A shoe heel has contact area A = 4 cm². What is this area in SI square metres (m²)?",
            options: ["4 × 10⁻⁴ m² (0.0004 m²)", "4 × 10⁻² m² (0.04 m²)", "400 m²", "4 × 10⁻⁶ m²"],
            correctOption: "4 × 10⁻⁴ m² (0.0004 m²)",
            mentalShortcut: "1 m = 100 cm, so 1 m² = 100 cm × 100 cm = 10,000 cm² (10⁴ cm²). Always divide cm² by 10,000!",
            topicRef: "Unit 3.5 · Ch 6"
        ),
        SprintItem(
            id: "si-kmh-ms",
            track: .siUnits,
            prompt: "A Western Line fast local train travels at 72 km/h. What is its speed in m/s?",
            options: ["20 m/s", "259.2 m/s", "7.2 m/s", "12 m/s"],
            correctOption: "20 m/s",
            mentalShortcut: "To convert km/h → m/s, divide by 3.6 (since 1000 m / 3600 s = 1 / 3.6). 72 ÷ 3.6 = 20 m/s.",
            topicRef: "Unit 3.2 · Ch 1"
        ),
        SprintItem(
            id: "si-density-gcm3",
            track: .siUnits,
            prompt: "Pure water has density ρ = 1.0 g/cm³. What is its density in SI units (kg/m³)?",
            options: ["1000 kg/m³", "10 kg/m³", "0.001 kg/m³", "100 kg/m³"],
            correctOption: "1000 kg/m³",
            mentalShortcut: "1 g/cm³ = (10⁻³ kg) / (10⁻⁶ m³) = 1000 kg/m³. Multiply g/cm³ by 1000!",
            topicRef: "Unit 3.6 · Ch 6"
        ),
        SprintItem(
            id: "si-ma-amp",
            track: .siUnits,
            prompt: "An electromagnet coil draws 250 mA of current. What is this current in amperes (A)?",
            options: ["0.25 A", "2.5 A", "25 A", "0.025 A"],
            correctOption: "0.25 A",
            mentalShortcut: "milli (m) means 10⁻³ (divide by 1000): 250 ÷ 1000 = 0.25 A.",
            topicRef: "Unit 9.3 · Ch 12–13"
        ),
        SprintItem(
            id: "si-kpa-pa",
            track: .siUnits,
            prompt: "Atmospheric pressure at Marine Drive sea level is 101.3 kPa. How many pascals (N/m²) is this?",
            options: ["101,300 Pa", "1,013 Pa", "10.13 Pa", "1,013,000 Pa"],
            correctOption: "101,300 Pa",
            mentalShortcut: "kilo (k) means 10³ (multiply by 1000): 101.3 × 1000 = 101,300 Pa.",
            topicRef: "Unit 3.6 · Ch 6"
        ),

        // Track 2: Formula Triangle Rearrangement Sprint
        SprintItem(
            id: "form-pressure-force",
            track: .formulaRearrange,
            prompt: "Given solid pressure P = F ÷ A, how do you rearrange to solve for the contact area A?",
            options: ["A = F ÷ P", "A = P ÷ F", "A = P × F", "A = F − P"],
            correctOption: "A = F ÷ P",
            mentalShortcut: "Since P × A = F, dividing both sides by P gives A = F ÷ P. Small pressure requires large area!",
            topicRef: "Unit 3.5 · Ch 6"
        ),
        SprintItem(
            id: "form-moment-distance",
            track: .formulaRearrange,
            prompt: "Given moment of a force M = F × d⊥, how do you solve for the perpendicular distance d⊥ from the pivot?",
            options: ["d⊥ = M ÷ F", "d⊥ = F ÷ M", "d⊥ = M × F", "d⊥ = M − F"],
            correctOption: "d⊥ = M ÷ F",
            mentalShortcut: "Divide the turning moment M (in N m) by the applied force F (in N): d⊥ = M ÷ F.",
            topicRef: "Unit 3.4 · Ch 3"
        ),
        SprintItem(
            id: "form-speed-time",
            track: .formulaRearrange,
            prompt: "Light travels at v = 3 × 10⁸ m/s across distance d. Which formula gives the time taken t?",
            options: ["t = d ÷ v", "t = v ÷ d", "t = v × d", "t = d − v"],
            correctOption: "t = d ÷ v",
            mentalShortcut: "Since d = v × t, dividing distance by speed gives time: t = d ÷ v (metres ÷ m/s = seconds).",
            topicRef: "Unit 3.2 · Ch 1 & Ch 10"
        ),
        SprintItem(
            id: "form-wave-lambda",
            track: .formulaRearrange,
            prompt: "Given the wave equation v = f × λ, which expression gives wavelength λ?",
            options: ["λ = v ÷ f", "λ = f ÷ v", "λ = v × f", "λ = 1 ÷ f"],
            correctOption: "λ = v ÷ f",
            mentalShortcut: "Higher frequency f at fixed wave speed v means shorter wavelength: λ = v ÷ f.",
            topicRef: "Ch 9 & Ch 11"
        ),

        // Track 3: Chapter 0 Fermi Order-of-Magnitude Estimation
        SprintItem(
            id: "fermi-heartbeat",
            track: .fermiEstimation,
            prompt: "Order of magnitude: Roughly how many seconds are in 1 single day (24 hours)?",
            options: ["~10⁵ s (86,400 s)", "~10³ s (3,600 s)", "~10⁷ s", "~10⁴ s"],
            correctOption: "~10⁵ s (86,400 s)",
            mentalShortcut: "24 × 60 × 60 = 86,400 s ≈ 0.86 × 10⁵ s — close to 10⁵ seconds per day!",
            topicRef: "Moving World Ch 0"
        ),
        SprintItem(
            id: "fermi-apple-weight",
            track: .fermiEstimation,
            prompt: "Order of magnitude: What is the gravitational weight W = mg of a medium 100 g apple on Earth?",
            options: ["~1 N", "~10 N", "~100 N", "~0.01 N"],
            correctOption: "~1 N",
            mentalShortcut: "100 g = 0.1 kg, and g ≈ 9.8 N/kg ≈ 10 N/kg, so W = 0.1 × 10 ≈ 1 newton!",
            topicRef: "Unit 3.1 · Ch 0 & Ch 2"
        ),
        SprintItem(
            id: "fermi-walking-power",
            track: .fermiEstimation,
            prompt: "Order of magnitude: What is the mechanical power output of a student climbing stairs steadily?",
            options: ["~10² W (150–200 W)", "~1 W", "~10⁴ W (10 kW)", "~10⁶ W"],
            correctOption: "~10² W (150–200 W)",
            mentalShortcut: "Lifting 50 kg (500 N) up a 3 m flight of stairs (1500 J) in ~8 seconds requires P = 1500 / 8 ≈ 190 W (~2 × 10² W).",
            topicRef: "Moving World Ch 0 & Ch 5"
        )
    ]

    static func items(for track: Track) -> [SprintItem] {
        allItems.filter { $0.track == track }
    }
}

struct SpeedPhysicsGymSection: View {
    @State private var selectedTrack: SpeedPhysicsGymEngine.Track = .siUnits
    @State private var currentIndex: Int = 0
    @State private var selectedAnswer: String? = nil
    @State private var streakCount: Int = 0
    @State private var bestStreak: Int = UserDefaults.standard.integer(forKey: "kymphysics.speedgym.bestStreak")
    @State private var totalCorrect: Int = 0

    private var trackItems: [SpeedPhysicsGymEngine.SprintItem] {
        SpeedPhysicsGymEngine.items(for: selectedTrack)
    }

    private var activeItem: SpeedPhysicsGymEngine.SprintItem {
        trackItems[min(max(0, currentIndex), max(0, trackItems.count - 1))]
    }

    var body: some View {
        JournalSection(
            title: "SpeedPhysics Mental Gym · SI Units, Formula Reflex & Fermi Estimation",
            subtitle: selectedTrack.subtitle
        ) {
            // Track Selector + Streak Counter
            HStack(spacing: Spacing.sm) {
                ForEach(SpeedPhysicsGymEngine.Track.allCases) { track in
                    StandardFilterChip(track.rawValue, isSelected: selectedTrack == track) {
                        selectedTrack = track
                        currentIndex = 0
                        selectedAnswer = nil
                    }
                }
                Spacer()
                JournalBadge(text: "Streak: \(streakCount) · Best: \(bestStreak)", tone: .positive)
            }

            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    HStack {
                        JournalBadge(text: activeItem.topicRef, tone: .accent)
                        JournalBadge(text: "Sprint \(currentIndex + 1) of \(trackItems.count)", tone: .neutral)
                        Spacer()
                        Text("Solved this session: \(totalCorrect)")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)
                    }

                    Text(activeItem.prompt)
                        .font(.kymaiaTitle3)
                        .foregroundStyle(Color.kymaiaInk)

                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: Spacing.md), GridItem(.flexible(), spacing: Spacing.md)],
                        spacing: Spacing.md
                    ) {
                        ForEach(activeItem.options, id: \.self) { option in
                            let isChosen = selectedAnswer == option
                            let isRight = option == activeItem.correctOption

                            Button {
                                selectedAnswer = option
                                if isRight {
                                    streakCount += 1
                                    totalCorrect += 1
                                    if streakCount > bestStreak {
                                        bestStreak = streakCount
                                        UserDefaults.standard.set(bestStreak, forKey: "kymphysics.speedgym.bestStreak")
                                    }
                                } else {
                                    streakCount = 0
                                }
                            } label: {
                                HStack {
                                    Text(option)
                                        .font(.kymaiaMonoBody)
                                        .foregroundStyle(Color.kymaiaInk)
                                    Spacer()
                                    if selectedAnswer != nil {
                                        if isRight {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundStyle(Color.kymaiaSuccess)
                                        } else if isChosen {
                                            Image(systemName: "xmark.circle.fill")
                                                .foregroundStyle(Color.kymaiaError)
                                        }
                                    }
                                }
                                .padding(Spacing.md)
                                .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                        .fill(
                                            selectedAnswer == nil
                                                ? Color.kymaiaSurface
                                                : (isRight
                                                    ? Color.kymaiaSuccess.opacity(0.14)
                                                    : (isChosen ? Color.kymaiaError.opacity(0.14) : Color.kymaiaSurface))
                                        )
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                        .strokeBorder(
                                            isChosen ? Color.kymaiaPrimary : Color.kymaiaBorderSubtle,
                                            lineWidth: isChosen ? StrokeWidth.emphasis : StrokeWidth.light
                                        )
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if let chosen = selectedAnswer {
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text(chosen == activeItem.correctOption ? "Exact Match! Mental Shortcut:" : "Watch Out! First-Principles Mental Shortcut:")
                                .font(.kymaiaCaption.weight(.bold))
                                .foregroundStyle(chosen == activeItem.correctOption ? Color.kymaiaSuccess : Color.kymaiaWarning)
                            Text(activeItem.mentalShortcut)
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaInk)
                        }
                        .padding(Spacing.md)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                                .fill(Color.kymaiaSurface)
                        )

                        HStack {
                            Spacer()
                            Button {
                                selectedAnswer = nil
                                currentIndex = (currentIndex + 1) % max(1, trackItems.count)
                            } label: {
                                Label("Next Reflex Sprint →", systemImage: "bolt.fill")
                                    .font(.kymaiaCallout.weight(.semibold))
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(Color.kymaiaPrimary)
                        }
                    }
                }
            }
        }
    }
}
