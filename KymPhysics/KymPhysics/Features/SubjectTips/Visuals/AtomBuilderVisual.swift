import SwiftUI

/// Build an atom particle by particle and watch its name change: protons decide the element,
/// neutrons only its isotope, electrons only its charge. Electrons orbit unless Reduce Motion
/// is on; every count is set with buttons, sliders or VoiceOver, never by dragging particles.
struct AtomBuilderVisual: View {
    let builder: SubjectTipVisual.AtomBuilder
    @Binding var protons: Double
    @Binding var neutrons: Double
    @Binding var electrons: Int
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private typealias Logic = SubjectTipVisualLogic
    private var reading: Logic.AtomReading {
        Logic.atomReading(protons: Int(protons.rounded()), neutrons: Int(neutrons.rounded()), electrons: electrons)
    }

    private var electronValue: Binding<Double> {
        Binding(get: { Double(electrons) },
                set: { electrons = Int(SubjectTipVisualLogic.stepped($0, by: 0, step: 1, in: 0...Double(Logic.maxBuilderElectrons))) })
    }

    private struct Specimen: Identifiable {
        let id: String
        let label: String
        let p: Int
        let n: Int
        let e: Int
    }

    private var specimens: [Specimen] {
        [
            Specimen(id: "c12", label: "Carbon-12", p: 6, n: 6, e: 6),
            Specimen(id: "c14", label: "Carbon-14 (isotope)", p: 6, n: 8, e: 6),
            Specimen(id: "na-ion", label: "Na⁺ ion", p: 11, n: 12, e: 10),
            Specimen(id: "o-ion", label: "O²⁻ ion", p: 8, n: 8, e: 10),
            Specimen(id: "ne", label: "Neon (full shells)", p: 10, n: 10, e: 10)
        ].filter { $0.p <= builder.maxProtons }
    }

    var body: some View {
        SubjectTipObservation(text: builder.observation)
        nuclideAndShellHeader
        picture
        Text(reading.summary)
            .font(.kymaiaBody)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityIdentifier("subject-tip.atom.summary")
        Text(reading.stabilityNote)
            .font(.kymaiaCaption)
            .foregroundStyle(Color.kymaiaMutedInk)
            .fixedSize(horizontal: false, vertical: true)
        readouts
        specimenPresets
        SubjectTipValueControl(title: "Protons (+) — sets the element", valueText: "\(reading.protons)",
                               value: $protons, range: 1...Double(builder.maxProtons), step: 1,
                               identifier: "subject-tip.atom.protons")
        SubjectTipValueControl(title: "Neutrons (0) — sets the isotope mass", valueText: "\(reading.neutrons)",
                               value: $neutrons, range: 0...Double(Logic.maxBuilderNeutrons), step: 1,
                               identifier: "subject-tip.atom.neutrons")
        SubjectTipValueControl(title: "Electrons (−) — sets shells & charge", valueText: "\(reading.electrons)",
                               value: electronValue, range: 0...Double(Logic.maxBuilderElectrons), step: 1,
                               identifier: "subject-tip.atom.electrons")
    }

    private var nuclideAndShellHeader: some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .center, spacing: Spacing.md) {
                nuclideTile
                shellBreakdown
            }
            VStack(alignment: .leading, spacing: Spacing.sm) {
                nuclideTile
                shellBreakdown
            }
        }
        .padding(Spacing.md)
        .journalIllustrationSurface()
        .accessibilityElement(children: .combine)
    }

    private var nuclideTile: some View {
        HStack(alignment: .center, spacing: Spacing.xs) {
            VStack(alignment: .trailing, spacing: Spacing.xs) {
                Text("\(reading.massNumber)")
                    .font(.kymaiaCaption.weight(.bold))
                    .monospacedDigit()
                    .foregroundStyle(Color.kymaiaInk)
                Text("\(reading.protons)")
                    .font(.kymaiaCaption.weight(.bold))
                    .monospacedDigit()
                    .foregroundStyle(SubjectTipPalette.proton.color)
            }
            Text(reading.symbol)
                .font(.kymaiaPageTitle)
                .foregroundStyle(Color.kymaiaInk)
            if !reading.chargeNotation.isEmpty {
                Text(reading.chargeNotation)
                    .font(.kymaiaHeadline)
                    .foregroundStyle(reading.charge > 0 ? SubjectTipPalette.proton.color : SubjectTipPalette.electron.color)
                    .offset(y: -8)
            }
            VStack(alignment: .leading, spacing: Spacing.xs / 2) {
                Text(reading.name)
                    .font(.kymaiaHeadline)
                    .foregroundStyle(Color.kymaiaInk)
                Text(reading.isIon ? "Ion (\(reading.chargeNotation))" : (reading.isIsotopeVariant ? "Isotope-\(reading.massNumber)" : "Neutral atom"))
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
            }
            .padding(.leading, Spacing.xs)
        }
    }

    private var shellBreakdown: some View {
        let capacities = [2, 8, 8, 8]
        return VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(reading.shells.isEmpty
                 ? "Electron shells: 0 electrons"
                 : "Shell filling (2 · 8 · 8 rule): \(reading.shells.map(String.init).joined(separator: " · "))")
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(Color.kymaiaInk)
            if !reading.shells.isEmpty {
                FlowLayout(spacing: Spacing.xs) {
                    ForEach(Array(reading.shells.enumerated()), id: \.offset) { index, count in
                        let cap = capacities[min(index, capacities.count - 1)]
                        let isOuter = index == reading.shells.count - 1
                        Text("Shell \(index + 1): \(count)/\(cap)\(isOuter ? " (outer)" : "")")
                            .font(.kymaiaCaption)
                            .monospacedDigit()
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, Spacing.xs / 2)
                            .background(
                                isOuter ? SubjectTipPalette.electron.color.opacity(0.18) : Color.kymaiaControlFill,
                                in: Capsule()
                            )
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var readouts: some View {
        FlowLayout(spacing: Spacing.sm) {
            JournalChip(text: "Element: \(reading.name) (\(reading.symbol))")
            JournalChip(text: "Mass number: \(reading.massNumber)")
            JournalChip(text: reading.charge == 0 ? "Charge: neutral" : "Charge: \(reading.charge > 0 ? "+" : "")\(reading.charge)")
            if reading.isIon { JournalChip(text: "An ion — still \(reading.name.lowercased())") }
            if reading.isIsotopeVariant { JournalChip(text: "An isotope variant") }
            if !reading.shells.isEmpty {
                JournalChip(text: "Valence e⁻: \(reading.valenceElectrons)/\(reading.outerShellCapacity)")
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(reading.summary)
    }

    private var specimenPresets: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("Try a specimen to compare")
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(Color.kymaiaMutedInk)
            FlowLayout(spacing: Spacing.xs) {
                ForEach(specimens) { item in
                    specimenButton(item)
                }
            }
        }
    }

    private func specimenButton(_ item: Specimen) -> some View {
        let isSelected = reading.protons == item.p && reading.neutrons == item.n && reading.electrons == item.e
        return Button(item.label) {
            protons = Double(item.p)
            neutrons = Double(item.n)
            electrons = item.e
        }
        .buttonStyle(KymaiaOptionButtonStyle(isSelected: isSelected))
        .accessibilityIdentifier("subject-tip.atom.preset.\(item.id)")
    }

    @ViewBuilder private var picture: some View {
        VStack(spacing: Spacing.xs) {
            if reduceMotion {
                canvas(at: 0)
            } else {
                TimelineView(.animation(minimumInterval: 1.0 / 20)) { timeline in
                    canvas(at: timeline.date.timeIntervalSinceReferenceDate)
                }
            }
            legendStrip
        }
        .padding(Spacing.sm)
        .journalIllustrationSurface()
    }

    private var legendStrip: some View {
        FlowLayout(spacing: Spacing.md) {
            legendItem(color: SubjectTipPalette.proton.color, text: "Proton (+1, 1 u)")
            legendItem(color: SubjectTipPalette.neutron.color, text: "Neutron (0, 1 u)")
            legendItem(color: SubjectTipPalette.electron.color, text: "Valence e⁻ (outer shell)")
        }
        .padding(.horizontal, Spacing.xs)
        .accessibilityHidden(true)
    }

    private func legendItem(color: Color, text: String) -> some View {
        HStack(spacing: Spacing.xs) {
            Circle().fill(color).frame(width: 10, height: 10)
            Text(text).font(.kymaiaCaption).foregroundStyle(Color.kymaiaMutedInk)
        }
    }

    private func canvas(at time: Double) -> some View {
        let reading = reading
        return Canvas { context, size in
            let centre = CGPoint(x: size.width / 2, y: size.height / 2)
            let maxRadius = min(size.width, size.height) / 2 - 20
            let shellCount = max(1, reading.shells.count)
            let capacities = [2, 8, 8, 8]

            for index in 0..<shellCount where index < reading.shells.count {
                let isOuter = index == reading.shells.count - 1
                let radius = maxRadius * CGFloat(index + 1) / CGFloat(shellCount)
                let ringRect = CGRect(x: centre.x - radius, y: centre.y - radius, width: radius * 2, height: radius * 2)
                if isOuter {
                    context.stroke(Path(ellipseIn: ringRect),
                                   with: .color(SubjectTipPalette.electron.color.opacity(0.55)),
                                   lineWidth: 2.2)
                } else {
                    context.stroke(Path(ellipseIn: ringRect),
                                   with: .color(Color.kymaiaHairline),
                                   style: StrokeStyle(lineWidth: 1.4, dash: [5, 4]))
                }
            }

            drawNucleus(in: &context, centre: centre, reading: reading, maxRadius: maxRadius, shellCount: shellCount)

            for (shell, count) in reading.shells.enumerated() {
                let isOuter = shell == reading.shells.count - 1
                let capacity = capacities[min(shell, capacities.count - 1)]
                let radius = maxRadius * CGFloat(shell + 1) / CGFloat(shellCount)
                let direction: Double = shell.isMultiple(of: 2) ? 1 : -1
                let phase = time * 0.35 * direction / Double(shell + 1)
                let slotTotal = isOuter ? max(count, capacity) : count

                for slot in 0..<slotTotal {
                    let angle = phase + Double(slot) * 2 * .pi / Double(max(1, slotTotal))
                    let point = CGPoint(x: centre.x + cos(angle) * radius, y: centre.y + sin(angle) * radius)
                    if slot < count {
                        if isOuter {
                            let halo = CGRect(x: point.x - 12, y: point.y - 12, width: 24, height: 24)
                            context.fill(Path(ellipseIn: halo), with: .color(SubjectTipPalette.electron.color.opacity(0.22)))
                        }
                        drawParticle(in: &context, at: point, radius: isOuter ? 9 : 7.5,
                                     fill: SubjectTipPalette.electron.color, glyph: "−")
                    } else {
                        let emptyRect = CGRect(x: point.x - 5.5, y: point.y - 5.5, width: 11, height: 11)
                        context.stroke(Path(ellipseIn: emptyRect),
                                       with: .color(SubjectTipPalette.electron.color.opacity(0.45)),
                                       style: StrokeStyle(lineWidth: 1.2, dash: [2, 2]))
                    }
                }
            }
        }
        .frame(height: dynamicTypeSize.isAccessibilitySize ? 310 : 270)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Atom picture")
        .accessibilityValue(reading.summary)
        .accessibilityIdentifier("subject-tip.atom.diagram")
    }

    /// Nucleons in a stable cluster: positions come from a fixed seed so the nucleus never jitters.
    private func drawNucleus(in context: inout GraphicsContext, centre: CGPoint,
                             reading: Logic.AtomReading, maxRadius: CGFloat, shellCount: Int) {
        let total = reading.protons + reading.neutrons
        guard total > 0 else { return }
        let innerClearance = reading.shells.isEmpty ? maxRadius * 0.42 : maxRadius / CGFloat(shellCount) * 0.72
        let clusterRadius = min(innerClearance, 14 + CGFloat(total) * 1.1)
        let haloRadius = clusterRadius + 6
        let haloRect = CGRect(x: centre.x - haloRadius, y: centre.y - haloRadius, width: haloRadius * 2, height: haloRadius * 2)
        context.fill(Path(ellipseIn: haloRect), with: .color(SubjectTipPalette.proton.color.opacity(0.12)))
        context.stroke(Path(ellipseIn: haloRect), with: .color(SubjectTipPalette.proton.color.opacity(0.35)),
                       style: StrokeStyle(lineWidth: 1, dash: [3, 3]))

        var seed: UInt64 = 7
        func rnd() -> Double {
            seed = seed &* 2_862_933_555_777_941_757 &+ 3_037_000_493
            return Double((seed >> 33) % 10_000) / 10_000
        }
        let kinds = Array(repeating: true, count: reading.protons) + Array(repeating: false, count: reading.neutrons)
        for isProton in kinds {
            let angle = rnd() * 2 * .pi
            let distance = total == 1 ? 0 : rnd() * max(0, clusterRadius - 9)
            let point = CGPoint(x: centre.x + cos(angle) * distance, y: centre.y + sin(angle) * distance)
            drawParticle(in: &context, at: point, radius: 8.5,
                         fill: isProton ? SubjectTipPalette.proton.color : SubjectTipPalette.neutron.color,
                         glyph: isProton ? "+" : nil)
        }
    }

    private func drawParticle(in context: inout GraphicsContext, at point: CGPoint, radius: CGFloat,
                              fill: Color, glyph: String?) {
        let rect = CGRect(x: point.x - radius, y: point.y - radius, width: radius * 2, height: radius * 2)
        context.fill(Path(ellipseIn: rect), with: .color(fill))
        context.stroke(Path(ellipseIn: rect), with: .color(Color.kymaiaBackground.opacity(0.6)), lineWidth: 1)
        if let glyph {
            let text = Text(glyph).font(.kymaiaCaption.weight(.bold)).foregroundStyle(Color.kymaiaBackground)
            context.draw(context.resolve(text), at: point, anchor: .center)
        }
    }
}
