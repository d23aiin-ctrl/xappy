import Foundation

/// DTO for user location
struct LocationDTO: Codable {
    let latitude: Double
    let longitude: Double
    let accuracy: Double?
    let address: String?
}

/// DTO for field update request (click-to-edit)
struct FieldUpdateDTO: Codable {
    let fieldName: String
    let value: String

    enum CodingKeys: String, CodingKey {
        case fieldName
        case value
    }
}

/// DTO for chat message request
struct ChatRequestDTO: Codable {
    let message: String
    let conversationId: String
    let tools: [String]
    let sessionId: String?
    let location: LocationDTO?
    let fieldUpdates: [FieldUpdateDTO]?

    enum CodingKeys: String, CodingKey {
        case message
        case conversationId = "conversation_id"
        case tools
        case sessionId = "session_id"
        case location
        case fieldUpdates
    }
}

// MARK: - Draft State Models

/// Field definition for draft state
struct FieldDefinitionDTO: Codable, Identifiable {
    let name: String
    let label: String
    let fieldType: String
    let options: [String]?
    let value: String?
    let isValid: Bool

    var id: String { name }

    enum CodingKeys: String, CodingKey {
        case name
        case label
        case fieldType
        case options
        case value
        case isValid
    }

    // Custom decoder to handle both camelCase and snake_case
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        name = try container.decode(String.self, forKey: .name)
        label = try container.decode(String.self, forKey: .label)
        options = try container.decodeIfPresent([String].self, forKey: .options)
        value = try container.decodeIfPresent(String.self, forKey: .value)

        // Try camelCase first, then snake_case
        if let ft = try? container.decode(String.self, forKey: .fieldType) {
            fieldType = ft
        } else {
            // Fallback to snake_case key
            let snakeContainer = try decoder.container(keyedBy: SnakeCaseKeys.self)
            fieldType = try snakeContainer.decode(String.self, forKey: .fieldType)
        }

        if let valid = try? container.decode(Bool.self, forKey: .isValid) {
            isValid = valid
        } else {
            let snakeContainer = try decoder.container(keyedBy: SnakeCaseKeys.self)
            isValid = try snakeContainer.decode(Bool.self, forKey: .isValid)
        }
    }

    private enum SnakeCaseKeys: String, CodingKey {
        case fieldType = "field_type"
        case isValid = "is_valid"
    }
}

/// Draft state for report being collected
struct DraftStateDTO: Codable {
    let reportType: String
    let reportTypeLabel: String
    let stage: String
    let fields: [FieldDefinitionDTO]
    let filledCount: Int
    let totalRequired: Int
    let progressPercent: Double
    let nextField: String?
    let isComplete: Bool

    enum CodingKeys: String, CodingKey {
        case reportType
        case reportTypeLabel
        case stage
        case fields
        case filledCount
        case totalRequired
        case progressPercent
        case nextField
        case isComplete
    }
}

/// Quick action button
struct QuickActionDTO: Codable, Identifiable {
    let actionType: String
    let label: String
    let value: String
    let fieldName: String?

    var id: String { "\(actionType)_\(value)" }

    enum CodingKeys: String, CodingKey {
        case actionType
        case label
        case value
        case fieldName
    }
}

/// Submission result after report is submitted
struct SubmissionResultDTO: Codable {
    let referenceNumber: String
    let reportType: String
    let submittedAt: String

    enum CodingKeys: String, CodingKey {
        case referenceNumber
        case reportType
        case submittedAt
    }
}

/// DTO for chat message response
struct ChatResponseDTO: Codable {
    let id: String
    let content: String
    let role: String
    let createdAt: String?
    let conversationId: String?
    let toolsUsed: [String]?
    let processingTime: Double?
    let modelUsed: String?
    let mediaUrl: String?
    let requiresLocation: Bool?

    // New fields for report submission flow
    let draftState: DraftStateDTO?
    let quickActions: [QuickActionDTO]?
    let submissionResult: SubmissionResultDTO?
    let showDraftCard: Bool?

    enum CodingKeys: String, CodingKey {
        case id
        case content
        case role
        case createdAt = "created_at"
        case conversationId
        case toolsUsed = "tools_used"
        case processingTime = "processing_time"
        case modelUsed = "model_used"
        case mediaUrl = "media_url"
        case requiresLocation = "requires_location"
        case draftState
        case quickActions
        case submissionResult
        case showDraftCard
    }
}

/// DTO for tool information
struct ToolDTO: Codable {
    let id: String
    let name: String
    let description: String
    let category: String?
}

/// DTO for tools list response
struct ToolsResponseDTO: Codable {
    let tools: [ToolDTO]
}

/// DTO for provider information
struct ProviderDTO: Codable {
    let id: String
    let name: String
    let displayName: String?
    let authType: String?
    let isConnected: Bool
    let iconName: String?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case displayName = "display_name"
        case authType = "auth_type"
        case isConnected = "is_connected"
        case iconName = "icon_name"
    }
}

/// DTO for providers list response
struct ProvidersResponseDTO: Codable {
    let providers: [ProviderDTO]
}
