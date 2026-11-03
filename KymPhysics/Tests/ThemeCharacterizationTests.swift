import Foundation
import SwiftUI
import Testing
#if canImport(AppKit)
import AppKit
#endif
@testable import KymPhysics

/// Pins what every design token resolves to under every theme. For each `CuratedColorScheme`
/// case, the test selects the theme through its `UserDefaults` store, reads every
/// `KymaiaPalette` token, the heading fonts, the card radius and chrome, and the Glance tile
/// gradient that reads the palette, and compares the JSON dump against a committed golden file.
///
/// To regenerate the golden file deliberately: `KYM_RECORD_THEME_GOLDEN=1 swift test --filter ThemeCharacterization`.
@Suite("Theme characterization", .serialized)
struct ThemeCharacterizationTests {
    private static let goldenURL = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .appendingPathComponent("Golden/theme-characterization.json")

    @MainActor
    @Test("Every theme resolves the same palette, typography, card and Glance tokens as the golden file")
    func everyThemeMatchesGolden() throws {
        let dump = try Self.dumpAllThemes()
        if ProcessInfo.processInfo.environment["KYM_RECORD_THEME_GOLDEN"] == "1" {
            try FileManager.default.createDirectory(
                at: Self.goldenURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            try dump.write(to: Self.goldenURL, atomically: true, encoding: .utf8)
        }
        let golden = try String(contentsOf: Self.goldenURL, encoding: .utf8)
        #expect(dump == golden, "Theme tokens drifted from Tests/Golden/theme-characterization.json")
    }

    // MARK: - Dump

    @MainActor
    private static func dumpAllThemes() throws -> String {
        #if canImport(KymDesign)
        CuratedColorScheme.registerAsKymaiaTheme()
        #endif
        let defaults = UserDefaults.standard
        let key = CuratedColorScheme.storageKey
        let saved = defaults.object(forKey: key)
        defer {
            if let saved {
                defaults.set(saved, forKey: key)
            } else {
                defaults.removeObject(forKey: key)
            }
        }

        var themes: [String: Any] = [:]
        for scheme in CuratedColorScheme.allCases {
            defaults.set(scheme.rawValue, forKey: key)
            themes[scheme.rawValue] = dumpCurrentTheme()
        }
        let data = try JSONSerialization.data(
            withJSONObject: ["themes": themes],
            options: [.prettyPrinted, .sortedKeys]
        )
        return String(decoding: data, as: UTF8.self) + "\n"
    }

    @MainActor
    private static func dumpCurrentTheme() -> [String: Any] {
        let palette: [String: KymaiaAdaptiveColor] = [
            "background": KymaiaPalette.background,
            "groupedBackground": KymaiaPalette.groupedBackground,
            "surface": KymaiaPalette.surface,
            "elevatedSurface": KymaiaPalette.elevatedSurface,
            "ink": KymaiaPalette.ink,
            "mutedInk": KymaiaPalette.mutedInk,
            "tertiaryInk": KymaiaPalette.tertiaryInk,
            "hairline": KymaiaPalette.hairline,
            "paperRule": KymaiaPalette.paperRule,
            "paperRuleStrong": KymaiaPalette.paperRuleStrong,
            "controlBorder": KymaiaPalette.controlBorder,
            "primary": KymaiaPalette.primary,
            "secondary": KymaiaPalette.secondary,
            "success": KymaiaPalette.success,
            "error": KymaiaPalette.error,
            "warning": KymaiaPalette.warning,
            "live": KymaiaPalette.live,
            "controlFill": KymaiaPalette.controlFill,
            "selectionFill": KymaiaPalette.selectionFill,
            "focusRing": KymaiaPalette.focusRing,
            "scrim": KymaiaPalette.scrim
        ]
        let headingFonts: [String: Font] = [
            "kymaiaHeadline": .kymaiaHeadline,
            "kymaiaTitle": .kymaiaTitle,
            "kymaiaAppTitle": .kymaiaAppTitle,
            "kymaiaPageTitle": .kymaiaPageTitle,
            "kymaiaSectionTitle": .kymaiaSectionTitle,
            "kymaiaMetric": .kymaiaMetric,
            "kymaiaDisplay": .kymaiaDisplay,
            "kymaiaTitle2": .kymaiaTitle2,
            "kymaiaTitle3": .kymaiaTitle3
        ]
        return [
            "palette": palette.mapValues(describe),
            "headingFonts": headingFonts.mapValues(fontSignature),
            "cardRadius": Double(CornerRadius.card),
            "cardChrome": cardChromeBranch(),
            "glance": ["streakFill": gradientStops(KymaiaTileStyle.streakFill)]
        ]
    }

    /// A font's structure (text style, design, weight, modifiers) read through `Mirror`, since
    /// `Font` has no public accessors and its `description` names only the outer provider type.
    private static func fontSignature(_ font: Font) -> String {
        func walk(_ value: Any, depth: Int) -> String {
            let mirror = Mirror(reflecting: value)
            guard depth < 12, !mirror.children.isEmpty else { return String(describing: value) }
            let parts = mirror.children.map { child in
                "\(child.label ?? "_"): \(walk(child.value, depth: depth + 1))"
            }
            return "\(mirror.subjectType)(\(parts.joined(separator: ", ")))"
        }
        return walk(font, depth: 0)
    }

    private static func describe(_ color: KymaiaAdaptiveColor) -> [String: String] {
        var out = ["light": describe(color.light), "dark": describe(color.dark)]
        if let highContrastLight = color.highContrastLight {
            out["highContrastLight"] = describe(highContrastLight)
        }
        if let highContrastDark = color.highContrastDark {
            out["highContrastDark"] = describe(highContrastDark)
        }
        return out
    }

    private static func describe(_ rgba: KymaiaRGBA) -> String {
        func byte(_ component: Double) -> Int { Int((component * 255).rounded()) }
        return String(format: "#%02X%02X%02X@%.3f", byte(rgba.red), byte(rgba.green), byte(rgba.blue), rgba.opacity)
    }

    /// Which branch `kymaiaCardChrome` takes for the current theme: the `_ConditionalContent`
    /// storage case (`trueContent` is the shadow branch, `falseContent` the hairline one).
    @MainActor
    private static func cardChromeBranch() -> String {
        let view = Color.clear.kymaiaCardChrome(RoundedRectangle(cornerRadius: 4))
        return Mirror(reflecting: view).descendant("storage").flatMap { storage in
            Mirror(reflecting: storage).children.first?.label
        } ?? "unknown"
    }

    /// The gradient's stop colours resolved in light and dark appearance (normal contrast).
    private static func gradientStops(_ gradient: LinearGradient) -> [[String: String]] {
        guard let stops = Mirror(reflecting: gradient).descendant("gradient", "stops") as? [Gradient.Stop] else {
            return []
        }
        return stops.map { stop in
            [
                "location": String(format: "%.3f", stop.location),
                "light": resolve(stop.color, scheme: .light),
                "dark": resolve(stop.color, scheme: .dark)
            ]
        }
    }

    private static func resolve(_ color: Color, scheme: ColorScheme) -> String {
        var environment = EnvironmentValues()
        environment.colorScheme = scheme
        let resolved = color.resolve(in: environment)
        func byte(_ component: Float) -> Int { Int((Double(component) * 255).rounded()) }
        return String(
            format: "#%02X%02X%02X@%.3f",
            byte(resolved.red), byte(resolved.green), byte(resolved.blue), Double(resolved.opacity)
        )
    }
}
