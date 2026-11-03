import Foundation
import SwiftUI

/// The app-wide themes a learner can choose in Settings or the toolbar. A theme is a palette
/// plus a heading face and a card shape. Raw values are persisted in `UserDefaults`, so a case
/// may be renamed for display but its raw value never changes.
enum CuratedColorScheme: String, Codable, CaseIterable, Identifiable, KymaiaThemeDescribing {
    case journal
    case movingWorld
    case monsoon
    case botanical
    case sketchbook
    case hearth
    case scholar
    case dusk

    static let storageKey = "curatedColorScheme"
    /// Apple Journal is the default: soft lavender page, white cards.
    static let defaultScheme = CuratedColorScheme.journal

    var id: String { rawValue }

    /// Reads the active theme from `UserDefaults.standard`.
    static var current: CuratedColorScheme {
        selected(in: .standard)
    }

    /// Makes this catalogue the design system's source of the active theme. The provider
    /// re-reads `UserDefaults.standard` on every access, so a new choice shows up at once.
    /// Call it first thing in every process that draws UI.
    static func registerAsKymaiaTheme() {
        KymaiaThemeRuntime.register { CuratedColorScheme.current }
    }

    static func selected(in defaults: UserDefaults) -> CuratedColorScheme {
        guard let stored = defaults.string(forKey: storageKey),
              let scheme = CuratedColorScheme(rawValue: stored) else {
            return defaultScheme
        }
        return scheme
    }

    var displayName: String {
        switch self {
        case .journal: return "Journal"
        case .movingWorld: return "Moving World"
        case .monsoon: return "Marine Drive"
        case .botanical: return "Living World"
        case .sketchbook: return "Sketchbook"
        case .hearth: return "Terracotta"
        case .scholar: return "Scholar"
        case .dusk: return "Dusk"
        }
    }

    var summary: String {
        switch self {
        case .journal: return "Lavender page, white cards, like Apple Journal"
        case .movingWorld: return "Warm rag paper, Galileo alizarin and celestial ultramarine"
        case .monsoon: return "Coastal slate, Arabian Sea teal and warm lantern gold"
        case .botanical: return "Warm rag paper, forest ink and conservation emerald"
        case .sketchbook: return "Deep teal on cream, rounded titles"
        case .hearth: return "Clay on cream, bold serif titles"
        case .scholar: return "Oxford blue and parchment"
        case .dusk: return "Plum, rose, and charcoal"
        }
    }

    var style: CuratedThemeStyle {
        switch self {
        case .journal: return CuratedThemeStyle(headingFace: .system, cardRadius: 20, cardChrome: .shadow)
        case .movingWorld: return CuratedThemeStyle(headingFace: .serif, cardRadius: 16, cardChrome: .hairline)
        case .monsoon: return CuratedThemeStyle(headingFace: .system, cardRadius: 18, cardChrome: .shadow)
        case .botanical: return CuratedThemeStyle(headingFace: .serif, cardRadius: 16, cardChrome: .hairline)
        case .sketchbook: return CuratedThemeStyle(headingFace: .rounded, cardRadius: 20)
        case .hearth: return CuratedThemeStyle(headingFace: .serif, cardRadius: 10)
        case .scholar: return CuratedThemeStyle(headingFace: .serif, cardRadius: 12)
        case .dusk: return CuratedThemeStyle(headingFace: .system, cardRadius: 14)
        }
    }

    var palette: CuratedThemePalette {
        switch self {
        case .journal:
            return CuratedThemePalette(
                backgroundLight: 0xF3F1F7,
                groupedLight: 0xF7F5FA,
                backgroundDark: 0x0E0E12,
                groupedDark: 0x141218,
                primaryLight: 0x5856D6,
                primaryDark: 0x7D7AFF,
                primaryHighContrastLight: 0x4038B8,
                primaryHighContrastDark: 0xA9A7FF,
                secondaryLight: 0x675A8C,
                secondaryDark: 0xB8ACDA,
                neutrals: CuratedThemeNeutrals(
                    surfaceLight: 0xFFFFFF,
                    surfaceDark: 0x1C1B22,
                    elevatedLight: 0xFFFFFF,
                    elevatedDark: 0x26252D,
                    inkLight: 0x1C1B1F,
                    inkDark: 0xF4F3F7,
                    mutedLight: 0x6B6A72,
                    mutedDark: 0xA9A7B2,
                    tertiaryLight: 0x6A6970,
                    tertiaryDark: 0x9C9AA5,
                    controlBorderLight: 0x85838D,
                    controlBorderDark: 0x6C6A76
                )
            )
        case .movingWorld:
            return CuratedThemePalette(
                backgroundLight: 0xFBF7EF,
                groupedLight: 0xF2EBDD,
                backgroundDark: 0x161410,
                groupedDark: 0x100E0B,
                primaryLight: 0xA3291E,
                primaryDark: 0xF27D70,
                primaryHighContrastLight: 0x7C1B12,
                primaryHighContrastDark: 0xFFB3AA,
                secondaryLight: 0x1E4D8B,
                secondaryDark: 0x82B4F5,
                neutrals: CuratedThemeNeutrals(
                    surfaceLight: 0xFFFDF8,
                    surfaceDark: 0x211E18,
                    elevatedLight: 0xFFFFFF,
                    elevatedDark: 0x2B2720,
                    inkLight: 0x1F1A14,
                    inkDark: 0xF5EFE4,
                    mutedLight: 0x5C5145,
                    mutedDark: 0xC2B6A6,
                    tertiaryLight: 0x665A4D,
                    tertiaryDark: 0xB5A897,
                    controlBorderLight: 0x827566,
                    controlBorderDark: 0x706457
                )
            )
        case .monsoon:
            return CuratedThemePalette(
                backgroundLight: 0xF1F5F7,
                groupedLight: 0xE3ECF0,
                backgroundDark: 0x0C1418,
                groupedDark: 0x080E11,
                primaryLight: 0x125E7A,
                primaryDark: 0x57B8D9,
                primaryHighContrastLight: 0x0B465C,
                primaryHighContrastDark: 0x92D8F0,
                secondaryLight: 0x7A4A10,
                secondaryDark: 0xE8B268,
                neutrals: CuratedThemeNeutrals(
                    surfaceLight: 0xFFFFFF,
                    surfaceDark: 0x132026,
                    elevatedLight: 0xFFFFFF,
                    elevatedDark: 0x1B2C34,
                    inkLight: 0x142630,
                    inkDark: 0xEAF2F6,
                    mutedLight: 0x425A68,
                    mutedDark: 0xA3BAC6,
                    tertiaryLight: 0x4E6876,
                    tertiaryDark: 0x94B0BE,
                    controlBorderLight: 0x6A8290,
                    controlBorderDark: 0x56707E
                )
            )
        case .botanical:
            return CuratedThemePalette(
                backgroundLight: 0xF7F3E8,
                groupedLight: 0xEFE9D8,
                backgroundDark: 0x0F1916,
                groupedDark: 0x0A1210,
                primaryLight: 0x2E604A,
                primaryDark: 0x58B88C,
                primaryHighContrastLight: 0x1E4735,
                primaryHighContrastDark: 0x8CE0B9,
                secondaryLight: 0x8A3B28,
                secondaryDark: 0xE0866E,
                neutrals: CuratedThemeNeutrals(
                    surfaceLight: 0xFFFDF7,
                    surfaceDark: 0x162420,
                    elevatedLight: 0xFFFFFF,
                    elevatedDark: 0x1F322C,
                    inkLight: 0x203D36,
                    inkDark: 0xECF4F0,
                    mutedLight: 0x4A655D,
                    mutedDark: 0xA7C0B6,
                    tertiaryLight: 0x526B63,
                    tertiaryDark: 0x98B5AA,
                    controlBorderLight: 0x6D857D,
                    controlBorderDark: 0x58736A
                )
            )
        case .sketchbook:
            return CuratedThemePalette(
                backgroundLight: 0xF4EDE0,
                groupedLight: 0xEBE3D4,
                backgroundDark: 0x0F1717,
                groupedDark: 0x0A1111,
                primaryLight: 0x0A6C5E,
                primaryDark: 0x4FD1BC,
                primaryHighContrastLight: 0x075247,
                primaryHighContrastDark: 0x9DEBDD,
                secondaryLight: 0x7A5A2E,
                secondaryDark: 0xD9B98A,
                neutrals: CuratedThemeNeutrals(
                    surfaceLight: 0xFFFCF5,
                    surfaceDark: 0x172222,
                    elevatedLight: 0xFFFFFF,
                    elevatedDark: 0x1F2C2C,
                    inkLight: 0x1E2A2B,
                    inkDark: 0xECF4F1,
                    mutedLight: 0x56625F,
                    mutedDark: 0xA9BDB8,
                    tertiaryLight: 0x545F5C,
                    tertiaryDark: 0x9DB1AC,
                    controlBorderLight: 0x768180,
                    controlBorderDark: 0x5E7370
                )
            )
        case .hearth:
            return CuratedThemePalette(
                backgroundLight: 0xF6EFE4,
                groupedLight: 0xEDE3D3,
                backgroundDark: 0x191411,
                groupedDark: 0x110D0B,
                primaryLight: 0x9C4722,
                primaryDark: 0xE8956A,
                primaryHighContrastLight: 0x7E3815,
                primaryHighContrastDark: 0xF7C3A3,
                secondaryLight: 0x6E5A3A,
                secondaryDark: 0xC9A58D,
                neutrals: CuratedThemeNeutrals(
                    surfaceLight: 0xFFFAF2,
                    surfaceDark: 0x241D19,
                    elevatedLight: 0xFFFFFF,
                    elevatedDark: 0x2E2620,
                    inkLight: 0x2B211B,
                    inkDark: 0xF5EBDD,
                    mutedLight: 0x6B5B50,
                    mutedDark: 0xC4B3A3,
                    tertiaryLight: 0x6F5F54,
                    tertiaryDark: 0xB5A393,
                    controlBorderLight: 0x8C7B6C,
                    controlBorderDark: 0x77665A
                )
            )
        case .scholar:
            return CuratedThemePalette(
                backgroundLight: 0xF8F3E8,
                groupedLight: 0xEFE7D7,
                backgroundDark: 0x10151B,
                groupedDark: 0x0A0E12,
                primaryLight: 0x315C85,
                primaryDark: 0x8AB9E3,
                primaryHighContrastLight: 0x1F466D,
                primaryHighContrastDark: 0xB5D7F4,
                secondaryLight: 0x725E2B,
                secondaryDark: 0xD4BD7A
            )
        case .dusk:
            return CuratedThemePalette(
                backgroundLight: 0xF8F3F6,
                groupedLight: 0xEFE6EC,
                backgroundDark: 0x171116,
                groupedDark: 0x100B0F,
                primaryLight: 0x7A365E,
                primaryDark: 0xE78BB9,
                primaryHighContrastLight: 0x612547,
                primaryHighContrastDark: 0xFFB4D6,
                secondaryLight: 0x765466,
                secondaryDark: 0xC9A6B8
            )
        }
    }
}

private struct CuratedColorSchemeKey: EnvironmentKey {
    static let defaultValue = CuratedColorScheme.defaultScheme
}

extension EnvironmentValues {
    var curatedColorScheme: CuratedColorScheme {
        get { self[CuratedColorSchemeKey.self] }
        set { self[CuratedColorSchemeKey.self] = newValue }
    }
}
