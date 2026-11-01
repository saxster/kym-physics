import Foundation
import PDFKit
import SwiftUI

#if os(iOS)
import UIKit
import VisionKit
#elseif os(macOS)
import AppKit
#endif

enum DocumentScannerSupport {
    @MainActor
    static var isSupported: Bool {
        #if os(iOS)
        return VNDocumentCameraViewController.isSupported
        #else
        return false
        #endif
    }
}

enum DocumentScannerError: LocalizedError, Equatable {
    case emptyScan
    case pdfGenerationFailed

    var errorDescription: String? {
        switch self {
        case .emptyScan:
            return "No scanned pages were captured."
        case .pdfGenerationFailed:
            return "Could not assemble the scanned pages into a PDF document."
        }
    }
}

/// Cross-platform helper that stitches scanned page images into a multi-page PDF document
/// so both `SourceLabView` and `QuestionImportView` can ingest multi-page camera scans.
enum DocumentScannerPDFBuilder {
    static func writeStitchedPDF(fromPageImages pagePNGData: [Data], to destinationURL: URL) throws {
        guard !pagePNGData.isEmpty else { throw DocumentScannerError.emptyScan }
        let document = PDFDocument()
        for (index, data) in pagePNGData.enumerated() {
            #if os(iOS)
            guard let image = UIImage(data: data), let page = PDFPage(image: image) else { continue }
            #elseif os(macOS)
            guard let image = NSImage(data: data), let page = PDFPage(image: image) else { continue }
            #endif
            document.insert(page, at: min(index, document.pageCount))
        }
        guard document.pageCount > 0, document.write(to: destinationURL) else {
            throw DocumentScannerError.pdfGenerationFailed
        }
    }
}

#if os(iOS)
/// Native iPadOS / iOS multi-page document camera (`VNDocumentCameraViewController`) with
/// automatic edge detection, perspective correction, and contrast enhancement.
struct DocumentScannerSheet: UIViewControllerRepresentable {
    var onComplete: (Result<URL, Error>) -> Void
    var onCancel: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onComplete: onComplete, onCancel: onCancel)
    }

    func makeUIViewController(context: Context) -> VNDocumentCameraViewController {
        let controller = VNDocumentCameraViewController()
        controller.delegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: VNDocumentCameraViewController, context: Context) {}

    final class Coordinator: NSObject, VNDocumentCameraViewControllerDelegate {
        let onComplete: (Result<URL, Error>) -> Void
        let onCancel: () -> Void

        init(
            onComplete: @escaping (Result<URL, Error>) -> Void,
            onCancel: @escaping () -> Void
        ) {
            self.onComplete = onComplete
            self.onCancel = onCancel
        }

        func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
            onCancel()
        }

        func documentCameraViewController(
            _ controller: VNDocumentCameraViewController,
            didFailWithError error: Error
        ) {
            onComplete(.failure(error))
        }

        func documentCameraViewController(
            _ controller: VNDocumentCameraViewController,
            didFinishWith scan: VNDocumentCameraScan
        ) {
            guard scan.pageCount > 0 else {
                onComplete(.failure(DocumentScannerError.emptyScan))
                return
            }
            var pagePNGs: [Data] = []
            for index in 0..<scan.pageCount {
                let image = scan.imageOfPage(at: index)
                if let png = image.pngData() {
                    pagePNGs.append(png)
                }
            }
            let outputURL = FileManager.default.temporaryDirectory
                .appendingPathComponent("ScannedChapter-\(UUID().uuidString).pdf")
            do {
                try DocumentScannerPDFBuilder.writeStitchedPDF(fromPageImages: pagePNGs, to: outputURL)
                onComplete(.success(outputURL))
            } catch {
                onComplete(.failure(error))
            }
        }
    }
}
#endif
