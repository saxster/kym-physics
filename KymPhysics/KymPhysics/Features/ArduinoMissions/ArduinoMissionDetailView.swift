import SwiftUI

/// One mission file: story, science, interactive diagram, parts, wiring, build steps,
/// real code with dry-run tracer, things to notice, a challenge, troubleshooting, safety, and links.
struct ArduinoMissionDetailView: View {
    let mission: ArduinoMission

    @AppStorage(ArduinoBuildLog.storageKey) private var builtStored = ""
    @State private var selectedPartIndex: Int?
    @State private var focusedParamID: String?
    @State private var paramValues: [String: Int] = [:]

    private let validMissionIDs = Set(ArduinoMissionCatalog.allMissions.map(\.id))

    private var builtIDs: Set<String> {
        ArduinoBuildLog.decode(builtStored, validIDs: validMissionIDs)
    }

    private var isBuilt: Bool {
        builtIDs.contains(mission.id)
    }

    var body: some View {
        JournalReaderPage(title: mission.title) {
            Text("\(mission.number) · \(mission.track.title) · \(mission.minutes) · \(mission.level)")
                .font(.kymaiaCaption)
                .foregroundStyle(Color.kymaiaMutedInk)

            if isBuilt {
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaSuccess)
                    Text("Logged in your agent field book — ready for the next mission")
                        .font(.kymaiaCaption.weight(.semibold))
                        .foregroundStyle(Color.kymaiaSuccess)
                }
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.xs)
                .background(Color.kymaiaSuccess.opacity(0.12), in: Capsule())
                .accessibilityIdentifier("arduino.mission.builtCelebration.\(mission.id)")
            }

            Text(mission.hook)
                .font(.kymaiaSerifProse)

            if !mission.specs.isEmpty {
                ArduinoSpecsGrid(specs: mission.specs)
            }

            JournalSection(title: "The science: \(mission.conceptTitle)") {
                Text(mission.concept)
                    .font(.kymaiaSerifProse)
                ArduinoMissionVisualView(
                    mission: mission,
                    selectedPartIndex: $selectedPartIndex,
                    focusedParamID: $focusedParamID,
                    paramValues: $paramValues
                )
            }

            JournalSection(title: "You will need") {
                partsCard
            }

            if !mission.wiring.isEmpty {
                JournalSection(title: "Pinout and wiring") {
                    wiringTableCard
                }
            }

            JournalSection(title: "Build it, step by step") {
                stepsCard
            }

            JournalSection(title: "The code") {
                JournalCard {
                    ArduinoCodeCardView(
                        mission: mission,
                        paramValues: paramValues,
                        selectedPartIndex: $selectedPartIndex,
                        focusedParamID: $focusedParamID
                    )
                    Text("Type it rather than copy-pasting if you can — your fingers learn the patterns too. Read the comments: they are the explanation.")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
            }

            JournalSection(title: "Things to notice while it runs") {
                ForEach(Array(mission.notice.enumerated()), id: \.offset) { index, note in
                    Label("\(index + 1). \(note)", systemImage: "viewfinder")
                        .font(.kymaiaBody)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.vertical, Spacing.xs)
                }
            }

            JournalSection(title: "Agent challenge") {
                JournalCard {
                    Label(mission.challenge, systemImage: "target")
                        .font(.kymaiaBody)
                    Button(
                        isBuilt ? "In my build log — tap to undo" : "My gadget works — log this mission",
                        systemImage: isBuilt ? "checkmark.seal.fill" : "seal"
                    ) {
                        toggleBuilt()
                    }
                    .buttonStyle(JournalCapsuleButtonStyle())
                    .accessibilityIdentifier("arduino.buildlog.toggle.\(mission.id)")
                    Text("Your build log is a note to yourself, kept on this device. It does not grade you.")
                        .font(.kymaiaCaption)
                        .foregroundStyle(Color.kymaiaMutedInk)
                }
            }

            JournalSection(title: "When it doesn't work") {
                troubleshootCard
            }

            JournalSection(title: "Watch and read") {
                ForEach(mission.links) { link in
                    if let url = link.url {
                        JournalCard {
                            Label(link.title, systemImage: link.isVideo ? "play.rectangle" : "book")
                                .font(.kymaiaHeadline)
                            Text(link.detail)
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                            Link(destination: url) {
                                Label(
                                    link.isVideo ? "Watch on YouTube" : "Open the guide",
                                    systemImage: "arrow.up.right.square"
                                )
                            }
                            .buttonStyle(KymaiaSecondaryButtonStyle())
                            Text("Opens online")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                    }
                }
            }

            JournalSection(title: "Safety") {
                JournalCard {
                    Label(mission.safety, systemImage: "shield.lefthalf.filled")
                        .font(.kymaiaBody)
                }
            }
        }
        .accessibilityIdentifier("arduino.detail.\(mission.id)")
        .onAppear {
            if paramValues.isEmpty {
                paramValues = mission.defaultParamValues()
            }
        }
        .onChange(of: mission.id) { _, _ in
            selectedPartIndex = nil
            focusedParamID = nil
            paramValues = mission.defaultParamValues()
        }
    }

    // MARK: - Parts & Wiring Cards

    private var partsCard: some View {
        JournalCard {
            ForEach(Array(mission.parts.enumerated()), id: \.offset) { idx, part in
                let isSelected = selectedPartIndex == idx
                Button {
                    withKymaiaAnimation(.kymaiaStandard) {
                        mission.togglePartSelection(
                            at: idx,
                            selectedPartIndex: &selectedPartIndex,
                            focusedParamID: &focusedParamID
                        )
                    }
                } label: {
                    HStack(alignment: .center, spacing: Spacing.sm) {
                        Text("\(idx + 1)")
                            .font(.kymaiaCodeMath.weight(.bold))
                            .foregroundStyle(isSelected ? Color.white : Color.kymaiaPrimary)
                            .frame(width: 24, height: 24)
                            .background(
                                isSelected ? Color.kymaiaPrimary : Color.kymaiaPrimary.opacity(0.14),
                                in: Circle()
                            )
                        Text(part)
                            .font(.kymaiaBody)
                            .foregroundStyle(Color.kymaiaInk)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 0)
                        if isSelected {
                            Text("Highlighted")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaPrimary)
                        }
                    }
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.xs)
                    .frame(maxWidth: .infinity, minHeight: Theme.Dimension.minimumTarget, alignment: .leading)
                    .background(isSelected ? Color.kymaiaSelectionFill : Color.clear)
                    .journalIllustrationClip()
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .kymaiaPointerHighlight(RoundedRectangle(cornerRadius: CornerRadius.small, style: .continuous))
                .help("Highlight \(part) in the circuit diagram and Arduino code")
                .accessibilityAddTraits(isSelected ? .isSelected : [])
                .accessibilityIdentifier("arduino.detail.\(mission.id).part.\(idx)")
            }

            if mission.needsAdultSetup {
                Divider()
                Label("A grown-up helps with setup on this mission.", systemImage: "person.2")
                    .font(.kymaiaBody)
            }
        }
    }

    private var wiringTableCard: some View {
        JournalCard {
            ForEach(mission.wiring) { connection in
                HStack(alignment: .top, spacing: Spacing.sm) {
                    HStack(spacing: Spacing.xs) {
                        Circle()
                            .fill(wireColor(for: connection.wireTone))
                            .frame(width: 10, height: 10)
                        Text(connection.pin)
                            .font(.kymaiaCodeMath.weight(.bold))
                            .foregroundStyle(Color.kymaiaInk)
                    }
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.xs)
                    .frame(minWidth: 96, alignment: .leading)
                    .background(Color.kymaiaControlFill, in: Capsule())

                    VStack(alignment: .leading, spacing: 2) {
                        Text(connection.connectsTo)
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaInk)
                        Text(connection.purpose)
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaMutedInk)
                    }
                    Spacer(minLength: 0)
                }
                .padding(.vertical, 2)
            }
        }
        .accessibilityIdentifier("arduino.wiring.\(mission.id)")
    }

    private var stepsCard: some View {
        JournalCard {
            ForEach(Array(mission.steps.enumerated()), id: \.offset) { index, step in
                HStack(alignment: .top, spacing: Spacing.sm) {
                    Text("\(index + 1)")
                        .font(.kymaiaCodeMath.weight(.bold))
                        .foregroundStyle(Color.white)
                        .frame(width: 24, height: 24)
                        .background(Color.kymaiaPrimary, in: Circle())
                    Text(step)
                        .font(.kymaiaBody)
                        .foregroundStyle(Color.kymaiaInk)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.vertical, Spacing.xs)
            }
        }
    }

    /// Review finding R2: keep the 6-item troubleshooting rescue steps on every mission page,
    /// collapsed until needed so learners don't have to navigate back to the gallery.
    private var troubleshootCard: some View {
        JournalCard {
            DisclosureGroup("6-step bench rescue checklist") {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    ForEach(Array(ArduinoMissionCatalog.troubleshooting.enumerated()), id: \.offset) { _, tip in
                        Label(tip, systemImage: "wrench.and.screwdriver")
                            .font(.kymaiaBody)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.vertical, Spacing.xs)
                    }
                }
                .padding(.top, Spacing.xs)
            }
            .font(.kymaiaHeadline)
            .accessibilityIdentifier("arduino.troubleshoot.\(mission.id)")
        }
    }

    private func wireColor(for tone: ArduinoWireTone) -> Color {
        switch tone {
        case .power: return Color.kymaiaError
        case .ground: return Color.kymaiaInk
        case .signal: return Color.kymaiaSuccess
        case .analog: return Color.kymaiaPrimary
        case .pwm: return Color.kymaiaWarning
        case .secondary: return Color.kymaiaMutedInk
        }
    }

    private func toggleBuilt() {
        withKymaiaAnimation(.kymaiaEmphatic) {
            let next = ArduinoBuildLog.toggling(mission.id, in: builtIDs)
            builtStored = ArduinoBuildLog.encode(next)
        }
    }
}
