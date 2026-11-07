import SwiftUI

/// LearnHarness 6-stop learner confidence rail (`[0%, 30%, 50%, 70%, 90%, 100%]` + `"Don't know / skip guess"`).
/// Uses `.monospacedDigit()` on percentage readouts and 44pt minimum touch targets.
struct ConfidenceRailView: View {
    @Binding var selectedConfidence: Int?
    @Binding var declinedToGuess: Bool
    var isDisabled: Bool = false

    private let stops: [Int] = [0, 30, 50, 70, 90, 100]

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack(spacing: Spacing.xs) {
                Label("Confidence before checking", systemImage: "gauge.with.dots.needle.67percent")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Color.kymaiaMutedInk)
                Spacer()
                if declinedToGuess {
                    JournalBadge(text: "Honest Gap · No Guess", tone: .warning)
                } else if let conf = selectedConfidence {
                    JournalBadge(text: "\(conf)% certainty", tone: conf >= 70 ? .success : .accent)
                        .monospacedDigit()
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(stops, id: \.self) { stop in
                        let isSelected = !declinedToGuess && selectedConfidence == stop
                        Button {
                            guard !isDisabled else { return }
                            declinedToGuess = false
                            selectedConfidence = (selectedConfidence == stop) ? nil : stop
                        } label: {
                            Text("\(stop)%")
                                .monospacedDigit()
                        }
                        .buttonStyle(JournalFilterChipStyle(isSelected: isSelected))
                        .disabled(isDisabled)
                    }

                    Button {
                        guard !isDisabled else { return }
                        declinedToGuess.toggle()
                        if declinedToGuess {
                            selectedConfidence = nil
                        }
                    } label: {
                        Label("Not sure (don't guess)", systemImage: "questionmark.circle")
                    }
                    .buttonStyle(JournalFilterChipStyle(isSelected: declinedToGuess))
                    .disabled(isDisabled)
                }
            }
        }
    }
}
