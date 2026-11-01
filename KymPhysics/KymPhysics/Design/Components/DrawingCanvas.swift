import SwiftUI
import Vision
#if canImport(PencilKit) && os(iOS)
import PencilKit
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

/// Size presets for the Apple Pencil `DrawingCanvas` used in Diagram Recall, School Scratchpad, and Lab Journal.
enum DrawingCanvasSize: String, CaseIterable, Identifiable {
    case compact = "Compact"
    case standard = "Standard"
    case expanded = "Full Page"

    var id: String { rawValue }

    var height: CGFloat {
        switch self {
        case .compact: return 220
        case .standard: return 340
        case .expanded: return 500
        }
    }
}

/// Full-featured Apple Pencil & multi-colour diagram/equation canvas with:
/// - `PKCanvasView` + `PKToolPicker` + `UIPencilInteraction` (squeeze & double-tap) on iPadOS/iOS,
/// - multi-colour ink & eraser canvas on macOS,
/// - binary `PKDrawing` / stroke JSON persistence (`drawingData`) + PNG raster snapshot (`snapshotPNG`),
/// - on-device `Vision` (`VNRecognizeTextRequest`) handwriting OCR conversion button.
struct DrawingCanvas: View {
    @Binding var drawingData: Data
    var snapshotPNG: Binding<Data?>?
    var title: String = "Apple Pencil Sketch & Working"
    var subtitle: String = "Draw force vectors, ray paths, circuit symbols, or step-by-step algebra"
    var showGrid: Bool = true
    var initialSize: DrawingCanvasSize = .standard
    var onRecognizedText: ((String) -> Void)?

    @State private var canvasSize: DrawingCanvasSize
    @State private var selectedInkIndex: Int = 0
    @State private var lineWidth: CGFloat = 2.8
    @State private var isEraser: Bool = false
    @State private var isRecognizingText = false
    @State private var recognizedPreview: String = ""

    private let inkSwatches: [(name: String, color: Color)] = [
        ("Ink", .kymaiaTextPrimary),
        ("Copper", .kymaiaAccent),
        ("Emerald", .kymaiaSuccess),
        ("Amber", .kymaiaWarning),
        ("Crimson", .kymaiaError),
        ("Indigo", .kymaiaBridgeChemistry)
    ]

    init(
        drawingData: Binding<Data>,
        snapshotPNG: Binding<Data?>? = nil,
        title: String = "Apple Pencil Sketch & Working",
        subtitle: String = "Draw force vectors, ray paths, circuit symbols, or step-by-step algebra",
        showGrid: Bool = true,
        initialSize: DrawingCanvasSize = .standard,
        onRecognizedText: ((String) -> Void)? = nil
    ) {
        self._drawingData = drawingData
        self.snapshotPNG = snapshotPNG
        self.title = title
        self.subtitle = subtitle
        self.showGrid = showGrid
        self.initialSize = initialSize
        self.onRecognizedText = onRecognizedText
        self._canvasSize = State(initialValue: initialSize)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            // Toolbar header
            HStack(alignment: .center, spacing: Spacing.sm) {
                VStack(alignment: .leading, spacing: 2) {
                    Label(title, systemImage: "pencil.and.scribble")
                        .font(.kymaiaSubheadline.weight(.semibold))
                        .foregroundStyle(Color.kymaiaTextPrimary)
                    Text(subtitle)
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaTextSecondary)
                }

                Spacer()

                Picker("Size", selection: $canvasSize) {
                    ForEach(DrawingCanvasSize.allCases) { sz in
                        Text(sz.rawValue).tag(sz)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 230)
            }

            // Ink palette + OCR + Clear controls
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(Array(inkSwatches.enumerated()), id: \.offset) { idx, swatch in
                        Button {
                            selectedInkIndex = idx
                            isEraser = false
                        } label: {
                            HStack(spacing: 5) {
                                Circle()
                                    .fill(swatch.color)
                                    .frame(width: 14, height: 14)
                                Text(swatch.name)
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaTextPrimary)
                            }
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(selectedInkIndex == idx && !isEraser ? swatch.color.opacity(0.16) : Color.kymaiaSurface)
                            )
                            .overlay(
                                Capsule()
                                    .strokeBorder(selectedInkIndex == idx && !isEraser ? swatch.color : Color.kymaiaSurfaceBorder, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }

                    Button {
                        isEraser.toggle()
                    } label: {
                        Label("Eraser", systemImage: isEraser ? "eraser.fill" : "eraser")
                            .font(.kymaiaCaption.weight(.medium))
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(isEraser ? Color.kymaiaWarning.opacity(0.18) : Color.kymaiaSurface)
                            )
                            .overlay(
                                Capsule()
                                    .strokeBorder(isEraser ? Color.kymaiaWarning : Color.kymaiaSurfaceBorder, lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)

                    if onRecognizedText != nil && !drawingData.isEmpty {
                        Button {
                            recognizeHandwriting()
                        } label: {
                            Label(
                                isRecognizingText ? "Reading Ink…" : "Ink → Text (Vision OCR)",
                                systemImage: "text.viewfinder"
                            )
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaAccent)
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, 6)
                            .background(Capsule().fill(Color.kymaiaAccent.opacity(0.12)))
                        }
                        .buttonStyle(.plain)
                        .disabled(isRecognizingText)
                    }

                    if !drawingData.isEmpty {
                        Button(role: .destructive) {
                            drawingData = Data()
                            snapshotPNG?.wrappedValue = nil
                            recognizedPreview = ""
                        } label: {
                            Label("Clear", systemImage: "trash")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaError)
                                .padding(.horizontal, Spacing.sm)
                                .padding(.vertical, 6)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // Drawing surface
            ZStack {
                if showGrid {
                    PhysicsGraphPaperBackground()
                } else {
                    RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                        .fill(Color.kymaiaSurfaceElevated)
                }

                #if canImport(PencilKit) && os(iOS)
                IOSDrawingCanvasRepresentable(
                    drawingData: $drawingData,
                    snapshotPNG: snapshotPNG,
                    inkColor: UIColor(inkSwatches[selectedInkIndex].color),
                    lineWidth: lineWidth,
                    isEraser: $isEraser
                )
                #else
                MacDrawingCanvasView(
                    drawingData: $drawingData,
                    snapshotPNG: snapshotPNG,
                    inkColor: inkSwatches[selectedInkIndex].color,
                    inkIndex: selectedInkIndex,
                    lineWidth: lineWidth,
                    isEraser: isEraser
                )
                #endif
            }
            .frame(height: canvasSize.height)
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                    .strokeBorder(Color.kymaiaSurfaceBorder, lineWidth: 1)
            )

            if !recognizedPreview.isEmpty {
                HStack(alignment: .top, spacing: Spacing.sm) {
                    Image(systemName: "sparkles.rectangle.stack")
                        .foregroundStyle(Color.kymaiaAccent)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Recognized Handwriting")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaAccent)
                        Text(recognizedPreview)
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextPrimary)
                    }
                    Spacer()
                }
                .padding(Spacing.sm)
                .background(
                    RoundedRectangle(cornerRadius: CornerRadius.sm, style: .continuous)
                        .fill(Color.kymaiaAccent.opacity(0.08))
                )
            }
        }
    }

    private func recognizeHandwriting() {
        isRecognizingText = true
        let currentData = drawingData
        let currentPNG = snapshotPNG?.wrappedValue

        Task {
            let recognized = await HandwritingRecognizer.recognizeText(
                drawingData: currentData,
                snapshotPNG: currentPNG
            )
            await MainActor.run {
                isRecognizingText = false
                if !recognized.isEmpty {
                    recognizedPreview = recognized
                    onRecognizedText?(recognized)
                }
            }
        }
    }
}

private struct PhysicsGraphPaperBackground: View {
    var body: some View {
        Canvas { context, size in
            context.fill(
                Path(CGRect(origin: .zero, size: size)),
                with: .color(Color.kymaiaSurfaceElevated)
            )
            let minorStep: CGFloat = 20
            let majorStep: CGFloat = 100

            var minorPath = Path()
            var majorPath = Path()

            var x: CGFloat = 0
            while x <= size.width {
                if Int(x) % Int(majorStep) == 0 {
                    majorPath.move(to: CGPoint(x: x, y: 0))
                    majorPath.addLine(to: CGPoint(x: x, y: size.height))
                } else {
                    minorPath.move(to: CGPoint(x: x, y: 0))
                    minorPath.addLine(to: CGPoint(x: x, y: size.height))
                }
                x += minorStep
            }

            var y: CGFloat = 0
            while y <= size.height {
                if Int(y) % Int(majorStep) == 0 {
                    majorPath.move(to: CGPoint(x: 0, y: y))
                    majorPath.addLine(to: CGPoint(x: size.width, y: y))
                } else {
                    minorPath.move(to: CGPoint(x: 0, y: y))
                    minorPath.addLine(to: CGPoint(x: size.width, y: y))
                }
                y += minorStep
            }

            context.stroke(minorPath, with: .color(Color.kymaiaSurfaceBorder.opacity(0.32)), lineWidth: 0.5)
            context.stroke(majorPath, with: .color(Color.kymaiaAccent.opacity(0.16)), lineWidth: 0.9)
        }
    }
}

#if canImport(PencilKit) && os(iOS)
private struct IOSDrawingCanvasRepresentable: UIViewRepresentable {
    @Binding var drawingData: Data
    var snapshotPNG: Binding<Data?>?
    let inkColor: UIColor
    let lineWidth: CGFloat
    @Binding var isEraser: Bool

    func makeCoordinator() -> Coordinator {
        Coordinator(drawingData: $drawingData, snapshotPNG: snapshotPNG, isEraser: $isEraser)
    }

    func makeUIView(context: Context) -> PKCanvasView {
        let canvas = PKCanvasView()
        canvas.backgroundColor = .clear
        canvas.isOpaque = false
        canvas.drawingPolicy = .anyInput
        canvas.delegate = context.coordinator

        for interaction in canvas.interactions where interaction is UIScribbleInteraction {
            canvas.removeInteraction(interaction)
        }

        let pencilInteraction = UIPencilInteraction()
        pencilInteraction.delegate = context.coordinator
        canvas.addInteraction(pencilInteraction)

        if !drawingData.isEmpty, let decoded = try? PKDrawing(data: drawingData) {
            canvas.drawing = decoded
        }

        context.coordinator.attachToolPicker(to: canvas)
        context.coordinator.updateTool(on: canvas, color: inkColor, width: lineWidth)
        return canvas
    }

    func updateUIView(_ uiView: PKCanvasView, context: Context) {
        context.coordinator.drawingData = $drawingData
        context.coordinator.snapshotPNG = snapshotPNG
        context.coordinator.isEraser = $isEraser

        if !context.coordinator.isUpdatingFromCanvas {
            if drawingData.isEmpty && !uiView.drawing.strokes.isEmpty {
                uiView.drawing = PKDrawing()
            } else if !drawingData.isEmpty,
                      let decoded = try? PKDrawing(data: drawingData),
                      decoded.dataRepresentation() != uiView.drawing.dataRepresentation() {
                uiView.drawing = decoded
            }
        }

        context.coordinator.updateTool(on: uiView, color: inkColor, width: lineWidth)
    }

    final class Coordinator: NSObject, PKCanvasViewDelegate, UIPencilInteractionDelegate {
        var drawingData: Binding<Data>
        var snapshotPNG: Binding<Data?>?
        var isEraser: Binding<Bool>
        var isUpdatingFromCanvas = false
        private var toolPicker: PKToolPicker?
        private weak var canvasView: PKCanvasView?
        private var lastColor: UIColor = .label
        private var lastWidth: CGFloat = 2.8

        init(drawingData: Binding<Data>, snapshotPNG: Binding<Data?>?, isEraser: Binding<Bool>) {
            self.drawingData = drawingData
            self.snapshotPNG = snapshotPNG
            self.isEraser = isEraser
        }

        func attachToolPicker(to canvas: PKCanvasView) {
            self.canvasView = canvas
            let picker = PKToolPicker()
            picker.setVisible(true, forFirstResponder: canvas)
            picker.addObserver(canvas)
            self.toolPicker = picker
        }

        func updateTool(on canvas: PKCanvasView, color: UIColor, width: CGFloat) {
            self.lastColor = color
            self.lastWidth = width
            if isEraser.wrappedValue {
                canvas.tool = PKEraserTool(.vector)
            } else {
                canvas.tool = PKInkingTool(.pen, color: color, width: width)
            }
        }

        func canvasViewDrawingDidChange(_ canvasView: PKCanvasView) {
            isUpdatingFromCanvas = true
            defer { isUpdatingFromCanvas = false }

            if canvasView.drawing.strokes.isEmpty {
                drawingData.wrappedValue = Data()
                snapshotPNG?.wrappedValue = nil
            } else {
                drawingData.wrappedValue = canvasView.drawing.dataRepresentation()
                if let snapshotPNG {
                    let bounds = canvasView.bounds.isEmpty ? canvasView.drawing.bounds.insetBy(dx: -16, dy: -16) : canvasView.bounds
                    let img = canvasView.drawing.image(from: bounds, scale: 2.0)
                    snapshotPNG.wrappedValue = img.pngData()
                }
            }
        }

        func pencilInteractionDidTap(_ interaction: UIPencilInteraction) {
            isEraser.wrappedValue.toggle()
            if let canvas = canvasView {
                updateTool(on: canvas, color: lastColor, width: lastWidth)
            }
        }

        @available(iOS 17.5, *)
        func pencilInteraction(_ interaction: UIPencilInteraction, didReceiveSqueeze squeeze: UIPencilInteraction.Squeeze) {
            guard squeeze.phase == .ended else { return }
            isEraser.wrappedValue.toggle()
            if let canvas = canvasView {
                updateTool(on: canvas, color: lastColor, width: lastWidth)
            }
        }
    }
}
#endif

private struct CodableCanvasStroke: Codable {
    let colorIndex: Int
    let lineWidth: Double
    let points: [[Double]]
}

private struct MacDrawingCanvasView: View {
    @Binding var drawingData: Data
    var snapshotPNG: Binding<Data?>?
    let inkColor: Color
    let inkIndex: Int
    let lineWidth: CGFloat
    let isEraser: Bool

    @State private var strokes: [CodableCanvasStroke] = []
    @State private var activePoints: [CGPoint] = []

    private let palette: [Color] = [
        .kymaiaTextPrimary,
        .kymaiaAccent,
        .kymaiaSuccess,
        .kymaiaWarning,
        .kymaiaError,
        .kymaiaBridgeChemistry
    ]

    var body: some View {
        Canvas { context, _ in
            for stroke in strokes where stroke.points.count > 1 {
                var path = Path()
                path.move(to: CGPoint(x: stroke.points[0][0], y: stroke.points[0][1]))
                for pt in stroke.points.dropFirst() where pt.count == 2 {
                    path.addLine(to: CGPoint(x: pt[0], y: pt[1]))
                }
                let strokeColor = palette[min(max(stroke.colorIndex, 0), palette.count - 1)]
                context.stroke(path, with: .color(strokeColor), lineWidth: CGFloat(stroke.lineWidth))
            }

            if activePoints.count > 1 {
                var activePath = Path()
                activePath.move(to: activePoints[0])
                for pt in activePoints.dropFirst() {
                    activePath.addLine(to: pt)
                }
                context.stroke(activePath, with: .color(inkColor), lineWidth: lineWidth)
            }
        }
        .gesture(
            DragGesture(minimumDistance: 0)
                .onChanged { value in
                    if isEraser {
                        strokes.removeAll { s in
                            s.points.contains { pair in
                                pair.count == 2 && hypot(pair[0] - value.location.x, pair[1] - value.location.y) < 18
                            }
                        }
                    } else {
                        activePoints.append(value.location)
                    }
                }
                .onEnded { _ in
                    if !activePoints.isEmpty {
                        let pairs = activePoints.map { [Double($0.x), Double($0.y)] }
                        strokes.append(
                            CodableCanvasStroke(
                                colorIndex: inkIndex,
                                lineWidth: Double(lineWidth),
                                points: pairs
                            )
                        )
                        activePoints.removeAll()
                    }
                    persistStrokes()
                }
        )
        .onAppear {
            restoreStrokes()
        }
        .onChange(of: drawingData) { _, newValue in
            if newValue.isEmpty {
                strokes.removeAll()
            }
        }
    }

    private func persistStrokes() {
        guard !strokes.isEmpty else {
            drawingData = Data()
            snapshotPNG?.wrappedValue = nil
            return
        }
        if let encoded = try? JSONEncoder().encode(strokes) {
            drawingData = encoded
            snapshotPNG?.wrappedValue = encoded
        }
    }

    private func restoreStrokes() {
        guard !drawingData.isEmpty,
              let decoded = try? JSONDecoder().decode([CodableCanvasStroke].self, from: drawingData) else { return }
        strokes = decoded
    }
}

/// On-device Vision handwriting OCR helper (`VNRecognizeTextRequest`).
enum HandwritingRecognizer {
    static func recognizeText(drawingData: Data, snapshotPNG: Data?) async -> String {
        #if canImport(PencilKit) && os(iOS)
        if let decoded = try? PKDrawing(data: drawingData), !decoded.strokes.isEmpty {
            let bounds = decoded.bounds.insetBy(dx: -20, dy: -20)
            let image = decoded.image(from: bounds, scale: 2.0)
            if let cgImage = image.cgImage {
                return await runVisionOCR(on: cgImage)
            }
        }
        #endif

        if let png = snapshotPNG {
            #if canImport(UIKit)
            if let uiImage = UIImage(data: png), let cgImage = uiImage.cgImage {
                return await runVisionOCR(on: cgImage)
            }
            #elseif canImport(AppKit)
            if let nsImage = NSImage(data: png),
               let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: nil) {
                return await runVisionOCR(on: cgImage)
            }
            #endif
        }

        return ""
    }

    private static func runVisionOCR(on cgImage: CGImage) async -> String {
        await withCheckedContinuation { continuation in
            let request = VNRecognizeTextRequest { req, _ in
                let observations = (req.results as? [VNRecognizedTextObservation]) ?? []
                let lines = observations.compactMap { $0.topCandidates(1).first?.string }
                continuation.resume(returning: lines.joined(separator: "\n"))
            }
            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = true

            let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            do {
                try handler.perform([request])
            } catch {
                continuation.resume(returning: "")
            }
        }
    }
}
