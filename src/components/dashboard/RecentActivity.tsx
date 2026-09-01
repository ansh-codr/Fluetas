'use client';

import React from 'react';
import Link from 'next/link';
import { useTimeline, TimelineEventDoc } from '@/hooks/useTimeline';
import { Activity, Droplets, Moon, Utensils, Dumbbell, Heart, FileText, Sparkles } from 'lucide-react';

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  hydration_logged: { icon: Droplets, color: '#38BDF8' },
  sleep_logged: { icon: Moon, color: '#A78BFA' },
  meal_logged: { icon: Utensils, color: '#22C55E' },
  workout_completed: { icon: Dumbbell, color: '#10B981' },
  cycle_logged: { icon: Heart, color: '#F472B6' },
  symptom_logged: { icon: Activity, color: '#FB923C' },
  consultation_booked: { icon: FileText, color: '#38BDF8' },
  consultation_completed: { icon: FileText, color: '#10B981' },
  profile_created: { icon: Sparkles, color: '#10B981' },
};

function formatTimestamp(ts: { seconds: number }): string {
  const d = new Date(ts.seconds * 1000);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function RecentActivity() {
  const { events, loading, error } = useTimeline(6);

  return (
    <div className="fluetas-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="section-title">RECENT ACTIVITY</span>
        <Link href="/timeline" className="text-[0.65rem] text-[#10B981] font-semibold hover:underline no-underline">
          View All
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1E2133] animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-2.5 bg-[#1E2133] rounded animate-pulse w-3/4" />
                <div className="h-2 bg-[#1E2133] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-[#8B91B0] text-xs text-center py-3">Failed to load activity.</p>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <p className="text-2xl mb-1.5">🌱</p>
          <p className="text-xs font-semibold text-[#E8EAF6] m-0">Your journey starts here</p>
          <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-1">Log water, meals, or a workout to see activity here.</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {events.map(event => {
            const cfg = EVENT_ICONS[event.type] ?? { icon: Activity, color: '#8B91B0' };
            const Icon = cfg.icon;
            return (
              <div key={event.id} className="flex items-start gap-2.5 group">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${cfg.color}15` }}
                >
                  <Icon size={13} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-[#E8EAF6] m-0 leading-tight truncate">
                      {event.title}
                    </p>
                    <span className="text-[0.6rem] text-[#3A3F58] shrink-0 ml-1">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-0.5 truncate">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
