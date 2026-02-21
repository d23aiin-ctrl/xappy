import Foundation

/// Use case for getting available AI tools
/// Note: JanSeva uses built-in tools, not configurable ones
protocol GetToolsUseCaseProtocol: Sendable {
    func execute() async throws -> [Tool]
}

final class GetToolsUseCase: GetToolsUseCaseProtocol, @unchecked Sendable {
    init(chatRepository: ChatRepositoryProtocol) {
        // ChatRepository not needed for JanSeva
    }

    func execute() async throws -> [Tool] {
        // Return default JanSeva tools
        return [
            Tool(id: "grievance", name: "File Grievance", description: "File a complaint or grievance", category: .utility),
            Tool(id: "schemes", name: "Search Schemes", description: "Search government schemes", category: .search),
            Tool(id: "status", name: "Check Status", description: "Check grievance status", category: .utility)
        ]
    }
}
