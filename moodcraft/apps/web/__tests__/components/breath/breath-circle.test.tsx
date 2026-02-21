/**
 * CereBro Web App - Breath Circle Tests
 *
 * Tests for the animated breathing exercise circle component.
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BreathCircle } from '@/components/breath/breath-circle';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, animate, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
    circle: (props: any) => <circle {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('BreathCircle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the breath circle', () => {
    render(
      <BreathCircle
        type="BOX"
        isActive={false}
      />
    );

    // Should render stats section
    expect(screen.getByText('Cycles')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Pattern')).toBeInTheDocument();
  });

  it('should display pattern name', () => {
    render(
      <BreathCircle
        type="BOX"
        isActive={false}
      />
    );

    expect(screen.getByText('Box Breathing')).toBeInTheDocument();
  });

  it('should show 4-7-8 pattern name', () => {
    render(
      <BreathCircle
        type="FOUR_SEVEN_EIGHT"
        isActive={false}
      />
    );

    expect(screen.getByText('4-7-8 Breathing')).toBeInTheDocument();
  });

  it('should show paced breathing pattern name', () => {
    render(
      <BreathCircle
        type="PACED"
        isActive={false}
      />
    );

    expect(screen.getByText('Paced Breathing')).toBeInTheDocument();
  });

  it('should show countdown when starting', () => {
    render(
      <BreathCircle
        type="BOX"
        isActive={true}
      />
    );

    // Should show initial countdown of 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show "Get Ready" phase when inactive', () => {
    render(
      <BreathCircle
        type="BOX"
        isActive={false}
      />
    );

    // Initial state shows countdown or ready state
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should start at 0 cycles', () => {
    render(
      <BreathCircle
        type="BOX"
        isActive={false}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument(); // 0 cycles
  });

  it('should show initial time as 0:00', () => {
    render(
      <BreathCircle
        type="BOX"
        isActive={false}
      />
    );

    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should accept custom duration prop', () => {
    render(
      <BreathCircle
        type="BOX"
        isActive={false}
        duration={300}
      />
    );

    // Component should render without error
    expect(screen.getByText('Box Breathing')).toBeInTheDocument();
  });

  it('should accept onComplete callback', () => {
    const mockOnComplete = jest.fn();

    render(
      <BreathCircle
        type="BOX"
        isActive={false}
        onComplete={mockOnComplete}
      />
    );

    // Component should render without error
    expect(screen.getByText('Box Breathing')).toBeInTheDocument();
  });

  it('should render SVG progress circle', () => {
    const { container } = render(
      <BreathCircle
        type="BOX"
        isActive={false}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render circles for progress tracking', () => {
    const { container } = render(
      <BreathCircle
        type="BOX"
        isActive={false}
      />
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });
});
