import Foundation

/// Domain entity representing a chat message
struct ChatMessage: Identifiable, Equatable, Sendable {
    let id: UUID
    let conversationId: UUID
    let content: String
    let role: MessageRole
    let createdAt: Date
    let metadata: MessageMetadata?

    /// Whether the message has been synced to the server (for optimistic updates)
    var isSynced: Bool = true

    init(
        id: UUID = UUID(),
        conversationId: UUID,
        content: String,
        role: MessageRole,
        createdAt: Date = Date(),
        metadata: MessageMetadata? = nil,
        isSynced: Bool = true
    ) {
        self.id = id
        self.conversationId = conversationId
        self.content = content
        self.role = role
        self.createdAt = createdAt
        self.metadata = metadata
        self.isSynced = isSynced
    }

    /// Convenience property to check if this is a user message
    var isUser: Bool {
        role == .user
    }

    /// Convenience property to check if this is an assistant message
    var isAssistant: Bool {
        role == .assistant
    }
}

/// Message role (user or assistant)
enum MessageRole: String, Codable, Sendable {
    case user
    case assistant
    case system
}

/// Additional metadata for messages
struct MessageMetadata: Equatable, Sendable {
    let toolsUsed: [String]?
    let processingTime: TimeInterval?
    let modelUsed: String?
    let category: String?
    let mediaUrl: String?
    let requiresLocation: Bool?

    // Report submission flow fields
    let draftState: DraftState?
    let quickActions: [QuickAction]?
    let submissionResult: SubmissionResult?
    let showDraftCard: Bool?

    init(
        toolsUsed: [String]? = nil,
        processingTime: TimeInterval? = nil,
        modelUsed: String? = nil,
        category: String? = nil,
        mediaUrl: String? = nil,
        requiresLocation: Bool? = nil,
        draftState: DraftState? = nil,
        quickActions: [QuickAction]? = nil,
        submissionResult: SubmissionResult? = nil,
        showDraftCard: Bool? = nil
    ) {
        self.toolsUsed = toolsUsed
        self.processingTime = processingTime
        self.modelUsed = modelUsed
        self.category = category
        self.mediaUrl = mediaUrl
        self.requiresLocation = requiresLocation
        self.draftState = draftState
        self.quickActions = quickActions
        self.submissionResult = submissionResult
        self.showDraftCard = showDraftCard
    }
}

// MARK: - Draft State Models

/// Field definition for report draft
struct FieldDefinition: Equatable, Sendable, Identifiable {
    let name: String
    let label: String
    let fieldType: String
    let options: [String]?
    let value: String?
    let isValid: Bool

    var id: String { name }
}

/// Draft state for report being collected
struct DraftState: Equatable, Sendable {
    let reportType: String
    let reportTypeLabel: String
    let stage: String
    let fields: [FieldDefinition]
    let filledCount: Int
    let totalRequired: Int
    let progressPercent: Double
    let nextField: String?
    let isComplete: Bool
}

/// Quick action button
struct QuickAction: Equatable, Sendable, Identifiable {
    let actionType: String
    let label: String
    let value: String
    let fieldName: String?

    var id: String { "\(actionType)_\(value)" }
}

/// Submission result after report is submitted
struct SubmissionResult: Equatable, Sendable {
    let referenceNumber: String
    let reportType: String
    let submittedAt: String
}
