import SwiftUI
import WebKit
import AVFoundation
import Observation

/// Payload sent from `MovingWorldBook/index.html` via `window.webkit.messageHandlers.kymPhysicsBridge.postMessage(...)`
/// whenever Kym completes a `:::predict`, `:::five`, `:::recall`, `:::try`, or interacts with `LiveIO`.
struct MovingWorldBridgeEvent: Codable, Sendable {
    let kind: String          // "predict", "five", "recall", "try", "live_io_stamp", "live_io_event", "chapter_change"
    let chapter: Int?
    let widgetId: String?
    let actor: String?
    let prompt: String?
    let responseText: String?
    let payloadJSON: String?
    let eventJSON: String?
    let stateJSON: String?

    init(
        kind: String,
        chapter: Int?,
        widgetId: String?,
        actor: String?,
        prompt: String?,
        responseText: String?,
        payloadJSON: String? = nil,
        eventJSON: String? = nil,
        stateJSON: String? = nil
    ) {
        self.kind = kind
        self.chapter = chapter
        self.widgetId = widgetId
        self.actor = actor
        self.prompt = prompt
        self.responseText = responseText
        self.payloadJSON = payloadJSON
        self.eventJSON = eventJSON
        self.stateJSON = stateJSON
    }
}

/// Shared observable bridge session binding the live simulation WKWebView inside `LabsExplorersHomeView`.
@MainActor
@Observable
final class LiveSimulationBridgeSession {
    var latestStateJSON: String? = nil
    var latestReadout: String? = nil
    var latestEventCount: Int = 0
    var lastStampedWidgetId: String? = nil
    var lastBridgeError: String? = nil
    weak var activeWebView: WKWebView?

    func openPreset(widgetId: String, stateJSON: String) {
        guard let webView = activeWebView else { return }
        guard let jsonData = stateJSON.data(using: .utf8),
              let parsedObject = try? JSONSerialization.jsonObject(with: jsonData) else {
            lastBridgeError = "Invalid preset state JSON for widget \(widgetId)"
            return
        }
        let script = """
        if (window.LiveIO && typeof window.LiveIO.openPreset === 'function') {
            return window.LiveIO.openPreset(widgetId, patch);
        } else if (window.Live && typeof window.Live.openPreset === 'function') {
            return window.Live.openPreset(widgetId, patch);
        }
        """
        webView.callAsyncJavaScript(
            script,
            arguments: ["widgetId": widgetId, "patch": parsedObject],
            in: nil,
            in: .page
        ) { [weak self] result in
            Task { @MainActor in
                if case .failure(let error) = result {
                    self?.lastBridgeError = error.localizedDescription
                }
            }
        }
    }

    func focusWidget(widgetId: String) {
        guard let webView = activeWebView else { return }
        let script = """
        if (window.LiveIO && typeof window.LiveIO.openPreset === 'function') {
            return window.LiveIO.openPreset(widgetId, {});
        } else if (window.Live && typeof window.Live.openPreset === 'function') {
            return window.Live.openPreset(widgetId, {});
        } else {
            const safeId = (window.CSS && typeof window.CSS.escape === 'function') ? window.CSS.escape(widgetId) : widgetId;
            const fig = document.querySelector('figure[data-live="' + safeId + '"]') || document.getElementById(widgetId);
            if (fig) {
                fig.scrollIntoView({ behavior: 'instant', block: 'center' });
                const btn = fig.querySelector('.live-open');
                if (btn && !fig.classList.contains('live-on')) btn.click();
            }
        }
        """
        webView.callAsyncJavaScript(
            script,
            arguments: ["widgetId": widgetId],
            in: nil,
            in: .page
        ) { [weak self] result in
            Task { @MainActor in
                if case .failure(let error) = result {
                    self?.lastBridgeError = error.localizedDescription
                }
            }
        }
    }

    func captureLiveSnapshot(widgetId: String) async -> (pngData: Data?, readout: String, stateJSON: String?) {
        guard let webView = activeWebView else {
            return (nil, latestReadout ?? "", latestStateJSON)
        }
        let script = """
        if (!window.LiveIO || typeof window.LiveIO.capturePNG !== 'function') return null;
        const res = window.LiveIO.capturePNG(widgetId);
        if (!res) return null;
        return JSON.stringify({
            pngDataUrl: res.pngDataUrl || '',
            readout: res.readout || '',
            stateJSON: res.state ? JSON.stringify(res.state) : ''
        });
        """
        return await withCheckedContinuation { continuation in
            webView.callAsyncJavaScript(
                script,
                arguments: ["widgetId": widgetId],
                in: nil,
                in: .page
            ) { [weak self] result in
                Task { @MainActor in
                    switch result {
                    case .failure(let error):
                        self?.lastBridgeError = error.localizedDescription
                        continuation.resume(returning: (nil, self?.latestReadout ?? "", self?.latestStateJSON))
                    case .success(let raw):
                        guard let jsonStr = raw as? String,
                              let data = jsonStr.data(using: .utf8),
                              let parsed = try? JSONSerialization.jsonObject(with: data) as? [String: String] else {
                            continuation.resume(returning: (nil, self?.latestReadout ?? "", self?.latestStateJSON))
                            return
                        }
                        let readout = parsed["readout"] ?? (self?.latestReadout ?? "")
                        let rawState = parsed["stateJSON"]
                        let stateJSON: String? = (rawState?.isEmpty == false) ? rawState : nil
                        var pngData: Data? = nil
                        if let urlStr = parsed["pngDataUrl"],
                           let commaIdx = urlStr.firstIndex(of: ",") {
                            let b64 = String(urlStr[urlStr.index(after: commaIdx)...])
                            pngData = Data(base64Encoded: b64)
                        }
                        continuation.resume(returning: (pngData, readout, stateJSON))
                    }
                }
            }
        }
    }
}

/// Offline `WKURLSchemeHandler` serving `MovingWorldBook/` over `kymbook://moving-world/...`
/// with strict path-traversal containment and permissive module CORS headers so ES-module lazy chunks work offline.
final class MovingWorldBookSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "kymbook"
    static let host = "moving-world"

    let rootDirectory: URL?

    init(rootDirectory: URL? = MovingWorldBookSchemeHandler.resolvedBookDirectory()) {
        self.rootDirectory = rootDirectory?.standardizedFileURL
        super.init()
    }

    static func resolvedBookDirectory() -> URL? {
        if let bundleURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "MovingWorldBook") {
            return bundleURL.deletingLastPathComponent()
        }
        let devResources = URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/KymPhysics/KymPhysics/Resources/MovingWorldBook")
        if FileManager.default.fileExists(atPath: devResources.appendingPathComponent("index.html").path) {
            return devResources
        }
        let repoSite = URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/source/build/site")
        if FileManager.default.fileExists(atPath: repoSite.appendingPathComponent("index.html").path) {
            return repoSite
        }
        return nil
    }

    static func resolveFileURL(for requestURL: URL, inside rootDir: URL) -> URL? {
        let base = rootDir.standardizedFileURL
        var rel = requestURL.path
        while rel.hasPrefix("/") { rel.removeFirst() }
        if rel.isEmpty { rel = "index.html" }
        let candidate = base.appendingPathComponent(rel).standardizedFileURL
        let basePath = base.path
        guard candidate.path == basePath || candidate.path.hasPrefix(basePath + "/") else {
            return nil
        }
        return candidate
    }

    static func mimeType(for url: URL) -> String {
        switch url.pathExtension.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "js", "mjs": return "text/javascript; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "json": return "application/json; charset=utf-8"
        case "webmanifest": return "application/manifest+json; charset=utf-8"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "webp": return "image/webp"
        case "woff2": return "font/woff2"
        case "woff": return "font/woff"
        case "ttf": return "font/ttf"
        case "ico": return "image/x-icon"
        default: return "application/octet-stream"
        }
    }

    @MainActor
    static func configure(_ config: WKWebViewConfiguration, bridge: MovingWorldBridgeController) {
        config.userContentController.addUserScript(MovingWorldBridgeController.injectedUserScript)
        config.userContentController.add(bridge, name: MovingWorldBridgeController.handlerName)
        config.setURLSchemeHandler(MovingWorldBookSchemeHandler(), forURLScheme: scheme)
    }

    @MainActor
    static func loadBook(in webView: WKWebView, chapterNumber: Int = 0) {
        let urlString = "\(scheme)://\(host)/index.html#ch\(chapterNumber)"
        if let url = URL(string: urlString) {
            webView.load(URLRequest(url: url))
        }
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url,
              let rootDir = rootDirectory,
              let fileURL = Self.resolveFileURL(for: url, inside: rootDir),
              FileManager.default.fileExists(atPath: fileURL.path),
              let data = try? Data(contentsOf: fileURL) else {
            urlSchemeTask.didFailWithError(NSError(domain: NSURLErrorDomain, code: NSURLErrorFileDoesNotExist))
            return
        }
        let mime = Self.mimeType(for: fileURL)
        let response = HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: [
                "Content-Type": mime,
                "Content-Length": "\(data.count)",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            ]
        ) ?? URLResponse(url: url, mimeType: mime, expectedContentLength: data.count, textEncodingName: "utf-8")
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Synchronous local bundle reads finish immediately.
    }
}

/// Bidirectional JavaScript ↔ Swift bridge for `MovingWorldBook/index.html`.
/// Injects a `WKUserScript` that hooks `localStorage.setItem`, custom interactive card events,
/// and `LiveIO` causal simulation messages, forwarding them to `AppStore` (`DatabaseManager`).
final class MovingWorldBridgeController: NSObject, WKScriptMessageHandler {
    static let handlerName = "kymPhysicsBridge"
    weak var store: AppStore?
    weak var bridgeSession: LiveSimulationBridgeSession?
    var onBridgeEvent: ((MovingWorldBridgeEvent) -> Void)?

    init(
        store: AppStore? = nil,
        bridgeSession: LiveSimulationBridgeSession? = nil,
        onBridgeEvent: ((MovingWorldBridgeEvent) -> Void)? = nil
    ) {
        self.store = store
        self.bridgeSession = bridgeSession
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
        processMessage(dict)
    }

    /// Processes a bridge dictionary deterministically (also callable directly from tests).
    func processMessage(_ dict: [String: Any]) {
        let kind = (dict["kind"] as? String) ?? "unknown"
        let responseText = (dict["responseText"] as? String) ?? (dict["value"] as? String)
        let key = (dict["key"] as? String) ?? ""
        let hash = (dict["hash"] as? String) ?? ""
        let actor = dict["actor"] as? String
        let explicitWidgetId = dict["widgetId"] as? String
        let payloadJSON = dict["payloadJSON"] as? String
        let eventJSON = dict["eventJSON"] as? String
        let stateJSON = dict["stateJSON"] as? String

        var chapterNum: Int?
        if let ch = dict["chapter"] as? Int {
            chapterNum = ch
        } else if let chRange = hash.range(of: #"^#c(?:h)?(\d+)"#, options: .regularExpression) {
            let digits = hash[chRange].drop(while: { !$0.isNumber })
            chapterNum = Int(digits)
        } else if let figRange = hash.range(of: #"^#fig-(\d+)-"#, options: .regularExpression) {
            let digits = hash[figRange].drop(while: { !$0.isNumber }).prefix(while: { $0.isNumber })
            chapterNum = Int(digits)
        }

        let resolvedWidgetId = explicitWidgetId ?? (key.isEmpty ? nil : key)
        let event = MovingWorldBridgeEvent(
            kind: kind,
            chapter: chapterNum,
            widgetId: resolvedWidgetId,
            actor: actor,
            prompt: key,
            responseText: responseText,
            payloadJSON: payloadJSON,
            eventJSON: eventJSON,
            stateJSON: stateJSON
        )

        Task { @MainActor in
            handleProcessedEvent(event)
        }
    }

    @MainActor
    func handleProcessedEvent(_ event: MovingWorldBridgeEvent) {
        onBridgeEvent?(event)
        let kind = event.kind
        let responseText = event.responseText
        let key = event.prompt ?? ""

        if kind == "live_io_event" {
            bridgeSession?.latestReadout = responseText
            if let state = event.stateJSON, !state.isEmpty {
                bridgeSession?.latestStateJSON = state
            } else if event.eventJSON == nil, let payload = event.payloadJSON, !payload.isEmpty {
                bridgeSession?.latestStateJSON = payload
            }
            bridgeSession?.latestEventCount += 1
            return
        } else if kind == "live_io_stamp" {
            // Pedagogical Honesty: ONLY genuine learner actions (`actor == "user"`) may earn a stamp.
            guard event.actor == "user",
                  let widgetId = event.widgetId,
                  !widgetId.isEmpty else { return }
            bridgeSession?.lastStampedWidgetId = widgetId
            bridgeSession?.latestReadout = responseText
            if let state = event.stateJSON ?? event.payloadJSON, !state.isEmpty {
                bridgeSession?.latestStateJSON = state
            }
            let ch = event.chapter ?? store?.pack.widgets.first(where: { $0.id == widgetId })?.chapter ?? 1
            store?.earnWidgetChallengeStamp(
                widgetId: widgetId,
                chapterNumber: ch,
                readout: responseText ?? "Challenge completed inside live simulation"
            )
            return
        }

        guard let store else { return }
        if let ch = event.chapter {
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
                linkedChapterNumber: event.chapter ?? store.activeMovingWorldChapter,
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
        if KymLiveStaticTextNarrator.shared.isSpeaking {
            KymLiveStaticTextNarrator.shared.stop()
            isPaused = true
            isPlaying = false
            return
        }
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
        KymLiveStaticTextNarrator.shared.stop()
        synthesizer.stopSpeaking(at: .immediate)
        currentSegmentIndex += 1
        speakCurrentSegment()
    }

    func stepBackward() {
        guard currentSegmentIndex > 0 else { return }
        KymLiveStaticTextNarrator.shared.stop()
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
            KymLiveStaticTextNarrator.shared.stop()
            synthesizer.stopSpeaking(at: .immediate)
            speakCurrentSegment()
        }
    }

    func stop() {
        KymLiveStaticTextNarrator.shared.stop()
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
        if KymLiveStaticTextNarrator.shared.hasElevenLabsKeyConfigured {
            let textToRead: String
            if currentSegmentIndex < dialogueTurns.count {
                textToRead = dialogueTurns[currentSegmentIndex].text
            } else {
                textToRead = segments[currentSegmentIndex]
            }
            isPlaying = true
            isPaused = false
            KymLiveStaticTextNarrator.shared.readAloud(
                text: textToRead,
                itemID: "physics-explainer-\(currentSegmentIndex)",
                rate: speechRateMultiplier
            ) { [weak self] in
                guard let self else { return }
                if self.currentSegmentIndex + 1 < self.segments.count && self.isPlaying {
                    self.currentSegmentIndex += 1
                    self.speakCurrentSegment()
                } else {
                    self.isPlaying = false
                    self.isPaused = false
                }
            }
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
            QuietPanel {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    HStack(spacing: Spacing.sm) {
                        Image(systemName: player.isPlaying ? "waveform.circle.fill" : "headphones.circle.fill")
                            .font(.kymaiaSymbolLarge)
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
                                .font(.kymaiaSymbolSmall)
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                        .disabled(player.currentSegmentIndex == 0)

                        Button {
                            player.togglePlayPause()
                        } label: {
                            Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                                .font(.kymaiaSymbolSmall)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.kymaiaAccent)
                        .controlSize(.small)

                        Button {
                            player.stepForward()
                        } label: {
                            Image(systemName: "forward.fill")
                                .font(.kymaiaSymbolSmall)
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
                                .font(.kymaiaMetadata)
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
            }
        }
    }
}
