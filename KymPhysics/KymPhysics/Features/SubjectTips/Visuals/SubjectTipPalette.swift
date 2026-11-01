import SwiftUI

/// Colours the theme does not carry, for the Subject Tips demonstrations: the two quantities the
/// gravity picture compares and the worlds it is set on. Built the same adaptive way as
/// `KymaiaPalette`; `ThemeTests` checks that every text use reaches 4.5:1.
enum SubjectTipPalette {
    /// Mass: the balance's readout and the kilogram block. Text-safe on every theme's page and card.
    static let mass = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0x0A6C5E), dark: KymaiaRGBA(hex: 0x4FD1BC))
    /// Weight: the spring scale's readout, its display and the weight arrow.
    static let weight = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0xB0390A), dark: KymaiaRGBA(hex: 0xFB923C))
    /// A readout tile's fill: its quantity's colour over the card.
    static let massTint = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0x0A6C5E, opacity: 0.10),
                                              dark: KymaiaRGBA(hex: 0x4FD1BC, opacity: 0.16))
    static let weightTint = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0xB0390A, opacity: 0.10),
                                                dark: KymaiaRGBA(hex: 0xFB923C, opacity: 0.16))

    // MARK: Chemistry pictures

    /// Protons (warm) and electrons (cool) stay told apart by their + / − glyph as well as colour.
    static let proton = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0xB0390A), dark: KymaiaRGBA(hex: 0xE86A33))
    static let electron = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0x1D5FA8), dark: KymaiaRGBA(hex: 0x5EA3E8))
    static let neutron = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0x6B7280), dark: KymaiaRGBA(hex: 0x9AA3B2))
    static let protonTint = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0xB0390A, opacity: 0.10),
                                                dark: KymaiaRGBA(hex: 0xE86A33, opacity: 0.18))
    static let electronTint = KymaiaAdaptiveColor(light: KymaiaRGBA(hex: 0x1D5FA8, opacity: 0.10),
                                                  dark: KymaiaRGBA(hex: 0x5EA3E8, opacity: 0.18))

    /// Universal-indicator colours for pH 0...14. Decorative only: every pH is also labelled.
    static let phColors: [KymaiaRGBA] = [0xC0392B, 0xD35400, 0xE67E22, 0xED9C2F, 0xD9B81F,
                                         0xB7C22C, 0x86B84D, 0x57A773, 0x3D9970, 0x2E86AB,
                                         0x2470A0, 0x3A5A9C, 0x5B4A9E, 0x6C3483, 0x5E3370]
        .map { KymaiaRGBA(hex: $0) }

    static func phColor(_ ph: Int) -> Color {
        phColors[min(14, max(0, ph))].color
    }

    // MARK: Inside the picture

    /// The spring scale's display: dark glass in both appearances, like a real one.
    static let display = KymaiaRGBA(hex: 0x1C1B1F)
    /// A space suit is white whatever the page around it.
    static let suit = KymaiaRGBA(hex: 0xF4F4F6)
    static let suitShade = KymaiaRGBA(hex: 0xD1D1D6)
    static let suitLine = KymaiaRGBA(hex: 0x8E8E93)
    static let visor = KymaiaRGBA(hex: 0x2B2D42)
    /// The balance and the scale: dark steel on a light sky, light steel on a dark one.
    static let steelOnLight = KymaiaRGBA(hex: 0x5B5B60)
    static let steelOnDark = KymaiaRGBA(hex: 0xC7C7CC)

    /// A world's sky and ground. The picture's own ink is light on a dark sky and dark on a
    /// light one, so labels drawn on the sky read in both appearances.
    struct Scenery {
        let sky: KymaiaAdaptiveColor
        /// None in deep space, where nothing stands on anything.
        let ground: KymaiaAdaptiveColor?
        /// Airless skies are black by day, so they stay dark in light mode too.
        let isAlwaysDark: Bool

        func isDark(in scheme: ColorScheme) -> Bool {
            isAlwaysDark || scheme == .dark
        }

        func sky(in scheme: ColorScheme) -> Color {
            (scheme == .dark ? sky.dark : sky.light).color
        }

        func ground(in scheme: ColorScheme) -> Color? {
            guard let ground else { return nil }
            return (scheme == .dark ? ground.dark : ground.light).color
        }
    }

    /// Known worlds get their own look; anything else a plain sky and ground. A world with no
    /// pull is deep space whatever it is called.
    static func scenery(for world: SubjectTipVisual.MassWeight.World) -> Scenery {
        if world.fieldStrength <= 0 { return deepSpace }
        let name = world.name.lowercased()
        if name.contains("moon") { return moon }
        if name.contains("mars") { return mars }
        if name.contains("earth") { return earth }
        if name.contains("jupiter") { return jupiter }
        return plain
    }

    private static func pair(_ light: UInt32, _ dark: UInt32) -> KymaiaAdaptiveColor {
        KymaiaAdaptiveColor(light: KymaiaRGBA(hex: light), dark: KymaiaRGBA(hex: dark))
    }

    private static let deepSpace = Scenery(sky: pair(0x1E1B4B, 0x12102E), ground: nil, isAlwaysDark: true)
    private static let moon = Scenery(sky: pair(0x2B2A33, 0x1E1D24), ground: pair(0xB9B6AE, 0x6E6B66), isAlwaysDark: true)
    private static let mars = Scenery(sky: pair(0xE8B48F, 0x4A2E22), ground: pair(0xB5532B, 0x7A3A20), isAlwaysDark: false)
    private static let earth = Scenery(sky: pair(0xBFE3F7, 0x1D3A4F), ground: pair(0x7FB069, 0x3E6634), isAlwaysDark: false)
    private static let jupiter = Scenery(sky: pair(0xE9D2B4, 0x4A3B2A), ground: pair(0xB07D4F, 0x6E4E31), isAlwaysDark: false)
    private static let plain = Scenery(sky: pair(0xDCE3EC, 0x23262E), ground: pair(0xA9A39A, 0x5A554F), isAlwaysDark: false)
}
