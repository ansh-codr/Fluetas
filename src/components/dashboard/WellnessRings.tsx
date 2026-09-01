'use client';

import React from 'react';
import CircleProgress from '@/components/ui/CircleProgress';
import { mockWellnessScores } from '@/lib/mock/dashboardData';

export default function WellnessRings() {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="section-title">YOUR FLUETAS TODAY</span>
        <span className="text-[0.65rem] text-[#8B91B0] font-medium hidden sm:inline">
          Live Biomarkers & Vitals Sync
        </span>
      </div>

      {/* Responsive Container: Horizontally Swipeable on Mobile, Grid on Tablet/Desktop */}
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 pb-2 sm:pb-0 snap-x no-scrollbar">
        {mockWellnessScores.map((item, i) => (
          <div
            key={item.id}
            id={`wellness-ring-${item.id}`}
            className="fluetas-card p-3.5 sm:p-4 flex flex-col items-center gap-2.5 shrink-0 w-[140px] sm:w-auto snap-center hover:scale-[1.02] transition-transform duration-200"
            style={{
              animationDelay: `${i * 70}ms`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full">
              <span className="text-sm">{item.emoji}</span>
              <span className="text-[#8B91B0] text-[0.7rem] font-semibold truncate max-w-[80px]">
                {item.label}
              </span>
              <span className="text-[0.65rem] opacity-60">📈</span>
            </div>

            {/* Ring */}
            <CircleProgress
              score={item.score}
              max={item.max}
              size={76}
              strokeWidth={6.5}
              color={item.color}
              trackColor={item.trackColor}
              label={`${item.score}`}
            />

            {/* Score */}
            <div className="text-center -mt-1">
              <p className="text-[#8B91B0] text-[0.6rem] m-0 tracking-wider">
                /{item.max}
              </p>
            </div>

            {/* Status */}
            <div className="text-center w-full">
              <p
                className="text-[0.75rem] font-bold m-0 leading-tight font-['Outfit'] truncate"
                style={{ color: item.color }}
              >
                {item.status}
              </p>
              <p className="text-[#8B91B0] text-[0.62rem] m-0 mt-0.5 truncate">
                {item.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
