/**
 * CereBro Web App - App Header Tests
 *
 * Tests for the main application header component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppHeader } from '@/components/shared/app-header';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'INDIVIDUAL',
      },
    },
    status: 'authenticated',
  }),
  signOut: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AppHeader', () => {
  describe('authenticated user', () => {
    it('should render the logo/brand', () => {
      render(<AppHeader />);

      // Should show CereBro branding (split into Cere and Bro spans)
      expect(screen.getByText('Cere')).toBeInTheDocument();
      expect(screen.getByText('Bro')).toBeInTheDocument();
    });

    it('should render navigation links for authenticated users', () => {
      render(<AppHeader />);

      // Common navigation items
      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);
    });

    it('should have accessible header', () => {
      render(<AppHeader />);

      // Should have banner landmark (header element)
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should display navigation for individuals', () => {
      render(<AppHeader />);

      // Should show individual navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Mood')).toBeInTheDocument();
      expect(screen.getByText('Journal')).toBeInTheDocument();
    });

    it('should display user dropdown trigger', () => {
      render(<AppHeader />);

      // Should show user role label
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('should display Breathe navigation', () => {
      render(<AppHeader />);
      expect(screen.getByText('Breathe')).toBeInTheDocument();
    });

    it('should display Companion navigation', () => {
      render(<AppHeader />);
      expect(screen.getByText('Companion')).toBeInTheDocument();
    });

    it('should display Agent navigation with special styling', () => {
      render(<AppHeader />);
      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('should show user name in dropdown', () => {
      render(<AppHeader />);
      // First name is shown: "Test User" -> "Test"
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('minimal variant', () => {
    it('should hide navigation when variant is minimal', () => {
      render(<AppHeader variant="minimal" />);

      // Navigation links should not be visible
      expect(screen.queryByText('Mood')).not.toBeInTheDocument();
      expect(screen.queryByText('Journal')).not.toBeInTheDocument();
    });

    it('should still show logo in minimal variant', () => {
      render(<AppHeader variant="minimal" />);

      expect(screen.getByText('Cere')).toBeInTheDocument();
      expect(screen.getByText('Bro')).toBeInTheDocument();
    });
  });
});

describe('AppHeader - unauthenticated', () => {
  beforeEach(() => {
    // Override the mock to return no session
    jest.spyOn(require('next-auth/react'), 'useSession').mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show sign in button when not authenticated', () => {
    render(<AppHeader />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should show get started button when not authenticated', () => {
    render(<AppHeader />);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});
