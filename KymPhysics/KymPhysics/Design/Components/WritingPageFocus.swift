import SwiftUI

struct WritingPageFocusKey: PreferenceKey {
    static let defaultValue = false
    static func reduce(value: inout Bool, nextValue: () -> Bool) { value = value || nextValue() }
}

extension View {
    @ViewBuilder
    func writingEditorSheet<Editor: View>(isPresented: Binding<Bool>, onDismiss: (() -> Void)? = nil, @ViewBuilder content: @escaping () -> Editor) -> some View {
        #if os(iOS)
        fullScreenCover(isPresented: isPresented, onDismiss: onDismiss, content: content)
        #else
        sheet(isPresented: isPresented, onDismiss: onDismiss, content: content)
        #endif
    }

    @ViewBuilder
    func writingEditorSheet<Item: Identifiable, Editor: View>(item: Binding<Item?>, onDismiss: (() -> Void)? = nil, @ViewBuilder content: @escaping (Item) -> Editor) -> some View {
        #if os(iOS)
        fullScreenCover(item: item, onDismiss: onDismiss, content: content)
        #else
        sheet(item: item, onDismiss: onDismiss, content: content)
        #endif
    }

    /// Hide navigation chrome without recreating the editor or its undo stack.
    func writingPageFocus(_ focused: Bool) -> some View {
        modifier(WritingPageFocusModifier(focused: focused))
    }
}

private struct WritingPageFocusModifier: ViewModifier {
    let focused: Bool
    func body(content: Content) -> some View {
        #if os(iOS)
        content
            .toolbar(focused ? .hidden : .automatic, for: .navigationBar, .tabBar)
            .preference(key: WritingPageFocusKey.self, value: focused)
        #else
        content
            .toolbar(focused ? .hidden : .automatic, for: .windowToolbar)
            .preference(key: WritingPageFocusKey.self, value: focused)
        #endif
    }
}
