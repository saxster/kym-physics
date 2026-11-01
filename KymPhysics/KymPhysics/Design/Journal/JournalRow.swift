import SwiftUI

/// A 44-point list row in the Journal style: an icon, a title with an optional subtitle, and a
/// trailing count or accessory. The sidebar's destinations and subjects are JournalRows.
///
/// The count is drawn in the row, never with `.badge()`: on iPadOS 26 a sidebar row with a badge
/// loses its selection highlight (seen in the HIG tour, 2026-10-11). A count of zero is hidden.
/// Wrap the row in a Button or NavigationLink and give that its VoiceOver label and value.
/// In a `List`, give the list `.journalListRows()` so the list's own rows are the 44-point
/// targets; anywhere else the row keeps itself at least 44 points tall.
/// Keep tile rows and glyph rows in separate lists: a glyph row is a `Label`, so a sidebar draws
/// its icon at the system's size, and the two kinds' titles do not line up.
struct JournalRow: View {
    enum Icon: Equatable {
        /// A white glyph on a coloured rounded square: a subject or a kind of work.
        case tile(symbol: String, tint: Color)
        /// A line glyph in a colour: a destination, as in Journal's sidebar.
        case glyph(symbol: String, tint: Color)
    }

    enum Trailing: Equatable {
        case none
        /// A number such as cards due. `emphasized` draws it in the accent (the selected row).
        case count(Int, emphasized: Bool = false)
        /// A short value, such as "Thu".
        case text(String)
        /// A chevron for a row that opens something.
        case chevron
        /// A status chip ("Met", "Soon"), then the chevron when the row opens something. A row
        /// that opens nothing keeps the chevron's room, so its chip lines up with the others.
        case chip(String, tone: JournalChip.Tone, showsChevron: Bool = true)

        /// The text the row draws at its trailing edge, or nil when it draws none.
        var visibleText: String? {
            switch self {
            case .count(let count, _):
                return count > 0 ? "\(count)" : nil
            case .text(let text), .chip(let text, _, _):
                return text.isEmpty ? nil : text
            case .none, .chevron:
                return nil
            }
        }
    }

    let title: String
    var subtitle: String?
    /// Quiet metadata below the purpose; used for explicitly labelled recorded activity.
    var detail: String?
    let icon: Icon
    var trailing: Trailing = .none

    @Environment(\.journalRowIsInList) private var isInList

    var body: some View {
        // At the largest text sizes a long title and its count no longer share a line; the
        // count then sits under the title instead of squeezing it.
        ViewThatFits(in: .horizontal) {
            inlineLayout
            stackedLayout
        }
        // A list row brings its own insets; a row in a card or stack keeps a little air so a
        // subtitle never touches the divider under it.
        .padding(.vertical, isInList ? 0 : Spacing.xs + 2)
        .frame(minHeight: isInList ? nil : Theme.Dimension.minimumTarget)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }

    @ViewBuilder
    private var inlineLayout: some View {
        switch icon {
        case .glyph(let symbol, let tint):
            // A Label, so a sidebar list draws the glyph at the system's sidebar size and column.
            HStack(spacing: Spacing.sm) {
                Label {
                    titles
                } icon: {
                    glyph(symbol, tint: tint)
                }
                if hasTrailing {
                    Spacer(minLength: Spacing.xs)
                    trailingView
                }
            }
        case .tile(let symbol, let tint):
            HStack(spacing: Spacing.sm + 4) {
                JournalBadge(symbol: symbol, tint: tint, size: .row)
                titles
                Spacer(minLength: Spacing.sm)
                trailingView
            }
        }
    }

    @ViewBuilder
    private var stackedLayout: some View {
        let stacked = VStack(alignment: .leading, spacing: 2) {
            titles
            trailingView
        }
        switch icon {
        case .glyph(let symbol, let tint):
            Label {
                stacked
            } icon: {
                glyph(symbol, tint: tint)
            }
        case .tile(let symbol, let tint):
            HStack(alignment: .top, spacing: Spacing.sm + 4) {
                JournalBadge(symbol: symbol, tint: tint, size: .row)
                stacked
                Spacer(minLength: 0)
            }
        }
    }

    private var titles: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.kymaiaBody)
                .foregroundStyle(Color.kymaiaInk)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
            if let subtitle {
                Text(subtitle)
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if let detail {
                Text(detail)
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaTertiaryInk)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, Spacing.xs)
            }
        }
    }

    private func glyph(_ symbol: String, tint: Color) -> some View {
        Image(systemName: symbol)
            .font(.kymaiaBody)
            .foregroundStyle(tint)
            .accessibilityHidden(true)
    }

    private var hasTrailing: Bool {
        if case .chevron = trailing { return true }
        return trailing.visibleText != nil
    }

    @ViewBuilder
    private var trailingView: some View {
        switch trailing {
        case .chevron:
            chevron
        case .chip(let text, let tone, let showsChevron):
            HStack(spacing: Spacing.sm) {
                JournalChip(text: text, tone: tone)
                chevron.opacity(showsChevron ? 1 : 0)
            }
        case .count, .text, .none:
            if let text = trailing.visibleText {
                Text(text)
                    .font(.kymaiaBody.monospacedDigit())
                    .foregroundStyle(isEmphasized ? Color.kymaiaPrimary : Color.kymaiaTertiaryInk)
            }
        }
    }

    private var chevron: some View {
        Image(systemName: "chevron.right")
            .font(.kymaiaCaption.weight(.semibold))
            .foregroundStyle(Color.kymaiaTertiaryInk)
            .accessibilityHidden(true)
    }

    private var isEmphasized: Bool {
        if case .count(_, let emphasized) = trailing { return emphasized }
        return false
    }
}

private struct JournalRowIsInListKey: EnvironmentKey {
    static let defaultValue = false
}

extension EnvironmentValues {
    var journalRowIsInList: Bool {
        get { self[JournalRowIsInListKey.self] }
        set { self[JournalRowIsInListKey.self] = newValue }
    }
}

extension View {
    /// A `List` of JournalRows: every list row is at least 44 points tall, and the JournalRows
    /// inside draw at their natural height instead of adding their own 44 to the list's insets.
    func journalListRows() -> some View {
        environment(\.defaultMinListRowHeight, Theme.Dimension.minimumTarget)
            .environment(\.journalRowIsInList, true)
    }
}
