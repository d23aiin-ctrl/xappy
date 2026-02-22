//
//  MapperTests.swift
//  OhGrtTests
//
//  Tests for AuthMapper and ChatMapper
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - AuthMapper Tests

struct AuthMapperTests {

    @Test func mapUserDTOToDomain() throws {
        let json = """
        {
            "id": "user-1",
            "full_name": "John Doe",
            "role": "supervisor",
            "phone_number": "+1234567890",
            "email": "john@example.com",
            "status": "active",
            "site_name": "Alpha Platform",
            "site_id": "site-1"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)
        let user = AuthMapper.toDomain(dto)

        #expect(user.id == "user-1")
        #expect(user.fullName == "John Doe")
        #expect(user.role == .supervisor)
        #expect(user.phoneNumber == "+1234567890")
        #expect(user.email == "john@example.com")
        #expect(user.status == "active")
        #expect(user.siteName == "Alpha Platform")
        #expect(user.siteId == "site-1")
    }

    @Test func mapUserDTOWithUnknownRoleToCitizen() throws {
        let json = """
        {
            "id": "user-2",
            "full_name": "Unknown Role User",
            "role": "unknown_role"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)
        let user = AuthMapper.toDomain(dto)

        #expect(user.role == .citizen)
    }

    @Test func mapAuthResponseToCredentialsWithExpiry() throws {
        let json = """
        {
            "accessToken": "access-token",
            "refreshToken": "refresh-token",
            "tokenType": "Bearer",
            "expiresIn": 3600
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyAuthResponseDTO.self, from: json)
        let creds = AuthMapper.toCredentials(dto)

        #expect(creds.accessToken == "access-token")
        #expect(creds.refreshToken == "refresh-token")
        #expect(creds.expiresAt != nil)
    }

    @Test func mapAuthResponseToCredentialsWithoutExpiry() throws {
        let json = """
        {
            "accessToken": "access-token",
            "tokenType": "Bearer"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyAuthResponseDTO.self, from: json)
        let creds = AuthMapper.toCredentials(dto)

        #expect(creds.accessToken == "access-token")
        #expect(creds.refreshToken == nil)
        #expect(creds.expiresAt == nil)
    }

    @Test func mapTokenRefreshResponseToCredentials() throws {
        let json = """
        {
            "access_token": "new-access",
            "refresh_token": "new-refresh",
            "expires_in": 7200
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(TokenRefreshResponseDTO.self, from: json)
        let creds = AuthMapper.toCredentials(dto)

        #expect(creds.accessToken == "new-access")
        #expect(creds.refreshToken == "new-refresh")
        #expect(creds.expiresAt != nil)
    }

    @Test func mapTokenRefreshResponseWithoutExpiry() throws {
        let json = """
        {
            "access_token": "token-only"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(TokenRefreshResponseDTO.self, from: json)
        let creds = AuthMapper.toCredentials(dto)

        #expect(creds.accessToken == "token-only")
        #expect(creds.expiresAt == nil)
    }
}

// MARK: - ChatMapper Tests

struct ChatMapperTests {

    @Test func mapChatResponseToDomain() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "content": "Here is the information you requested.",
            "role": "assistant",
            "created_at": "2025-06-15T10:30:00Z",
            "tools_used": ["safety_report"],
            "processing_time": 1.5,
            "model_used": "gpt-4"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let conversationId = UUID()
        let message = ChatMapper.toDomain(dto, conversationId: conversationId)

        #expect(message.content == "Here is the information you requested.")
        #expect(message.role == .assistant)
        #expect(message.conversationId == conversationId)
        #expect(message.metadata?.toolsUsed == ["safety_report"])
        #expect(message.metadata?.processingTime == 1.5)
        #expect(message.metadata?.modelUsed == "gpt-4")
    }

    @Test func mapChatResponseUserRole() throws {
        let json = """
        {"id": "msg-1", "content": "Hello", "role": "user"}
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let message = ChatMapper.toDomain(dto, conversationId: UUID())

        #expect(message.role == .user)
    }

    @Test func mapChatResponseSystemRole() throws {
        let json = """
        {"id": "msg-2", "content": "System message", "role": "system"}
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let message = ChatMapper.toDomain(dto, conversationId: UUID())

        #expect(message.role == .system)
    }

    @Test func mapChatResponseUnknownRoleDefaultsToAssistant() throws {
        let json = """
        {"id": "msg-3", "content": "Unknown", "role": "bot"}
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let message = ChatMapper.toDomain(dto, conversationId: UUID())

        #expect(message.role == .assistant)
    }

    @Test func mapChatResponseWithDraftState() throws {
        let json = """
        {
            "id": "msg-4",
            "content": "Collecting report",
            "role": "assistant",
            "draftState": {
                "reportType": "incident",
                "reportTypeLabel": "Incident",
                "stage": "collecting",
                "fields": [
                    {
                        "name": "title",
                        "label": "Title",
                        "fieldType": "text",
                        "value": "Fire",
                        "isValid": true
                    }
                ],
                "filledCount": 1,
                "totalRequired": 5,
                "progressPercent": 20.0,
                "nextField": "description",
                "isComplete": false
            }
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let message = ChatMapper.toDomain(dto, conversationId: UUID())

        #expect(message.metadata?.draftState != nil)
        #expect(message.metadata?.draftState?.reportType == "incident")
        #expect(message.metadata?.draftState?.fields.count == 1)
        #expect(message.metadata?.draftState?.fields.first?.name == "title")
        #expect(message.metadata?.draftState?.fields.first?.value == "Fire")
        #expect(message.metadata?.draftState?.progressPercent == 20.0)
    }

    @Test func mapChatResponseWithSubmissionResult() throws {
        let json = """
        {
            "id": "msg-5",
            "content": "Submitted!",
            "role": "assistant",
            "submissionResult": {
                "referenceNumber": "NM-001",
                "reportType": "near_miss",
                "submittedAt": "2025-06-15T12:00:00Z"
            }
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let message = ChatMapper.toDomain(dto, conversationId: UUID())

        #expect(message.metadata?.submissionResult?.referenceNumber == "NM-001")
        #expect(message.metadata?.submissionResult?.reportType == "near_miss")
    }

    @Test func mapToolDTOToDomain() {
        let dto = ToolDTO(id: "tool-1", name: "Safety Report", description: "File a safety report", category: "utility")
        let tool = ChatMapper.toDomain(dto)

        #expect(tool.id == "tool-1")
        #expect(tool.name == "Safety Report")
        #expect(tool.description == "File a safety report")
        #expect(tool.category == .utility)
    }

    @Test func mapToolDTOCategorySearch() {
        let dto = ToolDTO(id: "t", name: "Search", description: "Search", category: "search")
        #expect(ChatMapper.toDomain(dto).category == .search)
    }

    @Test func mapToolDTOCategoryIntegration() {
        let dto = ToolDTO(id: "t", name: "Int", description: "Int", category: "integration")
        #expect(ChatMapper.toDomain(dto).category == .integration)
    }

    @Test func mapToolDTOCategoryAstrology() {
        let dto = ToolDTO(id: "t", name: "Astro", description: "Astro", category: "astrology")
        #expect(ChatMapper.toDomain(dto).category == .astrology)
    }

    @Test func mapToolDTOCategoryTravel() {
        let dto = ToolDTO(id: "t", name: "Travel", description: "Travel", category: "travel")
        #expect(ChatMapper.toDomain(dto).category == .travel)
    }

    @Test func mapToolDTOCategoryUnknown() {
        let dto = ToolDTO(id: "t", name: "Other", description: "Other", category: "something_else")
        #expect(ChatMapper.toDomain(dto).category == .unknown)
    }

    @Test func mapToolDTONilCategory() {
        let dto = ToolDTO(id: "t", name: "None", description: "None", category: nil)
        #expect(ChatMapper.toDomain(dto).category == .unknown)
    }

    @Test func mapProviderDTOToDomain() {
        let dto = ProviderDTO(id: "p-1", name: "github", displayName: "GitHub", authType: "oauth", isConnected: true, iconName: "gh-icon")
        let provider = ChatMapper.toDomain(dto)

        #expect(provider.id == "p-1")
        #expect(provider.name == "github")
        #expect(provider.displayName == "GitHub")
        #expect(provider.authType == "oauth")
        #expect(provider.isConnected == true)
        #expect(provider.iconName == "gh-icon")
    }

    @Test func mapProviderDTODefaultValues() {
        let dto = ProviderDTO(id: "p-2", name: "slack", displayName: nil, authType: nil, isConnected: false, iconName: nil)
        let provider = ChatMapper.toDomain(dto)

        #expect(provider.displayName == "Slack")
        #expect(provider.authType == "api_key")
        #expect(provider.iconName == nil)
    }

    @Test func mapToolDTOArray() {
        let dtos = [
            ToolDTO(id: "1", name: "A", description: "A", category: "search"),
            ToolDTO(id: "2", name: "B", description: "B", category: "utility"),
        ]
        let tools = ChatMapper.toDomain(dtos)

        #expect(tools.count == 2)
        #expect(tools[0].name == "A")
        #expect(tools[1].name == "B")
    }

    @Test func mapProviderDTOArray() {
        let dtos = [
            ProviderDTO(id: "1", name: "a", displayName: "A", authType: "oauth", isConnected: true, iconName: nil),
            ProviderDTO(id: "2", name: "b", displayName: "B", authType: "api_key", isConnected: false, iconName: nil),
        ]
        let providers = ChatMapper.toDomain(dtos)

        #expect(providers.count == 2)
        #expect(providers[0].isConnected == true)
        #expect(providers[1].isConnected == false)
    }

    @Test func mapChatResponseInvalidUUIDGeneratesNewOne() throws {
        let json = """
        {"id": "not-a-uuid", "content": "Test", "role": "assistant"}
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let message = ChatMapper.toDomain(dto, conversationId: UUID())

        // Should have generated a new UUID since "not-a-uuid" is not a valid UUID
        #expect(message.id != UUID(uuidString: "not-a-uuid"))
    }

    @Test func mapChatResponseWithoutCreatedAtUsesCurrentDate() throws {
        let json = """
        {"id": "msg-1", "content": "Test", "role": "user"}
        """.data(using: .utf8)!

        let before = Date()
        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)
        let message = ChatMapper.toDomain(dto, conversationId: UUID())
        let after = Date()

        #expect(message.createdAt >= before)
        #expect(message.createdAt <= after)
    }
}
