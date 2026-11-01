import SwiftUI

/// A `.font(.system(size:))` replacement that scales with Dynamic Type. Use this for the
/// large display numerals (countdowns, streaks, scores) that previously used a hardcoded
/// `size:` and so ignored the user's text-size setting.
private struct ScaledSystemFont: ViewModifier {
    @ScaledMetric private var size: CGFloat
    private let weight: Font.Weight
    private let design: Font.Design

    init(size: CGFloat, weight: Font.Weight, design: Font.Design) {
        self._size = ScaledMetric(wrappedValue: size)
        self.weight = weight
        self.design = design
    }

    func body(content: Content) -> some View {
        content.font(.system(size: size, weight: weight, design: design))
    }
}

extension View {
    /// Dynamic-Type-aware equivalent of `.font(.system(size:weight:design:))`.
    func scaledSystemFont(
        size: CGFloat,
        weight: Font.Weight = .regular,
        design: Font.Design = .default
    ) -> some View {
        modifier(ScaledSystemFont(size: size, weight: weight, design: design))
    }
}
