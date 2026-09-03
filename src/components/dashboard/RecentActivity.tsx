'use client';

import React from 'react';
import Link from 'next/link';
import { useTimeline } from '@/hooks/useTimeline';
import {
  Activity,
  Droplets,
  Moon,
  Utensils,
  Dumbbell,
  Heart,
  FileText,
  Sparkles,
  ArrowRight,
  History,
  LucideIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/motion/MotionUtils';

const EVENT_ICONS: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  hydration_logged: { icon: Droplets, color: '#2E6DA4', bg: 'bg-[#2E6DA4]/10' },
  sleep_logged: { icon: Moon, color: '#7A4E9E', bg: 'bg-[#7A4E9E]/10' },
  meal_logged: { icon: Utensils, color: '#D9622B', bg: 'bg-[#D9622B]/10' },
  workout_completed: { icon: Dumbbell, color: '#2E7D32', bg: 'bg-[#2E7D32]/10' },
  cycle_logged: { icon: Heart, color: '#C23B6B', bg: 'bg-[#C23B6B]/10' },
  symptom_logged: { icon: Activity, color: '#D9622B', bg: 'bg-[#D9622B]/10' },
  consultation_booked: { icon: FileText, color: '#2E6DA4', bg: 'bg-[#2E6DA4]/10' },
  consultation_completed: { icon: FileText, color: '#2E7D32', bg: 'bg-[#2E7D32]/10' },
  profile_created: { icon: Sparkles, color: '#2E7D32', bg: 'bg-[#2E7D32]/10' },
  report_uploaded: { icon: FileText, color: '#D9622B', bg: 'bg-[#D9622B]/10' },
  report_reviewed: { icon: FileText, color: '#2E7D32', bg: 'bg-[#2E7D32]/10' },
  recommendation_added: { icon: Sparkles, color: '#7A4E9E', bg: 'bg-[#7A4E9E]/10' },
  followup_scheduled: { icon: Activity, color: '#2E6DA4', bg: 'bg-[#2E6DA4]/10' },
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
    <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between gap-3 h-full bg-[#FFFFFF]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <History size={13} className="text-[#2E7D32]" />
            <span className="section-title">Recent Activity</span>
          </div>
          <Link href="/timeline" className="text-[0.65rem] text-[#2E7D32] font-semibold hover:underline no-underline">
            View All →
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-3/4" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-[#586151] text-xs text-center py-3">Could not load recent telemetry stream.</p>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
            <div className="w-9 h-9 rounded-full bg-[#E8ECE2] flex items-center justify-center text-[#586151] mb-2">
              <Activity size={16} />
            </div>
            <p className="text-xs font-bold text-[#12160F] m-0">Your journey starts here</p>
            <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5 max-w-[180px]">
              Log workouts, hydration, or sleep to see your live timeline stream.
            </p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {events.map((event, idx) => {
              const cfg = EVENT_ICONS[event.type] ?? { icon: Activity, color: '#586151', bg: 'bg-[#586151]/10' };
              const Icon = cfg.icon;
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-[#FAFAF6] hover:bg-[#FFFFFF] border border-[rgba(18,22,15,0.04)] hover:border-[rgba(18,22,15,0.12)] transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
                >
                  <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={13} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-[#12160F] m-0 leading-tight truncate">
                        {event.title}
                      </p>
                      <span className="text-[0.62rem] text-[#8A9482] shrink-0 font-mono">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5 truncate">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link
        href="/timeline"
        className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] hover:bg-[#FAFAF6] text-xs font-semibold transition-all no-underline"
      >
        <span>Open Health Timeline</span>
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}
