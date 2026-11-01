import SwiftUI
import WebKit
import AVFoundation
import Observation

/// Payload sent from `MovingWorldBook/index.html` via `window.webkit.messageHandlers.kymPhysicsBridge.postMessage(...)`
/// whenever Kym completes a `:::predict`, `:::five`, `:::recall`, `:::try`, or saves a 3D widget state.
struct MovingWorldBridgeEvent: Codable, Sendable {
    let kind: String          // "predict", "five", "recall", "try", "widget_snapshot", "chapter_change"
    let chapter: Int?
    let widgetId: String?
    let prompt: String?
    let responseText: String?
    let payloadJSON: String?
}

/// Bidirectional JavaScript ↔ Swift bridge for `MovingWorldBook/index.html`.
/// Injects a `WKUserScript` that hooks `localStorage.setItem` and custom interactive card events
/// inside `index.html`, forwarding them to `AppStore` (`DatabaseManager`).
final class MovingWorldBridgeController: NSObject, WKScriptMessageHandler {
    static let handlerName = "kymPhysicsBridge"
    weak var store: AppStore?
    var onBridgeEvent: ((MovingWorldBridgeEvent) -> Void)?

    init(store: AppStore? = nil, onBridgeEvent: ((MovingWorldBridgeEvent) -> Void)? = nil) {
        self.store = store
        self.onBridgeEvent = onBridgeEvent
        super.init()
    }

    static var injectedUserScript: WKUserScript {
        let js = """
        (function() {
            if (window.__kymPhysicsBridgeInstalled) return;
            window.__kymPhysicsBridgeInstalled = true;

            function postToNative(payload) {
                try {
                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.kymPhysicsBridge) {
                        window.webkit.messageHandlers.kymPhysicsBridge.postMessage(payload);
                    }
                } catch (e) {}
            }

            window.kymPhysicsNotify = postToNative;

            // Intercept localStorage writes from index.html (predictions, recalls, five-year-old explainers, widget states)
            const origSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) {
                origSetItem.apply(this, arguments);
                postToNative({
                    kind: "storage_sync",
                    key: String(key || ""),
                    value: String(value || ""),
                    hash: String(window.location.hash || "")
                });
            };

            // Listen for textarea / input blur inside :::predict, :::five, :::recall blocks
            document.addEventListener('change', function(ev) {
                const el = ev.target;
                if (!el) return;
                if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                    const card = el.closest('[data-block-kind], .predict-box, .five-box, .recall-box, .try-box, section');
                    const text = (el.value || '').trim();
                    if (text.length > 2) {
                        postToNative({
                            kind: card ? (card.getAttribute('data-block-kind') || card.className || 'interactive_note') : 'interactive_note',
                            responseText: text,
                            hash: String(window.location.hash || "")
                        });
                    }
                }
            }, true);

            window.addEventListener('hashchange', function() {
                postToNative({
                    kind: "hash_change",
                    hash: String(window.location.hash || "")
                });
            });
        })();
        """
        return WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let dict = message.body as? [String: Any] else { return }
        let kind = (dict["kind"] as? String) ?? "unknown"
        let responseText = (dict["responseText"] as? String) ?? (dict["value"] as? String)
        let key = (dict["key"] as? String) ?? ""
        let hash = (dict["hash"] as? String) ?? ""

        var chapterNum: Int?
        if let ch = dict["chapter"] as? Int {
            chapterNum = ch
        } else if hash.hasPrefix("#c"), let parsed = Int(hash.dropFirst(2).prefix(while: { $0.isNumber })) {
            chapterNum = parsed
        }

        let event = MovingWorldBridgeEvent(
            kind: kind,
            chapter: chapterNum,
            widgetId: key.isEmpty ? nil : key,
            prompt: key,
            responseText: responseText,
            payloadJSON: nil
        )

        Task { @MainActor in
            onBridgeEvent?(event)
            guard let store else { return }
            if let ch = chapterNum {
                store.updateChapterProgress(chapterNumber: ch, fraction: 0.4, addPrediction: kind.contains("predict"))
            }
            if let text = responseText,
               text.count >= 6,
               (kind.contains("predict") || kind.contains("five") || kind.contains("recall") || key.contains("predict") || key.contains("five")) {
                let now = Date()
                let entry = LabJournalEntryRecord(
                    id: "bridge-\(Int(now.timeIntervalSince1970))-\(UUID().uuidString.prefix(4))",
                    title: "Moving World Interactive Note (\(key.isEmpty ? kind : key))",
                    templateKind: "cornell",
                    paperStyle: "lined",
                    linkedTopicCode: nil,
                    linkedChapterNumber: chapterNum ?? store.activeMovingWorldChapter,
                    linkedWidgetId: nil,
                    cueColumnText: "Interactive prompt: \(key.isEmpty ? kind : key)",
                    bodyNotesText: text,
                    summaryText: "Synced automatically from The Moving World interactive book via MovingWorldBridgeController.",
                    hypothesisText: "",
                    independentVarText: "",
                    dependentVarText: "",
                    controlVarsText: "",
                    drawingData: nil,
                    snapshotPNGData: nil,
                    createdAt: now,
                    updatedAt: now
                )
                store.saveJournalEntry(entry)
            }
        }
    }
}

/// Walk-and-listen neural audio explainer (`AVSpeechSynthesizer`) for all 16 chapters of
/// *The Moving World* and Cambridge Science 8 Units 3, 6, and 9.
@MainActor
@Observable
final class ChapterExplainerPlayer: NSObject, AVSpeechSynthesizerDelegate {
    static let shared = ChapterExplainerPlayer()

    var isPlaying: Bool = false
    var isPaused: Bool = false
    var activeTitle: String = ""
    var activeSubtitle: String = ""
    var segments: [String] = []
    var dialogueTurns: [PhysicsTwoVoiceDialogueBuilder.DialogueTurn] = []
    var currentSegmentIndex: Int = 0
    var speechRateMultiplier: Float = 1.0 // 0.85x, 1.0x, 1.15x, 1.3x

    private let synthesizer = AVSpeechSynthesizer()

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    func playChapter(_ chapter: MovingWorldChapter) {
        activeTitle = "Ch \(chapter.number) · \(chapter.title)"
        activeSubtitle = chapter.subtitle
        dialogueTurns = []
        var items: [String] = [
            "Chapter \(chapter.number): \(chapter.title). \(chapter.subtitle).",
            chapter.HeroSummaryOrFallback
        ]
        for sec in chapter.sections {
            items.append("\(sec.heading). \(sec.excerpt)")
        }
        items.append("Key intuition: Always ask what physical quantity is conserved, what force or field causes the change, and how a cut-away particle or vector diagram makes the invisible mechanism visible.")
        segments = items
        currentSegmentIndex = 0
        speakCurrentSegment()
    }

    func playTwoVoiceDialogue(for chapter: MovingWorldChapter) {
        let turns = PhysicsTwoVoiceDialogueBuilder.buildDialogue(for: chapter)
        guard !turns.isEmpty else { return }
        activeTitle = "2-Voice Briefing · Ch \(chapter.number) \(chapter.title)"
        activeSubtitle = "Host (Dr. Rao) & Study Partner (Aarav)"
        dialogueTurns = turns
        segments = turns.map { "[\($0.speaker)] \($0.text)" }
        currentSegmentIndex = 0
        speakCurrentSegment()
    }

    func playCustomSegments(title: String, subtitle: String, segments: [String]) {
        guard !segments.isEmpty else { return }
        self.activeTitle = title
        self.activeSubtitle = subtitle
        self.dialogueTurns = []
        self.segments = segments
        self.currentSegmentIndex = 0
        speakCurrentSegment()
    }

    func togglePlayPause() {
        if synthesizer.isSpeaking {
            if isPaused {
                synthesizer.continueSpeaking()
                isPaused = false
                isPlaying = true
            } else {
                synthesizer.pauseSpeaking(at: .word)
                isPaused = true
                isPlaying = false
            }
        } else if !segments.isEmpty {
            speakCurrentSegment()
        }
    }

    func stepForward() {
        guard currentSegmentIndex + 1 < segments.count else { return }
        synthesizer.stopSpeaking(at: .immediate)
        currentSegmentIndex += 1
        speakCurrentSegment()
    }

    func stepBackward() {
        guard currentSegmentIndex > 0 else { return }
        synthesizer.stopSpeaking(at: .immediate)
        currentSegmentIndex -= 1
        speakCurrentSegment()
    }

    func cycleSpeed() {
        let rates: [Float] = [0.85, 1.0, 1.15, 1.3]
        if let idx = rates.firstIndex(of: speechRateMultiplier) {
            speechRateMultiplier = rates[(idx + 1) % rates.count]
        } else {
            speechRateMultiplier = 1.0
        }
        if isPlaying {
            synthesizer.stopSpeaking(at: .immediate)
            speakCurrentSegment()
        }
    }

    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        isPlaying = false
        isPaused = false
        segments = []
        currentSegmentIndex = 0
    }

    private func speakCurrentSegment() {
        guard currentSegmentIndex >= 0 && currentSegmentIndex < segments.count else {
            isPlaying = false
            isPaused = false
            return
        }
        if currentSegmentIndex < dialogueTurns.count {
            let turn = dialogueTurns[currentSegmentIndex]
            let utterance = AVSpeechUtterance(string: turn.text)
            utterance.voice = AVSpeechSynthesisVoice(language: turn.voiceLanguage)
                ?? AVSpeechSynthesisVoice(language: "en-GB")
                ?? AVSpeechSynthesisVoice(language: "en-IN")
            utterance.rate = AVSpeechUtteranceDefaultSpeechRate * speechRateMultiplier
            utterance.pitchMultiplier = turn.pitchMultiplier
            isPlaying = true
            isPaused = false
            synthesizer.speak(utterance)
            return
        }
        let text = segments[currentSegmentIndex]
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-GB") ?? AVSpeechSynthesisVoice(language: "en-IN")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * speechRateMultiplier
        utterance.pitchMultiplier = 1.02
        isPlaying = true
        isPaused = false
        synthesizer.speak(utterance)
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor in
            if self.currentSegmentIndex + 1 < self.segments.count && self.isPlaying {
                self.currentSegmentIndex += 1
                self.speakCurrentSegment()
            } else {
                self.isPlaying = false
                self.isPaused = false
            }
        }
    }
}

private extension MovingWorldChapter {
    var HeroSummaryOrFallback: String {
        if !hookSummary.isEmpty {
            return hookSummary
        }
        return "Explore the interactive visual models, historical stories, and quantitative laws in Chapter \(number)."
    }
}

/// Floating Walk-and-Listen Audio Explainer bar displayed when `ChapterExplainerPlayer.shared` has active segments.
struct ChapterExplainerMiniBar: View {
    @Bindable var player = ChapterExplainerPlayer.shared

    var body: some View {
        if !player.segments.isEmpty {
            VStack(alignment: .leading, spacing: Spacing.xs) {
                HStack(spacing: Spacing.sm) {
                    Image(systemName: player.isPlaying ? "waveform.circle.fill" : "headphones.circle.fill")
                        .font(.title2)
                        .foregroundStyle(Color.kymaiaAccent)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(player.activeTitle)
                            .font(.kymaiaCaption.weight(.bold))
                            .foregroundStyle(Color.kymaiaTextPrimary)
                        Text(player.segments[min(player.currentSegmentIndex, max(0, player.segments.count - 1))])
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                            .lineLimit(2)
                    }

                    Spacer()

                    Button {
                        player.stepBackward()
                    } label: {
                        Image(systemName: "backward.fill")
                            .font(.caption.weight(.bold))
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .disabled(player.currentSegmentIndex == 0)

                    Button {
                        player.togglePlayPause()
                    } label: {
                        Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                            .font(.caption.weight(.bold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.kymaiaAccent)
                    .controlSize(.small)

                    Button {
                        player.stepForward()
                    } label: {
                        Image(systemName: "forward.fill")
                            .font(.caption.weight(.bold))
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .disabled(player.currentSegmentIndex + 1 >= player.segments.count)

                    Button {
                        player.cycleSpeed()
                    } label: {
                        Text(String(format: "%.2gx", player.speechRateMultiplier))
                            .font(.kymaiaMonoCaption)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)

                    Button {
                        player.stop()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(Color.kymaiaTextSecondary)
                }

                ProgressView(
                    value: Double(player.currentSegmentIndex + 1),
                    total: Double(max(1, player.segments.count))
                )
                .tint(Color.kymaiaAccent)
            }
            .padding(Spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                    .fill(Color.kymaiaSurfaceElevated)
                    .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
            )
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                    .strokeBorder(Color.kymaiaAccent.opacity(0.35), lineWidth: 1)
            )
        }
    }
}
