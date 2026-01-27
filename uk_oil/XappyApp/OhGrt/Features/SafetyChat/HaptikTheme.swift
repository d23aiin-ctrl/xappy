import SwiftUI

/// Haptik-inspired theme colors for the Safety Chat
enum HaptikTheme {
    // MARK: - Primary Colors
    static let primaryBlue = Color(hex: "0067DD")
    static let darkNavy = Color(hex: "00336F")
    static let skyBlue = Color(hex: "BDDCFF")

    // MARK: - Secondary Colors
    static let lightGray = Color(hex: "F9FEFE")
    static let cardBackground = Color(hex: "EDF3FF")
    static let warmBeige = Color(hex: "FFFCF2")

    // MARK: - Text Colors
    static let darkCharcoal = Color(hex: "021A51")
    static let textPrimary = Color(hex: "000000")
    static let textSecondary = Color(hex: "6B7280")

    // MARK: - Accent Colors
    static let brightBlue = Color(hex: "0168EC")
    static let lightLavender = Color(hex: "CFE5FF")
    static let accentPink = Color(hex: "EA317E")

    // MARK: - Status Colors
    static let success = Color(hex: "10B981")
    static let warning = Color(hex: "F59E0B")
    static let error = Color(hex: "EF4444")

    // MARK: - Chat Bubble Colors
    static let userBubble = LinearGradient(
        colors: [primaryBlue, darkNavy],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let aiBubble = Color.white

    // MARK: - Background
    static let chatBackground = Color(hex: "F0F4F8")
    static let inputBackground = Color.white

    // MARK: - Gradients
    static let primaryGradient = LinearGradient(
        colors: [primaryBlue, darkNavy],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let glassGradient = LinearGradient(
        colors: [
            Color.white.opacity(0.5),
            Color.white.opacity(0.0)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let successGradient = LinearGradient(
        colors: [success, Color(hex: "059669")],
        startPoint: .leading,
        endPoint: .trailing
    )
}

// MARK: - Color Extension for Hex Support

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
