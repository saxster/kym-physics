import SwiftUI

/// A short labelled sequence the learner pages through, one step at a time.
struct StepSequenceVisual: View {
    let sequence: SubjectTipVisual.StepSequence
    @Binding var step: Int
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @ScaledMetric(relativeTo: .largeTitle) private var symbolSide: CGFloat = 72

    private var count: Int { sequence.steps.count }
    private var current: Int { min(max(0, step), max(0, count - 1)) }

    private enum DiagramTheme {
        case bonding
        case formulas
        case general
    }

    private var diagramTheme: DiagramTheme {
        let combined = sequence.steps.map(\.title).joined(separator: " ").lowercased()
        if combined.contains("covalent") || combined.contains("ionic") || combined.contains("outer shell") {
            return .bonding
        }
        if combined.contains("subscript") || combined.contains("bracket") || combined.contains("headcount") {
            return .formulas
        }
        return .general
    }

    var body: some View {
        if !sequence.steps.isEmpty {
            if !dynamicTypeSize.isAccessibilitySize { progress }
            panel
            controls
                .buttonStyle(SessionGhostButtonStyle())
        }
    }

    private var progress: some View {
        HStack(spacing: 0) {
            ForEach(0..<count, id: \.self) { index in
                if index > 0 {
                    Rectangle()
                        .fill(index <= current ? Color.kymaiaPrimary : Color.kymaiaHairline)
                        .frame(height: 2)
                        .accessibilityHidden(true)
                }
                Button { step = index } label: { marker(index) }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Step \(index + 1): \(sequence.steps[index].title)")
                    .accessibilityAddTraits(index == current ? .isSelected : [])
                    .accessibilityIdentifier("subject-tip.steps.go.\(index + 1)")
            }
        }
    }

    private func marker(_ index: Int) -> some View {
        ZStack {
            Circle()
                .fill(index == current ? Color.kymaiaPrimary : (index < current ? Color.kymaiaSelectionFill : Color.kymaiaSurface))
            Circle()
                .strokeBorder(index <= current ? Color.kymaiaPrimary : Color.kymaiaControlBorder, lineWidth: 1.5)
            if index < current {
                Image(systemName: "checkmark").font(.kymaiaCaption.weight(.bold)).foregroundStyle(Color.kymaiaPrimaryStrong)
            } else {
                Text("\(index + 1)")
                    .font(.kymaiaCaption.weight(.bold))
                    .foregroundStyle(index == current ? Color.kymaiaBackground : Color.kymaiaInk)
            }
        }
        .frame(width: 30, height: 30)
        .frame(width: Theme.Dimension.minimumTarget, height: Theme.Dimension.minimumTarget)
        .contentShape(Rectangle())
    }

    private var panel: some View {
        let item = sequence.steps[current]
        return VStack(alignment: .leading, spacing: Spacing.sm) {
            stepDiagram(for: item, index: current)
            Text("Step \(current + 1) of \(count)")
                .font(.kymaiaEyebrow)
                .textCase(.uppercase)
                .foregroundStyle(Color.kymaiaMutedInk)
            Text(item.title).font(.kymaiaTitle)
            Text(item.caption)
                .font(.kymaiaSerifProse)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Spacing.md)
        .journalIllustrationSurface()
        .kymaiaAnimation(.kymaiaStandard, value: current)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("subject-tip.steps.panel")
    }

    @ViewBuilder
    private func stepDiagram(for item: SubjectTipVisual.StepSequence.Step, index: Int) -> some View {
        switch diagramTheme {
        case .bonding:
            bondingCanvas(step: index)
                .frame(height: 165)
                .accessibilityHidden(true)
        case .formulas:
            formulaCanvas(step: index)
                .frame(height: 165)
                .accessibilityHidden(true)
        case .general:
            HStack(spacing: Spacing.md) {
                Image(systemName: item.symbol)
                    .font(.kymaiaDisplay)
                    .foregroundStyle(Color.kymaiaPrimaryStrong)
                    .frame(width: symbolSide, height: symbolSide)
                    .background(Color.kymaiaSelectionFill, in: Circle())
                VStack(alignment: .leading, spacing: Spacing.xs / 2) {
                    ForEach(0..<count, id: \.self) { idx in
                        HStack(spacing: Spacing.xs) {
                            Circle()
                                .fill(idx == index ? Color.kymaiaPrimary : Color.kymaiaHairline)
                                .frame(width: 8, height: 8)
                            Text(sequence.steps[idx].title)
                                .font(.kymaiaCaption.weight(idx == index ? .bold : .regular))
                                .foregroundStyle(idx == index ? Color.kymaiaInk : Color.kymaiaMutedInk)
                        }
                    }
                }
            }
            .accessibilityHidden(true)
        }
    }

    private func bondingCanvas(step: Int) -> some View {
        Canvas { context, size in
            let midY = size.height / 2
            switch step % 4 {
            case 0:
                drawShellAtom(in: &context, centre: CGPoint(x: size.width * 0.28, y: midY),
                              symbol: "F", valence: 7, capacity: 8, caption: "7/8 outer e⁻ (1 gap)")
                drawShellAtom(in: &context, centre: CGPoint(x: size.width * 0.72, y: midY),
                              symbol: "Ne", valence: 8, capacity: 8, caption: "8/8 full shell (stable)")
            case 1:
                let leftC = CGPoint(x: size.width * 0.39, y: midY - 6)
                let rightC = CGPoint(x: size.width * 0.61, y: midY - 6)
                let r: CGFloat = 46
                let overlapRect = CGRect(x: size.width / 2 - 14, y: midY - 28, width: 28, height: 44)
                context.fill(Path(ellipseIn: overlapRect), with: .color(SubjectTipPalette.electron.color.opacity(0.18)))

                for centre in [leftC, rightC] {
                    let ring = CGRect(x: centre.x - r, y: centre.y - r, width: r * 2, height: r * 2)
                    context.stroke(Path(ellipseIn: ring), with: .color(SubjectTipPalette.electron.color), lineWidth: 2)
                    drawAtomCore(in: &context, centre: centre, symbol: "H", fill: SubjectTipPalette.proton.color)
                }
                drawElectronDot(in: &context, at: CGPoint(x: size.width / 2, y: midY - 15))
                drawElectronDot(in: &context, at: CGPoint(x: size.width / 2, y: midY + 3))
                let note = Text("Shared pair (H–H covalent bond)").font(.kymaiaCaption.weight(.semibold)).foregroundStyle(Color.kymaiaInk)
                context.draw(context.resolve(note), at: CGPoint(x: size.width / 2, y: size.height - 14), anchor: .center)
            case 2:
                let leftC = CGPoint(x: size.width * 0.27, y: midY - 6)
                let rightC = CGPoint(x: size.width * 0.73, y: midY - 6)
                drawShellAtom(in: &context, centre: leftC, symbol: "Na⁺", valence: 8, capacity: 8, caption: "Lost 1 e⁻ → +1 ion")
                drawShellAtom(in: &context, centre: rightC, symbol: "Cl⁻", valence: 8, capacity: 8, caption: "Gained 1 e⁻ → −1 ion")

                var arrow = Path()
                arrow.move(to: CGPoint(x: leftC.x + 44, y: midY - 24))
                arrow.addQuadCurve(to: CGPoint(x: rightC.x - 44, y: midY - 24),
                                   control: CGPoint(x: size.width / 2, y: midY - 56))
                context.stroke(arrow, with: .color(SubjectTipPalette.proton.color),
                               style: StrokeStyle(lineWidth: 2, dash: [4, 3]))
                let transferText = Text("1 e⁻ transfers → +/− attract").font(.kymaiaCaption.weight(.bold)).foregroundStyle(SubjectTipPalette.proton.color)
                context.draw(context.resolve(transferText), at: CGPoint(x: size.width / 2, y: midY - 48), anchor: .center)
            default:
                let leftX = size.width * 0.26
                let rightX = size.width * 0.74
                for r in 0..<2 {
                    for c in 0..<3 {
                        let pt = CGPoint(x: leftX - 26 + CGFloat(c) * 26, y: midY - 20 + CGFloat(r) * 26)
                        let isPos = (r + c).isMultiple(of: 2)
                        drawAtomCore(in: &context, centre: pt, symbol: isPos ? "+" : "−",
                                     fill: isPos ? SubjectTipPalette.proton.color : SubjectTipPalette.electron.color, radius: 11)
                    }
                }
                let lCaption = Text("Metal + Non-metal → Ionic lattice").font(.kymaiaCaption.weight(.semibold)).foregroundStyle(Color.kymaiaInk)
                context.draw(context.resolve(lCaption), at: CGPoint(x: leftX, y: size.height - 14), anchor: .center)

                drawAtomCore(in: &context, centre: CGPoint(x: rightX, y: midY - 12), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 13)
                drawAtomCore(in: &context, centre: CGPoint(x: rightX - 22, y: midY + 8), symbol: "H", fill: SubjectTipPalette.electron.color, radius: 10)
                drawAtomCore(in: &context, centre: CGPoint(x: rightX + 22, y: midY + 8), symbol: "H", fill: SubjectTipPalette.electron.color, radius: 10)
                let rCaption = Text("Non-metal + Non-metal → Covalent").font(.kymaiaCaption.weight(.semibold)).foregroundStyle(Color.kymaiaInk)
                context.draw(context.resolve(rCaption), at: CGPoint(x: rightX, y: size.height - 14), anchor: .center)
            }
        }
    }

    private func formulaCanvas(step: Int) -> some View {
        Canvas { context, size in
            let midX = size.width / 2
            let midY = size.height / 2 - 10
            switch step % 4 {
            case 0:
                drawBondLine(in: &context, from: CGPoint(x: midX - 36, y: midY + 10), to: CGPoint(x: midX, y: midY - 8))
                drawBondLine(in: &context, from: CGPoint(x: midX + 36, y: midY + 10), to: CGPoint(x: midX, y: midY - 8))
                drawAtomCore(in: &context, centre: CGPoint(x: midX, y: midY - 8), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 15)
                drawAtomCore(in: &context, centre: CGPoint(x: midX - 36, y: midY + 10), symbol: "H", fill: SubjectTipPalette.electron.color, radius: 12)
                drawAtomCore(in: &context, centre: CGPoint(x: midX + 36, y: midY + 10), symbol: "H", fill: SubjectTipPalette.electron.color, radius: 12)
                drawFooter(in: &context, size: size, text: "H₂O  →  H × 2  +  O × 1  =  3 atoms")
            case 1:
                drawAtomCore(in: &context, centre: CGPoint(x: midX, y: midY), symbol: "Ca", fill: SubjectTipPalette.mass.color, radius: 16)
                for offset: CGFloat in [-78, 78] {
                    let box = CGRect(x: midX + offset - 34, y: midY - 22, width: 68, height: 44)
                    context.stroke(Path(roundedRect: box, cornerRadius: CornerRadius.small),
                                   with: .color(Color.kymaiaPrimary), style: StrokeStyle(lineWidth: 1.6, dash: [4, 3]))
                    drawAtomCore(in: &context, centre: CGPoint(x: midX + offset - 14, y: midY), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 12)
                    drawAtomCore(in: &context, centre: CGPoint(x: midX + offset + 14, y: midY), symbol: "H", fill: SubjectTipPalette.electron.color, radius: 10)
                }
                drawFooter(in: &context, size: size, text: "Ca(OH)₂  →  1 Ca + 2×(1 O + 1 H) = 1 Ca, 2 O, 2 H (5 atoms)")
            case 2:
                for idx in -1...1 {
                    let cx = midX + CGFloat(idx) * 92
                    drawBondLine(in: &context, from: CGPoint(x: cx - 24, y: midY), to: CGPoint(x: cx + 24, y: midY))
                    drawAtomCore(in: &context, centre: CGPoint(x: cx, y: midY), symbol: "C", fill: SubjectTipPalette.neutron.color, radius: 12)
                    drawAtomCore(in: &context, centre: CGPoint(x: cx - 24, y: midY), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 10)
                    drawAtomCore(in: &context, centre: CGPoint(x: cx + 24, y: midY), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 10)
                }
                drawFooter(in: &context, size: size, text: "3 CO₂  →  3 × (1 C + 2 O) = 3 C + 6 O = 9 atoms")
            default:
                drawAtomCore(in: &context, centre: CGPoint(x: midX, y: midY), symbol: "Mg", fill: SubjectTipPalette.mass.color, radius: 16)
                for side: CGFloat in [-82, 82] {
                    let gx = midX + side
                    let box = CGRect(x: gx - 38, y: midY - 28, width: 76, height: 56)
                    context.stroke(Path(roundedRect: box, cornerRadius: CornerRadius.small),
                                   with: .color(Color.kymaiaPrimary), style: StrokeStyle(lineWidth: 1.6, dash: [4, 3]))
                    drawAtomCore(in: &context, centre: CGPoint(x: gx, y: midY), symbol: "N", fill: SubjectTipPalette.electron.color, radius: 11)
                    drawAtomCore(in: &context, centre: CGPoint(x: gx - 22, y: midY - 14), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 8.5)
                    drawAtomCore(in: &context, centre: CGPoint(x: gx + 22, y: midY - 14), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 8.5)
                    drawAtomCore(in: &context, centre: CGPoint(x: gx, y: midY + 18), symbol: "O", fill: SubjectTipPalette.proton.color, radius: 8.5)
                }
                drawFooter(in: &context, size: size, text: "Mg(NO₃)₂  →  1 Mg + 2 N + 6 O = 9 atoms total")
            }
        }
    }

    private func drawShellAtom(in context: inout GraphicsContext, centre: CGPoint,
                               symbol: String, valence: Int, capacity: Int, caption: String) {
        let r: CGFloat = 38
        let ring = CGRect(x: centre.x - r, y: centre.y - r, width: r * 2, height: r * 2)
        context.stroke(Path(ellipseIn: ring), with: .color(SubjectTipPalette.electron.color), lineWidth: 1.8)
        drawAtomCore(in: &context, centre: centre, symbol: symbol, fill: SubjectTipPalette.proton.color, radius: 15)
        for slot in 0..<capacity {
            let angle = -Double.pi / 2 + Double(slot) * 2 * .pi / Double(capacity)
            let pt = CGPoint(x: centre.x + cos(angle) * r, y: centre.y + sin(angle) * r)
            if slot < valence {
                drawElectronDot(in: &context, at: pt)
            } else {
                let empty = CGRect(x: pt.x - 4.5, y: pt.y - 4.5, width: 9, height: 9)
                context.stroke(Path(ellipseIn: empty), with: .color(SubjectTipPalette.proton.color),
                               style: StrokeStyle(lineWidth: 1.4, dash: [2, 2]))
            }
        }
        let label = Text(caption).font(.kymaiaCaption).foregroundStyle(Color.kymaiaMutedInk)
        context.draw(context.resolve(label), at: CGPoint(x: centre.x, y: centre.y + r + 16), anchor: .center)
    }

    private func drawAtomCore(in context: inout GraphicsContext, centre: CGPoint,
                              symbol: String, fill: Color, radius: CGFloat = 14) {
        let rect = CGRect(x: centre.x - radius, y: centre.y - radius, width: radius * 2, height: radius * 2)
        context.fill(Path(ellipseIn: rect), with: .color(fill))
        context.stroke(Path(ellipseIn: rect), with: .color(Color.kymaiaBackground), lineWidth: 1.2)
        let txt = Text(symbol).font(.kymaiaCaption.weight(.bold)).foregroundStyle(Color.kymaiaBackground)
        context.draw(context.resolve(txt), at: centre, anchor: .center)
    }

    private func drawElectronDot(in context: inout GraphicsContext, at pt: CGPoint) {
        let rect = CGRect(x: pt.x - 4.5, y: pt.y - 4.5, width: 9, height: 9)
        context.fill(Path(ellipseIn: rect), with: .color(SubjectTipPalette.electron.color))
    }

    private func drawBondLine(in context: inout GraphicsContext, from a: CGPoint, to b: CGPoint) {
        var path = Path()
        path.move(to: a)
        path.addLine(to: b)
        context.stroke(path, with: .color(Color.kymaiaInk.opacity(0.6)), lineWidth: 2.2)
    }

    private func drawFooter(in context: inout GraphicsContext, size: CGSize, text: String) {
        let label = Text(text).font(.kymaiaCaption.weight(.semibold)).foregroundStyle(Color.kymaiaInk)
        context.draw(context.resolve(label), at: CGPoint(x: size.width / 2, y: size.height - 12), anchor: .center)
    }

    @ViewBuilder private var controls: some View {
        if dynamicTypeSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                previous
                next
            }
        } else {
            HStack {
                previous
                Spacer()
                next
            }
        }
    }

    private var previous: some View {
        Button("Previous step") { step = max(0, current - 1) }
            .disabled(current == 0)
            .opacity(current == 0 ? 0.45 : 1)
            .accessibilityIdentifier("subject-tip.steps.previous")
    }

    private var next: some View {
        Button("Next step") { step = min(count - 1, current + 1) }
            .disabled(current >= count - 1)
            .opacity(current >= count - 1 ? 0.45 : 1)
            .accessibilityIdentifier("subject-tip.steps.next")
    }
}
