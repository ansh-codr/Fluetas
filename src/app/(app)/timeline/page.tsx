'use client';

import React, { useState } from 'react';
import { useTimeline, TimelineEventDoc } from '@/hooks/useTimeline';
import {
  Activity,
  Droplets,
  Moon,
  Utensils,
  Dumbbell,
  Heart,
  FileText,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const EVENT_CONFIGS: Record<string, { icon: React.ElementType; color: string; badgeColor: string }> = {
  hydration_logged:       { icon: Droplets,   color: '#38BDF8', badgeColor: '#0C4A6E' },
  sleep_logged:           { icon: Moon,        color: '#A78BFA', badgeColor: '#3B0764' },
  meal_logged:            { icon: Utensils,    color: '#22C55E', badgeColor: '#14532D' },
  workout_completed:      { icon: Dumbbell,    color: '#10B981', badgeColor: '#064E3B' },
  cycle_logged:           { icon: Heart,       color: '#F472B6', badgeColor: '#831843' },
  symptom_logged:         { icon: Activity,    color: '#FB923C', badgeColor: '#7C2D12' },
  consultation_booked:    { icon: FileText,    color: '#38BDF8', badgeColor: '#0C4A6E' },
  consultation_completed: { icon: FileText,    color: '#10B981', badgeColor: '#064E3B' },
  report_uploaded:        { icon: FileText,    color: '#FBBF24', badgeColor: '#78350F' },
  profile_created:        { icon: Sparkles,    color: '#10B981', badgeColor: '#064E3B' },
};

function formatTimestamp(ts: { seconds: number }): string {
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function groupByDate(events: TimelineEventDoc[]): Map<string, TimelineEventDoc[]> {
  const groups = new Map<string, TimelineEventDoc[]>();
  for (const e of events) {
    const d = new Date(e.timestamp.seconds * 1000);
    const key = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const existing = groups.get(key) ?? [];
    existing.push(e);
    groups.set(key, existing);
  }
  return groups;
}

export default function TimelinePage() {
  const { events, loading, error } = useTimeline(100);
  const [visibleCount, setVisibleCount] = useState(20);

  const visibleEvents = events.slice(0, visibleCount);
  const grouped = groupByDate(visibleEvents);

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
          HEALTH JOURNEY TIMELINE
        </h1>
        <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
          A complete, chronological record of your health and wellness activities.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E2133] animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="h-3 bg-[#1E2133] rounded animate-pulse w-2/3" />
                <div className="h-2.5 bg-[#1E2133] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-4 text-center fluetas-card">
          <p className="text-[#8B91B0] text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && events.length === 0 && (
        <div className="fluetas-card p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center">
            <Activity size={28} className="text-[#10B981]" />
          </div>
          <div>
            <p className="font-['Outfit'] font-bold text-[#E8EAF6] text-base m-0">
              Your health journey starts here
            </p>
            <p className="text-[#8B91B0] text-xs m-0 mt-2 max-w-xs mx-auto">
              Log water intake, meals, sleep, or start a workout — every action will appear here as a permanent record of your progress.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {[
              { label: '💧 Log Hydration', href: '/hydration' },
              { label: '🥗 Log Meal', href: '/nutrition' },
              { label: '🌙 Log Sleep', href: '/sleep' },
              { label: '🏋️ Start Workout', href: '/fluetas-train' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold hover:opacity-80 transition-all no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && events.length > 0 && (
        <div className="flex flex-col gap-6">
          {[...grouped.entries()].map(([dateLabel, dayEvents]) => (
            <div key={dateLabel}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 rounded-full bg-[#13161F] border border-[#1E2133] text-[0.68rem] font-bold text-[#8B91B0]">
                  {dateLabel}
                </div>
                <div className="flex-1 h-px bg-[#1E2133]" />
                <span className="text-[0.6rem] text-[#3A3F58]">{dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}</span>
              </div>

              {/* Events for this day */}
              <div className="flex flex-col gap-2.5">
                {dayEvents.map((event, idx) => {
                  const cfg = EVENT_CONFIGS[event.type] ?? { icon: Activity, color: '#8B91B0', badgeColor: '#1E2133' };
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={event.id}
                      id={`timeline-event-${event.id}`}
                      className="fluetas-card p-3.5 sm:p-4 flex items-start gap-3 hover:border-[#2A3050] transition-all"
                    >
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                      >
                        <Icon size={15} style={{ color: cfg.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0 truncate">
                              {event.title}
                            </h3>
                            {event.badge && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[0.55rem] font-bold"
                                style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                              >
                                {event.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[0.6rem] text-[#3A3F58] shrink-0">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-[#8B91B0] m-0 mt-1">{event.description}</p>
                        {event.category && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[0.6rem] font-semibold bg-[#1E2133] text-[#3A3F58]">
                            {event.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load More */}
          {visibleCount < events.length && (
            <button
              onClick={() => setVisibleCount(c => c + 20)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] text-xs font-semibold transition-all cursor-pointer hover:border-[#2A3050]"
            >
              <ChevronDown size={15} />
              Load More ({events.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
