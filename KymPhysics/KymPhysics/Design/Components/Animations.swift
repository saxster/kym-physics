// Card flip and reward animations

import Combine
import SwiftUI

// MARK: - Card Flip Animation

enum CardSide {
    case front, back
}

struct CardFlipModifier: ViewModifier {
    let isFlipped: Bool
    let side: CardSide

    var rotationDegrees: Double {
        switch side {
        case .front:
            return isFlipped ? -90 : 0
        case .back:
            return isFlipped ? 0 : 90
        }
    }

    func body(content: Content) -> some View {
        content
            .rotation3DEffect(
                .degrees(rotationDegrees),
                axis: (x: 0, y: 1, z: 0),
                perspective: 0.5
            )
            .opacity(isVisible ? 1 : 0)
    }

    private var isVisible: Bool {
        switch side {
        case .front: return !isFlipped
        case .back: return isFlipped
        }
    }
}

extension View {
    func cardFlip(isFlipped: Bool, side: CardSide) -> some View {
        modifier(CardFlipModifier(isFlipped: isFlipped, side: side))
    }
}

struct BounceEffect: ViewModifier {
    func body(content: Content) -> some View {
        if #available(macOS 15.0, iOS 18.0, *) {
            content.symbolEffect(.bounce, options: .speed(0.5))
        } else {
            content  // Fallback for older OS
        }
    }
}

struct PhaseTransitionModifier: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let phase: RitualPhase
    @State private var offset: CGFloat = 50
    @State private var opacity: Double = 0

    func body(content: Content) -> some View {
        content
            .offset(y: KymaiaMotion.travel(offset, reduceMotion: reduceMotion))
            .opacity(opacity)
            .onChange(of: phase) { _, _ in
                // Reset for transition
                offset = 50
                opacity = 0
                enter()
            }
            .onAppear {
                enter()
            }
    }

    /// Slides up into place; under Reduce Motion it only fades in.
    private func enter() {
        withAnimation(reduceMotion ? .easeOut(duration: 0.2) : .kymaiaEmphatic) {
            offset = 0
            opacity = 1
        }
    }
}

extension View {
    func phaseTransition(for phase: RitualPhase) -> some View {
        modifier(PhaseTransitionModifier(phase: phase))
    }
}
