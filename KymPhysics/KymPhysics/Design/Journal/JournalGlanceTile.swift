import SwiftUI

/// Journal's Insights tile: a gradient button with white text, for a glanceable number or a
/// short summary (the sidebar's Streak and This week). The caller draws what is on it and gives
/// the tile its VoiceOver label, value and hint, since a tile reads as one element.
struct JournalGlanceTile<Content: View>: View {
    /// Both tones keep white text at 4.5:1 or better across the whole gradient, light and dark.
    enum Tone {
        /// The theme's accent running into its secondary colour.
        case accent
        /// A calm teal in every theme, so a second tile never reads as a second accent.
        case calm

        var fill: LinearGradient {
            switch self {
            case .accent: return KymaiaTileStyle.streakFill
            case .calm: return KymaiaTileStyle.weekFill
            }
        }
    }

    @Environment(\.colorSchemeContrast) private var contrast

    let tone: Tone
    /// A large faint SF Symbol in the bottom corner, such as a flame for a streak.
    var watermark: String?
    let action: () -> Void
    @ViewBuilder let content: Content

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: CornerRadius.large, style: .continuous)
        Button(action: action) {
            content
                .foregroundStyle(Color.kymaiaTileInk)
                .padding(.horizontal, Spacing.md - 2)
                .padding(.vertical, Spacing.sm + 4)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(alignment: .bottomTrailing) {
                    if let watermark {
                        Image(systemName: watermark)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 64, height: 64)
                            .foregroundStyle(Color.kymaiaTileInk.opacity(0.14))
                            .offset(x: 6, y: 10)
                            .accessibilityHidden(true)
                    }
                }
                .background(tone.fill)
                .clipShape(shape)
                .overlay(shape.strokeBorder(Color.kymaiaHairline, lineWidth: contrast == .increased ? StrokeWidth.light : 0))
                .contentShape(shape)
        }
        .buttonStyle(.plain)
    }
}
