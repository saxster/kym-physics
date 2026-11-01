import SwiftUI

// A page's navigation chrome (its title and toolbar) belongs to the navigation stack it is in.
// A page drawn inside another page, as in the style gallery, must not set the outer page's
// title or add to its toolbar, so the Journal pages draw their chrome only when allowed to.

private struct JournalPageShowsChromeKey: EnvironmentKey {
    static let defaultValue = true
}

extension EnvironmentValues {
    var journalPageShowsChrome: Bool {
        get { self[JournalPageShowsChromeKey.self] }
        set { self[JournalPageShowsChromeKey.self] = newValue }
    }
}

extension View {
    /// Draws a Journal page without its title and toolbar, so a small copy of it can sit inside
    /// another page (the style gallery, a preview).
    func journalPagePreview() -> some View {
        environment(\.journalPageShowsChrome, false)
    }
}

/// The page's title: large on a top-level page, inline on a reading or focus page.
struct JournalNavigationTitle: ViewModifier {
    enum Display {
        case large
        case inline
    }

    @Environment(\.journalPageShowsChrome) private var showsChrome

    let title: String
    let display: Display

    @ViewBuilder
    func body(content: Content) -> some View {
        if showsChrome {
            content
                .navigationTitle(title)
                #if os(iOS)
                .navigationBarTitleDisplayMode(display == .large ? .large : .inline)
                #endif
        } else {
            content
        }
    }
}
