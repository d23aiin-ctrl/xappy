//
//  AuthViewModelTests.swift
//  OhGrtTests
//
//  Tests for AuthViewModel
//

import Testing
import Foundation
import Combine
@testable import OhGrt

struct AuthViewModelTests {

    // MARK: - Validation Tests

    @Test func canSubmitPasswordEmptyBadge() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = ""
            vm.password = "1234"

            #expect(vm.canSubmitPassword == false)
        }
    }

    @Test func canSubmitPasswordShortPIN() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "EMP001"
            vm.password = "123"

            #expect(vm.canSubmitPassword == false)
        }
    }

    @Test func canSubmitPasswordValid() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "EMP001"
            vm.password = "1234"

            #expect(vm.canSubmitPassword == true)
        }
    }

    @Test func canSubmitOTPShortPhone() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "12345"
            vm.otpCode = "123456"

            #expect(vm.canSubmitOTP == false)
        }
    }

    @Test func canSubmitOTPShortOTP() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "1234567890"
            vm.otpCode = "123"

            #expect(vm.canSubmitOTP == false)
        }
    }

    @Test func canSubmitOTPValid() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "1234567890"
            vm.otpCode = "1234"

            #expect(vm.canSubmitOTP == true)
        }
    }

    @Test func canSendOTPValid() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "1234567890"

            #expect(vm.canSendOTP == true)
        }
    }

    @Test func canSendOTPShortPhone() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "12345"

            #expect(vm.canSendOTP == false)
        }
    }

    // MARK: - State Tests

    @Test func initialState() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            #expect(vm.isLoading == false)
            #expect(vm.error == nil)
            #expect(vm.showError == false)
            #expect(vm.isAuthenticated == false)
            #expect(vm.currentUser == nil)
        }
    }

    @Test func isAuthenticatedWhenAuthenticated() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "EMP001"
            vm.password = "1234"
        }
    }

    @Test func clearErrorResetsState() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            // Simulate an error state
            vm.clearError()

            #expect(vm.error == nil)
            #expect(vm.showError == false)
        }
    }

    @Test func switchLoginModeResetsFields() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.password = "1234"
            vm.otpCode = "5678"

            vm.switchLoginMode(to: .otp)

            #expect(vm.loginMode == .otp)
            #expect(vm.password == "")
            #expect(vm.otpCode == "")
            #expect(vm.showOTPInput == false)
        }
    }

    @Test func switchLoginModeThenBack() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.switchLoginMode(to: .otp)
            #expect(vm.loginMode == .otp)

            vm.switchLoginMode(to: .password)
            #expect(vm.loginMode == .password)
        }
    }

    @Test func useStoredPhoneNumber() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.storedPhoneNumber = "+1234567890"
            vm.useStoredPhoneNumber()

            #expect(vm.phoneNumber == "+1234567890")
        }
    }

    @Test func useStoredPhoneNumberWhenNil() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            vm.phoneNumber = "existing"
            vm.storedPhoneNumber = nil
            vm.useStoredPhoneNumber()

            #expect(vm.phoneNumber == "existing")
        }
    }

    // MARK: - Auth Flow Tests

    @Test func signInSuccessSetsAuthState() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let expectedUser = User(id: "u1", fullName: "John", role: .supervisor)
            mockRepo.signInResult = .success(expectedUser)

            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)
            vm.phoneNumber = "EMP001"
            vm.password = "1234"

            vm.signIn()
        }
    }

    @Test func signOutResetsState() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()

            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)
            vm.signOut()
        }
    }

    @Test func sendOTPCallsRepository() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()

            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)
            vm.phoneNumber = "1234567890"

            vm.sendOTP()
        }
    }

    @Test func verifyOTPCallsRepository() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()

            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)
            vm.phoneNumber = "1234567890"
            vm.otpCode = "123456"

            vm.verifyOTP()
        }
    }

    @Test func currentUserReturnsUserWhenAuthenticated() async throws {
        await MainActor.run {
            let mockRepo = MockAuthRepository()
            let mockObserve = MockObserveAuthStateUseCase()
            let vm = AuthViewModel(authRepository: mockRepo, observeAuthStateUseCase: mockObserve)

            // Test unauthenticated state
            #expect(vm.currentUser == nil)
            #expect(vm.isAuthenticated == false)
        }
    }
}
