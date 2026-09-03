'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CircleProgress from '@/components/ui/CircleProgress';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { AnimatedNumber, Skeleton, StaggerContainer, StaggerItem } from '@/components/motion/MotionUtils';
import {
  Activity,
  Dumbbell,
  Droplets,
  Moon,
  Zap,
  Info,
  RefreshCw,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const componentIcons: Record<string, React.ReactNode> = {
  'Overall Wellness': <Activity size={15} className="text-[#2E7D32]" />,
  'Training': <Dumbbell size={15} className="text-[#2E7D32]" />,
  'Hydration': <Droplets size={15} className="text-[#2E6DA4]" />,
  'Sleep': <Moon size={15} className="text-[#7A4E9E]" />,
  'Cycle & Recovery': <Zap size={15} className="text-[#D9622B]" />,
  'Recovery': <Zap size={15} className="text-[#D9622B]" />,
};

const drillDownRoutes: Record<string, string> = {
  'Overall Wellness': '/timeline',
  'Training': '/workouts',
  'Hydration': '/hydration',
  'Sleep': '/sleep',
  'Cycle & Recovery': '/cycle-tracker',
  'Recovery': '/cycle-tracker',
};

export default function WellnessRings() {
  const { result, loading, error, reload } = useWellnessScore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="section-title">Today&apos;s Health Snapshot</span>
          {result && !result.insufficientData && (
            <span className="flex items-center gap-1 text-[0.65rem] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded-full border border-[#2E7D32]/20">
              <TrendingUp size={11} />
              Telemetry Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {result && !result.insufficientData && (
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1 text-[0.7rem] text-[#586151] hover:text-[#2E7D32] transition-colors cursor-pointer"
            >
              <Info size={13} />
              Why this score?
            </button>
          )}
          <button
            onClick={reload}
            className="text-[#8A9482] hover:text-[#12160F] transition-colors cursor-pointer p-1 rounded-md hover:bg-[#F2F4EE]"
            aria-label="Refresh telemetry score"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Score Breakdown Tooltip */}
      {showBreakdown && result && (
        <div className="mb-3.5 p-3.5 bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] rounded-2xl text-xs animate-slide-up shadow-sm">
          <p className="text-[#586151] font-bold mb-2 text-[0.68rem] uppercase tracking-wider font-['Outfit']">
            Telemetry Breakdown
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {result.components.slice(1).map(c => (
              <div key={c.label} className="flex items-center gap-2 bg-[#FAFAF6] p-2.5 rounded-xl border border-[rgba(18,22,15,0.06)]">
                <div className="p-1 rounded-lg bg-[#FFFFFF] shadow-2xs">
                  {componentIcons[c.label] || <Activity size={14} className="text-[#2E7D32]" />}
                </div>
                <div>
                  <p className="text-[#586151] text-[0.65rem] m-0">{c.label}</p>
                  <p className="font-bold m-0 text-xs" style={{ color: c.color }}>
                    {c.score !== null ? (
                      <>
                        <AnimatedNumber value={c.score} duration={500} />/100
                      </>
                    ) : (
                      'No data'
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[#8A9482] text-[0.65rem] mt-2">
            Calculated {result.calculatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} from {result.dataPointCount} telemetry points
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="fluetas-card p-4 flex flex-col items-center gap-3">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="fluetas-card p-5 text-center bg-[#FFFFFF]">
          <p className="text-[#586151] text-xs">Could not load wellness telemetry.</p>
          <button onClick={reload} className="text-[#2E7D32] text-xs font-semibold mt-1 cursor-pointer hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Honest Insufficient Data State */}
      {!loading && !error && result?.insufficientData && (
        <div className="fluetas-card p-6 text-center bg-[#FFFFFF] border-[rgba(18,22,15,0.08)]">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mx-auto mb-2.5">
            <Activity size={24} />
          </div>
          <p className="font-['Outfit'] font-bold text-[#12160F] text-base m-0">FLUETAS Score: &mdash;</p>
          <p className="text-xs font-medium text-[#586151] mt-0.5 mb-1">Not enough data yet</p>
          <p className="text-[#8A9482] text-xs max-w-md mx-auto">
            Complete your profile and log your first workout, water, or sleep activity to calculate your personalized wellness score.
          </p>
          {result.components.filter(c => c.score !== null).length > 0 && (
            <p className="text-[#2E7D32] text-xs mt-3 font-semibold">
              {result.components.filter(c => c.score !== null).length} of 4 telemetry points collected today
            </p>
          )}
        </div>
      )}

      {/* Real Interactive Wellness Snapshot Grid with Drill-Down Navigation */}
      {!loading && !error && result && !result.insufficientData && (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {result.components.map((item, i) => {
            const route = drillDownRoutes[item.label] || '/dashboard';
            const tooltipLabel = item.score !== null ? `${item.label}: ${item.score}/100` : `${item.label}: No logs yet`;

            return (
              <StaggerItem key={item.label} index={i}>
                <Link
                  href={route}
                  id={`wellness-ring-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                  className="fluetas-card-interactive p-3.5 sm:p-4 flex flex-col items-center gap-2 bg-[#FFFFFF] group no-underline transition-all hover:border-[#2E7D32]/40 hover:shadow-md block h-full"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1 rounded-md bg-[#FAFAF6] group-hover:bg-[#F2F4EE] transition-colors">
                      {componentIcons[item.label] || <Activity size={14} className="text-[#2E7D32]" />}
                    </div>
                    <span className="text-[#586151] text-[0.6875rem] font-semibold truncate max-w-[85px] group-hover:text-[#12160F]">
                      {item.label}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>

                  <CircleProgress
                    score={item.score ?? 0}
                    max={100}
                    size={72}
                    strokeWidth={6}
                    color={item.color}
                    trackColor={`${item.color}18`}
                    label={item.score !== null ? `${item.score}` : '—'}
                    tooltipText={tooltipLabel}
                  />

                  <div className="text-center -mt-0.5">
                    <p className="text-[#8A9482] text-[0.62rem] m-0 tracking-wider font-mono">
                      <AnimatedNumber value={item.score ?? 0} duration={500} />/100
                    </p>
                  </div>

                  <div className="text-center w-full mt-auto">
                    <p className="text-xs font-bold m-0 leading-tight font-['Outfit'] truncate" style={{ color: item.color }}>
                      {item.status}
                    </p>
                    <p className="text-[#586151] text-[0.62rem] m-0 mt-0.5 truncate flex items-center justify-center gap-0.5">
                      {item.subtext}
                      <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2E7D32]" />
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </section>
  );
}
