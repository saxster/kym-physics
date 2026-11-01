import SwiftUI

/// A page for one task at a time (a review card, a quiz step): the chrome recedes to a close
/// button and a progress bar in the toolbar, the task sits in one centred card no wider than
/// 720 points, and its actions wait in a band at the bottom. Present it in a sheet or full-screen
/// cover inside a NavigationStack.
///
///     JournalFocusPage(title: "Review", progress: .init(step: 3, total: 10), close: dismiss) {
///         Text(question).font(.kymaiaQuestion)
///     } actions: {
///         Button("Show answer", action: reveal).buttonStyle(JournalCapsuleButtonStyle())
///     }
struct JournalFocusPage<Content: View, Actions: View>: View {
    @Environment(\.colorSchemeContrast) private var contrast
    @Environment(\.journalPageShowsChrome) private var showsChrome

    let title: String
    var progress: JournalFocusProgress?
    var closeLabel: String
    let close: () -> Void
    private let content: Content
    private let actions: Actions

    init(
        title: String,
        progress: JournalFocusProgress? = nil,
        closeLabel: String = "Close",
        close: @escaping () -> Void,
        @ViewBuilder content: () -> Content,
        @ViewBuilder actions: () -> Actions
    ) {
        self.title = title
        self.progress = progress
        self.closeLabel = closeLabel
        self.close = close
        self.content = content()
        self.actions = actions()
    }

    private var hasActions: Bool { Actions.self != EmptyView.self }

    var body: some View {
        // The card sits in the middle of the page while it fits, and scrolls once it does not.
        GeometryReader { proxy in
            ScrollView {
                card
                    .frame(minHeight: proxy.size.height)
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if hasActions {
                VStack(spacing: Spacing.sm) {
                    actions
                }
                .frame(maxWidth: JournalLayout.Column.focus.maxWidth)
                .frame(maxWidth: .infinity)
                .padding(.horizontal, JournalLayout.pageGutter)
                .padding(.vertical, Spacing.md)
                .background(Color.kymaiaBackground)
            }
        }
        .background(KymaiaBackground())
        .foregroundStyle(Color.kymaiaInk)
        .modifier(JournalNavigationTitle(title: title, display: .inline))
        .toolbar {
            if showsChrome {
                toolbarItems
            }
        }
    }

    private var card: some View {
        let shape = RoundedRectangle(cornerRadius: CornerRadius.card, style: .continuous)
        return VStack(alignment: .leading, spacing: Spacing.md) {
            content
        }
        .padding(Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.kymaiaSurface)
        .clipShape(shape)
        .kymaiaCardChrome(shape, increasedContrast: contrast == .increased)
        .frame(maxWidth: JournalLayout.Column.focus.maxWidth)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, JournalLayout.pageGutter)
        .padding(.vertical, Spacing.lg)
    }

    @ToolbarContentBuilder
    private var toolbarItems: some ToolbarContent {
        ToolbarItem(placement: .cancellationAction) {
            Button(action: close) {
                Label(closeLabel, systemImage: "xmark")
                    .labelStyle(.iconOnly)
            }
            .help(closeLabel)
            .accessibilityLabel(closeLabel)
            .accessibilityIdentifier("journal-focus.close")
        }
        if let progress {
            ToolbarItem(placement: .principal) {
                progressView(progress)
            }
        }
    }

    private func progressView(_ progress: JournalFocusProgress) -> some View {
        VStack(spacing: 3) {
            Text(progress.label)
                .font(.kymaiaCaption.monospacedDigit())
                .foregroundStyle(Color.kymaiaMutedInk)
                .dynamicTypeSize(...DynamicTypeSize.accessibility1)
            ProgressView(value: progress.fraction)
                .tint(Color.kymaiaPrimary)
                .frame(maxWidth: 160)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityValue(progress.spokenValue)
        .accessibilityIdentifier("journal-focus.progress")
    }
}

extension JournalFocusPage where Actions == EmptyView {
    init(
        title: String,
        progress: JournalFocusProgress? = nil,
        closeLabel: String = "Close",
        close: @escaping () -> Void,
        @ViewBuilder content: () -> Content
    ) {
        self.init(title: title, progress: progress, closeLabel: closeLabel, close: close, content: content) {
            EmptyView()
        }
    }
}
