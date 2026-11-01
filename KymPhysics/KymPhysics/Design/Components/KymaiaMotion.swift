import SwiftUI
#if canImport(AppKit)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

/// Motion that honours Reduce Motion. When it is on, movement (slides, scaling, spins and loops)
/// is dropped and the change lands at once; a view may still fade, which the HIG allows.
enum KymaiaMotion {
    /// The system setting, for code that has no view environment (a `withAnimation` in a model).
    @MainActor
    static var systemReduceMotion: Bool {
        #if canImport(AppKit)
        NSWorkspace.shared.accessibilityDisplayShouldReduceMotion
        #elseif canImport(UIKit)
        UIAccessibility.isReduceMotionEnabled
        #else
        false
        #endif
    }

    /// The animation to run: `nil` (an instant change) under Reduce Motion.
    static func animation(_ animation: Animation?, reduceMotion: Bool) -> Animation? {
        reduceMotion ? nil : animation
    }

    /// The distance a view travels while entering: none under Reduce Motion.
    static func travel(_ distance: CGFloat, reduceMotion: Bool) -> CGFloat {
        reduceMotion ? 0 : distance
    }

    /// The starting scale of a view that grows in: full size under Reduce Motion.
    static func startScale(_ scale: CGFloat, reduceMotion: Bool) -> CGFloat {
        reduceMotion ? 1 : scale
    }
}

/// `withAnimation` that honours Reduce Motion.
@MainActor
func withKymaiaAnimation<Result>(
    _ animation: Animation? = .kymaiaStandard,
    _ body: () throws -> Result
) rethrows -> Result {
    try withAnimation(KymaiaMotion.animation(animation, reduceMotion: KymaiaMotion.systemReduceMotion), body)
}

private struct KymaiaAnimationModifier<Value: Equatable>: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let animation: Animation?
    let value: Value

    func body(content: Content) -> some View {
        content.animation(KymaiaMotion.animation(animation, reduceMotion: reduceMotion), value: value)
    }
}

extension View {
    /// `.animation(_:value:)` that honours Reduce Motion.
    func kymaiaAnimation<Value: Equatable>(_ animation: Animation?, value: Value) -> some View {
        modifier(KymaiaAnimationModifier(animation: animation, value: value))
    }
}
