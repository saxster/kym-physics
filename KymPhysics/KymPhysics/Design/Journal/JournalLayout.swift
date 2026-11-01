import SwiftUI

// The Journal kit's measurements and layout rules, in one place so every Journal-style screen
// spaces, sizes and stacks the same way. The views in Design/Journal read these; nothing else
// should need them.

enum JournalLayout {
    // MARK: Pages

    /// Between a page's sections (and between the subtitle and the first section).
    static let sectionSpacing = Spacing.lg
    /// The page's left and right margin, and the floating action's distance from the corner.
    static let pageGutter = Spacing.lg

    /// How wide a page's content may grow on a wide window before it centres as one column.
    enum Column: CaseIterable {
        /// A top-level scroll page (`JournalPage`), as Today: one column, like Journal on iPad.
        case page
        /// Long reading (`JournalReaderPage`): about 70 characters a line.
        case reader
        /// One task at a time (`JournalFocusPage`): one centred card.
        case focus
        /// A back-and-forth (Coach): wider than a scroll page so diagrams and canvases in
        /// Coach replies get the room, while reply text keeps a narrower measure.
        case conversation
        /// The Calendar: a grid column and the selected-day panel side by side on wide
        /// windows, so the page grows to the wide detail measure.
        case calendar

        var maxWidth: CGFloat {
            switch self {
            case .page: return Theme.Dimension.editorContentWidth
            case .reader: return 680
            case .focus: return Theme.Dimension.readingContentWidth
            case .conversation: return 880
            case .calendar: return Theme.Dimension.wideDetailWidth
            }
        }
    }

    // MARK: Floating action

    static let floatingActionDiameter: CGFloat = 56
    static let floatingActionGlyph: CGFloat = 22

    /// The band a page keeps clear at its bottom so its last cards scroll above the floating
    /// action instead of ending underneath it.
    static func bottomInset(hasFloatingAction: Bool) -> CGFloat {
        hasFloatingAction ? floatingActionDiameter + pageGutter : 0
    }

    // MARK: Cards

    /// Between small cards in a row, and between the cards of a horizontal strip.
    static let cardRowSpacing = Spacing.md - 2
    /// The gap between a card's edge and its picture.
    static let cardMediaInset = Spacing.xs + 2

    /// The padding around a card's text. Under a picture the text starts a little higher; above
    /// a footer it ends a little lower, since the footer's 44-point "more" button carries its own
    /// space.
    static func cardInsets(hasMedia: Bool, hasFooter: Bool) -> EdgeInsets {
        EdgeInsets(
            top: hasMedia ? Spacing.md - 2 : Spacing.md,
            leading: Spacing.md,
            bottom: hasFooter ? Spacing.sm + 2 : Spacing.md,
            trailing: Spacing.md
        )
    }

    /// Small cards sit side by side, sharing one height, until the text reaches accessibility
    /// sizes; then they stack so each card gets the full width.
    enum CardRowArrangement: Equatable {
        case sideBySide
        case stacked

        init(dynamicTypeSize: DynamicTypeSize) {
            self = dynamicTypeSize.isAccessibilitySize ? .stacked : .sideBySide
        }
    }
}

/// One action a Journal surface offers: a page's floating "+", or a card's primary button.
/// The identifier is required so UI tests can always find it.
struct JournalAction {
    let title: String
    let systemImage: String
    var hint: String?
    let identifier: String
    let action: () -> Void

    init(
        title: String,
        systemImage: String,
        hint: String? = nil,
        identifier: String,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.systemImage = systemImage
        self.hint = hint
        self.identifier = identifier
        self.action = action
    }
}

/// Where a learner is in a focused task ("3 of 10"), for `JournalFocusPage`'s toolbar.
struct JournalFocusProgress: Equatable {
    /// The step on screen, counting from 1.
    let step: Int
    let total: Int

    private var clampedStep: Int { min(max(step, 0), max(total, 0)) }

    /// How full the bar is: the share of steps reached, from 0 to 1.
    var fraction: Double {
        guard total > 0 else { return 0 }
        return Double(clampedStep) / Double(total)
    }

    /// "3 of 10".
    var label: String { "\(clampedStep) of \(max(total, 0))" }

    /// What VoiceOver reads: "Step 3 of 10".
    var spokenValue: String { "Step \(label)" }
}
