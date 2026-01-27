import Foundation

/// Mapper for authentication DTOs to Domain entities
enum AuthMapper {
    /// Map XappyUserDTO to User domain entity
    static func toDomain(_ dto: XappyUserDTO) -> User {
        return User(
            id: dto.id,
            fullName: dto.fullName,
            role: UserRole(from: dto.role),
            phoneNumber: dto.phoneNumber,
            email: dto.email,
            status: dto.status,
            siteName: dto.siteName,
            siteId: dto.siteId,
            createdAt: Date()
        )
    }

    /// Map XappyAuthResponseDTO to AuthCredentials
    static func toCredentials(_ dto: XappyAuthResponseDTO) -> AuthCredentials {
        let expiresAt: Date?
        if let expiresIn = dto.expiresIn {
            expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
        } else {
            expiresAt = nil
        }

        return AuthCredentials(
            accessToken: dto.accessToken,
            refreshToken: dto.refreshToken,
            expiresAt: expiresAt
        )
    }

    /// Map TokenRefreshResponseDTO to AuthCredentials
    static func toCredentials(_ dto: TokenRefreshResponseDTO) -> AuthCredentials {
        let expiresAt: Date?
        if let expiresIn = dto.expiresIn {
            expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
        } else {
            expiresAt = nil
        }

        return AuthCredentials(
            accessToken: dto.accessToken,
            refreshToken: dto.refreshToken,
            expiresAt: expiresAt
        )
    }
}
