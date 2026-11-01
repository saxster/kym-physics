import SwiftUI

/// Balance an equation the honest way: change how many molecules take part (the big front
/// numbers) until every element's atoms match on both sides. Formulas themselves never change.
/// A self-check: the verdict is shown live and nothing is stored as a score.
struct EquationBalanceVisual: View {
    let balance: SubjectTipVisual.EquationBalance
    @Binding var coefficients: [Int?]

    private typealias Logic = SubjectTipVisualLogic
    private var tally: Logic.BalanceTally { Logic.balanceTally(balance, coefficients: coefficients) }

    var body: some View {
        SubjectTipObservation(text: balance.observation)
        equation
        molecularStage
        controls
        tallies
        verdict
    }

    private func coefficient(_ index: Int) -> Int {
        guard coefficients.indices.contains(index), let value = coefficients[index] else { return 1 }
        return min(Logic.coefficientRange.upperBound, max(Logic.coefficientRange.lowerBound, value))
    }

    private func setCoefficient(_ index: Int, _ value: Int) {
        var updated = coefficients.count == balance.terms.count ? coefficients
            : Array(repeating: 1, count: balance.terms.count)
        updated[index] = min(Logic.coefficientRange.upperBound, max(Logic.coefficientRange.lowerBound, value))
        coefficients = updated
    }

    private var equationText: String {
        func side(_ side: SubjectTipVisual.EquationBalance.Term.Side) -> String {
            balance.terms.enumerated().filter { $0.element.side == side }
                .map { "\(coefficient($0.offset)) \($0.element.formula)" }.joined(separator: " + ")
        }
        return "\(side(.reactant)) → \(side(.product))"
    }

    private var equation: some View {
        VStack(spacing: Spacing.xs) {
            Text(equationText)
                .font(.kymaiaTitle)
                .frame(maxWidth: .infinity, alignment: .center)
            Text("Big front numbers multiply whole molecules. Small subscripts inside formulas are locked.")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
        }
        .padding(Spacing.md)
        .journalIllustrationSurface()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Equation so far: \(equationText)")
        .accessibilityIdentifier("subject-tip.balance.equation")
    }

    private var molecularStage: some View {
        let tally = tally
        let leftTerms = balance.terms.enumerated().filter { $0.element.side == .reactant }
        let rightTerms = balance.terms.enumerated().filter { $0.element.side == .product }

        return VStack(spacing: Spacing.xs) {
            HStack {
                Text("Reactants (before)")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Color.kymaiaMutedInk)
                Spacer()
                Label(tally.isBalanced ? "Mass conserved" : "Unbalanced",
                      systemImage: tally.isBalanced ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                    .font(.kymaiaCaption.weight(.bold))
                    .foregroundStyle(tally.isBalanced ? Color.kymaiaSuccess : Color.kymaiaWarning)
                Spacer()
                Text("Products (after)")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Color.kymaiaMutedInk)
            }
            .padding(.horizontal, Spacing.xs)

            Canvas { context, size in
                let midX = size.width / 2
                var divider = Path()
                divider.move(to: CGPoint(x: midX, y: 8))
                divider.addLine(to: CGPoint(x: midX, y: size.height - 34))
                context.stroke(divider, with: .color(Color.kymaiaHairline),
                               style: StrokeStyle(lineWidth: 1, dash: [4, 4]))

                let leftRect = CGRect(x: 8, y: 8, width: midX - 16, height: size.height - 46)
                let rightRect = CGRect(x: midX + 8, y: 8, width: midX - 16, height: size.height - 46)

                drawSideMolecules(in: &context, rect: leftRect, terms: leftTerms)
                drawSideMolecules(in: &context, rect: rightRect, terms: rightTerms)
                drawBalanceBeam(in: &context, size: size, tally: tally)
            }
            .frame(height: 185)
        }
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityHidden(true)
    }

    private func drawSideMolecules(
        in context: inout GraphicsContext,
        rect: CGRect,
        terms: [(offset: Int, element: SubjectTipVisual.EquationBalance.Term)]
    ) {
        var molecules: [(formula: String, atoms: [String])] = []
        for (idx, term) in terms {
            let count = coefficient(idx)
            let atomList = expandedAtoms(for: term.counts)
            for _ in 0..<count {
                molecules.append((term.formula, atomList))
            }
        }
        guard !molecules.isEmpty else { return }
        let cols = max(1, min(3, Int(ceil(sqrt(Double(molecules.count))))))
        let rows = max(1, Int(ceil(Double(molecules.count) / Double(cols))))
        let cellW = rect.width / CGFloat(cols)
        let cellH = rect.height / CGFloat(rows)

        for (mIndex, molecule) in molecules.enumerated() {
            let col = mIndex % cols
            let row = mIndex / cols
            let centre = CGPoint(x: rect.minX + (CGFloat(col) + 0.5) * cellW,
                                 y: rect.minY + (CGFloat(row) + 0.5) * cellH)
            drawMoleculeCluster(in: &context, centre: centre, atoms: molecule.atoms)
        }
    }

    private func expandedAtoms(for counts: [String: Int]) -> [String] {
        let sorted = counts.keys.sorted { a, b in
            (counts[a] ?? 0) < (counts[b] ?? 0) ? true : (counts[a] == counts[b] ? a < b : false)
        }
        var result: [String] = []
        for el in sorted {
            result.append(contentsOf: Array(repeating: el, count: min(6, counts[el] ?? 1)))
        }
        return result
    }

    private func drawMoleculeCluster(in context: inout GraphicsContext, centre: CGPoint, atoms: [String]) {
        guard !atoms.isEmpty else { return }
        let atomRadius: CGFloat = atoms.count <= 3 ? 10 : 8.5
        let positions: [CGPoint]
        if atoms.count == 1 {
            positions = [centre]
        } else if atoms.count == 2 {
            positions = [
                CGPoint(x: centre.x - atomRadius * 0.95, y: centre.y),
                CGPoint(x: centre.x + atomRadius * 0.95, y: centre.y)
            ]
        } else if atoms.count == 3 {
            positions = [
                centre,
                CGPoint(x: centre.x - atomRadius * 1.45, y: centre.y + atomRadius * 0.7),
                CGPoint(x: centre.x + atomRadius * 1.45, y: centre.y + atomRadius * 0.7)
            ]
        } else {
            var pts = [centre]
            let satellites = atoms.count - 1
            for s in 0..<satellites {
                let angle = Double(s) * 2 * .pi / Double(satellites) - .pi / 2
                pts.append(CGPoint(x: centre.x + cos(angle) * atomRadius * 1.6,
                                   y: centre.y + sin(angle) * atomRadius * 1.6))
            }
            positions = pts
        }

        if positions.count > 1 {
            var bondPath = Path()
            for idx in 1..<positions.count {
                bondPath.move(to: positions[0])
                bondPath.addLine(to: positions[idx])
            }
            context.stroke(bondPath, with: .color(Color.kymaiaInk.opacity(0.55)), lineWidth: 2.2)
        }

        for (idx, symbol) in atoms.enumerated() where idx < positions.count {
            let pt = positions[idx]
            let color = elementColor(symbol)
            let rect = CGRect(x: pt.x - atomRadius, y: pt.y - atomRadius, width: atomRadius * 2, height: atomRadius * 2)
            context.fill(Path(ellipseIn: rect), with: .color(color))
            context.stroke(Path(ellipseIn: rect), with: .color(Color.kymaiaBackground), lineWidth: 1.2)
            let text = Text(symbol).font(.kymaiaCaption.weight(.bold)).foregroundStyle(Color.kymaiaBackground)
            context.draw(context.resolve(text), at: pt, anchor: .center)
        }
    }

    private func drawBalanceBeam(in context: inout GraphicsContext, size: CGSize, tally: Logic.BalanceTally) {
        let leftTotal = tally.reactants.values.reduce(0, +)
        let rightTotal = tally.products.values.reduce(0, +)
        let diff = Double(rightTotal - leftTotal)
        let tilt = tally.isBalanced ? 0.0 : max(-8.0, min(8.0, diff * 2.0))
        let baseY = size.height - 14
        let midX = size.width / 2

        var fulcrum = Path()
        fulcrum.move(to: CGPoint(x: midX, y: baseY - 12))
        fulcrum.addLine(to: CGPoint(x: midX - 10, y: size.height - 2))
        fulcrum.addLine(to: CGPoint(x: midX + 10, y: size.height - 2))
        fulcrum.closeSubpath()
        context.fill(fulcrum, with: .color(tally.isBalanced ? Color.kymaiaSuccess : Color.kymaiaMutedInk))

        var beam = Path()
        beam.move(to: CGPoint(x: size.width * 0.14, y: baseY - 12 - tilt))
        beam.addLine(to: CGPoint(x: size.width * 0.86, y: baseY - 12 + tilt))
        context.stroke(beam, with: .color(tally.isBalanced ? Color.kymaiaSuccess : Color.kymaiaWarning), lineWidth: 3)
    }

    private func elementColor(_ symbol: String) -> Color {
        switch symbol {
        case "H": return SubjectTipPalette.electron.color
        case "O": return SubjectTipPalette.proton.color
        case "N": return SubjectTipPalette.mass.color
        case "C": return SubjectTipPalette.neutron.color
        default: return SubjectTipPalette.weight.color
        }
    }

    private var controls: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            ForEach(Array(balance.terms.enumerated()), id: \.offset) { index, term in
                HStack(spacing: Spacing.sm) {
                    Text(term.formula)
                        .font(.kymaiaBody.weight(.semibold))
                        .frame(minWidth: 64, alignment: .leading)
                    stepper(index: index, direction: -1, symbol: "minus", term: term)
                    Text("\(coefficient(index))")
                        .font(.kymaiaMetric)
                        .frame(minWidth: 28)
                        .accessibilityHidden(true)
                    stepper(index: index, direction: 1, symbol: "plus", term: term)
                    Text(term.side == .reactant ? "reactant" : "product")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
                .accessibilityElement(children: .contain)
                .accessibilityLabel("\(term.formula), \(coefficient(index)) molecules")
            }
        }
    }

    private func stepper(index: Int, direction: Int, symbol: String,
                         term: SubjectTipVisual.EquationBalance.Term) -> some View {
        let next = coefficient(index) + direction
        let enabled = Logic.coefficientRange.contains(next)
        return Button { setCoefficient(index, next) } label: {
            Image(systemName: symbol)
                .font(.kymaiaControlLabel)
                .dynamicTypeSize(...DynamicTypeSize.xxxLarge)
                .foregroundStyle(Color.kymaiaPrimaryStrong)
                .frame(width: Theme.Dimension.minimumTarget, height: Theme.Dimension.minimumTarget)
                .background(Color.kymaiaSelectionFill, in: Circle())
                .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .disabled(!enabled)
        .opacity(enabled ? 1 : 0.45)
        .accessibilityLabel("\(direction < 0 ? "Fewer" : "More") \(term.formula) molecules")
        .accessibilityIdentifier("subject-tip.balance.term.\(index + 1).\(direction < 0 ? "decrease" : "increase")")
    }

    private var tallies: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            ForEach(tally.elements, id: \.self) { element in
                let left = tally.reactants[element] ?? 0
                let right = tally.products[element] ?? 0
                let matched = left == right
                HStack(spacing: Spacing.sm) {
                    HStack(spacing: Spacing.xs) {
                        Circle().fill(elementColor(element)).frame(width: 10, height: 10)
                        Text(element).font(.kymaiaBody.weight(.bold))
                    }
                    .frame(minWidth: 42, alignment: .leading)
                    Text(dots(left)).foregroundStyle(elementColor(element)).accessibilityHidden(true)
                    Text("\(left)").font(.kymaiaBody.monospacedDigit())
                    Image(systemName: matched ? "equal.circle.fill" : "arrow.left.and.right")
                        .foregroundStyle(matched ? Color.kymaiaSuccess : Color.kymaiaWarning)
                        .accessibilityHidden(true)
                    Text("\(right)").font(.kymaiaBody.monospacedDigit())
                    Text(dots(right)).foregroundStyle(elementColor(element)).accessibilityHidden(true)
                    Spacer()
                    Text(matched ? "Balanced" : (left < right ? "Add on left" : "Add on right"))
                        .font(.kymaiaCaption)
                        .foregroundStyle(matched ? Color.kymaiaSuccess : Color.kymaiaMutedInk)
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("\(element): \(left) atoms on the left, \(right) on the right\(matched ? ", balanced" : "")")
            }
        }
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityIdentifier("subject-tip.balance.tally")
    }

    private func dots(_ count: Int) -> String { String(repeating: "●", count: min(16, count)) }

    @ViewBuilder private var verdict: some View {
        if tally.isSmallest {
            Label("Balanced — every atom accounted for, in the smallest whole numbers. Nothing was created or destroyed.",
                  systemImage: "checkmark.seal.fill")
                .font(.kymaiaHeadline)
                .foregroundStyle(Color.kymaiaSuccess)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityIdentifier("subject-tip.balance.verdict")
        } else if tally.isBalanced {
            Label("Balanced! One refinement: every number can be divided by the same factor. Chemists write the smallest whole numbers — try halving them all.",
                  systemImage: "checkmark.circle.fill")
                .font(.kymaiaHeadline)
                .foregroundStyle(Color.kymaiaSuccess)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityIdentifier("subject-tip.balance.verdict")
        } else {
            Text("Not yet: pick an element whose counts differ and change a molecule count on the short side. Never change a formula itself.")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
