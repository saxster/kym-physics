import SwiftUI

/// The Journal card: white, rounded, lifted by the theme's soft shadow (`kymaiaCardChrome`),
/// with an optional picture on top and an optional `JournalCardFooter` at the bottom. Today's
/// "Next up" hero is one. Put `JournalCardContent` inside for the usual title, text, chips and
/// action, or any content of your own. Increased Contrast adds the card's outline.
///
///     JournalCard {
///         artwork
///     } content: {
///         JournalCardContent(title: "Dividing fractions", message: "6 cards are due.")
///     } footer: {
///         JournalCardFooter(symbol: "divide", tint: maths, text: "Maths", ...) { menu }
///     }
struct JournalCard<Media: View, Content: View, Footer: View>: View {
    @Environment(\.colorSchemeContrast) private var contrast

    private let media: Media
    private let content: Content
    private let footer: Footer

    init(
        @ViewBuilder media: () -> Media,
        @ViewBuilder content: () -> Content,
        @ViewBuilder footer: () -> Footer
    ) {
        self.media = media()
        self.content = content()
        self.footer = footer()
    }

    private var hasMedia: Bool { Media.self != EmptyView.self }
    private var hasFooter: Bool { Footer.self != EmptyView.self }

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: CornerRadius.card, style: .continuous)
        VStack(alignment: .leading, spacing: 0) {
            if hasMedia {
                media
                    .padding([.horizontal, .top], JournalLayout.cardMediaInset)
            }
            VStack(alignment: .leading, spacing: Spacing.sm) {
                content
                if hasFooter {
                    footer
                        .padding(.top, Spacing.xs)
                }
            }
            .padding(JournalLayout.cardInsets(hasMedia: hasMedia, hasFooter: hasFooter))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.kymaiaSurface)
        .clipShape(shape)
        .kymaiaCardChrome(shape, increasedContrast: contrast == .increased)
        .accessibilityElement(children: .contain)
    }
}

extension JournalCard where Media == EmptyView {
    init(@ViewBuilder content: () -> Content, @ViewBuilder footer: () -> Footer) {
        self.init(media: { EmptyView() }, content: content, footer: footer)
    }
}

extension JournalCard where Footer == EmptyView {
    init(@ViewBuilder media: () -> Media, @ViewBuilder content: () -> Content) {
        self.init(media: media, content: content, footer: { EmptyView() })
    }
}

extension JournalCard where Media == EmptyView, Footer == EmptyView {
    init(@ViewBuilder content: () -> Content) {
        self.init(media: { EmptyView() }, content: content, footer: { EmptyView() })
    }
}

/// The usual inside of a `JournalCard`: a bold title, a line or two of text, chips, and one
/// primary action as an accent capsule.
struct JournalCardContent: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    let title: String
    var message: String?
    var chips: [String] = []
    var primaryAction: JournalAction?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(title)
                .font(.kymaiaHeadline.weight(.bold))
                .foregroundStyle(Color.kymaiaInk)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(.isHeader)
            if let message {
                Text(message)
                    .font(.kymaiaBody)
                    .foregroundStyle(Color.kymaiaInk)
                    .lineLimit(dynamicTypeSize.isAccessibilitySize ? nil : 4)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if !chips.isEmpty {
                FlowLayout(spacing: Spacing.xs + 2) {
                    ForEach(chips, id: \.self) { chip in
                        JournalChip(text: chip)
                    }
                }
                .padding(.top, Spacing.xs - 2)
            }
            if let primaryAction {
                Button(action: primaryAction.action) {
                    Label(primaryAction.title, systemImage: primaryAction.systemImage)
                }
                .buttonStyle(JournalCapsuleButtonStyle())
                .padding(.top, Spacing.xs)
                .accessibilityHint(primaryAction.hint ?? "")
                .accessibilityIdentifier(primaryAction.identifier)
            }
        }
    }
}

/// Flat media inset for teaching diagrams and notebook examples inside a Journal card.
/// Unlike a card, it has no elevation or nested card chrome.
private struct JournalIllustrationSurface: ViewModifier {
    let fill: Color

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: CornerRadius.medium, style: .continuous)
        content
            .background(fill, in: shape)
            .background(Color.kymaiaSurface, in: shape)
    }
}

extension View {
    func journalIllustrationSurface(fill: Color = .kymaiaControlFill) -> some View {
        modifier(JournalIllustrationSurface(fill: fill))
    }

    func journalIllustrationClip() -> some View {
        clipShape(RoundedRectangle(cornerRadius: CornerRadius.medium, style: .continuous))
    }
}
