'use client';

import React, { useEffect, useState } from 'react';

interface CircleProgressProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  label?: string;
  animated?: boolean;
}

export default function CircleProgress({
  score,
  max = 100,
  size = 80,
  strokeWidth = 7,
  color,
  trackColor,
  label,
  animated = true,
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score / max, 0), 1);
  const targetOffset = circumference * (1 - pct);

  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    if (!animated) {
      setDashOffset(targetOffset);
      return;
    }
    const timer = setTimeout(() => setDashOffset(targetOffset), 100);
    return () => clearTimeout(timer);
  }, [animated, targetOffset]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: animated ? 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      {/* Center label */}
      {label !== undefined && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#E8EAF6', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
