import Foundation

/// Use case for getting available providers/integrations
/// Note: JanSeva doesn't use external providers, so this returns empty
protocol GetProvidersUseCaseProtocol: Sendable {
    func execute() async throws -> [Provider]
}

final class GetProvidersUseCase: GetProvidersUseCaseProtocol, @unchecked Sendable {
    init(chatRepository: ChatRepositoryProtocol) {
        // ChatRepository not needed for JanSeva
    }

    func execute() async throws -> [Provider] {
        // JanSeva doesn't use external providers
        return []
    }
}
