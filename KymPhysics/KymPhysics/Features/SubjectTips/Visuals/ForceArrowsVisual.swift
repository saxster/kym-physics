import SwiftUI

/// Two horizontal forces on one object. Arrow lengths follow the forces; the resultant and
/// the change in motion are worked out live.
struct ForceArrowsVisual: View {
    let forces: SubjectTipVisual.ForceArrows
    @Binding var left: Double
    @Binding var right: Double
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private typealias Logic = SubjectTipVisualLogic
    private var net: Double { Logic.netForce(left: left, right: right) }
    private var outcome: Logic.ForceOutcome { Logic.forceOutcome(left: left, right: right, movingInitially: forces.movingInitially) }

    var body: some View {
        diagram
        HStack(alignment: .top, spacing: Spacing.sm) {
            Image(systemName: abs(net) < 1e-9 ? "equal.circle" : (net > 0 ? "arrow.right.circle" : "arrow.left.circle"))
                .font(.kymaiaTitle)
                .foregroundStyle(Color.kymaiaPrimary)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(Logic.resultantDescription(left: left, right: right)).font(.kymaiaHeadline)
                Text(outcome.sentence(objectName: forces.objectName)).font(.kymaiaBody)
                Text(forces.movingInitially ? "At the start the \(forces.objectName) is moving to the right." : "At the start the \(forces.objectName) is still.")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
            }
            .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("subject-tip.force.outcome")
        SubjectTipValueControl(title: "\(forces.leftLabel) (to the left)", valueText: "\(Logic.formatted(left)) N",
                               value: $left, range: 0...forces.maxForce, step: forces.stepSize,
                               identifier: "subject-tip.force.left")
        SubjectTipValueControl(title: "\(forces.rightLabel) (to the right)", valueText: "\(Logic.formatted(right)) N",
                               value: $right, range: 0...forces.maxForce, step: forces.stepSize,
                               identifier: "subject-tip.force.right")
    }

    private var spokenDescription: String {
        "The \(forces.objectName) has \(forces.leftLabel) of \(Logic.formatted(left)) newtons to the left and "
            + "\(forces.rightLabel) of \(Logic.formatted(right)) newtons to the right. "
            + Logic.resultantDescription(left: left, right: right) + "."
    }

    private var diagram: some View {
        let showsLabels = !dynamicTypeSize.isAccessibilitySize
        return Canvas { context, size in
            let groundY = size.height - 34
            let block = CGRect(x: size.width / 2 - 60, y: groundY - 64, width: 120, height: 64)
            let maxLength = max(20, (size.width - block.width) / 2 - 28)
            drawGround(in: &context, y: groundY, width: size.width)
            let shape = Path(roundedRect: block, cornerRadius: CornerRadius.small, style: .continuous)
            context.fill(shape, with: .color(Color.kymaiaSurface))
            context.stroke(shape, with: .color(Color.kymaiaInk), lineWidth: 2)
            context.drawLabel(forces.objectName, at: CGPoint(x: block.midX, y: block.midY), bold: true)

            let leftLength = maxLength * CGFloat(left / forces.maxForce)
            let rightLength = maxLength * CGFloat(right / forces.maxForce)
            if leftLength > 1 {
                context.drawArrow(from: CGPoint(x: block.minX, y: block.midY), to: CGPoint(x: block.minX - leftLength, y: block.midY),
                                  color: .kymaiaSecondary, width: 6, headLength: 16)
            }
            if rightLength > 1 {
                context.drawArrow(from: CGPoint(x: block.maxX, y: block.midY), to: CGPoint(x: block.maxX + rightLength, y: block.midY),
                                  color: .kymaiaPrimary, width: 6, headLength: 16)
            }
            let netLength = maxLength * CGFloat(abs(net) / forces.maxForce)
            if netLength > 1 {
                let direction: CGFloat = net > 0 ? 1 : -1
                context.drawArrow(from: CGPoint(x: block.midX - direction * netLength / 2, y: 40),
                                  to: CGPoint(x: block.midX + direction * netLength / 2, y: 40), color: .kymaiaInk, width: 4, headLength: 14)
            }
            guard showsLabels else { return }
            context.drawLabel("\(forces.leftLabel) \(Logic.formatted(left)) N", at: CGPoint(x: block.minX - 6, y: block.midY - 22),
                              color: .kymaiaSecondary, anchor: .trailing, bold: true)
            context.drawLabel("\(forces.rightLabel) \(Logic.formatted(right)) N", at: CGPoint(x: block.maxX + 6, y: block.midY - 22),
                              color: .kymaiaPrimaryStrong, anchor: .leading, bold: true)
            context.drawLabel("resultant \(Logic.formatted(abs(net))) N", at: CGPoint(x: block.midX, y: 16), color: .kymaiaMutedInk)
        }
        .frame(height: 200)
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Force diagram")
        .accessibilityValue(spokenDescription)
        .accessibilityIdentifier("subject-tip.force.diagram")
    }

    private func drawGround(in context: inout GraphicsContext, y: CGFloat, width: CGFloat) {
        var ground = Path()
        ground.move(to: CGPoint(x: 12, y: y))
        ground.addLine(to: CGPoint(x: width - 12, y: y))
        context.stroke(ground, with: .color(Color.kymaiaInk), lineWidth: 2)
        var hatch = Path()
        var x: CGFloat = 20
        while x < width - 12 {
            hatch.move(to: CGPoint(x: x, y: y + 2))
            hatch.addLine(to: CGPoint(x: x - 10, y: y + 12))
            x += 14
        }
        context.stroke(hatch, with: .color(Color.kymaiaMutedInk), lineWidth: 1)
    }
}
