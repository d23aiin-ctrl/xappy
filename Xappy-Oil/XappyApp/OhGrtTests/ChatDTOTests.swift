//
//  ChatDTOTests.swift
//  OhGrtTests
//
//  Tests for Chat DTO encode/decode
//

import Testing
import Foundation
@testable import OhGrt

struct ChatDTOTests {

    // MARK: - LocationDTO

    @Test func locationDTOEncodeDecode() throws {
        let location = LocationDTO(latitude: 28.6139, longitude: 77.2090, accuracy: 10.5, address: "New Delhi")
        let data = try JSONEncoder().encode(location)
        let decoded = try JSONDecoder().decode(LocationDTO.self, from: data)

        #expect(decoded.latitude == 28.6139)
        #expect(decoded.longitude == 77.2090)
        #expect(decoded.accuracy == 10.5)
        #expect(decoded.address == "New Delhi")
    }

    @Test func locationDTOWithoutOptionals() throws {
        let location = LocationDTO(latitude: 0.0, longitude: 0.0, accuracy: nil, address: nil)
        let data = try JSONEncoder().encode(location)
        let decoded = try JSONDecoder().decode(LocationDTO.self, from: data)

        #expect(decoded.accuracy == nil)
        #expect(decoded.address == nil)
    }

    // MARK: - FieldUpdateDTO

    @Test func fieldUpdateDTOEncodeDecode() throws {
        let update = FieldUpdateDTO(fieldName: "location", value: "Site Alpha")
        let data = try JSONEncoder().encode(update)
        let decoded = try JSONDecoder().decode(FieldUpdateDTO.self, from: data)

        #expect(decoded.fieldName == "location")
        #expect(decoded.value == "Site Alpha")
    }

    // MARK: - ChatRequestDTO

    @Test func chatRequestDTOEncoding() throws {
        let request = ChatRequestDTO(
            message: "Report a near miss",
            conversationId: "conv-123",
            tools: ["safety_report"],
            sessionId: "session-1",
            location: LocationDTO(latitude: 28.6, longitude: 77.2, accuracy: nil, address: nil),
            fieldUpdates: [FieldUpdateDTO(fieldName: "severity", value: "high")]
        )
        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["message"] as? String == "Report a near miss")
        #expect(json["conversation_id"] as? String == "conv-123")
        #expect(json["session_id"] as? String == "session-1")
        #expect((json["tools"] as? [String])?.count == 1)
    }

    @Test func chatRequestDTOWithoutOptionals() throws {
        let request = ChatRequestDTO(
            message: "Hello",
            conversationId: "conv-1",
            tools: [],
            sessionId: nil,
            location: nil,
            fieldUpdates: nil
        )
        let data = try JSONEncoder().encode(request)
        let decoded = try JSONDecoder().decode(ChatRequestDTO.self, from: data)

        #expect(decoded.message == "Hello")
        #expect(decoded.sessionId == nil)
        #expect(decoded.location == nil)
        #expect(decoded.fieldUpdates == nil)
    }

    // MARK: - ChatResponseDTO

    @Test func chatResponseDTODecoding() throws {
        let json = """
        {
            "id": "msg-1",
            "content": "I can help you file a report.",
            "role": "assistant",
            "created_at": "2025-06-15T10:30:00Z",
            "conversationId": "conv-1",
            "tools_used": ["safety_report"],
            "processing_time": 1.5,
            "model_used": "gpt-4",
            "media_url": null,
            "requires_location": true
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)

        #expect(dto.id == "msg-1")
        #expect(dto.content == "I can help you file a report.")
        #expect(dto.role == "assistant")
        #expect(dto.createdAt == "2025-06-15T10:30:00Z")
        #expect(dto.toolsUsed == ["safety_report"])
        #expect(dto.processingTime == 1.5)
        #expect(dto.modelUsed == "gpt-4")
        #expect(dto.requiresLocation == true)
    }

    @Test func chatResponseDTOWithDraftState() throws {
        let json = """
        {
            "id": "msg-2",
            "content": "Please provide more details.",
            "role": "assistant",
            "draftState": {
                "reportType": "near_miss",
                "reportTypeLabel": "Near-Miss",
                "stage": "collecting",
                "fields": [
                    {
                        "name": "location",
                        "label": "Location",
                        "fieldType": "text",
                        "value": null,
                        "isValid": false
                    }
                ],
                "filledCount": 0,
                "totalRequired": 5,
                "progressPercent": 0.0,
                "nextField": "location",
                "isComplete": false
            },
            "showDraftCard": true
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)

        #expect(dto.draftState != nil)
        #expect(dto.draftState?.reportType == "near_miss")
        #expect(dto.draftState?.reportTypeLabel == "Near-Miss")
        #expect(dto.draftState?.stage == "collecting")
        #expect(dto.draftState?.fields.count == 1)
        #expect(dto.draftState?.fields.first?.name == "location")
        #expect(dto.draftState?.filledCount == 0)
        #expect(dto.draftState?.totalRequired == 5)
        #expect(dto.draftState?.progressPercent == 0.0)
        #expect(dto.draftState?.nextField == "location")
        #expect(dto.draftState?.isComplete == false)
        #expect(dto.showDraftCard == true)
    }

    @Test func chatResponseDTOWithQuickActions() throws {
        let json = """
        {
            "id": "msg-3",
            "content": "Choose a severity level",
            "role": "assistant",
            "quickActions": [
                {
                    "actionType": "select",
                    "label": "High",
                    "value": "high",
                    "fieldName": "severity"
                },
                {
                    "actionType": "select",
                    "label": "Low",
                    "value": "low",
                    "fieldName": "severity"
                }
            ]
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)

        #expect(dto.quickActions?.count == 2)
        #expect(dto.quickActions?.first?.actionType == "select")
        #expect(dto.quickActions?.first?.label == "High")
        #expect(dto.quickActions?.first?.value == "high")
        #expect(dto.quickActions?.first?.fieldName == "severity")
    }

    @Test func chatResponseDTOWithSubmissionResult() throws {
        let json = """
        {
            "id": "msg-4",
            "content": "Report submitted successfully!",
            "role": "assistant",
            "submissionResult": {
                "referenceNumber": "NM-2025-0042",
                "reportType": "near_miss",
                "submittedAt": "2025-06-15T10:35:00Z"
            }
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)

        #expect(dto.submissionResult != nil)
        #expect(dto.submissionResult?.referenceNumber == "NM-2025-0042")
        #expect(dto.submissionResult?.reportType == "near_miss")
        #expect(dto.submissionResult?.submittedAt == "2025-06-15T10:35:00Z")
    }

    @Test func chatResponseDTOMinimalFields() throws {
        let json = """
        {
            "id": "msg-5",
            "content": "Hello",
            "role": "user"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ChatResponseDTO.self, from: json)

        #expect(dto.id == "msg-5")
        #expect(dto.createdAt == nil)
        #expect(dto.toolsUsed == nil)
        #expect(dto.processingTime == nil)
        #expect(dto.draftState == nil)
        #expect(dto.quickActions == nil)
        #expect(dto.submissionResult == nil)
    }

    // MARK: - ToolDTO

    @Test func toolDTODecoding() throws {
        let json = """
        {
            "id": "tool-1",
            "name": "Safety Report",
            "description": "File a safety report",
            "category": "utility"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ToolDTO.self, from: json)

        #expect(dto.id == "tool-1")
        #expect(dto.name == "Safety Report")
        #expect(dto.description == "File a safety report")
        #expect(dto.category == "utility")
    }

    @Test func toolDTOWithoutCategory() throws {
        let json = """
        {
            "id": "tool-2",
            "name": "General",
            "description": "General tool"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ToolDTO.self, from: json)

        #expect(dto.category == nil)
    }

    // MARK: - ProviderDTO

    @Test func providerDTODecoding() throws {
        let json = """
        {
            "id": "prov-1",
            "name": "github",
            "display_name": "GitHub",
            "auth_type": "oauth",
            "is_connected": true,
            "icon_name": "github.icon"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ProviderDTO.self, from: json)

        #expect(dto.id == "prov-1")
        #expect(dto.name == "github")
        #expect(dto.displayName == "GitHub")
        #expect(dto.authType == "oauth")
        #expect(dto.isConnected == true)
        #expect(dto.iconName == "github.icon")
    }

    @Test func providerDTOMinimalFields() throws {
        let json = """
        {
            "id": "prov-2",
            "name": "slack",
            "is_connected": false
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(ProviderDTO.self, from: json)

        #expect(dto.displayName == nil)
        #expect(dto.authType == nil)
        #expect(dto.iconName == nil)
        #expect(dto.isConnected == false)
    }

    // MARK: - QuickActionDTO

    @Test func quickActionDTOIdentifiable() throws {
        let json = """
        {
            "actionType": "select",
            "label": "Yes",
            "value": "yes",
            "fieldName": "confirmed"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(QuickActionDTO.self, from: json)

        #expect(dto.id == "select_yes")
        #expect(dto.actionType == "select")
        #expect(dto.label == "Yes")
    }

    // MARK: - FieldDefinitionDTO

    @Test func fieldDefinitionDTODecodingCamelCase() throws {
        let json = """
        {
            "name": "severity",
            "label": "Severity Level",
            "fieldType": "select",
            "options": ["low", "medium", "high"],
            "value": "medium",
            "isValid": true
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(FieldDefinitionDTO.self, from: json)

        #expect(dto.name == "severity")
        #expect(dto.label == "Severity Level")
        #expect(dto.fieldType == "select")
        #expect(dto.options == ["low", "medium", "high"])
        #expect(dto.value == "medium")
        #expect(dto.isValid == true)
        #expect(dto.id == "severity")
    }

    @Test func fieldDefinitionDTODecodingSnakeCase() throws {
        let json = """
        {
            "name": "location",
            "label": "Location",
            "field_type": "text",
            "is_valid": false
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(FieldDefinitionDTO.self, from: json)

        #expect(dto.fieldType == "text")
        #expect(dto.isValid == false)
    }

    // MARK: - SubmissionResultDTO

    @Test func submissionResultDTORoundTrip() throws {
        let original = SubmissionResultDTO(
            referenceNumber: "INC-2025-0001",
            reportType: "incident",
            submittedAt: "2025-06-15T12:00:00Z"
        )
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(SubmissionResultDTO.self, from: data)

        #expect(decoded.referenceNumber == "INC-2025-0001")
        #expect(decoded.reportType == "incident")
        #expect(decoded.submittedAt == "2025-06-15T12:00:00Z")
    }
}
