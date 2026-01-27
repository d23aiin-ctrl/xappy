import Foundation
import Combine

/// Protocol defining JanSeva chat repository operations
protocol ChatRepositoryProtocol: Sendable {
    /// Send a message and get AI response
    /// - Parameters:
    ///   - message: User message content
    ///   - conversationId: Conversation ID
    ///   - tools: Selected tools for this message
    ///   - location: Optional user location
    ///   - fieldUpdates: Optional field updates for click-to-edit
    /// - Returns: AI response message
    /// - Throws: DomainError on failure
    func sendMessage(
        _ message: String,
        conversationId: UUID,
        tools: [String],
        location: LocationDTO?,
        fieldUpdates: [FieldUpdateDTO]?
    ) async throws -> ChatMessage

    /// Stream AI response for a message
    /// - Parameters:
    ///   - message: User message content
    ///   - conversationId: Conversation ID
    ///   - tools: Selected tools
    /// - Returns: AsyncThrowingStream of response chunks
    func streamMessage(
        _ message: String,
        conversationId: UUID,
        tools: [String]
    ) -> AsyncThrowingStream<String, Error>
}
