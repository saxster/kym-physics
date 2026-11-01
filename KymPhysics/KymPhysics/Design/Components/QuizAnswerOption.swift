import SwiftUI

/// How an answer option looks before and after she answers. Shared by the Mental Models and
/// Study Craft quizzes.
enum QuizOptionTone: Equatable {
    case idle
    case correct
    case wrong
    case dimmed

    static func resolve(isAnswered: Bool, isCorrectOption: Bool, isChosen: Bool) -> QuizOptionTone {
        guard isAnswered else { return .idle }
        if isCorrectOption { return .correct }
        return isChosen ? .wrong : .dimmed
    }

    var icon: String {
        switch self {
        case .idle, .dimmed: return "circle"
        case .correct: return "checkmark.circle.fill"
        case .wrong: return "xmark.circle.fill"
        }
    }

    var iconColor: Color {
        switch self {
        case .idle, .dimmed: return .kymaiaMutedInk
        case .correct: return .kymaiaSuccess
        case .wrong: return .kymaiaWarning
        }
    }

    var fill: Color {
        switch self {
        case .correct: return Color.kymaiaSuccess.opacity(0.12)
        case .wrong: return Color.kymaiaWarning.opacity(0.12)
        case .idle, .dimmed: return Color.kymaiaSurface
        }
    }

    var border: Color {
        switch self {
        case .correct: return .kymaiaSuccess
        case .wrong: return .kymaiaWarning
        case .idle: return .kymaiaControlBorder
        case .dimmed: return Color.kymaiaHairline.opacity(0.5)
        }
    }

    /// What VoiceOver adds after the option's text once she has answered.
    var accessibilityValue: String {
        switch self {
        case .idle, .dimmed: return ""
        case .correct: return "Right answer"
        case .wrong: return "Your answer, not right"
        }
    }
}

/// One answer option: a full-width row that can be tapped until she answers, then shows
/// right and wrong.
struct QuizAnswerOption: View {
    let text: String
    let tone: QuizOptionTone
    let isChosen: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: Spacing.sm) {
                Image(systemName: tone.icon)
                    .foregroundStyle(tone.iconColor)
                    .frame(width: 22)
                    .accessibilityHidden(true)
                Text(text)
                    .font(.kymaiaBody)
                    .foregroundStyle(tone == .dimmed ? Color.kymaiaMutedInk : Color.kymaiaInk)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .padding(Spacing.md)
            .frame(maxWidth: .infinity, minHeight: Theme.Dimension.minimumTarget, alignment: .leading)
            .background(tone.fill, in: RoundedRectangle(cornerRadius: CornerRadius.small))
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.small)
                    .strokeBorder(tone.border, lineWidth: isChosen || tone == .correct ? 2 : 1)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .allowsHitTesting(tone == .idle)
        .accessibilityValue(tone.accessibilityValue)
    }
}
