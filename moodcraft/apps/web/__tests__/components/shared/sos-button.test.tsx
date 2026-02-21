/**
 * CereBro Web App - SOS Button Tests
 *
 * Tests for the always-visible crisis SOS button.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SOSButton } from '@/components/shared/sos-button';

describe('SOSButton', () => {
  it('should render the SOS button', () => {
    render(<SOSButton />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  it('should have accessible title on button', () => {
    render(<SOSButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Get Help');
  });

  it('should link to escalation page', () => {
    render(<SOSButton />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/escalation');
  });

  it('should have fixed positioning', () => {
    render(<SOSButton />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('fixed');
  });

  it('should be visible (high z-index)', () => {
    render(<SOSButton />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('z-50');
  });

  it('should have alert icon', () => {
    render(<SOSButton />);

    // Should contain an icon (SVG)
    const button = screen.getByRole('button');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should have destructive styling', () => {
    render(<SOSButton />);

    const button = screen.getByRole('button');
    // Button uses variant="destructive" which adds specific classes
    expect(button.className).toContain('destructive');
  });
});
