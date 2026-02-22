//
//  AuthDTOTests.swift
//  OhGrtTests
//
//  Tests for Auth DTO encode/decode
//

import Testing
import Foundation
@testable import OhGrt

struct AuthDTOTests {

    // MARK: - BadgeLoginRequestDTO

    @Test func badgeLoginRequestEncoding() throws {
        let request = BadgeLoginRequestDTO(badgeNumber: "EMP001", pin: "1234")
        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["badge_number"] as? String == "EMP001")
        #expect(json["pin"] as? String == "1234")
    }

    @Test func badgeLoginRequestRoundTrip() throws {
        let original = BadgeLoginRequestDTO(badgeNumber: "BADGE-99", pin: "5678")
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(BadgeLoginRequestDTO.self, from: data)

        #expect(decoded.badgeNumber == "BADGE-99")
        #expect(decoded.pin == "5678")
    }

    // MARK: - OTPSendRequestDTO

    @Test func otpSendRequestEncoding() throws {
        let request = OTPSendRequestDTO(phoneNumber: "+919876543210")
        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["phone_number"] as? String == "+919876543210")
    }

    @Test func otpSendRequestRoundTrip() throws {
        let original = OTPSendRequestDTO(phoneNumber: "+1234567890")
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(OTPSendRequestDTO.self, from: data)

        #expect(decoded.phoneNumber == "+1234567890")
    }

    // MARK: - OTPVerifyRequestDTO

    @Test func otpVerifyRequestEncoding() throws {
        let request = OTPVerifyRequestDTO(phoneNumber: "+919876543210", otp: "456789")
        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["phone_number"] as? String == "+919876543210")
        #expect(json["otp"] as? String == "456789")
    }

    // MARK: - XappyAuthResponseDTO

    @Test func authResponseDecodingWithUser() throws {
        let json = """
        {
            "accessToken": "abc123",
            "refreshToken": "refresh456",
            "tokenType": "Bearer",
            "expiresIn": 3600,
            "user": {
                "id": "user-1",
                "full_name": "John Doe",
                "role": "supervisor",
                "phone_number": "+1234567890",
                "email": "john@example.com",
                "status": "active",
                "site_name": "Site A",
                "site_id": "site-1"
            }
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyAuthResponseDTO.self, from: json)

        #expect(dto.accessToken == "abc123")
        #expect(dto.refreshToken == "refresh456")
        #expect(dto.tokenType == "Bearer")
        #expect(dto.expiresIn == 3600)
        #expect(dto.user != nil)
        #expect(dto.user?.fullName == "John Doe")
        #expect(dto.user?.role == "supervisor")
    }

    @Test func authResponseDecodingWithoutUser() throws {
        let json = """
        {
            "accessToken": "token",
            "tokenType": "Bearer"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyAuthResponseDTO.self, from: json)

        #expect(dto.accessToken == "token")
        #expect(dto.refreshToken == nil)
        #expect(dto.expiresIn == nil)
        #expect(dto.user == nil)
    }

    // MARK: - XappyUserDTO

    @Test func userDTODecodingWithFullName() throws {
        let json = """
        {
            "id": "user-1",
            "full_name": "Jane Smith"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        #expect(dto.id == "user-1")
        #expect(dto.fullName == "Jane Smith")
        #expect(dto.role == "citizen")
    }

    @Test func userDTODecodingWithCamelCaseFullName() throws {
        let json = """
        {
            "id": "user-2",
            "fullName": "Camel Case Name"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        #expect(dto.fullName == "Camel Case Name")
    }

    @Test func userDTODecodingWithNameField() throws {
        let json = """
        {
            "id": "user-3",
            "name": "Name Field"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        #expect(dto.fullName == "Name Field")
    }

    @Test func userDTOFallbackToBadgeNumber() throws {
        let json = """
        {
            "id": "user-4",
            "badge_number": "EMP001"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        #expect(dto.fullName == "EMP001")
    }

    @Test func userDTOFallbackToPhoneNumber() throws {
        let json = """
        {
            "id": "user-5",
            "phone_number": "+1234567890"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        #expect(dto.fullName == "+1234567890")
    }

    @Test func userDTOFallbackToId() throws {
        let json = """
        {
            "id": "user-6"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        #expect(dto.fullName == "user-6")
    }

    @Test func userDTOTrimsWhitespace() throws {
        let json = """
        {
            "id": "user-7",
            "full_name": "   "
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        // Empty after trimming, should fallback to id
        #expect(dto.fullName == "user-7")
    }

    @Test func userDTOWithAllOptionalFields() throws {
        let json = """
        {
            "id": "user-8",
            "full_name": "Full User",
            "role": "admin",
            "phone_number": "+1111111111",
            "badge_number": "B123",
            "email": "user@test.com",
            "status": "active",
            "site_name": "Main Site",
            "site_id": "site-99"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(XappyUserDTO.self, from: json)

        #expect(dto.phoneNumber == "+1111111111")
        #expect(dto.badgeNumber == "B123")
        #expect(dto.email == "user@test.com")
        #expect(dto.status == "active")
        #expect(dto.siteName == "Main Site")
        #expect(dto.siteId == "site-99")
    }

    // MARK: - TokenRefreshRequestDTO

    @Test func tokenRefreshRequestEncoding() throws {
        let request = TokenRefreshRequestDTO(refreshToken: "old-refresh-token")
        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["refresh_token"] as? String == "old-refresh-token")
    }

    // MARK: - TokenRefreshResponseDTO

    @Test func tokenRefreshResponseDecoding() throws {
        let json = """
        {
            "access_token": "new-access",
            "refresh_token": "new-refresh",
            "expires_in": 7200
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(TokenRefreshResponseDTO.self, from: json)

        #expect(dto.accessToken == "new-access")
        #expect(dto.refreshToken == "new-refresh")
        #expect(dto.expiresIn == 7200)
    }

    @Test func tokenRefreshResponseDecodingMinimal() throws {
        let json = """
        {
            "access_token": "token-only"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(TokenRefreshResponseDTO.self, from: json)

        #expect(dto.accessToken == "token-only")
        #expect(dto.refreshToken == nil)
        #expect(dto.expiresIn == nil)
    }

    @Test func tokenRefreshResponseRoundTrip() throws {
        let original = TokenRefreshResponseDTO(accessToken: "at", refreshToken: "rt", expiresIn: 3600)
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(TokenRefreshResponseDTO.self, from: data)

        #expect(decoded.accessToken == original.accessToken)
        #expect(decoded.refreshToken == original.refreshToken)
        #expect(decoded.expiresIn == original.expiresIn)
    }
}
