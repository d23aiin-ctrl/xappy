import SwiftUI

/// Xappy AI login view with Phone+Password and OTP login
struct AuthView: View {
    @ObservedObject var viewModel: AuthViewModel

    @State private var logoScale: CGFloat = 0.9
    @State private var logoOpacity: Double = 0
    @State private var cardOffset: CGFloat = 24
    @State private var cardOpacity: Double = 0

    private let primaryColor = Color(red: 1.0, green: 0.45, blue: 0.0)
    private let secondaryColor = Color(red: 0.08, green: 0.11, blue: 0.18)
    private let surfaceColor = Color(red: 0.98, green: 0.96, blue: 0.92)

    var body: some View {
        ZStack {
            XappyAuthBackground()

            ScrollView {
                VStack(spacing: 24) {
                    Spacer(minLength: 32)

                    VStack(spacing: 14) {
                        ZStack {
                            Circle()
                                .fill(Color.white)
                                .frame(width: 92, height: 92)

                            Image("XappyLogo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 72, height: 72)
                        }
                        .clipShape(Circle())
                        .shadow(color: primaryColor.opacity(0.35), radius: 18, y: 10)
                        .scaleEffect(logoScale)
                        .opacity(logoOpacity)

                        VStack(spacing: 6) {
                            Text("Xappy")
                                .font(.system(size: 28, weight: .bold, design: .serif))
                                .foregroundColor(secondaryColor)
                            Text("AI-powered safety reporting")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }

                    VStack(spacing: 16) {
                        loginModePicker
                        loginFormCard
                    }
                    .padding(.horizontal, 24)
                    .offset(y: cardOffset)
                    .opacity(cardOpacity)

                    VStack(spacing: 6) {
                        Text("Secure access for frontline teams")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        HStack(spacing: 6) {
                            Image(systemName: "lock.shield")
                                .font(.caption)
                            Text("Audit-safe authentication")
                                .font(.caption)
                        }
                        .foregroundColor(.secondary)
                    }
                    .padding(.bottom, 28)
                }
            }
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK") {
                viewModel.clearError()
            }
        } message: {
            Text(viewModel.error ?? "An error occurred")
        }
        .onAppear {
            startAnimations()
        }
    }

    private var loginModePicker: some View {
        HStack(spacing: 12) {
            loginModeButton(title: "Badge + PIN", mode: .password)
            loginModeButton(title: "OTP", mode: .otp)
        }
    }

    private func loginModeButton(title: String, mode: LoginMode) -> some View {
        Button {
            viewModel.switchLoginMode(to: mode)
        } label: {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundColor(viewModel.loginMode == mode ? .white : secondaryColor)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(viewModel.loginMode == mode ? primaryColor : surfaceColor)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(secondaryColor.opacity(0.08), lineWidth: 1)
                        )
                )
        }
        .buttonStyle(.plain)
    }

    private var loginFormCard: some View {
        VStack(spacing: 16) {
            if viewModel.loginMode == .password {
                passwordLoginForm
            } else {
                otpLoginForm
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(surfaceColor)
                .shadow(color: Color.black.opacity(0.08), radius: 16, y: 10)
        )
    }

    private var passwordLoginForm: some View {
        VStack(spacing: 16) {
            inputField(
                title: "Badge Number",
                systemImage: "person.text.rectangle",
                placeholder: "Enter your badge number"
            ) {
                TextField("Enter your badge number", text: $viewModel.phoneNumber)
                    .textContentType(.username)
                    .keyboardType(.default)
            }

            inputField(
                title: "PIN",
                systemImage: "lock.fill",
                placeholder: "Enter your PIN"
            ) {
                SecureField("Enter your PIN", text: $viewModel.password)
                    .textContentType(.password)
            }

            if let storedPhone = viewModel.storedPhoneNumber,
               !storedPhone.isEmpty,
               viewModel.phoneNumber != storedPhone {
                Button {
                    viewModel.useStoredPhoneNumber()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.clockwise")
                        Text("Use saved badge")
                    }
                    .font(.caption)
                    .foregroundColor(primaryColor)
                }
            }

            primaryActionButton(
                title: "Sign In",
                icon: "checkmark.seal.fill",
                isEnabled: viewModel.canSubmitPassword
            ) {
                viewModel.signIn()
            }
        }
    }

    private var otpLoginForm: some View {
        VStack(spacing: 16) {
            if !viewModel.showOTPInput {
                inputField(
                    title: "Phone Number",
                    systemImage: "phone.fill",
                    placeholder: "Enter your phone number"
                ) {
                    TextField("Enter your phone number", text: $viewModel.phoneNumber)
                        .textContentType(.telephoneNumber)
                        .keyboardType(.phonePad)
                }

                primaryActionButton(
                    title: "Send OTP",
                    icon: "message.fill",
                    isEnabled: viewModel.canSendOTP
                ) {
                    viewModel.sendOTP()
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("OTP sent to \(viewModel.phoneNumber)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Button("Change") {
                            viewModel.showOTPInput = false
                        }
                        .font(.caption)
                        .foregroundColor(primaryColor)
                    }

                    HStack {
                        Image(systemName: "number")
                            .foregroundColor(.secondary)
                        TextField("Enter OTP code", text: $viewModel.otpCode)
                            .textContentType(.oneTimeCode)
                            .keyboardType(.numberPad)
                    }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(14)
                }

                primaryActionButton(
                    title: "Verify & Sign In",
                    icon: "checkmark.shield.fill",
                    isEnabled: viewModel.canSubmitOTP
                ) {
                    viewModel.verifyOTP()
                }

                Button {
                    viewModel.sendOTP()
                } label: {
                    Text("Resend OTP")
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(primaryColor)
                }
                .disabled(viewModel.isLoading)
            }
        }
    }

    private func inputField<Content: View>(
        title: String,
        systemImage: String,
        placeholder: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.secondary)

            HStack {
                Image(systemName: systemImage)
                    .foregroundColor(.secondary)
                content()
            }
            .padding()
            .background(Color.white)
            .cornerRadius(14)
        }
    }

    private func primaryActionButton(
        title: String,
        icon: String,
        isEnabled: Bool,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if viewModel.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Image(systemName: icon)
                    Text(title)
                }
            }
            .font(.headline)
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(isEnabled ? primaryColor : Color.gray)
            .cornerRadius(16)
        }
        .disabled(!isEnabled || viewModel.isLoading)
    }

    private func startAnimations() {
        withAnimation(.spring(response: 0.7, dampingFraction: 0.7).delay(0.1)) {
            logoScale = 1.0
            logoOpacity = 1.0
        }

        withAnimation(.easeOut(duration: 0.5).delay(0.25)) {
            cardOffset = 0
            cardOpacity = 1.0
        }
    }
}

private struct XappyAuthBackground: View {
    @State private var animateGradient = false

    private let primaryColor = Color(red: 1.0, green: 0.45, blue: 0.0)
    private let secondaryColor = Color(red: 0.08, green: 0.11, blue: 0.18)

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.99, green: 0.97, blue: 0.93),
                    Color(red: 0.95, green: 0.95, blue: 0.96)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            GeometryReader { geo in
                ZStack {
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [primaryColor.opacity(0.18), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: 200
                            )
                        )
                        .frame(width: 320, height: 320)
                        .offset(
                            x: animateGradient ? -80 : -120,
                            y: animateGradient ? -40 : -90
                        )
                        .blur(radius: 40)

                    RoundedRectangle(cornerRadius: 40, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [secondaryColor.opacity(0.12), .clear],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 280, height: 180)
                        .rotationEffect(.degrees(12))
                        .offset(
                            x: animateGradient ? 120 : 160,
                            y: geo.size.height - (animateGradient ? 140 : 180)
                        )
                        .blur(radius: 30)
                }
            }
            .ignoresSafeArea()
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 4).repeatForever(autoreverses: true)) {
                animateGradient = true
            }
        }
    }
}

#Preview {
    AuthView(viewModel: DependencyContainer.shared.makeAuthViewModel())
        .environmentObject(ThemeManager.shared)
}
