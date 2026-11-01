import SwiftUI

/// Walk the pH scale one step at a time. The indicator strip, the nearest everyday liquid and
/// the tenfold sentence all move together; "spoon" buttons make neutralisation something the
/// learner drives towards (and can overshoot), not just reads about.
struct PHScaleVisual: View {
    let scale: SubjectTipVisual.PHScale
    @Binding var ph: Double

    private typealias Logic = SubjectTipVisualLogic
    private var value: Int { Int(ph.rounded()) }
    private var kind: Logic.PHKind { Logic.phKind(value) }
    private var nearest: SubjectTipVisual.PHScale.Example? { Logic.nearestExample(to: value, in: scale) }

    var body: some View {
        SubjectTipObservation(text: scale.observation)
        flaskAndIonStage
        strip
        benchmarkChips
        readouts
        Text(Logic.aciditySentence(ph: value))
            .font(.kymaiaBody)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityIdentifier("subject-tip.ph.summary")
        if value == 7 {
            Label("Neutral — H⁺(aq) and OH⁻(aq) ions are in exact balance. One more spoon either way tips it over.",
                  systemImage: "checkmark.seal.fill")
                .font(.kymaiaHeadline)
                .foregroundStyle(Color.kymaiaSuccess)
                .fixedSize(horizontal: false, vertical: true)
        }
        SubjectTipValueControl(title: "pH", valueText: "\(value)",
                               value: $ph, range: 0...14, step: 1,
                               identifier: "subject-tip.ph.value")
        spoons
    }

    private var flaskAndIonStage: some View {
        let currentPH = value
        let solutionTint = SubjectTipPalette.phColor(currentPH)
        return ViewThatFits(in: .horizontal) {
            HStack(alignment: .center, spacing: Spacing.md) {
                flaskCanvas(ph: currentPH, tint: solutionTint)
                ionBalancePanel(ph: currentPH)
            }
            VStack(alignment: .leading, spacing: Spacing.sm) {
                flaskCanvas(ph: currentPH, tint: solutionTint)
                ionBalancePanel(ph: currentPH)
            }
        }
        .padding(Spacing.md)
        .journalIllustrationSurface()
        .accessibilityHidden(true)
    }

    private func flaskCanvas(ph: Int, tint: Color) -> some View {
        Canvas { context, size in
            let w = size.width
            let h = size.height
            let neckL = w * 0.38, neckR = w * 0.62
            let topY = h * 0.10, shoulderY = h * 0.34, botY = h * 0.90
            let baseL = w * 0.14, baseR = w * 0.86
            let liquidTopY = h * 0.48

            var liquid = Path()
            let t = (liquidTopY - shoulderY) / (botY - shoulderY)
            let liqL = neckL - (neckL - baseL) * t
            let liqR = neckR + (baseR - neckR) * t
            liquid.move(to: CGPoint(x: liqL, y: liquidTopY))
            liquid.addLine(to: CGPoint(x: liqR, y: liquidTopY))
            liquid.addLine(to: CGPoint(x: baseR, y: botY))
            liquid.addLine(to: CGPoint(x: baseL, y: botY))
            liquid.closeSubpath()
            context.fill(liquid, with: .color(tint.opacity(0.75)))

            var meniscus = Path()
            meniscus.move(to: CGPoint(x: liqL, y: liquidTopY))
            meniscus.addLine(to: CGPoint(x: liqR, y: liquidTopY))
            context.stroke(meniscus, with: .color(tint), lineWidth: 2.2)

            var glass = Path()
            glass.move(to: CGPoint(x: neckL - 4, y: topY))
            glass.addLine(to: CGPoint(x: neckR + 4, y: topY))
            glass.move(to: CGPoint(x: neckL, y: topY))
            glass.addLine(to: CGPoint(x: neckL, y: shoulderY))
            glass.addLine(to: CGPoint(x: baseL, y: botY))
            glass.addLine(to: CGPoint(x: baseR, y: botY))
            glass.addLine(to: CGPoint(x: neckR, y: shoulderY))
            glass.addLine(to: CGPoint(x: neckR, y: topY))
            context.stroke(glass, with: .color(Color.kymaiaInk.opacity(0.75)), lineWidth: 2)

            let hCount = ph < 7 ? min(6, 7 - ph) : (ph == 7 ? 2 : 1)
            let ohCount = ph > 7 ? min(6, ph - 7) : (ph == 7 ? 2 : 1)
            let ions = Array(repeating: "H⁺", count: hCount) + Array(repeating: "OH⁻", count: ohCount)
            for (idx, ion) in ions.enumerated() {
                let row = idx / 4
                let col = idx % 4
                let x = w * (0.28 + CGFloat(col) * 0.15)
                let y = h * (0.62 + CGFloat(row) * 0.17)
                let badge = CGRect(x: x - 11, y: y - 7, width: 22, height: 14)
                context.fill(Path(roundedRect: badge, cornerRadius: CornerRadius.micro),
                             with: .color(Color.kymaiaBackground.opacity(0.88)))
                let label = Text(ion).font(.kymaiaCaption.weight(.bold)).foregroundStyle(Color.kymaiaInk)
                context.draw(context.resolve(label), at: CGPoint(x: x, y: y), anchor: .center)
            }
        }
        .frame(width: 150, height: 135)
    }

    private func ionBalancePanel(ph: Int) -> some View {
        let hFraction = CGFloat(14 - ph) / 14.0
        return VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("Ion balance in water (H⁺ vs OH⁻)")
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(Color.kymaiaInk)
            GeometryReader { geo in
                let w = geo.size.width
                HStack(spacing: 2) {
                    RoundedRectangle(cornerRadius: CornerRadius.small)
                        .fill(SubjectTipPalette.proton.color)
                        .frame(width: max(18, w * hFraction))
                    RoundedRectangle(cornerRadius: CornerRadius.small)
                        .fill(SubjectTipPalette.electron.color)
                        .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 12)
            HStack {
                Text("H⁺(aq) acid ions")
                    .font(.kymaiaCaption)
                    .foregroundStyle(SubjectTipPalette.proton.color)
                Spacer()
                Text("OH⁻(aq) alkali ions")
                    .font(.kymaiaCaption)
                    .foregroundStyle(SubjectTipPalette.electron.color)
            }
            Text(ionRatioNote(ph: ph))
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func ionRatioNote(ph: Int) -> String {
        if ph == 7 {
            return "At pH 7, [H⁺] = [OH⁻]. Every acid ion is matched by an alkali ion."
        } else if ph < 7 {
            let steps = 7 - ph
            let factor = Logic.formatted(Logic.acidityFactor(ph: ph, relativeTo: 7))
            return "\(steps) \(steps == 1 ? "step" : "steps") below 7 → 10^\(steps) = \(factor)× as many H⁺ ions as neutral water."
        } else {
            let steps = ph - 7
            let factor = Logic.formatted(Logic.acidityFactor(ph: 7, relativeTo: ph))
            return "\(steps) \(steps == 1 ? "step" : "steps") above 7 → 10^\(steps) = \(factor)× as many OH⁻ ions as neutral water."
        }
    }

    private var strip: some View {
        VStack(spacing: Spacing.xs) {
            HStack(spacing: 2) {
                ForEach(0...14, id: \.self) { step in
                    VStack(spacing: 2) {
                        RoundedRectangle(cornerRadius: CornerRadius.micro)
                            .fill(SubjectTipPalette.phColor(step))
                            .frame(maxWidth: .infinity, minHeight: step == value ? 38 : 28)
                            .overlay(
                                RoundedRectangle(cornerRadius: CornerRadius.micro)
                                    .strokeBorder(step == value ? Color.kymaiaInk : Color.clear, lineWidth: 2.5)
                            )
                        Text("\(step)")
                            .font(.kymaiaCaption.weight(step == value ? .bold : .regular))
                            .monospacedDigit()
                            .foregroundStyle(step == value ? Color.kymaiaInk : Color.kymaiaMutedInk)
                    }
                }
            }
            HStack {
                Text("0 · strong acid").font(.kymaiaCaption).foregroundStyle(Color.kymaiaMutedInk)
                Spacer()
                Text("7 · neutral").font(.kymaiaCaption).foregroundStyle(Color.kymaiaMutedInk)
                Spacer()
                Text("14 · strong alkali").font(.kymaiaCaption).foregroundStyle(Color.kymaiaMutedInk)
            }
        }
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Universal indicator colours from pH 0 to 14; pH \(value) is highlighted")
        .accessibilityIdentifier("subject-tip.ph.strip")
    }

    private var benchmarkChips: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("Everyday benchmarks — tap to test")
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(Color.kymaiaMutedInk)
            FlowLayout(spacing: Spacing.xs) {
                ForEach(scale.examples, id: \.name) { item in
                    benchmarkButton(item)
                }
            }
        }
    }

    private func benchmarkButton(_ item: SubjectTipVisual.PHScale.Example) -> some View {
        let label = "\(item.name) (pH \(item.ph))"
        return Button(label) {
            ph = Double(item.ph)
        }
        .buttonStyle(KymaiaOptionButtonStyle(isSelected: item.ph == value))
    }

    private var readouts: some View {
        FlowLayout(spacing: Spacing.sm) {
            JournalChip(text: "pH \(value)")
            JournalChip(text: kind.label)
            if let nearest {
                JournalChip(text: nearest.ph == value ? "Like \(nearest.name.lowercased())"
                                                      : "Nearest example: \(nearest.name.lowercased()) (pH \(nearest.ph))")
            }
            JournalChip(text: "Indicator: \(indicatorColour)")
        }
    }

    private var indicatorColour: String {
        switch value {
        case 0...2: return "red"
        case 3...4: return "orange"
        case 5: return "yellow-orange"
        case 6: return "yellow-green"
        case 7: return "green"
        case 8...9: return "blue-green"
        case 10...12: return "blue"
        default: return "purple"
        }
    }

    private var spoons: some View {
        FlowLayout(spacing: Spacing.sm) {
            Button("Add a spoon of acid") { ph = max(0, ph - 1) }
                .buttonStyle(JournalCapsuleButtonStyle())
                .disabled(value <= 0)
                .opacity(value <= 0 ? 0.45 : 1)
                .accessibilityIdentifier("subject-tip.ph.add-acid")
            Button("Add a spoon of alkali") { ph = min(14, ph + 1) }
                .buttonStyle(JournalCapsuleButtonStyle())
                .disabled(value >= 14)
                .opacity(value >= 14 ? 0.45 : 1)
                .accessibilityIdentifier("subject-tip.ph.add-alkali")
        }
    }
}
