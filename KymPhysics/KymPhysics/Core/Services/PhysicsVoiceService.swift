import AVFoundation
import Foundation
import Speech
import SwiftUI

/// On-device Speech-to-Text (`SFSpeechRecognizer` + `AVAudioEngine`) transcriber and Two-Voice Socratic dialogue builder.
/// Ported and adapted from `../kym_tutor/KymaiaTutor/KymaiaTutor/Core/Services/Voice/SpeechService.swift`.
@MainActor
@Observable
final class PhysicsSpeechTranscriber {
    private(set) var isRecording: Bool = false
    private(set) var partialTranscript: String = ""
    private(set) var statusMessage: String? = nil
    private(set) var safetyEscalationResult: SafetyScanResult? = nil

    private let safetyMonitor = LiveMentorTranscriptSafetyMonitor(sourceSurface: "voice_dictation")
    private var audioEngine = AVAudioEngine()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let recognizer: SFSpeechRecognizer? =
        SFSpeechRecognizer(locale: Locale(identifier: "en-IN"))
        ?? SFSpeechRecognizer(locale: Locale(identifier: "en-GB"))
        ?? SFSpeechRecognizer(locale: Locale(identifier: "en-US"))

    func toggleRecording(appendingTo targetText: Binding<String>) {
        if isRecording {
            stopRecording()
        } else {
            startRecording(appendingTo: targetText)
        }
    }

    func startRecording(appendingTo targetText: Binding<String>) {
        guard !isRecording else { return }
        statusMessage = nil

        let currentAuth = SFSpeechRecognizer.authorizationStatus()
        if currentAuth == .notDetermined {
            SFSpeechRecognizer.requestAuthorization { [weak self] status in
                Task { @MainActor in
                    guard let self else { return }
                    if status == .authorized {
                        self.beginAudioEngineSession(appendingTo: targetText)
                    } else {
                        self.statusMessage = "Speech recognition permission not granted."
                    }
                }
            }
            return
        } else if currentAuth != .authorized {
            statusMessage = "Enable Speech Recognition in Settings to dictate spoken physics answers."
            return
        }

        beginAudioEngineSession(appendingTo: targetText)
    }

    private func beginAudioEngineSession(appendingTo targetText: Binding<String>) {
        guard let recognizer, recognizer.isAvailable else {
            statusMessage = "On-device speech recognizer is currently unavailable."
            return
        }

        recognitionTask?.cancel()
        recognitionTask = nil

        let prefix = targetText.wrappedValue.trimmingCharacters(in: .whitespacesAndNewlines)

        do {
            #if os(iOS)
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetoothHFP])
            try session.setActive(true, options: .notifyOthersOnDeactivation)
            #endif

            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true
            if recognizer.supportsOnDeviceRecognition {
                request.requiresOnDeviceRecognition = true
            }
            self.recognitionRequest = request

            let inputNode = audioEngine.inputNode
            let recordingFormat = inputNode.outputFormat(forBus: 0)
            guard recordingFormat.channelCount > 0 else {
                statusMessage = "No microphone input channel available on this device/simulator."
                return
            }

            inputNode.removeTap(onBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak request] buffer, _ in
                request?.append(buffer)
            }

            audioEngine.prepare()
            try audioEngine.start()
            isRecording = true
            partialTranscript = ""

            recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
                Task { @MainActor in
                    guard let self else { return }
                    if let result {
                        let spoken = result.bestTranscription.formattedString
                        self.partialTranscript = spoken
                        let allowed = await self.safetyMonitor.allowContinuation(for: spoken)
                        if !allowed {
                            self.safetyEscalationResult = self.safetyMonitor.triggeredResult
                            self.statusMessage = self.safetyMonitor.triggeredResult?.supportiveResponse
                            self.stopRecording()
                            return
                        }
                        if prefix.isEmpty {
                            targetText.wrappedValue = spoken
                        } else {
                            targetText.wrappedValue = prefix + " " + spoken
                        }
                    }
                    if error != nil || (result?.isFinal == true) {
                        self.stopRecording()
                    }
                }
            }
        } catch {
            statusMessage = "Microphone capture could not start: \(error.localizedDescription)"
            stopRecording()
        }
    }

    func stopRecording() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        isRecording = false
    }
}

/// Compact 44×44pt Apple Journal microphone dictation button that streams spoken physics explanations into any text binding.
struct VoiceDictationButton: View {
    @Binding var text: String
    var label: String? = nil
    @State private var transcriber = PhysicsSpeechTranscriber()

    var body: some View {
        VStack(alignment: .trailing, spacing: 2) {
            Button {
                transcriber.toggleRecording(appendingTo: $text)
            } label: {
                HStack(spacing: Spacing.xxs) {
                    Image(systemName: transcriber.isRecording ? "waveform.circle.fill" : "mic.fill")
                        .font(.kymaiaCallout.weight(.semibold))
                        .foregroundStyle(transcriber.isRecording ? Color.kymaiaError : Color.kymaiaPrimary)
                        .symbolEffect(.pulse, isActive: transcriber.isRecording)
                    if let label {
                        Text(transcriber.isRecording ? "Stop Dictation" : label)
                            .font(.kymaiaCaption.weight(.semibold))
                            .foregroundStyle(transcriber.isRecording ? Color.kymaiaError : Color.kymaiaPrimary)
                    }
                }
                .padding(.horizontal, label == nil ? Spacing.xs : Spacing.sm)
                .padding(.vertical, Spacing.xs)
                .frame(minWidth: AccessibilityLayout.minTouchTarget, minHeight: AccessibilityLayout.minTouchTarget)
                .background(
                    Capsule()
                        .fill(transcriber.isRecording ? Color.kymaiaError.opacity(0.14) : Color.kymaiaControlFill)
                )
            }
            .buttonStyle(.plain)
            .accessibilityLabel(transcriber.isRecording ? "Stop spoken answer dictation" : "Dictate answer by voice")

            if let status = transcriber.statusMessage {
                Text(status)
                    .font(.kymaiaCaption2)
                    .foregroundStyle(Color.kymaiaWarning)
            }
        }
    }
}

/// Builds a two-voice Host + Co-Host Socratic audio dialogue for any *Moving World* chapter.
enum PhysicsTwoVoiceDialogueBuilder {
    struct DialogueTurn: Sendable, Equatable {
        let speaker: String // "Host (Dr. Rao)" | "Kym's Study Partner (Aarav)"
        let voiceLanguage: String
        let pitchMultiplier: Float
        let text: String
    }

    static func buildDialogue(for chapter: MovingWorldChapter) -> [DialogueTurn] {
        var turns: [DialogueTurn] = []
        turns.append(
            DialogueTurn(
                speaker: "Host (Dr. Rao)",
                voiceLanguage: "en-GB",
                pitchMultiplier: 0.96,
                text: "Welcome to our Two-Voice Physics Briefing for Chapter \(chapter.number): \(chapter.title). \(chapter.subtitle)."
            )
        )
        turns.append(
            DialogueTurn(
                speaker: "Study Partner (Aarav)",
                voiceLanguage: "en-IN",
                pitchMultiplier: 1.10,
                text: "Okay, before we memorize any formula in Chapter \(chapter.number), what is the single everyday phenomenon in Mumbai or daily life that this chapter explains?"
            )
        )
        turns.append(
            DialogueTurn(
                speaker: "Host (Dr. Rao)",
                voiceLanguage: "en-GB",
                pitchMultiplier: 0.96,
                text: chapter.hookSummary.isEmpty
                    ? "Every motion, wave, or field in Chapter \(chapter.number) comes down to measurable physical quantities and cause-and-effect conservation laws."
                    : chapter.hookSummary
            )
        )

        for (index, section) in chapter.sections.prefix(4).enumerated() {
            turns.append(
                DialogueTurn(
                    speaker: "Study Partner (Aarav)",
                    voiceLanguage: "en-IN",
                    pitchMultiplier: 1.10,
                    text: "Step \(index + 1): \(section.heading). How would Cambridge Lower Secondary Science 8 test us on this section?"
                )
            )
            turns.append(
                DialogueTurn(
                    speaker: "Host (Dr. Rao)",
                    voiceLanguage: "en-GB",
                    pitchMultiplier: 0.96,
                    text: section.excerpt.isEmpty
                        ? "In \(section.heading), state the physical relationship first, write the SI units clearly, and explain the microscopic or vector mechanism step by step."
                        : section.excerpt
                )
            )
        }

        turns.append(
            DialogueTurn(
                speaker: "Study Partner (Aarav)",
                voiceLanguage: "en-IN",
                pitchMultiplier: 1.10,
                text: "Got it! Pause this briefing now and try the first Question Proof or interactive simulation on your own before checking the mark scheme."
            )
        )
        return turns
    }
}
