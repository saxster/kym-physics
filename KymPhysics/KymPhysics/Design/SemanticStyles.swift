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
