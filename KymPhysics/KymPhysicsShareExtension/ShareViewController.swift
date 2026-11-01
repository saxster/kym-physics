import Foundation
import UniformTypeIdentifiers
#if os(iOS)
import UIKit
typealias PlatformExtensionViewController = UIViewController
#elseif os(macOS)
import AppKit
typealias PlatformExtensionViewController = NSViewController
#endif

/// Share Extension entry point ("Send to KymPhysics").
/// Stages shared textbook photos, PDFs, or text snippets into the shared `group.com.kymaia.science` App Group container.
@objc(ShareViewController)
final class ShareViewController: PlatformExtensionViewController {
    #if os(iOS)
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        Task { @MainActor in
            await processSharedItemsAndFinish()
        }
    }
    #elseif os(macOS)
    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 1, height: 1))
    }

    override func viewDidAppear() {
        super.viewDidAppear()
        Task { @MainActor in
            await processSharedItemsAndFinish()
        }
    }
    #endif

    @MainActor
    private func processSharedItemsAndFinish() async {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            extensionContext?.completeRequest(returningItems: nil)
            return
        }

        let defaults = UserDefaults(suiteName: "group.com.kymaia.science") ?? .standard
        var sharedTexts = defaults.stringArray(forKey: "kymphysics.sharedInbox.texts") ?? []

        for item in extensionItems {
            if let text = item.attributedContentText?.string, !text.isEmpty {
                sharedTexts.insert(text, at: 0)
            }
        }
        defaults.set(sharedTexts, forKey: "kymphysics.sharedInbox.texts")
        extensionContext?.completeRequest(returningItems: nil)
    }
}
