import SwiftUI

// MARK: - Stage Nodes & Canvas Circuit Loop

extension ArduinoMissionVisualView {
    struct Stage {
        let symbol: String
        let title: String
        let subtitle: String
        var isActive: Bool = false
    }

    func stagePill(_ stage: Stage, isCompact: Bool, isHighlighted: Bool = false) -> some View {
        VStack(spacing: Theme.Spacing.xxs) {
            Image(systemName: stage.symbol)
                .font(isCompact ? .kymaiaBody : .kymaiaTitle3)
                .foregroundStyle(stage.isActive ? Theme.Colors.warning : Theme.Colors.accent)
                .frame(height: isCompact ? 22 : 28)
            Text(stage.title)
                .font(.kymaiaCaption.weight(.semibold))
                .foregroundStyle(Theme.Colors.primaryText)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            if !isCompact {
                Text(stage.subtitle)
                    .font(.kymaiaMonoCaption)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.vertical, isCompact ? Theme.Spacing.xs : Theme.Spacing.small)
        .padding(.horizontal, Theme.Spacing.small)
        .frame(
            maxWidth: .infinity,
            minHeight: isCompact ? 0 : Theme.Dimension.minimumTarget
        )
        .journalIllustrationSurface()
        .journalIllustrationClip()
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.small, style: .continuous)
                .strokeBorder(
                    isHighlighted
                        ? Theme.Colors.accent
                        : (stage.isActive ? Theme.Colors.warning : Theme.Colors.border),
                    lineWidth: (isHighlighted || stage.isActive) ? 1.5 : Theme.Stroke.hairline
                )
        )
    }

    // MARK: - Canvas Circuit Loop with Orthogonal Wires, Flow Chevrons & Leader Line

    func drawCircuitLoop(
        context: inout GraphicsContext,
        size: CGSize,
        selectedPartIndex: Int?
    ) {
        let leftX = size.width * 0.14
        let midX = size.width * 0.50
        let rightX = size.width * 0.86
        let topY = size.height * 0.14
        let signalY = size.height * 0.44
        let bottomY = size.height * 0.84

        var supplyRail = Path()
        supplyRail.move(to: CGPoint(x: leftX, y: signalY))
        supplyRail.addLine(to: CGPoint(x: leftX, y: topY))
        supplyRail.addLine(to: CGPoint(x: rightX, y: topY))
        supplyRail.addLine(to: CGPoint(x: rightX, y: signalY))
        context.stroke(
            supplyRail,
            with: .color(Theme.Colors.error.opacity(0.28)),
            style: StrokeStyle(lineWidth: 1.5, dash: [5, 3])
        )

        var signalWire = Path()
        signalWire.move(to: CGPoint(x: leftX, y: signalY))
        signalWire.addLine(to: CGPoint(x: rightX, y: signalY))
        context.stroke(
            signalWire,
            with: .color(Theme.Colors.accent.opacity(0.32)),
            style: StrokeStyle(lineWidth: 2, dash: [4, 3])
        )

        var gndLoop = Path()
        gndLoop.move(to: CGPoint(x: rightX, y: signalY + 12))
        gndLoop.addLine(to: CGPoint(x: rightX, y: bottomY))
        gndLoop.addLine(to: CGPoint(x: leftX, y: bottomY))
        gndLoop.addLine(to: CGPoint(x: leftX, y: signalY + 12))
        context.stroke(
            gndLoop,
            with: .color(Theme.Colors.secondaryText.opacity(0.26)),
            style: StrokeStyle(lineWidth: 1.5, dash: [3, 3])
        )

        drawChevron(
            context: &context,
            center: CGPoint(x: (leftX + midX) * 0.5, y: topY),
            pointsRight: true,
            color: Theme.Colors.error.opacity(0.55)
        )
        drawChevron(
            context: &context,
            center: CGPoint(x: (midX + rightX) * 0.5, y: topY),
            pointsRight: true,
            color: Theme.Colors.error.opacity(0.55)
        )
        drawChevron(
            context: &context,
            center: CGPoint(x: (leftX + midX) * 0.5, y: bottomY),
            pointsRight: false,
            color: Theme.Colors.secondaryText.opacity(0.55)
        )
        drawChevron(
            context: &context,
            center: CGPoint(x: (midX + rightX) * 0.5, y: bottomY),
            pointsRight: false,
            color: Theme.Colors.secondaryText.opacity(0.55)
        )

        if let selectedPartIndex {
            let anchorX: CGFloat
            switch selectedPartIndex % 3 {
            case 0: anchorX = leftX
            case 1: anchorX = midX
            default: anchorX = rightX
            }
            var leader = Path()
            leader.move(to: CGPoint(x: anchorX, y: signalY + 16))
            leader.addLine(to: CGPoint(x: anchorX, y: size.height - 2))
            context.stroke(
                leader,
                with: .color(Theme.Colors.accent),
                style: StrokeStyle(lineWidth: 1.6, dash: [3, 2])
            )
        }
    }

    private func drawChevron(
        context: inout GraphicsContext,
        center: CGPoint,
        pointsRight: Bool,
        color: Color
    ) {
        let dir: CGFloat = pointsRight ? 1 : -1
        var chevron = Path()
        chevron.move(to: CGPoint(x: center.x - 4 * dir, y: center.y - 3.5))
        chevron.addLine(to: CGPoint(x: center.x + 3 * dir, y: center.y))
        chevron.addLine(to: CGPoint(x: center.x - 4 * dir, y: center.y + 3.5))
        context.stroke(chevron, with: .color(color), lineWidth: 1.5)
    }

    func interactiveStages(for mission: ArduinoMission) -> [Stage] {
        switch mission.missionID {
        case .firstLight:
            let blinkMs = mission.resolvedValue(for: "delayMs", in: paramValues)
            let res = mission.resolvedValue(for: "resistor", in: paramValues)
            return [
                Stage(symbol: "cpu", title: "Pin 13", subtitle: "HIGH / LOW (\(blinkMs) ms)", isActive: true),
                Stage(symbol: "rectangle.compress.vertical", title: "\(res)Ω Resistor", subtitle: "limits current"),
                Stage(symbol: "lightbulb.fill", title: "LED -> GND", subtitle: res <= 220 ? "bright blink" : "soft glow", isActive: true)
            ]
        case .morseLamp:
            let holdMs = mission.resolvedValue(for: "holdMs", in: paramValues)
            let hz = mission.resolvedValue(for: "pitchHz", in: paramValues)
            return [
                Stage(symbol: "hand.tap.fill", title: "Pin 2 Button", subtitle: "dot < \(holdMs) ms", isActive: true),
                Stage(symbol: "lightbulb.fill", title: "Pin 13 Lamp", subtitle: "flashes code", isActive: true),
                Stage(symbol: "speaker.wave.2.fill", title: "Pin 9 Buzzer", subtitle: "tone(\(hz) Hz)", isActive: true)
            ]
        case .diaryAlarm:
            let triggered = mission.resolvedValue(for: "motionState", in: paramValues) > 0
            let hz = mission.resolvedValue(for: "alarmHz", in: paramValues)
            return [
                Stage(symbol: "shippingbox", title: "PIR in Box", subtitle: triggered ? "warm hand!" : "30s settled", isActive: triggered),
                Stage(symbol: "cpu", title: "Pin 2 -> Uno", subtitle: triggered ? "HIGH (motion!)" : "LOW (still)", isActive: triggered),
                Stage(symbol: "bell.and.waves.left.and.right.fill", title: "Pin 8 Chirp", subtitle: triggered ? "\(hz) Hz (300 ms)" : "silent", isActive: triggered)
            ]
        case .beamGuard:
            let light = mission.resolvedValue(for: "lightLevel", in: paramValues)
            let thresh = mission.resolvedValue(for: "threshold", in: paramValues)
            let tripped = light < thresh
            return [
                Stage(symbol: "flashlight.on.fill", title: "Torch -> LDR", subtitle: "A0 = \(light)"),
                Stage(symbol: "chart.xyaxis.line", title: "Rule < \(thresh)", subtitle: tripped ? "BEAM BROKEN" : "bright", isActive: tripped),
                Stage(symbol: "bell.fill", title: "Pin 8 Alarm", subtitle: tripped ? "900 Hz (200 ms)" : "armed", isActive: tripped)
            ]
        case .sonarSweep:
            let trueCm = mission.resolvedValue(for: "distanceCM", in: paramValues)
            let cm = sonarTarget.simulatedDistanceCm(trueDistanceCm: trueCm)
            let hz = max(200, min(2000, 1800 - cm * 10))
            return [
                Stage(symbol: "dot.radiowaves.left.and.right", title: "HC-SR04 Ping", subtitle: "TRIG D9 / ECHO D10", isActive: true),
                Stage(symbol: sonarTarget.symbol, title: sonarTarget.rawValue, subtitle: sonarTarget.swallowsPulse ? "0 us timeout" : "cm = \(cm)", isActive: !sonarTarget.swallowsPulse),
                Stage(symbol: "waveform", title: "Pin 6 Sweep", subtitle: cm < 150 ? "15°..165° (\(hz) Hz)" : "400 cm fallback", isActive: cm < 150)
            ]
        case .truthMeter:
            let reading = mission.resolvedValue(for: "skinReading", in: paramValues)
            let redLimit = mission.resolvedValue(for: "deltaThreshold", in: paramValues)
            let delta = abs(reading - 512)
            return [
                Stage(symbol: "hand.point.up.left.fill", title: "2 Foil Pads", subtitle: "A0 = \(reading)", isActive: delta >= 15),
                Stage(symbol: "waveform.path.ecg", title: "change = \(delta)", subtitle: "abs(val - 512)", isActive: delta >= 15),
                Stage(symbol: "trafficlight", title: "D11 / D12 / D13", subtitle: delta < 15 ? "Green (Calm)" : (delta < redLimit ? "Yellow (Warm)" : "Red (Spike)"), isActive: delta >= redLimit)
            ]
        case .feederCam:
            let awake = mission.resolvedValue(for: "pirTrigger", in: paramValues) > 0
            let sleepMa = mission.resolvedValue(for: "sleepMode", in: paramValues)
            return [
                Stage(symbol: "bird.fill", title: "PIR Motion", subtitle: awake ? "GPIO 13 HIGH" : "GPIO 13 LOW", isActive: awake),
                Stage(symbol: "camera.fill", title: "ESP32-CAM", subtitle: awake ? "wake -> snap" : "sleeping (~\(sleepMa) mA)", isActive: awake),
                Stage(symbol: "sdcard.fill", title: "microSD Card", subtitle: awake ? "photo saved!" : "zzz... battery saved", isActive: awake)
            ]
        case .visitorCounter:
            let broken = mission.resolvedValue(for: "beamState", in: paramValues) > 0
            let debounce = mission.resolvedValue(for: "debounceSec", in: paramValues)
            return [
                Stage(symbol: "rays", title: "IR Break-Beam", subtitle: "across perch"),
                Stage(symbol: "bird", title: "Pin 3 Edge", subtitle: broken ? "LOW (+\(debounce)s)" : "HIGH (clear)", isActive: broken),
                Stage(symbol: "number.square.fill", title: "Visits = \(broken ? 12 : 11)", subtitle: "timestamped log", isActive: broken)
            ]
        case .dawnLogger:
            let minute = mission.resolvedValue(for: "dawnMinute", in: paramValues)
            let light = min(980, 40 + minute * 14)
            let tempC = light < 200 ? 9 : (light < 550 ? 12 : 16)
            return [
                Stage(symbol: "sunrise.fill", title: "LDR + DHT11", subtitle: "light=\(light), \(tempC)°C", isActive: light >= 200),
                Stage(symbol: "clock.fill", title: "Every 60 s", subtitle: "millis() / 60000"),
                Stage(symbol: "chart.line.uptrend.xyaxis", title: "CSV Graph", subtitle: "minute,light,tempC", isActive: light >= 200)
            ]
        case .fieldAgent:
            let visits = mission.resolvedValue(for: "counterVisits", in: paramValues)
            let birds = mission.resolvedValue(for: "cameraConfirmed", in: paramValues)
            return [
                Stage(symbol: "camera.viewfinder", title: "Camera + Beam", subtitle: "\(visits) counts / \(birds) birds", isActive: true),
                Stage(symbol: "cloud.sun.fill", title: "+ Dawn Logger", subtitle: "light + tempC"),
                Stage(symbol: "doc.text.magnifyingglass", title: "Evidence Board", subtitle: "claim + evidence", isActive: true)
            ]
        }
    }

    func staticStages(for kind: String) -> [Stage] {
        switch kind {
        case "blink", "led":
            return [
                Stage(symbol: "cpu", title: "Pin 13", subtitle: "5V when HIGH"),
                Stage(symbol: "rectangle.compress.vertical", title: "220Ω Resistor", subtitle: "limits current"),
                Stage(symbol: "lightbulb.fill", title: "LED -> GND", subtitle: "long leg +, short -")
            ]
        case "morse":
            return [
                Stage(symbol: "hand.tap.fill", title: "Pin 2 Button", subtitle: "short · / long -"),
                Stage(symbol: "lightbulb.fill", title: "Pin 13 Lamp", subtitle: "flashes code"),
                Stage(symbol: "terminal.fill", title: "Serial 9600", subtitle: "prints . and -")
            ]
        case "pir":
            return [
                Stage(symbol: "shippingbox", title: "PIR in Box", subtitle: "watches for warm hand"),
                Stage(symbol: "cpu", title: "Pin 2 -> Uno", subtitle: "HIGH = motion!"),
                Stage(symbol: "bell.and.waves.left.and.right.fill", title: "Pin 8 Buzzer", subtitle: "1200 Hz chirp")
            ]
        case "beam", "ldr":
            return [
                Stage(symbol: "flashlight.on.fill", title: "Torch -> LDR", subtitle: "bright = high reading"),
                Stage(symbol: "chart.xyaxis.line", title: "Pin A0 (0–1023)", subtitle: "shadow drops below 500"),
                Stage(symbol: "bell.fill", title: "Pin 8 Alarm", subtitle: "BEAM BROKEN logged")
            ]
        case "sonar":
            return [
                Stage(symbol: "dot.radiowaves.left.and.right", title: "HC-SR04 Ping", subtitle: "TRIG sends, ECHO listens"),
                Stage(symbol: "ruler", title: "cm = us * 0.034 / 2", subtitle: "speed of sound math"),
                Stage(symbol: "safari.fill", title: "Servo Sweep", subtitle: "15° to 165° radar")
            ]
        case "truth", "gsr":
            return [
                Stage(symbol: "hand.point.up.left.fill", title: "2 Foil Pads", subtitle: "gentle 5V through fingers"),
                Stage(symbol: "waveform.path.ecg", title: "Baseline vs Now", subtitle: "sweat changes A0"),
                Stage(symbol: "trafficlight", title: "Green / Yellow / Red", subtitle: "calm -> nervous (or laughing!)")
            ]
        case "birdcam":
            return [
                Stage(symbol: "bird.fill", title: "PIR senses warm motion", subtitle: "bird lands"),
                Stage(symbol: "camera.fill", title: "ESP32-CAM Wakes", subtitle: "was in deep sleep"),
                Stage(symbol: "sdcard.fill", title: "Photo -> microSD", subtitle: "back to sleep to save battery")
            ]
        case "counter", "breakbeam":
            return [
                Stage(symbol: "rays", title: "IR LED -> Receiver", subtitle: "invisible beam across perch"),
                Stage(symbol: "bird", title: "Wing Breaks Beam", subtitle: "Pin 3 drops LOW"),
                Stage(symbol: "number.square.fill", title: "Visits + 1", subtitle: "edge counted once")
            ]
        case "logger":
            return [
                Stage(symbol: "sunrise.fill", title: "LDR + DHT11", subtitle: "light & temp outside"),
                Stage(symbol: "clock.fill", title: "Every 60 s", subtitle: "all night, dawn to sunrise"),
                Stage(symbol: "chart.line.uptrend.xyaxis", title: "CSV -> Graph", subtitle: "when does dawn wake the birds?")
            ]
        default:
            return [
                Stage(symbol: "camera.viewfinder", title: "Camera Trap", subtitle: "WHO visited"),
                Stage(symbol: "number.square", title: "+ Beam Counter", subtitle: "HOW MANY & WHEN"),
                Stage(symbol: "cloud.sun.fill", title: "+ Dawn Logger", subtitle: "UNDER WHAT WEATHER")
            ]
        }
    }
}
