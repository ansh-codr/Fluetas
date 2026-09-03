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
  'Nutrition': <Activity size={15} className="text-[#2E7D32]" />,
};

const drillDownRoutes: Record<string, string> = {
  'Overall Wellness': '/timeline',
  'Training': '/workouts',
  'Hydration': '/hydration',
  'Sleep': '/sleep',
  'Nutrition': '/nutrition',
  'Cycle & Recovery': '/cycle-tracker',
  'Recovery': '/cycle-tracker',
};

const fallbackComponents = [
  { label: 'Overall Wellness', score: 0, color: '#2E7D32', status: 'Getting Started', subtext: 'Log telemetry to unlock' },
  { label: 'Hydration', score: 0, color: '#2E6DA4', status: '0L Logged', subtext: 'Target 2.5L / day' },
  { label: 'Sleep', score: 0, color: '#7A4E9E', status: 'No sleep logged', subtext: 'Target 8.0h / night' },
  { label: 'Nutrition', score: 0, color: '#2E7D32', status: '0 meals logged', subtext: 'Log breakfast or meal' },
  { label: 'Training', score: 0, color: '#2E7D32', status: 'No session yet', subtext: 'Start routine' },
];

export default function WellnessRings() {
  const { result, loading, error, reload } = useWellnessScore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const displayComponents = result?.components && result.components.length > 0
    ? result.components
    : fallbackComponents;

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
          {result && (
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
            {displayComponents.slice(1).map(c => (
              <div key={c.label} className="flex items-center gap-2 bg-[#FAFAF6] p-2.5 rounded-xl border border-[rgba(18,22,15,0.06)]">
                <div className="p-1 rounded-lg bg-[#FFFFFF] shadow-2xs">
                  {componentIcons[c.label] || <Activity size={14} className="text-[#2E7D32]" />}
                </div>
                <div>
                  <p className="text-[#586151] text-[0.65rem] m-0">{c.label}</p>
                  <p className="font-bold m-0 text-xs" style={{ color: c.color }}>
                    {c.score !== null && c.score > 0 ? (
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
            Calculated {result.calculatedAt ? result.calculatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'} from {result.dataPointCount || 0} telemetry points
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

      {/* Real Interactive Wellness Snapshot Grid with Drill-Down Navigation */}
      {!loading && (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {displayComponents.map((item, i) => {
            const route = drillDownRoutes[item.label] || '/dashboard';
            const tooltipLabel = item.score !== null && item.score > 0
              ? `${item.label}: ${item.score}/100`
              : `${item.label}: Click to log`;

            return (
              <StaggerItem key={item.label} index={i}>
                <Link
                  href={route}
                  id={`wellness-ring-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                  className="fluetas-card-interactive p-3.5 sm:p-4 flex flex-col items-center gap-2 bg-[#FFFFFF] group no-underline transition-all hover:border-[#2E7D32]/40 hover:shadow-md block h-full border border-[rgba(18,22,15,0.08)] shadow-sm"
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
                    label={item.score !== null && item.score > 0 ? `${item.score}` : '0'}
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
