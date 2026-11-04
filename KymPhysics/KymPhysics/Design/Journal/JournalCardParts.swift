import SwiftUI

/// The small rounded square or capsule badge that marks a subject, status, or kind of work.
struct JournalBadge: View {
    enum Size {
        case small
        case row
    }

    enum Tone: Equatable, Sendable {
        case accent
        case neutral
        case positive
        case warning
        case muted
        case success
    }

    let symbol: String
    let tint: Color
    var size: Size = .small
    var textLabel: String? = nil
    var textTone: Tone? = nil

    @ScaledMetric(relativeTo: .subheadline) private var smallSide: CGFloat = 18
    @ScaledMetric(relativeTo: .body) private var rowSide: CGFloat = 26

    init(symbol: String, tint: Color, size: Size = .small) {
        self.symbol = symbol
        self.tint = tint
        self.size = size
        self.textLabel = nil
        self.textTone = nil
    }

    init(text: String, tone: Tone = .accent) {
        self.symbol = "circle.fill"
        self.tint = .kymaiaPrimary
        self.size = .small
        self.textLabel = text
        self.textTone = tone
    }

    var body: some View {
        if let textLabel {
            let resolvedTone: JournalChip.Tone = {
                switch textTone ?? .accent {
                case .accent: return .accent
                case .neutral, .muted: return .muted
                case .positive, .success: return .success
                case .warning: return .warn
                }
            }()
            JournalChip(text: textLabel, tone: resolvedTone)
        } else {
            let side = size == .small ? smallSide : rowSide
            RoundedRectangle(cornerRadius: size == .small ? CornerRadius.micro + 1 : CornerRadius.small - 1, style: .continuous)
                .fill(tint)
                .frame(width: side, height: side)
                .overlay {
                    Image(systemName: symbol)
                        .resizable()
                        .scaledToFit()
                        .fontWeight(size == .small ? .bold : .semibold)
                        .foregroundStyle(Color.kymaiaTileInk)
                        .padding(side * (size == .small ? 0.22 : 0.24))
                }
                .accessibilityHidden(true)
        }
    }
}

/// The line above a small card's title: a badge and what the card is.
struct JournalEyebrow: View {
    let symbol: String
    let tint: Color
    let text: String

    var body: some View {
        HStack(spacing: Spacing.xs + 2) {
            JournalBadge(symbol: symbol, tint: tint)
            Text(text)
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(Color.kymaiaMutedInk)
        }
    }
}

/// A card's quiet last row: a hairline, the badge, where it comes from, and a "more" menu.
struct JournalCardFooter<MenuItems: View>: View {
    let symbol: String
    let tint: Color
    let text: String
    let menuLabel: String
    let menuIdentifier: String
    @ViewBuilder let menu: MenuItems

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Rectangle()
                .fill(Color.kymaiaHairline)
                .frame(height: StrokeWidth.thin)
                .accessibilityHidden(true)
            HStack(spacing: Spacing.sm) {
                JournalBadge(symbol: symbol, tint: tint)
                Text(text)
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaTertiaryInk)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: Spacing.sm)
                Menu {
                    menu
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.kymaiaCaption.weight(.bold))
                        .foregroundStyle(Color.kymaiaTertiaryInk)
                        .frame(width: Theme.Dimension.minimumTarget, height: Theme.Dimension.minimumTarget)
                        .contentShape(Rectangle())
                }
                .menuIndicator(.hidden)
                .buttonStyle(.plain)
                .padding(.vertical, -Spacing.sm)
                .padding(.trailing, -Spacing.sm)
                .accessibilityLabel(menuLabel)
                .accessibilityIdentifier(menuIdentifier)
            }
        }
    }
}

/// A small tinted capsule: a time estimate, filter pill, or fact about the work.
struct JournalChip: View {
    enum Tone: Equatable, Sendable {
        case accent
        case muted
        case success
        case warn

        static var good: Tone { .success }
        static var positive: Tone { .success }
        static var neutral: Tone { .muted }
    }

    let text: String
    var tone: Tone = .accent

    init(text: String, tone: Tone = .accent) {
        self.text = text
        self.tone = tone
    }

    var body: some View {
        Text(text)
            .font(.kymaiaCaption.weight(.semibold))
            .foregroundStyle(foreground)
            .padding(.horizontal, Spacing.sm + 1)
            .padding(.vertical, Spacing.xs)
            .background(fill, in: Capsule())
    }

    private var foreground: Color {
        switch tone {
        case .accent: return Color.kymaiaPrimaryStrong
        case .muted: return Color.kymaiaMutedInk
        case .success: return Color.kymaiaSuccess
        case .warn: return Color.kymaiaWarning
        }
    }

    private var fill: Color {
        switch tone {
        case .accent: return Color.kymaiaSelectionFill
        case .muted: return Color.kymaiaControlFill
        case .success: return Color.kymaiaSuccess.opacity(0.14)
        case .warn: return Color.kymaiaWarning.opacity(0.16)
        }
    }
}

/// A card's primary or secondary action: an accent, tinted, or ghost capsule, at least 44 points tall.
struct JournalCapsuleButtonStyle: ButtonStyle {
    enum Prominence: Equatable, Sendable {
        case filled
        case tinted
        case ghost
    }

    enum Size: Equatable, Sendable {
        case regular
        case small
    }

    var prominence: Prominence = .filled
    var size: Size = .regular

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(size == .small ? .kymaiaCaption.weight(.semibold) : .kymaiaControlLabel)
            .foregroundStyle(foregroundStyle)
            .padding(.horizontal, size == .small ? Spacing.md - 2 : Spacing.md + 2)
            .padding(.vertical, size == .small ? Spacing.xs + 2 : Spacing.sm)
            .frame(minHeight: Theme.Dimension.minimumTarget)
            .background(backgroundFill(isPressed: configuration.isPressed), in: Capsule())
            .overlay(
                Capsule()
                    .strokeBorder(borderColor, lineWidth: prominence == .ghost ? 1 : 0)
            )
            .contentShape(Capsule())
            .kymaiaPointerHighlight(Capsule())
    }

    private var foregroundStyle: Color {
        switch prominence {
        case .filled: return Color.kymaiaBackground
        case .tinted: return Color.kymaiaPrimaryStrong
        case .ghost: return Color.kymaiaInk
        }
    }

    private func backgroundFill(isPressed: Bool) -> Color {
        let base: Color = {
            switch prominence {
            case .filled: return Color.kymaiaPrimary
            case .tinted: return Color.kymaiaSelectionFill
            case .ghost: return Color.kymaiaSurface
            }
        }()
        return isPressed ? base.opacity(0.75) : base
    }

    private var borderColor: Color {
        prominence == .ghost ? Color.kymaiaControlBorder : .clear
    }
}
