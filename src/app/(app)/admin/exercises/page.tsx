'use client';

import React, { useState } from 'react';
import { FALLBACK_EXERCISES } from '@/lib/exercises/fallbackCatalog';
import { Exercise } from '@/lib/exercises/types';
import {
  Dumbbell,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Edit,
  Video,
} from 'lucide-react';

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>(FALLBACK_EXERCISES);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  const muscles = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

  const filtered = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.equipment.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || e.muscleGroups.includes(selectedMuscle);
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#D9622B]/10 text-[#D9622B] flex items-center justify-center font-bold">
              <Dumbbell size={18} />
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              EXERCISE CONTENT &amp; PROVIDER MANAGEMENT
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Manage exercise library metadata, target muscle mappings, and video streaming providers.
          </p>
        </div>
      </div>

      {/* Search & Muscle Filters */}
      <div className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[rgba(18,22,15,0.08)]">
        <div className="flex items-center gap-2.5 bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] rounded-xl px-3.5 py-2 flex-1 max-w-md">
          <Search size={15} className="text-[#8A9482] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises by movement or equipment..."
            className="bg-transparent border-none outline-none text-xs text-[#12160F] placeholder-[#8A9482] w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {muscles.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedMuscle === m
                  ? 'bg-[#12160F] text-white shadow-xs'
                  : 'bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] text-[#586151] hover:text-[#12160F] hover:bg-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Table */}
      <div className="fluetas-card p-5 overflow-x-auto bg-white border border-[rgba(18,22,15,0.08)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[rgba(18,22,15,0.08)] text-[#586151] uppercase text-[0.65rem] tracking-wider font-bold">
              <th className="pb-3">Exercise Movement</th>
              <th className="pb-3">Muscle Group</th>
              <th className="pb-3">Equipment</th>
              <th className="pb-3">Difficulty</th>
              <th className="pb-3">Stream Provider</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(18,22,15,0.06)]">
            {filtered.map(ex => (
              <tr key={ex.id} className="hover:bg-[#FAFAF6] transition-colors">
                <td className="py-3.5 pr-3 font-bold text-[#12160F] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] flex items-center justify-center text-sm shrink-0">
                    🏋️
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#12160F]">{ex.name}</span>
                    <span className="text-[0.68rem] text-[#586151] font-normal block">{ex.exerciseType}</span>
                  </div>
                </td>
                <td className="py-3.5 pr-3 text-[#2E6DA4] font-medium text-xs">
                  {ex.muscleGroups.join(', ')}
                </td>
                <td className="py-3.5 pr-3 text-[#586151] font-medium text-xs">
                  {ex.equipment}
                </td>
                <td className="py-3.5 pr-3">
                  <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                    ex.difficulty === 'Beginner'
                      ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                      : ex.difficulty === 'Intermediate'
                      ? 'bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/20'
                      : 'bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/20'
                  }`}>
                    {ex.difficulty}
                  </span>
                </td>
                <td className="py-3.5 pr-3 text-[#2E7D32] font-mono text-[0.68rem] font-bold">
                  YourMove (CDN)
                </td>
                <td className="py-3.5 text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/25">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
