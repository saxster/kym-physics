import SwiftUI

/// A battery, two bulbs and their switches, in one series loop or two parallel branches.
/// Lit bulbs show rays and say "on"; arrows mark the wires carrying current.
struct CircuitToggleVisual: View {
    let circuit: SubjectTipVisual.CircuitToggle
    @Binding var switchesClosed: [Bool]
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.colorScheme) private var colorScheme

    private typealias Logic = SubjectTipVisualLogic
    private var isSeries: Bool { circuit.layout == .series }
    private var lit: [Bool] { Logic.litBulbs(layout: circuit.layout, switchesClosed: switchesClosed) }
    private let bulbNames = ["A", "B"]

    var body: some View {
        SubjectTipObservation(text: circuit.observation)
        diagram
        Text(lit.contains(true) ? "Arrows show where current flows." : "There is no complete loop, so no current flows.")
            .font(.kymaiaCaption)
            .foregroundStyle(Color.kymaiaMutedInk)
        ViewThatFits(in: .horizontal) {
            HStack(spacing: Spacing.lg) { bulbStatus }
            VStack(alignment: .leading, spacing: Spacing.xs) { bulbStatus }
        }
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("subject-tip.circuit.bulbs")
        ForEach(0..<switchesClosed.count, id: \.self) { index in
            Button {
                switchesClosed[index].toggle()
            } label: {
                Label(switchTitle(index), systemImage: switchesClosed[index] ? "power.circle" : "power.circle.fill")
                    .font(.kymaiaControlLabel)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .buttonStyle(KymaiaSecondaryButtonStyle())
            .accessibilityValue(switchesClosed[index] ? "Closed" : "Open")
            .accessibilityIdentifier("subject-tip.circuit.switch.\(index + 1)")
        }
    }

    @ViewBuilder private var bulbStatus: some View {
        ForEach(0..<2, id: \.self) { index in
            Label("Bulb \(bulbNames[index]): \(lit[index] ? "on" : "off")", systemImage: lit[index] ? "lightbulb.fill" : "lightbulb.slash")
                .font(.kymaiaHeadline)
        }
    }

    private func switchTitle(_ index: Int) -> String {
        let action = switchesClosed[index] ? "Open" : "Close"
        return isSeries ? "\(action) the switch" : "\(action) switch \(index + 1) (bulb \(bulbNames[index]))"
    }

    private var spokenDescription: String {
        let switches = switchesClosed.enumerated().map { index, closed in
            "\(isSeries ? "The switch" : "Switch \(index + 1)") is \(closed ? "closed" : "open")."
        }
        let bulbs = lit.enumerated().map { "Bulb \(bulbNames[$0.offset]) is \($0.element ? "on" : "off")." }
        return ([isSeries ? "Series circuit: one loop." : "Parallel circuit: two branches."] + switches + bulbs).joined(separator: " ")
    }

    private var diagram: some View {
        let showsLabels = !dynamicTypeSize.isAccessibilitySize
        let closed = switchesClosed
        let lit = lit
        return Canvas { context, size in
            let frame = CircuitFrame(size: size)
            drawBattery(in: &context, frame: frame, showsLabels: showsLabels)
            if isSeries {
                drawSeries(in: &context, frame: frame, closed: closed.first ?? false, lit: lit, showsLabels: showsLabels)
            } else {
                drawParallel(in: &context, frame: frame, closed: closed, lit: lit, showsLabels: showsLabels)
            }
        }
        .frame(height: 240)
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Circuit diagram")
        .accessibilityValue(spokenDescription)
        .accessibilityIdentifier("subject-tip.circuit.diagram")
    }

    // MARK: Drawing

    private struct CircuitFrame {
        let left: CGFloat
        let right: CGFloat
        let top: CGFloat
        let middle: CGFloat
        let bottom: CGFloat
        let batteryX: CGFloat
        let switchX: CGFloat
        let bulbX: CGFloat

        init(size: CGSize) {
            left = 36
            right = size.width - 36
            top = 44
            bottom = size.height - 40
            middle = (44 + bottom) / 2 + 8
            batteryX = (left + right) / 2
            switchX = left + (right - left) * 0.3
            bulbX = left + (right - left) * 0.68
        }
    }

    private static let bulbRadius: CGFloat = 16
    private static let switchGap: CGFloat = 18
    private static let batteryHalfWidth: CGFloat = 14

    private func wire(_ context: inout GraphicsContext, _ points: [CGPoint]) {
        var path = Path()
        path.addLines(points)
        context.stroke(path, with: .color(Color.kymaiaInk), style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))
    }

    private func current(_ context: inout GraphicsContext, at point: CGPoint, dx: CGFloat, dy: CGFloat) {
        let size: CGFloat = 7
        var head = Path()
        head.move(to: CGPoint(x: point.x + dx * size, y: point.y + dy * size))
        head.addLine(to: CGPoint(x: point.x - dx * size - dy * size, y: point.y - dy * size + dx * size))
        head.addLine(to: CGPoint(x: point.x - dx * size + dy * size, y: point.y - dy * size - dx * size))
        head.closeSubpath()
        context.fill(head, with: .color(Color.kymaiaPrimary))
    }

    private func drawBattery(in context: inout GraphicsContext, frame: CircuitFrame, showsLabels: Bool) {
        let y = frame.bottom
        let half = Self.batteryHalfWidth
        wire(&context, [CGPoint(x: frame.left, y: y), CGPoint(x: frame.batteryX - half, y: y)])
        wire(&context, [CGPoint(x: frame.batteryX + half, y: y), CGPoint(x: frame.right, y: y)])
        // Two cells, negative (short, thick) plate first: current leaves the long plate on the right.
        for (offset, isLong) in [(-half, false), (-half / 2.5, true), (half / 2.5, false), (half, true)] {
            var plate = Path()
            let height: CGFloat = isLong ? 30 : 14
            plate.move(to: CGPoint(x: frame.batteryX + offset, y: y - height / 2))
            plate.addLine(to: CGPoint(x: frame.batteryX + offset, y: y + height / 2))
            context.stroke(plate, with: .color(Color.kymaiaInk), lineWidth: isLong ? 2 : 4.5)
        }
        guard showsLabels else { return }
        context.drawLabel("battery", at: CGPoint(x: frame.batteryX, y: y + 24), color: .kymaiaMutedInk)
        context.drawLabel("+", at: CGPoint(x: frame.batteryX + half + 8, y: y - 16), color: .kymaiaMutedInk, bold: true)
    }

    private func drawSwitch(in context: inout GraphicsContext, x: CGFloat, y: CGFloat, closed: Bool, label: String, showsLabels: Bool) {
        let gap = Self.switchGap
        let start = CGPoint(x: x - gap, y: y)
        let end = closed ? CGPoint(x: x + gap, y: y) : CGPoint(x: x - gap + 2 * gap * cos(.pi / 6), y: y - 2 * gap * sin(.pi / 6))
        var blade = Path()
        blade.move(to: start)
        blade.addLine(to: end)
        context.stroke(blade, with: .color(Color.kymaiaInk), style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
        for point in [start, CGPoint(x: x + gap, y: y)] {
            context.fill(Path(ellipseIn: CGRect(x: point.x - 3.5, y: point.y - 3.5, width: 7, height: 7)), with: .color(Color.kymaiaInk))
        }
        guard showsLabels else { return }
        context.drawLabel("\(label) \(closed ? "closed" : "open")", at: CGPoint(x: x, y: y + 18), color: .kymaiaMutedInk)
    }

    private func drawBulb(in context: inout GraphicsContext, at center: CGPoint, lit: Bool, label: String, labelAnchor: UnitPoint, showsLabels: Bool) {
        let radius = Self.bulbRadius
        // A bulb on the right-hand side wire carries its label to the left; its wire runs vertically.
        let wireIsVertical = labelAnchor == .trailing
        if lit {
            var rays = Path()
            // No ray along the wire itself, where it would sit on top of the line.
            let alongWire: Set<Int> = wireIsVertical ? [2, 6] : [0, 4]
            for index in 0..<8 where !alongWire.contains(index) {
                let angle = CGFloat(index) * .pi / 4
                rays.move(to: CGPoint(x: center.x + cos(angle) * (radius + 4), y: center.y + sin(angle) * (radius + 4)))
                rays.addLine(to: CGPoint(x: center.x + cos(angle) * (radius + 11), y: center.y + sin(angle) * (radius + 11)))
            }
            context.stroke(rays, with: .color(Color.kymaiaWarning), style: StrokeStyle(lineWidth: 2, lineCap: .round))
        }
        let circle = Path(ellipseIn: CGRect(x: center.x - radius, y: center.y - radius, width: radius * 2, height: radius * 2))
        // The lit glass is yellow in both appearances, so its outline and filament stay dark on it.
        let glassInk = lit && colorScheme == .dark ? Color.kymaiaBackground : Color.kymaiaInk
        context.fill(circle, with: .color(lit ? Color.kymaiaTileHighlight : Color.kymaiaSurface))
        context.stroke(circle, with: .color(glassInk), lineWidth: 2)
        var cross = Path()
        let arm = radius * 0.7
        cross.move(to: CGPoint(x: center.x - arm, y: center.y - arm))
        cross.addLine(to: CGPoint(x: center.x + arm, y: center.y + arm))
        cross.move(to: CGPoint(x: center.x + arm, y: center.y - arm))
        cross.addLine(to: CGPoint(x: center.x - arm, y: center.y + arm))
        context.stroke(cross, with: .color(glassInk), lineWidth: 1.5)
        guard showsLabels else { return }
        let offset = radius + 16
        let position = labelAnchor == .trailing ? CGPoint(x: center.x - offset, y: center.y) : CGPoint(x: center.x, y: center.y - offset - 4)
        context.drawLabel("\(label) \(lit ? "on" : "off")", at: position, anchor: labelAnchor == .trailing ? .trailing : .center, bold: true)
    }

    /// One branch along y: a switch, then a bulb, with the wires between them.
    private func drawBranch(in context: inout GraphicsContext, frame: CircuitFrame, y: CGFloat, closed: Bool, lit: Bool,
                            index: Int, showsLabels: Bool) {
        let gap = Self.switchGap
        let radius = Self.bulbRadius
        wire(&context, [CGPoint(x: frame.left, y: y), CGPoint(x: frame.switchX - gap, y: y)])
        wire(&context, [CGPoint(x: frame.switchX + gap, y: y), CGPoint(x: frame.bulbX - radius, y: y)])
        wire(&context, [CGPoint(x: frame.bulbX + radius, y: y), CGPoint(x: frame.right, y: y)])
        drawSwitch(in: &context, x: frame.switchX, y: y, closed: closed, label: isSeries ? "switch" : "switch \(index + 1)", showsLabels: showsLabels)
        drawBulb(in: &context, at: CGPoint(x: frame.bulbX, y: y), lit: lit, label: bulbNames[index], labelAnchor: .center, showsLabels: showsLabels)
        if lit { current(&context, at: CGPoint(x: (frame.switchX + gap + frame.bulbX - radius) / 2, y: y), dx: -1, dy: 0) }
    }

    private func drawSeries(in context: inout GraphicsContext, frame: CircuitFrame, closed: Bool, lit: [Bool], showsLabels: Bool) {
        let radius = Self.bulbRadius
        let bulbY = (frame.top + frame.bottom) / 2
        drawBranch(in: &context, frame: frame, y: frame.top, closed: closed, lit: lit[0], index: 0, showsLabels: showsLabels)
        wire(&context, [CGPoint(x: frame.left, y: frame.top), CGPoint(x: frame.left, y: frame.bottom)])
        wire(&context, [CGPoint(x: frame.right, y: frame.bottom), CGPoint(x: frame.right, y: bulbY + radius)])
        wire(&context, [CGPoint(x: frame.right, y: bulbY - radius), CGPoint(x: frame.right, y: frame.top)])
        drawBulb(in: &context, at: CGPoint(x: frame.right, y: bulbY), lit: lit[1], label: bulbNames[1], labelAnchor: .trailing, showsLabels: showsLabels)
        guard closed else { return }
        current(&context, at: CGPoint(x: (frame.batteryX + frame.right) / 2, y: frame.bottom), dx: 1, dy: 0)
        current(&context, at: CGPoint(x: frame.right, y: (frame.top + bulbY - radius) / 2), dx: 0, dy: -1)
        current(&context, at: CGPoint(x: frame.left, y: (frame.top + frame.bottom) / 2), dx: 0, dy: 1)
    }

    private func drawParallel(in context: inout GraphicsContext, frame: CircuitFrame, closed: [Bool], lit: [Bool], showsLabels: Bool) {
        for (index, y) in [frame.top, frame.middle].enumerated() {
            drawBranch(in: &context, frame: frame, y: y, closed: closed.indices.contains(index) && closed[index], lit: lit[index],
                       index: index, showsLabels: showsLabels)
        }
        wire(&context, [CGPoint(x: frame.left, y: frame.top), CGPoint(x: frame.left, y: frame.bottom)])
        wire(&context, [CGPoint(x: frame.right, y: frame.top), CGPoint(x: frame.right, y: frame.bottom)])
        guard lit.contains(true) else { return }
        current(&context, at: CGPoint(x: (frame.batteryX + frame.right) / 2, y: frame.bottom), dx: 1, dy: 0)
        current(&context, at: CGPoint(x: frame.right, y: (frame.middle + frame.bottom) / 2), dx: 0, dy: -1)
        current(&context, at: CGPoint(x: frame.left, y: (frame.middle + frame.bottom) / 2), dx: 0, dy: 1)
        if lit[0] {
            current(&context, at: CGPoint(x: frame.right, y: (frame.top + frame.middle) / 2), dx: 0, dy: -1)
            current(&context, at: CGPoint(x: frame.left, y: (frame.top + frame.middle) / 2), dx: 0, dy: 1)
        }
    }
}
