import SwiftUI

/// The interactive demonstration for a tip. Every change can be made with buttons, the
/// keyboard or VoiceOver; nothing depends on dragging, timing or colour alone.
struct SubjectTipVisualView: View {
    let visual: SubjectTipVisual
    @Binding var state: SubjectTipVisualState

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            switch visual {
            case .sliderRelation(let relation):
                SliderRelationVisual(relation: relation, first: $state.first, second: $state.second)
            case .stepSequence(let sequence):
                StepSequenceVisual(sequence: sequence, step: $state.step)
            case .forceArrows(let forces):
                ForceArrowsVisual(forces: forces, left: $state.first, right: $state.second)
            case .sortClassify(let sort):
                SortClassifyVisual(sort: sort, placements: $state.placements, checked: $state.checked)
            case .circuitToggle(let circuit):
                CircuitToggleVisual(circuit: circuit, switchesClosed: $state.switchesClosed)
            case .reflection(let mirror):
                ReflectionVisual(mirror: mirror, angle: $state.first)
            case .massWeight(let massWeight):
                MassWeightVisual(visual: massWeight, mass: $state.first, worldIndex: $state.step)
            case .atomBuilder(let builder):
                AtomBuilderVisual(builder: builder, protons: $state.first, neutrons: $state.second, electrons: $state.step)
            case .particleStates(let states):
                ParticleStatesVisual(states: states, heat: $state.first)
            case .periodicGrid(let grid):
                PeriodicGridVisual(grid: grid, selected: $state.step)
            case .equationBalance(let balance):
                EquationBalanceVisual(balance: balance, coefficients: $state.placements)
            case .phScale(let scale):
                PHScaleVisual(scale: scale, ph: $state.first)
            }
        }
        .foregroundStyle(Color.kymaiaInk)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("subject-tip.visual.\(visual.kind.rawValue)")
    }
}

extension SubjectTipVisual.Kind {
    /// What the learner does with this demonstration, for the library card.
    var activity: String {
        switch self {
        case .sliderRelation: return "Change the numbers"
        case .stepSequence: return "Step through it"
        case .forceArrows: return "Push and pull"
        case .sortClassify: return "Sort it out"
        case .circuitToggle: return "Switch the circuit"
        case .reflection: return "Aim the light"
        case .massWeight: return "Weigh it two ways"
        case .atomBuilder: return "Build an atom"
        case .particleStates: return "Heat the particles"
        case .periodicGrid: return "Explore the map"
        case .equationBalance: return "Balance the atoms"
        case .phScale: return "Walk the pH scale"
        }
    }

    var symbol: String {
        switch self {
        case .sliderRelation: return "slider.horizontal.3"
        case .stepSequence: return "list.number"
        case .forceArrows: return "arrow.left.and.right"
        case .sortClassify: return "square.grid.2x2"
        case .circuitToggle: return "lightbulb"
        case .reflection: return "flashlight.on.fill"
        case .massWeight: return "scalemass"
        case .atomBuilder: return "atom"
        case .particleStates: return "thermometer.medium"
        case .periodicGrid: return "tablecells"
        case .equationBalance: return "equal.square"
        case .phScale: return "testtube.2"
        }
    }
}

/// "Try this" above a demonstration: the question to test while exploring.
struct SubjectTipObservation: View {
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("Try this")
                .font(.kymaiaEyebrow)
                .textCase(.uppercase)
                .foregroundStyle(Color.kymaiaMutedInk)
            Text(text)
                .font(.kymaiaSerifPrompt)
                .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
    }
}

/// A labelled value with a slider between minus and plus buttons. The buttons and the
/// slider's VoiceOver and keyboard adjustment all move by one step.
struct SubjectTipValueControl: View {
    let title: String
    let valueText: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    let identifier: String
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            if dynamicTypeSize.isAccessibilitySize {
                Text(title).font(.kymaiaBody.weight(.semibold))
                Text(valueText).font(.kymaiaMetric)
            } else {
                HStack(alignment: .firstTextBaseline) {
                    Text(title).font(.kymaiaBody.weight(.semibold))
                    Spacer(minLength: Spacing.sm)
                    Text(valueText).font(.kymaiaMetric)
                }
            }
            HStack(spacing: Spacing.sm) {
                adjustButton(direction: -1, symbol: "minus", label: "Decrease \(title)")
                Slider(value: $value, in: range, step: step)
                    .tint(Color.kymaiaPrimary)
                    .accessibilityLabel(title)
                    .accessibilityValue(valueText)
                    .accessibilityIdentifier("\(identifier).slider")
                adjustButton(direction: 1, symbol: "plus", label: "Increase \(title)")
            }
        }
        .accessibilityElement(children: .contain)
    }

    private func adjustButton(direction: Int, symbol: String, label: String) -> some View {
        let next = SubjectTipVisualLogic.stepped(value, by: direction, step: step, in: range)
        return Button {
            value = next
        } label: {
            Image(systemName: symbol)
                .font(.kymaiaControlLabel)
                // The circle stays 44 points, so the glyph stops growing before it would spill out.
                .dynamicTypeSize(...DynamicTypeSize.xxxLarge)
                .foregroundStyle(Color.kymaiaPrimaryStrong)
                .frame(width: Theme.Dimension.minimumTarget, height: Theme.Dimension.minimumTarget)
                .background(Color.kymaiaSelectionFill, in: Circle())
                .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .disabled(next == value)
        .opacity(next == value ? 0.45 : 1)
        .accessibilityLabel(label)
        .accessibilityIdentifier("\(identifier).\(direction < 0 ? "decrease" : "increase")")
        .help(label)
    }
}

/// An arrow from `start` to `end` with a solid head, for force and ray diagrams.
struct DiagramArrow: Shape {
    var start: CGPoint
    var end: CGPoint
    var headLength: CGFloat = 12

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let dx = end.x - start.x
        let dy = end.y - start.y
        let length = max(0.001, sqrt(dx * dx + dy * dy))
        let unit = CGPoint(x: dx / length, y: dy / length)
        let head = min(headLength, length)
        let base = CGPoint(x: end.x - unit.x * head, y: end.y - unit.y * head)
        let normal = CGPoint(x: -unit.y * head * 0.55, y: unit.x * head * 0.55)
        path.move(to: start)
        path.addLine(to: base)
        path.move(to: end)
        path.addLine(to: CGPoint(x: base.x + normal.x, y: base.y + normal.y))
        path.addLine(to: CGPoint(x: base.x - normal.x, y: base.y - normal.y))
        path.closeSubpath()
        return path
    }
}

extension GraphicsContext {
    /// Draws an arrow: a stroked shaft and a filled head.
    func drawArrow(from start: CGPoint, to end: CGPoint, color: Color, width: CGFloat, headLength: CGFloat = 12) {
        let arrow = DiagramArrow(start: start, end: end, headLength: headLength).path(in: .zero)
        stroke(arrow, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        fill(arrow, with: .color(color))
    }

    /// A caption-sized label centred on `point`.
    func drawLabel(_ text: String, at point: CGPoint, color: Color = .kymaiaInk, anchor: UnitPoint = .center, bold: Bool = false) {
        let label = Text(text).font(bold ? .kymaiaCaption.weight(.semibold) : .kymaiaCaption).foregroundStyle(color)
        draw(label, at: point, anchor: anchor)
    }
}
