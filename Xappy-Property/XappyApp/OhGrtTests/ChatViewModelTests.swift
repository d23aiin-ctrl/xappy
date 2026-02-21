//
//  ChatViewModelTests.swift
//  OhGrtTests
//
//  Tests for ChatViewModel functionality
//  Note: These tests are simplified due to private dependencies
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - ChatMessage Tests

struct ChatMessageTests {

    @Test func chatMessageInitialization() async throws {
        let conversationId = UUID()
        let message = ChatMessage(
            id: UUID(),
            conversationId: conversationId,
            content: "Hello, world!",
            role: .user,
            createdAt: Date(),
            metadata: nil
        )

        #expect(message.content == "Hello, world!")
        #expect(message.role == .user)
        #expect(message.conversationId == conversationId)
    }

    @Test func chatMessageRoles() async throws {
        // Test both message roles exist
        let userRole = MessageRole.user
        let assistantRole = MessageRole.assistant

        #expect(userRole != assistantRole)
    }

    @Test func chatMessageIsIdentifiable() async throws {
        let message = ChatMessage(
            id: UUID(),
            conversationId: UUID(),
            content: "Test",
            role: .assistant,
            createdAt: Date(),
            metadata: nil
        )

        // Identifiable requires id property
        #expect(message.id != UUID())
    }

    @Test func chatMessageIsSynced() async throws {
        var message = ChatMessage(
            id: UUID(),
            conversationId: UUID(),
            content: "Test",
            role: .user,
            createdAt: Date(),
            metadata: nil
        )

        // Default value should be true
        #expect(message.isSynced == true)

        // Should be mutable
        message.isSynced = false
        #expect(message.isSynced == false)
    }
}

// MARK: - ToolInfo Tests

struct ToolInfoTests {

    @Test func toolInfoInitialization() async throws {
        // ToolInfo should be decodable from API responses
        // This tests the basic structure exists
        let json = """
        {
            "name": "weather",
            "description": "Get weather information",
            "enabled": true
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let tool = try? decoder.decode(ToolInfo.self, from: json)

        #expect(tool != nil)
        #expect(tool?.name == "weather")
    }
}

// MARK: - ProviderInfo Tests

struct ProviderInfoTests {

    @Test func providerInfoInitialization() async throws {
        // ProviderInfo should be decodable
        let json = """
        {
            "name": "github",
            "display_name": "GitHub",
            "connected": false
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let provider = try? decoder.decode(ProviderInfo.self, from: json)

        #expect(provider != nil)
        #expect(provider?.name == "github")
    }
}

// MARK: - DomainError Tests

struct DomainErrorTests {

    @Test func domainErrorTypes() async throws {
        let notFound = DomainError.notFound
        let notAuthenticated = DomainError.notAuthenticated
        let network = DomainError.networkUnavailable

        #expect(notFound.localizedDescription.count > 0)
        #expect(notAuthenticated.localizedDescription.count > 0)
        #expect(network.localizedDescription.count > 0)
    }

    @Test func domainErrorConformsToError() async throws {
        let error: Error = DomainError.notFound
        #expect(error.localizedDescription.count > 0)
    }

    @Test func domainErrorWithAssociatedValue() async throws {
        let serverError = DomainError.serverError("Internal server error")
        #expect(serverError.localizedDescription.count > 0)
    }
}

// MARK: - ChatConversation Tests

struct ChatConversationTests {

    @Test func chatConversationInitialization() async throws {
        let conversation = ChatConversation(
            id: UUID(),
            title: "Test Conversation",
            createdAt: Date(),
            updatedAt: Date()
        )

        #expect(conversation.title == "Test Conversation")
    }

    @Test func chatConversationIsIdentifiable() async throws {
        let conversation = ChatConversation(
            id: UUID(),
            title: "Another Chat",
            createdAt: Date(),
            updatedAt: Date()
        )

        #expect(conversation.id != UUID())
    }

    @Test func chatConversationDefaultValues() async throws {
        let conversation = ChatConversation(title: "New Chat")

        #expect(conversation.title == "New Chat")
        #expect(conversation.messageCount == 0)
        #expect(conversation.lastMessagePreview == nil)
    }
}
