import SwiftUI

// MARK: - Interactive Mission Bench & Schematic Visual View

struct ArduinoMissionVisualView: View {
    let kind: String
    let alt: String
    var compact: Bool = false
    var mission: ArduinoMission?

    @Binding var selectedPartIndex: Int?
    @Binding var focusedParamID: String?
    @Binding var paramValues: [String: Int]

    @Environment(\.dynamicTypeSize) var dynamicTypeSize
    @State var sonarTarget: ArduinoSonarTarget = .hardBook
    @AppStorage(ArduinoTonePreviewPlayer.muteStorageKey) var isAudioMuted = false

    init(
        kind: String,
        alt: String,
        compact: Bool = false
    ) {
        self.kind = kind
        self.alt = alt
        self.compact = compact
        self.mission = nil
        self._selectedPartIndex = .constant(nil)
        self._focusedParamID = .constant(nil)
        self._paramValues = .constant([:])
    }

    init(
        mission: ArduinoMission,
        selectedPartIndex: Binding<Int?>,
        focusedParamID: Binding<String?>,
        paramValues: Binding<[String: Int]>
    ) {
        self.kind = mission.visualKind
        self.alt = mission.visualAlt
        self.compact = false
        self.mission = mission
        self._selectedPartIndex = selectedPartIndex
        self._focusedParamID = focusedParamID
        self._paramValues = paramValues
    }

    /// At accessibility Dynamic Type sizes, stack the 3 stages vertically so labels never clip.
    var stripLayout: AnyLayout {
        dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: Theme.Spacing.xs))
            : AnyLayout(HStackLayout(alignment: .center, spacing: Theme.Spacing.small))
    }

    var body: some View {
        if compact || mission == nil {
            compactStageStrip
        } else if let mission {
            interactiveMissionBench(for: mission)
        }
    }

    // MARK: - Compact Stage Strip (Gallery Cards)

    private var compactStageStrip: some View {
        let stages = staticStages(for: kind)
        return stripLayout {
            ForEach(Array(stages.enumerated()), id: \.offset) { idx, stage in
                stagePill(stage, isCompact: true)
                if idx < stages.count - 1 {
                    Image(
                        systemName: dynamicTypeSize.isAccessibilitySize ? "arrow.down" : "arrow.right"
                    )
                    .font(.kymaiaCaption.weight(.bold))
                    .foregroundStyle(Theme.Colors.accent)
                    .accessibilityHidden(true)
                }
            }
        }
        .padding(Theme.Spacing.small)
        .frame(maxWidth: .infinity)
        .journalIllustrationSurface()
        .journalIllustrationClip()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(alt)
    }

    // MARK: - Interactive Detail Mission Bench

    private func interactiveMissionBench(for mission: ArduinoMission) -> some View {
        let telemetry = mission.telemetryReadout(with: paramValues, sonarTarget: sonarTarget)
        let stages = interactiveStages(for: mission)

        return VStack(alignment: .leading, spacing: Theme.Spacing.medium) {
            HStack(alignment: .center, spacing: Theme.Spacing.small) {
                Label("Interactive circuit bench", systemImage: "waveform.path.ecg")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.accent)

                Spacer(minLength: Theme.Spacing.small)

                if let toneHz = telemetry.previewToneHz {
                    piezoPreviewControls(toneHz: toneHz)
                }

                Text(telemetry.badgeText)
                    .font(.kymaiaMonoCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.primaryText)
                    .readout()
                    .accessibilityIdentifier("arduino.visual.\(mission.id).telemetryBadge")
            }

            ZStack(alignment: .topLeading) {
                Canvas { context, size in
                    drawCircuitLoop(context: &context, size: size, selectedPartIndex: selectedPartIndex)
                }
                .frame(minHeight: dynamicTypeSize.isAccessibilitySize ? 210 : 126)
                .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                    stripLayout {
                        ForEach(Array(stages.enumerated()), id: \.offset) { idx, stage in
                            interactiveStageNode(stage, stageIndex: idx, mission: mission)
                            if idx < stages.count - 1 {
                                Image(
                                    systemName: dynamicTypeSize.isAccessibilitySize
                                        ? "arrow.down"
                                        : "arrow.right"
                                )
                                .font(.kymaiaCaption.weight(.bold))
                                .foregroundStyle(Theme.Colors.accent)
                                .accessibilityHidden(true)
                            }
                        }
                    }

                    HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.small) {
                        Image(systemName: "bolt.horizontal.circle.fill")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Theme.Colors.accent)
                        Text(telemetry.voltageOrSignalText)
                            .font(.kymaiaMonoCaption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 0)
                    }
                    .padding(.top, Theme.Spacing.xxs)
                }
                .padding(Theme.Spacing.medium)
            }
            .frame(maxWidth: .infinity)
            .journalIllustrationSurface()
            .journalIllustrationClip()
            .accessibilityElement(children: .contain)
            .accessibilityLabel(alt)

            Text("Tip: tap any stage on the diagram to cycle live states, or adjust the What-If controls and part chips below.")
                .font(.kymaiaCaption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .accessibilityIdentifier("arduino.visual.\(mission.id).interactionHint")

            HStack(alignment: .top, spacing: Theme.Spacing.small) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Theme.Colors.success)
                Text(telemetry.outcomeText)
                    .font(.kymaiaCaption.weight(.medium))
                    .foregroundStyle(Theme.Colors.primaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, Theme.Spacing.medium)
            .padding(.vertical, Theme.Spacing.small)
            .frame(maxWidth: .infinity, alignment: .leading)
            .journalIllustrationSurface()
            .journalIllustrationClip()
            .accessibilityIdentifier("arduino.visual.\(mission.id).outcome")

            if mission.missionID == .sonarSweep {
                sonarMaterialBar(for: mission)
            }

            if !mission.params.isEmpty {
                whatIfControlsSection(for: mission)
            }

            partHotspotsStrip(for: mission)
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("arduino.visual.bench.\(mission.id)")
    }

    // MARK: - Interactive Stage Node (Direct Manipulation on Diagram)

    private func interactiveStageNode(
        _ stage: Stage,
        stageIndex: Int,
        mission: ArduinoMission
    ) -> some View {
        let targetParam = stageIndex < mission.params.count
            ? mission.params[stageIndex]
            : mission.params.first
        let isFocused = targetParam != nil && focusedParamID == targetParam?.id

        return Button {
            guard let param = targetParam else { return }
            withKymaiaAnimation(.kymaiaSpring) {
                cycleParameterValue(param, in: mission)
            }
        } label: {
            stagePill(stage, isCompact: false, isHighlighted: isFocused)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .kymaiaPointerHighlight(RoundedRectangle(cornerRadius: Theme.Radius.small, style: .continuous))
        .help("Tap to test \(stage.title) (\(stage.subtitle))")
        .accessibilityLabel("\(stage.title): \(stage.subtitle)")
        .accessibilityHint("Tap to cycle this circuit stage's parameter and highlight matching code lines.")
        .accessibilityAddTraits(isFocused ? .isSelected : [])
        .accessibilityIdentifier("arduino.visual.\(mission.id).stage.\(stageIndex)")
    }

    private func cycleParameterValue(_ param: ArduinoParam, in mission: ArduinoMission) {
        let current = mission.resolvedValue(for: param.id, in: paramValues)
        let nextValue: Int
        switch param.kind {
        case .choices(let choices):
            if let idx = choices.firstIndex(where: { $0.value == current }) {
                nextValue = choices[(idx + 1) % choices.count].value
            } else {
                nextValue = choices.first?.value ?? param.defaultValue
            }
        case .range(let minVal, let maxVal, let step, _, _):
            let stepped = current + step * 2
            nextValue = stepped > maxVal ? minVal : stepped
        }
        updateParamValue(param, to: nextValue, in: mission)
    }

    // MARK: - Piezo Audio Preview Controls

    private func piezoPreviewControls(toneHz: Int) -> some View {
        HStack(spacing: Theme.Spacing.xs) {
            Button {
                ArduinoTonePreviewPlayer.playTone(frequencyHz: toneHz, isMuted: isAudioMuted)
            } label: {
                Label("Beep \(toneHz) Hz", systemImage: "speaker.wave.2.fill")
                    .font(.kymaiaCaption.weight(.semibold))
                    .padding(.horizontal, Theme.Spacing.small)
                    .padding(.vertical, Theme.Spacing.xs)
                    .frame(minHeight: Theme.Dimension.minimumTarget)
                    .foregroundStyle(Theme.Colors.accent)
                    .background(Theme.Colors.accent.opacity(0.12), in: Capsule())
                    .contentShape(Capsule())
            }
            .buttonStyle(.plain)
            .kymaiaPointerHighlight(Capsule())
            .help("Play a short synthesized \(toneHz) Hz piezo square-wave beep")
            .accessibilityIdentifier("arduino.visual.playTone")

            Button {
                isAudioMuted.toggle()
            } label: {
                Image(systemName: isAudioMuted ? "speaker.slash.fill" : "speaker.wave.1")
                    .font(.kymaiaCaption)
                    .padding(Theme.Spacing.xs)
                    .frame(
                        minWidth: Theme.Dimension.minimumTarget,
                        minHeight: Theme.Dimension.minimumTarget
                    )
                    .foregroundStyle(isAudioMuted ? Theme.Colors.warning : Theme.Colors.secondaryText)
                    .background(Theme.Colors.secondaryBackground, in: Circle())
                    .contentShape(Circle())
            }
            .buttonStyle(.plain)
            .kymaiaPointerHighlight(Circle())
            .help(isAudioMuted ? "Unmute piezo tone preview" : "Mute piezo tone preview")
            .accessibilityLabel(isAudioMuted ? "Unmute piezo tone preview" : "Mute piezo tone preview")
            .accessibilityAddTraits(isAudioMuted ? .isSelected : [])
            .accessibilityIdentifier("arduino.visual.muteTone")
        }
    }

    // MARK: - Sonar Material Acoustics Selector

    private func sonarMaterialBar(for mission: ArduinoMission) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: "wave.3.forward")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Theme.Colors.accent)
                Text("Target surface acoustics (Why cushion swallows ultrasound)")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.secondaryText)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.Spacing.xs) {
                    ForEach(ArduinoSonarTarget.allCases) { target in
                        let isSelected = sonarTarget == target
                        Button {
                            withKymaiaAnimation(.kymaiaSpring) {
                                sonarTarget = target
                                let telemetry = mission.telemetryReadout(
                                    with: paramValues,
                                    sonarTarget: target
                                )
                                if let hz = telemetry.previewToneHz {
                                    ArduinoTonePreviewPlayer.playTone(
                                        frequencyHz: hz,
                                        isMuted: isAudioMuted
                                    )
                                }
                            }
                        } label: {
                            HStack(spacing: Theme.Spacing.xs) {
                                Image(systemName: target.symbol)
                                    .font(.kymaiaCaption)
                                Text(target.rawValue)
                                    .font(.kymaiaCaption.weight(.semibold))
                            }
                            .padding(.horizontal, Theme.Spacing.medium)
                            .padding(.vertical, Theme.Spacing.small)
                            .frame(minHeight: Theme.Dimension.minimumTarget)
                            .foregroundStyle(isSelected ? Color.kymaiaBackground : Theme.Colors.primaryText)
                            .background(
                                isSelected ? Theme.Colors.accent : Theme.Colors.secondaryBackground,
                                in: Capsule()
                            )
                            .overlay(
                                Capsule().strokeBorder(
                                    isSelected ? Theme.Colors.accent : Theme.Colors.border,
                                    lineWidth: Theme.Stroke.hairline
                                )
                            )
                            .contentShape(Capsule())
                        }
                        .buttonStyle(.plain)
                        .kymaiaPointerHighlight(Capsule())
                        .help(target.acousticNote)
                        .accessibilityAddTraits(isSelected ? .isSelected : [])
                        .accessibilityIdentifier("arduino.sonar.material.\(target.id)")
                    }
                }
            }
        }
    }

    // MARK: - What-If Parameter Controls

    private func whatIfControlsSection(for mission: ArduinoMission) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.small) {
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: "slider.horizontal.3")
                    .font(.kymaiaCaption)
                    .foregroundStyle(Theme.Colors.accent)
                Text("What-If circuit controls (updates code & telemetry live)")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.secondaryText)
                Spacer(minLength: 0)
                if paramValues != mission.defaultParamValues() {
                    Button {
                        withKymaiaAnimation(.kymaiaSpring) {
                            paramValues = mission.defaultParamValues()
                            focusedParamID = nil
                        }
                    } label: {
                        Text("Reset defaults")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Theme.Colors.accent)
                            .padding(.horizontal, Theme.Spacing.small)
                            .padding(.vertical, Theme.Spacing.xxs)
                            .frame(minHeight: Theme.Dimension.minimumTarget)
                            .contentShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .kymaiaPointerHighlight(Capsule())
                    .help("Reset all What-If parameters back to the mission's default sketch values")
                    .accessibilityIdentifier("arduino.visual.\(mission.id).resetParams")
                }
            }

            ForEach(mission.params) { param in
                paramControlRow(param, in: mission)
            }
        }
    }

    private func paramControlRow(_ param: ArduinoParam, in mission: ArduinoMission) -> some View {
        let currentValue = mission.resolvedValue(for: param.id, in: paramValues)
        let isFocused = focusedParamID == param.id

        return VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack(alignment: .firstTextBaseline) {
                Text(param.label)
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.primaryText)
                Spacer(minLength: Theme.Spacing.small)
                Text(formattedParamValue(param, value: currentValue))
                    .font(.kymaiaMonoCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.accent)
            }

            switch param.kind {
            case .choices(let choices):
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Theme.Spacing.xs) {
                        ForEach(choices) { choice in
                            let selected = currentValue == choice.value
                            Button {
                                withKymaiaAnimation(.kymaiaSpring) {
                                    updateParamValue(param, to: choice.value, in: mission)
                                }
                            } label: {
                                Text(choice.label)
                                    .font(.kymaiaCaption.weight(.semibold))
                                    .padding(.horizontal, Theme.Spacing.medium)
                                    .padding(.vertical, Theme.Spacing.xs)
                                    .frame(minHeight: Theme.Dimension.minimumTarget)
                                    .foregroundStyle(selected ? Color.kymaiaBackground : Theme.Colors.primaryText)
                                    .background(
                                        selected ? Theme.Colors.accent : Theme.Colors.secondaryBackground,
                                        in: Capsule()
                                    )
                                    .overlay(
                                        Capsule().strokeBorder(
                                            selected ? Theme.Colors.accent : Theme.Colors.border,
                                            lineWidth: Theme.Stroke.hairline
                                        )
                                    )
                                    .contentShape(Capsule())
                            }
                            .buttonStyle(.plain)
                            .kymaiaPointerHighlight(Capsule())
                            .help(choice.summary)
                            .accessibilityAddTraits(selected ? .isSelected : [])
                            .accessibilityIdentifier("arduino.param.\(mission.id).\(param.id).\(choice.value)")
                        }
                    }
                }

            case .range(let minVal, let maxVal, let step, let unit, _):
                Slider(
                    value: Binding(
                        get: { Double(currentValue) },
                        set: { newVal in
                            let snapped = Int((newVal / Double(max(1, step))).rounded()) * max(1, step)
                            let clamped = min(maxVal, max(minVal, snapped))
                            updateParamValue(param, to: clamped, in: mission)
                        }
                    ),
                    in: Double(minVal)...Double(maxVal),
                    step: Double(max(1, step))
                )
                .tint(Theme.Colors.accent)
                .accessibilityLabel(param.label)
                .accessibilityValue("\(currentValue) \(unit)")
                .accessibilityIdentifier("arduino.param.\(mission.id).\(param.id).slider")
            }
        }
        .padding(Theme.Spacing.small)
        .journalIllustrationSurface()
        .journalIllustrationClip()
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.small, style: .continuous)
                .strokeBorder(
                    isFocused ? Theme.Colors.accent : Theme.Colors.border,
                    lineWidth: Theme.Stroke.hairline
                )
        )
    }

    func updateParamValue(_ param: ArduinoParam, to newValue: Int, in mission: ArduinoMission) {
        paramValues[param.id] = newValue
        focusedParamID = param.id
        if let partIdx = mission.parts.firstIndex(where: {
            $0.localizedCaseInsensitiveContains(param.partFragment)
        }) {
            selectedPartIndex = partIdx
        }
        let telemetry = mission.telemetryReadout(with: paramValues, sonarTarget: sonarTarget)
        if let hz = telemetry.previewToneHz {
            ArduinoTonePreviewPlayer.playTone(frequencyHz: hz, isMuted: isAudioMuted)
        }
    }

    private func formattedParamValue(_ param: ArduinoParam, value: Int) -> String {
        switch param.kind {
        case .choices(let choices):
            return choices.first(where: { $0.value == value })?.summary ?? "\(value)"
        case .range(_, _, _, let unit, _):
            return "\(value) \(unit)"
        }
    }

    // MARK: - Clickable Part Hotspots Strip (Bidirectional Highlight)

    private func partHotspotsStrip(for mission: ArduinoMission) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text("Tap a part to highlight its pins & code lines:")
                .font(.kymaiaCaption)
                .foregroundStyle(Theme.Colors.secondaryText)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.Spacing.xs) {
                    ForEach(Array(mission.parts.enumerated()), id: \.offset) { idx, part in
                        let isSelected = selectedPartIndex == idx
                        Button {
                            withKymaiaAnimation(.kymaiaSpring) {
                                mission.togglePartSelection(
                                    at: idx,
                                    selectedPartIndex: &selectedPartIndex,
                                    focusedParamID: &focusedParamID
                                )
                            }
                        } label: {
                            HStack(spacing: Theme.Spacing.xs) {
                                Text("\(idx + 1)")
                                    .font(.kymaiaMonoCaption.weight(.bold))
                                    .padding(.horizontal, Theme.Spacing.xs)
                                    .padding(.vertical, 2)
                                    .background(
                                        isSelected
                                            ? Color.kymaiaBackground.opacity(0.22)
                                            : Theme.Colors.accent.opacity(0.14),
                                        in: Capsule()
                                    )
                                Text(part)
                                    .font(.kymaiaCaption.weight(.medium))
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(.horizontal, Theme.Spacing.small)
                            .padding(.vertical, Theme.Spacing.xs)
                            .frame(minHeight: Theme.Dimension.minimumTarget)
                            .foregroundStyle(isSelected ? Color.kymaiaBackground : Theme.Colors.primaryText)
                            .background(
                                isSelected ? Theme.Colors.accent : Theme.Colors.secondaryBackground,
                                in: Capsule()
                            )
                            .overlay(
                                Capsule().strokeBorder(
                                    isSelected ? Theme.Colors.accent : Theme.Colors.border,
                                    lineWidth: Theme.Stroke.hairline
                                )
                            )
                            .contentShape(Capsule())
                        }
                        .buttonStyle(.plain)
                        .kymaiaPointerHighlight(Capsule())
                        .help("Highlight \(part) in the sketch and diagram")
                        .accessibilityAddTraits(isSelected ? .isSelected : [])
                        .accessibilityIdentifier("arduino.visual.\(mission.id).partChip.\(idx)")
                    }
                }
            }
        }
    }
}
