import SwiftUI

struct JournalPage<Content: View>: View {
    let title: String
    var subtitle: String?
    var subtitleIdentifier: String
    var floatingAction: JournalAction?
    var column: JournalLayout.Column
    /// Set by a room's home page: the page opens with The Standard's editorial header.
    var eyebrow: String?
    private var accessory: AnyView?
    private let content: Content

    init(
        title: String,
        subtitle: String? = nil,
        subtitleIdentifier: String = "journal-page.subtitle",
        floatingAction: JournalAction? = nil,
        column: JournalLayout.Column = .page,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.subtitleIdentifier = subtitleIdentifier
        self.floatingAction = floatingAction
        self.column = column
        self.content = content()
    }

    init<HeaderAccessory: View>(
        eyebrow: String? = nil,
        title: String,
        subtitle: String? = nil,
        @ViewBuilder headerAccessory: () -> HeaderAccessory,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.subtitleIdentifier = "journal-page.subtitle"
        self.floatingAction = nil
        self.column = .page
        self.eyebrow = eyebrow
        self.accessory = AnyView(headerAccessory())
        self.content = content()
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            KymaiaBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: JournalLayout.sectionSpacing) {
                    if let accessory {
                        RoomHeader(eyebrow: eyebrow, title: title, subtitle: subtitle) { accessory }
                    } else if eyebrow != nil {
                        RoomHeader(eyebrow: eyebrow, title: title, subtitle: subtitle) { EmptyView() }
                    } else if let subtitle {
                        subtitleLine(subtitle)
                    }
                    content
                }
                .frame(maxWidth: column.maxWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
                .padding(.horizontal, JournalLayout.pageGutter)
                .padding(.top, Spacing.xs)
                .padding(.bottom, Spacing.lg)
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if let floatingAction {
                    HStack {
                        Spacer(minLength: 0)
                        JournalFloatingActionButton(action: floatingAction)
                    }
                    .padding(.trailing, JournalLayout.pageGutter)
                    .frame(height: JournalLayout.bottomInset(hasFloatingAction: true), alignment: .top)
                }
            }
        }
        .foregroundStyle(Color.kymaiaInk)
        .modifier(JournalNavigationTitle(title: title, display: eyebrow == nil ? .large : .inline))
    }

    private func subtitleLine(_ text: String) -> some View {
        Text(text)
            .font(.kymaiaSubheadline)
            .foregroundStyle(Color.kymaiaMutedInk)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, -Spacing.sm - 2)
            .accessibilityIdentifier(subtitleIdentifier)
            .staggeredFadeIn(index: 0)
    }
}

private struct JournalFloatingActionButton: View {
    let action: JournalAction

    var body: some View {
        Button(action: action.action) {
            Image(systemName: action.systemImage)
                .resizable()
                .scaledToFit()
                .fontWeight(.semibold)
                .frame(width: JournalLayout.floatingActionGlyph, height: JournalLayout.floatingActionGlyph)
                .foregroundStyle(Color.kymaiaBackground)
                .frame(width: JournalLayout.floatingActionDiameter, height: JournalLayout.floatingActionDiameter)
                .background(Color.kymaiaPrimary, in: Circle())
                .shadow(color: Color.kymaiaPrimary.opacity(0.4), radius: 12, y: 6)
                .contentShape(Circle())
                .kymaiaPointerHighlight(Circle())
        }
        .buttonStyle(.plain)
        .help(action.title)
        .accessibilityLabel(action.title)
        .accessibilityHint(action.hint ?? "")
        .accessibilityIdentifier(action.identifier)
    }
}
