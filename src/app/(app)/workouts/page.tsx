'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getRecentWorkoutSessions,
  getWorkoutTrend,
  WorkoutSession,
  WorkoutTrendSummary,
} from '@/lib/services/workoutService';
import {
  Dumbbell,
  Flame,
  Clock,
  Plus,
  TrendingUp,
  Filter,
  Play,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'strength' | 'hypertrophy' | 'cardio'>('all');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [trend, setTrend] = useState<WorkoutTrendSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([
      getRecentWorkoutSessions(user.uid, 20),
      getWorkoutTrend(user.uid, 7),
    ])
      .then(([recent, tr]) => {
        setSessions(recent);
        setTrend(tr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const filteredSessions = filter === 'all'
    ? sessions
    : sessions.filter(s => (s.workoutType || '').toLowerCase().includes(filter));

  const chartData = trend?.days.map(d => ({
    day: d.dayLabel,
    volume: Math.round(d.estimatedVolumeKg / 100) / 10, // in hundreds of kg
    sets: d.completedSets,
    sessions: d.sessionCount,
  })) || [];

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            WORKOUT LOGS &amp; TRAINING VOLUME
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Track weightlifting metrics, volume progression, and daily metabolic burn.
          </p>
        </div>

        <Link
          href="/fluetas-train"
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto no-underline shadow-sm"
        >
          <Play size={14} fill="currentColor" />
          Open Live Workout Engine
        </Link>
      </div>

      {/* Volume Progression Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2E7D32]" />
            <span className="section-title">7-DAY WORKOUT LOAD &amp; SETS</span>
          </div>
          {trend && (
            <span className="text-xs font-bold text-[#2E7D32]">
              {trend.totalSessions} Sessions · {trend.totalCompletedSets} Sets Logged
            </span>
          )}
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,22,15,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="#8A9482" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A9482" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(18,22,15,0.15)', borderRadius: '12px', color: '#12160F', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="sets" name="Completed Sets" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout History List with Type Filter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="section-title">LOGGED WORKOUTS ({filteredSessions.length})</span>

          <div className="flex items-center gap-1.5 bg-[#F2F4EE] p-1 rounded-lg border border-[rgba(18,22,15,0.10)]">
            <Filter size={12} className="text-[#586151] ml-1.5" />
            {[
              { id: 'all', label: 'All' },
              { id: 'strength', label: 'Strength' },
              { id: 'hypertrophy', label: 'Hypertrophy' },
              { id: 'cardio', label: 'Cardio' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-[#2E7D32] text-white font-bold shadow-xs'
                    : 'text-[#586151] hover:text-[#12160F]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-[#F2F4EE] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="fluetas-card p-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-3">
              <Dumbbell size={26} />
            </div>
            <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">No workout sessions recorded</h3>
            <p className="text-xs text-[#586151] m-0 mt-1 max-w-sm">
              Launch FLUETAS Train to track your sets with real-time video guidance and progression suggestions.
            </p>
            <Link
              href="/fluetas-train"
              className="btn-primary mt-4 flex items-center gap-2 px-5 py-2.5 text-xs font-bold no-underline"
            >
              <Play size={14} fill="currentColor" /> Start Workout
            </Link>
          </div>
        ) : (
          filteredSessions.map(w => (
            <div
              key={w.id}
              className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/20 flex items-center justify-center text-lg text-[#2E7D32] shrink-0">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
                      {w.workoutName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32]">
                      {w.workoutType}
                    </span>
                  </div>
                  <p className="text-xs text-[#586151] m-0 mt-1">
                    {w.date} · {w.exercises?.length || 0} Exercises · {w.completedSets || 0}/{w.totalSets || 0} Sets
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-xs text-[#586151] self-end sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#2E6DA4]" />
                  <span className="text-[#12160F] font-semibold">{w.durationMins ? `${w.durationMins} min` : 'Completed'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-[#D9622B]" />
                  <span className="text-[#12160F] font-semibold">{Math.round((w.completedSets || 0) * 22)} kcal</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
