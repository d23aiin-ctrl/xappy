import SwiftUI
import UIKit
import PhotosUI

/// Main Safety Chat View - WhatsApp-like interface with Haptik theme
struct SafetyChatView: View {
    @StateObject private var viewModel = SafetyChatViewModel()
    @StateObject private var speechRecognizer = SpeechRecognizer()
    @FocusState private var isInputFocused: Bool
    @State private var showScrollToBottom = false
    @State private var showImagePicker = false
    @State private var showCamera = false
    @State private var showAttachmentOptions = false
    @State private var selectedImage: UIImage?
    @State private var imagePickerItem: PhotosPickerItem?
    @State private var fullScreenImage: UIImage?
    @State private var speechError: String?
    @State private var showSpeechError = false

    // Quick action buttons for common report types
    private let quickActions: [(label: String, icon: String, color: Color, prompt: String)] = [
        ("Near Miss", "exclamationmark.triangle.fill", .orange, "I want to report a near miss"),
        ("Incident", "flame.fill", HaptikTheme.error, "I need to report an incident"),
        ("Spill", "drop.triangle.fill", HaptikTheme.accentPink, "Report a spill"),
        ("Inspection", "magnifyingglass", HaptikTheme.primaryBlue, "Log an inspection"),
        ("Handover", "arrow.left.arrow.right", HaptikTheme.darkNavy, "Shift handover"),
        ("My Reports", "list.clipboard.fill", HaptikTheme.textSecondary, "Show my reports")
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Chat header
            chatHeader

            // Messages area
            messagesArea

            // Quick actions bar (only show when no active draft and no recent submission)
            if viewModel.currentDraftState == nil && !viewModel.isLoading && !viewModel.hasRecentSubmission {
                quickActionsBar
            }

            // Input area
            inputArea

            // Selected image preview
            if let image = selectedImage {
                imagePreviewBar(image: image)
            }
        }
        .background(HaptikTheme.chatBackground)
        .navigationBarTitleDisplayMode(.inline)
        .confirmationDialog("Attach Evidence", isPresented: $showAttachmentOptions, titleVisibility: .visible) {
            Button("Take Photo") {
                showCamera = true
            }
            Button("Choose from Library") {
                showImagePicker = true
            }
            Button("Cancel", role: .cancel) {}
        }
        .photosPicker(isPresented: $showImagePicker, selection: $imagePickerItem, matching: .images)
        .onChange(of: imagePickerItem) { _, newValue in
            Task {
                if let data = try? await newValue?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    selectedImage = image
                }
            }
        }
        .sheet(isPresented: $showCamera) {
            CameraView { image in
                selectedImage = image
            }
        }
        .fullScreenCover(item: Binding(
            get: { fullScreenImage.map { IdentifiableImage(image: $0) } },
            set: { fullScreenImage = $0?.image }
        )) { item in
            ImageViewerView(image: item.image) {
                fullScreenImage = nil
            }
        }
    }

    // MARK: - Image Preview Bar

    private func imagePreviewBar(image: UIImage) -> some View {
        HStack(spacing: 12) {
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 60, height: 60)
                .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text("Photo attached")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(HaptikTheme.darkCharcoal)
                Text("Will be sent with your message")
                    .font(.caption)
                    .foregroundColor(HaptikTheme.textSecondary)
            }

            Spacer()

            Button {
                selectedImage = nil
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 24))
                    .foregroundColor(HaptikTheme.textSecondary)
            }
        }
        .padding(12)
        .background(Color.white)
        .shadow(color: Color.black.opacity(0.05), radius: 4, y: -2)
    }

    // MARK: - Chat Header

    private var chatHeader: some View {
        HStack(spacing: 12) {
            // AI Avatar
            ZStack {
                Circle()
                    .fill(HaptikTheme.primaryGradient)
                    .frame(width: 40, height: 40)

                Image(systemName: "shield.checkered")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("Xappy")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(HaptikTheme.darkCharcoal)

                HStack(spacing: 4) {
                    Circle()
                        .fill(HaptikTheme.success)
                        .frame(width: 8, height: 8)
                    Text("Online")
                        .font(.caption)
                        .foregroundColor(HaptikTheme.textSecondary)
                }
            }

            Spacer()

            // New chat button
            Button {
                viewModel.startNewChat()
                let feedback = UIImpactFeedbackGenerator(style: .light)
                feedback.impactOccurred()
            } label: {
                Image(systemName: "square.and.pencil")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(HaptikTheme.primaryBlue)
                    .padding(8)
                    .background(
                        Circle()
                            .fill(HaptikTheme.lightLavender)
                    )
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            Color.white
                .shadow(color: Color.black.opacity(0.05), radius: 8, y: 4)
        )
    }

    // MARK: - Messages Area

    private var messagesArea: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 4) {
                    if viewModel.messages.isEmpty {
                        welcomeCard
                            .padding(.top, 20)
                    }

                    ForEach(Array(viewModel.messages.enumerated()), id: \.element.id) { index, message in
                        let isFirstInGroup = index == 0 || viewModel.messages[index - 1].isUser != message.isUser
                        let isLastInGroup = index == viewModel.messages.count - 1 || viewModel.messages[index + 1].isUser != message.isUser

                        MessageRow(
                            message: message,
                            isFirstInGroup: isFirstInGroup,
                            isLastInGroup: isLastInGroup,
                            onQuickAction: { action in
                                viewModel.sendMessage(action)
                            },
                            onConfirm: {
                                viewModel.sendMessage("yes")
                            },
                            onCancel: {
                                viewModel.sendMessage("cancel")
                            },
                            onImageTap: { image in
                                fullScreenImage = image
                            }
                        )
                        .id(message.id)
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .move(edge: .bottom)),
                            removal: .opacity
                        ))
                    }

                    if viewModel.isLoading {
                        TypingIndicatorView()
                            .id("typing")
                            .transition(.opacity)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
            }
            .onChange(of: viewModel.messages.count) { _, _ in
                withAnimation(.easeOut(duration: 0.25)) {
                    if let lastMessage = viewModel.messages.last {
                        proxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }
            .onChange(of: viewModel.isLoading) { _, isLoading in
                if isLoading {
                    withAnimation(.easeOut(duration: 0.2)) {
                        proxy.scrollTo("typing", anchor: .bottom)
                    }
                }
            }
        }
    }

    // MARK: - Welcome Card

    private var welcomeCard: some View {
        VStack(spacing: 24) {
            // Logo
            ZStack {
                Circle()
                    .fill(HaptikTheme.lightLavender)
                    .frame(width: 80, height: 80)

                Image(systemName: "shield.checkered")
                    .font(.system(size: 36, weight: .medium))
                    .foregroundStyle(HaptikTheme.primaryGradient)
            }

            VStack(spacing: 8) {
                Text("Hi there!")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(HaptikTheme.darkCharcoal)

                Text("I'm your AI assistant for safety reporting. Report incidents, near misses, spills, and more using natural language.")
                    .font(.subheadline)
                    .foregroundColor(HaptikTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }

            // Feature pills
            HStack(spacing: 12) {
                FeaturePillView(icon: "waveform", text: "Voice Input", color: HaptikTheme.primaryBlue)
                FeaturePillView(icon: "camera.fill", text: "Photo Evidence", color: HaptikTheme.accentPink)
            }
        }
        .padding(28)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.08), radius: 16, y: 8)
        )
        .padding(.horizontal, 8)
    }

    // MARK: - Quick Actions Bar

    private var quickActionsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(quickActions, id: \.label) { action in
                    QuickActionChip(
                        label: action.label,
                        icon: action.icon,
                        color: action.color
                    ) {
                        viewModel.sendMessage(action.prompt)
                    }
                    .disabled(viewModel.isLoading)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(
            Color.white
                .shadow(color: Color.black.opacity(0.03), radius: 4, y: -2)
        )
    }

    // MARK: - Input Area

    private var inputArea: some View {
        VStack(spacing: 0) {
            // Recording indicator
            if speechRecognizer.state.isRecording {
                recordingIndicator
            }

            HStack(spacing: 12) {
                // Attachment button - WhatsApp style
                Button {
                    showAttachmentOptions = true
                    let feedback = UIImpactFeedbackGenerator(style: .light)
                    feedback.impactOccurred()
                } label: {
                    Image(systemName: selectedImage != nil ? "photo.fill" : "plus")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(selectedImage != nil ? HaptikTheme.primaryBlue : HaptikTheme.textSecondary)
                        .frame(width: 36, height: 36)
                        .background(
                            Circle()
                                .fill(selectedImage != nil ? HaptikTheme.lightLavender : HaptikTheme.lightGray)
                        )
                }

                // Text input
                HStack(spacing: 8) {
                    TextField("Type a message...", text: $viewModel.inputText, axis: .vertical)
                        .textFieldStyle(.plain)
                        .lineLimit(1...4)
                        .focused($isInputFocused)
                        .font(.body)
                        .onSubmit {
                            if !viewModel.inputText.isEmpty {
                                viewModel.sendCurrentMessage()
                            }
                        }

                    if !viewModel.inputText.isEmpty {
                        Button {
                            viewModel.inputText = ""
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(HaptikTheme.textSecondary)
                                .font(.system(size: 18))
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 24)
                        .fill(HaptikTheme.lightGray)
                )

                // Microphone button (show when input is empty and no image)
                if viewModel.inputText.isEmpty && !viewModel.isLoading && selectedImage == nil {
                    microphoneButton
                }

                // Send button (show when there's text, image, or during loading)
                if !viewModel.inputText.isEmpty || viewModel.isLoading || selectedImage != nil {
                    sendButton
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(
                Color.white
                    .shadow(color: Color.black.opacity(0.05), radius: 8, y: -4)
            )
        }
        .onChange(of: speechRecognizer.transcript) { _, newValue in
            if !newValue.isEmpty {
                viewModel.inputText = newValue
            }
        }
        .onChange(of: speechRecognizer.state) { _, newState in
            // Check for errors
            if case .error(let message) = newState {
                speechError = message
                showSpeechError = true
            }
        }
        .alert("Voice Input", isPresented: $showSpeechError) {
            Button("Settings") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button("OK", role: .cancel) {}
        } message: {
            Text(speechError ?? "Voice input is not available. Please check your permissions in Settings.")
        }
    }

    // MARK: - Microphone Button

    private var microphoneButton: some View {
        Button {
            Task {
                let feedback = UIImpactFeedbackGenerator(style: .medium)
                feedback.impactOccurred()
                await speechRecognizer.toggleRecording()
            }
        } label: {
            ZStack {
                Circle()
                    .fill(
                        speechRecognizer.state.isRecording
                            ? LinearGradient(colors: [HaptikTheme.error, HaptikTheme.error.opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing)
                            : HaptikTheme.primaryGradient
                    )
                    .frame(width: 44, height: 44)

                Image(systemName: speechRecognizer.state.isRecording ? "stop.fill" : "mic.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
            }
            .shadow(color: speechRecognizer.state.isRecording ? HaptikTheme.error.opacity(0.4) : HaptikTheme.primaryBlue.opacity(0.4), radius: 8, y: 4)
            .scaleEffect(speechRecognizer.state.isRecording ? 1.1 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: speechRecognizer.state.isRecording)
        }
    }

    // MARK: - Send Button

    private var canSendWithImage: Bool {
        viewModel.canSend || selectedImage != nil
    }

    private var sendButton: some View {
        Button {
            if let image = selectedImage {
                // Send with image
                viewModel.sendMessageWithImage(viewModel.inputText, image: image)
                selectedImage = nil
                viewModel.inputText = ""
            } else {
                // Normal send
                viewModel.sendCurrentMessage()
            }
            speechRecognizer.clearTranscript()
            isInputFocused = false
            let feedback = UIImpactFeedbackGenerator(style: .medium)
            feedback.impactOccurred()
        } label: {
            Image(systemName: "paperplane.fill")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(
                    Circle()
                        .fill(
                            canSendWithImage
                                ? HaptikTheme.primaryGradient
                                : LinearGradient(colors: [Color.gray.opacity(0.4)], startPoint: .leading, endPoint: .trailing)
                        )
                )
                .shadow(color: canSendWithImage ? HaptikTheme.primaryBlue.opacity(0.4) : .clear, radius: 8, y: 4)
        }
        .disabled(!canSendWithImage)
        .animation(.easeInOut(duration: 0.2), value: canSendWithImage)
    }

    // MARK: - Recording Indicator

    private var recordingIndicator: some View {
        HStack(spacing: 12) {
            // Pulsing recording dot
            Circle()
                .fill(HaptikTheme.error)
                .frame(width: 12, height: 12)
                .modifier(PulsingModifier())

            Text("Listening...")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(HaptikTheme.darkCharcoal)

            Spacer()

            // Live transcript preview
            if !speechRecognizer.transcript.isEmpty {
                Text(speechRecognizer.transcript)
                    .font(.caption)
                    .foregroundColor(HaptikTheme.textSecondary)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }

            // Cancel button
            Button {
                speechRecognizer.stopRecording()
                speechRecognizer.clearTranscript()
                viewModel.inputText = ""
            } label: {
                Text("Cancel")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(HaptikTheme.error)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            HaptikTheme.error.opacity(0.1)
        )
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }
}

// MARK: - Pulsing Animation Modifier

struct PulsingModifier: ViewModifier {
    @State private var isPulsing = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPulsing ? 1.2 : 1.0)
            .opacity(isPulsing ? 0.6 : 1.0)
            .animation(
                .easeInOut(duration: 0.8)
                .repeatForever(autoreverses: true),
                value: isPulsing
            )
            .onAppear {
                isPulsing = true
            }
    }
}

// MARK: - Quick Action Chip

struct QuickActionChip: View {
    let label: String
    let icon: String
    let color: Color
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: {
            let feedback = UIImpactFeedbackGenerator(style: .light)
            feedback.impactOccurred()

            withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.spring(response: 0.2, dampingFraction: 0.6)) {
                    isPressed = false
                }
                action()
            }
        }) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .semibold))
                Text(label)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .foregroundColor(color)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(Color.white)
                    .shadow(color: color.opacity(0.15), radius: 6, y: 3)
            )
            .overlay(
                Capsule()
                    .stroke(color.opacity(0.3), lineWidth: 1)
            )
        }
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .buttonStyle(.plain)
    }
}

// MARK: - Feature Pill

struct FeaturePillView: View {
    let icon: String
    let text: String
    var color: Color = HaptikTheme.primaryBlue

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption2)
            Text(text)
                .font(.caption2)
                .fontWeight(.medium)
        }
        .foregroundColor(color)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(color.opacity(0.1))
        )
    }
}

// MARK: - Typing Indicator

struct TypingIndicatorView: View {
    @State private var dotScale: [CGFloat] = [1, 1, 1]

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            // AI Avatar
            ZStack {
                Circle()
                    .fill(HaptikTheme.lightLavender)
                    .frame(width: 32, height: 32)

                Image(systemName: "sparkles")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(HaptikTheme.primaryGradient)
            }

            // Typing dots
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { index in
                    Circle()
                        .fill(HaptikTheme.textSecondary)
                        .frame(width: 8, height: 8)
                        .scaleEffect(dotScale[index])
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                ChatBubbleShape(isUser: false)
                    .fill(Color.white)
                    .shadow(color: Color.black.opacity(0.05), radius: 4, y: 2)
            )
            .onAppear {
                animateDots()
            }

            Spacer()
        }
        .padding(.horizontal, 4)
    }

    private func animateDots() {
        for i in 0..<3 {
            withAnimation(
                Animation
                    .easeInOut(duration: 0.4)
                    .repeatForever(autoreverses: true)
                    .delay(Double(i) * 0.15)
            ) {
                dotScale[i] = 0.6
            }
        }
    }
}

// MARK: - Chat Bubble Shape (WhatsApp style with tail)

struct ChatBubbleShape: Shape {
    let isUser: Bool
    let cornerRadius: CGFloat = 18
    let tailSize: CGFloat = 8

    func path(in rect: CGRect) -> Path {
        var path = Path()

        if isUser {
            // User bubble - tail on right
            path.move(to: CGPoint(x: rect.minX + cornerRadius, y: rect.minY))
            path.addLine(to: CGPoint(x: rect.maxX - cornerRadius, y: rect.minY))
            path.addArc(
                center: CGPoint(x: rect.maxX - cornerRadius, y: rect.minY + cornerRadius),
                radius: cornerRadius,
                startAngle: .degrees(-90),
                endAngle: .degrees(0),
                clockwise: false
            )
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - tailSize - 4))
            // Tail
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX + tailSize, y: rect.maxY),
                control: CGPoint(x: rect.maxX, y: rect.maxY)
            )
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX - cornerRadius, y: rect.maxY),
                control: CGPoint(x: rect.maxX, y: rect.maxY)
            )
            path.addLine(to: CGPoint(x: rect.minX + cornerRadius, y: rect.maxY))
            path.addArc(
                center: CGPoint(x: rect.minX + cornerRadius, y: rect.maxY - cornerRadius),
                radius: cornerRadius,
                startAngle: .degrees(90),
                endAngle: .degrees(180),
                clockwise: false
            )
            path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + cornerRadius))
            path.addArc(
                center: CGPoint(x: rect.minX + cornerRadius, y: rect.minY + cornerRadius),
                radius: cornerRadius,
                startAngle: .degrees(180),
                endAngle: .degrees(270),
                clockwise: false
            )
        } else {
            // AI bubble - tail on left
            path.move(to: CGPoint(x: rect.minX + cornerRadius, y: rect.minY))
            path.addLine(to: CGPoint(x: rect.maxX - cornerRadius, y: rect.minY))
            path.addArc(
                center: CGPoint(x: rect.maxX - cornerRadius, y: rect.minY + cornerRadius),
                radius: cornerRadius,
                startAngle: .degrees(-90),
                endAngle: .degrees(0),
                clockwise: false
            )
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - cornerRadius))
            path.addArc(
                center: CGPoint(x: rect.maxX - cornerRadius, y: rect.maxY - cornerRadius),
                radius: cornerRadius,
                startAngle: .degrees(0),
                endAngle: .degrees(90),
                clockwise: false
            )
            path.addLine(to: CGPoint(x: rect.minX + cornerRadius, y: rect.maxY))
            // Tail
            path.addQuadCurve(
                to: CGPoint(x: rect.minX - tailSize, y: rect.maxY),
                control: CGPoint(x: rect.minX, y: rect.maxY)
            )
            path.addQuadCurve(
                to: CGPoint(x: rect.minX, y: rect.maxY - tailSize - 4),
                control: CGPoint(x: rect.minX, y: rect.maxY)
            )
            path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + cornerRadius))
            path.addArc(
                center: CGPoint(x: rect.minX + cornerRadius, y: rect.minY + cornerRadius),
                radius: cornerRadius,
                startAngle: .degrees(180),
                endAngle: .degrees(270),
                clockwise: false
            )
        }

        path.closeSubpath()
        return path
    }
}

// MARK: - Identifiable Image Helper

struct IdentifiableImage: Identifiable {
    let id = UUID()
    let image: UIImage
}

// MARK: - Camera View

struct CameraView: UIViewControllerRepresentable {
    let onImageCaptured: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        picker.allowsEditing = false
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView

        init(_ parent: CameraView) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.onImageCaptured(image)
            }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

// MARK: - Image Viewer View

struct ImageViewerView: View {
    let image: UIImage
    let onDismiss: () -> Void

    @State private var scale: CGFloat = 1.0
    @State private var lastScale: CGFloat = 1.0
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .scaleEffect(scale)
                .offset(offset)
                .gesture(
                    MagnificationGesture()
                        .onChanged { value in
                            let delta = value / lastScale
                            lastScale = value
                            scale = min(max(scale * delta, 1), 4)
                        }
                        .onEnded { _ in
                            lastScale = 1.0
                            if scale < 1 {
                                withAnimation {
                                    scale = 1
                                }
                            }
                        }
                )
                .simultaneousGesture(
                    DragGesture()
                        .onChanged { value in
                            offset = CGSize(
                                width: lastOffset.width + value.translation.width,
                                height: lastOffset.height + value.translation.height
                            )
                        }
                        .onEnded { _ in
                            lastOffset = offset
                        }
                )
                .onTapGesture(count: 2) {
                    withAnimation {
                        if scale > 1 {
                            scale = 1
                            offset = .zero
                            lastOffset = .zero
                        } else {
                            scale = 2
                        }
                    }
                }

            // Close button
            VStack {
                HStack {
                    Spacer()
                    Button {
                        onDismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.white.opacity(0.8))
                            .padding(16)
                    }
                }
                Spacer()
            }
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        SafetyChatView()
    }
}
