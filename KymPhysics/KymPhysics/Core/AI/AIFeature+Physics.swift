// KymPhysics' feature keys. AIRequestContext carries the shared module's string-backed AIFeature;
// these keep the raw strings of the former AIFeatureSurface enum. `.assessment` and
// `.contentGeneration` are the module's presets. The style labels below are physics' own.

extension AIFeature {
    static let tutorChat = AIFeature("tutor_chat")
    static let questionTutoring = AIFeature("question_tutoring")
    static let liveVoiceMentor = AIFeature("live_voice_mentor")
    static let visionTutor = AIFeature("vision_tutor")
    static let lessonTutor = AIFeature("lesson_tutor")
    static let adversarialCouncil = AIFeature("adversarial_council")
    static let curriculumResearch = AIFeature("curriculum_research")
    static let parentInsights = AIFeature("parent_insights")
    static let legacy = AIFeature("legacy")
}

extension TutorGuidanceStyle {
    var shortLabel: String {
        switch self {
        case .adaptive: return "Adaptive"
        case .askMeQuestions: return "Questions"
        case .hintFirst: return "Hint"
        case .explainDirectly: return "Explain"
        case .practiceTogether: return "Practice"
        }
    }

    var systemImage: String {
        switch self {
        case .adaptive: return "sparkles"
        case .askMeQuestions: return "questionmark.bubble"
        case .hintFirst: return "lightbulb"
        case .explainDirectly: return "text.book.closed"
        case .practiceTogether: return "person.2"
        }
    }
}
