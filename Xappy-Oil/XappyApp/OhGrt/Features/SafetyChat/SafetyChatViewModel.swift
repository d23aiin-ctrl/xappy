import Foundation
import SwiftUI
import Combine

/// ViewModel for the simplified Safety Chat interface
@MainActor
final class SafetyChatViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published private(set) var messages: [SafetyChatMessage] = []
    @Published private(set) var isLoading = false
    @Published var inputText = ""
    @Published private(set) var error: String?
    @Published var showError = false

    /// Current draft state for report submission
    @Published private(set) var currentDraftState: DraftState?

    // MARK: - Private Properties

    private var sessionId: String?
    private var conversationId: UUID?
    private let baseURL: URL
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Computed Properties

    var canSend: Bool {
        !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isLoading
    }

    /// Check if the most recent message has a submission result
    var hasRecentSubmission: Bool {
        messages.last?.submissionResult != nil
    }

    // MARK: - Initialization

    init() {
        self.baseURL = AppConfig.shared.apiBaseURL
        self.sessionId = UUID().uuidString
    }

    // MARK: - Public Methods

    /// Send the current input message
    func sendCurrentMessage() {
        guard canSend else { return }
        let message = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        inputText = ""
        sendMessage(message)
    }

    /// Send a message (from quick actions or input)
    func sendMessage(_ text: String, fieldUpdates: [FieldUpdateDTO]? = nil) {
        guard !text.isEmpty || fieldUpdates != nil else { return }

        Task {
            await performSendMessage(text, fieldUpdates: fieldUpdates)
        }
    }

    /// Handle quick action selection
    func handleQuickAction(_ action: QuickAction) {
        if action.actionType == "field_option" {
            // Send as field update
            if let fieldName = action.fieldName {
                sendMessage("", fieldUpdates: [FieldUpdateDTO(fieldName: fieldName, value: action.value)])
            } else {
                sendMessage(action.value)
            }
        } else if action.actionType == "confirm" {
            sendMessage("yes")
        } else if action.actionType == "cancel" {
            sendMessage("cancel")
        } else {
            sendMessage(action.value)
        }
    }

    /// Update a specific field in the draft
    func updateField(_ fieldName: String, value: String) {
        sendMessage("", fieldUpdates: [FieldUpdateDTO(fieldName: fieldName, value: value)])
    }

    /// Start a new chat session
    func startNewChat() {
        messages = []
        currentDraftState = nil
        sessionId = UUID().uuidString
        conversationId = nil
        inputText = ""
        error = nil
    }

    /// Confirm the current draft submission
    func confirmSubmission() {
        sendMessage("yes")
    }

    /// Cancel the current draft
    func cancelDraft() {
        sendMessage("cancel")
    }

    /// Send a message with an attached image
    func sendMessageWithImage(_ text: String, image: UIImage) {
        Task {
            await performSendMessageWithImage(text, image: image)
        }
    }

    // MARK: - Private Methods

    private func performSendMessageWithImage(_ text: String, image: UIImage) async {
        isLoading = true

        // Add user message with image to UI immediately
        let userMessage = SafetyChatMessage(
            id: UUID(),
            content: text,
            isUser: true,
            timestamp: Date(),
            attachedImage: image
        )
        messages.append(userMessage)

        do {
            // For now, just send the text and mention an image was attached
            // In production, you'd upload the image to a server first
            let messageWithImageNote = text.isEmpty
                ? "[Image attached for report evidence]"
                : "\(text) [Image attached]"

            let response = try await sendChatRequest(message: messageWithImageNote, fieldUpdates: nil)

            // Map DTOs to domain models
            let draftState = response.draftState.map { mapDraftState($0) }
            let quickActions = response.quickActions?.map { mapQuickAction($0) }
            let submissionResult = response.submissionResult.map { mapSubmissionResult($0) }

            // Create AI message from response
            let aiMessage = SafetyChatMessage(
                id: UUID(),
                content: response.content,
                isUser: false,
                timestamp: Date(),
                draftState: draftState,
                quickActions: quickActions,
                submissionResult: submissionResult,
                showDraftCard: response.showDraftCard ?? false
            )
            messages.append(aiMessage)

            // Update current draft state
            currentDraftState = draftState

            // Update conversation ID if provided
            if let convId = response.conversationId, let uuid = UUID(uuidString: convId) {
                conversationId = uuid
            }

        } catch {
            self.error = error.localizedDescription
            showError = true
        }

        isLoading = false
    }

    private func performSendMessage(_ text: String, fieldUpdates: [FieldUpdateDTO]?) async {
        isLoading = true

        // Add user message to UI immediately (if not empty)
        if !text.isEmpty {
            let userMessage = SafetyChatMessage(
                id: UUID(),
                content: text,
                isUser: true,
                timestamp: Date()
            )
            messages.append(userMessage)
        }

        do {
            let response = try await sendChatRequest(message: text, fieldUpdates: fieldUpdates)

            // Map DTOs to domain models
            let draftState = response.draftState.map { mapDraftState($0) }
            let quickActions = response.quickActions?.map { mapQuickAction($0) }
            let submissionResult = response.submissionResult.map { mapSubmissionResult($0) }

            // Create AI message from response
            let aiMessage = SafetyChatMessage(
                id: UUID(),
                content: response.content,
                isUser: false,
                timestamp: Date(),
                draftState: draftState,
                quickActions: quickActions,
                submissionResult: submissionResult,
                showDraftCard: response.showDraftCard ?? false
            )
            messages.append(aiMessage)

            // Update current draft state
            currentDraftState = draftState

            // Update conversation ID if provided
            if let convId = response.conversationId, let uuid = UUID(uuidString: convId) {
                conversationId = uuid
            }

        } catch {
            // Remove optimistic user message on error
            if !text.isEmpty && !messages.isEmpty {
                messages.removeLast()
            }
            self.error = error.localizedDescription
            showError = true
        }

        isLoading = false
    }

    private func sendChatRequest(message: String, fieldUpdates: [FieldUpdateDTO]?) async throws -> ChatResponseDTO {
        // Check if we have an auth token
        let authToken = UserDefaults.standard.string(forKey: "authToken")

        // Use demo endpoint if not authenticated, otherwise use main endpoint
        let endpoint: String
        if let token = authToken, !token.isEmpty {
            endpoint = "api/v1/chat/send"
        } else {
            // Use demo endpoint - first create session if needed, then send message
            if sessionId == nil {
                let demoSession = try await createDemoSession()
                sessionId = demoSession
            }
            endpoint = "api/v1/chat/demo/\(sessionId ?? "")"
        }

        let url = baseURL.appendingPathComponent(endpoint)

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add auth token if available
        if let token = authToken, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let requestBody = ChatRequestDTO(
            message: message,
            conversationId: conversationId?.uuidString ?? sessionId ?? UUID().uuidString,
            tools: [],
            sessionId: sessionId,
            location: nil,
            fieldUpdates: fieldUpdates
        )

        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(requestBody)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw SafetyChatError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            throw SafetyChatError.unauthorized
        }

        guard httpResponse.statusCode == 200 else {
            throw SafetyChatError.serverError(httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        return try decoder.decode(ChatResponseDTO.self, from: data)
    }

    /// Create a demo session for unauthenticated testing
    private func createDemoSession() async throws -> String {
        let url = baseURL.appendingPathComponent("api/v1/chat/demo")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = "{}".data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw SafetyChatError.invalidResponse
        }

        struct DemoSessionResponse: Codable {
            let sessionId: String
        }

        let decoder = JSONDecoder()
        let session = try decoder.decode(DemoSessionResponse.self, from: data)
        return session.sessionId
    }

    // MARK: - Mappers

    private func mapDraftState(_ dto: DraftStateDTO) -> DraftState {
        DraftState(
            reportType: dto.reportType,
            reportTypeLabel: dto.reportTypeLabel,
            stage: dto.stage,
            fields: dto.fields.map { mapFieldDefinition($0) },
            filledCount: dto.filledCount,
            totalRequired: dto.totalRequired,
            progressPercent: dto.progressPercent,
            nextField: dto.nextField,
            isComplete: dto.isComplete
        )
    }

    private func mapFieldDefinition(_ dto: FieldDefinitionDTO) -> FieldDefinition {
        FieldDefinition(
            name: dto.name,
            label: dto.label,
            fieldType: dto.fieldType,
            options: dto.options,
            value: dto.value,
            isValid: dto.isValid
        )
    }

    private func mapQuickAction(_ dto: QuickActionDTO) -> QuickAction {
        QuickAction(
            actionType: dto.actionType,
            label: dto.label,
            value: dto.value,
            fieldName: dto.fieldName
        )
    }

    private func mapSubmissionResult(_ dto: SubmissionResultDTO) -> SubmissionResult {
        SubmissionResult(
            referenceNumber: dto.referenceNumber,
            reportType: dto.reportType,
            submittedAt: dto.submittedAt
        )
    }
}

// MARK: - Supporting Types

struct SafetyChatMessage: Identifiable, Equatable {
    let id: UUID
    let content: String
    let isUser: Bool
    let timestamp: Date
    var draftState: DraftState?
    var quickActions: [QuickAction]?
    var submissionResult: SubmissionResult?
    var showDraftCard: Bool = false
    var attachedImage: UIImage?

    static func == (lhs: SafetyChatMessage, rhs: SafetyChatMessage) -> Bool {
        lhs.id == rhs.id
    }
}

enum SafetyChatError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case serverError(Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid server URL"
        case .invalidResponse:
            return "Invalid server response"
        case .unauthorized:
            return "Please log in again"
        case .serverError(let code):
            return "Server error: \(code)"
        }
    }
}
