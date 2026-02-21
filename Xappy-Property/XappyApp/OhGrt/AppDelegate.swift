//
//  AppDelegate.swift
//  XappyAI
//
//  Xappy - Oil & Gas Safety Compliance Platform
//

import UIKit
import os.log

private let logger = Logger(subsystem: "com.xappy.ai", category: "AppDelegate")

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        configureApp()
        return true
    }

    func application(_ app: UIApplication,
                     open url: URL,
                     options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        // Handle deep links if needed
        return handleDeepLink(url)
    }

    // MARK: - App Configuration

    private func configureApp() {
        logger.info("Xappy starting...")
        logger.info("Environment: \(AppConfig.shared.environment.rawValue)")
        logger.info("API Base URL: \(AppConfig.shared.apiBaseURL.absoluteString)")

        // Configure UI appearance
        configureAppearance()
    }

    private func configureAppearance() {
        // Xappy brand orange color
        let xappyOrange = UIColor(red: 1.0, green: 0.45, blue: 0.0, alpha: 1.0)

        // Navigation bar
        UINavigationBar.appearance().tintColor = xappyOrange

        // Tab bar
        UITabBar.appearance().tintColor = xappyOrange

        // Text fields and buttons
        UITextField.appearance().tintColor = xappyOrange

        logger.debug("App appearance configured")
    }

    // MARK: - Deep Link Handling

    private func handleDeepLink(_ url: URL) -> Bool {
        logger.debug("Handling deep link: \(url.absoluteString)")

        // Parse URL scheme and handle accordingly
        // Example: xappy://report/XP-NM-20260102-0001
        guard let scheme = url.scheme, scheme == "xappy" else {
            return false
        }

        guard let host = url.host else {
            return false
        }

        switch host {
        case "report":
            // Handle report deep link
            if let reportId = url.pathComponents.last {
                logger.info("Deep link to report: \(reportId)")
                // TODO: Navigate to report detail
            }
            return true
        case "chat":
            // Handle chat deep link
            logger.info("Deep link to chat")
            // TODO: Navigate to chat
            return true
        default:
            logger.warning("Unknown deep link host: \(host)")
            return false
        }
    }
}
