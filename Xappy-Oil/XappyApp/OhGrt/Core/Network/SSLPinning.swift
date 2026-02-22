import Foundation
import Security
import CommonCrypto

/// SSL Pinning delegate for URLSession
/// Validates server certificates against pinned certificates
final class SSLPinningDelegate: NSObject, URLSessionDelegate {

    /// The host to pin certificates for
    private let pinnedHost = "propapi.xappy.io"

    /// Pinned certificate data loaded from bundle
    private var pinnedCertificates: [Data] = []

    /// Certificate expiry date for monitoring (Let's Encrypt cert expires April 16, 2026)
    private static let embeddedCertExpiryDate: Date = {
        var components = DateComponents()
        components.year = 2026
        components.month = 4
        components.day = 16
        return Calendar.current.date(from: components) ?? Date.distantFuture
    }()

    /// Days before expiry to start warning
    private static let expiryWarningDays = 30

    override init() {
        super.init()
        loadPinnedCertificates()
        checkCertificateExpiry()
    }

    /// Check if embedded certificate is close to expiry and log warning
    private func checkCertificateExpiry() {
        let now = Date()
        let daysUntilExpiry = Calendar.current.dateComponents([.day], from: now, to: Self.embeddedCertExpiryDate).day ?? 0

        if daysUntilExpiry <= 0 {
            print("[SSLPinning] ⚠️ CRITICAL: Embedded certificate has EXPIRED!")
            print("[SSLPinning] ⚠️ App may fail to connect to API. Update required immediately.")
            // In production, this should trigger an alert or force update
        } else if daysUntilExpiry <= Self.expiryWarningDays {
            print("[SSLPinning] ⚠️ WARNING: Embedded certificate expires in \(daysUntilExpiry) days")
            print("[SSLPinning] ⚠️ Schedule app update with new certificate before \(Self.embeddedCertExpiryDate)")
        } else if AppConfig.shared.allowDebugLogging {
            print("[SSLPinning] Certificate valid for \(daysUntilExpiry) more days")
        }
    }

    /// Check certificate status - can be called to verify cert health
    static func certificateStatus() -> CertificateStatus {
        let now = Date()
        let daysUntilExpiry = Calendar.current.dateComponents([.day], from: now, to: embeddedCertExpiryDate).day ?? 0

        if daysUntilExpiry <= 0 {
            return .expired
        } else if daysUntilExpiry <= expiryWarningDays {
            return .expiringSoon(daysRemaining: daysUntilExpiry)
        } else {
            return .valid(daysRemaining: daysUntilExpiry)
        }
    }

    /// Certificate validity status
    enum CertificateStatus {
        case valid(daysRemaining: Int)
        case expiringSoon(daysRemaining: Int)
        case expired

        var isValid: Bool {
            switch self {
            case .valid, .expiringSoon:
                return true
            case .expired:
                return false
            }
        }

        var description: String {
            switch self {
            case .valid(let days):
                return "Valid (\(days) days remaining)"
            case .expiringSoon(let days):
                return "Expiring soon (\(days) days remaining)"
            case .expired:
                return "Expired"
            }
        }
    }

    /// Load pinned certificates from the app bundle
    private func loadPinnedCertificates() {
        // Try to load .cer file
        if let certPath = Bundle.main.path(forResource: "propapi.xappy.io", ofType: "cer"),
           let certData = try? Data(contentsOf: URL(fileURLWithPath: certPath)) {
            pinnedCertificates.append(certData)
            print("[SSLPinning] Loaded certificate from bundle")
        }

        // Try to load .der file as fallback
        if let derPath = Bundle.main.path(forResource: "propapi.xappy.io", ofType: "der"),
           let derData = try? Data(contentsOf: URL(fileURLWithPath: derPath)) {
            pinnedCertificates.append(derData)
            print("[SSLPinning] Loaded DER certificate from bundle")
        }

        // Fallback: use embedded base64 cert if bundle lookup fails
        if pinnedCertificates.isEmpty, let embeddedData = Data(base64Encoded: Self.embeddedCertBase64) {
            pinnedCertificates.append(embeddedData)
            print("[SSLPinning] Loaded embedded certificate")
        }

        if pinnedCertificates.isEmpty {
            print("[SSLPinning] WARNING: No pinned certificates found in bundle")
        }
    }

    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        // Only handle server trust challenges
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust else {
            completionHandler(.performDefaultHandling, nil)
            return
        }

        // Only pin for our specific host
        guard challenge.protectionSpace.host == pinnedHost else {
            completionHandler(.performDefaultHandling, nil)
            return
        }

        guard let serverTrust = challenge.protectionSpace.serverTrust else {
            print("[SSLPinning] No server trust available")
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // If no pinned certificates, check configuration
        if pinnedCertificates.isEmpty {
            // Only allow bypass if SSL pinning is not enforced (development only)
            if !AppConfig.shared.enforceSSLPinning {
                AppConfig.shared.debugLog("No pinned certificates - allowing connection (SSL pinning not enforced)")
                completionHandler(.useCredential, URLCredential(trust: serverTrust))
                return
            } else {
                print("[SSLPinning] No pinned certificates - rejecting connection (SSL pinning enforced)")
                completionHandler(.cancelAuthenticationChallenge, nil)
                return
            }
        }

        // Evaluate the server trust
        var error: CFError?
        let policy = SecPolicyCreateSSL(true, pinnedHost as CFString)
        SecTrustSetPolicies(serverTrust, policy)

        guard SecTrustEvaluateWithError(serverTrust, &error) else {
            print("[SSLPinning] Trust evaluation failed: \(error?.localizedDescription ?? "unknown")")
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // Get server certificate
        guard let certificates = SecTrustCopyCertificateChain(serverTrust) as? [SecCertificate],
              let serverCertificate = certificates.first else {
            print("[SSLPinning] Could not get server certificate")
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        let serverCertData = SecCertificateCopyData(serverCertificate) as Data

        // Compare with pinned certificates
        for pinnedCertData in pinnedCertificates {
            if serverCertData == pinnedCertData {
                print("[SSLPinning] Certificate pinning successful")
                completionHandler(.useCredential, URLCredential(trust: serverTrust))
                return
            }
        }

        // Also check public key pinning as fallback
        if validatePublicKey(serverTrust: serverTrust) {
            print("[SSLPinning] Public key pinning successful")
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
            return
        }

        print("[SSLPinning] Certificate pinning FAILED - certificate mismatch")
        completionHandler(.cancelAuthenticationChallenge, nil)
    }

    /// Validate public key as a fallback pinning method
    /// Uses SHA-256 hash of the public key for comparison
    private func validatePublicKey(serverTrust: SecTrust) -> Bool {
        guard let certificates = SecTrustCopyCertificateChain(serverTrust) as? [SecCertificate],
              let serverCertificate = certificates.first,
              let serverPublicKey = SecCertificateCopyKey(serverCertificate) else {
            return false
        }

        // Get the public key data
        guard let serverPublicKeyData = SecKeyCopyExternalRepresentation(serverPublicKey, nil) as Data? else {
            return false
        }

        // Hash the server's public key
        let serverKeyHash = sha256Hash(data: serverPublicKeyData)

        // Compare with pinned public key hashes
        for pinnedHash in Self.pinnedPublicKeyHashes {
            if serverKeyHash == pinnedHash {
                return true
            }
        }

        return false
    }

    /// Compute SHA-256 hash of data
    private func sha256Hash(data: Data) -> String {
        var hash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        data.withUnsafeBytes {
            _ = CC_SHA256($0.baseAddress, CC_LONG(data.count), &hash)
        }
        return hash.map { String(format: "%02x", $0) }.joined()
    }

    /// Pre-computed SHA-256 hashes of pinned public keys
    /// To generate: extract public key from cert and hash it
    /// openssl x509 -in cert.pem -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256
    private static let pinnedPublicKeyHashes: [String] = [
        // SHA-256 of propapi.xappy.io (*.xappy.io) public key
        "d5ebc39d84c2c62154389eae5f9c6effde7e33b03244b330c89e291363e64723"
    ]

    // propapi.xappy.io (*.xappy.io) Let's Encrypt cert, valid until April 16, 2026
    // Generated: openssl s_client -connect propapi.xappy.io:443 -showcerts | openssl x509 -outform DER | base64
    private static let embeddedCertBase64 = "MIIFgDCCBGigAwIBAgISBsGHJ/Ewv8A7mQhchqyNVrGVMA0GCSqGSIb3DQEBCwUAMDMxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQwwCgYDVQQDEwNSMTMwHhcNMjYwMTE2MTA1MTM4WhcNMjYwNDE2MTA1MTM3WjATMREwDwYDVQQDEwh4YXBweS5pbzCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAI8jCwca1arroVvso3fBR157NpVSgW/KCWbZYYbGLvFnURWNuWk5Yp1x1x6eB6voXtAlLXuuOTgSQPA1g959N1guEse87Ycq6fpZQZPP7h/beEpOlBCMS8qXTfsvtvPDUHbLZMRTHQG93ZQSrDYQuUvt9LhH0Ggd/CHGEuzyR/U/XzNuGX/9jeiYx0x5yLDncjQ2PJsOAa6J74kf57j3gtaC3mZ8spJU+y+1em95mk29xTAzR1YbgZ2JqAmoaY3RN3d4ZY8j6BL6oV1NoBUO26WfnAsIoA/dIrwoPBTXbxgYqUbWhuEcJRQkk/kUsdbOuHjTsDADWXjQxAol8vCvSp+QMUZ5D+EIfmLRgUPGBvLY05+hQ1SxiBY4d1SpnQhRURl2IqECWAdqs+C+uR7XYh9Q/GZHnA3vnqdU3jSrR0x39P+jChw10FfDflyFFlAsBH85mhfGQyyl8xckGkNOGyt4wvanTdB9CSNEP1ruo2XF2cHQfjNU9LArakyQZo3ymwIDAQABo4ICLDCCAigwDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBQ95Sn8gMU1NLpN9e0NtwP1kI7RoDAfBgNVHSMEGDAWgBTnq58PLDOgU9NeT3jIsoQOO9aSMzAzBggrBgEFBQcBAQQnMCUwIwYIKwYBBQUHMAKGF2h0dHA6Ly9yMTMuaS5sZW5jci5vcmcvMB8GA1UdEQQYMBaCCioueGFwcHkuaW+CCHhhcHB5LmlvMBMGA1UdIAQMMAowCAYGZ4EMAQIBMC4GA1UdHwQnMCUwI6AhoB+GHWh0dHA6Ly9yMTMuYy5sZW5jci5vcmcvMjIuY3JsMIIBDAYKKwYBBAHWeQIEAgSB/QSB+gD4AHUADleUvPOuqT4zGyyZB7P3kN+bwj1xMiXdIaklrGHFTiEAAAGbxqQ1qQAABAMARjBEAiBIxs3YnXxcaRqwPwEYCYxCAXmryo/3GDFXSrdGTmq2hQIgXKLwqc+qk9Q7Zp0iD+cLo7ykT590oXdKcQLuSOlNpWcAfwDjI43yjaKI4KrgrPD6kMmF8La/9dKlJ7AB/BxEWMS26AAAAZvGpD9DAAgAAAUAL5GRQAQDAEgwRgIhALN57OwFL0LLy7pAaDSWKO4UagaNLTNbjY6IAEKfUKOxAiEAu1ZT7iRwnP4v5RgucfdJPQnoCUXs3Xvfd82MyaDxs7owDQYJKoZIhvcNAQELBQADggEBAB2OTDA2BIlOnhcAg0vnf4Y4DZyqbgAZOW+GB4QbFF5NwwfJ3zk7KjFQVuQWXT1h2sEXTyfU+oTlxxJ8YHtBcEHknlSHW4o4hnh541lCIZJioiUEoOwky2jJu3bB50/621mKrIu4F5a7Z1+YBB5upJFVEgHLoKn88TLZdCyGA+YQvLJI6hVKdmPx+ejjiKaRxhpzj7Jog1Cc27WPZPdIZ/Qx7tC44vJPDile8urjtEx+oa2x4uHKp2hygXfyBkXQW5FHA4Vo7qV1XYcG0M9FJP3r3EWF6vYkg/zTLmFPTbLXETA4wSP+SyIw2ARg5bnfJ0deJSzr/CZMkl7J9eJ+UHM="
}

/// Extension to create a pinned URLSession
extension URLSession {
    /// Create a URLSession with SSL pinning enabled
    static func pinnedSession(timeoutInterval: TimeInterval = 30) -> URLSession {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = timeoutInterval
        config.timeoutIntervalForResource = 60

        let delegate = SSLPinningDelegate()
        return URLSession(configuration: config, delegate: delegate, delegateQueue: nil)
    }
}
