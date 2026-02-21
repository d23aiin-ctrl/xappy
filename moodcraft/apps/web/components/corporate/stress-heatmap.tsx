'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface DepartmentData {
  id: string;
  name: string;
  stressLevel: number; // 0-100
  participationRate: number; // 0-100
  avgMoodScore: number; // 1-10
  employeeCount: number;
  trend: 'up' | 'down' | 'stable';
}

interface StressHeatmapProps {
  departments: DepartmentData[];
  onDepartmentClick?: (department: DepartmentData) => void;
}

const getStressColor = (level: number) => {
  if (level < 30) return '#10b981'; // Green - Low stress
  if (level < 50) return '#84cc16'; // Lime - Moderate low
  if (level < 65) return '#eab308'; // Yellow - Moderate
  if (level < 80) return '#f97316'; // Orange - High
  return '#ef4444'; // Red - Critical
};

const getStressLabel = (level: number) => {
  if (level < 30) return 'Healthy';
  if (level < 50) return 'Good';
  if (level < 65) return 'Moderate';
  if (level < 80) return 'Elevated';
  return 'Critical';
};

export function StressHeatmap({ departments, onDepartmentClick }: StressHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate grid dimensions based on department count
  const gridSize = useMemo(() => {
    const count = departments.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    return { cols, rows };
  }, [departments.length]);

  useEffect(() => {
    if (!svgRef.current || departments.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 400;
    const padding = 8;
    const cellWidth = (width - padding * (gridSize.cols + 1)) / gridSize.cols;
    const cellHeight = (height - padding * (gridSize.rows + 1)) / gridSize.rows;

    // Create cells
    const cells = svg
      .selectAll('g.cell')
      .data(departments)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (_, i) => {
        const col = i % gridSize.cols;
        const row = Math.floor(i / gridSize.cols);
        const x = padding + col * (cellWidth + padding);
        const y = padding + row * (cellHeight + padding);
        return `translate(${x}, ${y})`;
      })
      .style('cursor', 'pointer')
      .on('click', (_, d) => onDepartmentClick?.(d));

    // Cell background with rounded corners
    cells
      .append('rect')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', (d) => getStressColor(d.stressLevel))
      .attr('opacity', 0.9)
      .transition()
      .duration(800)
      .attr('opacity', 1);

    // Department name
    cells
      .append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight * 0.35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text((d) => d.name);

    // Stress level
    cells
      .append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight * 0.55)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('font-size', '24px')
      .attr('font-weight', '700')
      .text((d) => `${d.stressLevel}%`);

    // Status label
    cells
      .append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight * 0.75)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.7)')
      .attr('font-size', '11px')
      .text((d) => getStressLabel(d.stressLevel));

    // Trend indicator
    cells
      .append('text')
      .attr('x', cellWidth - 16)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text((d) => (d.trend === 'up' ? '↑' : d.trend === 'down' ? '↓' : '→'));

    // Employee count
    cells
      .append('text')
      .attr('x', 16)
      .attr('y', cellHeight - 12)
      .attr('fill', 'rgba(255,255,255,0.6)')
      .attr('font-size', '10px')
      .text((d) => `${d.employeeCount} employees`);

    // Hover effect
    cells
      .on('mouseenter', function () {
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('transform', 'scale(1.02)')
          .attr('transform-origin', 'center');
      })
      .on('mouseleave', function () {
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'scale(1)');
      });

  }, [departments, gridSize, onDepartmentClick]);

  // Calculate organization averages
  const orgStats = useMemo(() => {
    if (departments.length === 0) return { avgStress: 0, participation: 0, mood: 0 };
    const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
    return {
      avgStress: Math.round(
        departments.reduce((sum, d) => sum + d.stressLevel * d.employeeCount, 0) / totalEmployees
      ),
      participation: Math.round(
        departments.reduce((sum, d) => sum + d.participationRate, 0) / departments.length
      ),
      mood: (
        departments.reduce((sum, d) => sum + d.avgMoodScore * d.employeeCount, 0) / totalEmployees
      ).toFixed(1),
    };
  }, [departments]);

  return (
    <div className="bg-gradient-to-br from-midnight-900/50 to-midnight-950/50 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Organizational Stress Heatmap</h3>
          <p className="text-sm text-gray-400">Click a department for detailed insights</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-2xl font-bold ${orgStats.avgStress < 50 ? 'text-green-400' : orgStats.avgStress < 70 ? 'text-amber-400' : 'text-red-400'}`}>
              {orgStats.avgStress}%
            </p>
            <p className="text-xs text-gray-400">Avg Stress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-veil-400">{orgStats.participation}%</p>
            <p className="text-xs text-gray-400">Participation</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">{orgStats.mood}</p>
            <p className="text-xs text-gray-400">Avg Mood</p>
          </div>
        </div>
      </div>

      <svg ref={svgRef} width="100%" height={400} />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
        {[
          { label: 'Healthy', color: '#10b981', range: '0-30%' },
          { label: 'Good', color: '#84cc16', range: '30-50%' },
          { label: 'Moderate', color: '#eab308', range: '50-65%' },
          { label: 'Elevated', color: '#f97316', range: '65-80%' },
          { label: 'Critical', color: '#ef4444', range: '80-100%' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            <div className="text-xs">
              <span className="text-gray-300">{item.label}</span>
              <span className="text-gray-500 ml-1">({item.range})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
