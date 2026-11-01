import SwiftUI
#if canImport(AppKit)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

/// Centralized Design System for Kymaia Tutor.
/// Eliminates "magic numbers" and ensures visual consistency across the application.
public enum Theme {
    
    // MARK: - Spacing & Padding
    public enum Padding {
        public static let extraSmall: CGFloat = 4
        public static let small: CGFloat = 8
        public static let medium: CGFloat = 16
        public static let large: CGFloat = 24
        public static let extraLarge: CGFloat = 32
        public static let huge: CGFloat = 48
    }
    
    // MARK: - Opacities
    public enum Opacity {
        public static let faint: Double = 0.1
        public static let subtle: Double = 0.3
        public static let medium: Double = 0.6
        public static let strong: Double = 0.8
    }
    
    // MARK: - Animations
    public enum Animation {
        public static let standard = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.6)
        public static let slow = SwiftUI.Animation.easeInOut(duration: 0.8)
        public static let quick = SwiftUI.Animation.easeOut(duration: 0.2)
        public static let micro = SwiftUI.Animation.easeInOut(duration: 0.1)
        public static let long = SwiftUI.Animation.easeInOut(duration: 1.2)
        public static let emphatic = SwiftUI.Animation.interpolatingSpring(stiffness: 300, damping: 15)
        
        public static let delayShort: UInt64 = 500_000_000
        public static let delayMedium: UInt64 = 1_000_000_000
        public static let delayLong: UInt64 = 2_000_000_000
    }
    
    // MARK: - Dimensions
    public enum Dimension {
        public static let iconStandard: CGFloat = 24
        public static let iconLarge: CGFloat = 32
        public static let buttonHeight: CGFloat = 44
        public static let compactContentWidth: CGFloat = 560
        public static let readingContentWidth: CGFloat = 720
        public static let editorContentWidth: CGFloat = 820
        public static let wideDetailWidth: CGFloat = 1_100
        public static let sidebarMinimumWidth: CGFloat = 220
        public static let sidebarIdealWidth: CGFloat = 260
        public static let sidebarMaximumWidth: CGFloat = 340
        public static let attachmentThumbnail: CGFloat = 112
        public static let minimumTarget: CGFloat = 44
    }
}

// MARK: - Compatibility Aliases (Mapping legacy names to Theme)

public enum Spacing {
    public static let xs = Theme.Padding.extraSmall
    public static let sm = Theme.Padding.small
    public static let md = Theme.Padding.medium
    public static let lg = Theme.Padding.large
    public static let xl = Theme.Padding.extraLarge
    public static let xxl = Theme.Padding.huge
}

public enum StrokeWidth {
    public static let light: CGFloat = 1
    public static let medium: CGFloat = 2
    public static let heavy: CGFloat = 4
}

struct KymaiaRGBA: Equatable, Sendable {
    let red: Double
    let green: Double
    let blue: Double
    let opacity: Double

    init(hex: UInt32, opacity: Double = 1) {
        red = Double((hex >> 16) & 0xFF) / 255
        green = Double((hex >> 8) & 0xFF) / 255
        blue = Double(hex & 0xFF) / 255
        self.opacity = opacity
    }

    var color: Color {
        Color(.sRGB, red: red, green: green, blue: blue, opacity: opacity)
    }

    #if canImport(AppKit)
    var platformColor: NSColor {
        NSColor(srgbRed: red, green: green, blue: blue, alpha: opacity)
    }
    #elseif canImport(UIKit)
    var platformColor: UIColor {
        UIColor(red: red, green: green, blue: blue, alpha: opacity)
    }
    #endif
}

struct KymaiaAdaptiveColor: Sendable {
    let light: KymaiaRGBA
    let dark: KymaiaRGBA
    let highContrastLight: KymaiaRGBA?
    let highContrastDark: KymaiaRGBA?

    init(
        light: KymaiaRGBA,
        dark: KymaiaRGBA,
        highContrastLight: KymaiaRGBA? = nil,
        highContrastDark: KymaiaRGBA? = nil
    ) {
        self.light = light
        self.dark = dark
        self.highContrastLight = highContrastLight
        self.highContrastDark = highContrastDark
    }

    func resolved(for colorScheme: ColorScheme, increasedContrast: Bool = false) -> Color {
        if colorScheme == .dark {
            return (increasedContrast ? highContrastDark : nil)?.color ?? dark.color
        }
        return (increasedContrast ? highContrastLight : nil)?.color ?? light.color
    }

    var color: Color {
        #if canImport(AppKit)
        let nativeColor = NSColor(name: nil) { appearance in
            let match = appearance.bestMatch(from: [.aqua, .darkAqua])
            let increasedContrast = NSWorkspace.shared.accessibilityDisplayShouldIncreaseContrast
            if match == .darkAqua {
                return (increasedContrast ? highContrastDark : nil)?.platformColor ?? dark.platformColor
            }
            return (increasedContrast ? highContrastLight : nil)?.platformColor ?? light.platformColor
        }
        return Color(nsColor: nativeColor)
        #elseif canImport(UIKit)
        return Color(uiColor: UIColor { traits in
            let increasedContrast = traits.accessibilityContrast == .high
            if traits.userInterfaceStyle == .dark {
                return (increasedContrast ? highContrastDark : nil)?.platformColor ?? dark.platformColor
            }
            return (increasedContrast ? highContrastLight : nil)?.platformColor ?? light.platformColor
        })
        #endif
    }
}

/// Adaptive editorial palette shared by every Kymaia surface.
/// Light mode uses warm paper and dark ink; dark mode uses soft charcoal rather than pure black.
enum KymaiaPalette {
    private static var curated: CuratedThemePalette { CuratedColorScheme.current.palette }

    static var background: KymaiaAdaptiveColor { curated.background }
    static var groupedBackground: KymaiaAdaptiveColor { curated.groupedBackground }
    private static var neutrals: CuratedThemeNeutrals { curated.neutrals }

    static var surface: KymaiaAdaptiveColor { neutrals.surface }
    static var elevatedSurface: KymaiaAdaptiveColor { neutrals.elevatedSurface }
    static var ink: KymaiaAdaptiveColor { neutrals.ink }
    static var mutedInk: KymaiaAdaptiveColor { neutrals.mutedInk }
    static var tertiaryInk: KymaiaAdaptiveColor { neutrals.tertiaryInk }
    static var hairline: KymaiaAdaptiveColor { neutrals.hairline }
    static var paperRule: KymaiaAdaptiveColor { neutrals.paperRule }
    static var paperRuleStrong: KymaiaAdaptiveColor { neutrals.paperRuleStrong }
    static var controlBorder: KymaiaAdaptiveColor { neutrals.controlBorder }
    static var primary: KymaiaAdaptiveColor { curated.primary }
    static var secondary: KymaiaAdaptiveColor { curated.secondary }
    static let success = KymaiaAdaptiveColor(
        light: KymaiaRGBA(hex: 0x2F6B47),
        dark: KymaiaRGBA(hex: 0x83C69B)
    )
    static let error = KymaiaAdaptiveColor(
        light: KymaiaRGBA(hex: 0xB3261E),
        dark: KymaiaRGBA(hex: 0xFF8A80)
    )
    static let warning = KymaiaAdaptiveColor(
        light: KymaiaRGBA(hex: 0x8A5400),
        dark: KymaiaRGBA(hex: 0xF3B562)
    )
    static let live = KymaiaAdaptiveColor(
        light: KymaiaRGBA(hex: 0x99345F),
        dark: KymaiaRGBA(hex: 0xF27BAD)
    )
    static let controlFill = KymaiaAdaptiveColor(
        light: KymaiaRGBA(hex: 0x1D1B20, opacity: 0.07),
        dark: KymaiaRGBA(hex: 0xF7F5F2, opacity: 0.10),
        highContrastLight: KymaiaRGBA(hex: 0x1D1B20, opacity: 0.15),
        highContrastDark: KymaiaRGBA(hex: 0xF7F5F2, opacity: 0.18)
    )
    static var selectionFill: KymaiaAdaptiveColor { curated.selectionFill }
    static var focusRing: KymaiaAdaptiveColor { curated.focusRing }
    static let scrim = KymaiaAdaptiveColor(
        light: KymaiaRGBA(hex: 0x000000, opacity: 0.34),
        dark: KymaiaRGBA(hex: 0x000000, opacity: 0.60)
    )
}

extension Color {
    public static var kymaiaBackground: Color { KymaiaPalette.background.color }
    public static var kymaiaGroupedBackground: Color { KymaiaPalette.groupedBackground.color }
    public static var kymaiaSurface: Color { KymaiaPalette.surface.color }
    public static var kymaiaElevatedSurface: Color { KymaiaPalette.elevatedSurface.color }
    public static var kymaiaInk: Color { KymaiaPalette.ink.color }
    public static var kymaiaMutedInk: Color { KymaiaPalette.mutedInk.color }
    public static var kymaiaTertiaryInk: Color { KymaiaPalette.tertiaryInk.color }
    public static var kymaiaHairline: Color { KymaiaPalette.hairline.color }
    public static var kymaiaPaperRule: Color { KymaiaPalette.paperRule.color }
    public static var kymaiaPaperRuleStrong: Color { KymaiaPalette.paperRuleStrong.color }
    public static var kymaiaControlBorder: Color { KymaiaPalette.controlBorder.color }
    public static var kymaiaPrimary: Color { KymaiaPalette.primary.color }
    public static var kymaiaSecondary: Color { KymaiaPalette.secondary.color }
    public static let kymaiaSuccess = KymaiaPalette.success.color
    public static let kymaiaError = KymaiaPalette.error.color
    public static let kymaiaWarning = KymaiaPalette.warning.color
    public static let kymaiaLive = KymaiaPalette.live.color
    public static var kymaiaCanvas: Color { KymaiaPalette.background.color }
    public static var kymaiaSidebar: Color { KymaiaPalette.groupedBackground.color }
    public static var kymaiaPaper: Color { KymaiaPalette.surface.color }
    public static var kymaiaPaperRaised: Color { KymaiaPalette.elevatedSurface.color }
    public static let kymaiaControlFill = KymaiaPalette.controlFill.color
    public static var kymaiaSelectionFill: Color { KymaiaPalette.selectionFill.color }
    public static var kymaiaAccent: Color { KymaiaPalette.primary.color }
    public static var kymaiaAccentMuted: Color { KymaiaPalette.primary.color.opacity(0.14) }
    public static var kymaiaFocusRing: Color { KymaiaPalette.focusRing.color }
    /// The accent as text on an accent tint, where the regular accent falls short of 4.5:1.
    public static var kymaiaPrimaryStrong: Color { KymaiaPalette.focusRing.color }
    public static let kymaiaScrim = KymaiaPalette.scrim.color
}

#if canImport(AppKit)
extension NSColor {
    static var kymaiaMutedInk: NSColor {
        NSColor(name: nil) { appearance in
            let match = appearance.bestMatch(from: [.aqua, .darkAqua])
            return match == .darkAqua
                ? KymaiaPalette.mutedInk.dark.platformColor
                : KymaiaPalette.mutedInk.light.platformColor
        }
    }
}
#elseif canImport(UIKit)
extension UIColor {
    static var kymaiaMutedInk: UIColor {
        UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? KymaiaPalette.mutedInk.dark.platformColor
                : KymaiaPalette.mutedInk.light.platformColor
        }
    }
}
#endif

extension Font {
    /// Titles, headlines and metrics take the theme's heading face; learning content
    /// (the serif roles below) stays serif in every theme.
    static func heading(_ style: Font.TextStyle, weight: Font.Weight) -> Font {
        Font.system(style, design: CuratedColorScheme.current.style.headingFace.design).weight(weight)
    }

    public static var kymaiaHeadline: Font { heading(.headline, weight: .semibold) }
    public static var kymaiaTitle: Font { heading(.title3, weight: .semibold) }
    public static let kymaiaBody = Font.body
    #if os(iOS)
    /// One step up from the system caption: at arm's length on the iPad, caption-size
    /// secondary text (card details, option rows, chips) was too small for Kym to read.
    public static let kymaiaCaption = Font.subheadline
    #else
    public static let kymaiaCaption = Font.caption
    #endif
    public static let kymaiaQuestion = Font.title2.weight(.medium).italic()
    public static var kymaiaAppTitle: Font { heading(.largeTitle, weight: .bold) }
    public static var kymaiaPageTitle: Font { heading(.title, weight: .semibold) }
    public static let kymaiaEntryTitle = Font.system(.title2, design: .serif).weight(.semibold)
    public static var kymaiaSectionTitle: Font { heading(.title3, weight: .semibold) }
    public static let kymaiaMetadata = Font.kymaiaCaption
    public static let kymaiaControlLabel = Font.body.weight(.semibold)
    public static var kymaiaMetric: Font { heading(.title2, weight: .semibold).monospacedDigit() }
    public static let kymaiaCodeMath = Font.system(.body, design: .monospaced)
    /// Reading text on paper surfaces: the Journal page and Study Craft cards.
    public static let kymaiaSerifProse = Font.system(.body, design: .serif)
    /// A writing prompt or a quoted idea set off on a page.
    public static let kymaiaSerifPrompt = Font.system(.title3, design: .serif).italic()
    /// The small line above a title ("SATURDAY", "CARD OF THE DAY"); pair with `.textCase(.uppercase)`.
    public static let kymaiaEyebrow = Font.kymaiaCaption.weight(.semibold)
    #if os(iOS)
    public static let kymaiaSerifTitle = Font.system(.title2, design: .serif).weight(.medium)
    public static let kymaiaSerifDisplay = Font.system(.title, design: .serif).weight(.medium)
    public static var kymaiaDisplay: Font { heading(.title, weight: .semibold) }
    #else
    public static let kymaiaSerifTitle = Font.system(.title, design: .serif).weight(.medium)
    public static let kymaiaSerifDisplay = Font.system(.largeTitle, design: .serif).weight(.medium)
    public static var kymaiaDisplay: Font { heading(.largeTitle, weight: .semibold) }
    #endif
}

extension View {
    func kymaiaGlassCard() -> some View {
        modifier(
            KymaiaCardModifier(
                radius: CornerRadius.card,
                padding: Theme.Padding.medium,
                regularOpacity: 1
            )
        )
    }

    func kymaiaPaperCard(padding: CGFloat = Spacing.lg) -> some View {
        modifier(KymaiaCardModifier(radius: CornerRadius.card, padding: padding, regularOpacity: 0.94))
    }
    
    func kymaiaShadow() -> some View {
        self.shadow(color: Color.black.opacity(0.22), radius: 16, x: 0, y: 8)
    }
}

private struct KymaiaCardModifier: ViewModifier {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast

    let radius: CGFloat
    let padding: CGFloat
    let regularOpacity: Double

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        content
            .padding(padding)
            .background(Color.kymaiaSurface.opacity(reduceTransparency ? 1 : regularOpacity))
            .clipShape(shape)
            .kymaiaCardChrome(shape, increasedContrast: contrast == .increased)
    }
}

extension View {
    /// The theme's card edge: a soft shadow (Journal) or a hairline. Increased Contrast always
    /// adds the outline, since a shadow alone is not a visible boundary.
    @ViewBuilder
    func kymaiaCardChrome(_ shape: some InsettableShape, increasedContrast: Bool = false) -> some View {
        switch CuratedColorScheme.current.style.cardChrome {
        case .shadow:
            self
                .overlay(shape.strokeBorder(Color.kymaiaHairline, lineWidth: increasedContrast ? StrokeWidth.light : 0))
                .shadow(color: Color.black.opacity(0.06), radius: 1, y: 1)
                .shadow(color: Color.black.opacity(0.07), radius: 12, y: 6)
        case .hairline:
            self.overlay(shape.strokeBorder(Color.kymaiaHairline, lineWidth: StrokeWidth.light))
        }
    }
}

struct KymaiaStateAction: Identifiable {
    let id: String
    let title: String
    let systemImage: String
    let action: () -> Void

    init(
        id: String,
        title: String,
        systemImage: String,
        action: @escaping () -> Void
    ) {
        self.id = id
        self.title = title
        self.systemImage = systemImage
        self.action = action
    }
}

struct KymaiaStatePanel: View {
    enum Kind {
        case empty
        case loading
        case error
        case recovery
        case offline
        case permissionRequired
        case disabledByPrivacy
        case aiUnavailable

        var icon: String {
            switch self {
            case .empty: return "tray"
            case .loading: return "clock"
            case .error: return "exclamationmark.triangle.fill"
            case .recovery: return "arrow.clockwise.circle.fill"
            case .offline: return "wifi.slash"
            case .permissionRequired: return "lock.shield"
            case .disabledByPrivacy: return "hand.raised.fill"
            case .aiUnavailable: return "sparkles"
            }
        }

        var color: Color {
            switch self {
            case .empty, .loading: return .kymaiaPrimary
            case .error: return .kymaiaWarning
            case .recovery: return .kymaiaSuccess
            case .offline, .permissionRequired, .disabledByPrivacy, .aiUnavailable: return .kymaiaMutedInk
            }
        }
    }

    let kind: Kind
    let title: String
    let message: String
    var action: KymaiaStateAction?
    var accessibilityIdentifier: String

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Label(title, systemImage: kind.icon)
                    .font(.kymaiaHeadline)
                    .foregroundStyle(kind.color)
                Text(message)
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel(title)
            .accessibilityValue(message)
            if let action {
                Button {
                    action.action()
                } label: {
                    Label(action.title, systemImage: action.systemImage)
                }
                .buttonStyle(.borderedProminent)
                .accessibilityIdentifier("\(accessibilityIdentifier).action.\(action.id)")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .kymaiaPaperCard()
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier(accessibilityIdentifier)
    }
}

// Provide a default background if missing
struct KymaiaBackground: View {
    var body: some View {
        Color.kymaiaBackground
        .ignoresSafeArea()
    }
}

extension Animation {
    public static let kymaiaMicro = Theme.Animation.micro
    public static let kymaiaLong = Theme.Animation.long
    public static let kymaiaEmphatic = Theme.Animation.emphatic
}

#if os(iOS)
/// UIKit-backed controls that do not pick up SwiftUI fonts.
enum KymaiaTypeScale {
    /// Segmented controls are UIKit underneath and stay at about 12pt; their labels use body size.
    @MainActor
    static func applyUIKitAppearance() {
        let body = UIFont.preferredFont(forTextStyle: .body)
        let bodyBold = UIFont.systemFont(ofSize: body.pointSize, weight: .semibold)
        UISegmentedControl.appearance().setTitleTextAttributes([.font: body], for: .normal)
        UISegmentedControl.appearance().setTitleTextAttributes([.font: bodyBold], for: .selected)
    }
}
#endif
