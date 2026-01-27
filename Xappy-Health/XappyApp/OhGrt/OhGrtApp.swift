//
//  XappyApp.swift
//  XappyAI
//
//  XAPPY AI - Oil & Gas Safety Compliance Platform
//

import SwiftUI
import SwiftData
import Combine
import os.log

private let logger = Logger(subsystem: "com.xappy.ai", category: "App")

@main
struct XappyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    @StateObject private var themeManager = ThemeManager.shared
    @State private var showDatabaseError = false
    @State private var databaseErrorMessage = ""

    let sharedModelContainer: ModelContainer

    init() {
        // Validate environment configuration
        AppEnvironment.validateForRelease()

        // Create ModelContainer
        let schema = Schema([
            Message.self,
            Conversation.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        let container: ModelContainer
        do {
            container = try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            logger.error("Failed to create ModelContainer: \(error.localizedDescription)")
            // Fallback to in-memory storage to prevent crash
            do {
                let fallbackConfig = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
                logger.warning("Using in-memory storage as fallback")
                container = try ModelContainer(for: schema, configurations: [fallbackConfig])
            } catch {
                // Last resort - this should never happen with in-memory config
                logger.critical("Critical: Even in-memory ModelContainer failed: \(error.localizedDescription)")
                fatalError("Could not create ModelContainer: \(error)")
            }
        }

        self.sharedModelContainer = container

        // Configure DI container BEFORE any views are created
        DependencyContainer.shared.configure(with: container.mainContext)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(themeManager)
                .environmentObject(AuthManager.shared)
                .preferredColorScheme(themeManager.colorScheme)
        }
        .modelContainer(sharedModelContainer)
    }
}

/// Root view that switches between splash, onboarding, auth, and main content
struct RootView: View {
    @Environment(\.modelContext) private var modelContext
    @StateObject private var authViewModel = DependencyContainer.shared.makeAuthViewModel()

    /// Track if splash screen has finished
    @State private var showSplash = true

    /// Track if onboarding has been completed
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    #if DEBUG
    @State private var showWelcome = false  // Skip welcome in DEBUG
    #else
    @State private var showWelcome = true
    #endif

    /// Whether to show onboarding
    private var shouldShowOnboarding: Bool {
        // Always skip onboarding in DEBUG mode for testing
        #if DEBUG
        false
        #else
        !hasCompletedOnboarding
        #endif
    }

    /// Show main content only when authenticated
    private var shouldShowMainContent: Bool {
        authViewModel.isAuthenticated
    }

    var body: some View {
        ZStack {
            // Main content (behind splash)
            Group {
                if shouldShowOnboarding {
                    // Show onboarding for first-time users
                    OnboardingView()
                        .transition(.opacity.combined(with: .scale(scale: 1.02)))
                } else if authViewModel.isAuthenticated && showWelcome {
                    WelcomeView {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            showWelcome = false
                        }
                    }
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                } else if shouldShowMainContent {
                    // Show main content for authenticated users
                    MainTabView()
                        .transition(.opacity)
                } else {
                    // Show auth screen for non-authenticated users
                    AuthView(viewModel: authViewModel)
                        .transition(.opacity.combined(with: .move(edge: .trailing)))
                }
            }
            .animation(.easeInOut(duration: 0.4), value: hasCompletedOnboarding)
            .animation(.easeInOut(duration: 0.3), value: shouldShowMainContent)

            // Splash screen overlay
            if showSplash {
                SplashScreenView {
                    withAnimation(.easeInOut(duration: 0.4)) {
                        showSplash = false
                    }
                }
                .transition(.opacity)
                .zIndex(1)
            }
        }
        .withDependencies()
        .onChange(of: authViewModel.isAuthenticated) { _, isAuthenticated in
            #if DEBUG
            // Skip welcome screen in DEBUG mode
            showWelcome = false
            #else
            showWelcome = isAuthenticated
            #endif
        }
    }
}

/// Main view after authentication - WhatsApp style navigation
struct MainTabView: View {
    @EnvironmentObject private var authManager: AuthManager
    @State private var showSettings = false
    @State private var showReports = false

    /// Check if user is supervisor or above (can see reports)
    private var isSupervisorOrAbove: Bool {
        guard let user = authManager.currentUser else {
            // In development mode, show supervisor features
            return AppConfig.shared.isDevelopment
        }
        return XappyUserRole(rawValue: user.role)?.isSupervisorOrAbove ?? false
    }

    var body: some View {
        NavigationStack {
            SafetyChatView()
                .toolbar {
                    // Left side - Reports button (for supervisors)
                    ToolbarItem(placement: .topBarLeading) {
                        if isSupervisorOrAbove {
                            Button {
                                showReports = true
                            } label: {
                                Image(systemName: "doc.text.fill")
                                    .foregroundStyle(HaptikTheme.primaryGradient)
                            }
                        }
                    }

                    // Right side - Settings button
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            showSettings = true
                        } label: {
                            Image(systemName: "gearshape.fill")
                                .foregroundStyle(HaptikTheme.primaryGradient)
                        }
                    }
                }
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
        .sheet(isPresented: $showReports) {
            NavigationStack {
                ReportsListView()
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Done") {
                                showReports = false
                            }
                            .fontWeight(.semibold)
                        }
                    }
            }
        }
        .tint(HaptikTheme.primaryBlue)
    }
}



#Preview {
    RootView()
        .environmentObject(ThemeManager.shared)
        .modelContainer(for: [Message.self, Conversation.self], inMemory: true)
}
