/**
 * CereBro Web App - Mood Chart Tests
 *
 * Tests for the mood trend chart component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

import { MoodChart } from '@/components/mood/mood-chart';

describe('MoodChart', () => {
  const mockData = [
    { date: '2024-01-01', moodScore: 7, emoji: '😊' },
    { date: '2024-01-02', moodScore: 5, emoji: '😐' },
    { date: '2024-01-03', moodScore: 8, emoji: '😄' },
    { date: '2024-01-04', moodScore: 6, emoji: '🙂' },
    { date: '2024-01-05', moodScore: 4, emoji: '😔' },
  ];

  const mockDataWithScores = [
    { date: '2024-01-01', moodScore: 7, phq9Score: 5, gad7Score: 4 },
    { date: '2024-01-02', moodScore: 5, phq9Score: 8, gad7Score: 6 },
    { date: '2024-01-03', moodScore: 8, phq9Score: 3, gad7Score: 2 },
  ];

  describe('rendering', () => {
    it('should render empty state when no data', () => {
      render(<MoodChart data={[]} />);

      expect(screen.getByText(/no mood data yet/i)).toBeInTheDocument();
    });

    it('should render chart with data', () => {
      render(<MoodChart data={mockData} />);

      expect(screen.getByText('Mood Trend')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should show legend items', () => {
      render(<MoodChart data={mockData} showPHQ9={true} showGAD7={true} />);

      expect(screen.getByText('Mood')).toBeInTheDocument();
      expect(screen.getByText('PHQ-9')).toBeInTheDocument();
      expect(screen.getByText('GAD-7')).toBeInTheDocument();
    });

    it('should hide PHQ-9 legend when disabled', () => {
      render(<MoodChart data={mockData} showPHQ9={false} showGAD7={true} />);

      expect(screen.getByText('Mood')).toBeInTheDocument();
      expect(screen.queryByText('PHQ-9')).not.toBeInTheDocument();
      expect(screen.getByText('GAD-7')).toBeInTheDocument();
    });

    it('should hide GAD-7 legend when disabled', () => {
      render(<MoodChart data={mockData} showPHQ9={true} showGAD7={false} />);

      expect(screen.getByText('Mood')).toBeInTheDocument();
      expect(screen.getByText('PHQ-9')).toBeInTheDocument();
      expect(screen.queryByText('GAD-7')).not.toBeInTheDocument();
    });
  });

  describe('statistics', () => {
    it('should calculate and display average mood', () => {
      render(<MoodChart data={mockData} />);

      // Average of [7, 5, 8, 6, 4] = 6.0
      expect(screen.getByText('6.0')).toBeInTheDocument();
      expect(screen.getByText('Avg Mood')).toBeInTheDocument();
    });

    it('should display highest mood', () => {
      render(<MoodChart data={mockData} />);

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Highest')).toBeInTheDocument();
    });

    it('should display lowest mood', () => {
      render(<MoodChart data={mockData} />);

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Lowest')).toBeInTheDocument();
    });
  });

  describe('data handling', () => {
    it('should handle single data point', () => {
      const singleData = [{ date: '2024-01-01', moodScore: 7 }];
      render(<MoodChart data={singleData} />);

      expect(screen.getByText('Mood Trend')).toBeInTheDocument();
      expect(screen.getByText('7.0')).toBeInTheDocument(); // Avg
    });

    it('should handle data with PHQ-9 and GAD-7 scores', () => {
      render(<MoodChart data={mockDataWithScores} showPHQ9={true} showGAD7={true} />);

      expect(screen.getByText('Mood Trend')).toBeInTheDocument();
    });

    it('should handle data without emoji', () => {
      const dataNoEmoji = [
        { date: '2024-01-01', moodScore: 7 },
        { date: '2024-01-02', moodScore: 5 },
      ];
      render(<MoodChart data={dataNoEmoji} />);

      expect(screen.getByText('Mood Trend')).toBeInTheDocument();
    });
  });

  describe('responsive container', () => {
    it('should render in responsive container', () => {
      render(<MoodChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });
});
