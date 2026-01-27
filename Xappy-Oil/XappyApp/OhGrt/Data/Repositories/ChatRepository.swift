import Foundation
import Combine

/// Implementation of ChatRepositoryProtocol for JanSeva
final class ChatRepository: ChatRepositoryProtocol, @unchecked Sendable {
    private let remoteDataSource: ChatRemoteDataSourceProtocol

    init(remoteDataSource: ChatRemoteDataSourceProtocol) {
        self.remoteDataSource = remoteDataSource
    }

    func sendMessage(
        _ message: String,
        conversationId: UUID,
        tools: [String],
        location: LocationDTO? = nil,
        fieldUpdates: [FieldUpdateDTO]? = nil
    ) async throws -> ChatMessage {
        let request = ChatRequestDTO(
            message: message,
            conversationId: conversationId.uuidString,
            tools: tools,
            sessionId: nil,
            location: location,
            fieldUpdates: fieldUpdates
        )

        let response = try await remoteDataSource.sendMessage(request)
        return ChatMapper.toDomain(response, conversationId: conversationId)
    }

    func streamMessage(
        _ message: String,
        conversationId: UUID,
        tools: [String]
    ) -> AsyncThrowingStream<String, Error> {
        let request = ChatRequestDTO(
            message: message,
            conversationId: conversationId.uuidString,
            tools: tools,
            sessionId: nil,
            location: nil,
            fieldUpdates: nil
        )

        return remoteDataSource.streamMessage(request)
    }
}
