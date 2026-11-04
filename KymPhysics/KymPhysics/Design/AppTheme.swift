import Foundation

/// KymPhysics draws in The Standard, the design system it shares with the other subject apps and
/// apple_poem (teaching_kit `docs/STANDARD.md`).
enum AppTheme {
    /// Where an old theme of KymPhysics's catalogue went when The Standard replaced it: the warm
    /// rag-paper and cream themes become Paper, the clay and parchment themes become Warm, Dusk
    /// becomes Dusk, and every other old id (Journal, Marine Drive) becomes Vivid, the new default.
    static let legacy: [String: String] = [
        "movingWorld": "parchment",
        "botanical": "parchment",
        "sketchbook": "parchment",
        "hearth": "sepia",
        "scholar": "sepia",
        "dusk": "dark-graphite"
    ]

    /// The physics-only app group the widget reads the theme choice from. The science group is
    /// shared with KymBio and KymChem, so the choice does not go there.
    static let extensionSuiteName = "group.com.kymaia.physics"

    /// Moves an old stored choice to its Standard theme and makes the choice the design system's
    /// theme. Call it first thing in every process that draws UI.
    static func register(defaults: UserDefaults = .standard) {
        StandardThemeStore.register(defaults: defaults, legacy: legacy)
    }

    /// Copies the learner's choice into the app group so the widget draws in the same theme.
    /// Only the iPad build holds the app-group entitlement, so the Mac build skips it.
    static func shareWithExtensions(_ id: String) {
        #if os(iOS)
        UserDefaults(suiteName: extensionSuiteName)?.set(
            StandardTheme.normalizedPersistedID(id),
            forKey: StandardThemeStore.subjectAppStorageKey
        )
        #endif
    }
}
