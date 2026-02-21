import SwiftUI

struct WelcomeView: View {
    let onContinue: () -> Void

    @State private var titleOpacity: Double = 0
    @State private var cardOffset: CGFloat = 30
    @State private var cardOpacity: Double = 0

    private let primaryColor = Color(red: 1.0, green: 0.45, blue: 0.0)
    private let secondaryColor = Color(red: 0.08, green: 0.11, blue: 0.18)
    private let surfaceColor = Color(red: 0.99, green: 0.97, blue: 0.94)

    var body: some View {
        ZStack {
            WelcomeBackground()

            VStack(spacing: 20) {
                Spacer()

                VStack(spacing: 10) {
                    Text("Welcome to Xappy")
                        .font(.system(size: 28, weight: .bold, design: .serif))
                        .foregroundColor(secondaryColor)
                    Text("AI-powered compliance reporting")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .opacity(titleOpacity)

                VStack(spacing: 14) {
                    welcomeRow(icon: "doc.text.fill", title: "Record only", detail: "Capture facts without scoring or advice.")
                    welcomeRow(icon: "clock.arrow.circlepath", title: "Audit‑grade", detail: "Timestamped, immutable evidence trails.")
                    welcomeRow(icon: "shield.lefthalf.filled", title: "Read‑only", detail: "No operational control or commands.")
                }
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(surfaceColor)
                        .shadow(color: Color.black.opacity(0.08), radius: 18, y: 12)
                )
                .padding(.horizontal, 24)
                .offset(y: cardOffset)
                .opacity(cardOpacity)

                Button(action: onContinue) {
                    HStack(spacing: 10) {
                        Image(systemName: "arrow.right.circle.fill")
                        Text("Continue")
                    }
                    .font(.headline.weight(.semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 54)
                    .background(primaryColor)
                    .cornerRadius(18)
                    .padding(.horizontal, 32)
                }

                Spacer()
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.4).delay(0.1)) {
                titleOpacity = 1.0
            }
            withAnimation(.spring(response: 0.6, dampingFraction: 0.75).delay(0.2)) {
                cardOffset = 0
                cardOpacity = 1.0
            }
        }
    }

    private func welcomeRow(icon: String, title: String, detail: String) -> some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(primaryColor.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .foregroundColor(primaryColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(secondaryColor)
                Text(detail)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
    }
}

private struct WelcomeBackground: View {
    @State private var animate = false

    private let primaryColor = Color(red: 1.0, green: 0.45, blue: 0.0)
    private let secondaryColor = Color(red: 0.08, green: 0.11, blue: 0.18)

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.98, green: 0.97, blue: 0.95),
                    Color(red: 0.95, green: 0.96, blue: 0.98)
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
                                endRadius: 220
                            )
                        )
                        .frame(width: 340, height: 340)
                        .offset(
                            x: animate ? -90 : -130,
                            y: animate ? -60 : -110
                        )
                        .blur(radius: 45)

                    RoundedRectangle(cornerRadius: 40, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [secondaryColor.opacity(0.12), .clear],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 300, height: 190)
                        .rotationEffect(.degrees(10))
                        .offset(
                            x: animate ? 130 : 170,
                            y: geo.size.height - (animate ? 150 : 190)
                        )
                        .blur(radius: 30)
                }
            }
            .ignoresSafeArea()
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 4).repeatForever(autoreverses: true)) {
                animate = true
            }
        }
    }
}

#Preview {
    WelcomeView {}
}
