// View entrance animation modifiers

import SwiftUI

// MARK: - Staggered Fade In

struct StaggeredFadeInModifier: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let index: Int
    let delay: Double
    @State private var isVisible = false

    init(index: Int, delay: Double = 0.05) {
        self.index = index
        self.delay = delay
    }

    func body(content: Content) -> some View {
        content
            .opacity(isVisible ? 1 : 0)
            .offset(y: isVisible ? 0 : KymaiaMotion.travel(12, reduceMotion: reduceMotion))
            .animation(
                reduceMotion ? .easeOut(duration: 0.2) : .kymaiaEmphatic.delay(Double(index) * delay),
                value: isVisible
            )
            .onAppear {
                isVisible = true
            }
    }
}

extension View {
    func staggeredFadeIn(index: Int, delay: Double = 0.05) -> some View {
        modifier(StaggeredFadeInModifier(index: index, delay: delay))
    }
}

// MARK: - Slide In

struct SlideInModifier: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let edge: Edge
    @State private var isVisible = false

    func body(content: Content) -> some View {
        content
            .opacity(isVisible ? 1 : 0)
            .offset(
                x: KymaiaMotion.travel(xOffset, reduceMotion: reduceMotion),
                y: KymaiaMotion.travel(yOffset, reduceMotion: reduceMotion)
            )
            .animation(reduceMotion ? .easeOut(duration: 0.2) : .kymaiaEmphatic, value: isVisible)
            .onAppear {
                isVisible = true
            }
    }

    private var xOffset: CGFloat {
        guard !isVisible else { return 0 }
        switch edge {
        case .leading: return -30
        case .trailing: return 30
        default: return 0
        }
    }

    private var yOffset: CGFloat {
        guard !isVisible else { return 0 }
        switch edge {
        case .top: return -30
        case .bottom: return 30
        default: return 0
        }
    }
}

extension View {
    func slideIn(from edge: Edge) -> some View {
        modifier(SlideInModifier(edge: edge))
    }
}
