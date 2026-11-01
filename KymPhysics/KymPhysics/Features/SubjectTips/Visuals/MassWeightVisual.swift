import SwiftUI

/// The same astronaut on a pan balance and on a spring scale, on a world the learner picks.
/// The balance compares her with kilogram masses, so it reads the same wherever there is
/// gravity; the spring scale feels the pull, so it reads weight = mass × g. Teal is mass and
/// orange is weight, and every value also carries its unit and its instrument's name.
struct MassWeightVisual: View {
    let visual: SubjectTipVisual.MassWeight
    @Binding var mass: Double
    @Binding var worldIndex: Int
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private typealias Logic = SubjectTipVisualLogic

    var body: some View {
        SubjectTipObservation(text: visual.observation)
        worldPicker
        if let world = Logic.world(at: worldIndex, in: visual) {
            let reading = Logic.massWeightReading(visual, mass: mass, world: world)
            picture(reading)
            readouts(reading)
            SubjectTipValueControl(title: "Mass", valueText: "\(Logic.formatted(mass)) kg", value: $mass,
                                   range: visual.mass.minimum...visual.mass.maximum, step: visual.mass.step,
                                   identifier: "subject-tip.mass-weight.mass")
            equation(reading)
        }
    }

    // MARK: Worlds

    private var selectedIndex: Int {
        min(max(0, worldIndex), max(0, visual.worlds.count - 1))
    }

    private var worldPicker: some View {
        FlowLayout(spacing: Spacing.sm) {
            ForEach(Array(visual.worlds.enumerated()), id: \.offset) { index, world in
                let isSelected = index == selectedIndex
                let strength = Logic.formatted(world.fieldStrength)
                Button {
                    worldIndex = index
                } label: {
                    HStack(spacing: Spacing.xs) {
                        if isSelected {
                            Image(systemName: "checkmark").accessibilityHidden(true)
                        }
                        Text("\(world.name) · \(strength) N/kg")
                    }
                }
                .buttonStyle(JournalFilterChipStyle(isSelected: isSelected))
                .accessibilityLabel("\(world.name), \(strength) newtons per kilogram")
                .accessibilityAddTraits(isSelected ? .isSelected : [])
                .accessibilityIdentifier("subject-tip.mass-weight.world.\(index + 1)")
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Worlds")
    }

    // MARK: Picture

    /// Side by side when there is room; one instrument above the other at accessibility sizes or
    /// in a narrow window. The drawing's own labels stop growing at xLarge so they never collide;
    /// the readouts below carry the same values at full size.
    private func picture(_ reading: Logic.MassWeightReading) -> some View {
        let both = scene(reading, instruments: [.balance, .springScale], showsWorldName: true, height: 270)
        let stacked = VStack(spacing: Spacing.sm) {
            scene(reading, instruments: [.balance], showsWorldName: true, height: 250)
            scene(reading, instruments: [.springScale], showsWorldName: false, height: 250)
        }
        return Group {
            if dynamicTypeSize.isAccessibilitySize {
                stacked
            } else {
                ViewThatFits(in: .horizontal) {
                    both.frame(minWidth: 460)
                    stacked
                }
            }
        }
        .dynamicTypeSize(...DynamicTypeSize.xLarge)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Balance and spring scale")
        .accessibilityValue(Logic.spokenSummary(reading))
        .accessibilityIdentifier("subject-tip.mass-weight.picture")
    }

    private func scene(_ reading: Logic.MassWeightReading, instruments: [MassWeightScene.Instrument],
                       showsWorldName: Bool, height: CGFloat) -> some View {
        let floatAmount: Double = reading.isFloating ? 1 : 0
        return MassWeightScene(instruments: instruments, reading: reading, showsWorldName: showsWorldName,
                               weightFraction: reading.weightFraction, floatAmount: floatAmount)
            .frame(height: height)
            .frame(maxWidth: .infinity)
            .journalIllustrationClip()
            .kymaiaAnimation(.kymaiaStandard, value: [reading.weightFraction, floatAmount])
    }

    // MARK: Readouts

    @ViewBuilder private func readouts(_ reading: Logic.MassWeightReading) -> some View {
        let massText = "\(Logic.formatted(reading.mass)) kg"
        let place = Logic.place(of: reading.world)
        let strength = Logic.formatted(reading.world.fieldStrength)
        let massTile = readout(title: "Balance (mass)", value: massText,
                               detail: reading.balance == .balanced ? "same on every world" : "unchanged, though a balance needs a pull to show it",
                               color: SubjectTipPalette.mass, tint: SubjectTipPalette.massTint, identifier: "mass")
        let weightTile = readout(title: "Spring scale (weight)", value: "\(Logic.formatted(reading.weight)) N",
                                 detail: reading.isFloating ? "floating \(place) (g = \(strength) N/kg)" : "\(place) (g = \(strength) N/kg)",
                                 color: SubjectTipPalette.weight, tint: SubjectTipPalette.weightTint, identifier: "weight")
        if dynamicTypeSize.isAccessibilitySize {
            VStack(spacing: Spacing.sm) { massTile; weightTile }
        } else {
            // An ideal width of its own keeps the pair side by side whatever the details say;
            // they wrap inside their tiles and only a narrow window stacks them.
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: Spacing.sm) { massTile; weightTile }
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(minWidth: 460, idealWidth: 460)
                VStack(spacing: Spacing.sm) { massTile; weightTile }
            }
        }
    }

    private func readout(title: String, value: String, detail: String, color: KymaiaAdaptiveColor,
                         tint: KymaiaAdaptiveColor, identifier: String) -> some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(title)
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(color.color)
            Text(value)
                .font(.kymaiaMetric)
                .foregroundStyle(color.color)
            Text(detail)
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, Spacing.md - 2)
        .padding(.vertical, Spacing.sm + 2)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .journalIllustrationSurface(fill: tint.color)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("subject-tip.mass-weight.\(identifier)-readout")
    }

    // MARK: Equation

    private func equation(_ reading: Logic.MassWeightReading) -> some View {
        let massValue = Logic.formatted(reading.mass)
        let strength = Logic.formatted(reading.world.fieldStrength)
        let weightValue = Logic.formatted(reading.weight)
        let massText = Text("\(massValue) kg").fontWeight(.semibold).foregroundStyle(SubjectTipPalette.mass.color)
        let weightText = Text("\(weightValue) N").fontWeight(.semibold).foregroundStyle(SubjectTipPalette.weight.color)
        return Text("weight = mass × g = \(massText) × \(strength) N/kg = \(weightText)")
            .font(.kymaiaBody.monospacedDigit())
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityLabel("Weight equals mass times g")
            .accessibilityValue("\(massValue) kilograms times \(strength) newtons per kilogram equals \(weightValue) newtons")
            .accessibilityIdentifier("subject-tip.mass-weight.equation")
    }
}

/// The chosen world's sky and ground with the balance on the left and the spring scale on the
/// right, or one instrument on its own. Animatable, so the scale's platform, the weight arrow and
/// the floating astronaut move together (instantly under Reduce Motion).
private struct MassWeightScene: View, Animatable {
    enum Instrument { case balance, springScale }

    let instruments: [Instrument]
    let reading: SubjectTipVisualLogic.MassWeightReading
    let showsWorldName: Bool
    var weightFraction: Double
    var floatAmount: Double
    @Environment(\.colorScheme) private var colorScheme

    var animatableData: AnimatablePair<Double, Double> {
        get { AnimatablePair(weightFraction, floatAmount) }
        set {
            weightFraction = newValue.first
            floatAmount = newValue.second
        }
    }

    private typealias Palette = SubjectTipPalette
    private static let groundHeight: CGFloat = 36

    var body: some View {
        Canvas { context, size in
            let scenery = Palette.scenery(for: reading.world)
            let ink = SceneInk(isDark: scenery.isDark(in: colorScheme))
            let groundY = size.height - Self.groundHeight
            context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(scenery.sky(in: colorScheme)))
            if let ground = scenery.ground(in: colorScheme) {
                context.fill(Path(CGRect(x: 0, y: groundY, width: size.width, height: Self.groundHeight)), with: .color(ground))
            } else {
                drawStars(in: &context, size: size, ink: ink)
            }
            let slotWidth = size.width / CGFloat(max(1, instruments.count))
            for (index, instrument) in instruments.enumerated() {
                let slot = CGRect(x: slotWidth * CGFloat(index), y: 0, width: slotWidth, height: size.height)
                switch instrument {
                case .balance: drawBalance(in: &context, slot: slot, groundY: groundY, ink: ink)
                case .springScale: drawSpringScale(in: &context, slot: slot, groundY: groundY, ink: ink)
                }
            }
            if showsWorldName {
                let name = context.resolve(Text(reading.world.name).font(.kymaiaHeadline).foregroundStyle(ink.text))
                context.draw(name, at: CGPoint(x: 14, y: 10), anchor: .topLeading)
            }
        }
    }

    // MARK: Balance

    private func drawBalance(in context: inout GraphicsContext, slot: CGRect, groundY: CGFloat, ink: SceneInk) {
        let centre = slot.midX
        let pivotY = groundY - 60
        let half = min(108, slot.width * 0.34)
        let plateHalf = min(46, half * 0.48)
        let plateY = pivotY - 24
        let steel = ink.steel

        context.fill(rounded(CGRect(x: centre - 46, y: groundY - 8, width: 92, height: 8), radius: CornerRadius.micro), with: .color(steel))
        context.fill(Path(CGRect(x: centre - 4, y: pivotY, width: 8, height: groundY - 8 - pivotY)), with: .color(steel))
        drawPointer(in: &context, pivot: CGPoint(x: centre, y: pivotY), ink: ink)
        for end in [centre - half, centre + half] {
            context.fill(Path(CGRect(x: end - 2.5, y: plateY, width: 5, height: pivotY - plateY)), with: .color(steel))
            let plate = CGRect(x: end - plateHalf, y: plateY - 6, width: plateHalf * 2, height: 6)
            context.fill(rounded(plate, radius: CornerRadius.micro), with: .color(steel))
        }
        context.fill(rounded(CGRect(x: centre - half - 8, y: pivotY - 4, width: half * 2 + 16, height: 8), radius: CornerRadius.micro),
                     with: .color(steel))
        context.fill(Path(ellipseIn: CGRect(x: centre - 7, y: pivotY - 7, width: 14, height: 14)), with: .color(steel))
        context.fill(Path(ellipseIn: CGRect(x: centre - 2.5, y: pivotY - 2.5, width: 5, height: 5)), with: .color(ink.text))

        // With no pull the loads drift up off their plates.
        let lift = 8 * CGFloat(floatAmount)
        let loadBase = plateY - 6 - lift
        drawMassBlock(in: &context, centre: CGPoint(x: centre - half, y: loadBase), ink: ink)
        drawAstronaut(in: &context, feet: CGPoint(x: centre + half, y: loadBase), height: 64, tilt: .degrees(-6 * floatAmount))

        let massText = SubjectTipVisualLogic.formatted(reading.mass)
        let balanced = reading.balance == .balanced
        drawPill(balanced ? "balanced · \(massText) kg" : "no pull · can't balance",
                 color: balanced ? Palette.mass.color : Color.kymaiaMutedInk,
                 at: CGPoint(x: centre, y: plateY - 84), anchor: .bottom, in: &context)
    }

    /// The dial above the pivot, like a school balance's: its needle stands upright while the
    /// beam is level.
    private func drawPointer(in context: inout GraphicsContext, pivot: CGPoint, ink: SceneInk) {
        let radius: CGFloat = 22
        var face = Path()
        face.addArc(center: pivot, radius: radius, startAngle: .degrees(-180), endAngle: .degrees(0), clockwise: false)
        face.closeSubpath()
        context.fill(face, with: .color(Color.kymaiaSurface))
        context.stroke(face, with: .color(ink.steel), lineWidth: 1.5)
        var ticks = Path()
        for degrees in stride(from: -150.0, through: -30.0, by: 30.0) {
            let angle = degrees * .pi / 180
            let inner = radius - (degrees == -90 ? 7 : 4)
            ticks.move(to: CGPoint(x: pivot.x + cos(angle) * inner, y: pivot.y + sin(angle) * inner))
            ticks.addLine(to: CGPoint(x: pivot.x + cos(angle) * (radius - 1), y: pivot.y + sin(angle) * (radius - 1)))
        }
        context.stroke(ticks, with: .color(Color.kymaiaMutedInk), lineWidth: 1)
        var needle = Path()
        needle.move(to: pivot)
        needle.addLine(to: CGPoint(x: pivot.x, y: pivot.y - radius + 3))
        context.stroke(needle, with: .color(Color.kymaiaInk), style: StrokeStyle(lineWidth: 2, lineCap: .round))
    }

    /// A kilogram mass with a knob on top, labelled with its mass, standing on `centre`.
    private func drawMassBlock(in context: inout GraphicsContext, centre: CGPoint, ink: SceneInk) {
        let text = "\(SubjectTipVisualLogic.formatted(reading.mass)) kg"
        let label = context.resolve(Text(text).font(.kymaiaHeadline).foregroundStyle(ink.onMass))
        let size = label.measure(in: CGSize(width: 400, height: 200))
        let block = CGRect(x: centre.x - (size.width + 16) / 2, y: centre.y - size.height - 12, width: size.width + 16, height: size.height + 12)
        let knob = CGRect(x: centre.x - 8, y: block.minY - 6, width: 16, height: 8)
        context.fill(rounded(knob, radius: CornerRadius.micro / 2), with: .color(ink.massFill))
        context.fill(rounded(block, radius: CornerRadius.micro), with: .color(ink.massFill))
        context.draw(label, at: CGPoint(x: block.midX, y: block.midY), anchor: .center)
    }

    // MARK: Spring scale

    private func drawSpringScale(in context: inout GraphicsContext, slot: CGRect, groundY: CGFloat, ink: SceneInk) {
        let steel = ink.steel
        let pressed = CGFloat(max(0, min(1.2, weightFraction)))
        let gap = 28 - 14 * pressed
        let baseTop = groundY - 12
        let platformTop = baseTop - gap - 8
        let display = drawDisplay(in: &context, slot: slot, ink: ink)
        // Alone in a full-width scene the scale sits nearer the middle, its arrow and display to the right.
        let figureX = slot.minX + slot.width * (instruments.count == 1 ? 0.4 : 0.32)
        let platformHalf = min(62, slot.width * 0.2)

        context.fill(rounded(CGRect(x: figureX - platformHalf + 4, y: baseTop, width: platformHalf * 2 - 8, height: 12), radius: CornerRadius.micro),
                     with: .color(steel))
        for side in [-1.0, 1.0] {
            drawSpring(in: &context, x: figureX + CGFloat(side) * platformHalf * 0.58, bottom: baseTop, top: baseTop - gap, color: steel)
        }
        context.fill(rounded(CGRect(x: figureX - platformHalf, y: platformTop, width: platformHalf * 2, height: 8), radius: CornerRadius.micro),
                     with: .color(steel))

        let lift = 44 * CGFloat(floatAmount)
        let feet = CGPoint(x: figureX, y: platformTop - lift)
        drawAstronaut(in: &context, feet: feet, height: 100, tilt: .degrees(-8 * floatAmount))

        guard !reading.isFloating else {
            drawPill("floating · 0 N", color: Palette.weight.color, at: CGPoint(x: figureX, y: platformTop - 6), anchor: .bottom, in: &context)
            return
        }
        let weightText = "\(SubjectTipVisualLogic.formatted(reading.weight)) N"
        // Clear of the platform, so even the longest arrow never runs down its edge.
        let arrowX = figureX + platformHalf + 12
        let start = feet.y - 58
        let longest = max(40, min(116, slot.maxY - 8 - start))
        // Any pull at all gets a shaft as well as a head; the length grows with the weight from there.
        let shortest: CGFloat = 26
        let length = shortest + (longest - shortest) * pressed
        context.drawArrow(from: CGPoint(x: arrowX, y: start), to: CGPoint(x: arrowX, y: start + length), color: ink.weight, width: 6, headLength: 14)
        let labelY = max(display.maxY + 20, start + length / 2)
        drawPill(weightText, color: Palette.weight.color, at: CGPoint(x: arrowX + 10, y: labelY), anchor: .leading, in: &context)
    }

    /// The scale's digital readout in the slot's top corner. Returns its frame.
    private func drawDisplay(in context: inout GraphicsContext, slot: CGRect, ink: SceneInk) -> CGRect {
        let text = "\(SubjectTipVisualLogic.formatted(reading.weight)) N"
        let digits = context.resolve(Text(text).font(.kymaiaMetric).foregroundStyle(Palette.weight.dark.color))
        let size = digits.measure(in: CGSize(width: 400, height: 200))
        let box = CGRect(x: slot.maxX - 14 - size.width - 24, y: 12, width: size.width + 24, height: size.height + 10)
        let shape = rounded(box, radius: CornerRadius.small)
        context.fill(shape, with: .color(Palette.display.color))
        context.stroke(shape, with: .color(ink.steel), lineWidth: 1.5)
        context.draw(digits, at: CGPoint(x: box.midX, y: box.midY), anchor: .center)
        return box
    }

    private func drawSpring(in context: inout GraphicsContext, x: CGFloat, bottom: CGFloat, top: CGFloat, color: Color) {
        let turns = 5
        var coil = Path()
        coil.move(to: CGPoint(x: x, y: bottom))
        for index in 1...(turns * 2) {
            let y = bottom - (bottom - top) * CGFloat(index) / CGFloat(turns * 2)
            let side: CGFloat = index == turns * 2 ? 0 : (index.isMultiple(of: 2) ? -7 : 7)
            coil.addLine(to: CGPoint(x: x + side, y: y))
        }
        context.stroke(coil, with: .color(color), style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
    }

    // MARK: Figures

    /// An astronaut `height` tall with boots on `feet`, tipped by `tilt` about the middle.
    private func drawAstronaut(in context: inout GraphicsContext, feet: CGPoint, height: CGFloat, tilt: Angle) {
        let scale = height / 102
        var figure = context
        figure.translateBy(x: feet.x, y: feet.y - height / 2)
        figure.rotate(by: tilt)
        figure.translateBy(x: 0, y: height / 2)
        let line = max(1, 1.5 * scale)
        let suit = Palette.suit.color
        let shade = Palette.suitShade.color
        let edge = Palette.suitLine.color
        func part(_ x: CGFloat, _ y: CGFloat, _ width: CGFloat, _ partHeight: CGFloat, radius: CGFloat, fill: Color) {
            let shape = rounded(CGRect(x: x * scale, y: y * scale, width: width * scale, height: partHeight * scale), radius: radius * scale)
            figure.fill(shape, with: .color(fill))
            figure.stroke(shape, with: .color(edge), lineWidth: line)
        }
        part(-24, -70, 48, 38, radius: 8, fill: shade)
        part(-16, -28, 14, 28, radius: 5, fill: suit)
        part(2, -28, 14, 28, radius: 5, fill: suit)
        part(-17, -8, 16, 8, radius: 3, fill: shade)
        part(1, -8, 16, 8, radius: 3, fill: shade)
        part(-30, -64, 11, 34, radius: 5, fill: suit)
        part(19, -64, 11, 34, radius: 5, fill: suit)
        part(-20, -68, 40, 44, radius: 12, fill: suit)
        part(-8, -58, 16, 10, radius: 2, fill: shade)
        let helmet = Path(ellipseIn: CGRect(x: -18 * scale, y: -102 * scale, width: 36 * scale, height: 36 * scale))
        figure.fill(helmet, with: .color(suit))
        figure.stroke(helmet, with: .color(edge), lineWidth: line)
        figure.fill(rounded(CGRect(x: -12 * scale, y: -91 * scale, width: 24 * scale, height: 14 * scale), radius: 7 * scale),
                    with: .color(Palette.visor.color))
        figure.fill(Path(ellipseIn: CGRect(x: -8 * scale, y: -89 * scale, width: 7 * scale, height: 4 * scale)), with: .color(suit.opacity(0.75)))
    }

    private func drawStars(in context: inout GraphicsContext, size: CGSize, ink: SceneInk) {
        var stars = Path()
        for index in 0..<40 {
            let x = CGFloat((index * 97 + 31) % 1000) / 1000 * size.width
            let y = CGFloat((index * 53 + 17) % 1000) / 1000 * size.height
            let radius = 0.8 + CGFloat(index % 3) * 0.45
            stars.addEllipse(in: CGRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2))
        }
        context.fill(stars, with: .color(ink.text.opacity(0.7)))
    }

    /// A label on a card-coloured capsule, so it reads on every sky.
    private func drawPill(_ text: String, color: Color, at point: CGPoint, anchor: UnitPoint, in context: inout GraphicsContext) {
        let label = context.resolve(Text(text).font(.kymaiaHeadline).foregroundStyle(color))
        let size = label.measure(in: CGSize(width: 600, height: 200))
        let pill = CGSize(width: size.width + 20, height: size.height + 8)
        let rect = CGRect(x: point.x - pill.width * anchor.x, y: point.y - pill.height * anchor.y, width: pill.width, height: pill.height)
        let shape = Capsule().path(in: rect)
        context.fill(shape, with: .color(Color.kymaiaSurface))
        context.stroke(shape, with: .color(color), lineWidth: 1.5)
        context.draw(label, at: CGPoint(x: rect.midX, y: rect.midY), anchor: .center)
    }

    private func rounded(_ rect: CGRect, radius: CGFloat) -> Path {
        Path(roundedRect: rect, cornerRadius: radius, style: .continuous)
    }
}

/// Ink for drawing on the sky: light on a dark sky and dark on a light one.
private struct SceneInk {
    let isDark: Bool

    var text: Color { (isDark ? KymaiaPalette.ink.dark : KymaiaPalette.ink.light).color }
    var steel: Color { (isDark ? SubjectTipPalette.steelOnDark : SubjectTipPalette.steelOnLight).color }
    var weight: Color { (isDark ? SubjectTipPalette.weight.dark : SubjectTipPalette.weight.light).color }
    var massFill: Color { (isDark ? SubjectTipPalette.mass.dark : SubjectTipPalette.mass.light).color }
    /// The label on the kilogram block, dark on the bright teal and light on the deep one.
    var onMass: Color { (isDark ? KymaiaPalette.ink.light : KymaiaPalette.ink.dark).color }
}
