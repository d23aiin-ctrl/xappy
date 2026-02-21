'use client';

import { useCounterAnimation } from '@/hooks';

interface StatCardProps {
  value: string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  const { displayValue, elementRef } = useCounterAnimation(value);

  return (
    <div className="stat-card">
      <div className="stat-value" ref={elementRef as React.RefObject<HTMLDivElement>}>
        {displayValue}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
