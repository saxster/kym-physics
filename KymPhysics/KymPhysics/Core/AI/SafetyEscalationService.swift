import Foundation
import UserNotifications
import os.log

enum SafetyConcernCategory: String, Sendable, CaseIterable, Codable {
    case suicidalIdeation = "suicidal_ideation"
    case selfHarm = "self_harm"
    case abuseDisclosure = "abuse_disclosure"
    case eatingDisorder = "eating_disorder"
    case acuteDistress = "acute_distress"

    var parentSummaryTitle: String {
        switch self {
        case .suicidalIdeation, .selfHarm:
            return "Urgent safety check-in needed"
        case .abuseDisclosure:
            return "Important safety disclosure check-in"
        case .eatingDisorder, .acuteDistress:
            return "Emotional wellbeing check-in"
        }
    }
}

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

/// On-device safety scanner and escalation path for child-facing free-text inputs.
/// Uses deterministic high-recall pattern matching so crisis disclosures never depend on network
/// availability or get sent to a third-party model.
enum SafetyEscalationService {
    private static let logger = Logger(subsystem: "com.kymaia.physics", category: "SafetyEscalation")

    private static let patterns: [(SafetyConcernCategory, [String])] = [
        (.suicidalIdeation, [
            "want to die", "wanna die", "wish i was dead", "wish i were dead",
            "kill myself", "killing myself", "end my life", "ending my life",
            "better off dead", "no reason to live", "do not want to live",
            "don't want to live", "dont want to live", "don't want to be alive",
            "dont want to be alive", "take my own life", "suicide", "suicidal"
        ]),
        (.selfHarm, [
            "hurt myself", "hurting myself", "harm myself", "cut myself",
            "cutting myself", "self harm", "self-harm", "burn myself",
            "make myself bleed", "hit myself on purpose"
        ]),
        (.abuseDisclosure, [
            "someone is hurting me", "someone hurt me", "hits me", "beats me",
            "being abused", "abusing me", "touched me", "makes me do things",
            "afraid to go home", "scared to go home", "locks me in", "starves me"
        ]),
        (.eatingDisorder, [
            "starving myself", "starve myself", "make myself throw up",
            "purge after", "stop eating", "won't eat", "too fat to eat",
            "afraid to eat anything", "hate my body"
        ]),
        (.acuteDistress, [
            "can't breathe panic", "cant breathe panic", "having a panic attack",
            "can't go on", "cannot go on", "everyone hates me", "want to disappear",
            "wish i wasn't here", "feel hopeless", "completely hopeless",
            "nothing matters anymore", "nobody cares if i disappear"
        ])
    ]

    static func scan(_ text: String) -> SafetyScanResult {
        let normalized = text
            .lowercased()
            .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)

        guard !normalized.isEmpty else { return .clear }

        for (category, phrases) in patterns {
            if let match = phrases.first(where: { normalized.contains($0) }) {
                return SafetyScanResult(
                    triggered: true,
                    category: category,
                    matchedIndicator: match,
                    supportiveResponse: supportiveResponse(for: category)
                )
            }
        }

        return .clear
    }

    static func supportiveResponse(for category: SafetyConcernCategory) -> String {
        switch category {
        case .suicidalIdeation, .selfHarm:
            return """
            I'm really glad you said something, and I care about you staying safe. I'm a learning app, so I can't keep you safe on my own—please pause right now and talk to your parent, a family member, or another trusted adult near you.

            If you need immediate help, you or an adult with you can call or text **988** (US/Canada) or **112** (India/Europe), or reach emergency services right away. You don't have to carry this alone.
            """
        case .abuseDisclosure:
            return """
            Thank you for telling me. You deserve to be safe and cared for. Because I'm a study app, I can't step in directly—please talk right away with a trusted adult such as a parent, relative, teacher, school counselor, or emergency services (**112** or **911**) if you feel unsafe right now.
            """
        case .eatingDisorder, .acuteDistress:
            return """
            It sounds like you're going through something really heavy right now. Let's pause the lesson—what matters most is you. Please check in with your parent or another trusted adult nearby so they can support you right now.
            """
        }
    }

    static func notifyParentIfNeeded(_ result: SafetyScanResult, sourceSurface: String) async {
        guard result.triggered, let category = result.category else { return }

        logger.error(
            "Safety escalation triggered on \(sourceSurface, privacy: .public) [category: \(category.rawValue, privacy: .public)]"
        )

        guard canScheduleLocalNotifications else { return }

        let content = UNMutableNotificationContent()
        content.title = category.parentSummaryTitle
        content.body = "KymPhysics paused a \(sourceSurface) interaction so you can check in with Kym directly."
        content.sound = .default
        if #available(iOS 15.0, macOS 12.0, *) {
            content.interruptionLevel = .timeSensitive
        }

        let request = UNNotificationRequest(
            identifier: "safety-escalation-\(UUID().uuidString)",
            content: content,
            trigger: nil
        )

        try? await UNUserNotificationCenter.current().add(request)
    }

    private static var canScheduleLocalNotifications: Bool {
        let ext = Bundle.main.bundleURL.pathExtension.lowercased()
        return ext == "app" || ext == "appex"
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
        let scanResult = SafetyEscalationService.scan(transcript)
        guard scanResult.triggered else {
            return true
        }

        triggeredResult = scanResult
        if !hasNotifiedCurrentSession {
            hasNotifiedCurrentSession = true
            await SafetyEscalationService.notifyParentIfNeeded(
                scanResult,
                sourceSurface: sourceSurface
            )
        }
        return false
    }
}
