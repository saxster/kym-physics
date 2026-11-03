// KymPhysics' tutor profile for the shared KymTutorAI constitution (teaching_kit).
// Registered in KymPhysicsApp.init.

extension TutorSubjectProfile {
    static let kymPhysics = TutorSubjectProfile(
        appName: "KymPhysics",
        subjectLabel: "physics",
        learnerDescription: "You are speaking with or generating material for a child learner (ages 6-14).",
        safeFallback: """
        I can help with the physics task, and I won't pressure you or make assumptions about what you feel. You can choose: a direct explanation, one hint, or one small practice step.
        """
    )
}
