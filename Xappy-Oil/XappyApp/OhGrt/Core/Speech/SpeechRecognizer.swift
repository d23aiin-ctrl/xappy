//
//  SpeechRecognizer.swift
//  XappyAI
//
//  Speech recognition service using SFSpeechRecognizer
//

import Foundation
import Speech
import AVFoundation
import Combine

/// Speech recognition states
enum SpeechRecognitionState: Equatable {
    case idle
    case requesting
    case recording
    case processing
    case error(String)

    var isRecording: Bool {
        self == .recording
    }
}

/// Speech recognition service using Apple's SFSpeechRecognizer
@MainActor
final class SpeechRecognizer: ObservableObject {

    // MARK: - Published Properties

    @Published private(set) var state: SpeechRecognitionState = .idle
    @Published private(set) var transcript: String = ""
    @Published private(set) var isAvailable: Bool = false

    // MARK: - Private Properties

    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    // Supported locales for oil & gas industry (English variants + common field languages)
    private let supportedLocales: [Locale] = [
        Locale(identifier: "en-US"),
        Locale(identifier: "en-GB"),
        Locale(identifier: "en-IN"),
        Locale(identifier: "en-AU"),
        Locale(identifier: "hi-IN"),
        Locale(identifier: "ar-SA"),
    ]

    // MARK: - Initialization

    init() {
        setupSpeechRecognizer()
    }

    // MARK: - Setup

    private func setupSpeechRecognizer() {
        // Use device locale if supported, otherwise default to en-US
        let deviceLocale = Locale.current
        let locale = supportedLocales.first { $0.identifier == deviceLocale.identifier } ?? Locale(identifier: "en-US")

        speechRecognizer = SFSpeechRecognizer(locale: locale)
        speechRecognizer?.delegate = SpeechRecognizerDelegate(parent: self)

        // Check initial availability
        isAvailable = speechRecognizer?.isAvailable ?? false
    }

    // MARK: - Permission Handling

    /// Request speech recognition and microphone permissions
    func requestPermissions() async -> Bool {
        state = .requesting

        // Request speech recognition permission
        let speechStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }

        guard speechStatus == .authorized else {
            state = .error(permissionErrorMessage(for: speechStatus))
            return false
        }

        // Request microphone permission
        let micStatus: Bool
        if #available(iOS 17.0, *) {
            micStatus = await AVAudioApplication.requestRecordPermission()
        } else {
            micStatus = await withCheckedContinuation { continuation in
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    continuation.resume(returning: granted)
                }
            }
        }

        guard micStatus else {
            state = .error("Microphone access denied. Please enable it in Settings.")
            return false
        }

        state = .idle
        return true
    }

    private func permissionErrorMessage(for status: SFSpeechRecognizerAuthorizationStatus) -> String {
        switch status {
        case .denied:
            return "Speech recognition denied. Please enable it in Settings."
        case .restricted:
            return "Speech recognition is restricted on this device."
        case .notDetermined:
            return "Speech recognition permission not determined."
        case .authorized:
            return ""
        @unknown default:
            return "Unknown speech recognition error."
        }
    }

    // MARK: - Recording Control

    /// Start recording and transcribing speech
    func startRecording() async {
        // Reset state
        transcript = ""

        // Check permissions first
        let hasPermission = await requestPermissions()
        guard hasPermission else { return }

        guard let recognizer = speechRecognizer, recognizer.isAvailable else {
            state = .error("Speech recognition is not available.")
            return
        }

        // Cancel any existing task
        recognitionTask?.cancel()
        recognitionTask = nil

        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            state = .error("Failed to configure audio session: \(error.localizedDescription)")
            return
        }

        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()

        guard let recognitionRequest = recognitionRequest else {
            state = .error("Failed to create recognition request.")
            return
        }

        recognitionRequest.shouldReportPartialResults = true
        recognitionRequest.taskHint = .dictation

        // Add on-device recognition if available (iOS 13+)
        if #available(iOS 13, *) {
            if recognizer.supportsOnDeviceRecognition {
                recognitionRequest.requiresOnDeviceRecognition = false // Allow cloud for better accuracy
            }
        }

        // Get audio input
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        // Validate the audio format — the simulator (or devices without a mic)
        // can return a format with 0 Hz sample rate / 0 channels, which causes
        // AVFAudio to throw an uncaught ObjC exception.
        guard recordingFormat.sampleRate > 0, recordingFormat.channelCount > 0 else {
            state = .error("No audio input available. Microphone may not be supported on this device.")
            return
        }

        // Install tap on audio input
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        // Start audio engine
        do {
            audioEngine.prepare()
            try audioEngine.start()
            state = .recording
        } catch {
            state = .error("Failed to start audio engine: \(error.localizedDescription)")
            return
        }

        // Start recognition task
        recognitionTask = recognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            Task { @MainActor in
                guard let self = self else { return }

                if let result = result {
                    self.transcript = result.bestTranscription.formattedString

                    // Check if this is the final result
                    if result.isFinal {
                        self.stopRecordingInternal()
                    }
                }

                if let error = error {
                    // Ignore cancellation errors
                    let nsError = error as NSError
                    if nsError.domain != "kAFAssistantErrorDomain" || nsError.code != 216 {
                        self.state = .error("Recognition error: \(error.localizedDescription)")
                    }
                    self.stopRecordingInternal()
                }
            }
        }
    }

    /// Stop recording
    func stopRecording() {
        stopRecordingInternal()
    }

    private func stopRecordingInternal() {
        // Stop audio engine
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }

        // End recognition request
        recognitionRequest?.endAudio()
        recognitionRequest = nil

        // Cancel task if still running
        recognitionTask?.cancel()
        recognitionTask = nil

        // Reset audio session
        do {
            try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            print("Failed to deactivate audio session: \(error)")
        }

        // Update state
        if state == .recording || state == .processing {
            state = .idle
        }
    }

    /// Toggle recording state
    func toggleRecording() async {
        if state.isRecording {
            stopRecording()
        } else {
            await startRecording()
        }
    }

    /// Clear transcript
    func clearTranscript() {
        transcript = ""
    }

    // MARK: - Availability Update

    fileprivate func updateAvailability(_ available: Bool) {
        isAvailable = available
    }
}

// MARK: - Speech Recognizer Delegate

private class SpeechRecognizerDelegate: NSObject, SFSpeechRecognizerDelegate {
    weak var parent: SpeechRecognizer?

    init(parent: SpeechRecognizer) {
        self.parent = parent
    }

    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        Task { @MainActor in
            parent?.updateAvailability(available)
        }
    }
}
