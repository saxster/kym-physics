import SwiftUI
#if canImport(PencilKit) && os(iOS)
import PencilKit
import UIKit
#endif

/// Paper-like handwriting surface used inside practice cards, scratchpads, and journal blocks.
///
/// On iOS/iPadOS this wraps `PKCanvasView` with:
/// - ruled notebook guide lines at 28pt spacing,
/// - `PKToolPicker` shown automatically when the canvas becomes first responder,
/// - `UIScribbleInteraction` disabled on the canvas so Apple Pencil strokes stay ink
///   (solving equations, sketching ray/force diagrams, and writing explanations without Scribble eating strokes),
/// - `UIPencilInteraction` supporting Apple Pencil double-tap (toggle pen/eraser) and
///   Apple Pencil Pro squeeze (reveal tool picker or toggle eraser).
struct PencilWritingCanvas: View {
    @Binding var drawingData: Data
    var minHeight: CGFloat = 170
    var placeholder: String = "Write with Apple Pencil — equations, ray sketches, or full working…"
    var ruledLineSpacing: CGFloat = 28

    @State private var currentHeight: CGFloat
    @State private var isEraserActive = false

    init(
        drawingData: Binding<Data>,
        minHeight: CGFloat = 170,
        placeholder: String = "Write with Apple Pencil — equations, ray sketches, or full working…",
        ruledLineSpacing: CGFloat = 28
    ) {
        self._drawingData = drawingData
        self.minHeight = minHeight
        self.placeholder = placeholder
        self.ruledLineSpacing = ruledLineSpacing
        self._currentHeight = State(initialValue: minHeight)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack(spacing: Spacing.sm) {
                Label("Apple Pencil Canvas", systemImage: "pencil.tip.crop.circle")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Color.kymaiaAccent)

                Spacer()

                Button {
                    isEraserActive.toggle()
                } label: {
                    Label(isEraserActive ? "Eraser" : "Pen", systemImage: isEraserActive ? "eraser.fill" : "pencil.tip")
                        .font(.kymaiaCaption.weight(.medium))
                }
                .buttonStyle(.bordered)
                .controlSize(.small)

                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        currentHeight = min(currentHeight + 120, 560)
                    }
                } label: {
                    Label("More space", systemImage: "arrow.up.and.down.text.horizontal")
                        .font(.kymaiaCaption)
                }
                .buttonStyle(.plain)
                .foregroundStyle(Color.kymaiaTextSecondary)

                if !drawingData.isEmpty {
                    Button(role: .destructive) {
                        drawingData = Data()
                    } label: {
                        Label("Clear", systemImage: "trash")
                            .font(.kymaiaCaption)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(Color.kymaiaError)
                }
            }

            ZStack(alignment: .topLeading) {
                RuledPaperBackground(lineSpacing: ruledLineSpacing)

                if drawingData.isEmpty {
                    Text(placeholder)
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaTextTertiary)
                        .padding(.horizontal, Spacing.md)
                        .padding(.top, Spacing.sm)
                        .allowsHitTesting(false)
                }

                #if canImport(PencilKit) && os(iOS)
                IOSPencilWritingRepresentable(
                    drawingData: $drawingData,
                    isEraserActive: $isEraserActive
                )
                #else
                MacFallbackStrokeCanvas(
                    drawingData: $drawingData,
                    isEraserActive: isEraserActive
                )
                #endif
            }
            .frame(height: currentHeight)
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                    .strokeBorder(Color.kymaiaSurfaceBorder, lineWidth: 1)
            )
        }
    }
}

private struct RuledPaperBackground: View {
    let lineSpacing: CGFloat

    var body: some View {
        Canvas { context, size in
            context.fill(
                Path(CGRect(origin: .zero, size: size)),
                with: .color(Color.kymaiaSurfaceElevated)
            )

            var margin = Path()
            margin.move(to: CGPoint(x: 34, y: 0))
            margin.addLine(to: CGPoint(x: 34, y: size.height))
            context.stroke(margin, with: .color(Color.kymaiaError.opacity(0.18)), lineWidth: 1)

            var y = lineSpacing
            while y < size.height {
                var line = Path()
                line.move(to: CGPoint(x: 0, y: y))
                line.addLine(to: CGPoint(x: size.width, y: y))
                context.stroke(line, with: .color(Color.kymaiaAccent.opacity(0.12)), lineWidth: 0.75)
                y += lineSpacing
            }
        }
    }
}

#if canImport(PencilKit) && os(iOS)
private struct IOSPencilWritingRepresentable: UIViewRepresentable {
    @Binding var drawingData: Data
    @Binding var isEraserActive: Bool

    func makeCoordinator() -> Coordinator {
        Coordinator(drawingData: $drawingData, isEraserActive: $isEraserActive)
    }

    func makeUIView(context: Context) -> PKCanvasView {
        let canvas = PKCanvasView()
        canvas.backgroundColor = .clear
        canvas.isOpaque = false
        canvas.drawingPolicy = .anyInput
        canvas.alwaysBounceVertical = false
        canvas.delegate = context.coordinator

        // Disable Scribble so equations, arrows, and sub-scripts remain ink strokes
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
        context.coordinator.applyTool(to: canvas)
        return canvas
    }

    func updateUIView(_ uiView: PKCanvasView, context: Context) {
        context.coordinator.drawingData = $drawingData
        context.coordinator.isEraserActive = $isEraserActive

        if !context.coordinator.isUpdatingFromCanvas {
            if drawingData.isEmpty && !uiView.drawing.strokes.isEmpty {
                uiView.drawing = PKDrawing()
            } else if !drawingData.isEmpty,
                      let decoded = try? PKDrawing(data: drawingData),
                      decoded.dataRepresentation() != uiView.drawing.dataRepresentation() {
                uiView.drawing = decoded
            }
        }
        context.coordinator.applyTool(to: uiView)
    }

    final class Coordinator: NSObject, PKCanvasViewDelegate, UIPencilInteractionDelegate {
        var drawingData: Binding<Data>
        var isEraserActive: Binding<Bool>
        var isUpdatingFromCanvas = false
        private var toolPicker: PKToolPicker?
        private weak var canvasView: PKCanvasView?

        init(drawingData: Binding<Data>, isEraserActive: Binding<Bool>) {
            self.drawingData = drawingData
            self.isEraserActive = isEraserActive
        }

        func attachToolPicker(to canvas: PKCanvasView) {
            self.canvasView = canvas
            let picker = PKToolPicker()
            picker.setVisible(true, forFirstResponder: canvas)
            picker.addObserver(canvas)
            self.toolPicker = picker
        }

        func applyTool(to canvas: PKCanvasView) {
            if isEraserActive.wrappedValue {
                canvas.tool = PKEraserTool(.vector)
            } else {
                canvas.tool = PKInkingTool(.pen, color: .label, width: 2.5)
            }
        }

        func canvasViewDrawingDidChange(_ canvasView: PKCanvasView) {
            isUpdatingFromCanvas = true
            defer { isUpdatingFromCanvas = false }
            if canvasView.drawing.strokes.isEmpty {
                drawingData.wrappedValue = Data()
            } else {
                drawingData.wrappedValue = canvasView.drawing.dataRepresentation()
            }
        }

        func pencilInteractionDidTap(_ interaction: UIPencilInteraction) {
            isEraserActive.wrappedValue.toggle()
            if let canvas = canvasView {
                applyTool(to: canvas)
            }
        }

        @available(iOS 17.5, *)
        func pencilInteraction(_ interaction: UIPencilInteraction, didReceiveSqueeze squeeze: UIPencilInteraction.Squeeze) {
            guard squeeze.phase == .ended else { return }
            if let canvas = canvasView, !canvas.isFirstResponder {
                canvas.becomeFirstResponder()
            } else {
                isEraserActive.wrappedValue.toggle()
                if let canvas = canvasView {
                    applyTool(to: canvas)
                }
            }
        }
    }
}
#endif

private struct MacFallbackStrokeCanvas: View {
    @Binding var drawingData: Data
    let isEraserActive: Bool
    @State private var strokes: [[CGPoint]] = []
    @State private var activeStroke: [CGPoint] = []

    var body: some View {
        Canvas { context, _ in
            for stroke in strokes + [activeStroke] where stroke.count > 1 {
                var path = Path()
                path.move(to: stroke[0])
                for pt in stroke.dropFirst() {
                    path.addLine(to: pt)
                }
                context.stroke(path, with: .color(Color.kymaiaTextPrimary), lineWidth: 2.2)
            }
        }
        .gesture(
            DragGesture(minimumDistance: 0)
                .onChanged { value in
                    if isEraserActive {
                        strokes.removeAll { pts in
                            pts.contains { hypot($0.x - value.location.x, $0.y - value.location.y) < 18 }
                        }
                    } else {
                        activeStroke.append(value.location)
                    }
                }
                .onEnded { _ in
                    if !activeStroke.isEmpty {
                        strokes.append(activeStroke)
                        activeStroke.removeAll()
                    }
                    syncData()
                }
        )
        .onAppear {
            loadFromData()
        }
        .onChange(of: drawingData) { _, newValue in
            if newValue.isEmpty {
                strokes.removeAll()
            }
        }
    }

    private func syncData() {
        guard !strokes.isEmpty else {
            drawingData = Data()
            return
        }
        let encoded = strokes.map { pts in pts.map { [Double($0.x), Double($0.y)] } }
        if let data = try? JSONEncoder().encode(encoded) {
            drawingData = data
        }
    }

    private func loadFromData() {
        guard !drawingData.isEmpty,
              let decoded = try? JSONDecoder().decode([[[Double]]].self, from: drawingData) else { return }
        strokes = decoded.map { stroke in
            stroke.compactMap { pair in
                pair.count == 2 ? CGPoint(x: pair[0], y: pair[1]) : nil
            }
        }
    }
}
