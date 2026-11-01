import SwiftUI

/// Self-check questions. Each answer stays hidden until the learner asks for it.
struct SubjectTipPracticeList: View {
    let questions: [SubjectTip.PracticeQuestion]
    @Binding var revealed: Set<Int>

    var body: some View {
        ForEach(Array(questions.enumerated()), id: \.offset) { index, question in
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    Text("Question \(index + 1) of \(questions.count)")
                        .font(.kymaiaEyebrow)
                        .textCase(.uppercase)
                        .foregroundStyle(Color.kymaiaMutedInk)
                    Text(question.question)
                        .font(.kymaiaHeadline)
                        .fixedSize(horizontal: false, vertical: true)
                    if revealed.contains(index) {
                        Text(question.answer)
                            .font(.kymaiaHeadline.weight(.bold))
                            .foregroundStyle(Color.kymaiaPrimaryStrong)
                            .fixedSize(horizontal: false, vertical: true)
                            .accessibilityIdentifier("subject-tip.practice.\(index + 1).answer")
                        Text(question.explanation)
                            .font(.kymaiaSerifProse)
                            .fixedSize(horizontal: false, vertical: true)
                        Button("Hide answer") { revealed.remove(index) }
                            .buttonStyle(SessionGhostButtonStyle())
                            .accessibilityIdentifier("subject-tip.practice.\(index + 1).hide")
                    } else {
                        Button("Show answer") { revealed.insert(index) }
                            .buttonStyle(JournalCapsuleButtonStyle())
                            .accessibilityHint("Think of your answer first.")
                            .accessibilityIdentifier("subject-tip.practice.\(index + 1).reveal")
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}

/// Worked examples, common mistakes and a real-world link, open by default so key examples are never hidden.
struct SubjectTipGoDeeper: View {
    let goDeeper: SubjectTip.GoDeeper
    @State private var isExpanded = true

    var body: some View {
        DisclosureGroup(isExpanded: $isExpanded) {
            VStack(alignment: .leading, spacing: Spacing.md) {
                ForEach(Array(goDeeper.workedExamples.enumerated()), id: \.offset) { index, example in
                    workedExample(example, number: index + 1)
                }
                Text("Common mistakes to avoid")
                    .font(.kymaiaHeadline.weight(.bold))
                    .accessibilityAddTraits(.isHeader)
                ForEach(goDeeper.mistakes, id: \.self) { mistake in
                    Label {
                        Text(mistake).font(.kymaiaBody).fixedSize(horizontal: false, vertical: true)
                    } icon: {
                        Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(Color.kymaiaWarning)
                    }
                    .padding(Spacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .journalIllustrationSurface()
                }
                Text("In the real world")
                    .font(.kymaiaHeadline.weight(.bold))
                    .accessibilityAddTraits(.isHeader)
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    ForEach(Array(goDeeper.realWorld.components(separatedBy: "\n\n").enumerated()), id: \.offset) { _, paragraph in
                        Text(paragraph.trimmingCharacters(in: .whitespacesAndNewlines))
                            .font(.kymaiaSerifProse)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(Spacing.md)
                .frame(maxWidth: .infinity, alignment: .leading)
                .journalIllustrationSurface()
            }
            .padding(.top, Spacing.sm)
        } label: {
            Label("Go deeper: worked examples, traps & real world", systemImage: "books.vertical")
                .font(.kymaiaTitle)
                .foregroundStyle(Color.kymaiaInk)
        }
        .tint(Color.kymaiaPrimary)
        .padding(.top, Spacing.sm)
        .accessibilityIdentifier("subject-tip.go-deeper")
    }

    private func workedExample(_ example: SubjectTip.WorkedExample, number: Int) -> some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Text("Worked example \(number)")
                    .font(.kymaiaEyebrow)
                    .textCase(.uppercase)
                    .foregroundStyle(Color.kymaiaPrimaryStrong)
                Text(example.problem)
                    .font(.kymaiaHeadline)
                    .fixedSize(horizontal: false, vertical: true)
                ForEach(Array(example.steps.enumerated()), id: \.offset) { index, step in
                    HStack(alignment: .firstTextBaseline, spacing: Spacing.sm) {
                        Text("Step \(index + 1)")
                            .font(.kymaiaCaption.weight(.bold).monospacedDigit())
                            .foregroundStyle(Color.kymaiaPrimaryStrong)
                            .padding(.horizontal, Spacing.xs)
                            .padding(.vertical, Spacing.xs / 2)
                            .background(Color.kymaiaSelectionFill, in: Capsule())
                        Text(step)
                            .font(.kymaiaBody)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .accessibilityElement(children: .combine)
                }
                Divider().overlay(Color.kymaiaHairline)
                HStack(alignment: .firstTextBaseline, spacing: Spacing.sm) {
                    Text("Result").font(.kymaiaCaption.weight(.bold)).foregroundStyle(Color.kymaiaPrimaryStrong)
                    Text(example.answer)
                        .font(.kymaiaHeadline.weight(.bold))
                        .fixedSize(horizontal: false, vertical: true)
                }
                .accessibilityElement(children: .combine)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .accessibilityIdentifier("subject-tip.worked-example.\(number)")
    }
}

/// Who wrote the tip, what it was checked against, and the open references used.
struct SubjectTipSources: View {
    let tip: SubjectTip

    var body: some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Text(tip.rights).font(.kymaiaCaption).fixedSize(horizontal: false, vertical: true)
                Text("Syllabus: \(tip.syllabusRefs.joined(separator: "; "))")
                    .font(.kymaiaCaption)
                    .fixedSize(horizontal: false, vertical: true)
                ForEach(tip.sources, id: \.self) { source in
                    if let url = URL(string: source) {
                        Link(Self.linkTitle(url), destination: url).font(.kymaiaCaption)
                    }
                }
                Text("Checked on \(tip.reviewedOn)").font(.kymaiaCaption).foregroundStyle(Color.kymaiaMutedInk)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, Spacing.xs)
        } label: {
            Text("Sources and authorship").font(.kymaiaHeadline).foregroundStyle(Color.kymaiaInk)
        }
        .tint(Color.kymaiaPrimary)
        .accessibilityIdentifier("subject-tip.sources")
    }

    /// "openstax.org · 2 2 speed and velocity": the host alone would make two pages from one site look the same.
    static func linkTitle(_ url: URL) -> String {
        let host = url.host ?? "Source"
        let page = url.lastPathComponent.replacingOccurrences(of: "-", with: " ")
        return page.isEmpty || page == "/" ? host : "\(host) · \(page)"
    }
}
