import SwiftUI

/// A page for reading: one column no wider than about 70 characters (680 points), centred on
/// the page colour, under a small inline title. Reading text may be serif (`kymaiaSerifProse`);
/// headings inside it stay in the theme's heading face (`kymaiaPageTitle`, `kymaiaTitle`).
///
///     JournalReaderPage(title: "Study Craft") {
///         Text("Space it out").font(.kymaiaPageTitle)
///         Text(idea).font(.kymaiaSerifProse)
///     }
struct JournalReaderPage<Content: View>: View {
    let title: String
    private let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.md) {
                content
            }
            .frame(maxWidth: JournalLayout.Column.reader.maxWidth, alignment: .leading)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, JournalLayout.pageGutter)
            .padding(.vertical, Spacing.lg)
        }
        .background(KymaiaBackground())
        .foregroundStyle(Color.kymaiaInk)
        .modifier(JournalNavigationTitle(title: title, display: .inline))
    }
}
