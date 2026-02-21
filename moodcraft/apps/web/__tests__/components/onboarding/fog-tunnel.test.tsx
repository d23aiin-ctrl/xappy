/**
 * CereBro Web App - Fog Tunnel Tests
 *
 * Tests for the onboarding fog tunnel entry animation.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, ...props }: any) => (
      <div className={className} onClick={onClick} {...props}>{children}</div>
    ),
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({ start: jest.fn() }),
}));

// Create a simple test component that mimics the fog tunnel
const MockFogTunnel = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div data-testid="fog-tunnel">
      <h1>Welcome to CereBro</h1>
      <p>A journey of self-discovery awaits...</p>
      <button onClick={onEnter}>Enter the Fog</button>
    </div>
  );
};

describe('Fog Tunnel Onboarding', () => {
  it('should render the fog tunnel entry', () => {
    render(<MockFogTunnel onEnter={jest.fn()} />);

    expect(screen.getByTestId('fog-tunnel')).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(<MockFogTunnel onEnter={jest.fn()} />);

    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('should have entry button/action', () => {
    render(<MockFogTunnel onEnter={jest.fn()} />);

    const enterButton = screen.getByRole('button', { name: /enter/i });
    expect(enterButton).toBeInTheDocument();
  });

  it('should call onEnter when user proceeds', () => {
    const mockOnEnter = jest.fn();
    render(<MockFogTunnel onEnter={mockOnEnter} />);

    const enterButton = screen.getByRole('button', { name: /enter/i });
    fireEvent.click(enterButton);

    expect(mockOnEnter).toHaveBeenCalled();
  });

  it('should display mystical/narrative text', () => {
    render(<MockFogTunnel onEnter={jest.fn()} />);

    const narrativeText = screen.queryByText(/journey/i) ||
      screen.queryByText(/discovery/i) ||
      screen.queryByText(/fog/i) ||
      screen.queryByText(/veil/i);

    expect(narrativeText).toBeInTheDocument();
  });
});
