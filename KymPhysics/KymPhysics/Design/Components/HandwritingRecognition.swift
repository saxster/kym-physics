import SwiftUI
import Vision
import ImageIO
#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

/// Only called by an explicit conversion action. Recognition never mutates drawing data.
enum HandwritingRecognition {
    static let retentionMessage = "Original handwriting and drawings are retained."
    static func text(in imageData: Data) async throws -> String {
        try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                do { continuation.resume(returning: try recognize(imageData)) } catch { continuation.resume(throwing: error) }
            }
        }
    }

    private static func recognize(_ imageData: Data) throws -> String {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = false
        try VNImageRequestHandler(data: imageData, options: [:]).perform([request])
        return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
            .joined(separator: "\n").trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

struct HandwritingReviewSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State var text: String
    let actionTitle: String
    let onAdd: (String) -> Void

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: Spacing.md) {
                Text("Review the recognized words before adding them. Your original handwriting and drawings stay editable on the page.")
                    .font(.kymaiaBody)
                WritingTextEditor(text: $text)
                    .learnerTextInput(.reflection)
                    .font(.kymaiaBody)
                    .accessibilityLabel("Recognized handwriting")
                Button(actionTitle) {
                    onAdd(text.trimmingCharacters(in: .whitespacesAndNewlines))
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(Spacing.md)
            .foregroundStyle(Color.kymaiaInk)
            .background(Color.kymaiaBackground)
            .navigationTitle("Convert handwriting to text")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Keep handwriting only") { dismiss() }
                }
            }
        }
        .frame(minWidth: 300, minHeight: 360)
    }
}

/// Every shared scratchpad offers the same explicit, reviewed conversion without erasing ink.
struct DrawingTextConversionButton: View {
    let imageData: () -> Data?
    var onTextConversion: ((String) -> Void)?
    var compact = false
    @State private var recognizing = false
    @State private var transcript: Transcript?
    @State private var errorMessage: String?

    private struct Transcript: Identifiable {
        let id = UUID()
        let text: String
    }

    var body: some View {
        Button {
            guard let data = imageData() else { return }
            recognizing = true
            Task { @MainActor in
                defer { recognizing = false }
                do {
                    let text = try await HandwritingRecognition.text(in: data)
                    if text.isEmpty { errorMessage = "No handwriting text found. Your drawings are unchanged." } else { transcript = Transcript(text: text) }
                } catch { errorMessage = "Recognition failed. Your original ink is unchanged. Try again." }
            }
        } label: {
            if compact {
                Label(recognizing ? "Recognizing…" : "Convert to text", systemImage: "text.viewfinder")
                    .labelStyle(.iconOnly)
            } else {
                VStack(alignment: .leading, spacing: 2) {
                    Label(recognizing ? "Recognizing…" : "Convert to text", systemImage: "text.viewfinder")
                    Text(HandwritingRecognition.retentionMessage)
                        .font(.kymaiaCaption)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .disabled(recognizing)
        .accessibilityIdentifier("drawing-canvas.convert")
        .accessibilityHint(HandwritingRecognition.retentionMessage)
        .sheet(item: $transcript) { item in
            HandwritingReviewSheet(text: item.text,
                actionTitle: onTextConversion == nil ? "Copy text and keep handwriting" : "Add text and keep handwriting") { text in
                if let onTextConversion { onTextConversion(text) } else {
                    #if os(iOS)
                    UIPasteboard.general.string = text
                    #elseif os(macOS)
                    NSPasteboard.general.clearContents()
                    NSPasteboard.general.setString(text, forType: .string)
                    #endif
                }
            }
        }
        .alert("Handwriting", isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } })) {
            Button("OK") { errorMessage = nil }
        } message: { Text(errorMessage ?? "") }
    }
}
