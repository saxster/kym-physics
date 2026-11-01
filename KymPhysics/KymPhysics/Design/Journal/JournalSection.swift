import SwiftUI

/// A page section: a bold header (with an optional "See all") above its cards.
struct JournalSection<Content: View>: View {
    let title: String
    var seeAllIdentifier: String?
    var seeAll: (() -> Void)?
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(alignment: .firstTextBaseline, spacing: Spacing.sm) {
                Text(title)
                    .font(.kymaiaSectionTitle.weight(.bold))
                    .foregroundStyle(Color.kymaiaInk)
                    .accessibilityAddTraits(.isHeader)
                Spacer(minLength: Spacing.sm)
                if let seeAll {
                    Button("See all", action: seeAll)
                        .font(.kymaiaBody)
                        .foregroundStyle(Color.kymaiaPrimary)
                        .buttonStyle(.plain)
                        .frame(minHeight: Theme.Dimension.minimumTarget)
                        .contentShape(Rectangle())
                        .padding(.vertical, -Spacing.sm)
                        .accessibilityLabel("See all: \(title)")
                        .accessibilityIdentifier(seeAllIdentifier ?? "journal-section.see-all")
                }
            }
            content
        }
    }
}

/// Small cards side by side that share one height; stacked at accessibility text sizes.
/// Give each card `.journalMiniCard()`.
struct JournalCardRow<Content: View>: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @ViewBuilder let content: Content

    var body: some View {
        switch JournalLayout.CardRowArrangement(dynamicTypeSize: dynamicTypeSize) {
        case .stacked:
            VStack(alignment: .leading, spacing: JournalLayout.cardRowSpacing) {
                content
            }
        case .sideBySide:
            HStack(alignment: .top, spacing: JournalLayout.cardRowSpacing) {
                content
            }
            .fixedSize(horizontal: false, vertical: true)
        }
    }
}

extension View {
    /// A small card in a `JournalCardRow`: fills its row's height, white and lifted like every
    /// other card.
    func journalMiniCard() -> some View {
        frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .kymaiaPaperCard(padding: Spacing.md)
    }
}
