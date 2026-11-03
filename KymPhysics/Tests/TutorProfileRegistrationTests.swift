import Foundation
import Testing
@testable import KymPhysics

/// Pins the boundary with the shared KymTutorAI module: KymPhysics's registered profile reaches
/// the learner-facing constitution, and the on-device crisis scan still fires.
@Suite("Tutor profile registration")
struct TutorProfileRegistrationTests {
    @Test("The registered profile reaches the learner chat constitution")
    func registeredProfileReachesLearnerChat() {
        TutorConstitution.register(.kymPhysics)
        let profile = TutorSubjectProfile.kymPhysics
        let instruction = TutorConstitution.instruction(for: .learnerChat)

        #expect(TutorConstitution.version == "2026-11-03.v2")
        #expect(instruction.contains("2026-11-03.v2"))
        #expect(TutorConstitution.profile.appName == "KymPhysics")
        #expect(instruction.contains(profile.learnerDescription))
        for rule in profile.subjectRules {
            #expect(instruction.contains(rule))
        }
        print("KymPhysics TutorConstitution.policyHash=\(TutorConstitution.policyHash)")
    }

    @Test("The crisis scan still flags a self-harm phrase")
    func crisisScanFlagsSelfHarm() {
        TutorConstitution.register(.kymPhysics)
        let concern = SafetyEscalationService().scan("I want to hurt myself tonight")
        #expect(concern?.category == .selfHarm)
    }
}
