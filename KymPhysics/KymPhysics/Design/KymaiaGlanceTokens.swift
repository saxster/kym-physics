import SwiftUI
#if canImport(AppKit)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

/// A subject's colour and glyph. Subjects carry no colour of their own, so one is derived from
/// the name: well-known school subjects get a fixed colour, anything else a stable pick from the
/// same small palette (FNV-1a over the normalized name, so it never changes between launches).
/// The palette is the platform's semantic system colours, which adapt to dark mode and
/// Increased Contrast on their own.
enum KymaiaSubjectStyle {
    enum Hue: Int, CaseIterable, Sendable {
        case blue, green, orange, pink, purple, teal, indigo, brown, red, cyan
    }

    private struct Known {
        let keywords: [String]
        let hue: Hue
        let symbol: String
    }

    private static let known: [Known] = [
        Known(keywords: ["math", "maths", "mathematics", "algebra", "geometry", "arithmetic"], hue: .blue, symbol: "divide"),
        Known(keywords: ["science", "biology", "chemistry", "physics"], hue: .green, symbol: "flask.fill"),
        Known(keywords: ["english", "literature", "reading", "writing", "grammar"], hue: .orange, symbol: "textformat"),
        Known(keywords: ["history"], hue: .brown, symbol: "hourglass"),
        Known(keywords: ["french", "spanish", "german", "hindi", "language", "languages"], hue: .pink, symbol: "character.bubble"),
        Known(keywords: ["geography"], hue: .teal, symbol: "globe.europe.africa.fill"),
        Known(keywords: ["computing", "ict", "computer"], hue: .indigo, symbol: "desktopcomputer"),
        Known(keywords: ["art", "design"], hue: .red, symbol: "paintpalette.fill"),
        Known(keywords: ["music"], hue: .cyan, symbol: "music.note"),
        Known(keywords: ["mental", "thinking", "models", "journal"], hue: .purple, symbol: "brain.head.profile")
    ]

    static let fallbackSymbol = "book.closed.fill"

    static func hue(for name: String) -> Hue {
        if let match = knownMatch(for: name) {
            return match.hue
        }
        let hash = fnv1a(normalized(name))
        let index = Int(hash % UInt64(Hue.allCases.count))
        return Hue.allCases[index]
    }

    static func symbol(for name: String) -> String {
        knownMatch(for: name)?.symbol ?? fallbackSymbol
    }

    static func color(for name: String) -> Color {
        hue(for: name).color
    }

    private static func knownMatch(for name: String) -> Known? {
        let words = Set(normalized(name).split(whereSeparator: { !$0.isLetter }).map(String.init))
        return known.first { entry in entry.keywords.contains { words.contains($0) } }
    }

    private static func normalized(_ name: String) -> String {
        name.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }

    private static func fnv1a(_ text: String) -> UInt64 {
        var hash: UInt64 = 0xcbf2_9ce4_8422_2325
        for byte in text.utf8 {
            hash ^= UInt64(byte)
            hash = hash &* 0x0000_0100_0000_01B3
        }
        return hash
    }
}

extension KymaiaSubjectStyle.Hue {
    var color: Color {
        #if canImport(AppKit)
        Color(nsColor: platformColor)
        #else
        Color(uiColor: platformColor)
        #endif
    }

    #if canImport(AppKit)
    private var platformColor: NSColor {
        switch self {
        case .blue: return .systemBlue
        case .green: return .systemGreen
        case .orange: return .systemOrange
        case .pink: return .systemPink
        case .purple: return .systemPurple
        case .teal: return .systemTeal
        case .indigo: return .systemIndigo
        case .brown: return .systemBrown
        case .red: return .systemRed
        case .cyan: return .systemCyan
        }
    }
    #else
    private var platformColor: UIColor {
        switch self {
        case .blue: return .systemBlue
        case .green: return .systemGreen
        case .orange: return .systemOrange
        case .pink: return .systemPink
        case .purple: return .systemPurple
        case .teal: return .systemTeal
        case .indigo: return .systemIndigo
        case .brown: return .systemBrown
        case .red: return .systemRed
        case .cyan: return .systemCyan
        }
    }
    #endif
}

/// The sidebar's glanceable tiles (Journal's Insights tiles): a coloured fill with white text.
/// Both fills keep white text at 4.5:1 or better at every point of the gradient, in light and dark.
enum KymaiaTileStyle {
    /// The streak tile runs from the theme accent to its secondary colour.
    static var streakFill: LinearGradient {
        let palette = CuratedColorScheme.current.palette
        let start = KymaiaAdaptiveColor(
            light: palette.primary.light,
            dark: palette.primary.light,
            highContrastLight: palette.primary.highContrastLight,
            highContrastDark: palette.primary.highContrastLight
        )
        let end = KymaiaAdaptiveColor(
            light: palette.secondary.light,
            dark: palette.secondary.light,
            highContrastLight: palette.primary.highContrastLight,
            highContrastDark: palette.primary.highContrastLight
        )
        return LinearGradient(colors: [start.color, end.color], startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    /// The week tile is a calm teal in every theme, so it never reads as a second accent.
    static var weekFill: LinearGradient {
        LinearGradient(
            colors: [weekStart.color, weekEnd.color],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static let weekStart = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0x1E6F8C), dark: KymaiaRGBA(hex: 0x1E6F8C))
    static let weekEnd = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0x1F7F6B), dark: KymaiaRGBA(hex: 0x1F7F6B))
    static let ink = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0xFFFFFF), dark: KymaiaRGBA(hex: 0xFFFFFF))
    static let highlight = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0xFFD166), dark: KymaiaRGBA(hex: 0xFFD166))
}

extension Color {
    /// Text and glyphs on a sidebar tile.
    static var kymaiaTileInk: Color { KymaiaTileStyle.ink.color }
    /// A deadline marker on a tile's week strip.
    static var kymaiaTileHighlight: Color { KymaiaTileStyle.highlight.color }
    /// The week tile's base colour, for text on a white day cell.
    static var kymaiaWeekTile: Color { KymaiaTileStyle.weekStart.color }
    /// Journal entries' colour: the same purple everywhere a Journal entry is marked.
    static var kymaiaJournal: Color { KymaiaSubjectStyle.Hue.purple.color }
}
