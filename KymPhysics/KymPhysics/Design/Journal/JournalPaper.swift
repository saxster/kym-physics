import SwiftUI

enum JournalPaperStyle: String, CaseIterable, Identifiable, Codable, Sendable {
    case plain = "blank"
    case lined = "lined"
    case grid = "grid"
    case dotGrid = "dots"
    case cornell = "cornell"

    static var graph: JournalPaperStyle { .grid }
    static var blank: JournalPaperStyle { .plain }
    static var dots: JournalPaperStyle { .dotGrid }

    var id: String { rawValue }

    var label: String {
        switch self {
        case .plain: return "Blank"
        case .lined: return "Lined"
        case .grid: return "Grid"
        case .dotGrid: return "Dots"
        case .cornell: return "Cornell"
        }
    }

    var title: String { label }
}

enum JournalPaperMetrics {
    static let lineSpacing: CGFloat = 32
    static let dotSpacing: CGFloat = 24
    static let gridSpacing: CGFloat = 24
    static let marginInset: CGFloat = 44
    static let cornellCueInset: CGFloat = 220
    static let textLeadingPadding: CGFloat = 56
    static let textTrailingPadding: CGFloat = 28
    static let topPadding: CGFloat = 22
}

struct JournalPaperBackground: View {
    let style: JournalPaperStyle

    var body: some View {
        Canvas { context, size in
            switch style {
            case .plain:
                break
            case .lined:
                drawLines(in: &context, size: size, vertical: false)
                drawMargin(in: &context, size: size)
            case .dotGrid:
                drawDots(in: &context, size: size)
            case .grid:
                drawLines(in: &context, size: size, vertical: false, spacing: JournalPaperMetrics.gridSpacing)
                drawLines(in: &context, size: size, vertical: true, spacing: JournalPaperMetrics.gridSpacing)
            case .cornell:
                drawLines(in: &context, size: size, vertical: false)
                drawCornellDivider(in: &context, size: size)
            }
        }
        .accessibilityHidden(true)
    }

    private func drawLines(
        in context: inout GraphicsContext,
        size: CGSize,
        vertical: Bool,
        spacing: CGFloat = JournalPaperMetrics.lineSpacing
    ) {
        var path = Path()
        let extent = vertical ? size.width : size.height
        var position = spacing
        while position < extent {
            if vertical {
                path.move(to: CGPoint(x: position, y: 0))
                path.addLine(to: CGPoint(x: position, y: size.height))
            } else {
                path.move(to: CGPoint(x: 0, y: position))
                path.addLine(to: CGPoint(x: size.width, y: position))
            }
            position += spacing
        }
        context.stroke(path, with: .color(Color.kymaiaPaperRule), lineWidth: 1)
    }

    private func drawMargin(in context: inout GraphicsContext, size: CGSize) {
        var path = Path()
        path.move(to: CGPoint(x: JournalPaperMetrics.marginInset, y: 0))
        path.addLine(to: CGPoint(x: JournalPaperMetrics.marginInset, y: size.height))
        context.stroke(path, with: .color(Color.kymaiaPrimary.opacity(0.35)), lineWidth: 1)
    }

    private func drawCornellDivider(in context: inout GraphicsContext, size: CGSize) {
        var path = Path()
        let cueX = min(JournalPaperMetrics.cornellCueInset, size.width * 0.32)
        path.move(to: CGPoint(x: cueX, y: 0))
        path.addLine(to: CGPoint(x: cueX, y: size.height))
        context.stroke(path, with: .color(Color.kymaiaPaperRuleStrong), lineWidth: 1.5)
    }

    private func drawDots(in context: inout GraphicsContext, size: CGSize) {
        let spacing = JournalPaperMetrics.dotSpacing
        let radius: CGFloat = 1.1
        var y = spacing
        while y < size.height {
            var x = spacing
            while x < size.width {
                let dot = Path(ellipseIn: CGRect(
                    x: x - radius, y: y - radius, width: radius * 2, height: radius * 2
                ))
                context.fill(dot, with: .color(Color.kymaiaPaperRuleStrong))
                x += spacing
            }
            y += spacing
        }
    }
}

struct JournalPaperSheet<Content: View>: View {
    let style: JournalPaperStyle
    var minHeight: CGFloat? = nil
    private let content: Content

    @Environment(\.colorSchemeContrast) private var contrast

    init(style: JournalPaperStyle, minHeight: CGFloat? = nil, @ViewBuilder content: () -> Content) {
        self.style = style
        self.minHeight = minHeight
        self.content = content()
    }

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: CornerRadius.card, style: .continuous)
        content
            .frame(minHeight: minHeight, alignment: .topLeading)
            .background {
                ZStack {
                    Color.kymaiaSurface
                    JournalPaperBackground(style: style)
                }
            }
            .clipShape(shape)
            .kymaiaCardChrome(shape, increasedContrast: contrast == .increased)
    }
}

struct JournalCornellReader: View {
    let cues: String
    let notes: String
    let summary: String
    var minHeight: CGFloat = 240
    @State private var notesCovered = true

    var body: some View {
        JournalPaperSheet(style: .cornell, minHeight: minHeight) {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(alignment: .top, spacing: Spacing.md) {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text("Cue questions")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)
                        Text(cues)
                            .font(.kymaiaSerifProse)
                            .foregroundStyle(Color.kymaiaInk)
                    }
                    .frame(maxWidth: 220, alignment: .leading)

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        HStack {
                            Text("Notes")
                                .font(.kymaiaCaption.weight(.semibold))
                                .foregroundStyle(Color.kymaiaPrimary)
                            Spacer()
                            Button(notesCovered ? "Reveal notes" : "Cover notes") {
                                notesCovered.toggle()
                            }
                            .buttonStyle(JournalCapsuleButtonStyle(prominence: .tinted, size: .small))
                        }
                        if notesCovered {
                            Text("Notes covered for active recall — answer the cue questions on the left in your head or on paper, then tap 'Reveal notes' to check.")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                                .padding(.vertical, Spacing.md)
                        } else {
                            Text(notes)
                                .font(.kymaiaSerifProse)
                                .foregroundStyle(Color.kymaiaInk)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                if !notesCovered && !summary.isEmpty {
                    Divider()
                    Text("Summary: \(summary)")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
            }
            .padding(Spacing.md)
        }
    }
}
