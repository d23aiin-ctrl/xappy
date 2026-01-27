import SwiftUI
import UIKit
import PhotosUI

/// A single message row in the chat interface - WhatsApp-like grouped design
struct MessageRow: View {
    let message: SafetyChatMessage
    var isFirstInGroup: Bool = true
    var isLastInGroup: Bool = true
    var onQuickAction: ((String) -> Void)?
    var onConfirm: (() -> Void)?
    var onCancel: (() -> Void)?
    var onFieldUpdate: ((String, String) -> Void)?
    var onImageTap: ((UIImage) -> Void)?

    private let timeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter
    }()

    var body: some View {
        VStack(alignment: message.isUser ? .trailing : .leading, spacing: 2) {
            // Message bubble
            HStack(alignment: .bottom, spacing: 6) {
                if !message.isUser {
                    // Show avatar only on last message of group (WhatsApp style)
                    if isLastInGroup {
                        aiAvatar
                    } else {
                        Spacer().frame(width: 32)
                    }
                }

                if message.isUser {
                    Spacer(minLength: 60)
                }

                messageBubble

                if !message.isUser {
                    Spacer(minLength: 60)
                }
            }
            .padding(.top, isFirstInGroup ? 8 : 1)
            .padding(.bottom, isLastInGroup ? 4 : 1)

            // Draft card (if present) - only on last message
            if isLastInGroup, message.showDraftCard, let draftState = message.draftState {
                DraftCardView(
                    draftState: draftState,
                    onFieldTap: { _ in },
                    onFieldUpdate: onFieldUpdate
                )
                .padding(.leading, message.isUser ? 0 : 38)
                .padding(.top, 6)
            }

            // Confirmation card (if in confirming stage) - includes its own Submit/Discard buttons
            if isLastInGroup, let draftState = message.draftState, draftState.stage == "confirming" {
                ConfirmationCardView(
                    draftState: draftState,
                    onConfirm: { onConfirm?() },
                    onCancel: { onCancel?() },
                    onFieldEdit: { _ in }
                )
                .padding(.leading, message.isUser ? 0 : 38)
                .padding(.top, 6)
            }

            // Submission success card - only show the card, not the message bubble content
            if isLastInGroup, let result = message.submissionResult {
                SuccessCardView(
                    result: result,
                    onViewReport: nil,
                    onNewReport: nil
                )
                .padding(.leading, message.isUser ? 0 : 38)
                .padding(.top, 6)
            }

            // Quick actions - only show when NOT in confirming stage and NO submission result
            // This prevents duplicate CTAs
            if isLastInGroup,
               let actions = message.quickActions, !actions.isEmpty,
               message.draftState?.stage != "confirming",
               message.submissionResult == nil {
                quickActionsView(actions: actions)
                    .padding(.leading, message.isUser ? 0 : 38)
                    .padding(.top, 6)
            }
        }
        .padding(.horizontal, 4)
    }

    // MARK: - Formatted Message Content (Markdown parsing)

    private var formattedMessageContent: Text {
        parseMarkdown(message.content)
    }

    /// Parse simple markdown (**bold**) to AttributedString
    private func parseMarkdown(_ text: String) -> Text {
        var result = Text("")
        var remaining = text

        while !remaining.isEmpty {
            if let range = remaining.range(of: "\\*\\*(.+?)\\*\\*", options: .regularExpression) {
                // Add text before the match
                let before = String(remaining[remaining.startIndex..<range.lowerBound])
                if !before.isEmpty {
                    result = result + Text(before)
                }

                // Extract and add bold text
                let match = String(remaining[range])
                let boldText = String(match.dropFirst(2).dropLast(2))
                result = result + Text(boldText).bold()

                // Continue with remaining text
                remaining = String(remaining[range.upperBound...])
            } else {
                // No more matches, add remaining text
                result = result + Text(remaining)
                break
            }
        }

        return result
    }

    // MARK: - Avatar

    private var aiAvatar: some View {
        ZStack {
            Circle()
                .fill(HaptikTheme.lightLavender)
                .frame(width: 28, height: 28)

            Image(systemName: "sparkles")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(HaptikTheme.primaryGradient)
        }
    }

    // MARK: - Message Bubble

    private var messageBubble: some View {
        VStack(alignment: message.isUser ? .trailing : .leading, spacing: 4) {
            // Attached image (if present)
            if let attachedImage = message.attachedImage {
                Image(uiImage: attachedImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(maxWidth: 220, maxHeight: 180)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .onTapGesture {
                        onImageTap?(attachedImage)
                    }
            }

            // Parse markdown for bold text (**text**)
            if !message.content.isEmpty {
                formattedMessageContent
                    .font(.body)
                    .foregroundColor(message.isUser ? .white : HaptikTheme.darkCharcoal)
                    .fixedSize(horizontal: false, vertical: true)
            }

            // Timestamp and read status - only on last message of group
            if isLastInGroup {
                HStack(spacing: 4) {
                    Text(timeFormatter.string(from: message.timestamp))
                        .font(.system(size: 11))
                        .foregroundColor(message.isUser ? .white.opacity(0.7) : HaptikTheme.textSecondary)

                    if message.isUser {
                        Image(systemName: "checkmark")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            Group {
                if message.isUser {
                    // User bubble - show tail only on last message
                    if isLastInGroup {
                        ChatBubbleShape(isUser: true)
                            .fill(HaptikTheme.primaryGradient)
                    } else {
                        RoundedRectangle(cornerRadius: 18)
                            .fill(HaptikTheme.primaryGradient)
                    }
                } else {
                    // AI bubble - show tail only on last message
                    if isLastInGroup {
                        ChatBubbleShape(isUser: false)
                            .fill(Color.white)
                            .shadow(color: Color.black.opacity(0.04), radius: 2, y: 1)
                    } else {
                        RoundedRectangle(cornerRadius: 18)
                            .fill(Color.white)
                            .shadow(color: Color.black.opacity(0.04), radius: 2, y: 1)
                    }
                }
            }
        )
    }

    // MARK: - Quick Actions

    private func quickActionsView(actions: [QuickAction]) -> some View {
        FieldOptions(actions: actions) { action in
            onQuickAction?(action.value)
        }
    }
}

// MARK: - Draft Card View

struct DraftCardView: View {
    let draftState: DraftState
    var onFieldTap: ((String) -> Void)?
    var onFieldUpdate: ((String, String) -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(HaptikTheme.lightLavender)
                        .frame(width: 32, height: 32)
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 14))
                        .foregroundColor(HaptikTheme.primaryBlue)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(draftState.reportTypeLabel)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(HaptikTheme.darkCharcoal)
                    Text("\(draftState.filledCount) of \(draftState.totalRequired) fields")
                        .font(.caption)
                        .foregroundColor(HaptikTheme.textSecondary)
                }
                Spacer()
                Text("\(Int(draftState.progressPercent))%")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(HaptikTheme.primaryBlue)
            }

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(HaptikTheme.lightGray)
                        .frame(height: 6)

                    RoundedRectangle(cornerRadius: 3)
                        .fill(HaptikTheme.primaryGradient)
                        .frame(width: geometry.size.width * draftState.progressPercent / 100, height: 6)
                        .animation(.easeInOut(duration: 0.3), value: draftState.progressPercent)
                }
            }
            .frame(height: 6)

            // Fields
            VStack(spacing: 6) {
                ForEach(draftState.fields) { field in
                    FieldRowView(field: field, onTap: {
                        onFieldTap?(field.name)
                    })
                }
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.06), radius: 6, y: 3)
        )
    }
}

// MARK: - Field Row View

struct FieldRowView: View {
    let field: FieldDefinition
    var onTap: (() -> Void)?

    var body: some View {
        HStack(spacing: 8) {
            // Status indicator
            Image(systemName: field.isValid ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 14))
                .foregroundColor(field.isValid ? HaptikTheme.success : HaptikTheme.textSecondary.opacity(0.4))

            Text(field.label)
                .font(.subheadline)
                .foregroundColor(HaptikTheme.textSecondary)

            Spacer()

            if let value = field.value, !value.isEmpty {
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(HaptikTheme.darkCharcoal)
                    .lineLimit(1)
            } else {
                Text("Required")
                    .font(.caption)
                    .foregroundColor(HaptikTheme.primaryBlue)
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 10)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(HaptikTheme.lightGray)
        )
        .onTapGesture {
            onTap?()
        }
    }
}

// MARK: - Confirmation Card View

struct ConfirmationCardView: View {
    let draftState: DraftState
    let onConfirm: () -> Void
    let onCancel: () -> Void
    var onFieldEdit: ((String) -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Header
            HStack(spacing: 8) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(HaptikTheme.success)
                VStack(alignment: .leading, spacing: 1) {
                    Text("Ready to Submit")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(HaptikTheme.darkCharcoal)
                    Text("Review your report")
                        .font(.caption)
                        .foregroundColor(HaptikTheme.textSecondary)
                }
            }

            // Summary
            VStack(spacing: 6) {
                ForEach(draftState.fields.filter { $0.isValid }) { field in
                    HStack {
                        Text(field.label)
                            .font(.caption)
                            .foregroundColor(HaptikTheme.textSecondary)
                        Spacer()
                        Text(field.value ?? "")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(HaptikTheme.darkCharcoal)
                            .lineLimit(1)
                    }
                    .padding(.vertical, 4)
                }
            }
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(HaptikTheme.lightGray)
            )

            // Action buttons
            HStack(spacing: 10) {
                Button(action: onCancel) {
                    Text("Discard")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(HaptikTheme.error)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(HaptikTheme.error.opacity(0.1))
                        )
                }

                Button(action: onConfirm) {
                    HStack(spacing: 4) {
                        Image(systemName: "paperplane.fill")
                            .font(.system(size: 12))
                        Text("Submit")
                    }
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(HaptikTheme.successGradient)
                    )
                }
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.08), radius: 8, y: 4)
        )
    }
}

// MARK: - Success Card View

struct SuccessCardView: View {
    let result: SubmissionResult
    var onViewReport: (() -> Void)?
    var onNewReport: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            // Success header with gradient
            VStack(spacing: 12) {
                // Animated success icon
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.2))
                        .frame(width: 64, height: 64)

                    Image(systemName: "checkmark")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                }

                Text("Report Submitted!")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)

                Text(formatReportType(result.reportType))
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.85))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
            .background(HaptikTheme.successGradient)

            // Reference number section
            VStack(spacing: 16) {
                VStack(spacing: 6) {
                    Text("REFERENCE NUMBER")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(HaptikTheme.textSecondary)
                        .tracking(1)

                    Text(result.referenceNumber)
                        .font(.system(size: 18, weight: .bold, design: .monospaced))
                        .foregroundColor(HaptikTheme.primaryBlue)
                }
                .padding(.vertical, 16)
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(HaptikTheme.lightLavender)
                )

                Text("Your supervisor has been notified")
                    .font(.caption)
                    .foregroundColor(HaptikTheme.textSecondary)

                // Action buttons
                if onNewReport != nil {
                    Button {
                        onNewReport?()
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 14))
                            Text("Submit Another Report")
                                .fontWeight(.semibold)
                        }
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(HaptikTheme.primaryGradient)
                        )
                    }
                }
            }
            .padding(16)
        }
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white)
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: Color.black.opacity(0.1), radius: 12, y: 6)
    }

    private func formatReportType(_ type: String) -> String {
        type.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

// MARK: - Preview

#Preview {
    ScrollView {
        VStack(spacing: 2) {
            MessageRow(
                message: SafetyChatMessage(
                    id: UUID(),
                    content: "I want to report a near miss",
                    isUser: true,
                    timestamp: Date()
                ),
                isFirstInGroup: true,
                isLastInGroup: true
            )

            MessageRow(
                message: SafetyChatMessage(
                    id: UUID(),
                    content: "I'll help you report a near miss.",
                    isUser: false,
                    timestamp: Date()
                ),
                isFirstInGroup: true,
                isLastInGroup: false
            )

            MessageRow(
                message: SafetyChatMessage(
                    id: UUID(),
                    content: "Can you describe what happened?",
                    isUser: false,
                    timestamp: Date()
                ),
                isFirstInGroup: false,
                isLastInGroup: true
            )
        }
        .padding()
        .background(HaptikTheme.chatBackground)
    }
}
