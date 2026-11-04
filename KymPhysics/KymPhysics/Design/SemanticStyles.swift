import SwiftUI

enum KymaiaSemanticStyle {
    static var appBackground: Color { .kymaiaBackground }
    static var groupedBackground: Color { .kymaiaGroupedBackground }
    static var surface: Color { .kymaiaSurface }
    static var elevatedSurface: Color { .kymaiaElevatedSurface }
    static var primaryText: Color { .kymaiaInk }
    static var secondaryText: Color { .kymaiaMutedInk }
    static var tertiaryText: Color { .kymaiaTertiaryInk }
    static var hairline: Color { .kymaiaHairline }
    static var accent: Color { .kymaiaPrimary }
    static var success: Color { .kymaiaSuccess }
    static var warning: Color { .kymaiaWarning }
    static var destructive: Color { .kymaiaError }
    static var canvas: Color { .kymaiaCanvas }
    static var sidebar: Color { .kymaiaSidebar }
    static var paper: Color { .kymaiaPaper }
    static var paperRaised: Color { .kymaiaPaperRaised }
    static var controlFill: Color { .kymaiaControlFill }
    static var selectionFill: Color { .kymaiaSelectionFill }
    static var focusRing: Color { .kymaiaFocusRing }
    static var scrim: Color { .kymaiaScrim }

    static func phaseAccent(_ phase: RitualPhase) -> Color {
        Color.phaseColor(phase)
    }
}

extension ShapeStyle where Self == Color {
    static var kymaiaAppBackground: Color { KymaiaSemanticStyle.appBackground }
    static var kymaiaGroupedBackground: Color { KymaiaSemanticStyle.groupedBackground }
    static var kymaiaSurfaceStyle: Color { KymaiaSemanticStyle.surface }
    static var kymaiaElevatedSurface: Color { KymaiaSemanticStyle.elevatedSurface }
    static var kymaiaPrimaryText: Color { KymaiaSemanticStyle.primaryText }
    static var kymaiaAccentStyle: Color { KymaiaSemanticStyle.accent }
    static var kymaiaSuccessStyle: Color { KymaiaSemanticStyle.success }
    static var kymaiaWarningStyle: Color { KymaiaSemanticStyle.warning }
    static var kymaiaDestructive: Color { KymaiaSemanticStyle.destructive }
}

/// SF Symbol sizes for screen icons. They follow Dynamic Type through the text style they sit on.
extension Font {
    /// An icon beside a caption-sized label or on a small control.
    static let kymaiaSymbolSmall = Font.kymaiaEyebrow
    /// An icon leading a card row or a body-sized line.
    static let kymaiaSymbolMedium = Font.title3
    /// An icon leading a card title, or a tappable check-off.
    static let kymaiaSymbolLarge = Font.title2
    /// A centred icon heading an empty or covered panel.
    static let kymaiaSymbolHero = Font.largeTitle
}

/// Fixed sizes inside physics figures and celebration glyphs, where the size is part of the
/// drawing's geometry and must not scale with Dynamic Type. Everything outside a figure uses the
/// `Font.kymaia*` tokens or `.standardType(_:)`.
enum PhysicsFigureType {
    /// The flame on Today's ritual hero card.
    static let ritualHeroGlyph = Font.system(size: 38)
    /// The sparkles inside the 96 pt breakthrough halo.
    static let breakthroughGlyph = Font.system(size: 40, weight: .semibold)
    /// The seal on the ritual's completion card.
    static let completionGlyph = Font.system(size: 48)
    /// The dashed cutaway frame drawn over the motor explorer canvas.
    static let cutawayRadius: CGFloat = 12
}
