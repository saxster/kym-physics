import SwiftUI

/// Collection → mission Reader. Introduction to Electronics with Arduino:
/// spy gadgets and nature watches that teach circuits by needing them.
struct ArduinoMissionsGalleryView: View {
    @AppStorage(ArduinoBuildLog.storageKey) private var builtStored = ""

    private let validMissionIDs = Set(ArduinoMissionCatalog.allMissions.map(\.id))

    private var builtIDs: Set<String> {
        ArduinoBuildLog.decode(builtStored, validIDs: validMissionIDs)
    }

    var body: some View {
        JournalPage(
            title: "Electronics with Arduino",
            subtitle: "Spy gadgets, bird cameras, and the circuits inside them."
        ) {
            JournalSection(title: "Your briefing") {
                briefingCard
            }
            JournalSection(title: "The agent rules") {
                rulesCard
            }
            JournalSection(title: "Meet the Uno and breadboard") {
                JournalCard {
                    ArduinoBoardTourView()
                }
            }
            JournalSection(title: ArduinoTrack.foundation.title) {
                missionCard(ArduinoMissionCatalog.foundation, featured: true)
            }
            JournalSection(title: ArduinoTrack.spyGadget.title) {
                ForEach(ArduinoMissionCatalog.spyMissions) { mission in
                    missionCard(mission)
                }
            }
            JournalSection(title: ArduinoTrack.natureWatch.title) {
                ForEach(ArduinoMissionCatalog.natureMissions) { mission in
                    missionCard(mission)
                }
            }
            JournalSection(title: ArduinoTrack.capstone.title) {
                missionCard(ArduinoMissionCatalog.capstone, featured: true)
            }
            JournalSection(title: "When it doesn't work") {
                troubleshootingCard
            }
            JournalSection(title: "Before you buy anything") {
                starterKitCard
            }
        }
        .accessibilityIdentifier("arduino.gallery")
    }

    // MARK: - Briefing + Progress Track & Celebration

    private var briefingCard: some View {
        let totalCount = ArduinoMissionCatalog.allMissions.count
        let builtCount = builtIDs.count
        let progressFraction = totalCount > 0 ? Double(builtCount) / Double(totalCount) : 0

        return JournalCard {
            Label("Welcome, Agent. Also: welcome, naturalist.", systemImage: "binoculars")
                .font(.kymaiaTitle)
            Text("This course teaches real electronics the fun way: every idea arrives because a mission needs it. You will guard a treasure box, flash Morse code, map a dark room with sound, test a so-called truth meter — then turn the same skills on the garden and photograph the birds who visit while you are at school.")
                .font(.kymaiaBody)
            Text("Each mission gives you the story, the science in plain words, the parts, the wiring, real code, and a challenge. Do Training 01 first; after that, follow your curiosity.")
                .font(.kymaiaBody)

            Divider()

            VStack(alignment: .leading, spacing: Spacing.xs) {
                Label(buildLogSummary, systemImage: "checklist.checked")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Color.kymaiaMutedInk)
                    .accessibilityIdentifier("arduino.buildlog.summary")

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.kymaiaControlFill)
                        Capsule()
                            .fill(builtCount == totalCount ? Color.kymaiaSuccess : Color.kymaiaPrimary)
                            .frame(width: max(0, geo.size.width * progressFraction))
                    }
                }
                .frame(height: 8)
                .accessibilityHidden(true)

                if builtCount > 0 {
                    HStack(spacing: Spacing.xs) {
                        Image(systemName: builtCount == totalCount ? "trophy.fill" : "sparkles")
                            .font(.kymaiaCaption)
                            .foregroundStyle(builtCount == totalCount ? Color.kymaiaWarning : Color.kymaiaSuccess)
                        Text(
                            builtCount == totalCount
                                ? "All 10 field agent missions completed — full station unlocked"
                                : "Field log active: \(builtCount) mission\(builtCount == 1 ? "" : "s") built (\(Int((progressFraction * 100).rounded()))%)"
                        )
                        .font(.kymaiaCaption.weight(.medium))
                        .foregroundStyle(Color.kymaiaInk)
                    }
                    .accessibilityIdentifier("arduino.buildlog.celebration")
                }
            }
        }
    }

    private var buildLogSummary: String {
        let total = ArduinoMissionCatalog.allMissions.count
        let done = builtIDs.count
        if done == 0 {
            return "Your build log: no missions built yet. Training 01 takes about 20 minutes."
        }
        if done == total {
            return "Your build log: all \(total) missions built. Field Agent status: earned in the garden, not in this app."
        }
        return "Your build log: \(done) of \(total) missions built. Mark each one on its mission page when your gadget works."
    }

    private var rulesCard: some View {
        JournalCard {
            ForEach(Array(ArduinoMissionCatalog.agentRules.enumerated()), id: \.offset) { index, rule in
                Label(rule, systemImage: "shield.lefthalf.filled")
                    .font(.kymaiaBody)
                    .padding(.vertical, Spacing.xs)
                    .accessibilityIdentifier("arduino.rule.\(index)")
            }
        }
    }

    private var troubleshootingCard: some View {
        JournalCard {
            Text("Every builder's first gadget fails once. Work down this list before you touch the code — most 'broken' gadgets have one loose wire.")
                .font(.kymaiaBody)
            ForEach(Array(ArduinoMissionCatalog.troubleshooting.enumerated()), id: \.offset) { index, tip in
                Label(tip, systemImage: "wrench.and.screwdriver")
                    .font(.kymaiaBody)
                    .padding(.vertical, Spacing.xs)
                    .accessibilityIdentifier("arduino.troubleshoot.\(index)")
            }
        }
    }

    private var starterKitCard: some View {
        JournalCard {
            Text("Most spy missions run on one ordinary Arduino starter kit. Try every circuit free in the Tinkercad simulator first — if you love it there, the real parts are worth it.")
                .font(.kymaiaBody)
            ForEach(Array(ArduinoMissionCatalog.starterKit.enumerated()), id: \.offset) { _, item in
                Label(item, systemImage: "wrench.and.screwdriver")
                    .font(.kymaiaBody)
                    .padding(.vertical, Spacing.xs)
            }
            if let url = URL(string: "https://www.tinkercad.com/circuits") {
                Link(destination: url) {
                    Label("Open the free Tinkercad circuit lab", systemImage: "arrow.up.right.square")
                }
                .buttonStyle(KymaiaSecondaryButtonStyle())
                .accessibilityIdentifier("arduino.link.tinkercad")
            }
            Text("Opens online · the ESP32-CAM nature missions also ask a grown-up to help with setup")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)
        }
    }

    private func missionCard(_ mission: ArduinoMission, featured: Bool = false) -> some View {
        let built = builtIDs.contains(mission.id)
        return JournalCard {
            ArduinoMissionVisualView(kind: mission.visualKind, alt: mission.visualAlt, compact: !featured)
            HStack(spacing: Spacing.sm) {
                Text(mission.number.uppercased())
                    .font(.kymaiaEyebrow)
                    .foregroundStyle(Color.kymaiaPrimary)
                if mission.needsAdultSetup {
                    Label("with a grown-up", systemImage: "person.2")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
                Spacer()
                if built {
                    Label("Built", systemImage: "checkmark.seal.fill")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaSuccess)
                }
            }
            Text(mission.title)
                .font(.kymaiaTitle)
                .accessibilityAddTraits(.isHeader)
            Text(mission.hook)
                .font(.kymaiaBody)
            Label(
                "\(mission.minutes) · \(mission.level) · \(mission.parts.count) parts · teaches: \(mission.conceptTitle)",
                systemImage: mission.symbol
            )
            .font(.kymaiaCaption)
            .foregroundStyle(Color.kymaiaMutedInk)
            NavigationLink {
                ArduinoMissionDetailView(mission: mission)
            } label: {
                Label("Open the mission file", systemImage: "arrow.right")
            }
            .buttonStyle(JournalCapsuleButtonStyle())
            .accessibilityIdentifier("arduino.mission.\(mission.id)")
        }
        .contextMenu {
            Button {
                toggleBuilt(mission.id)
            } label: {
                Label(
                    built ? "Unmark built" : "Mark as built",
                    systemImage: built ? "arrow.uturn.backward" : "checkmark.seal"
                )
            }
        }
    }

    private func toggleBuilt(_ id: String) {
        withKymaiaAnimation(.kymaiaEmphatic) {
            let updated = ArduinoBuildLog.toggling(id, in: builtIDs)
            builtStored = ArduinoBuildLog.encode(updated)
        }
    }
}
