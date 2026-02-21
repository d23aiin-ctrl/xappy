import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'test-user', email: 'test@example.com', name: 'Test User', role: 'INDIVIDUAL' } },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));
