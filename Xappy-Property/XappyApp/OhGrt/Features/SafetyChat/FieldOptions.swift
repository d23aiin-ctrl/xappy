import SwiftUI

/// Quick action buttons displayed below messages - Haptik themed
struct FieldOptions: View {
    let actions: [QuickAction]
    let onSelect: (QuickAction) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(actions, id: \.value) { action in
                    QuickActionButton(action: action, onTap: {
                        onSelect(action)
                    })
                }
            }
        }
    }
}

/// Individual quick action button with Haptik styling
struct QuickActionButton: View {
    let action: QuickAction
    let onTap: () -> Void

    @State private var isPressed = false

    private var buttonColor: Color {
        switch action.actionType {
        case "confirm":
            return HaptikTheme.success
        case "cancel":
            return HaptikTheme.error
        case "field_option":
            return HaptikTheme.primaryBlue
        default:
            return HaptikTheme.primaryBlue
        }
    }

    var body: some View {
        Button(action: {
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                    isPressed = false
                }
                onTap()
            }
        }) {
            Text(action.label)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(buttonColor)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(Color.white)
                        .shadow(color: buttonColor.opacity(0.15), radius: 4, y: 2)
                )
                .overlay(
                    Capsule()
                        .stroke(buttonColor.opacity(0.3), lineWidth: 1)
                )
        }
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

#Preview {
    VStack {
        FieldOptions(
            actions: [
                QuickAction(actionType: "field_option", label: "Low", value: "low", fieldName: "severity"),
                QuickAction(actionType: "field_option", label: "Medium", value: "medium", fieldName: "severity"),
                QuickAction(actionType: "field_option", label: "High", value: "high", fieldName: "severity")
            ],
            onSelect: { _ in }
        )

        FieldOptions(
            actions: [
                QuickAction(actionType: "confirm", label: "Submit", value: "yes", fieldName: nil),
                QuickAction(actionType: "cancel", label: "Cancel", value: "cancel", fieldName: nil)
            ],
            onSelect: { _ in }
        )
    }
    .padding()
    .background(HaptikTheme.chatBackground)
}
