import SwiftUI
#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

/// Immutable paper artwork. Its point dimensions and origin stay fixed as the editor resizes;
/// editable strokes are stored separately in their original native format.
struct DrawingCanvasBackground: Codable, Equatable, Sendable {
    let png: Data
    let width: Double
    let height: Double
    let label: String

    var isValid: Bool {
        guard width > 0, height > 0, width <= 2048, height <= 2048 else { return false }
        #if os(iOS)
        return UIImage(data: png) != nil
        #elseif os(macOS)
        return NSImage(data: png) != nil
        #else
        return false
        #endif
    }
}

struct DrawingCanvasBackgroundView: View {
    let background: DrawingCanvasBackground
    var body: some View {
        Group {
            #if os(iOS)
            if let image = UIImage(data: background.png) { Image(uiImage: image).resizable() }
            #elseif os(macOS)
            if let image = NSImage(data: background.png) { Image(nsImage: image).resizable() }
            #endif
        }
        .frame(width: background.width, height: background.height)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(background.label)
        .accessibilityIdentifier("drawing-canvas.background")
        .allowsHitTesting(false)
    }
}
