import SwiftUI

/// Two inputs and a live result, drawn as an area model: for a product the rectangle's area is
/// the output; for a quotient the rectangle's area is the dividend, its width the divisor and
/// its height the output, so a wider rectangle of the same area is a lower one.
struct SliderRelationVisual: View {
    let relation: SubjectTipVisual.SliderRelation
    @Binding var first: Double
    @Binding var second: Double
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private typealias Logic = SubjectTipVisualLogic
    private var inputA: SubjectTipVisual.SliderRelation.Input { relation.inputs.first }
    private var inputB: SubjectTipVisual.SliderRelation.Input { relation.inputs.second }
    private var result: Double { Logic.output(of: relation, first: first, second: second) ?? 0 }
    private var isDivide: Bool { relation.operation == .divide }
    private var operatorSymbol: String { isDivide ? "÷" : "×" }
    private var isSolutionConcentration: Bool {
        relation.output.name.lowercased().contains("concentration") || inputA.name.lowercased().contains("solute")
    }

    var body: some View {
        SubjectTipObservation(text: relation.observation)
        equation
        if isSolutionConcentration {
            solutionBeakerStage
        }
        diagram
        Text(caption)
            .font(.kymaiaBody)
            .fixedSize(horizontal: false, vertical: true)
        SubjectTipValueControl(title: "\(inputA.name) (\(inputA.symbol))", valueText: "\(Logic.formatted(first)) \(inputA.unit)",
                               value: $first, range: inputA.minimum...inputA.maximum, step: inputA.step,
                               identifier: "subject-tip.slider.first")
        SubjectTipValueControl(title: "\(inputB.name) (\(inputB.symbol))", valueText: "\(Logic.formatted(second)) \(inputB.unit)",
                               value: $second, range: inputB.minimum...inputB.maximum, step: inputB.step,
                               identifier: "subject-tip.slider.second")
    }

    private var solutionBeakerStage: some View {
        let volFraction = max(0.12, min(1.0, second / max(1, inputB.maximum)))
        let maxResult = max(1, inputA.maximum / max(0.25, inputB.minimum))
        let intensity = min(0.85, max(0.14, sqrt(result / maxResult)))
        let particleCount = max(1, min(40, Int(first.rounded())))

        return ViewThatFits(in: .horizontal) {
            HStack(alignment: .center, spacing: Spacing.md) {
                beakerCanvas(volFraction: volFraction, intensity: intensity, particles: particleCount)
                crowdingNotes
            }
            VStack(alignment: .leading, spacing: Spacing.sm) {
                beakerCanvas(volFraction: volFraction, intensity: intensity, particles: particleCount)
                crowdingNotes
            }
        }
        .padding(Spacing.md)
        .journalIllustrationSurface()
        .accessibilityHidden(true)
    }

    private var crowdingNotes: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("Inside the beaker: particle crowding")
                .font(.kymaiaHeadline)
            Text("Solute dissolved: \(Logic.formatted(first)) \(inputA.unit) across \(Logic.formatted(second)) \(inputB.unit) of solution.")
                .font(.kymaiaBody)
                .fixedSize(horizontal: false, vertical: true)
            FlowLayout(spacing: Spacing.xs) {
                JournalChip(text: "Crowding: \(Logic.formatted(result)) \(relation.output.unit)")
                JournalChip(text: result >= 20 ? "Concentrated (crowded)" : (result <= 6 ? "Dilute (spread out)" : "Moderate"))
            }
            Text("Adding solute adds particles. Adding solvent raises the liquid level and spreads the same particles out.")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func beakerCanvas(volFraction: Double, intensity: Double, particles: Int) -> some View {
        Canvas { context, size in
            let bx = CGRect(x: 22, y: 12, width: size.width - 44, height: size.height - 24)
            let fillH = bx.height * CGFloat(volFraction)
            let liquidRect = CGRect(x: bx.minX + 2, y: bx.maxY - fillH, width: bx.width - 4, height: fillH - 2)

            context.fill(Path(roundedRect: liquidRect, cornerRadius: CornerRadius.micro),
                         with: .color(SubjectTipPalette.electron.color.opacity(intensity)))

            var meniscus = Path()
            meniscus.move(to: CGPoint(x: liquidRect.minX, y: liquidRect.minY))
            meniscus.addLine(to: CGPoint(x: liquidRect.maxX, y: liquidRect.minY))
            context.stroke(meniscus, with: .color(SubjectTipPalette.electron.color), lineWidth: 2)

            var vessel = Path()
            vessel.move(to: CGPoint(x: bx.minX - 4, y: bx.minY))
            vessel.addLine(to: CGPoint(x: bx.minX, y: bx.minY))
            vessel.addLine(to: CGPoint(x: bx.minX, y: bx.maxY))
            vessel.addLine(to: CGPoint(x: bx.maxX, y: bx.maxY))
            vessel.addLine(to: CGPoint(x: bx.maxX, y: bx.minY))
            vessel.addLine(to: CGPoint(x: bx.maxX + 4, y: bx.minY))
            context.stroke(vessel, with: .color(Color.kymaiaInk.opacity(0.75)), lineWidth: 2)

            for tick in 1...4 {
                let ty = bx.maxY - bx.height * CGFloat(tick) / 4
                var mark = Path()
                mark.move(to: CGPoint(x: bx.maxX - 8, y: ty))
                mark.addLine(to: CGPoint(x: bx.maxX, y: ty))
                context.stroke(mark, with: .color(Color.kymaiaMutedInk), lineWidth: 1)
            }

            var seed: UInt64 = 19
            func rnd() -> CGFloat {
                seed = seed &* 2_862_933_555_777_941_757 &+ 3_037_000_493
                return CGFloat((seed >> 33) % 10_000) / 10_000
            }
            for _ in 0..<particles {
                let px = liquidRect.minX + 8 + rnd() * max(4, liquidRect.width - 16)
                let py = liquidRect.minY + 6 + rnd() * max(4, liquidRect.height - 12)
                let dot = CGRect(x: px - 3.5, y: py - 3.5, width: 7, height: 7)
                context.fill(Path(ellipseIn: dot), with: .color(SubjectTipPalette.proton.color))
                context.stroke(Path(ellipseIn: dot), with: .color(Color.kymaiaBackground), lineWidth: 0.8)
            }
        }
        .frame(width: 145, height: 145)
    }

    private var equation: some View {
        let output = relation.output
        let resultText = Text("\(Logic.formatted(result)) \(output.unit)").foregroundStyle(Color.kymaiaPrimary)
        return VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(relation.formula)
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
            Text("\(output.symbol) = \(Logic.formatted(first)) \(inputA.unit) \(operatorSymbol) \(Logic.formatted(second)) \(inputB.unit) = \(resultText)")
                .font(.kymaiaMetric)
                .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(relation.formula)
        .accessibilityValue("\(Logic.formatted(first)) \(inputA.unit) \(isDivide ? "divided by" : "times") \(Logic.formatted(second)) \(inputB.unit) equals \(Logic.formatted(result)) \(output.unit)")
        .accessibilityIdentifier("subject-tip.slider.result")
    }

    private var caption: String {
        let output = relation.output
        let a = "\(Logic.formatted(first)) \(inputA.unit)"
        let b = "\(Logic.formatted(second)) \(inputB.unit)"
        let out = "\(Logic.formatted(result)) \(output.unit)"
        if isDivide {
            return "The shaded area is the \(inputA.name), \(a). Spread across \(b), each 1 \(inputB.unit) strip holds "
                + "\(Logic.formatted(result)) \(inputA.unit): a \(output.name) of \(out)."
        }
        return "The shaded area is the \(output.name): \(a) × \(b) = \(out)."
    }

    /// x, y and area of the picture, each as (name, value, unit).
    private var axes: (x: (String, Double, String), y: (String, Double, String), area: (String, Double, String)) {
        let output = relation.output
        if isDivide {
            return ((inputB.name, second, inputB.unit), (output.name, result, output.unit), (inputA.name, first, inputA.unit))
        }
        return ((inputA.name, first, inputA.unit), (inputB.name, second, inputB.unit), (output.name, result, output.unit))
    }

    private var diagram: some View {
        let model = Logic.areaModel(of: relation, first: first, second: second)
        let axes = axes
        let xMaximum = isDivide ? inputB.maximum : inputA.maximum
        let showsLabels = !dynamicTypeSize.isAccessibilitySize
        let strips = isDivide && second >= 2 && second <= 30 && abs(second - second.rounded()) < 1e-9 ? Int(second.rounded()) : 0
        return Canvas { context, size in
            let plot = CGRect(x: 48, y: 30, width: max(10, size.width - 66), height: max(10, size.height - 74))
            drawGrid(in: &context, plot: plot)
            let rect = CGRect(x: plot.minX, y: plot.maxY - plot.height * model.heightFraction,
                              width: plot.width * model.widthFraction, height: plot.height * model.heightFraction)
            context.fill(Path(rect), with: .color(Color.kymaiaPrimary.opacity(0.18)))
            for index in 1..<max(1, strips) {
                let x = rect.minX + rect.width * CGFloat(index) / CGFloat(strips)
                context.stroke(Path { $0.move(to: CGPoint(x: x, y: rect.minY)); $0.addLine(to: CGPoint(x: x, y: rect.maxY)) },
                               with: .color(Color.kymaiaPrimary.opacity(0.55)), lineWidth: 1)
            }
            var outline = Path()
            outline.move(to: CGPoint(x: rect.minX, y: rect.minY))
            outline.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
            outline.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
            context.stroke(outline, with: .color(Color.kymaiaPrimary),
                           style: StrokeStyle(lineWidth: 2.5, lineJoin: .round, dash: model.isCutOff ? [6, 4] : []))
            guard showsLabels else { return }
            let muted = Color.kymaiaMutedInk
            context.drawLabel("\(axes.x.0) (\(axes.x.2))", at: CGPoint(x: plot.midX, y: plot.maxY + 34), color: muted)
            context.drawLabel("\(axes.y.0) (\(axes.y.2))", at: CGPoint(x: plot.minX - 40, y: 10), color: muted, anchor: .leading)
            context.drawLabel("0", at: CGPoint(x: plot.minX - 6, y: plot.maxY + 8), color: muted, anchor: .trailing)
            // Each axis shows its maximum unless the live value's label sits on top of it.
            if rect.maxX < plot.maxX - 32 {
                context.drawLabel(Logic.formatted(xMaximum), at: CGPoint(x: plot.maxX, y: plot.maxY + 6), color: muted, anchor: .top)
            }
            if rect.minY > plot.minY + 18 || rect.height < 0.5 {
                context.drawLabel(Logic.formatted(model.heightScale), at: CGPoint(x: plot.minX - 6, y: plot.minY), color: muted, anchor: .trailing)
            }
            if rect.width > 0.5 {
                context.drawLabel(Logic.formatted(axes.x.1), at: CGPoint(x: rect.maxX, y: plot.maxY + 6), color: .kymaiaPrimaryStrong, anchor: .top, bold: true)
            }
            if rect.height > 0.5 {
                let label = model.isCutOff ? "\(Logic.formatted(axes.y.1)) ↑" : Logic.formatted(axes.y.1)
                context.drawLabel(label, at: CGPoint(x: plot.minX - 6, y: rect.minY), color: .kymaiaPrimaryStrong, anchor: .trailing, bold: true)
            }
            let areaText = "\(axes.area.0) \(Logic.formatted(axes.area.1)) \(axes.area.2)"
            // Inside the rectangle when it fits, above a flat one, beside a narrow tall one.
            if rect.width > 120 && rect.height > 30 {
                context.drawLabel(areaText, at: CGPoint(x: rect.midX, y: rect.midY), color: .kymaiaPrimaryStrong, bold: true)
            } else if rect.height <= 30 {
                context.drawLabel(areaText, at: CGPoint(x: rect.minX + 6, y: rect.minY - 4), color: .kymaiaPrimaryStrong, anchor: .bottomLeading, bold: true)
            } else {
                context.drawLabel(areaText, at: CGPoint(x: rect.maxX + 8, y: rect.midY), color: .kymaiaPrimaryStrong, anchor: .leading, bold: true)
            }
        }
        .frame(height: 250)
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Area picture")
        .accessibilityValue(caption)
        .accessibilityIdentifier("subject-tip.slider.diagram")
    }

    private func drawGrid(in context: inout GraphicsContext, plot: CGRect) {
        var grid = Path()
        for index in 1...4 {
            let x = plot.minX + plot.width * CGFloat(index) / 4
            let y = plot.minY + plot.height * CGFloat(index - 1) / 4
            grid.move(to: CGPoint(x: x, y: plot.minY))
            grid.addLine(to: CGPoint(x: x, y: plot.maxY))
            grid.move(to: CGPoint(x: plot.minX, y: y))
            grid.addLine(to: CGPoint(x: plot.maxX, y: y))
        }
        context.stroke(grid, with: .color(Color.kymaiaPaperRule), lineWidth: 1)
        var axes = Path()
        axes.move(to: CGPoint(x: plot.minX, y: plot.minY - 6))
        axes.addLine(to: CGPoint(x: plot.minX, y: plot.maxY))
        axes.addLine(to: CGPoint(x: plot.maxX + 6, y: plot.maxY))
        context.stroke(axes, with: .color(Color.kymaiaMutedInk), lineWidth: 1.5)
    }
}
