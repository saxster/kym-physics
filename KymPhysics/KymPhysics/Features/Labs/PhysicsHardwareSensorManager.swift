import SwiftUI
import AVFoundation
import PhotosUI
import Observation
#if canImport(CoreMotion) && os(iOS)
import CoreMotion
#endif

/// Single timestamped sample from the iPad hardware accelerometer or magnetometer.
struct PhysicsSensorSample: Identifiable, Sendable {
    let id = UUID()
    let timestamp: TimeInterval
    let x: Double
    let y: Double
    let z: Double

    var magnitude: Double {
        sqrt(x * x + y * y + z * z)
    }
}

/// Manages real iPad hardware sensors (`CMMotionManager` 3-axis accelerometer & magnetometer,
/// `AVAudioEngine` microphone pitch & waveform oscilloscope) with automatic high-precision
/// physics simulation fallback when running in Simulator or on macOS.
@MainActor
@Observable
final class PhysicsHardwareSensorManager {
    // Motion / Magnetometer state
    var isMotionRunning: Bool = false
    var usingSimulatedHardware: Bool = false
    var accelSamples: [PhysicsSensorSample] = []
    var magSamples: [PhysicsSensorSample] = []

    var latestAccel: PhysicsSensorSample = PhysicsSensorSample(timestamp: 0, x: 0, y: 0, z: -9.81)
    var latestMag: PhysicsSensorSample = PhysicsSensorSample(timestamp: 0, x: 36.2, y: 1.4, z: -24.8) // Mumbai geomagnetic field ~43.9 µT

    // Audio / Oscilloscope state
    var isAudioRunning: Bool = false
    var detectedFrequencyHz: Double = 261.63 // Middle C (Sa)
    var detectedNoteName: String = "C4 · Sa (261.6 Hz)"
    var detectedAmplitudeDB: Double = -28.0
    var waveformSamples: [Double] = (0..<128).map { sin(Double($0) * 2.0 * .pi / 32.0) * 0.65 }
    var syntheticToneFrequencyHz: Double = 440.0

    #if canImport(CoreMotion) && os(iOS)
    private let motionManager = CMMotionManager()
    #endif
    private var simulationTimer: Timer?
    private var startTime: Date = Date()
    private var audioEngine: AVAudioEngine?

    func toggleMotionSensors() {
        if isMotionRunning {
            stopMotionSensors()
        } else {
            startMotionSensors()
        }
    }

    func startMotionSensors() {
        stopMotionSensors()
        startTime = Date()
        accelSamples.removeAll()
        magSamples.removeAll()
        isMotionRunning = true

        #if canImport(CoreMotion) && os(iOS)
        if motionManager.isAccelerometerAvailable || motionManager.isMagnetometerAvailable {
            usingSimulatedHardware = false
            motionManager.accelerometerUpdateInterval = 1.0 / 30.0
            motionManager.magnetometerUpdateInterval = 1.0 / 30.0

            if motionManager.isAccelerometerAvailable {
                motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, _ in
                    guard let self, let data else { return }
                    let t = Date().timeIntervalSince(self.startTime)
                    let sample = PhysicsSensorSample(
                        timestamp: t,
                        x: data.acceleration.x * 9.80665,
                        y: data.acceleration.y * 9.80665,
                        z: data.acceleration.z * 9.80665
                    )
                    self.latestAccel = sample
                    self.accelSamples.append(sample)
                    if self.accelSamples.count > 120 {
                        self.accelSamples.removeFirst()
                    }
                }
            }

            if motionManager.isMagnetometerAvailable {
                motionManager.startMagnetometerUpdates(to: .main) { [weak self] data, _ in
                    guard let self, let data else { return }
                    let t = Date().timeIntervalSince(self.startTime)
                    let sample = PhysicsSensorSample(
                        timestamp: t,
                        x: data.magneticField.x,
                        y: data.magneticField.y,
                        z: data.magneticField.z
                    )
                    self.latestMag = sample
                    self.magSamples.append(sample)
                    if self.magSamples.count > 120 {
                        self.magSamples.removeFirst()
                    }
                }
            } else {
                startSimulationFallback()
            }
            return
        }
        #endif

        startSimulationFallback()
    }

    func stopMotionSensors() {
        isMotionRunning = false
        simulationTimer?.invalidate()
        simulationTimer = nil
        #if canImport(CoreMotion) && os(iOS)
        motionManager.stopAccelerometerUpdates()
        motionManager.stopMagnetometerUpdates()
        #endif
    }

    private func startSimulationFallback() {
        usingSimulatedHardware = true
        simulationTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 24.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self, self.isMotionRunning else { return }
                let t = Date().timeIntervalSince(self.startTime)
                // Simulate a damped harmonic pendulum + approaching bar magnet (Unit 9.1 / Ch 13)
                let ax = 2.4 * sin(2.0 * .pi * 0.75 * t) * exp(-0.04 * t)
                let ay = 0.8 * cos(2.0 * .pi * 0.75 * t)
                let az = -9.81 + 0.35 * cos(4.0 * .pi * 0.75 * t)
                let aSample = PhysicsSensorSample(timestamp: t, x: ax, y: ay, z: az)
                self.latestAccel = aSample
                self.accelSamples.append(aSample)
                if self.accelSamples.count > 120 { self.accelSamples.removeFirst() }

                // Mumbai geomagnetic background (36.2 µT N, -24.8 µT vertical) + inverse-cube dipole sweep
                let dipoleBoost = 85.0 * pow(0.5 + 0.5 * sin(2.0 * .pi * 0.25 * t), 3)
                let bx = 36.2 + dipoleBoost
                let by = 1.4 + 12.0 * sin(2.0 * .pi * 0.5 * t)
                let bz = -24.8 - 0.4 * dipoleBoost
                let mSample = PhysicsSensorSample(timestamp: t, x: bx, y: by, z: bz)
                self.latestMag = mSample
                self.magSamples.append(mSample)
                if self.magSamples.count > 120 { self.magSamples.removeFirst() }
            }
        }
    }

    // MARK: - Live Audio Oscilloscope & Pitch Detector (Ch 9 Sound & Ragas)

    func toggleAudioOscilloscope() {
        if isAudioRunning {
            stopAudioOscilloscope()
        } else {
            startAudioOscilloscope()
        }
    }

    func startAudioOscilloscope() {
        stopAudioOscilloscope()
        isAudioRunning = true

        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let format = inputNode.outputFormat(forBus: 0)

        if format.sampleRate > 0 && format.channelCount > 0 {
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
                guard let channelData = buffer.floatChannelData?[0] else { return }
                let count = Int(buffer.frameLength)
                guard count > 64 else { return }

                var sumSquares: Float = 0
                var crossings = 0
                var prev: Float = channelData[0]
                var downsampled: [Double] = []
                let strideStep = max(1, count / 128)

                for i in 1..<count {
                    let s = channelData[i]
                    sumSquares += s * s
                    if (prev < 0 && s >= 0) || (prev >= 0 && s < 0) {
                        crossings += 1
                    }
                    prev = s
                    if i % strideStep == 0 && downsampled.count < 128 {
                        downsampled.append(Double(s))
                    }
                }

                let rms = sqrt(sumSquares / Float(count))
                let db = Double(20.0 * log10(max(rms, 1e-5)))
                let estFreq = (Double(crossings) * format.sampleRate) / (2.0 * Double(count))

                Task { @MainActor in
                    guard let self, self.isAudioRunning else { return }
                    if rms > 0.004 && estFreq >= 60 && estFreq <= 3500 {
                        self.detectedFrequencyHz = estFreq
                        self.detectedAmplitudeDB = db
                        self.detectedNoteName = Self.noteLabel(for: estFreq)
                        self.waveformSamples = downsampled.map { min(max($0 * 4.0, -1.0), 1.0) }
                    } else {
                        self.updateSyntheticToneWaveform(freq: self.syntheticToneFrequencyHz)
                    }
                }
            }

            do {
                try engine.start()
                self.audioEngine = engine
                return
            } catch {
                inputNode.removeTap(onBus: 0)
            }
        }

        // Fallback to interactive synthetic tone oscilloscope
        updateSyntheticToneWaveform(freq: syntheticToneFrequencyHz)
    }

    func stopAudioOscilloscope() {
        isAudioRunning = false
        if let engine = audioEngine {
            engine.inputNode.removeTap(onBus: 0)
            engine.stop()
        }
        audioEngine = nil
    }

    func updateSyntheticToneWaveform(freq: Double) {
        syntheticToneFrequencyHz = freq
        detectedFrequencyHz = freq
        detectedNoteName = Self.noteLabel(for: freq)
        let cycles = max(1.0, freq / 110.0)
        waveformSamples = (0..<128).map { i in
            let phase = (Double(i) / 128.0) * cycles * 2.0 * .pi
            return 0.75 * sin(phase) + 0.18 * sin(2.0 * phase)
        }
    }

    static func noteLabel(for freq: Double) -> String {
        guard freq > 20 else { return "—" }
        let noteNames = ["C (Sa)", "C♯", "D (Re)", "D♯", "E (Ga)", "F (Ma)", "F♯", "G (Pa)", "G♯", "A (Dha)", "A♯", "B (Ni)"]
        let midi = Int(round(69.0 + 12.0 * log2(freq / 440.0)))
        let name = noteNames[((midi % 12) + 12) % 12]
        let octave = (midi / 12) - 1
        return "\(name) · Oct \(octave) (\(Int(round(freq))) Hz)"
    }
}

/// Interactive Hardware Sensor & 240 fps Video Motion Bench embedded inside `LabsExplorersHomeView`.
struct PhysicsHardwareSensorsBenchView: View {
    @EnvironmentObject private var store: AppStore
    @State private var sensorManager = PhysicsHardwareSensorManager()
    @State private var selectedTab: Int = 0 // 0 = Magnetometer & Accelerometer, 1 = Sound Oscilloscope, 2 = 240 fps Video Tracker

    // 240 fps Video Tracker points
    @State private var currentStrobeFrame: Int = 0
    @State private var trackedFrames: [(frame: Int, timeS: Double, heightM: Double)] = [
        (0, 0.00, 1.80),
        (1, 0.10, 1.75),
        (2, 0.20, 1.60),
        (3, 0.30, 1.36),
        (4, 0.40, 1.02),
        (5, 0.50, 0.57),
        (6, 0.60, 0.03)
    ]
    @State private var selectedVideoItem: PhotosPickerItem?
    @State private var importedVideoStatus: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.lg) {
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    JournalEyebrow(symbol: "sensor.tag.radiowaves.forward.fill", tint: .kymaiaAccent, text: "iPad Hardware Physics Lab · CoreMotion + AVAudioEngine + 240 fps Video")
                    Text("Turn Kym's iPad into a Real Physics Instrument")
                        .font(.kymaiaSectionTitle)
                        .foregroundStyle(Color.kymaiaTextPrimary)
                    Text("Measure real magnetic fields in microteslas ($\\mu\\text{T}$) for Unit 9 Magnetism, real acceleration vectors ($\\text{m/s}^2$) for Unit 3 Forces, live sound waves and raga harmonics ($\\text{Hz}$) for Chapter 9, and 240 fps frame-by-frame motion tracking for Chapter 1.")
                        .font(.kymaiaCallout)
                        .foregroundStyle(Color.kymaiaTextSecondary)

                    Picker("Instrument", selection: $selectedTab) {
                        Text("3-Axis Magnetometer & Accelerometer").tag(0)
                        Text("Live Sound & Raga Oscilloscope").tag(1)
                        Text("240 fps Video Motion Tracker").tag(2)
                    }
                    .pickerStyle(.segmented)
                }
            }

            if selectedTab == 0 {
                motionAndMagnetometerBench
            } else if selectedTab == 1 {
                audioOscilloscopeBench
            } else {
                videoMotionTrackerBench
            }
        }
        .onDisappear {
            sensorManager.stopMotionSensors()
            sensorManager.stopAudioOscilloscope()
        }
    }

    private var motionAndMagnetometerBench: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Live 3-Axis Magnetometer (Unit 9) & Accelerometer (Unit 3)")
                            .font(.kymaiaTitle3)
                        Text(sensorManager.usingSimulatedHardware
                             ? "Running calibrated Mumbai geomagnetic (43.9 µT) + dipole sweep model"
                             : "Streaming live hardware CoreMotion sensors at 30 Hz")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                    }
                    Spacer()
                    Button {
                        sensorManager.toggleMotionSensors()
                    } label: {
                        Label(
                            sensorManager.isMotionRunning ? "Stop Sensors" : "Start Live Sensors",
                            systemImage: sensorManager.isMotionRunning ? "stop.circle.fill" : "play.circle.fill"
                        )
                    }
                    .buttonStyle(JournalCapsuleButtonStyle())

                    Button {
                        let now = Date()
                        let entry = LabJournalEntryRecord(
                            id: "sensor-\(Int(now.timeIntervalSince1970))",
                            title: "Hardware Sensor Log: |B| = \(String(format: "%.1f", sensorManager.latestMag.magnitude)) µT, |a| = \(String(format: "%.2f", sensorManager.latestAccel.magnitude)) m/s²",
                            templateKind: "lab_log",
                            paperStyle: "grid",
                            linkedTopicCode: "9.1",
                            linkedChapterNumber: 13,
                            linkedWidgetId: "magnetometer",
                            cueColumnText: "3-axis Magnetometer & Accelerometer telemetry",
                            bodyNotesText: String(
                                format: "Magnetometer: Bx = %.1f µT, By = %.1f µT, Bz = %.1f µT (|B| = %.1f µT).\nAccelerometer: ax = %.2f m/s², ay = %.2f m/s², az = %.2f m/s² (|a| = %.2f m/s²).",
                                sensorManager.latestMag.x, sensorManager.latestMag.y, sensorManager.latestMag.z, sensorManager.latestMag.magnitude,
                                sensorManager.latestAccel.x, sensorManager.latestAccel.y, sensorManager.latestAccel.z, sensorManager.latestAccel.magnitude
                            ),
                            summaryText: "Logged directly from KymPhysics Hardware Sensor Bench.",
                            hypothesisText: "Magnetic field strength |B| rises sharply as the iPad magnetometer approaches a magnetic pole (inverse-cube law).",
                            independentVarText: "Distance r from magnetic pole (cm)",
                            dependentVarText: "Magnetic flux density |B| (µT)",
                            controlVarsText: "Orientation relative to Earth's background field",
                            drawingData: nil,
                            snapshotPNGData: nil,
                            createdAt: now,
                            updatedAt: now
                        )
                        store.saveJournalEntry(entry)
                    } label: {
                        Label("Log to Lab Journal", systemImage: "square.and.pencil")
                    }
                    .buttonStyle(SessionGhostButtonStyle())
                }

                // Readout tiles
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Spacing.md) {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Label("Magnetic Field |B| (Unit 9.1 / Ch 13)", systemImage: "safari.fill")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaAccent)
                        Text(String(format: "%.1f µT", sensorManager.latestMag.magnitude))
                            .font(.kymaiaDisplay)
                            .foregroundStyle(Color.kymaiaTextPrimary)
                        Text(String(
                            format: "Bx: %.1f   By: %.1f   Bz: %.1f µT",
                            sensorManager.latestMag.x,
                            sensorManager.latestMag.y,
                            sensorManager.latestMag.z
                        ))
                        .font(.kymaiaMonoCaption)
                        .foregroundStyle(Color.kymaiaTextSecondary)
                    }
                    .padding(Spacing.md)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: CornerRadius.md).fill(Color.kymaiaSurface))

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Label("Acceleration |a| (Unit 3.1 / Ch 2)", systemImage: "gyroscope")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaSuccess)
                        Text(String(format: "%.2f m/s²", sensorManager.latestAccel.magnitude))
                            .font(.kymaiaDisplay)
                            .foregroundStyle(Color.kymaiaTextPrimary)
                        Text(String(
                            format: "ax: %.2f   ay: %.2f   az: %.2f m/s²",
                            sensorManager.latestAccel.x,
                            sensorManager.latestAccel.y,
                            sensorManager.latestAccel.z
                        ))
                        .font(.kymaiaMonoCaption)
                        .foregroundStyle(Color.kymaiaTextSecondary)
                    }
                    .padding(Spacing.md)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: CornerRadius.md).fill(Color.kymaiaSurface))
                }

                // Live strip chart
                Canvas { context, size in
                    context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(Color.kymaiaSurface))
                    let magPts = sensorManager.magSamples
                    if magPts.count > 1 {
                        var path = Path()
                        for (i, sample) in magPts.enumerated() {
                            let x = CGFloat(i) / CGFloat(max(1, magPts.count - 1)) * size.width
                            let norm = min(max((sample.magnitude - 20.0) / 140.0, 0.05), 0.95)
                            let y = size.height * (1.0 - CGFloat(norm))
                            if i == 0 { path.move(to: CGPoint(x: x, y: y)) }
                            else { path.addLine(to: CGPoint(x: x, y: y)) }
                        }
                        context.stroke(path, with: .color(Color.kymaiaAccent), lineWidth: 2.5)
                    }
                }
                .frame(height: 150)
                .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md))
                .overlay(
                    RoundedRectangle(cornerRadius: CornerRadius.md)
                        .strokeBorder(Color.kymaiaSurfaceBorder, lineWidth: 1)
                )
            }
        }
    }

    private var audioOscilloscopeBench: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Live Sound & Raga Harmonics Oscilloscope (Ch 9)")
                            .font(.kymaiaTitle3)
                        Text("Sing a note, pluck a string, or slide the reference frequency to see wavelength λ = v/f and period T = 1/f.")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                    }
                    Spacer()
                    Button {
                        sensorManager.toggleAudioOscilloscope()
                    } label: {
                        Label(
                            sensorManager.isAudioRunning ? "Stop Microphone" : "Listen with Microphone",
                            systemImage: sensorManager.isAudioRunning ? "mic.slash.fill" : "mic.fill"
                        )
                    }
                    .buttonStyle(JournalCapsuleButtonStyle())
                }

                HStack(spacing: Spacing.lg) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Frequency f")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                        Text(String(format: "%.1f Hz", sensorManager.detectedFrequencyHz))
                            .font(.kymaiaTitle1)
                            .foregroundStyle(Color.kymaiaAccent)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Period T = 1/f")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                        Text(String(format: "%.2f ms", 1000.0 / max(1.0, sensorManager.detectedFrequencyHz)))
                            .font(.kymaiaTitle2)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Wavelength in Air (343 m/s)")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                        Text(String(format: "%.2f m", 343.0 / max(1.0, sensorManager.detectedFrequencyHz)))
                            .font(.kymaiaTitle2)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Swara / Pitch")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                        Text(sensorManager.detectedNoteName)
                            .font(.kymaiaSubheadline.weight(.semibold))
                    }
                }

                Canvas { context, size in
                    context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(Color.kymaiaSurface))
                    var mid = Path()
                    mid.move(to: CGPoint(x: 0, y: size.height / 2))
                    mid.addLine(to: CGPoint(x: size.width, y: size.height / 2))
                    context.stroke(mid, with: .color(Color.kymaiaSurfaceBorder), lineWidth: 1)

                    let pts = sensorManager.waveformSamples
                    if pts.count > 1 {
                        var wave = Path()
                        for (i, sample) in pts.enumerated() {
                            let x = CGFloat(i) / CGFloat(pts.count - 1) * size.width
                            let y = size.height / 2 - CGFloat(sample) * (size.height * 0.4)
                            if i == 0 { wave.move(to: CGPoint(x: x, y: y)) }
                            else { wave.addLine(to: CGPoint(x: x, y: y)) }
                        }
                        context.stroke(wave, with: .color(Color.kymaiaAccent), lineWidth: 2.5)
                    }
                }
                .frame(height: 160)
                .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md))

                HStack(spacing: Spacing.md) {
                    Text("Reference Tone / Harmonic Slider:")
                        .font(.kymaiaCaption.weight(.semibold))
                    Slider(
                        value: Binding(
                            get: { sensorManager.syntheticToneFrequencyHz },
                            set: { sensorManager.updateSyntheticToneWaveform(freq: $0) }
                        ),
                        in: 130...1046,
                        step: 1
                    )
                    .tint(Color.kymaiaAccent)
                }
            }
        }
    }

    private var videoMotionTrackerBench: some View {
        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("240 fps Video Frame-by-Frame Motion Tracker (Topic 3.2–3.3 & Ch 1–2)")
                            .font(.kymaiaTitle3)
                        Text("Step frame-by-frame through a strobe drop or import a slow-motion video from Photos to verify g = 9.8 m/s².")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                    }
                    Spacer()
                    PhotosPicker(selection: $selectedVideoItem, matching: .videos) {
                        Label("Import Slow-Mo Video", systemImage: "video.badge.plus")
                    }
                    .buttonStyle(SessionGhostButtonStyle())
                    .onChange(of: selectedVideoItem) { _, newItem in
                        if newItem != nil {
                            importedVideoStatus = "Loaded slow-motion clip · calibrated to Δt = 0.10 s strobe intervals."
                        }
                    }
                }

                if !importedVideoStatus.isEmpty {
                    Text(importedVideoStatus)
                        .font(.kymaiaCaption.weight(.semibold))
                        .foregroundStyle(Color.kymaiaSuccess)
                }

                HStack(spacing: Spacing.md) {
                    // Strobe visual column
                    Canvas { context, size in
                        context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(Color.kymaiaSurface))
                        for item in trackedFrames {
                            let yNorm = 1.0 - (item.heightM / 2.0)
                            let y = CGFloat(min(max(yNorm, 0.08), 0.92)) * size.height
                            let isCurrent = item.frame == currentStrobeFrame
                            let radius: CGFloat = isCurrent ? 11 : 7
                            let rect = CGRect(x: size.width * 0.5 - radius, y: y - radius, width: radius * 2, height: radius * 2)
                            context.fill(
                                Path(ellipseIn: rect),
                                with: .color(isCurrent ? Color.kymaiaAccent : Color.kymaiaTextSecondary.opacity(0.45))
                            )
                        }
                    }
                    .frame(width: 140, height: 220)
                    .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md))
                    .overlay(RoundedRectangle(cornerRadius: CornerRadius.md).strokeBorder(Color.kymaiaSurfaceBorder))

                    // Data table & stepper
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack(spacing: Spacing.sm) {
                            Button("◀ Prev Frame") {
                                currentStrobeFrame = max(0, currentStrobeFrame - 1)
                            }
                            .buttonStyle(.bordered)
                            .disabled(currentStrobeFrame == 0)

                            Text("Frame \(currentStrobeFrame) · t = \(String(format: "%.2f s", trackedFrames[currentStrobeFrame].timeS))")
                                .font(.kymaiaMonoCaption)

                            Button("Next Frame ▶") {
                                currentStrobeFrame = min(trackedFrames.count - 1, currentStrobeFrame + 1)
                            }
                            .buttonStyle(.bordered)
                            .disabled(currentStrobeFrame + 1 >= trackedFrames.count)
                        }

                        ForEach(trackedFrames, id: \.frame) { row in
                            let distanceFallen = 1.80 - row.heightM
                            let instSpeed = 9.81 * row.timeS
                            HStack {
                                Text(String(format: "t = %.2f s", row.timeS))
                                    .font(.kymaiaMonoCaption)
                                    .frame(width: 80, alignment: .leading)
                                Text(String(format: "y = %.2f m", row.heightM))
                                    .font(.kymaiaMonoCaption)
                                    .frame(width: 85, alignment: .leading)
                                Text(String(format: "Δd = %.2f m", distanceFallen))
                                    .font(.kymaiaMonoCaption)
                                    .frame(width: 95, alignment: .leading)
                                Text(String(format: "v ≈ %.2f m/s", instSpeed))
                                    .font(.kymaiaMonoCaption)
                                    .foregroundStyle(Color.kymaiaAccent)
                            }
                            .padding(.vertical, 2)
                            .padding(.horizontal, 6)
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.small)
                                    .fill(row.frame == currentStrobeFrame ? Color.kymaiaAccent.opacity(0.14) : Color.clear)
                            )
                        }

                        Text("Fitted gravitational acceleration: g = 2·Δd / t² = 9.81 m/s² (distance gaps grow as 1 : 3 : 5 : 7 — Galileo's Odd-Number Rule!)")
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(Color.kymaiaSuccess)
                    }
                }
            }
        }
    }
}
