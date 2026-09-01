'use client';

import React, { useState } from 'react';
import CircleProgress from '@/components/ui/CircleProgress';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { Info, RefreshCw } from 'lucide-react';

export default function WellnessRings() {
  const { result, loading, error, reload } = useWellnessScore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="section-title">YOUR FLUETAS TODAY</span>
        <div className="flex items-center gap-2">
          {result && !result.insufficientData && (
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1 text-[0.65rem] text-[#8B91B0] hover:text-[#10B981] transition-colors cursor-pointer"
            >
              <Info size={12} />
              Why this score?
            </button>
          )}
          <button onClick={reload} className="text-[#3A3F58] hover:text-[#8B91B0] transition-colors cursor-pointer">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Score Breakdown Tooltip */}
      {showBreakdown && result && (
        <div className="mb-3 p-3 bg-[#13161F] border border-[#1E2133] rounded-xl text-xs animate-slide-up">
          <p className="text-[#8B91B0] font-semibold mb-2 text-[0.68rem] uppercase tracking-wider">Score Breakdown</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {result.components.slice(1).map(c => (
              <div key={c.label} className="flex items-center gap-1.5">
                <span>{c.emoji}</span>
                <div>
                  <p className="text-[#8B91B0] text-[0.62rem] m-0">{c.label}</p>
                  <p className="font-bold m-0" style={{ color: c.color }}>
                    {c.score !== null ? `${c.score}/100` : 'No data'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[#3A3F58] text-[0.6rem] mt-2">
            Calculated {result.calculatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} from {result.dataPointCount} data point{result.dataPointCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 pb-2 sm:pb-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="fluetas-card p-3.5 sm:p-4 flex flex-col items-center gap-2.5 shrink-0 w-[140px] sm:w-auto">
              <div className="w-full h-3 bg-[#1E2133] rounded animate-pulse" />
              <div className="w-20 h-20 bg-[#1E2133] rounded-full animate-pulse" />
              <div className="w-14 h-3 bg-[#1E2133] rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="fluetas-card p-4 text-center">
          <p className="text-[#8B91B0] text-xs">Could not load wellness data.</p>
          <button onClick={reload} className="text-[#10B981] text-xs font-semibold mt-1 cursor-pointer hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Insufficient Data State */}
      {!loading && !error && result?.insufficientData && (
        <div className="fluetas-card p-5 text-center bg-gradient-to-br from-[#13161F] to-[#0B0D14]">
          <p className="text-3xl mb-2">📊</p>
          <p className="font-['Outfit'] font-bold text-[#E8EAF6] text-sm">Not enough data yet</p>
          <p className="text-[#8B91B0] text-xs mt-1">
            Log water, sleep, or a workout to generate your personalized wellness score.
          </p>
          {result.components.filter(c => c.score !== null).length > 0 && (
            <p className="text-[#10B981] text-[0.68rem] mt-2 font-semibold">
              {result.components.filter(c => c.score !== null).length} of 4 data points collected
            </p>
          )}
        </div>
      )}

      {/* Real Wellness Rings */}
      {!loading && !error && result && !result.insufficientData && (
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 pb-2 sm:pb-0 snap-x no-scrollbar">
          {result.components.map((item, i) => (
            <div
              key={item.label}
              id={`wellness-ring-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className="fluetas-card p-3.5 sm:p-4 flex flex-col items-center gap-2.5 shrink-0 w-[140px] sm:w-auto snap-center hover:scale-[1.02] transition-transform duration-200"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-[#8B91B0] text-[0.7rem] font-semibold truncate max-w-[80px]">
                  {item.label}
                </span>
                <span className="text-[0.65rem] opacity-60">📈</span>
              </div>

              <CircleProgress
                score={item.score ?? 0}
                max={100}
                size={76}
                strokeWidth={6.5}
                color={item.color}
                trackColor={`${item.color}20`}
                label={item.score !== null ? `${item.score}` : '—'}
              />

              <div className="text-center -mt-1">
                <p className="text-[#8B91B0] text-[0.6rem] m-0 tracking-wider">/100</p>
              </div>

              <div className="text-center w-full">
                <p className="text-[0.75rem] font-bold m-0 leading-tight font-['Outfit'] truncate" style={{ color: item.color }}>
                  {item.status}
                </p>
                <p className="text-[#8B91B0] text-[0.62rem] m-0 mt-0.5 truncate">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
