import SwiftUI

// MARK: - Corner radii (the one scale)
public enum CornerRadius {
    public static let micro: CGFloat = 4
    public static let small: CGFloat = 8
    public static let medium: CGFloat = 14
    public static let large: CGFloat = 18
    public static let extraLarge: CGFloat = 26
    /// Short aliases
    public static let sm: CGFloat = small
    public static let md: CGFloat = medium
    public static let lg: CGFloat = large
    /// Every card's corner: set by the chosen theme.
    public static var card: CGFloat { CuratedColorScheme.current.style.cardRadius }
}

// MARK: - Accessibility Layout Constants
public enum AccessibilityLayout {
    public static let minTouchTarget: CGFloat = 44
}

extension Spacing {
    public static let xxs: CGFloat = 2
}

// MARK: - Missing Colors
extension Color {
    public static var kymaiaTextPrimary: Color { .kymaiaInk }
    public static var kymaiaTextSecondary: Color { .kymaiaMutedInk }
    public static var kymaiaTextTertiary: Color { .kymaiaTertiaryInk }
    public static var kymaiaSurfaceElevated: Color { .kymaiaSurface }
    public static var kymaiaSurfaceBorder: Color { .kymaiaHairline }
    public static var kymaiaBorderSubtle: Color { .kymaiaHairline }
    public static var kymaiaGold: Color { .kymaiaSecondary }
    public static var kymaiaBridgeChemistry: Color { .kymaiaSecondary }

    public static var masteryLearning: Color { Color.kymaiaPrimary }
    public static let masteryNew = Color.kymaiaMutedInk
    public static var kymaiaReward: Color { Color.kymaiaSecondary }
    public static var kymaiaRewardBackground: Color { Color.kymaiaSecondary.opacity(0.14) }
    public static var statStreak: Color { Color.kymaiaPrimary }
    public static let kymaiaIdentityBackground = Color.kymaiaLive.opacity(0.12)
    public static let statMastered = Color.kymaiaSuccess
    public static var therapeuticBackground: Color { Color.kymaiaBackground }
    public static let therapeuticText = Color.kymaiaInk
    public static var kymaiaCuriosityBackground: Color { Color.kymaiaPrimary.opacity(0.12) }
    public static let statDue = Color.kymaiaError

    static func phaseColor(_ phase: RitualPhase) -> Color {
        switch phase {
        case .identityPrime:
            return Color.kymaiaLive
        case .warmRetrieval, .breakthrough:
            return Color.kymaiaPrimary
        case .struggleZone:
            return Color.kymaiaError
        case .curiosityHook:
            return Color.kymaiaSecondary
        case .reflection:
            return Color.kymaiaSuccess
        case .complete:
            return Color.kymaiaSuccess
        }
    }
}

extension Font {
    public static let kymaiaSerifBody = Font.body
    public static let kymaiaReadingBody = Font.system(.body, design: .serif)
    public static let kymaiaSubheadline = Font.subheadline
    public static let kymaiaCallout = Font.callout
    public static var kymaiaCardTitle: Font { .kymaiaHeadline }
    public static var kymaiaDisplayHero: Font { .kymaiaDisplay }
    public static var kymaiaTitle2: Font {
        .system(.title2, design: CuratedColorScheme.current.style.headingFace.design).weight(.bold)
    }
    public static var kymaiaTitle3: Font {
        .system(.title3, design: CuratedColorScheme.current.style.headingFace.design).weight(.semibold)
    }
    public static var kymaiaCaption2: Font { .caption2 }
    public static var kymaiaMonospaced: Font { .system(.callout, design: .monospaced) }
    public static var kymaiaMonoBody: Font { .system(.body, design: .monospaced) }
}

extension KymaiaMotion {
    public static let celebration = Animation.spring(response: 0.45, dampingFraction: 0.65)
}

extension Animation {
    public static let kymaiaStandard = Animation.spring(response: 0.4, dampingFraction: 0.6)
    public static let kymaiaFast = Animation.easeOut(duration: 0.2)
    public static let kymaiaQuick = Animation.easeOut(duration: 0.2)
}

extension StrokeWidth {
    public static let thin: CGFloat = 0.5
    public static let hairline: CGFloat = 0.25
    public static let standard: CGFloat = 1.0
    public static let emphasis: CGFloat = 2.0
}

// MARK: - Journal Component Convenience Extensions

extension JournalReaderPage {
    init<HeaderAccessory: View>(
        title: String,
        subtitle: String? = nil,
        @ViewBuilder headerAccessory: () -> HeaderAccessory,
        @ViewBuilder content: () -> Content
    ) {
        self.init(title: title, content: content)
    }
}

extension JournalFocusPage where Actions == EmptyView {
    init<HeaderAccessory: View>(
        title: String,
        subtitle: String? = nil,
        @ViewBuilder headerAccessory: () -> HeaderAccessory,
        @ViewBuilder content: () -> Content
    ) {
        self.init(title: title, close: {}, content: content)
    }
}

extension JournalSection {
    init(
        title: String,
        subtitle: String?,
        @ViewBuilder content: () -> Content
    ) {
        self.init(title: title, seeAllIdentifier: nil, seeAll: nil, content: content)
    }
}

extension JournalGlanceTile where Content == AnyView {
    init(
        label: String,
        value: String,
        detail: String,
        symbol: String,
        tone: Tone = .accent,
        action: @escaping () -> Void = {}
    ) {
        self.init(tone: tone, watermark: symbol, action: action) {
            AnyView(
                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(.kymaiaCaption.weight(.semibold))
                    Text(value)
                        .font(.kymaiaMetric)
                    Text(detail)
                        .font(.kymaiaCaption)
                        .opacity(0.86)
                }
            )
        }
    }
}

extension JournalEmptyState where Actions == EmptyView {
    init(symbol: String, title: String, message: String? = nil) {
        self.init(title: title, systemImage: symbol, message: message)
    }
}

extension WritingTextEditor {
    init(text: Binding<String>, placeholder: String, serif: Bool = false) {
        self.init(text: text, serif: serif)
    }
}

/// Learner-facing text input field that disables Writing Tools and autocorrection for retrieval/proof work,
/// paired with a 1-tap on-device Speech-to-Text (`SFSpeechRecognizer`) dictation button.
struct LearnerTextInput: View {
    let placeholder: String
    @Binding var text: String
    var purpose: LearnerTextInputPurpose = .retrieval

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.xs) {
            TextField(placeholder, text: $text, axis: .vertical)
                .lineLimit(2...6)
                .textFieldStyle(.roundedBorder)
                .learnerTextInput(purpose)

            VoiceDictationButton(text: $text)
        }
    }
}

#if !os(iOS)
/// Cross-platform fallback for `DocumentScannerSheet` on macOS.
struct DocumentScannerSheet: View {
    @Binding var recognizedText: String
    @Environment(\.dismiss) private var dismiss

    init(recognizedText: Binding<String>) {
        self._recognizedText = recognizedText
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Scan Learner's Book 8 / Workbook 8 Page")
                .font(.kymaiaTitle3)
            Text("On iPadOS, this opens the multi-page VisionKit Document Camera. On macOS, paste or type your page notes below:")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
            TextEditor(text: $recognizedText)
                .frame(minHeight: 160)
            HStack {
                Spacer()
                Button("Done") { dismiss() }
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding(Spacing.lg)
        .frame(minWidth: 480, minHeight: 320)
    }
}
#else
extension DocumentScannerSheet {
    init(recognizedText: Binding<String>) {
        self.init(
            onComplete: { result in
                if case .success(let url) = result {
                    recognizedText.wrappedValue = "Scanned PDF saved at \(url.lastPathComponent)"
                }
            },
            onCancel: {}
        )
    }
}
#endif

// MARK: - Missing Button & Card Styles
public struct JournalFilterChipStyle: ButtonStyle {
    public var isSelected: Bool
    public init(isSelected: Bool) {
        self.isSelected = isSelected
    }
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.kymaiaCaption.weight(.semibold))
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.xs)
            .frame(minHeight: 36)
            .contentShape(Capsule())
            .background(
                (isSelected ? Color.kymaiaPrimary : Color.kymaiaControlFill)
                    .opacity(configuration.isPressed ? 0.85 : 1.0),
                in: Capsule()
            )
            .foregroundColor(isSelected ? .kymaiaBackground : .kymaiaInk)
            .overlay(
                Capsule()
                    .strokeBorder(isSelected ? Color.clear : Color.kymaiaHairline, lineWidth: StrokeWidth.light)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
    }
}

public struct SessionGhostButtonStyle: ButtonStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.kymaiaCaption.weight(.semibold))
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.xs)
            .frame(minHeight: 36)
            .contentShape(Capsule())
            .background(Color.kymaiaControlFill.opacity(configuration.isPressed ? 0.9 : 0.65), in: Capsule())
            .foregroundColor(.kymaiaInk)
            .overlay(
                Capsule()
                    .strokeBorder(Color.kymaiaHairline, lineWidth: StrokeWidth.light)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
    }
}

public struct KymaiaSecondaryButtonStyle: ButtonStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .frame(minHeight: 44)
            .contentShape(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .background(Color.kymaiaPrimary.opacity(configuration.isPressed ? 0.18 : 0.12))
            .foregroundColor(.kymaiaPrimaryStrong)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                    .strokeBorder(Color.kymaiaControlBorder, lineWidth: StrokeWidth.light)
            )
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .kymaiaPointerHighlight(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
    }
}

public struct KymaiaOptionButtonStyle: ButtonStyle {
    var isSelected: Bool
    var isCorrect: Bool?

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .frame(minHeight: 44)
            .contentShape(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .background(isSelected ? (isCorrect == true ? Color.kymaiaSuccess : Color.kymaiaPrimary) : Color.kymaiaSurface)
            .foregroundColor(isSelected ? Color.kymaiaBackground : Color.kymaiaInk)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                    .strokeBorder(Color.kymaiaControlBorder, lineWidth: StrokeWidth.light)
            )
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .kymaiaPointerHighlight(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
    }
}

public struct KymaiaCardStyleModifier: ViewModifier {
    public func body(content: Content) -> some View {
        content
            .padding()
            .background(Color.kymaiaSurface)
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.card, style: .continuous))
            .kymaiaCardChrome(RoundedRectangle(cornerRadius: CornerRadius.card, style: .continuous))
    }
}

extension View {
    public func kymaiaCardStyle() -> some View {
        self.modifier(KymaiaCardStyleModifier())
    }
}

public struct KymaiaPrimaryButtonStyle: ButtonStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .frame(minHeight: 44)
            .contentShape(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .background(Color.kymaiaPrimary.opacity(configuration.isPressed ? 0.76 : 1))
            .foregroundColor(Color.kymaiaBackground)
            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .kymaiaPointerHighlight(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
    }
}
