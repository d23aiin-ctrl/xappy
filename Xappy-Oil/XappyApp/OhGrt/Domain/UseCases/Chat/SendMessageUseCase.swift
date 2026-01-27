import Foundation

/// Use case for sending a chat message and getting AI response
protocol SendMessageUseCaseProtocol: Sendable {
    func execute(
        message: String,
        conversationId: UUID,
        tools: [String],
        location: LocationDTO?,
        fieldUpdates: [FieldUpdateDTO]?
    ) async throws -> ChatMessage
}

final class SendMessageUseCase: SendMessageUseCaseProtocol, @unchecked Sendable {
    private let chatRepository: ChatRepositoryProtocol
    private let conversationRepository: ConversationRepositoryProtocol

    init(
        chatRepository: ChatRepositoryProtocol,
        conversationRepository: ConversationRepositoryProtocol
    ) {
        self.chatRepository = chatRepository
        self.conversationRepository = conversationRepository
    }

    func execute(
        message: String,
        conversationId: UUID,
        tools: [String],
        location: LocationDTO? = nil,
        fieldUpdates: [FieldUpdateDTO]? = nil
    ) async throws -> ChatMessage {
        // Validate message (allow empty if fieldUpdates present)
        let trimmedMessage = message.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedMessage.isEmpty || (fieldUpdates != nil && !fieldUpdates!.isEmpty) else {
            throw DomainError.messageEmpty
        }

        // Create and save user message (only if message is not empty)
        if !trimmedMessage.isEmpty {
            let userMessage = ChatMessage(
                conversationId: conversationId,
                content: trimmedMessage,
                role: .user
            )
            try await conversationRepository.saveMessage(userMessage)
        }

        // Send to AI and get response
        let aiResponse = try await chatRepository.sendMessage(
            trimmedMessage,
            conversationId: conversationId,
            tools: tools,
            location: location,
            fieldUpdates: fieldUpdates
        )

        // Save AI response
        try await conversationRepository.saveMessage(aiResponse)

        // Update conversation
        var conversation = try await conversationRepository.getConversation(id: conversationId)
        let updatedConversation = ChatConversation(
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: Date(),
            messageCount: conversation.messageCount + (trimmedMessage.isEmpty ? 1 : 2),
            lastMessagePreview: String(aiResponse.content.prefix(100)),
            tools: conversation.tools
        )
        try await conversationRepository.updateConversation(updatedConversation)

        return aiResponse
    }
}
