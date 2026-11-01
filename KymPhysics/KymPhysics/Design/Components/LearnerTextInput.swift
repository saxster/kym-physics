import SwiftUI

/// Why Kym is typing, which decides how much the system keyboard may help.
enum LearnerTextInputPurpose: Sendable {
    /// She is recalling or working out an answer. Autocorrect, inline predictions and Writing
    /// Tools could supply the word she is trying to retrieve, so all of them are off.
    case retrieval
    /// She is explaining or reflecting in her own words (teach-back, journal, error log).
    /// Spelling help stays on; Writing Tools, which rewrites her words, is off.
    case reflection
}

/// The keyboard help allowed for one purpose. A value type so the policy is testable without a view.
struct LearnerTextInputAssistance: Equatable, Sendable {
    let allowsAutocorrection: Bool
    let allowsWritingTools: Bool

    init(purpose: LearnerTextInputPurpose) {
        switch purpose {
        case .retrieval:
            allowsAutocorrection = false
            allowsWritingTools = false
        case .reflection:
            allowsAutocorrection = true
            allowsWritingTools = false
        }
    }
}

extension View {
    /// Marks a learner's text field. Use `.retrieval` for answers and `.reflection` for her own
    /// explanations. Parent-facing fields and the Coach composer keep the system defaults.
    /// Scribble is unaffected, so Apple Pencil handwriting still works in these fields.
    func learnerTextInput(_ purpose: LearnerTextInputPurpose) -> some View {
        modifier(LearnerTextInputModifier(assistance: LearnerTextInputAssistance(purpose: purpose)))
    }
}

private struct LearnerTextInputModifier: ViewModifier {
    let assistance: LearnerTextInputAssistance

    @ViewBuilder
    func body(content: Content) -> some View {
        // On UIKit-backed fields, turning autocorrection off also turns off inline predictions.
        let corrected = content.autocorrectionDisabled(!assistance.allowsAutocorrection)
        if #available(iOS 18.0, macOS 15.0, *) {
            corrected.writingToolsBehavior(assistance.allowsWritingTools ? .automatic : .disabled)
        } else {
            corrected
        }
    }
}
