// KymPhysics' value types over the shared KymTutorAI SafetyEscalationService: the scan result the
// coach, AppStore and voice monitor already consume, and the parent-notification hop.

import Foundation

typealias SafetyConcernCategory = SafetyEscalationService.Category

struct SafetyScanResult: Sendable, Equatable, Identifiable {
    let id = UUID()
    let triggered: Bool
    let category: SafetyConcernCategory?
    let matchedIndicator: String?
    let supportiveResponse: String?
    let timestamp: Date

    init(
        triggered: Bool,
        category: SafetyConcernCategory?,
        matchedIndicator: String?,
        supportiveResponse: String?,
        timestamp: Date = Date()
    ) {
        self.triggered = triggered
        self.category = category
        self.matchedIndicator = matchedIndicator
        self.supportiveResponse = supportiveResponse
        self.timestamp = timestamp
    }

    static let clear = SafetyScanResult(
        triggered: false,
        category: nil,
        matchedIndicator: nil,
        supportiveResponse: nil
    )

    static func == (lhs: SafetyScanResult, rhs: SafetyScanResult) -> Bool {
        lhs.triggered == rhs.triggered
            && lhs.category == rhs.category
            && lhs.matchedIndicator == rhs.matchedIndicator
            && lhs.supportiveResponse == rhs.supportiveResponse
    }
}

/// On-device scan and escalation for child-facing free text. Crisis disclosures never depend on
/// network availability and are never sent to a model.
enum PhysicsSafetyGate {
    static func scan(_ text: String) -> SafetyScanResult {
        let service = SafetyEscalationService()
        guard let concern = service.scan(text) else { return .clear }
        return SafetyScanResult(
            triggered: true,
            category: concern.category,
            matchedIndicator: concern.matchedPhrase,
            supportiveResponse: service.supportiveResponse(for: concern)
        )
    }

    static func notifyParentIfNeeded(_ result: SafetyScanResult, sourceSurface: String) async {
        guard result.triggered,
              let category = result.category,
              let phrase = result.matchedIndicator else { return }
        let concern = SafetyEscalationService.Concern(category: category, matchedPhrase: phrase)
        await MainActor.run {
            SafetyEscalationService().escalate(concern, channel: sourceSurface)
        }
    }
}

/// Real-time safety monitor for spoken transcripts in voice mentoring and dictation flows.
@MainActor
final class LiveMentorTranscriptSafetyMonitor: ObservableObject {
    @Published private(set) var triggeredResult: SafetyScanResult?
    @Published private(set) var recentChecksCount: Int = 0
    private var hasNotifiedCurrentSession = false
    private let sourceSurface: String

    init(sourceSurface: String = "live_voice_mentor") {
        self.sourceSurface = sourceSurface
    }

    func reset() {
        triggeredResult = nil
        hasNotifiedCurrentSession = false
    }

    /// Evaluates spoken learner transcript text. Returns `true` when normal AI/voice flow may continue,
    /// or `false` when a safety concern was detected and normal mentoring must stop immediately.
    func allowContinuation(for transcript: String) async -> Bool {
        if triggeredResult != nil {
            return false
        }

        recentChecksCount += 1
        let scanResult = PhysicsSafetyGate.scan(transcript)
        guard scanResult.triggered else {
            return true
        }

        triggeredResult = scanResult
        if !hasNotifiedCurrentSession {
            hasNotifiedCurrentSession = true
            await PhysicsSafetyGate.notifyParentIfNeeded(
                scanResult,
                sourceSurface: sourceSurface
            )
        }
        return false
    }
}
