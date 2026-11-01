// Keyboard shortcuts for card review

import SwiftUI

enum KeyboardShortcuts {
    static let submit: KeyEquivalent = .return
    static let skip: KeyEquivalent = .escape

    static func optionKey(_ number: Int) -> String {
        return "\(number)"
    }
}

// Keyboard handler view modifier
struct KeyboardNavigationModifier: ViewModifier {
    let onSubmit: () -> Void
    let onSkip: () -> Void
    let onOption: (Int) -> Void

    func body(content: Content) -> some View {
        content
            .onKeyPress(.return) {
                onSubmit()
                return .handled
            }
            .onKeyPress(.escape) {
                onSkip()
                return .handled
            }
            .onKeyPress(characters: .decimalDigits) { press in
                if let digit = Int(String(press.characters.first ?? "0")),
                   digit >= 1 && digit <= 4 {
                    onOption(digit)
                    return .handled
                }
                return .ignored
            }
    }
}

extension View {
    func keyboardNavigation(
        onSubmit: @escaping () -> Void,
        onSkip: @escaping () -> Void,
        onOption: @escaping (Int) -> Void
    ) -> some View {
        modifier(KeyboardNavigationModifier(onSubmit: onSubmit, onSkip: onSkip, onOption: onOption))
    }
}
