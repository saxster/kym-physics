import SwiftUI

/// A ray hitting a plane mirror. The learner sets the angle of incidence; the normal, both rays
/// and both angles are drawn from it.
struct ReflectionVisual: View {
    let mirror: SubjectTipVisual.PlaneMirror
    @Binding var angle: Double
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private typealias Logic = SubjectTipVisualLogic
    /// Where the dashed normal ends; its label sits just above.
    private static let normalTop: CGFloat = 30
    private static let arcRadius: CGFloat = 42
    private var incidence: Double { Logic.clampedIncidence(angle) }
    private var reflection: Double { Logic.reflectedAngle(forIncidence: angle) }

    var body: some View {
        SubjectTipObservation(text: mirror.observation)
        diagram
        ViewThatFits(in: .horizontal) {
            HStack(spacing: Spacing.lg) { readouts }
            VStack(alignment: .leading, spacing: Spacing.sm) { readouts }
        }
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("subject-tip.reflection.angles")
        Text("Both angles are measured from the normal, the dashed line at right angles to the mirror.")
            .font(.kymaiaCaption)
            .foregroundStyle(Color.kymaiaMutedInk)
            .fixedSize(horizontal: false, vertical: true)
        SubjectTipValueControl(title: "Angle of incidence (i)", valueText: "\(Logic.formatted(incidence))°", value: $angle,
                               range: Logic.incidenceRange, step: 5, identifier: "subject-tip.reflection.angle")
    }

    @ViewBuilder private var readouts: some View {
        readout("Angle of incidence", value: incidence)
        readout("Angle of reflection", value: reflection)
    }

    private func readout(_ title: String, value: Double) -> some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(title).font(.kymaiaCaption).foregroundStyle(Color.kymaiaMutedInk)
            Text("\(Logic.formatted(value))°").font(.kymaiaMetric)
        }
    }

    private var diagram: some View {
        let showsLabels = !dynamicTypeSize.isAccessibilitySize
        let theta = CGFloat(incidence) * .pi / 180
        let degrees = Logic.formatted(incidence)
        return Canvas { context, size in
            let point = CGPoint(x: size.width / 2, y: size.height - 44)
            drawMirror(in: &context, point: point, width: size.width, showsLabels: showsLabels)
            // The rays stop well below the "normal" label, so a ray's own label never meets it.
            let length = min(point.y - Self.normalTop - 18, size.width / 2 - 28)
            let source = CGPoint(x: point.x - length * sin(theta), y: point.y - length * cos(theta))
            let target = CGPoint(x: point.x + length * sin(theta), y: point.y - length * cos(theta))
            drawRay(in: &context, from: source, to: point, color: .kymaiaPrimary)
            drawRay(in: &context, from: point, to: target, color: .kymaiaSecondary)
            context.fill(Path(ellipseIn: CGRect(x: source.x - 7, y: source.y - 7, width: 14, height: 14)), with: .color(Color.kymaiaPrimary))
            drawArc(in: &context, center: point, from: -90, to: -90 - Double(incidence), color: .kymaiaPrimary)
            drawArc(in: &context, center: point, from: -90, to: -90 + Double(reflection), color: .kymaiaSecondary)
            guard showsLabels else { return }
            let wedge = AngleWedge(point: point, length: length, theta: theta)
            drawAngleLabel(in: &context, texts: ["i = \(degrees)°", "\(degrees)°"], side: -1, wedge: wedge, color: .kymaiaPrimaryStrong)
            drawAngleLabel(in: &context, texts: ["r = \(degrees)°", "\(degrees)°"], side: 1, wedge: wedge, color: .kymaiaSecondary)
            context.drawLabel("incident ray", at: CGPoint(x: max(48, source.x), y: source.y - 12), color: .kymaiaPrimaryStrong, anchor: .bottom)
            context.drawLabel("reflected ray", at: CGPoint(x: min(size.width - 48, target.x), y: target.y - 12), color: .kymaiaSecondary, anchor: .bottom)
        }
        .frame(height: 280)
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Plane mirror diagram")
        .accessibilityValue("A ray hits the mirror \(degrees) degrees from the normal and leaves \(Logic.formatted(reflection)) degrees from the normal on the other side.")
        .accessibilityIdentifier("subject-tip.reflection.diagram")
    }

    private func drawMirror(in context: inout GraphicsContext, point: CGPoint, width: CGFloat, showsLabels: Bool) {
        var surface = Path()
        surface.move(to: CGPoint(x: 20, y: point.y))
        surface.addLine(to: CGPoint(x: width - 20, y: point.y))
        context.stroke(surface, with: .color(Color.kymaiaInk), lineWidth: 3)
        var hatch = Path()
        var x: CGFloat = 30
        while x < width - 20 {
            hatch.move(to: CGPoint(x: x, y: point.y + 2))
            hatch.addLine(to: CGPoint(x: x - 9, y: point.y + 11))
            x += 12
        }
        context.stroke(hatch, with: .color(Color.kymaiaMutedInk), lineWidth: 1)
        var normal = Path()
        normal.move(to: CGPoint(x: point.x, y: point.y))
        normal.addLine(to: CGPoint(x: point.x, y: Self.normalTop))
        context.stroke(normal, with: .color(Color.kymaiaMutedInk), style: StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
        guard showsLabels else { return }
        // Centred above the line's top end, clear of both rays at every angle.
        context.drawLabel("normal", at: CGPoint(x: point.x, y: Self.normalTop - 4), color: .kymaiaMutedInk, anchor: .bottom)
        context.drawLabel("mirror", at: CGPoint(x: width - 20, y: point.y + 24), color: .kymaiaMutedInk, anchor: .trailing)
    }

    /// The space between the normal and one ray, which meet at `point`.
    private struct AngleWedge {
        let point: CGPoint
        let length: CGFloat
        let theta: CGFloat
    }

    /// An angle label inside the wedge between the normal and a ray (`side` -1 is the incident
    /// ray, 1 the reflected one). The label is measured and placed above the arc, as high as the
    /// ray allows, clear of both lines. The short form stands in when the long one does not fit,
    /// and nothing is drawn when neither does; the readouts under the diagram carry both angles.
    private func drawAngleLabel(in context: inout GraphicsContext, texts: [String], side: CGFloat, wedge: AngleWedge, color: Color) {
        let gap: CGFloat = 6
        let rayTop = wedge.length * cos(wedge.theta)
        for text in texts {
            let label = context.resolve(Text(text).font(.kymaiaCaption.weight(.semibold)).foregroundStyle(color))
            let size = label.measure(in: CGSize(width: 400, height: 100))
            let centreHeight = max(Self.arcRadius + size.height / 2 + gap, rayTop * 0.82)
            let lowEdge = centreHeight - size.height / 2
            // Beside the ray the room narrows towards the mirror; above the ray's end it runs out to the source.
            let room = lowEdge <= rayTop ? lowEdge * tan(wedge.theta) : wedge.length * sin(wedge.theta) - 12
            guard room >= size.width + 2 * gap else { continue }
            let offset = min(room / 2, gap + size.width / 2 + 16)
            context.draw(label, at: CGPoint(x: wedge.point.x + side * offset, y: wedge.point.y - centreHeight), anchor: .center)
            return
        }
    }

    /// A ray with its direction arrow halfway along.
    private func drawRay(in context: inout GraphicsContext, from start: CGPoint, to end: CGPoint, color: Color) {
        var line = Path()
        line.move(to: start)
        line.addLine(to: end)
        context.stroke(line, with: .color(color), style: StrokeStyle(lineWidth: 3, lineCap: .round))
        let middle = CGPoint(x: (start.x + end.x) / 2, y: (start.y + end.y) / 2)
        let lead = CGPoint(x: middle.x + (end.x - start.x) * 0.06, y: middle.y + (end.y - start.y) * 0.06)
        context.drawArrow(from: middle, to: lead, color: color, width: 3, headLength: 14)
    }

    private func drawArc(in context: inout GraphicsContext, center: CGPoint, from start: Double, to end: Double, color: Color) {
        guard abs(end - start) > 0.5 else { return }
        let radius = Self.arcRadius
        let steps = 24
        let points = (0...steps).map { index -> CGPoint in
            let degrees = start + (end - start) * Double(index) / Double(steps)
            let radians = CGFloat(degrees) * .pi / 180
            return CGPoint(x: center.x + radius * cos(radians), y: center.y + radius * sin(radians))
        }
        var arc = Path()
        arc.addLines(points)
        context.stroke(arc, with: .color(color), lineWidth: 2)
    }
}
