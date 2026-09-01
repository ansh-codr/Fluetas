'use client';

import React, { useEffect, useState, useRef } from 'react';

/**
 * AnimatedNumber
 * Smoothly counts from 0 (or previous value) to target value using requestAnimationFrame.
 * Automatically respects prefers-reduced-motion.
 */
interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    // If reduced motion is preferred, jump straight to target value
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    const startVal = prevValueRef.current;
    const endVal = value;
    const startTime = performance.now();

    let animationFrameId: number;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        prevValueRef.current = endVal;
        setDisplayValue(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span className={`tabular-nums transition-colors ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

/**
 * AnimatedProgress
 * Smoothly animates width fill with glowing tip.
 */
interface AnimatedProgressProps {
  value: number; // 0 to 100
  color?: string;
  height?: number;
  className?: string;
  showGlow?: boolean;
}

export function AnimatedProgress({
  value,
  color = '#10B981',
  height = 6,
  className = '',
  showGlow = true,
}: AnimatedProgressProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate on mount or value change
    const timeout = setTimeout(() => {
      setWidth(Math.min(Math.max(value, 0), 100));
    }, 50);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div
      className={`w-full bg-[#1E2133] rounded-full overflow-hidden relative ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out relative"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          boxShadow: showGlow ? `0 0 10px ${color}60` : 'none',
        }}
      />
    </div>
  );
}

/**
 * AnimatedRing
 * SVG Circular Progress Ring with smooth dashoffset animation.
 */
interface AnimatedRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 100
  color: string;
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AnimatedRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = '#1E2133',
  children,
  className = '',
}: AnimatedRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimatedProgress(Math.min(Math.max(progress, 0), 100));
    }, 60);
    return () => clearTimeout(t);
  }, [progress]);

  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${color}50)`,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * WaterLevelIndicator
 * Calm water-level fluid visualization for hydration tracking.
 */
interface WaterLevelProps {
  currentLiters: number;
  targetLiters: number;
  className?: string;
}

export function WaterLevelIndicator({ currentLiters, targetLiters, className = '' }: WaterLevelProps) {
  const percentage = Math.min(Math.round((currentLiters / targetLiters) * 100), 100);

  return (
    <div className={`relative w-full h-24 bg-[#0B0D14] border border-[#1E2133] rounded-xl overflow-hidden flex flex-col justify-end p-2.5 ${className}`}>
      {/* Calm Water Layer */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#38BDF8]/40 via-[#38BDF8]/25 to-[#38BDF8]/10 transition-all duration-700 ease-out border-t border-[#38BDF8]/40"
        style={{ height: `${percentage}%` }}
      >
        {/* Subtle Wave Crest */}
        <div className="w-full h-1 bg-[#38BDF8]/30 animate-pulse" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <div>
          <span className="text-[0.65rem] text-[#8B91B0] block uppercase font-bold">Fluid Level</span>
          <span className="text-[#38BDF8] font-bold text-sm">
            <AnimatedNumber value={currentLiters} decimals={1} duration={600} />L
          </span>
          <span className="text-[#8B91B0] text-[0.7rem]"> / {targetLiters}L</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
          <AnimatedNumber value={percentage} suffix="%" duration={600} />
        </span>
      </div>
    </div>
  );
}

/**
 * StaggerContainer & StaggerItem
 * Cascading 50-80ms entrance animations.
 */
export function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  index = 0,
  className = '',
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const delay = index * 60; // 60ms stagger per item
  return (
    <div
      className={`animate-slide-up ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

/**
 * Skeleton Loader with subtle shimmer
 */
export function Skeleton({ className = '', height }: { className?: string; height?: string | number }) {
  return (
    <div
      className={`bg-gradient-to-r from-[#13161F] via-[#1E2133]/60 to-[#13161F] bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
      style={{ height }}
    />
  );
}
