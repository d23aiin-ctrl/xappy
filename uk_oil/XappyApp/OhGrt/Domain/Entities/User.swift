import Foundation

/// Domain entity representing a JanSeva user (citizen or representative)
struct User: Equatable, Sendable {
    let id: String
    let fullName: String
    let role: UserRole
    let phoneNumber: String?
    let email: String?
    let status: String?
    let siteName: String?
    let siteId: String?
    let createdAt: Date

    init(
        id: String,
        fullName: String,
        role: UserRole = .citizen,
        phoneNumber: String? = nil,
        email: String? = nil,
        status: String? = nil,
        siteName: String? = nil,
        siteId: String? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.fullName = fullName
        self.role = role
        self.phoneNumber = phoneNumber
        self.email = email
        self.status = status
        self.siteName = siteName
        self.siteId = siteId
        self.createdAt = createdAt
    }

    /// Display name for UI
    var displayName: String {
        fullName
    }

    /// Whether this user has supervisor-level access
    var isSupervisorOrAbove: Bool {
        role.isSupervisorOrAbove
    }
}

/// User roles in JanSeva system
enum UserRole: String, CaseIterable, Sendable {
    case citizen = "citizen"
    case representative = "representative"
    case admin = "admin"
    case superAdmin = "super_admin"
    // Legacy roles kept for compatibility
    case worker = "worker"
    case supervisor = "supervisor"

    var displayName: String {
        switch self {
        case .citizen: return "Citizen"
        case .representative: return "Representative"
        case .admin: return "Admin"
        case .superAdmin: return "Super Admin"
        case .worker: return "Worker"
        case .supervisor: return "Supervisor"
        }
    }

    var isSupervisorOrAbove: Bool {
        switch self {
        case .citizen, .worker:
            return false
        default:
            return true
        }
    }

    init(from string: String) {
        self = UserRole(rawValue: string) ?? .citizen
    }
}

/// Authentication state
enum AuthState: Equatable, Sendable {
    case unknown
    case authenticated(User)
    case unauthenticated
}

/// Authentication credentials
struct AuthCredentials: Sendable {
    let accessToken: String
    let refreshToken: String?
    let expiresAt: Date?
}
