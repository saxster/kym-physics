import AVFoundation
import SwiftUI

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
        .system(.title2, design: KymaiaThemeRuntime.current.style.headingFace.design).weight(.bold)
    }
    public static var kymaiaTitle3: Font {
        .system(.title3, design: KymaiaThemeRuntime.current.style.headingFace.design).weight(.semibold)
    }
    public static var kymaiaCaption2: Font { .caption2 }
    public static var kymaiaMonospaced: Font { .system(.callout, design: .monospaced) }
    public static var kymaiaMonoBody: Font { .system(.body, design: .monospaced) }
}

extension StrokeWidth {
    public static let thin: CGFloat = 0.5
    public static let hairline: CGFloat = 0.25
    public static let standard: CGFloat = 1.0
    public static let emphasis: CGFloat = 2.0
}

// MARK: - Journal Component Convenience Extensions

extension JournalReaderPage {
    /// A reader page that opens with a `RoomHeader`: the subtitle and the page's controls sit
    /// above the reading column.
    init<HeaderAccessory: View, Inner: View>(
        eyebrow: String? = nil,
        title: String,
        subtitle: String? = nil,
        @ViewBuilder headerAccessory: () -> HeaderAccessory,
        @ViewBuilder content: () -> Inner
    ) where Content == RoomPageContent<HeaderAccessory, Inner> {
        let header = RoomHeader(eyebrow: eyebrow, title: title, subtitle: subtitle, accessory: headerAccessory)
        let inner = content()
        self.init(title: title) { RoomPageContent(header: header, content: inner) }
    }
}

extension JournalFocusPage where Actions == EmptyView {
    /// A focus page whose card opens with the subtitle and the page's controls. `close` runs from
    /// the toolbar's close button.
    init<HeaderAccessory: View, Inner: View>(
        title: String,
        subtitle: String? = nil,
        close: @escaping () -> Void,
        @ViewBuilder headerAccessory: () -> HeaderAccessory,
        @ViewBuilder content: () -> Inner
    ) where Content == RoomPageContent<HeaderAccessory, Inner> {
        let header = RoomHeader(eyebrow: nil, title: title, subtitle: subtitle, accessory: headerAccessory)
        let inner = content()
        self.init(title: title, close: close) { RoomPageContent(header: header, content: inner) }
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


// MARK: - SmartyMe-Style Synchronized Read & Listen Chapter Audio Narrator

@MainActor
@Observable
final class ChapterAudioNarrator {
    private let synthesizer = AVSpeechSynthesizer()
    private let allowsHardwareSpeech: Bool
    var isSpeaking: Bool = false
    var activeChapterId: String? = nil
    var activeBeatIndex: Int = 0
    var speechRateMultiplier: Float = 1.0

    init(allowsHardwareSpeech: Bool = true) {
        self.allowsHardwareSpeech = allowsHardwareSpeech
    }

    var speedLabel: String {
        if abs(speechRateMultiplier - 1.0) < 0.05 { return "1.0×" }
        if abs(speechRateMultiplier - 1.25) < 0.05 { return "1.25×" }
        return "1.5×"
    }

    func cycleRate() {
        if abs(speechRateMultiplier - 1.0) < 0.05 {
            speechRateMultiplier = 1.25
        } else if abs(speechRateMultiplier - 1.25) < 0.05 {
            speechRateMultiplier = 1.5
        } else {
            speechRateMultiplier = 1.0
        }
    }

    func narrateChapter(_ chapter: MovingWorldChapter, fromSection index: Int = 0) {
        if isSpeaking && activeChapterId == chapter.id {
            stop()
            return
        }
        synthesizer.stopSpeaking(at: .immediate)
        activeChapterId = chapter.id
        activeBeatIndex = index
        isSpeaking = true

        guard allowsHardwareSpeech else { return }

        var scriptParts: [String] = []
        if index == 0 {
            scriptParts.append("Chapter \(chapter.number): \(chapter.title). \(chapter.subtitle).")
            if !chapter.hookSummary.isEmpty {
                scriptParts.append(chapter.hookSummary)
            }
        }
        for section in chapter.sections.dropFirst(max(0, index)) {
            scriptParts.append("\(section.heading). \(section.excerpt)")
        }
        scriptParts.append("Formula invariant: \(chapter.intuitionToFormula.ahaInvariant)")

        speakText(scriptParts.joined(separator: " "))
    }

    func narrateBeat(_ beat: PhysicsChapterBeat, chapterId: String) {
        if isSpeaking && activeChapterId == chapterId && activeBeatIndex == beat.index {
            stop()
            return
        }
        synthesizer.stopSpeaking(at: .immediate)
        activeChapterId = chapterId
        activeBeatIndex = beat.index
        isSpeaking = true

        guard allowsHardwareSpeech else { return }
        speakText(beat.spokenScript)
    }

    func stop() {
        KymLiveStaticTextNarrator.shared.stop()
        if allowsHardwareSpeech {
            synthesizer.stopSpeaking(at: .immediate)
        }
        isSpeaking = false
    }

    private func speakText(_ text: String) {
        if KymLiveStaticTextNarrator.shared.hasElevenLabsKeyConfigured {
            KymLiveStaticTextNarrator.shared.readAloud(
                text: text,
                itemID: activeChapterId,
                rate: speechRateMultiplier,
                allowsHardwareSpeech: allowsHardwareSpeech
            ) { [weak self] in
                self?.isSpeaking = false
            }
            return
        }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-GB")
            ?? AVSpeechSynthesisVoice(language: "en-IN")
            ?? AVSpeechSynthesisVoice(language: "en-US")
        let baseRate = AVSpeechUtteranceDefaultSpeechRate * 0.95
        utterance.rate = min(AVSpeechUtteranceMaximumSpeechRate, baseRate * speechRateMultiplier)
        utterance.pitchMultiplier = 1.0
        synthesizer.speak(utterance)
    }
}

// MARK: - Brilliant-Style Visual Intuition → "Aha!" Invariant → Symbolic Formula Bridge Card

struct PhysicsIntuitionFormulaBridgeCard: View {
    let bridge: PhysicsIntuitionFormulaBridge
    @State private var selectedTermSymbol: String? = nil
    @State private var showPerturbationAnswer: Bool = false

    private func termColor(for role: String) -> Color {
        switch role {
        case "accent": return .kymaiaPrimary
        case "success": return .kymaiaSuccess
        case "warning": return .kymaiaWarning
        case "secondary": return .kymaiaSecondary
        default: return .kymaiaPrimary
        }
    }

    var body: some View {
        let activeTerm = bridge.termMappings.first(where: { $0.symbol == selectedTermSymbol }) ?? bridge.termMappings.first

        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(spacing: Spacing.xs) {
                    JournalBadge(text: "Visual Intuition → Formula Bridge", tone: .accent)
                    Spacer()
                    JournalBadge(text: bridge.atlasFigureRef, tone: .neutral)
                }

                // 3-step Concrete Action -> Aha Invariant -> Symbolic Formula
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    HStack(alignment: .top, spacing: Spacing.sm) {
                        JournalBadge(text: "1. Concrete Action", tone: .accent)
                        Text(bridge.concreteAction)
                            .font(.kymaiaCallout)
                            .foregroundStyle(Color.kymaiaInk)
                    }

                    HStack(alignment: .top, spacing: Spacing.sm) {
                        JournalBadge(text: "2. 'Aha!' Invariant", tone: .success)
                        Text(bridge.ahaInvariant)
                            .font(.kymaiaCallout.weight(.medium))
                            .foregroundStyle(Color.kymaiaInk)
                    }

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        JournalBadge(text: "3. Symbolic Law (Tap any term chip to perturb)", tone: .warning)
                        Text(bridge.formulaDisplay)
                            .font(.kymaiaMonoBody.weight(.bold))
                            .foregroundStyle(Color.kymaiaPrimary)
                            .padding(.vertical, Spacing.xs)
                            .padding(.horizontal, Spacing.md)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                                    .fill(Color.kymaiaControlFill)
                            )
                    }
                }

                if !bridge.termMappings.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            ForEach(bridge.termMappings) { mapping in
                                let isSelected = activeTerm?.symbol == mapping.symbol
                                Button {
                                    selectedTermSymbol = mapping.symbol
                                    showPerturbationAnswer = false
                                } label: {
                                    HStack(spacing: Spacing.xxs) {
                                        Circle()
                                            .fill(termColor(for: mapping.colorRole))
                                            .frame(width: 8, height: 8)
                                        Text(mapping.symbol)
                                            .font(.kymaiaMonospaced.weight(.bold))
                                        Text("· \(mapping.visualPart)")
                                            .font(.kymaiaCaption)
                                    }
                                }
                                .buttonStyle(JournalFilterChipStyle(isSelected: isSelected))
                            }
                        }
                    }
                }

                if let term = activeTerm {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        HStack(spacing: Spacing.xs) {
                            Text(term.symbol)
                                .font(.kymaiaMonoBody.weight(.bold))
                                .foregroundStyle(termColor(for: term.colorRole))
                            Text("→ \(term.visualPart)")
                                .font(.kymaiaSubheadline.weight(.semibold))
                                .foregroundStyle(Color.kymaiaInk)
                        }
                        Text(term.meaning)
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaMutedInk)

                        Divider()

                        Text(bridge.perturbationPrompt(for: term))
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaInk)

                        if showPerturbationAnswer {
                            Text(bridge.perturbationExplanation(for: term))
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaSuccess)
                        } else {
                            Button {
                                showPerturbationAnswer = true
                            } label: {
                                Label("Check Perturbation Scaling", systemImage: "slider.horizontal.3")
                            }
                            .buttonStyle(SessionGhostButtonStyle())
                        }
                    }
                    .padding(Spacing.sm)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                            .fill(Color.kymaiaControlFill.opacity(0.6))
                    )
                }
            }
        }
    }
}

// MARK: - Brilliant-Style Interactive Physics Manipulative Sandbox Card

struct PhysicsManipulativeSandboxCard: View {
    let spec: PhysicsManipulativeSpec
    var onStampLaw: ((String) -> Void)? = nil

    @State private var state: PhysicsManipulativeState

    init(spec: PhysicsManipulativeSpec, onStampLaw: ((String) -> Void)? = nil) {
        self.spec = spec
        self.onStampLaw = onStampLaw
        self._state = State(
            initialValue: PhysicsManipulativeState(
                primaryValue: spec.defaultPrimary,
                secondaryValue: spec.defaultSecondary,
                ironCoreInserted: true
            )
        )
    }

    var body: some View {
        let summary = PhysicsManipulativeEngine.liveSummary(spec: spec, state: state)

        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(spacing: Spacing.xs) {
                Label(spec.title, systemImage: "slider.horizontal.below.square.and.square.filled")
                    .font(.kymaiaSubheadline.weight(.semibold))
                    .foregroundStyle(Color.kymaiaPrimary)
                Spacer()
                JournalBadge(text: spec.kind.rawValue, tone: .accent)
            }

            Text(spec.instruction)
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)

            VStack(alignment: .leading, spacing: Spacing.xs) {
                HStack {
                    Text(spec.primaryLabel)
                        .font(.kymaiaCaption.weight(.semibold))
                    Spacer()
                    Text(String(format: "%.1f", state.primaryValue))
                        .font(.kymaiaMonospaced.weight(.bold))
                        .foregroundStyle(Color.kymaiaPrimary)
                        .monospacedDigit()
                }
                Slider(
                    value: $state.primaryValue,
                    in: spec.primaryRange,
                    step: spec.primaryStep
                )
            }

            VStack(alignment: .leading, spacing: Spacing.xs) {
                HStack {
                    Text(spec.secondaryLabel)
                        .font(.kymaiaCaption.weight(.semibold))
                    Spacer()
                    Text(String(format: "%.2f", state.secondaryValue))
                        .font(.kymaiaMonospaced.weight(.bold))
                        .foregroundStyle(Color.kymaiaSecondary)
                        .monospacedDigit()
                }
                Slider(
                    value: $state.secondaryValue,
                    in: spec.secondaryRange,
                    step: spec.secondaryStep
                )
            }

            if spec.kind == .electromagnetSolenoidField {
                Toggle(isOn: $state.ironCoreInserted) {
                    Text("Insert Soft-Iron Core (concentrates magnetic flux & demagnetises cleanly)")
                        .font(.kymaiaCaption.weight(.medium))
                }
            }

            // Live Physical Equation Readout
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text(summary)
                    .font(.kymaiaMonospaced)
                    .foregroundStyle(Color.kymaiaInk)
                    .monospacedDigit()
                Text("Invariant: \(spec.targetInvariantHint)")
                    .font(.kymaiaCaption2)
                    .foregroundStyle(Color.kymaiaSuccess)
            }
            .padding(Spacing.sm)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                    .fill(Color.kymaiaSurface)
            )

            if let onStampLaw {
                HStack(spacing: Spacing.sm) {
                    Button {
                        onStampLaw(summary)
                    } label: {
                        Label("Stamp Live Readout into Working", systemImage: "doc.on.clipboard")
                    }
                    .buttonStyle(SessionGhostButtonStyle())

                    Button("Reset Defaults") {
                        state = PhysicsManipulativeState(
                            primaryValue: spec.defaultPrimary,
                            secondaryValue: spec.defaultSecondary,
                            ironCoreInserted: true
                        )
                    }
                    .buttonStyle(SessionGhostButtonStyle())
                }
            }
        }
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                .fill(Color.kymaiaControlFill.opacity(0.65))
        )
    }
}

// MARK: - SmartyMe & Brilliant Peer Misconception Debate Card ("Who Is Right & Why?")

struct PhysicsDebateCardView: View {
    let scenario: PhysicsDebateScenario
    var onResolvedCorrectly: (() -> Void)? = nil

    @State private var selectedChoiceId: String? = nil
    @State private var evaluation: PhysicsDebateEvaluation? = nil

    var body: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack(spacing: Spacing.xs) {
                    JournalBadge(text: "Who Is Right & Why?", tone: .warning)
                    JournalBadge(text: "Ch \(scenario.chapterNumber) · Unit \(scenario.schoolUnitNumber)", tone: .neutral)
                    Spacer()
                    if evaluation?.isCorrect == true {
                        JournalBadge(text: "Misconception Defused", tone: .success)
                    }
                }

                Text(scenario.title)
                    .font(.kymaiaTitle3)
                    .foregroundStyle(Color.kymaiaInk)

                Text(scenario.contextPrompt)
                    .font(.kymaiaCallout)
                    .foregroundStyle(Color.kymaiaMutedInk)

                // Two-Speaker Competing Claims
                HStack(alignment: .top, spacing: Spacing.sm) {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Label(scenario.speakerAName, systemImage: "person.wave.2.fill")
                            .font(.kymaiaCaption.weight(.bold))
                            .foregroundStyle(Color.kymaiaPrimary)
                        Text("\"\(scenario.speakerAClaim)\"")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaInk)
                    }
                    .padding(Spacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                            .fill(Color.kymaiaControlFill)
                    )

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Label(scenario.speakerBName, systemImage: "person.crop.circle.badge.checkmark")
                            .font(.kymaiaCaption.weight(.bold))
                            .foregroundStyle(Color.kymaiaSecondary)
                        Text("\"\(scenario.speakerBClaim)\"")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaInk)
                    }
                    .padding(Spacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                            .fill(Color.kymaiaControlFill)
                    )
                }

                VStack(alignment: .leading, spacing: Spacing.xs) {
                    ForEach(scenario.choices) { choice in
                        let isSelected = selectedChoiceId == choice.id
                        Button {
                            selectedChoiceId = choice.id
                            let result = PhysicsDebateEngine.evaluate(choiceId: choice.id, in: scenario)
                            evaluation = result
                            if result.isCorrect {
                                onResolvedCorrectly?()
                            }
                        } label: {
                            HStack(alignment: .top, spacing: Spacing.xs) {
                                Image(
                                    systemName: isSelected
                                        ? (choice.isCorrect ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                                        : "circle"
                                )
                                Text(choice.label)
                                    .font(.kymaiaCaption.weight(.medium))
                                    .multilineTextAlignment(.leading)
                                Spacer()
                            }
                        }
                        .buttonStyle(KymaiaOptionButtonStyle(isSelected: isSelected, isCorrect: isSelected ? choice.isCorrect : nil))
                    }
                }

                if let evaluation {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Label(
                            evaluation.isCorrect ? "Physical Reasoning Verified" : "Socratic Rebuttal — Look Closer",
                            systemImage: evaluation.isCorrect ? "checkmark.seal.fill" : "lightbulb.fill"
                        )
                        .font(.kymaiaCaption.weight(.bold))
                        .foregroundStyle(evaluation.isCorrect ? Color.kymaiaSuccess : Color.kymaiaWarning)

                        Text(evaluation.feedback)
                            .font(.kymaiaCallout)
                            .foregroundStyle(Color.kymaiaInk)

                        if evaluation.isCorrect {
                            Text("Invariant Takeaway: \(evaluation.invariantTakeaway)")
                                .font(.kymaiaCaption.weight(.semibold))
                                .foregroundStyle(Color.kymaiaPrimary)
                        }
                    }
                    .padding(Spacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                            .fill((evaluation.isCorrect ? Color.kymaiaSuccess : Color.kymaiaWarning).opacity(0.12))
                    )
                }
            }
        }
    }
}

// MARK: - Brilliant-Style Buggy-Rule Trap Diagnostic Banner

struct PhysicsBuggyRuleTrapBanner: View {
    let trap: PhysicsBuggyRuleTrap

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack(spacing: Spacing.xs) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(Color.kymaiaWarning)
                Text("Buggy-Rule Trap Caught: \(trap.trapName)")
                    .font(.kymaiaSubheadline.weight(.bold))
                    .foregroundStyle(Color.kymaiaWarning)
            }
            Text(trap.diagnosticWhy)
                .font(.kymaiaCallout)
                .foregroundStyle(Color.kymaiaInk)
            Text("Visual Fix: \(trap.visualFixNudge)")
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(Color.kymaiaPrimary)
        }
        .padding(Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous)
                .fill(Color.kymaiaWarning.opacity(0.14))
        )
    }
}

// MARK: - Physics & SI Unit Quick-Insert Symbol Ribbon

struct PhysicsSymbolRibbon: View {
    @Binding var text: String

    private let symbols: [String] = [
        "×", "÷", "=", "²", "³", "Δ", "°", "Ω", "λ", "ρ", "⇒",
        "m/s", "m/s²", "N", "N·m", "Pa", "kPa", "J", "kJ", "W", "A", "V", "Hz", "g/cm³"
    ]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.xxs) {
                ForEach(symbols, id: \.self) { sym in
                    Button {
                        if text.isEmpty || text.hasSuffix(" ") {
                            text += sym
                        } else if sym.count > 1 && sym.first?.isLetter == true {
                            text += " " + sym
                        } else {
                            text += sym
                        }
                    } label: {
                        Text(sym)
                            .font(.kymaiaMonospaced.weight(.semibold))
                            .padding(.horizontal, Spacing.xs)
                            .padding(.vertical, 4)
                            .background(
                                Capsule()
                                    .fill(Color.kymaiaControlFill)
                            )
                            .foregroundStyle(Color.kymaiaInk)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}
