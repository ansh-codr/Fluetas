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
            <Dumbbell size={20} className="text-[#A78BFA]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              EXERCISE CONTENT &amp; PROVIDER MANAGEMENT
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Manage exercise library metadata, target muscle mappings, and external API provider configurations.
          </p>
        </div>
      </div>

      {/* Search & Muscle Filters */}
      <div className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search size={14} className="text-[#8B91B0] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises by movement or apparatus..."
            className="bg-transparent border-none outline-none text-xs text-[#E8EAF6] w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {muscles.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedMuscle === m
                  ? 'bg-[#A78BFA] text-black font-bold'
                  : 'bg-[#0B0D14] border border-[#1E2133] text-[#8B91B0] hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Table */}
      <div className="fluetas-card p-5 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2133] text-[#8B91B0] uppercase text-[0.65rem] tracking-wider">
              <th className="pb-3 font-semibold">Exercise Movement</th>
              <th className="pb-3 font-semibold">Muscle Group</th>
              <th className="pb-3 font-semibold">Equipment</th>
              <th className="pb-3 font-semibold">Difficulty</th>
              <th className="pb-3 font-semibold">Stream Provider</th>
              <th className="pb-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2133]">
            {filtered.map(ex => (
              <tr key={ex.id} className="hover:bg-[#13161F]/50 transition-colors">
                <td className="py-3.5 pr-3 font-bold text-[#E8EAF6] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0B0D14] border border-[#1E2133] flex items-center justify-center text-sm shrink-0">
                    🏋️
                  </div>
                  <div>
                    <span>{ex.name}</span>
                    <span className="text-[0.65rem] text-[#8B91B0] block">{ex.exerciseType}</span>
                  </div>
                </td>
                <td className="py-3.5 pr-3 text-[#38BDF8] font-medium">
                  {ex.muscleGroups.join(', ')}
                </td>
                <td className="py-3.5 pr-3 text-[#8B91B0]">{ex.equipment}</td>
                <td className="py-3.5 pr-3">
                  <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-[#1E2133] text-[#E8EAF6]">
                    {ex.difficulty}
                  </span>
                </td>
                <td className="py-3.5 pr-3 text-[#10B981] font-mono text-[0.68rem]">
                  YourMove (CDN)
                </td>
                <td className="py-3.5 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
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
