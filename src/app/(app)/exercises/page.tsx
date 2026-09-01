'use client';

import React, { useState } from 'react';
import { useExerciseLibrary } from '@/hooks/useExercises';
import ExerciseDetailModal from '@/components/exercises/ExerciseDetailModal';
import {
  Dumbbell,
  Search,
  Filter,
  Play,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
const EQUIPMENT_OPTIONS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Bodyweight', 'Machine'];
const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const {
    exercises,
    total,
    provider,
    isFallback,
    loading,
    error,
    reload,
  } = useExerciseLibrary({
    search: search.trim() || undefined,
    muscle: selectedMuscle !== 'All' ? selectedMuscle : undefined,
    equipment: selectedEquipment !== 'All' ? selectedEquipment : undefined,
    difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
    limit: 50,
    includeVideos: false, // Prevents loading heavy video URLs for browse list
  });

  const difficultyColors: Record<string, string> = {
    Beginner: '#10B981',
    Intermediate: '#38BDF8',
    Advanced: '#F59E0B',
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
              <Sparkles size={11} />
              API-Powered Movement Library
            </span>
          </div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            EXERCISE VIDEO LIBRARY &amp; FORM GUIDE
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0 mt-0.5">
            Stream high-definition biomechanical demonstrations directly from provider CDN.
          </p>
        </div>
      </div>

      {/* Provider & Resiliency Badge */}
      {isFallback && (
        <div className="p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/25 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#38BDF8]">
          <div className="flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            <span>
              Connected to FLUETAS Exercise Catalog. Add <code className="bg-black/30 px-1.5 py-0.5 rounded">YMOVE_API_KEY</code> in server environment to unlock external provider streaming.
            </span>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="fluetas-card p-4 sm:p-5 flex flex-col gap-4">
        {/* Search input */}
        <div className="flex items-center gap-2.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl px-3.5 py-2.5">
          <Search size={16} className="text-[#8B91B0] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises by name, target muscle, or apparatus (e.g. Bench Press, Quads, Cable)..."
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#E8EAF6] placeholder:text-[#3A3F58]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-[#8B91B0] hover:text-white cursor-pointer">
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Muscle Group Scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-[0.68rem] text-[#8B91B0] font-bold uppercase tracking-wider mr-1 shrink-0">
              Muscle:
            </span>
            {MUSCLE_GROUPS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedMuscle === m
                    ? 'bg-[#10B981] text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-[#0B0D14] border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedEquipment}
              onChange={e => setSelectedEquipment(e.target.value)}
              className="bg-[#0B0D14] border border-[#1E2133] rounded-lg px-2.5 py-1.5 text-xs text-[#8B91B0] focus:border-[#10B981] focus:outline-none"
            >
              <option disabled>Equipment</option>
              {EQUIPMENT_OPTIONS.map(eq => (
                <option key={eq} value={eq}>
                  {eq === 'All' ? 'All Equipment' : eq}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="bg-[#0B0D14] border border-[#1E2133] rounded-lg px-2.5 py-1.5 text-xs text-[#8B91B0] focus:border-[#10B981] focus:outline-none"
            >
              <option disabled>Difficulty</option>
              {DIFFICULTY_OPTIONS.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Levels' : d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="fluetas-card p-4 flex flex-col gap-3">
              <div className="w-full aspect-video rounded-xl bg-[#1E2133] animate-pulse" />
              <div className="h-4 bg-[#1E2133] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-[#1E2133] rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="fluetas-card p-8 text-center flex flex-col items-center">
          <p className="text-red-400 text-sm font-bold m-0">{error}</p>
          <button onClick={reload} className="btn-primary mt-3 text-xs">
            Retry Loading
          </button>
        </div>
      ) : exercises.length === 0 ? (
        <div className="fluetas-card p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#1E2133] flex items-center justify-center text-xl mb-3">
            🔍
          </div>
          <p className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">No matching exercises found</p>
          <p className="text-xs text-[#8B91B0] m-0 mt-1">
            Try adjusting your search terms or clearing muscle / equipment filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedMuscle('All');
              setSelectedEquipment('All');
              setSelectedDifficulty('All');
            }}
            className="btn-primary mt-4 text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map(ex => {
            const diffColor = difficultyColors[ex.difficulty] || '#38BDF8';

            return (
              <div
                key={ex.id}
                onClick={() => setActiveExerciseId(ex.id)}
                className="fluetas-card p-4 flex flex-col justify-between gap-3 hover:border-[#10B981]/50 hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] transition-all cursor-pointer group"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative w-full aspect-video rounded-xl bg-[#0B0D14] border border-[#1E2133] overflow-hidden mb-3">
                    {ex.thumbnailUrl ? (
                      <img
                        src={ex.thumbnailUrl}
                        alt={ex.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-[#3A3F58]">
                        🏋️
                      </div>
                    )}

                    {/* Difficulty Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[0.62rem] font-bold backdrop-blur-md"
                        style={{ backgroundColor: `${diffColor}25`, color: diffColor, border: `1px solid ${diffColor}40` }}
                      >
                        {ex.difficulty}
                      </span>
                    </div>

                    {/* Play Video Indicator */}
                    <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 text-[#10B981] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>

                  {/* Title & Muscles */}
                  <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0 group-hover:text-[#10B981] transition-colors line-clamp-1">
                    {ex.name}
                  </h3>

                  <p className="text-xs text-[#38BDF8] font-medium m-0 mt-0.5">
                    Target: {ex.targetMuscles[0] || ex.muscleGroups[0]}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-2.5 border-t border-[#1E2133] flex items-center justify-between text-[0.68rem] text-[#8B91B0]">
                  <span>{ex.equipment}</span>
                  <span className="text-[#10B981] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    View Video &amp; Guide →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Playing Video & Form Details */}
      {activeExerciseId && (
        <ExerciseDetailModal
          exerciseId={activeExerciseId}
          onClose={() => setActiveExerciseId(null)}
        />
      )}
    </div>
  );
}
