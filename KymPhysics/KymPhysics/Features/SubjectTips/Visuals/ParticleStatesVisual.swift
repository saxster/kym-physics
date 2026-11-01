import SwiftUI

/// The same particles at three heats: vibrating in a lattice, tumbling in a pool, then flying
/// free. Motion is a deterministic function of heat and time, so the picture is identical for
/// every learner at the same setting — and still (one honest frame) under Reduce Motion.
struct ParticleStatesVisual: View {
    let states: SubjectTipVisual.ParticleStates
    @Binding var heat: Double
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private typealias Logic = SubjectTipVisualLogic
    private var state: Logic.ParticleState { Logic.particleState(heat: heat) }
    private var energy: Double { min(1, max(0, heat / 100)) }

    var body: some View {
        SubjectTipObservation(text: states.observation)
        phaseGauge
        picture
        propertyStrip
        Text(state.sentence(substance: states.substance))
            .font(.kymaiaBody)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityIdentifier("subject-tip.particles.summary")
        SubjectTipValueControl(title: "Thermal energy (heat)", valueText: "\(Logic.formatted(heat)) of 100",
                               value: $heat, range: 0...100, step: 2,
                               identifier: "subject-tip.particles.heat")
        stateButtons
    }

    private var phaseGauge: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack {
                Text("Solid (< 34)")
                    .font(.kymaiaCaption.weight(state == .solid ? .bold : .regular))
                    .foregroundStyle(state == .solid ? Color.kymaiaPrimary : Color.kymaiaMutedInk)
                Spacer()
                Text("Melting (34)")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
                Spacer()
                Text("Liquid (34–66)")
                    .font(.kymaiaCaption.weight(state == .liquid ? .bold : .regular))
                    .foregroundStyle(state == .liquid ? Color.kymaiaPrimary : Color.kymaiaMutedInk)
                Spacer()
                Text("Boiling (67)")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
                Spacer()
                Text("Gas (67+)")
                    .font(.kymaiaCaption.weight(state == .gas ? .bold : .regular))
                    .foregroundStyle(state == .gas ? Color.kymaiaPrimary : Color.kymaiaMutedInk)
            }
            GeometryReader { geo in
                let w = geo.size.width
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.kymaiaControlFill)
                    Capsule()
                        .fill(state == .gas ? SubjectTipPalette.proton.color : (state == .liquid ? SubjectTipPalette.electron.color : Color.kymaiaPrimary))
                        .frame(width: max(8, w * CGFloat(energy)))
                    Rectangle()
                        .fill(Color.kymaiaInk.opacity(0.45))
                        .frame(width: 1.5, height: 12)
                        .offset(x: w * 0.34)
                    Rectangle()
                        .fill(Color.kymaiaInk.opacity(0.45))
                        .frame(width: 1.5, height: 12)
                        .offset(x: w * 0.67)
                }
            }
            .frame(height: 10)
        }
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityHidden(true)
    }

    private var propertyStrip: some View {
        FlowLayout(spacing: Spacing.xs) {
            JournalChip(text: "State: \(state.label)")
            JournalChip(text: "Spacing: \(state.arrangementSummary)")
            JournalChip(text: "Motion: \(state.motionSummary)")
            JournalChip(text: "Squashing: \(state.compressibilitySummary)")
        }
        .accessibilityElement(children: .combine)
    }

    /// Jump straight to each state without hunting on the slider.
    private var stateButtons: some View {
        FlowLayout(spacing: Spacing.sm) {
            ForEach([(Logic.ParticleState.solid, 10.0), (.liquid, 50.0), (.gas, 90.0)], id: \.0) { target, value in
                Button(target.label) { heat = value }
                    .buttonStyle(KymaiaOptionButtonStyle(isSelected: state == target))
                    .accessibilityLabel("Show \(states.substance.lowercased()) as a \(target.label.lowercased())")
                    .accessibilityAddTraits(state == target ? .isSelected : [])
                    .accessibilityIdentifier("subject-tip.particles.state.\(target.rawValue)")
            }
        }
    }

    @ViewBuilder private var picture: some View {
        if reduceMotion {
            canvas(at: 1.2)
        } else {
            TimelineView(.animation(minimumInterval: 1.0 / 20)) { timeline in
                canvas(at: timeline.date.timeIntervalSinceReferenceDate)
            }
        }
    }

    private func canvas(at time: Double) -> some View {
        let energy = energy
        let state = state
        return Canvas { context, size in
            let box = CGRect(x: 12, y: 12, width: size.width - 24, height: size.height - 24)
            context.stroke(Path(roundedRect: box, cornerRadius: CornerRadius.small),
                           with: .color(Color.kymaiaControlBorder), lineWidth: 2)

            if state == .liquid {
                let poolRect = CGRect(x: box.minX + 2, y: box.midY + 4, width: box.width - 4, height: box.height * 0.48 - 6)
                context.fill(Path(roundedRect: poolRect, cornerRadius: CornerRadius.small),
                             with: .color(SubjectTipPalette.electron.color.opacity(0.10)))
                var meniscus = Path()
                meniscus.move(to: CGPoint(x: poolRect.minX, y: poolRect.minY))
                meniscus.addLine(to: CGPoint(x: poolRect.maxX, y: poolRect.minY))
                context.stroke(meniscus, with: .color(SubjectTipPalette.electron.color.opacity(0.45)),
                               style: StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
            }

            let columns = 8, rows = 6
            let blockWidth = min(box.width * 0.56, 210)
            let blockHeight = min(box.height * 0.52, 120)
            let spacingX = blockWidth / CGFloat(columns - 1)
            let spacingY = blockHeight / CGFloat(rows - 1)
            let startX = box.midX - blockWidth / 2

            var points: [[CGPoint]] = Array(repeating: Array(repeating: .zero, count: columns), count: rows)
            var index = 0
            for row in 0..<rows {
                for column in 0..<columns {
                    let home = CGPoint(x: startX + CGFloat(column) * spacingX,
                                       y: box.maxY - 22 - CGFloat(row) * spacingY)
                    points[row][column] = position(index: index, home: home, box: box, energy: energy, state: state, time: time)
                    index += 1
                }
            }

            if state == .solid {
                var lattice = Path()
                for row in 0..<rows {
                    for col in 0..<columns {
                        if col + 1 < columns {
                            lattice.move(to: points[row][col])
                            lattice.addLine(to: points[row][col + 1])
                        }
                        if row + 1 < rows {
                            lattice.move(to: points[row][col])
                            lattice.addLine(to: points[row + 1][col])
                        }
                    }
                }
                context.stroke(lattice, with: .color(Color.kymaiaPrimary.opacity(0.32)), lineWidth: 1.4)
            }

            let particleColor: Color = state == .gas
                ? SubjectTipPalette.proton.color
                : (state == .liquid ? SubjectTipPalette.electron.color : Color.kymaiaPrimary)

            var pIndex = 0
            for row in 0..<rows {
                for column in 0..<columns {
                    let pt = points[row][column]
                    if state == .gas {
                        let angle = Double(pIndex * 47 % 100) / 100 * 2 * .pi
                        var tail = Path()
                        tail.move(to: pt)
                        tail.addLine(to: CGPoint(x: pt.x - cos(angle) * 14, y: pt.y - sin(angle) * 14))
                        context.stroke(tail, with: .color(particleColor.opacity(0.35)), lineWidth: 2)
                    }
                    let orb = CGRect(x: pt.x - 8, y: pt.y - 8, width: 16, height: 16)
                    context.fill(Path(ellipseIn: orb), with: .color(particleColor))
                    context.stroke(Path(ellipseIn: orb), with: .color(Color.kymaiaBackground.opacity(0.55)), lineWidth: 1)
                    let shine = CGRect(x: pt.x - 4.5, y: pt.y - 5.5, width: 4.5, height: 4.5)
                    context.fill(Path(ellipseIn: shine), with: .color(Color.kymaiaBackground.opacity(0.45)))
                    pIndex += 1
                }
            }
        }
        .frame(height: 250)
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Particle picture")
        .accessibilityValue(state.sentence(substance: states.substance))
        .accessibilityIdentifier("subject-tip.particles.diagram")
    }

    private func position(index: Int, home: CGPoint, box: CGRect, energy: Double,
                          state: Logic.ParticleState, time: Double) -> CGPoint {
        let a = Double(index * 37 % 101) / 101 * 2 * .pi
        let b = Double(index * 53 % 89) / 89 * 2 * .pi
        switch state {
        case .solid:
            let amp = 1.2 + energy * 8.5
            return CGPoint(x: home.x + sin(time * 7 + a) * amp, y: home.y + cos(time * 6.1 + b) * amp * 0.7)
        case .liquid:
            let poolW = box.width * 0.34, poolH = box.height * 0.16
            let x = home.x + (sin(time * 0.55 + a) * poolW + sin(time * 1.13 + b) * poolW * 0.35)
            let y = home.y + (cos(time * 0.7 + b) * poolH + sin(time * 1.31 + a) * poolH * 0.4)
            return CGPoint(x: min(box.maxX - 16, max(box.minX + 16, x)),
                           y: min(box.maxY - 16, max(box.midY + 12, y)))
        case .gas:
            let speedX = 26 + Double(index % 5) * 7, speedY = 20 + Double(index % 4) * 9
            let x = folded(home.x - box.minX + CGFloat(time * speedX * (0.6 + energy)), span: box.width - 32) + box.minX + 16
            let y = folded(home.y - box.minY + CGFloat(time * speedY * (0.6 + energy)), span: box.height - 32) + box.minY + 16
            return CGPoint(x: x, y: y)
        }
    }

    /// Reflect a growing offset back into `0...span`, like bouncing off both walls.
    private func folded(_ value: CGFloat, span: CGFloat) -> CGFloat {
        guard span > 0 else { return 0 }
        let cycle = (value.truncatingRemainder(dividingBy: span * 2) + span * 2).truncatingRemainder(dividingBy: span * 2)
        return cycle <= span ? cycle : span * 2 - cycle
    }
}
