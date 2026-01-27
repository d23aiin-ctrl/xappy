import Foundation

/// DTO for JanSeva user data from API
struct XappyUserDTO: Decodable {
    let id: String
    let fullName: String
    let role: String
    let phoneNumber: String?
    let badgeNumber: String?
    let email: String?
    let status: String?
    let siteName: String?
    let siteId: String?

    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case fullNameAlt = "fullName"
        case name
        case role
        case phoneNumber = "phone_number"
        case badgeNumber = "badge_number"
        case email
        case status
        case siteName = "site_name"
        case siteId = "site_id"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        id = try container.decode(String.self, forKey: .id)
        role = try container.decodeIfPresent(String.self, forKey: .role) ?? "citizen"
        phoneNumber = try container.decodeIfPresent(String.self, forKey: .phoneNumber)
        badgeNumber = try container.decodeIfPresent(String.self, forKey: .badgeNumber)
        email = try container.decodeIfPresent(String.self, forKey: .email)
        status = try container.decodeIfPresent(String.self, forKey: .status)
        siteName = try container.decodeIfPresent(String.self, forKey: .siteName)
        siteId = try container.decodeIfPresent(String.self, forKey: .siteId)

        let decodedFullName =
            (try? container.decodeIfPresent(String.self, forKey: .fullName)) ??
            (try? container.decodeIfPresent(String.self, forKey: .fullNameAlt)) ??
            (try? container.decodeIfPresent(String.self, forKey: .name))

        let trimmed = decodedFullName?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if !trimmed.isEmpty {
            fullName = trimmed
        } else if let badge = badgeNumber, !badge.isEmpty {
            fullName = badge
        } else if let phone = phoneNumber, !phone.isEmpty {
            fullName = phone
        } else {
            fullName = id
        }
    }
}

/// DTO for badge/PIN login request
struct BadgeLoginRequestDTO: Codable {
    let badgeNumber: String
    let pin: String

    enum CodingKeys: String, CodingKey {
        case badgeNumber = "badge_number"
        case pin
    }
}

/// DTO for OTP send request
struct OTPSendRequestDTO: Codable {
    let phoneNumber: String

    enum CodingKeys: String, CodingKey {
        case phoneNumber = "phone_number"
    }
}

/// DTO for OTP verify request
struct OTPVerifyRequestDTO: Codable {
    let phoneNumber: String
    let otp: String

    enum CodingKeys: String, CodingKey {
        case phoneNumber = "phone_number"
        case otp
    }
}

/// DTO for authentication response
struct XappyAuthResponseDTO: Decodable {
    let accessToken: String
    let refreshToken: String?
    let tokenType: String
    let expiresIn: Int?
    let user: XappyUserDTO?
}

/// DTO for token refresh request
struct TokenRefreshRequestDTO: Codable {
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case refreshToken = "refresh_token"
    }
}

/// DTO for token refresh response
struct TokenRefreshResponseDTO: Codable {
    let accessToken: String
    let refreshToken: String?
    let expiresIn: Int?

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresIn = "expires_in"
    }
}

// MARK: - Backwards compatibility aliases

typealias UserDTO = XappyUserDTO
typealias AuthResponseDTO = XappyAuthResponseDTO
