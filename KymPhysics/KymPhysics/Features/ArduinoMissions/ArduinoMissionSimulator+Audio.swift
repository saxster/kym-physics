import AVFoundation
import Foundation

// MARK: - Bidirectional Highlighting & Line Lookup

extension ArduinoMission {
    /// Returns 1-based line numbers in `renderedCode` that correspond to the selected part or parameter.
    /// Guaranteed to return non-empty line numbers for every part index across all 10 missions.
    func highlightedLineNumbers(
        forSelectedPartIndex partIndex: Int?,
        focusedParamID: String?,
        values: [String: Int]
    ) -> Set<Int> {
        let lines = renderedCode(with: values).components(separatedBy: .newlines)
        var matched = Set<Int>()

        if let focusedParamID,
           let param = params.first(where: { $0.id == focusedParamID }) {
            let replacement = param.replacementText(for: resolvedValue(for: param.id, in: values))
            for (idx, line) in lines.enumerated() {
                if line.contains(replacement) || line.contains(param.codeTarget) {
                    matched.insert(idx + 1)
                }
            }
        }

        if let partIndex, parts.indices.contains(partIndex) {
            let part = parts[partIndex].lowercased()
            let keywords = Self.keywords(forPart: part, missionID: missionID)
            for (idx, line) in lines.enumerated() {
                let lowerLine = line.lowercased()
                if keywords.contains(where: { lowerLine.contains($0) }) {
                    matched.insert(idx + 1)
                }
            }
            if matched.isEmpty, !lines.isEmpty {
                let fallback = findLine(containing: "void setup()", inLines: lines, startingAt: 1, defaultLine: 1)
                matched.insert(fallback)
            }
        }

        return matched
    }

    func findLine(
        containing needle: String,
        inLines lines: [String],
        startingAt startLine: Int,
        defaultLine: Int
    ) -> Int {
        let startIndex = max(0, startLine - 1)
        if startIndex < lines.count {
            for idx in startIndex..<lines.count where lines[idx].contains(needle) {
                return idx + 1
            }
        }
        for (idx, line) in lines.enumerated() where line.contains(needle) {
            return idx + 1
        }
        return min(max(1, defaultLine), max(1, lines.count))
    }

    private static func keywords(forPart part: String, missionID: ArduinoMissionID) -> [String] {
        if missionID == .fieldAgent {
            if part.contains("camera") { return ["camera", "who the visitors"] }
            if part.contains("counter") { return ["counter", "visits"] }
            if part.contains("logger") { return ["logger", "light + temperature"] }
            if part.contains("battery") { return ["side by side", "what broke"] }
            if part.contains("notebook") { return ["question", "notebook", "verdict"] }
        }
        var keys: [String] = []
        if part.contains("led") || part.contains("torch") || part.contains("flashlight") {
            keys.append(contentsOf: ["led", "13", "11", "12", "digitalwrite", "pinmode"])
        }
        if part.contains("220") || part.contains("resistor") || part.contains("10 k") {
            keys.append(contentsOf: ["digitalwrite", "analogread", "ldrpin", "skinpin", "13"])
        }
        if part.contains("piezo") || part.contains("buzzer") {
            keys.append(contentsOf: ["buzz", "tone(", "notone"])
        }
        if part.contains("pir") || part.contains("motion") {
            keys.append(contentsOf: ["pir", "digitalread", "wakeup"])
        }
        if part.contains("photoresistor") || part.contains("ldr") {
            keys.append(contentsOf: ["ldrpin", "analogread", "light"])
        }
        if part.contains("hc-sr04") || part.contains("ultrasonic") {
            keys.append(contentsOf: ["trigpin", "echopin", "pulsein"])
        }
        if part.contains("foil") || part.contains("card") || part.contains("tape") || part.contains("tube") {
            keys.append(contentsOf: ["skinpin", "baseline", "ldrpin", "pirpin"])
        }
        if part.contains("esp32-cam") || part.contains("microsd") || part.contains("feeder") {
            keys.append(contentsOf: ["takephotoandsave", "esp_deep_sleep", "pir_pin", "beampin"])
        }
        if part.contains("break-beam") {
            keys.append(contentsOf: ["beampin", "input_pullup", "broken", "count"])
        }
        if part.contains("dht11") || part.contains("temperature") {
            keys.append(contentsOf: ["dht", "readtemperature", "readhumidity"])
        }
        if part.contains("arduino uno") || part.contains("usb") || part.contains("breadboard") || part.contains("jumper") || part.contains("box") || part.contains("battery") || part.contains("clip") {
            keys.append(contentsOf: ["void setup()", "serial.begin", "pinmode", "esp_deep_sleep_start"])
        }
        return keys
    }
}

// MARK: - Piezo Square-Wave Tone Preview Synthesizer

enum ArduinoTonePreviewPlayer {
    static let muteStorageKey = "arduinoMissionsAudioMuted"

    @MainActor private static var audioPlayer: AVAudioPlayer?

    /// Synthesizes a 16-bit mono PCM square-wave buffer with attack/release envelope.
    nonisolated static func makeSquareWaveWAVData(
        frequencyHz: Int,
        durationSeconds: Double = 0.16,
        sampleRate: Int = 22_050
    ) -> Data {
        let clampedHz = max(120, min(4000, frequencyHz))
        let frameCount = max(1, Int(Double(sampleRate) * durationSeconds))
        let attackFrames = max(1, Int(Double(sampleRate) * 0.008))
        let releaseFrames = max(1, Int(Double(sampleRate) * 0.018))
        let amplitude: Double = 0.22 * Double(Int16.max)

        var pcmSamples = [Int16](repeating: 0, count: frameCount)
        let period = Double(sampleRate) / Double(clampedHz)

        for frame in 0..<frameCount {
            let phase = Double(frame).truncatingRemainder(dividingBy: period) / period
            let rawSquare: Double = phase < 0.5 ? 1.0 : -1.0

            let envelope: Double
            if frame < attackFrames {
                envelope = Double(frame) / Double(attackFrames)
            } else if frame > frameCount - releaseFrames {
                envelope = Double(max(0, frameCount - frame)) / Double(releaseFrames)
            } else {
                envelope = 1.0
            }

            pcmSamples[frame] = Int16(clamping: Int(rawSquare * amplitude * envelope))
        }

        let dataSize = UInt32(frameCount * 2)
        let riffChunkSize = 36 + dataSize
        var wav = Data(capacity: Int(44 + dataSize))

        wav.append(contentsOf: [0x52, 0x49, 0x46, 0x46]) // "RIFF"
        wav.append(littleEndianUInt32: riffChunkSize)
        wav.append(contentsOf: [0x57, 0x41, 0x56, 0x45]) // "WAVE"
        wav.append(contentsOf: [0x66, 0x6D, 0x74, 0x20]) // "fmt "
        wav.append(littleEndianUInt32: 16)
        wav.append(littleEndianUInt16: 1) // PCM
        wav.append(littleEndianUInt16: 1) // Mono
        wav.append(littleEndianUInt32: UInt32(sampleRate))
        wav.append(littleEndianUInt32: UInt32(sampleRate * 2))
        wav.append(littleEndianUInt16: 2)
        wav.append(littleEndianUInt16: 16)
        wav.append(contentsOf: [0x64, 0x61, 0x74, 0x61]) // "data"
        wav.append(littleEndianUInt32: dataSize)

        for sample in pcmSamples {
            wav.append(littleEndianInt16: sample)
        }
        return wav
    }

    @MainActor
    static func playTone(frequencyHz: Int, isMuted: Bool) {
        guard !isMuted else { return }
        let wavData = makeSquareWaveWAVData(frequencyHz: frequencyHz)
        do {
            audioPlayer = try AVAudioPlayer(data: wavData)
            audioPlayer?.prepareToPlay()
            audioPlayer?.play()
        } catch {
            audioPlayer = nil
        }
    }
}

private extension Data {
    mutating func append(littleEndianUInt16 value: UInt16) {
        var little = value.littleEndian
        Swift.withUnsafeBytes(of: &little) { append(contentsOf: $0) }
    }

    mutating func append(littleEndianUInt32 value: UInt32) {
        var little = value.littleEndian
        Swift.withUnsafeBytes(of: &little) { append(contentsOf: $0) }
    }

    mutating func append(littleEndianInt16 value: Int16) {
        var little = value.littleEndian
        Swift.withUnsafeBytes(of: &little) { append(contentsOf: $0) }
    }
}
