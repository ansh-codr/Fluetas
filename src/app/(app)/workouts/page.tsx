'use client';

import React, { useState } from 'react';
import { mockWorkoutHistory } from '@/lib/mock/dashboardData';
import {
  Dumbbell,
  Flame,
  Clock,
  Plus,
  TrendingUp,
  Filter,
  CheckCircle2,
  X,
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

const volumeChartData = [
  { day: 'Mon', volume: 7.2, calories: 420 },
  { day: 'Tue', volume: 8.9, calories: 510 },
  { day: 'Wed', volume: 3.4, calories: 310 },
  { day: 'Thu', volume: 6.8, calories: 390 },
  { day: 'Fri', volume: 7.4, calories: 430 },
  { day: 'Sat', volume: 5.1, calories: 350 },
  { day: 'Sun', volume: 2.0, calories: 180 },
];

export default function WorkoutsPage() {
  const [filter, setFilter] = useState<'all' | 'strength' | 'cardio' | 'functional'>('all');
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logs, setLogs] = useState(mockWorkoutHistory);

  // New Workout Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Strength');
  const [duration, setDuration] = useState('45 min');
  const [calories, setCalories] = useState('350');

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    setLogs([
      {
        id: `w-${Date.now()}`,
        date: 'Just now',
        title: title || 'Custom Workout Session',
        type: type,
        duration: duration,
        calories: Number(calories) || 300,
        volume: '5,200 kg',
        status: 'Completed',
        exercises: 5,
      },
      ...logs,
    ]);
    setLogModalOpen(false);
    setTitle('');
  };

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(l => l.type.toLowerCase().includes(filter));

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            WORKOUT LOGS & TRAINING VOLUME
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Track weightlifting metrics, volume progression, and daily metabolic burn.
          </p>
        </div>

        <button
          onClick={() => setLogModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          Log Past Workout
        </button>
      </div>

      {/* Volume Progression Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#10B981]" />
            <span className="section-title">WEEKLY VOLUME LOAD (TONNAGE)</span>
          </div>
          <span className="text-xs font-bold text-[#10B981]">Total: 40.8 Tons</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" vertical={false} />
              <XAxis dataKey="day" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                cursor={{ fill: 'rgba(16,185,129,0.05)' }}
              />
              <Bar dataKey="volume" name="Volume (Tons)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout History List with Type Filter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="section-title">LOGGED WORKOUTS ({filteredLogs.length})</span>

          <div className="flex items-center gap-1.5 bg-[#13161F] p-1 rounded-lg border border-[#1E2133]">
            <Filter size={12} className="text-[#8B91B0] ml-1.5" />
            {[
              { id: 'all', label: 'All' },
              { id: 'strength', label: 'Strength' },
              { id: 'cardio', label: 'Cardio' },
              { id: 'functional', label: 'Functional' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-[#10B981] text-black font-bold'
                    : 'text-[#8B91B0] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.map(w => (
          <div
            key={w.id}
            className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2A3050] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10 border border-[#10B981]/30 flex items-center justify-center text-lg text-[#10B981] shrink-0">
                <Dumbbell size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0">
                    {w.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#10B981]/15 text-[#10B981]">
                    {w.type}
                  </span>
                </div>
                <p className="text-xs text-[#8B91B0] m-0 mt-1">
                  {w.date} · {w.exercises} Exercises Logged
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-xs text-[#8B91B0] self-end sm:self-auto">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#38BDF8]" />
                <span className="text-[#E8EAF6] font-semibold">{w.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame size={14} className="text-[#FB923C]" />
                <span className="text-[#E8EAF6] font-semibold">{w.calories} kcal</span>
              </div>
              {w.volume !== '-' && (
                <div className="hidden xs:flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#A78BFA]" />
                  <span className="text-[#E8EAF6] font-semibold">{w.volume}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Log Workout Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setLogModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B91B0] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#E8EAF6] mb-4 font-['Outfit'] flex items-center gap-2">
              <Dumbbell size={18} className="text-[#10B981]" />
              Log Completed Workout
            </h3>

            <form onSubmit={handleAddWorkout} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Session Title</label>
                <input
                  required
                  placeholder="e.g. Leg Day & Romanian Deadlifts"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                  >
                    <option>Strength</option>
                    <option>Cardio</option>
                    <option>Functional</option>
                    <option>Recovery / Physio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Duration</label>
                  <input
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Calories Burned (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 justify-center font-bold mt-2"
              >
                Save to Workout Logs
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
