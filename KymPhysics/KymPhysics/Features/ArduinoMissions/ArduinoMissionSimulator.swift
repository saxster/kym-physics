import Foundation

// MARK: - Dry-Run Trace Step & Telemetry

struct ArduinoTraceStep: Identifiable, Hashable, Sendable {
    let id: Int
    let title: String
    let lineNumber: Int
    let registersSummary: String
    let serialOutput: String
    let plotterValue: Int?
    let toneHz: Int?
}

struct ArduinoLiveTelemetry: Hashable, Sendable {
    let badgeText: String
    let voltageOrSignalText: String
    let outcomeText: String
    let plotterSamples: [Int]
    let previewToneHz: Int?
}

// MARK: - Mission Simulator Extension

extension ArduinoMission {
    func defaultParamValues() -> [String: Int] {
        var result: [String: Int] = [:]
        for param in params {
            result[param.id] = param.defaultValue
        }
        return result
    }

    func resolvedValue(for paramID: String, in values: [String: Int]) -> Int {
        if let explicit = values[paramID] {
            return explicit
        }
        return params.first(where: { $0.id == paramID })?.defaultValue ?? 0
    }

    /// Renders the Arduino sketch with interactive "What-If" parameter values substituted in.
    func renderedCode(with values: [String: Int]) -> String {
        var output = code
        for param in params {
            let val = resolvedValue(for: param.id, in: values)
            output = param.applying(value: val, to: output)
        }
        return output
    }

    /// Computes live telemetry for the interactive bench diagram and floating readout pill.
    func telemetryReadout(
        with values: [String: Int],
        sonarTarget: ArduinoSonarTarget = .hardBook
    ) -> ArduinoLiveTelemetry {
        switch missionID {
        case .firstLight:
            let blinkMs = max(100, resolvedValue(for: "delayMs", in: values))
            let resistor = resolvedValue(for: "resistor", in: values)
            let currentMa = String(format: "%.1f", 3.0 / Double(max(100, resistor)) * 1000.0)
            let hz = String(format: "%.2f", 1000.0 / Double(blinkMs * 2))
            return ArduinoLiveTelemetry(
                badgeText: "Pin 13 -> \(blinkMs) ms (\(hz) Hz)",
                voltageOrSignalText: "5.0V - 2.0V LED = 3.0V across \(resistor)Ω -> \(currentMa) mA",
                outcomeText: resistor <= 220
                    ? "Bright red blink (\(currentMa) mA safe)"
                    : "Softer LED glow (\(currentMa) mA through \(resistor)Ω)",
                plotterSamples: [0, 5, 0, 5, 0, 5, 0, 5],
                previewToneHz: nil
            )

        case .morseLamp:
            let holdMs = max(100, resolvedValue(for: "holdMs", in: values))
            let pitchHz = resolvedValue(for: "pitchHz", in: values)
            return ArduinoLiveTelemetry(
                badgeText: "cutoff < \(holdMs) ms · \(pitchHz) Hz",
                voltageOrSignalText: "D2 INPUT_PULLUP -> D13 lamp + optional \(pitchHz) Hz buzzer",
                outcomeText: "Press < \(holdMs) ms prints '.' (dot) · >= \(holdMs) ms prints '-' (dash)",
                plotterSamples: [1, 0, 3, 0, 1, 0, 3, 0],
                previewToneHz: pitchHz
            )

        case .diaryAlarm:
            let motionState = resolvedValue(for: "motionState", in: values)
            let alarmHz = resolvedValue(for: "alarmHz", in: values)
            let triggered = motionState > 0
            return ArduinoLiveTelemetry(
                badgeText: triggered ? "D2 == HIGH (Motion!)" : "D2 == LOW (Quiet)",
                voltageOrSignalText: triggered
                    ? "PIR OUT = 3.3V (HIGH) -> D8 tone(\(alarmHz) Hz, 300 ms)"
                    : "PIR OUT = 0.0V (LOW) -> D13 lamp LOW",
                outcomeText: triggered
                    ? "Warm hand detected -> D13 lamp HIGH + \(alarmHz) Hz warning chirp"
                    : "Box quiet — PIR settled after 30s warm-up",
                plotterSamples: triggered ? [0, 1, 1, 1, 1, 1, 0, 0] : [0, 0, 0, 0, 0, 0, 0, 0],
                previewToneHz: triggered ? alarmHz : nil
            )

        case .beamGuard:
            let ambient = resolvedValue(for: "lightLevel", in: values)
            let threshold = resolvedValue(for: "threshold", in: values)
            let tripped = ambient < threshold
            let voltage = String(format: "%.2f", Double(ambient) / 1023.0 * 5.0)
            return ArduinoLiveTelemetry(
                badgeText: "A0 = \(ambient) (\(voltage)V) vs < \(threshold)",
                voltageOrSignalText: "5V -> LDR -> A0 (\(voltage)V) -> 10kΩ -> GND",
                outcomeText: tripped
                    ? "BEAM BROKEN (\(ambient) < \(threshold)) -> Pin 8 900 Hz beep"
                    : "Beam intact (\(ambient) >= \(threshold)) -> Den entrance clear",
                plotterSamples: [
                    max(50, threshold + 220),
                    max(50, threshold + 210),
                    ambient,
                    ambient,
                    max(50, threshold + 200),
                    ambient
                ],
                previewToneHz: tripped ? 900 : nil
            )

        case .sonarSweep:
            let trueCm = resolvedValue(for: "distanceCM", in: values)
            let measuredCm = sonarTarget.simulatedDistanceCm(trueDistanceCm: trueCm)
            let echoUs = sonarTarget.swallowsPulse ? 0 : Int((Double(measuredCm) / 0.017).rounded())
            let noteHz = max(200, min(2000, 1800 - measuredCm * 10))
            let inRange = measuredCm < 150
            return ArduinoLiveTelemetry(
                badgeText: sonarTarget.swallowsPulse
                    ? "\(sonarTarget.rawValue): 0 us timeout -> 400 cm"
                    : "Echo \(echoUs) us -> \(measuredCm) cm",
                voltageOrSignalText: sonarTarget.acousticNote,
                outcomeText: inRange
                    ? "Target at \(measuredCm) cm -> Pin 6 sweep log + \(noteHz) Hz ping"
                    : "Out of range (\(measuredCm) cm >= 150 cm) -> 400 cm fallback",
                plotterSamples: sonarTarget.swallowsPulse
                    ? [trueCm, 400, 400, trueCm, 400, 400]
                    : [
                        max(5, measuredCm - sonarTarget.jitterCm),
                        measuredCm,
                        min(160, measuredCm + sonarTarget.jitterCm),
                        measuredCm
                    ],
                previewToneHz: inRange ? noteHz : nil
            )

        case .truthMeter:
            let reading = resolvedValue(for: "skinReading", in: values)
            let redLimit = resolvedValue(for: "deltaThreshold", in: values)
            let baseline = 512
            let delta = abs(reading - baseline)
            let zone: String
            if delta < 15 {
                zone = "Green LED (D11) — Calm (< 15)"
            } else if delta < redLimit {
                zone = "Yellow LED (D12) — Laughing / Warm (15–\(redLimit - 1))"
            } else {
                zone = "Red LED (D13) — Sweat / Spike (>= \(redLimit))"
            }
            return ArduinoLiveTelemetry(
                badgeText: "A0 = \(reading) · abs(value - baseline) = \(delta)",
                voltageOrSignalText: "3s get-ready + 50-sample baseline = \(baseline) · change = \(delta)",
                outcomeText: "\(zone) — measures sweat, not honesty",
                plotterSamples: [
                    baseline,
                    baseline + 2,
                    baseline + delta / 2,
                    reading,
                    reading - 3,
                    reading
                ],
                previewToneHz: nil
            )

        case .feederCam:
            let pirTrigger = resolvedValue(for: "pirTrigger", in: values)
            let sleepMa = resolvedValue(for: "sleepMode", in: values)
            let awake = pirTrigger > 0
            return ArduinoLiveTelemetry(
                badgeText: awake ? "GPIO 13 HIGH -> Wake & Snap" : "GPIO 13 LOW -> Deep Sleep",
                voltageOrSignalText: "Idle draw ~\(sleepMa) mA · Strong 5V supply prevents brownout resets",
                outcomeText: awake
                    ? "PIR woke ESP32-CAM -> takePhotoAndSave() -> microSD -> sleep"
                    : "ESP32-CAM sleeping (~100x battery savings while PIR watches)",
                plotterSamples: awake ? [10, 10, 220, 180, 10, 10] : [10, 10, 10, 10, 10, 10],
                previewToneHz: nil
            )

        case .visitorCounter:
            let beamBroken = resolvedValue(for: "beamState", in: values) > 0
            let debounceSec = resolvedValue(for: "debounceSec", in: values)
            let visits = beamBroken ? 12 : 11
            return ArduinoLiveTelemetry(
                badgeText: "Perch visits = \(visits) · settle \(debounceSec)s",
                voltageOrSignalText: "D3 INPUT_PULLUP -> \(beamBroken ? "LOW (bird on perch)" : "HIGH (beam clear)")",
                outcomeText: "Counts 1 per landing (broken && !wasBroken edge + \(debounceSec)s settle)",
                plotterSamples: [9, 10, 11, visits, visits],
                previewToneHz: nil
            )

        case .dawnLogger:
            let minute = resolvedValue(for: "dawnMinute", in: values)
            let intervalMs = resolvedValue(for: "sampleInterval", in: values)
            let light = min(980, 40 + minute * 14)
            let tempC = light < 200 ? 9 : (light < 550 ? 12 : 16)
            let humidity = light < 200 ? 84 : 68
            return ArduinoLiveTelemetry(
                badgeText: "CSV: \(minute),\(light),\(tempC),\(humidity)",
                voltageOrSignalText: "A0 light = \(light) · D4 DHT11 = \(tempC)°C, \(humidity)% RH · every \(intervalMs / 1000)s",
                outcomeText: light >= 200
                    ? "Dawn threshold crossed (light \(light) >= 200) — birdsong window"
                    : "Pre-dawn darkness (light \(light) < 200) — temperature near overnight low",
                plotterSamples: [40, 110, 180, 260, max(280, light), min(1023, light + 90)],
                previewToneHz: nil
            )

        case .fieldAgent:
            let counterVisits = resolvedValue(for: "counterVisits", in: values)
            let birds = resolvedValue(for: "cameraConfirmed", in: values)
            let repeatRate = max(1, counterVisits / max(1, birds))
            return ArduinoLiveTelemetry(
                badgeText: "\(counterVisits) beam counts vs \(birds) birds on camera",
                voltageOrSignalText: "Counter (D3) + Camera (GPIO 13) + Dawn Logger (A0/D4)",
                outcomeText: "Cross-check: ~\(repeatRate) visits per bird — both instruments agree",
                plotterSamples: [
                    max(1, counterVisits / 4),
                    max(2, counterVisits / 2),
                    counterVisits,
                    birds
                ],
                previewToneHz: nil
            )
        }
    }

    /// Generates a 4-step dry-run execution trace mapped to actual line numbers in `renderedCode`.
    func traceSteps(
        with values: [String: Int],
        sonarTarget: ArduinoSonarTarget = .hardBook
    ) -> [ArduinoTraceStep] {
        let rendered = renderedCode(with: values)
        let lines = rendered.components(separatedBy: .newlines)
        let telemetry = telemetryReadout(with: values, sonarTarget: sonarTarget)
        let loopStart = findLine(containing: "void loop()", inLines: lines, startingAt: 1, defaultLine: 1)

        switch missionID {
        case .firstLight:
            let blinkMs = resolvedValue(for: "delayMs", in: values)
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Configure Pin 13 as OUTPUT",
                    lineNumber: findLine(containing: "pinMode", inLines: lines, startingAt: 1, defaultLine: 2),
                    registersSummary: "DDRB.5 = OUTPUT · Pin 13 = 0V",
                    serialOutput: "// setup(): Pin 13 ready to drive LED through resistor",
                    plotterValue: 0,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Switch Pin 13 HIGH (5V)",
                    lineNumber: findLine(containing: "HIGH", inLines: lines, startingAt: loopStart, defaultLine: 6),
                    registersSummary: "PORTB.5 = HIGH (5.0V) · LED ON",
                    serialOutput: "Pin 13 -> HIGH (LED lit)",
                    plotterValue: 1,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Hold LED ON for \(blinkMs) ms",
                    lineNumber: findLine(containing: "delay(", inLines: lines, startingAt: loopStart, defaultLine: 7),
                    registersSummary: "Timer0 wait = \(blinkMs) ms · LED stays ON",
                    serialOutput: "Wait \(blinkMs) ms...",
                    plotterValue: 1,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Switch Pin 13 LOW (0V)",
                    lineNumber: findLine(containing: "LOW", inLines: lines, startingAt: loopStart, defaultLine: 8),
                    registersSummary: "PORTB.5 = LOW (0.0V) · LED OFF",
                    serialOutput: "Pin 13 -> LOW (LED dark for \(blinkMs) ms)",
                    plotterValue: 0,
                    toneHz: nil
                )
            ]

        case .morseLamp:
            let holdMs = resolvedValue(for: "holdMs", in: values)
            let pitchHz = resolvedValue(for: "pitchHz", in: values)
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Enable INPUT_PULLUP on D2 & Serial 9600",
                    lineNumber: findLine(containing: "Serial.begin", inLines: lines, startingAt: 1, defaultLine: 8),
                    registersSummary: "D2 = INPUT_PULLUP · D13 = OUTPUT · 9600 baud",
                    serialOutput: "Serial connected at 9600 baud",
                    plotterValue: 0,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Read button on Pin 2 & light D13 lamp",
                    lineNumber: findLine(containing: "bool pressed =", inLines: lines, startingAt: loopStart, defaultLine: 11),
                    registersSummary: "D2 == LOW (pressed) · D13 = HIGH",
                    serialOutput: "// Button held down — lamp glowing",
                    plotterValue: 1,
                    toneHz: pitchHz
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Record press timestamp with millis()",
                    lineNumber: findLine(containing: "pressedAt = millis()", inLines: lines, startingAt: loopStart, defaultLine: 13),
                    registersSummary: "pressedAt = 1420 ms",
                    serialOutput: ".",
                    plotterValue: 1,
                    toneHz: pitchHz
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Compare held time against \(holdMs) ms cutoff",
                    lineNumber: findLine(containing: "Serial.print(held <", inLines: lines, startingAt: loopStart, defaultLine: 16),
                    registersSummary: "held < \(holdMs) ms -> '.' else '-'",
                    serialOutput: ".-   (A)",
                    plotterValue: 0,
                    toneHz: nil
                )
            ]

        case .diaryAlarm:
            let triggered = resolvedValue(for: "motionState", in: values) > 0
            let alarmHz = resolvedValue(for: "alarmHz", in: values)
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Settle PIR sensor for 30s in setup()",
                    lineNumber: findLine(containing: "delay(30000)", inLines: lines, startingAt: 1, defaultLine: 11),
                    registersSummary: "D2 = INPUT (PIR) · D8 = OUTPUT · D13 = OUTPUT",
                    serialOutput: "Guard waking up... keep still\nGuard on duty.",
                    plotterValue: 0,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Check digitalRead(pirPin) == HIGH",
                    lineNumber: findLine(containing: "if (digitalRead(pirPin)", inLines: lines, startingAt: loopStart, defaultLine: 15),
                    registersSummary: "D2 = \(triggered ? "HIGH (1)" : "LOW (0)")",
                    serialOutput: triggered ? "digitalRead(2) == HIGH" : "digitalRead(2) == LOW (Still)",
                    plotterValue: triggered ? 1 : 0,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: triggered ? "3. Chirp D8 at \(alarmHz) Hz & light D13" : "3. Branch to else (keep lamp LOW)",
                    lineNumber: findLine(
                        containing: triggered ? "tone(buzzerPin" : "digitalWrite(lampPin, LOW)",
                        inLines: lines,
                        startingAt: loopStart,
                        defaultLine: 17
                    ),
                    registersSummary: triggered ? "D13 = HIGH · D8 = \(alarmHz) Hz (300 ms)" : "D13 = LOW · D8 = silent",
                    serialOutput: triggered ? "Movement near the box at 42 seconds" : "Guard on duty.",
                    plotterValue: triggered ? 1 : 0,
                    toneHz: triggered ? alarmHz : nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Log timestamp to Serial Monitor",
                    lineNumber: findLine(containing: "Serial.println(\" seconds\")", inLines: lines, startingAt: loopStart, defaultLine: 20),
                    registersSummary: telemetry.badgeText,
                    serialOutput: telemetry.outcomeText,
                    plotterValue: triggered ? 1 : 0,
                    toneHz: nil
                )
            ]

        case .beamGuard:
            let ambient = resolvedValue(for: "lightLevel", in: values)
            let threshold = resolvedValue(for: "threshold", in: values)
            let tripped = ambient < threshold
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Start Serial 9600 & Pin 8 OUTPUT",
                    lineNumber: findLine(containing: "Serial.begin", inLines: lines, startingAt: 1, defaultLine: 7),
                    registersSummary: "UART = 9600 baud · A0 = ADC · D8 = OUTPUT",
                    serialOutput: "Serial Plotter ready (9600 baud)",
                    plotterValue: ambient,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Measure LDR voltage divider on A0",
                    lineNumber: findLine(containing: "analogRead(ldrPin)", inLines: lines, startingAt: loopStart, defaultLine: 10),
                    registersSummary: "ADC(A0) = \(ambient) · threshold = \(threshold)",
                    serialOutput: "\(ambient)",
                    plotterValue: ambient,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Stream light level to Serial Plotter",
                    lineNumber: findLine(containing: "Serial.println(light)", inLines: lines, startingAt: loopStart, defaultLine: 11),
                    registersSummary: "TX -> \"\(ambient)\\n\"",
                    serialOutput: "\(ambient)",
                    plotterValue: ambient,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: tripped ? "4. Shadow < \(threshold): beep D8 & print BEAM BROKEN" : "4. Light >= \(threshold): pause 50 ms",
                    lineNumber: findLine(
                        containing: tripped ? "tone(buzzerPin" : "delay(50)",
                        inLines: lines,
                        startingAt: loopStart,
                        defaultLine: 13
                    ),
                    registersSummary: tripped ? "D8 = 900 Hz (200 ms)" : "D8 = silent",
                    serialOutput: tripped ? "\(ambient)\nBEAM BROKEN" : "\(ambient)",
                    plotterValue: ambient,
                    toneHz: tripped ? 900 : nil
                )
            ]

        case .sonarSweep:
            let trueCm = resolvedValue(for: "distanceCM", in: values)
            let measuredCm = sonarTarget.simulatedDistanceCm(trueDistanceCm: trueCm)
            let echoUs = sonarTarget.swallowsPulse ? 0 : Int((Double(measuredCm) / 0.017).rounded())
            let noteHz = max(200, min(2000, 1800 - measuredCm * 10))
            let inRange = measuredCm < 150
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Attach servo on D6 & configure TRIG/ECHO",
                    lineNumber: findLine(containing: "sweep.attach(6)", inLines: lines, startingAt: 1, defaultLine: 19),
                    registersSummary: "D9 = TRIG · D10 = ECHO · D6 = Servo",
                    serialOutput: "HC-SR04 + SG90 sweep ready at 9600 baud",
                    plotterValue: measuredCm,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Fire 10 us ultrasonic click in measureCM()",
                    lineNumber: findLine(containing: "delayMicroseconds(10)", inLines: lines, startingAt: 1, defaultLine: 10),
                    registersSummary: "D9 = 10 us pulse · 40 kHz burst emitted",
                    serialOutput: "// 40 kHz ping reflecting off \(sonarTarget.rawValue)",
                    plotterValue: measuredCm,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Time echo with pulseIn(echoPin, HIGH, 25000)",
                    lineNumber: findLine(containing: "pulseIn(echoPin", inLines: lines, startingAt: 1, defaultLine: 12),
                    registersSummary: "us = \(echoUs) · cm = \(measuredCm)",
                    serialOutput: "90,\(measuredCm)",
                    plotterValue: measuredCm,
                    toneHz: inRange ? noteHz : nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Sweep 15°..165° in loop() and print angle,cm",
                    lineNumber: findLine(containing: "scan(15, 165, 1)", inLines: lines, startingAt: loopStart, defaultLine: 32),
                    registersSummary: "angle = 90° · distance = \(measuredCm) cm",
                    serialOutput: "90,\(measuredCm)",
                    plotterValue: measuredCm,
                    toneHz: inRange ? noteHz : nil
                )
            ]

        case .truthMeter:
            let reading = resolvedValue(for: "skinReading", in: values)
            let redLimit = resolvedValue(for: "deltaThreshold", in: values)
            let delta = abs(reading - 512)
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Wait 3s & average 50 calm readings",
                    lineNumber: findLine(containing: "delay(3000)", inLines: lines, startingAt: 1, defaultLine: 11),
                    registersSummary: "baseline = 512 (50-sample average)",
                    serialOutput: "Fingers on the pads, hand still...\nCalibrating your calm in 3 seconds.",
                    plotterValue: 512,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Read skin Pin A0 & compute abs(value - baseline)",
                    lineNumber: findLine(containing: "int change = abs(value - baseline)", inLines: lines, startingAt: loopStart, defaultLine: 21),
                    registersSummary: "value = \(reading) · baseline = 512 · change = \(delta)",
                    serialOutput: "\(reading)",
                    plotterValue: reading,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Stream skin value to Serial Plotter",
                    lineNumber: findLine(containing: "Serial.println(value)", inLines: lines, startingAt: loopStart, defaultLine: 22),
                    registersSummary: "TX -> \"\(reading)\\n\" · red limit = \(redLimit)",
                    serialOutput: "\(reading)",
                    plotterValue: reading,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Drive Green (D11), Yellow (D12), Red (D13)",
                    lineNumber: findLine(containing: "digitalWrite(13,", inLines: lines, startingAt: loopStart, defaultLine: 25),
                    registersSummary: "D11=\(delta < 15 ? 1 : 0) · D12=\(delta >= 15 && delta < redLimit ? 1 : 0) · D13=\(delta >= redLimit ? 1 : 0)",
                    serialOutput: "\(reading)  // \(telemetry.outcomeText)",
                    plotterValue: reading,
                    toneHz: nil
                )
            ]

        case .feederCam:
            let awake = resolvedValue(for: "pirTrigger", in: values) > 0
            let sleepMa = resolvedValue(for: "sleepMode", in: values)
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Watch GPIO 13 RTC wake pin",
                    lineNumber: findLine(containing: "#define PIR_PIN 13", inLines: lines, startingAt: 1, defaultLine: 6),
                    registersSummary: "GPIO 13 = \(awake ? "HIGH (Motion)" : "LOW (Quiet)") · ~\(sleepMa) mA",
                    serialOutput: awake ? "RTC ext0 wake on GPIO 13!" : "Sleeping (~10 mA) until GPIO 13 goes HIGH",
                    plotterValue: sleepMa,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Capture JPEG frame to microSD card",
                    lineNumber: findLine(containing: "takePhotoAndSave()", inLines: lines, startingAt: 1, defaultLine: 10),
                    registersSummary: awake ? "OV2640 -> /picture_042.jpg saved" : "Skipped while asleep",
                    serialOutput: awake ? "Saved /picture_042.jpg to microSD card" : "Awaiting PIR motion trigger...",
                    plotterValue: awake ? 180 : sleepMa,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Arm ext0 wake on PIR_PIN (HIGH = 1)",
                    lineNumber: findLine(containing: "esp_sleep_enable_ext0_wakeup", inLines: lines, startingAt: 1, defaultLine: 11),
                    registersSummary: "RTC_CNTL_EXT_WAKEUP0 = GPIO 13 (level 1)",
                    serialOutput: "Armed wake trigger: GPIO 13 == HIGH",
                    plotterValue: sleepMa,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Enter deep sleep (loop() never reached)",
                    lineNumber: findLine(containing: "esp_deep_sleep_start()", inLines: lines, startingAt: 1, defaultLine: 13),
                    registersSummary: "CPU off · RTC + PIR watching (~100x power saved)",
                    serialOutput: "zzz... esp_deep_sleep_start()",
                    plotterValue: 10,
                    toneHz: nil
                )
            ]

        case .visitorCounter:
            let beamBroken = resolvedValue(for: "beamState", in: values) > 0
            let debounceSec = resolvedValue(for: "debounceSec", in: values)
            let visits = beamBroken ? 12 : 11
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Enable INPUT_PULLUP on Pin 3",
                    lineNumber: findLine(containing: "INPUT_PULLUP", inLines: lines, startingAt: 1, defaultLine: 6),
                    registersSummary: "D3 = INPUT_PULLUP · visits = \(visits - 1)",
                    serialOutput: "Feeder visitor counter ready.",
                    plotterValue: visits - 1,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Check if IR break-beam is LOW (broken)",
                    lineNumber: findLine(containing: "bool broken =", inLines: lines, startingAt: loopStart, defaultLine: 10),
                    registersSummary: "broken = \(beamBroken) · wasBroken = false",
                    serialOutput: "Feeder visitor counter ready.",
                    plotterValue: visits - 1,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Increment visits++ on falling edge",
                    lineNumber: findLine(containing: "visits++", inLines: lines, startingAt: loopStart, defaultLine: 12),
                    registersSummary: "visits = \(visits) · edge detected",
                    serialOutput: "Visit number \(visits) at second 168",
                    plotterValue: visits,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Print visit timestamp & remember wasBroken",
                    lineNumber: findLine(containing: "wasBroken = broken", inLines: lines, startingAt: loopStart, defaultLine: 18),
                    registersSummary: "wasBroken = \(beamBroken) · settle = \(debounceSec)s",
                    serialOutput: "Visit number \(visits) at second 168",
                    plotterValue: visits,
                    toneHz: nil
                )
            ]

        case .dawnLogger:
            let minute = resolvedValue(for: "dawnMinute", in: values)
            let intervalMs = resolvedValue(for: "sampleInterval", in: values)
            let light = min(980, 40 + minute * 14)
            let tempC = light < 200 ? 9 : (light < 550 ? 12 : 16)
            let humidity = light < 200 ? 84 : 68
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Start DHT11 & print CSV header row",
                    lineNumber: findLine(containing: "minute,light,tempC,humidity", inLines: lines, startingAt: 1, defaultLine: 8),
                    registersSummary: "UART = 9600 · D4 = DHT11 · A0 = LDR",
                    serialOutput: "minute,light,tempC,humidity",
                    plotterValue: light,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Read sky brightness on A0",
                    lineNumber: findLine(containing: "analogRead(ldrPin)", inLines: lines, startingAt: loopStart, defaultLine: 11),
                    registersSummary: "light = \(light) (0–1023)",
                    serialOutput: "minute,light,tempC,humidity",
                    plotterValue: light,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Read temperature & humidity from DHT11",
                    lineNumber: findLine(containing: "dht.readTemperature()", inLines: lines, startingAt: loopStart, defaultLine: 12),
                    registersSummary: "temp = \(tempC).0°C · hum = \(humidity).0%",
                    serialOutput: "minute,light,tempC,humidity\n\(max(0, minute - 1)),\(max(0, light - 14)),\(tempC),\(humidity)",
                    plotterValue: light,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Print CSV row & wait \(intervalMs / 1000)s",
                    lineNumber: findLine(containing: "Serial.println(hum)", inLines: lines, startingAt: loopStart, defaultLine: 20),
                    registersSummary: "Row logged · next sample in \(intervalMs / 1000)s",
                    serialOutput: "minute,light,tempC,humidity\n\(max(0, minute - 1)),\(max(0, light - 14)),\(tempC),\(humidity)\n\(minute),\(light),\(tempC),\(humidity)",
                    plotterValue: light,
                    toneHz: nil
                )
            ]

        case .fieldAgent:
            let counterVisits = resolvedValue(for: "counterVisits", in: values)
            let birds = resolvedValue(for: "cameraConfirmed", in: values)
            return [
                ArduinoTraceStep(
                    id: 0,
                    title: "1. Lock in your question & prediction first",
                    lineNumber: findLine(containing: "QUESTION", inLines: lines, startingAt: 1, defaultLine: 4),
                    registersSummary: "Notebook hypothesis recorded before day 1",
                    serialOutput: "Question: Do more birds visit before 8am?",
                    plotterValue: counterVisits,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 1,
                    title: "2. Tally IR break-beam crossings (Station 1)",
                    lineNumber: findLine(containing: "COUNTER", inLines: lines, startingAt: 1, defaultLine: 5),
                    registersSummary: "Pin 3 break-beam = \(counterVisits) crossings today",
                    serialOutput: "Counter log: \(counterVisits) perch crossings",
                    plotterValue: counterVisits,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 2,
                    title: "3. Cross-check ESP32-CAM photos (Station 2)",
                    lineNumber: findLine(containing: "CAMERA", inLines: lines, startingAt: 1, defaultLine: 6),
                    registersSummary: "microSD = \(birds) distinct birds · Dawn = 12°C",
                    serialOutput: "Camera trap: \(birds) distinct birds (\(max(1, counterVisits / max(1, birds))) visits/bird)",
                    plotterValue: birds,
                    toneHz: nil
                ),
                ArduinoTraceStep(
                    id: 3,
                    title: "4. Write verdict with claim & evidence",
                    lineNumber: findLine(containing: "VERDICT", inLines: lines, startingAt: 1, defaultLine: 9),
                    registersSummary: telemetry.badgeText,
                    serialOutput: telemetry.outcomeText,
                    plotterValue: counterVisits,
                    toneHz: nil
                )
            ]
        }
    }
}
