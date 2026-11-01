import SwiftUI
import VisionKit
#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

/// Displays a scanned textbook or workbook page with Apple's native Live Text overlay
/// (`ImageAnalysisInteraction` on iOS/iPadOS, `ImageAnalysisOverlayView` on macOS)
/// so Kym can select, copy, Look Up, or read aloud any printed question or table.
struct LiveTextPageImage: View {
    let imageData: Data

    var body: some View {
        #if os(iOS)
        if let uiImage = UIImage(data: imageData) {
            if ImageAnalyzer.isSupported {
                IOSLiveTextImageView(image: uiImage)
            } else {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFit()
            }
        }
        #elseif os(macOS)
        if let nsImage = NSImage(data: imageData) {
            if ImageAnalyzer.isSupported {
                MacLiveTextImageView(image: nsImage)
            } else {
                Image(nsImage: nsImage)
                    .resizable()
                    .scaledToFit()
            }
        }
        #endif
    }
}

#if os(iOS)
@MainActor
private struct IOSLiveTextImageView: UIViewRepresentable {
    let image: UIImage

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> UIImageView {
        let imageView = UIImageView(image: image)
        imageView.contentMode = .scaleAspectFit
        imageView.isUserInteractionEnabled = true
        imageView.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        imageView.setContentCompressionResistancePriority(.defaultLow, for: .vertical)

        let interaction = ImageAnalysisInteraction()
        interaction.preferredInteractionTypes = [.textSelection, .dataDetectors]
        imageView.addInteraction(interaction)
        context.coordinator.interaction = interaction
        context.coordinator.analyze(image: image)
        return imageView
    }

    func updateUIView(_ uiView: UIImageView, context: Context) {
        if uiView.image !== image {
            uiView.image = image
            context.coordinator.analyze(image: image)
        }
    }

    @MainActor
    final class Coordinator {
        private let analyzer = ImageAnalyzer()
        var interaction: ImageAnalysisInteraction?
        private var analysisTask: Task<Void, Never>?

        func analyze(image: UIImage) {
            analysisTask?.cancel()
            let analyzer = self.analyzer
            let interaction = self.interaction
            analysisTask = Task { @MainActor in
                var configuration = ImageAnalyzer.Configuration([.text])
                configuration.locales = ["en-GB", "en-IN", "en-US"]
                guard !Task.isCancelled else { return }
                if let analysis = try? await analyzer.analyze(image, configuration: configuration),
                   !Task.isCancelled {
                    interaction?.analysis = analysis
                    interaction?.preferredInteractionTypes = [.textSelection, .dataDetectors]
                }
            }
        }
    }
}
#elseif os(macOS)
@MainActor
private struct MacLiveTextImageView: NSViewRepresentable {
    let image: NSImage

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeNSView(context: Context) -> NSView {
        let container = LiveTextContainerNSView(image: image)
        context.coordinator.overlayView = container.overlayView
        context.coordinator.analyze(image: image)
        return container
    }

    func updateNSView(_ nsView: NSView, context: Context) {
        guard let container = nsView as? LiveTextContainerNSView else { return }
        if container.imageView.image !== image {
            container.imageView.image = image
            context.coordinator.analyze(image: image)
        }
    }

    @MainActor
    final class Coordinator {
        private let analyzer = ImageAnalyzer()
        weak var overlayView: ImageAnalysisOverlayView?
        private var analysisTask: Task<Void, Never>?

        func analyze(image: NSImage) {
            analysisTask?.cancel()
            let analyzer = self.analyzer
            weak let overlay = self.overlayView
            analysisTask = Task { @MainActor in
                var configuration = ImageAnalyzer.Configuration([.text])
                configuration.locales = ["en-GB", "en-IN", "en-US"]
                guard !Task.isCancelled else { return }
                if let analysis = try? await analyzer.analyze(image, orientation: .up, configuration: configuration),
                   !Task.isCancelled {
                    overlay?.analysis = analysis
                    overlay?.preferredInteractionTypes = [.textSelection, .dataDetectors]
                }
            }
        }
    }
}

@MainActor
private final class LiveTextContainerNSView: NSView {
    let imageView = NSImageView()
    let overlayView = ImageAnalysisOverlayView()

    init(image: NSImage) {
        super.init(frame: .zero)
        imageView.image = image
        imageView.imageScaling = .scaleProportionallyUpOrDown
        imageView.translatesAutoresizingMaskIntoConstraints = false
        overlayView.translatesAutoresizingMaskIntoConstraints = false
        overlayView.trackingImageView = imageView

        addSubview(imageView)
        addSubview(overlayView)

        NSLayoutConstraint.activate([
            imageView.leadingAnchor.constraint(equalTo: leadingAnchor),
            imageView.trailingAnchor.constraint(equalTo: trailingAnchor),
            imageView.topAnchor.constraint(equalTo: topAnchor),
            imageView.bottomAnchor.constraint(equalTo: bottomAnchor),
            overlayView.leadingAnchor.constraint(equalTo: imageView.leadingAnchor),
            overlayView.trailingAnchor.constraint(equalTo: imageView.trailingAnchor),
            overlayView.topAnchor.constraint(equalTo: imageView.topAnchor),
            overlayView.bottomAnchor.constraint(equalTo: imageView.bottomAnchor)
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
#endif
