'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from '@/components/motion/MotionUtils';

interface CircleProgressProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  label?: string;
  labelColor?: string;
  animated?: boolean;
  tooltipText?: string;
  onClick?: () => void;
}

export default function CircleProgress({
  score,
  max = 100,
  size = 80,
  strokeWidth = 7,
  color,
  trackColor,
  label,
  labelColor = '#12160F',
  animated = true,
  tooltipText,
  onClick,
}: CircleProgressProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score / max, 0), 1);
  const targetOffset = circumference * (1 - pct);

  const [dashOffset, setDashOffset] = useState(circumference);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!animated || shouldReduceMotion) {
      setDashOffset(targetOffset);
      return;
    }
    const timer = setTimeout(() => setDashOffset(targetOffset), 60);
    return () => clearTimeout(timer);
  }, [animated, targetOffset, shouldReduceMotion]);

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: 1.05, transition: { duration: 0.15 } }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96, transition: { duration: 0.1 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative flex-shrink-0 flex items-center justify-center ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: size, height: size }}
    >
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
            transition: animated && !shouldReduceMotion ? 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
            filter: `drop-shadow(0 0 4px ${color}30)`,
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
          <span style={{ fontSize: `${size * 0.22}px`, fontWeight: 800, color: labelColor, lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
            {label}
          </span>
        </div>
      )}

      {/* Interactive Tooltip on Hover */}
      {tooltipText && isHovered && (
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#12160F] text-white text-[0.62rem] font-bold whitespace-nowrap shadow-md pointer-events-none z-30 animate-fade-in"
        >
          {tooltipText}
        </div>
      )}
    </motion.div>
  );
}
