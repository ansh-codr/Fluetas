'use client';

import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;   // 0–100
  color: string;
  height?: number;
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  color,
  height = 6,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animated) {
      setWidth(Math.min(Math.max(value, 0), 100));
      return;
    }
    const t = setTimeout(() => setWidth(Math.min(Math.max(value, 0), 100)), 80);
    return () => clearTimeout(t);
  }, [animated, value]);

  return (
    <div
      className={`fluetas-progress-track ${className}`}
      style={{ height }}
    >
      <div
        className="fluetas-progress-fill"
        style={{
          width: `${width}%`,
          background: color,
          boxShadow: `0 0 8px ${color}50`,
        }}
      />
    </div>
  );
}
