import SwiftUI

/// Put each item in a group, then check the sort to see where each belongs and why.
/// A self-check: the count of right answers is shown to the learner and never stored as a score.
struct SortClassifyVisual: View {
    let sort: SubjectTipVisual.SortClassify
    @Binding var placements: [Int?]
    @Binding var checked: Bool

    private typealias Logic = SubjectTipVisualLogic
    private var result: Logic.SortResult { Logic.sortResult(sort, placements: placements) }

    var body: some View {
        Text(sort.prompt).font(.kymaiaHeadline)
        groups
        ForEach(Array(sort.items.enumerated()), id: \.offset) { index, item in
            if index > 0 { Divider().overlay(Color.kymaiaHairline) }
            row(index: index, item: item)
        }
        ViewThatFits(in: .horizontal) {
            HStack(spacing: Spacing.md) { actions }
            VStack(alignment: .leading, spacing: Spacing.sm) { actions }
        }
        if !result.allPlaced {
            Text("Put every item in a group, then check your sort.")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
        }
        if checked {
            Text("\(result.correct) of \(result.total) are in the right group. This is a check for you; nothing is scored.")
                .font(.kymaiaBody)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityIdentifier("subject-tip.sort.summary")
        }
    }

    @ViewBuilder private var actions: some View {
        Button("Check my sort") { checked = true }
            .buttonStyle(JournalCapsuleButtonStyle())
            .disabled(!result.allPlaced || checked)
            .opacity(!result.allPlaced || checked ? 0.45 : 1)
            .accessibilityIdentifier("subject-tip.sort.check")
        Button("Start again") {
            placements = Array(repeating: nil, count: sort.items.count)
            checked = false
        }
        .buttonStyle(SessionGhostButtonStyle())
        .disabled(result.placed == 0)
        .opacity(result.placed == 0 ? 0.45 : 1)
        .accessibilityIdentifier("subject-tip.sort.reset")
    }

    private func placement(_ index: Int) -> Int? {
        placements.indices.contains(index) ? placements[index] : nil
    }

    private func place(_ index: Int, in bin: Int) {
        var updated = placements.count == sort.items.count ? placements : Array(repeating: nil, count: sort.items.count)
        updated[index] = bin
        placements = updated
        checked = false
    }

    private var groups: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                Text("Sorting trays (\(result.placed) of \(result.total) placed)")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Color.kymaiaMutedInk)
                Spacer()
                if checked {
                    Text("\(result.correct)/\(result.total) matched")
                        .font(.kymaiaCaption.weight(.bold))
                        .foregroundStyle(result.correct == result.total ? Color.kymaiaSuccess : Color.kymaiaWarning)
                }
            }
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: Spacing.md) { groupColumns }
                VStack(alignment: .leading, spacing: Spacing.md) { groupColumns }
            }
        }
        .padding(Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .journalIllustrationSurface()
    }

    @ViewBuilder private var groupColumns: some View {
        ForEach(Array(sort.bins.enumerated()), id: \.offset) { bin, name in
            let members = sort.items.indices.filter { placement($0) == bin }.map { sort.items[$0].label }
            VStack(alignment: .leading, spacing: Spacing.xs) {
                HStack(spacing: Spacing.xs) {
                    binDiagram(for: name, index: bin)
                    Text(name).font(.kymaiaHeadline.weight(.bold))
                }
                if members.isEmpty {
                    Text("Empty tray — tap a button below to place an item here")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                } else {
                    FlowLayout(spacing: Spacing.xs + 2) {
                        ForEach(members, id: \.self) { JournalChip(text: $0) }
                    }
                }
            }
            .padding(Spacing.sm)
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .journalIllustrationSurface()
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(name)
            .accessibilityValue(members.isEmpty ? "Empty" : members.joined(separator: ", "))
            .accessibilityIdentifier("subject-tip.sort.group.\(bin + 1)")
        }
    }

    private func binDiagram(for name: String, index: Int) -> some View {
        let lower = name.lowercased()
        return Canvas { context, size in
            let mid = CGPoint(x: size.width / 2, y: size.height / 2)
            if lower.contains("element") {
                for pt in [CGPoint(x: 9, y: 10), CGPoint(x: 23, y: 11), CGPoint(x: 15, y: 23)] {
                    context.fill(Path(ellipseIn: CGRect(x: pt.x - 4.5, y: pt.y - 4.5, width: 9, height: 9)),
                                 with: .color(SubjectTipPalette.proton.color))
                }
            } else if lower.contains("compound") {
                for y: CGFloat in [11, 23] {
                    var link = Path()
                    link.move(to: CGPoint(x: 11, y: y))
                    link.addLine(to: CGPoint(x: 21, y: y))
                    context.stroke(link, with: .color(Color.kymaiaInk), lineWidth: 1.8)
                    context.fill(Path(ellipseIn: CGRect(x: 6.5, y: y - 4.5, width: 9, height: 9)),
                                 with: .color(SubjectTipPalette.proton.color))
                    context.fill(Path(ellipseIn: CGRect(x: 16.5, y: y - 4.5, width: 9, height: 9)),
                                 with: .color(SubjectTipPalette.electron.color))
                }
            } else if lower.contains("mixture") {
                context.fill(Path(ellipseIn: CGRect(x: 5, y: 6, width: 8, height: 8)),
                             with: .color(SubjectTipPalette.proton.color))
                context.fill(Path(ellipseIn: CGRect(x: 19, y: 7, width: 8, height: 8)),
                             with: .color(SubjectTipPalette.mass.color))
                context.fill(Path(ellipseIn: CGRect(x: 11, y: 19, width: 9, height: 9)),
                             with: .color(SubjectTipPalette.electron.color))
            } else if lower.contains("filtr") {
                var funnel = Path()
                funnel.move(to: CGPoint(x: 6, y: 6))
                funnel.addLine(to: CGPoint(x: 26, y: 6))
                funnel.addLine(to: CGPoint(x: 16, y: 20))
                funnel.closeSubpath()
                context.stroke(funnel, with: .color(Color.kymaiaPrimary), lineWidth: 1.6)
                context.fill(Path(ellipseIn: CGRect(x: 14, y: 23, width: 4, height: 4)),
                             with: .color(SubjectTipPalette.electron.color))
            } else if lower.contains("chromat") {
                let paper = CGRect(x: 9, y: 4, width: 14, height: 24)
                context.stroke(Path(paper), with: .color(Color.kymaiaInk.opacity(0.6)), lineWidth: 1.2)
                context.fill(Path(ellipseIn: CGRect(x: 13, y: 8, width: 6, height: 6)), with: .color(SubjectTipPalette.proton.color))
                context.fill(Path(ellipseIn: CGRect(x: 13, y: 17, width: 6, height: 6)), with: .color(SubjectTipPalette.electron.color))
            } else {
                let colors = [SubjectTipPalette.proton.color, SubjectTipPalette.electron.color, SubjectTipPalette.mass.color]
                let tint = colors[index % colors.count]
                let ring = CGRect(x: mid.x - 10, y: mid.y - 10, width: 20, height: 20)
                context.fill(Path(ellipseIn: ring), with: .color(tint.opacity(0.22)))
                context.stroke(Path(ellipseIn: ring), with: .color(tint), lineWidth: 1.8)
            }
        }
        .frame(width: 32, height: 32)
        .accessibilityHidden(true)
    }

    private func row(index: Int, item: SubjectTipVisual.SortClassify.Item) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(item.label).font(.kymaiaBody.weight(.semibold))
            FlowLayout(spacing: Spacing.sm) {
                ForEach(Array(sort.bins.enumerated()), id: \.offset) { bin, name in
                    let isSelected = placement(index) == bin
                    Button { place(index, in: bin) } label: {
                        Label(name, systemImage: isSelected ? "checkmark.circle.fill" : "circle")
                            .font(.kymaiaControlLabel)
                    }
                    .buttonStyle(KymaiaOptionButtonStyle(isSelected: isSelected))
                    .accessibilityLabel("Put \(item.label) in \(name)")
                    .accessibilityAddTraits(isSelected ? .isSelected : [])
                    .accessibilityIdentifier("subject-tip.sort.item.\(index + 1).bin.\(bin + 1)")
                }
            }
            if checked, let verdict = result.itemIsCorrect[index] {
                Label(verdict ? "Right group" : "This belongs in \(item.bin)",
                      systemImage: verdict ? "checkmark.circle.fill" : "arrow.uturn.right.circle.fill")
                    .font(.kymaiaHeadline)
                    .foregroundStyle(verdict ? Color.kymaiaSuccess : Color.kymaiaWarning)
                Text(item.reason)
                    .font(.kymaiaBody)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .accessibilityElement(children: .contain)
    }
}
