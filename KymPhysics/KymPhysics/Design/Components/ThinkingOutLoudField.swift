import SwiftUI

/// LearnHarness two-stage Thinking-Out-Loud capture:
/// 1. `readingThinkingText`: "What are you noticing while reading the setup?"
/// 2. `answerThinkingText`: "How are you reasoning toward your answer?"
/// Uses `LearnerTextInput` (`.retrieval` purpose, disabling Writing Tools so independent reasoning stays authentic).
struct ThinkingOutLoudField: View {
    @Binding var readingThinkingText: String
    @Binding var answerThinkingText: String
    var showReadingStage: Bool = true
    @State private var isExpanded: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: Spacing.xs) {
                    Label(
                        isExpanded ? "Hide Thinking Out Loud" : "Thinking Out Loud (Reading & Reasoning Notes)",
                        systemImage: "bubble.left.and.text.bubble.right"
                    )
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Color.kymaiaPrimary)

                    Spacer()

                    if !readingThinkingText.isEmpty || !answerThinkingText.isEmpty {
                        JournalBadge(text: "Notes captured", tone: .accent)
                    }
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
            }
            .buttonStyle(.plain)

            if isExpanded {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    if showReadingStage {
                        Text("1. Reading the setup — what physical boundary condition or clue stands out?")
                            .font(.kymaiaCaption.weight(.medium))
                            .foregroundStyle(Color.kymaiaMutedInk)
                        LearnerTextInput(
                            placeholder: "e.g. Ray angle is measured to the mirror surface, not the 90° normal...",
                            text: $readingThinkingText,
                            purpose: .retrieval
                        )
                    }

                    Text("2. Reasoning toward your answer — which first-principles rule connects the clues?")
                        .font(.kymaiaCaption.weight(.medium))
                        .foregroundStyle(Color.kymaiaMutedInk)
                    LearnerTextInput(
                        placeholder: "Write the physical mechanism or equation before committing...",
                        text: $answerThinkingText,
                        purpose: .retrieval
                    )
                }
                .padding(Spacing.sm)
                .background(
                    Color.kymaiaSurface,
                    in: RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                )
            }
        }
    }
}
