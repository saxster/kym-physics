import SwiftUI
#if os(iOS)
import UIKit
#endif

/// The keyboard side of a writing surface. Pencil input belongs to PencilWritingCanvas;
/// system Scribble must never turn a sketch into text in this editor.
struct WritingTextEditor: View {
    @Binding var text: String
    var serif = false

    var body: some View {
        #if os(iOS)
        KeyboardEditor(text: $text, serif: serif)
        #else
        TextEditor(text: $text)
        #endif
    }
}

#if os(iOS)
private struct KeyboardEditor: UIViewRepresentable {
    @Binding var text: String
    var serif: Bool

    func makeCoordinator() -> Coordinator { Coordinator(text: $text) }

    func makeUIView(context: Context) -> UITextView {
        let view = UITextView()
        view.backgroundColor = .clear
        view.delegate = context.coordinator
        view.adjustsFontForContentSizeCategory = true
        view.addInteraction(UIScribbleInteraction(delegate: context.coordinator))
        if #available(iOS 18.0, *) { view.writingToolsBehavior = .none }
        return view
    }

    func updateUIView(_ view: UITextView, context: Context) {
        context.coordinator.text = $text
        if view.text != text { view.text = text }
        let descriptor = UIFont.preferredFont(forTextStyle: .body).fontDescriptor
        view.font = UIFont(descriptor: serif ? (descriptor.withDesign(.serif) ?? descriptor) : descriptor, size: 0)
        view.textColor = UIColor(Color.kymaiaInk)
    }

    final class Coordinator: NSObject, UITextViewDelegate, UIScribbleInteractionDelegate {
        var text: Binding<String>
        init(text: Binding<String>) { self.text = text }
        func textViewDidChange(_ textView: UITextView) { text.wrappedValue = textView.text }
        func scribbleInteraction(_ interaction: UIScribbleInteraction, shouldBeginAt location: CGPoint) -> Bool { false }
    }
}
#endif
