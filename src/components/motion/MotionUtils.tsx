'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

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
  duration = 500,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
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
  }, [value, duration, shouldReduceMotion]);

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
  color = '#2E7D32',
  height = 6,
  className = '',
  showGlow = false,
}: AnimatedProgressProps) {
  const [width, setWidth] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setWidth(Math.min(Math.max(value, 0), 100));
      return;
    }
    const timeout = setTimeout(() => {
      setWidth(Math.min(Math.max(value, 0), 100));
    }, 40);
    return () => clearTimeout(timeout);
  }, [value, shouldReduceMotion]);

  return (
    <div
      className={`w-full bg-[#F2F4EE] rounded-full overflow-hidden relative ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out relative"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          boxShadow: showGlow ? `0 0 8px ${color}60` : 'none',
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
  trackColor = '#F2F4EE',
  children,
  className = '',
}: AnimatedRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimatedProgress(Math.min(Math.max(progress, 0), 100));
      return;
    }
    const t = setTimeout(() => {
      setAnimatedProgress(Math.min(Math.max(progress, 0), 100));
    }, 40);
    return () => clearTimeout(t);
  }, [progress, shouldReduceMotion]);

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
            transition: shouldReduceMotion ? 'none' : 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 4px ${color}30)`,
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
 * InteractiveCard
 * Micro-interactive card with gentle hover elevation & click feedback.
 */
export function InteractiveCard({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.1 } }}
      onClick={onClick}
      className={`fluetas-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer & StaggerItem
 * Cascading 40-50ms entrance animations utilizing Framer Motion.
 */
export function StaggerContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
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
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.25), // max 250ms delay budget
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Skeleton Loader with subtle shimmer
 */
export function Skeleton({ className = '', height }: { className?: string; height?: string | number }) {
  return (
    <div
      className={`bg-gradient-to-r from-[#F2F4EE] via-[#E5E9DF] to-[#F2F4EE] bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
      style={{ height }}
    />
  );
}
export { motion, AnimatePresence, useReducedMotion };
