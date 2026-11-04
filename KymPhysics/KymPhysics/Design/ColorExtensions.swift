// Color extensions for Kymaia brand identity

import SwiftUI

enum RitualPhase: String, CaseIterable, Sendable {
    case identityPrime
    case warmRetrieval
    case struggleZone
    case breakthrough
    case curiosityHook
    case reflection
    case complete

    var displayName: String {
        switch self {
        case .identityPrime: return "Identity Prime"
        case .warmRetrieval: return "Warm Retrieval"
        case .struggleZone: return "Struggle Zone"
        case .breakthrough: return "Breakthrough"
        case .curiosityHook: return "Curiosity Hook"
        case .reflection: return "Reflection"
        case .complete: return "Complete"
        }
    }

    var durationLabel: String {
        switch self {
        case .identityPrime: return "30s"
        case .warmRetrieval: return "3 min"
        case .struggleZone: return "15 min"
        case .breakthrough: return "1 min"
        case .curiosityHook: return "1 min"
        case .reflection: return "1 min"
        case .complete: return "Done"
        }
    }
}

// MARK: - Hex Color Init

extension Color {
    /// Initialize a Color from a hex string (e.g. "3A1F8E" or "#3A1F8E")
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let alpha: UInt64
        let red: UInt64
        let green: UInt64
        let blue: UInt64
        switch hex.count {
        case 6:  // RGB
            (alpha, red, green, blue) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  // ARGB
            (alpha, red, green, blue) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (alpha, red, green, blue) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(red) / 255,
            green: Double(green) / 255,
            blue: Double(blue) / 255,
            opacity: Double(alpha) / 255
        )
    }
}

// MARK: - Brand Gradients

extension LinearGradient {
    /// Primary editorial accent wash for the active curated palette.
    static var kymaiaPrimary: LinearGradient {
        LinearGradient(
            colors: [Color.kymaiaPrimary, Color.kymaiaSecondary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    /// Success wash - sage over dark paper.
    static var kymaiaSuccess: LinearGradient {
        LinearGradient(
            colors: [Color.kymaiaSuccess, Color.kymaiaSecondary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    /// Warm wash using the active palette's supporting accent.
    static var kymaiaWarm: LinearGradient {
        LinearGradient(
            colors: [Color.kymaiaSecondary, Color.kymaiaPrimary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    /// Error wash - coral and recitation magenta.
    static let kymaiaError = LinearGradient(
        colors: [Color.kymaiaError, Color.kymaiaLive],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    /// Phase-specific gradient for ritual phases
    static func phaseGradient(_ phase: RitualPhase) -> LinearGradient {
        switch phase {
        case .identityPrime:
            return LinearGradient(
                colors: [Color.kymaiaLive, Color.kymaiaPrimary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .warmRetrieval:
            return LinearGradient(
                colors: [Color.kymaiaPrimary, Color.kymaiaSecondary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .struggleZone:
            return LinearGradient(
                colors: [Color.kymaiaError, Color.kymaiaLive],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .breakthrough:
            return LinearGradient(
                colors: [Color.kymaiaSecondary, Color.kymaiaPrimary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .curiosityHook:
            return LinearGradient(
                colors: [Color.kymaiaPrimary, Color.kymaiaSuccess],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .reflection:
            return LinearGradient(
                colors: [Color.kymaiaSuccess, Color.kymaiaSecondary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .complete:
            return LinearGradient(
                colors: [Color.kymaiaSuccess, Color.kymaiaPrimary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - Session Mode Style

/// Unique visual identity for each session mode
enum SessionModeStyle {
    case standard
    case gauntlet
    case gym
    case survival
    case stream
    case mentalGym
    case reading
    case commute

    var gradient: LinearGradient {
        switch self {
        case .standard:
            return .kymaiaPrimary
        case .gauntlet:
            return LinearGradient(
                colors: [Color.kymaiaError, Color.kymaiaPrimary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .gym:
            return LinearGradient(
                colors: [Color.kymaiaSuccess, Color.kymaiaSecondary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .survival:
            return LinearGradient(
                colors: [Color.kymaiaLive, Color.kymaiaError],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .stream:
            return LinearGradient(
                colors: [Color.kymaiaPrimary, Color.kymaiaLive],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .mentalGym:
            return LinearGradient(
                colors: [Color.kymaiaLive, Color.kymaiaSecondary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .reading:
            return LinearGradient(
                colors: [Color.kymaiaSecondary, Color.kymaiaPrimary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .commute:
            return LinearGradient(
                colors: [Color.kymaiaSurface, Color.kymaiaPrimary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        }
    }

    var accentColor: Color {
        switch self {
        case .standard: return Color.kymaiaPrimary
        case .gauntlet: return Color.kymaiaError
        case .gym: return Color.kymaiaSuccess
        case .survival: return Color.kymaiaLive
        case .stream: return Color.kymaiaPrimary
        case .mentalGym: return Color.kymaiaLive
        case .reading: return Color.kymaiaSecondary
        case .commute: return Color.kymaiaPrimary
        }
    }

    var icon: String {
        switch self {
        case .standard: return "play.fill"
        case .gauntlet: return "bolt.shield"
        case .gym: return "stopwatch.fill"
        case .survival: return "heart.fill"
        case .stream: return "water.waves"
        case .mentalGym: return "brain.head.profile"
        case .reading: return "book.pages"
        case .commute: return "car.fill"
        }
    }

    var title: String {
        switch self {
        case .standard: return "Standard"
        case .gauntlet: return "The Gauntlet"
        case .gym: return "Speed Drills"
        case .survival: return "Survival"
        case .stream: return "The Stream"
        case .mentalGym: return "Inner Citadel"
        case .reading: return "Reading"
        case .commute: return "Commute"
        }
    }

    var subtitle: String {
        switch self {
        case .standard: return "Spaced repetition review"
        case .gauntlet: return "Interleaved practice"
        case .gym: return "Build automaticity"
        case .survival: return "3 lives, no mercy"
        case .stream: return "Endless adaptive flow"
        case .mentalGym: return "Fortify your mind"
        case .reading: return "Discuss materials"
        case .commute: return "Eyes-free voice study"
        }
    }
}

// MARK: - Greeting Period

/// Time-of-day palette for the hero section (distinct from analytics TimeOfDay)
enum GreetingPeriod {
    case morning  // 5-11
    case afternoon  // 12-16
    case evening  // 17-20
    case night  // 21-4

    static func current() -> GreetingPeriod {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5...11: return .morning
        case 12...16: return .afternoon
        case 17...20: return .evening
        default: return .night
        }
    }

    var gradient: LinearGradient {
        switch self {
        case .morning:
            return LinearGradient(
                colors: [Color.kymaiaSecondary, Color.kymaiaPrimary],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .afternoon:
            return LinearGradient(
                colors: [Color.kymaiaPrimary, Color.kymaiaSuccess],
                startPoint: .top, endPoint: .bottom
            )
        case .evening:
            return LinearGradient(
                colors: [Color.kymaiaPrimary, Color.kymaiaLive],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .night:
            return LinearGradient(
                colors: [Color.kymaiaSurface, Color.kymaiaLive],
                startPoint: .top, endPoint: .bottom
            )
        }
    }

    func greeting(for name: String) -> String {
        switch self {
        case .morning: return "Good morning, \(name)"
        case .afternoon: return "Good afternoon, \(name)"
        case .evening: return "Good evening, \(name)"
        case .night: return "Burning the midnight oil, \(name)?"
        }
    }

    var motivationalText: String {
        switch self {
        case .morning: return "Fresh mind, fresh start — let's make it count"
        case .afternoon: return "Keep the momentum, you're doing brilliantly"
        case .evening: return "Wind down with some gentle review"
        case .night: return "The quiet hours are perfect for deep thinking"
        }
    }
}

extension RitualPhase {
    /// The phase as a stop on the ritual's `StageDial`: its step number as the glyph, and the
    /// Struggle Zone drawn as the live stage.
    var standardStage: StandardStage {
        let number = (RitualPhase.allCases.firstIndex(of: self) ?? 0) + 1
        return StandardStage(id: rawValue, label: displayName, glyph: "\(number)", isLive: self == .struggleZone)
    }
}
