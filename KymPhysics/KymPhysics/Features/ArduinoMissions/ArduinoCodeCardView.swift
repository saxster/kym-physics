import SwiftUI
#if os(macOS)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

// MARK: - Code Card with Gutter Line Numbers, Dry-Run Tracer & Serial Monitor Drawer

struct ArduinoCodeCardView: View {
    let mission: ArduinoMission
    let paramValues: [String: Int]
    @Binding var selectedPartIndex: Int?
    @Binding var focusedParamID: String?

    @State private var activeTraceStepIndex: Int?
    @State private var showSerialDrawer = false
    @State private var didCopyCode = false
    @AppStorage(ArduinoTonePreviewPlayer.muteStorageKey) private var isAudioMuted = false

    private var renderedSketch: String {
        mission.renderedCode(with: paramValues)
    }

    private var codeLines: [String] {
        renderedSketch.components(separatedBy: .newlines)
    }

    private var traceSteps: [ArduinoTraceStep] {
        mission.traceSteps(with: paramValues)
    }

    private var activeStep: ArduinoTraceStep? {
        guard let idx = activeTraceStepIndex, traceSteps.indices.contains(idx) else { return nil }
        return traceSteps[idx]
    }

    private var highlightedLines: Set<Int> {
        var lines = mission.highlightedLineNumbers(
            forSelectedPartIndex: selectedPartIndex,
            focusedParamID: focusedParamID,
            values: paramValues
        )
        if let stepLine = activeStep?.lineNumber {
            lines.insert(stepLine)
        }
        return lines
    }

    private var serialHeaderBadge: String {
        mission.code.contains("Serial.begin") ? "9600 baud" : "Pin state monitor"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.medium) {
            codeToolbar

            codeListingSurface

            dryRunTracerStrip

            if showSerialDrawer || activeStep != nil {
                serialMonitorDrawer
            }

            if !mission.codeWalkthrough.isEmpty {
                walkthroughSection
            }
        }
        .onChange(of: renderedSketch) { _, _ in
            didCopyCode = false
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("arduino.codeCard.\(mission.id)")
    }

    // MARK: - Top Toolbar (Step Tracer, Serial Drawer Toggle, Copy Code)

    private var codeToolbar: some View {
        HStack(spacing: Theme.Spacing.small) {
            Button {
                withKymaiaAnimation(.kymaiaSpring) {
                    advanceOrStartTrace()
                }
            } label: {
                Label(
                    activeTraceStepIndex == nil
                        ? "Step through loop()"
                        : "Next step (\((activeTraceStepIndex ?? 0) + 1)/\(traceSteps.count))",
                    systemImage: activeTraceStepIndex == nil ? "play.circle.fill" : "forward.frame.fill"
                )
                .font(.kymaiaCaption.weight(.semibold))
                .padding(.horizontal, Theme.Spacing.medium)
                .padding(.vertical, Theme.Spacing.xs)
                .frame(minHeight: Theme.Dimension.minimumTarget)
                .foregroundStyle(Color.kymaiaBackground)
                .background(Theme.Colors.accent, in: Capsule())
                .contentShape(Capsule())
            }
            .buttonStyle(.plain)
            .kymaiaPointerHighlight(Capsule())
            .help("Step through setup() and loop() line by line with live register and Serial output")
            .accessibilityIdentifier("arduino.code.\(mission.id).stepButton")

            if activeTraceStepIndex != nil {
                Button {
                    withKymaiaAnimation(.kymaiaSpring) {
                        activeTraceStepIndex = nil
                    }
                } label: {
                    Label("Stop", systemImage: "stop.circle")
                        .font(.kymaiaCaption.weight(.semibold))
                        .padding(.horizontal, Theme.Spacing.small)
                        .padding(.vertical, Theme.Spacing.xs)
                        .frame(minHeight: Theme.Dimension.minimumTarget)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .background(Theme.Colors.secondaryBackground, in: Capsule())
                        .contentShape(Capsule())
                }
                .buttonStyle(.plain)
                .kymaiaPointerHighlight(Capsule())
                .help("Exit dry-run trace mode")
                .accessibilityIdentifier("arduino.code.\(mission.id).resetTraceButton")
            }

            Button {
                withKymaiaAnimation(.kymaiaSpring) {
                    showSerialDrawer.toggle()
                }
            } label: {
                Label("Serial Monitor", systemImage: "terminal")
                    .font(.kymaiaCaption.weight(.semibold))
                    .padding(.horizontal, Theme.Spacing.small)
                    .padding(.vertical, Theme.Spacing.xs)
                    .frame(minHeight: Theme.Dimension.minimumTarget)
                    .foregroundStyle(showSerialDrawer ? Theme.Colors.accent : Theme.Colors.primaryText)
                    .background(
                        showSerialDrawer ? Theme.Colors.accent.opacity(0.12) : Theme.Colors.secondaryBackground,
                        in: Capsule()
                    )
                    .overlay(
                        Capsule().strokeBorder(
                            showSerialDrawer ? Theme.Colors.accent : Theme.Colors.border,
                            lineWidth: Theme.Stroke.hairline
                        )
                    )
                    .contentShape(Capsule())
            }
            .buttonStyle(.plain)
            .kymaiaPointerHighlight(Capsule())
            .help("Toggle the simulated Serial Monitor & Serial Plotter drawer")
            .accessibilityAddTraits(showSerialDrawer ? .isSelected : [])
            .accessibilityIdentifier("arduino.code.\(mission.id).serialToggle")

            Spacer(minLength: 0)

            Button {
                copyCodeToPasteboard()
            } label: {
                Label(
                    didCopyCode ? "Copied" : "Copy code",
                    systemImage: didCopyCode ? "checkmark.circle.fill" : "doc.on.doc"
                )
                .font(.kymaiaCaption.weight(.semibold))
                .padding(.horizontal, Theme.Spacing.small)
                .padding(.vertical, Theme.Spacing.xs)
                .frame(minHeight: Theme.Dimension.minimumTarget)
                .foregroundStyle(didCopyCode ? Theme.Colors.success : Theme.Colors.accent)
                .background(Theme.Colors.secondaryBackground, in: Capsule())
                .overlay(
                    Capsule().strokeBorder(Theme.Colors.border, lineWidth: Theme.Stroke.hairline)
                )
                .contentShape(Capsule())
            }
            .buttonStyle(.plain)
            .kymaiaPointerHighlight(Capsule())
            .help("Copy the Arduino sketch (including your current What-If parameter values) to the clipboard")
            .accessibilityIdentifier("arduino.code.\(mission.id).copyButton")
        }
    }

    // MARK: - Code Listing with Gutter Line Numbers & Active Execution Bar

    private var codeListingSurface: some View {
        ScrollView(.horizontal, showsIndicators: true) {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(codeLines.enumerated()), id: \.offset) { idx, line in
                    let lineNum = idx + 1
                    let isTraceActive = activeStep?.lineNumber == lineNum
                    let isHighlighted = highlightedLines.contains(lineNum)

                    HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.small) {
                        Rectangle()
                            .fill(
                                isTraceActive
                                    ? Theme.Colors.warning
                                    : (isHighlighted ? Theme.Colors.accent : Color.clear)
                            )
                            .frame(width: 3, height: 18)

                        Text(String(format: "%2d", lineNum))
                            .font(.kymaiaMonoCaption)
                            .foregroundStyle(
                                isTraceActive ? Theme.Colors.warning : Theme.Colors.secondaryText
                            )
                            .frame(width: 24, alignment: .trailing)
                            .accessibilityHidden(true)

                        styledCodeLine(line, isTraceActive: isTraceActive, isHighlighted: isHighlighted)
                    }
                    .padding(.vertical, 2)
                    .padding(.trailing, Theme.Spacing.medium)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        isTraceActive
                            ? Theme.Colors.warning.opacity(0.14)
                            : (isHighlighted ? Theme.Colors.accent.opacity(0.10) : Color.clear)
                    )
                }
            }
            .padding(.vertical, Theme.Spacing.small)
            .textSelection(.enabled)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Arduino code for \(mission.title)")
            .accessibilityValue(renderedSketch)
            .accessibilityIdentifier("arduino.code.\(mission.id)")
        }
        .journalIllustrationSurface()
        .journalIllustrationClip()
    }

    private func styledCodeLine(
        _ line: String,
        isTraceActive: Bool,
        isHighlighted: Bool
    ) -> some View {
        let parts = line.components(separatedBy: "//")
        let codePart = parts.first ?? line
        let commentPart = parts.count > 1 ? "//" + parts.dropFirst().joined(separator: "//") : nil

        return HStack(alignment: .firstTextBaseline, spacing: 0) {
            Text(codePart)
                .font(.kymaiaCode)
                .foregroundStyle(
                    isTraceActive || isHighlighted
                        ? Theme.Colors.primaryText
                        : Theme.Colors.primaryText.opacity(0.92)
                )
            if let commentPart {
                Text(commentPart)
                    .font(.kymaiaCode)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
    }

    // MARK: - Dry-Run Step Selector Strip

    private var dryRunTracerStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.xs) {
                ForEach(traceSteps) { step in
                    let isSelected = activeStep?.id == step.id
                    Button {
                        withKymaiaAnimation(.kymaiaSpring) {
                            activeTraceStepIndex = step.id
                            showSerialDrawer = true
                            if let hz = step.toneHz {
                                ArduinoTonePreviewPlayer.playTone(
                                    frequencyHz: hz,
                                    isMuted: isAudioMuted
                                )
                            }
                        }
                    } label: {
                        HStack(spacing: Theme.Spacing.xs) {
                            Text("L\(step.lineNumber)")
                                .font(.kymaiaMonoCaption.weight(.bold))
                                .padding(.horizontal, Theme.Spacing.xs)
                                .padding(.vertical, 2)
                                .background(
                                    isSelected
                                        ? Color.kymaiaBackground.opacity(0.22)
                                        : Theme.Colors.accent.opacity(0.14),
                                    in: Capsule()
                                )
                            Text(step.title)
                                .font(.kymaiaCaption.weight(.medium))
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
                    .help("Jump to trace step \(step.title) (Line \(step.lineNumber))")
                    .accessibilityAddTraits(isSelected ? .isSelected : [])
                    .accessibilityIdentifier("arduino.code.\(mission.id).traceStep.\(step.id)")
                }
            }
        }
    }

    // MARK: - Slide-Up Serial Monitor & Plotter Drawer

    private var serialMonitorDrawer: some View {
        let telemetry = mission.telemetryReadout(with: paramValues)
        let currentSerial = activeStep?.serialOutput ?? telemetry.outcomeText
        let currentRegisters = activeStep?.registersSummary ?? telemetry.voltageOrSignalText

        return VStack(alignment: .leading, spacing: Theme.Spacing.small) {
            HStack(alignment: .firstTextBaseline) {
                Label("Serial Monitor & Plotter", systemImage: "waveform.path.ecg.rectangle")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.accent)
                Spacer(minLength: Theme.Spacing.small)
                Text(serialHeaderBadge)
                    .font(.kymaiaMonoCaption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }

            HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.xs) {
                Text("REGISTERS:")
                    .font(.kymaiaMonoCaption.weight(.bold))
                    .foregroundStyle(Theme.Colors.secondaryText)
                Text(currentRegisters)
                    .font(.kymaiaMonoCaption)
                    .foregroundStyle(Theme.Colors.primaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(alignment: .top, spacing: Theme.Spacing.xs) {
                Text(">")
                    .font(.kymaiaCode.weight(.bold))
                    .foregroundStyle(Theme.Colors.success)
                Text(currentSerial)
                    .font(.kymaiaCode)
                    .foregroundStyle(Theme.Colors.primaryText)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .padding(Theme.Spacing.small)
            .frame(maxWidth: .infinity, alignment: .leading)
            .journalIllustrationSurface()
            .journalIllustrationClip()

            plotterSparkline(samples: telemetry.plotterSamples, activePlotterValue: activeStep?.plotterValue)
        }
        .padding(Theme.Spacing.medium)
        .frame(maxWidth: .infinity, alignment: .leading)
        .journalIllustrationSurface()
        .journalIllustrationClip()
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("arduino.code.\(mission.id).serialDrawer")
    }

    private func plotterSparkline(samples: [Int], activePlotterValue: Int?) -> some View {
        let combinedSamples = activePlotterValue.map { samples + [$0] } ?? samples
        let maxSample = max(1, combinedSamples.max() ?? 1)
        let minSample = min(0, combinedSamples.min() ?? 0)
        let span = Double(max(1, maxSample - minSample))

        return HStack(alignment: .bottom, spacing: Theme.Spacing.xs) {
            Text("PLOTTER")
                .font(.kymaiaMonoCaption.weight(.bold))
                .foregroundStyle(Theme.Colors.secondaryText)
            ForEach(Array(combinedSamples.enumerated()), id: \.offset) { idx, sample in
                let normalized = CGFloat(Double(sample - minSample) / span)
                let isLatestTraceSample = activePlotterValue != nil && idx == combinedSamples.count - 1
                VStack(spacing: 2) {
                    RoundedRectangle(cornerRadius: Theme.Radius.xs)
                        .fill(
                            isLatestTraceSample
                                ? Theme.Colors.warning
                                : Theme.Colors.accent.opacity(0.75)
                        )
                        .frame(width: 14, height: max(4, normalized * 28))
                    Text("\(sample)")
                        .font(.kymaiaMonoCaption)
                        .foregroundStyle(
                            isLatestTraceSample ? Theme.Colors.warning : Theme.Colors.secondaryText
                        )
                }
            }
            Spacer(minLength: 0)
        }
    }

    // MARK: - Line-by-Line Code Walkthrough

    private var walkthroughSection: some View {
        DisclosureGroup("How the code works (line by line)") {
            VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                ForEach(Array(mission.codeWalkthrough.enumerated()), id: \.offset) { idx, note in
                    HStack(alignment: .top, spacing: Theme.Spacing.small) {
                        Text("\(idx + 1).")
                            .font(.kymaiaMonoCaption.weight(.bold))
                            .foregroundStyle(Theme.Colors.accent)
                            .frame(width: 20, alignment: .leading)
                        Text(note)
                            .font(.kymaiaBody)
                            .foregroundStyle(Theme.Colors.primaryText)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .padding(.top, Theme.Spacing.small)
        }
        .font(.kymaiaSubheadline)
        .foregroundStyle(Theme.Colors.primaryText)
        .accessibilityIdentifier("arduino.code.\(mission.id).walkthrough")
    }

    // MARK: - Actions

    private func advanceOrStartTrace() {
        guard !traceSteps.isEmpty else { return }
        showSerialDrawer = true
        let nextIndex: Int
        if let current = activeTraceStepIndex {
            nextIndex = (current + 1) % traceSteps.count
        } else {
            nextIndex = 0
        }
        activeTraceStepIndex = nextIndex
        if let hz = traceSteps[nextIndex].toneHz {
            ArduinoTonePreviewPlayer.playTone(frequencyHz: hz, isMuted: isAudioMuted)
        }
    }

    private func copyCodeToPasteboard() {
        #if os(macOS)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(renderedSketch, forType: .string)
        #elseif canImport(UIKit)
        UIPasteboard.general.string = renderedSketch
        #endif
        withKymaiaAnimation(.kymaiaSpring) {
            didCopyCode = true
        }
    }
}
