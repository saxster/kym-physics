import SwiftUI

/// A tappable corner of the periodic table. Colour groups families that behave alike, and the
/// fact panel names the family in words too — position and colour never carry meaning alone.
struct PeriodicGridVisual: View {
    let grid: SubjectTipVisual.PeriodicGrid
    @Binding var selected: Int
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private typealias Logic = SubjectTipVisualLogic
    private var current: SubjectTipVisual.PeriodicGrid.Element? { Logic.periodicElement(at: selected, in: grid) }
    private var rows: [Int] { Array(Set(grid.elements.map(\.row))).sorted() }
    private var activeColumns: [Int] {
        let cols = Array(Set(grid.elements.map(\.column))).sorted()
        return cols.isEmpty ? Logic.mainGroups : cols
    }
    private var families: [String] { Array(Set(grid.elements.map(\.family))).sorted() }

    var body: some View {
        SubjectTipObservation(text: grid.observation)
        if dynamicTypeSize.isAccessibilitySize {
            elementList
        } else {
            table
        }
        legend
        factPanel
    }

    // MARK: Table (regular sizes — compact main-group columns with d-block bridge)

    private var table: some View {
        let byCell = Dictionary(uniqueKeysWithValues: grid.elements.map { ("\($0.row),\($0.column)", $0) })
        let selectedRow = current?.row
        let selectedCol = current?.column

        return VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack(spacing: Spacing.xs / 2) {
                Text("P\\G")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
                    .frame(width: 28, alignment: .center)
                ForEach(activeColumns, id: \.self) { column in
                    if column == 13 && activeColumns.contains(2) {
                        dBlockGapHeader
                    }
                    let isColActive = selectedCol == column
                    Text("G\(column)")
                        .font(.kymaiaCaption.weight(isColActive ? .bold : .regular))
                        .foregroundStyle(isColActive ? Color.kymaiaPrimary : Color.kymaiaMutedInk)
                        .frame(maxWidth: .infinity, minHeight: 22)
                        .background(isColActive ? Color.kymaiaSelectionFill : Color.clear, in: Capsule())
                }
            }

            ForEach(rows, id: \.self) { row in
                HStack(spacing: Spacing.xs / 2) {
                    let isRowActive = selectedRow == row
                    Text("P\(row)")
                        .font(.kymaiaCaption.weight(isRowActive ? .bold : .regular))
                        .foregroundStyle(isRowActive ? Color.kymaiaPrimary : Color.kymaiaMutedInk)
                        .frame(width: 28)
                        .frame(minHeight: 52)
                        .background(isRowActive ? Color.kymaiaSelectionFill : Color.clear, in: Capsule())
                    ForEach(activeColumns, id: \.self) { column in
                        if column == 13 && activeColumns.contains(2) {
                            dBlockGapDivider(row: row)
                        }
                        if let element = byCell["\(row),\(column)"] {
                            cell(element)
                        } else {
                            Color.clear.frame(maxWidth: .infinity, minHeight: 50)
                        }
                    }
                }
            }
            Text("Rows (P1–P4) count electron shells. Columns (G1–G18) share outer-shell pattern and chemical family.")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
                .padding(.top, Spacing.xs / 2)
        }
        .padding(Spacing.sm)
        .journalIllustrationSurface()
        .accessibilityIdentifier("subject-tip.periodic.table")
    }

    private var dBlockGapHeader: some View {
        Text("⋯")
            .font(.kymaiaCaption)
            .foregroundStyle(Color.kymaiaMutedInk)
            .frame(width: 12)
            .accessibilityHidden(true)
    }

    private func dBlockGapDivider(row: Int) -> some View {
        Rectangle()
            .fill(row >= 4 ? Color.kymaiaHairline : Color.clear)
            .frame(width: 1, height: 36)
            .frame(width: 12)
            .accessibilityHidden(true)
    }

    private func cell(_ element: SubjectTipVisual.PeriodicGrid.Element) -> some View {
        let index = grid.elements.firstIndex { $0.atomicNumber == element.atomicNumber } ?? 0
        let isSelected = current?.atomicNumber == element.atomicNumber
        let isSameFamily = current?.family == element.family
        let valence = Logic.valenceElectrons(for: element)

        return Button { selected = index } label: {
            ZStack {
                RoundedRectangle(cornerRadius: CornerRadius.small)
                    .fill(familyTint(element.family))
                RoundedRectangle(cornerRadius: CornerRadius.small)
                    .strokeBorder(
                        isSelected ? Color.kymaiaPrimary : (isSameFamily ? Color.kymaiaInk.opacity(0.55) : Color.kymaiaHairline),
                        lineWidth: isSelected ? 2.5 : (isSameFamily ? 1.5 : 1)
                    )
                VStack(spacing: 1) {
                    Text("\(element.atomicNumber)")
                        .font(.kymaiaCaption)
                        .monospacedDigit()
                        .foregroundStyle(Color.kymaiaMutedInk)
                    Text(element.symbol)
                        .font(.kymaiaHeadline.weight(.bold))
                        .foregroundStyle(Color.kymaiaInk)
                    Text("\(valence)e⁻")
                        .font(.kymaiaCaption)
                        .monospacedDigit()
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
                .padding(.vertical, Spacing.xs / 2)
            }
            .frame(maxWidth: .infinity, minHeight: 52)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(element.name), \(element.atomicNumber) protons, \(element.family), \(valence) outer electrons")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityIdentifier("subject-tip.periodic.element.\(element.symbol)")
    }

    // MARK: List (accessibility sizes: a real list beats a cramped grid)

    private var elementList: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            ForEach(Array(grid.elements.sorted { $0.atomicNumber < $1.atomicNumber }.enumerated()), id: \.element.atomicNumber) { _, element in
                let index = grid.elements.firstIndex { $0.atomicNumber == element.atomicNumber } ?? 0
                let isSelected = current?.atomicNumber == element.atomicNumber
                Button { selected = index } label: {
                    Label("\(element.symbol) — \(element.name) (\(element.atomicNumber) protons, \(element.family))",
                          systemImage: isSelected ? "checkmark.circle.fill" : "circle")
                        .font(.kymaiaControlLabel)
                }
                .buttonStyle(KymaiaOptionButtonStyle(isSelected: isSelected))
                .accessibilityAddTraits(isSelected ? .isSelected : [])
                .accessibilityIdentifier("subject-tip.periodic.element.\(element.symbol)")
            }
        }
    }

    private var legend: some View {
        FlowLayout(spacing: Spacing.sm) {
            ForEach(families, id: \.self) { family in
                let isCurrentFamily = current?.family == family
                HStack(spacing: Spacing.xs) {
                    RoundedRectangle(cornerRadius: CornerRadius.micro).fill(familyTint(family))
                        .frame(width: 14, height: 14)
                        .overlay(
                            RoundedRectangle(cornerRadius: CornerRadius.micro)
                                .strokeBorder(isCurrentFamily ? Color.kymaiaPrimary : Color.kymaiaHairline, lineWidth: isCurrentFamily ? 2 : 1)
                        )
                    Text(family)
                        .font(.kymaiaCaption.weight(isCurrentFamily ? .semibold : .regular))
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Families shown: \(families.joined(separator: ", "))")
    }

    @ViewBuilder private var factPanel: some View {
        if let element = current {
            let relatives = Logic.familyMembers(of: element, in: grid)
            let shells = Logic.electronShells(element.atomicNumber)
            let valence = Logic.valenceElectrons(for: element)

            VStack(alignment: .leading, spacing: Spacing.sm) {
                ViewThatFits(in: .horizontal) {
                    HStack(alignment: .center, spacing: Spacing.md) {
                        miniShellCanvas(symbol: element.symbol, shells: shells)
                        elementSummaryText(element: element, shells: shells, valence: valence)
                    }
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        miniShellCanvas(symbol: element.symbol, shells: shells)
                        elementSummaryText(element: element, shells: shells, valence: valence)
                    }
                }

                FlowLayout(spacing: Spacing.xs) {
                    JournalChip(text: "Period \(element.row): \(shells.count) \(shells.count == 1 ? "shell" : "shells")")
                    JournalChip(text: "Group \(element.column): \(valence) outer e⁻")
                    JournalChip(text: "Shells: \(Logic.shellConfiguration(for: element))")
                }

                if !relatives.isEmpty {
                    Text("Same family column (\(element.family)): \(relatives.map(\.name).joined(separator: ", ")). Tap a cousin to compare their outer shell:")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                        .fixedSize(horizontal: false, vertical: true)
                    FlowLayout(spacing: Spacing.xs) {
                        ForEach(relatives, id: \.atomicNumber) { cousin in
                            if let idx = grid.elements.firstIndex(where: { $0.atomicNumber == cousin.atomicNumber }) {
                                Button("\(cousin.symbol) · \(cousin.name) (\(Logic.shellConfiguration(for: cousin)))") {
                                    selected = idx
                                }
                                .buttonStyle(KymaiaOptionButtonStyle(isSelected: false))
                            }
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Spacing.md)
            .journalIllustrationSurface()
            .accessibilityElement(children: .combine)
            .accessibilityIdentifier("subject-tip.periodic.fact")
        }
    }

    private func elementSummaryText(element: SubjectTipVisual.PeriodicGrid.Element, shells: [Int], valence: Int) -> some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("\(element.name) (\(element.symbol)) · \(element.atomicNumber) protons · \(element.family)")
                .font(.kymaiaHeadline.weight(.bold))
                .fixedSize(horizontal: false, vertical: true)
            Text(element.fact)
                .font(.kymaiaBody)
                .fixedSize(horizontal: false, vertical: true)
            Text("Why it sits here: row \(element.row) means \(shells.count) electron \(shells.count == 1 ? "shell" : "shells"); column \(element.column) means \(valence) outer-shell \(valence == 1 ? "electron" : "electrons").")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func miniShellCanvas(symbol: String, shells: [Int]) -> some View {
        Canvas { context, size in
            let centre = CGPoint(x: size.width / 2, y: size.height / 2)
            let maxR = min(size.width, size.height) / 2 - 8
            let count = max(1, shells.count)

            let core = CGRect(x: centre.x - 11, y: centre.y - 11, width: 22, height: 22)
            context.fill(Path(ellipseIn: core), with: .color(SubjectTipPalette.proton.color.opacity(0.22)))
            let label = Text(symbol).font(.kymaiaCaption.weight(.bold)).foregroundStyle(Color.kymaiaInk)
            context.draw(context.resolve(label), at: centre, anchor: .center)

            for (idx, electrons) in shells.enumerated() {
                let isOuter = idx == shells.count - 1
                let radius = 14 + (maxR - 14) * CGFloat(idx + 1) / CGFloat(count)
                let ring = CGRect(x: centre.x - radius, y: centre.y - radius, width: radius * 2, height: radius * 2)
                context.stroke(Path(ellipseIn: ring),
                               with: .color(isOuter ? SubjectTipPalette.electron.color : Color.kymaiaHairline),
                               lineWidth: isOuter ? 1.8 : 1)
                for pos in 0..<electrons {
                    let angle = -Double.pi / 2 + Double(pos) * 2 * .pi / Double(max(1, electrons))
                    let pt = CGPoint(x: centre.x + cos(angle) * radius, y: centre.y + sin(angle) * radius)
                    let r: CGFloat = isOuter ? 4.2 : 3.0
                    let dot = CGRect(x: pt.x - r, y: pt.y - r, width: r * 2, height: r * 2)
                    context.fill(Path(ellipseIn: dot),
                                 with: .color(isOuter ? SubjectTipPalette.electron.color : Color.kymaiaMutedInk))
                }
            }
        }
        .frame(width: 96, height: 96)
        .accessibilityHidden(true)
    }

    /// Family tints cycle through soft fills keyed by sorted family order, so any pack's
    /// families get distinct colours without the content naming raw values.
    private func familyTint(_ family: String) -> Color {
        let tints: [Color] = [SubjectTipPalette.protonTint.color, SubjectTipPalette.electronTint.color,
                              SubjectTipPalette.massTint.color, SubjectTipPalette.weightTint.color,
                              Color.kymaiaSelectionFill]
        let index = families.firstIndex(of: family) ?? 0
        return tints[index % tints.count]
    }
}
