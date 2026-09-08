'use client';

import React, { useState, useMemo } from 'react';
import { useExerciseLibrary } from '@/hooks/useExercises';
import { useWorkout } from '@/hooks/useWorkout';
import ExerciseDetailModal from '@/components/exercises/ExerciseDetailModal';
import {
  Search,
  Play,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
const EQUIPMENT_OPTIONS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Bodyweight', 'Machine'];
const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showOnlyCompletedToday, setShowOnlyCompletedToday] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const { todaySession } = useWorkout();

  const {
    exercises,
    isFallback,
    loading,
    error,
    reload,
  } = useExerciseLibrary({
    search: search.trim() || undefined,
    muscle: selectedMuscle !== 'All' ? selectedMuscle : undefined,
    equipment: selectedEquipment !== 'All' ? selectedEquipment : undefined,
    difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
    limit: 60,
    includeVideos: false,
  });

  // Map of exercises completed today for real progression marks
  const completedExerciseMap = useMemo(() => {
    const map = new Map<string, { completedSets: number; totalSets: number }>();
    if (!todaySession?.exercises) return map;

    todaySession.exercises.forEach(ex => {
      const doneSets = ex.sets?.filter(s => s.done).length ?? 0;
      const total = ex.sets?.length ?? 0;
      if (doneSets > 0 || todaySession.status === 'completed') {
        const setsDone = doneSets > 0 ? doneSets : (total || 3);
        const totalSetsCount = total > 0 ? total : 3;
        if (ex.id) map.set(ex.id.toLowerCase(), { completedSets: setsDone, totalSets: totalSetsCount });
        if (ex.name) map.set(ex.name.toLowerCase().trim(), { completedSets: setsDone, totalSets: totalSetsCount });
      }
    });
    return map;
  }, [todaySession]);

  const difficultyColors: Record<string, string> = {
    Beginner: '#2E7D32',
    Intermediate: '#2E6DA4',
    Advanced: '#D9622B',
  };

  const filteredExercises = useMemo(() => {
    if (!showOnlyCompletedToday) return exercises;
    return exercises.filter(ex => {
      return completedExerciseMap.has(ex.id.toLowerCase()) || completedExerciseMap.has(ex.name.toLowerCase().trim());
    });
  }, [exercises, showOnlyCompletedToday, completedExerciseMap]);

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 flex items-center gap-1">
              <Sparkles size={11} />
              API-Powered Movement Library
            </span>
            {completedExerciseMap.size > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#2E7D32] text-white flex items-center gap-1 shadow-2xs">
                <CheckCircle2 size={11} />
                {completedExerciseMap.size} Progression Mark{completedExerciseMap.size > 1 ? 's' : ''} Today
              </span>
            )}
          </div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            EXERCISE VIDEO LIBRARY &amp; FORM GUIDE
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0 mt-0.5">
            Stream high-definition biomechanical demonstrations directly from provider CDN.
          </p>
        </div>

        {completedExerciseMap.size > 0 && (
          <button
            onClick={() => setShowOnlyCompletedToday(prev => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showOnlyCompletedToday
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-white border border-[rgba(18,22,15,0.12)] text-[#2E7D32] hover:bg-[#2E7D32]/10'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{showOnlyCompletedToday ? 'Show All Exercises' : "Show Today's Completed"}</span>
          </button>
        )}
      </div>

      {/* Provider & Resiliency Badge */}
      {isFallback && (
        <div className="p-3 bg-[#2E6DA4]/10 border border-[#2E6DA4]/20 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#2E6DA4]">
          <div className="flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            <span>
              Connected to FLUETAS Exercise Catalog. Add <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono">YMOVE_API_KEY</code> in server environment to unlock external provider streaming.
            </span>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="fluetas-card p-4 sm:p-5 flex flex-col gap-4">
        {/* Search input */}
        <div className="flex items-center gap-2.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] rounded-xl px-3.5 py-2.5">
          <Search size={16} className="text-[#586151] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises by name, target muscle, or apparatus (e.g. Bench Press, Quads, Cable)..."
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#12160F] placeholder:text-[#8A9482]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-[#586151] hover:text-[#12160F] cursor-pointer">
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Muscle Group Scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-[0.68rem] text-[#586151] font-bold uppercase tracking-wider mr-1 shrink-0">
              Muscle:
            </span>
            {MUSCLE_GROUPS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedMuscle === m
                    ? 'bg-[#2E7D32] text-white font-bold shadow-sm'
                    : 'bg-[#F2F4EE] border border-[rgba(18,22,15,0.08)] text-[#586151] hover:text-[#12160F]'
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
              className="bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] rounded-lg px-2.5 py-1.5 text-xs text-[#12160F] focus:border-[#2E7D32] focus:outline-none"
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
              className="bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] rounded-lg px-2.5 py-1.5 text-xs text-[#12160F] focus:border-[#2E7D32] focus:outline-none"
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
              <div className="w-full aspect-video rounded-xl bg-[#F2F4EE] animate-pulse" />
              <div className="h-4 bg-[#F2F4EE] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-[#F2F4EE] rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="fluetas-card p-8 text-center flex flex-col items-center">
          <p className="text-red-500 text-sm font-bold m-0">{error}</p>
          <button onClick={reload} className="btn-primary mt-3 text-xs">
            Retry Loading
          </button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="fluetas-card p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F2F4EE] flex items-center justify-center text-xl mb-3">
            🔍
          </div>
          <p className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">No matching exercises found</p>
          <p className="text-xs text-[#586151] m-0 mt-1">
            {showOnlyCompletedToday
              ? 'No exercises recorded in today’s workout session yet. Start a workout in Fluetas Train to log progress.'
              : 'Try adjusting your search terms or clearing muscle / equipment filters.'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedMuscle('All');
              setSelectedEquipment('All');
              setSelectedDifficulty('All');
              setShowOnlyCompletedToday(false);
            }}
            className="btn-primary mt-4 text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map(ex => {
            const diffColor = difficultyColors[ex.difficulty] || '#2E6DA4';
            const progression =
              completedExerciseMap.get(ex.id.toLowerCase()) ||
              completedExerciseMap.get(ex.name.toLowerCase().trim());

            return (
              <div
                key={ex.id}
                onClick={() => setActiveExerciseId(ex.id)}
                className={`fluetas-card p-4 flex flex-col justify-between gap-3 transition-all cursor-pointer group ${
                  progression
                    ? 'border-[#2E7D32] bg-[#2E7D32]/3 shadow-xs hover:shadow-md'
                    : 'hover:shadow-md hover:border-[#2E7D32]/40'
                }`}
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative w-full aspect-video rounded-xl bg-[#12160F] border border-[rgba(18,22,15,0.10)] overflow-hidden mb-3">
                    {ex.thumbnailUrl ? (
                      <img
                        src={ex.thumbnailUrl}
                        alt={ex.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-neutral-400">
                        🏋️
                      </div>
                    )}

                    {/* Progression Mark Badge (Top Left) */}
                    {progression && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2.5 py-1 rounded-md text-[0.625rem] font-bold bg-[#2E7D32] text-white shadow-md flex items-center gap-1 border border-white/20">
                          <CheckCircle2 size={11} />
                          <span>COMPLETED TODAY ({progression.completedSets}/{progression.totalSets} Sets)</span>
                        </span>
                      </div>
                    )}

                    {/* Difficulty Badge (Top Right) */}
                    <div className="absolute top-2 right-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[0.62rem] font-bold backdrop-blur-md"
                        style={{ backgroundColor: `${diffColor}25`, color: diffColor, border: `1px solid ${diffColor}40` }}
                      >
                        {ex.difficulty}
                      </span>
                    </div>

                    {/* Play Video Indicator */}
                    <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 text-[#2E7D32] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>

                  {/* Title & Muscles */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0 group-hover:text-[#2E7D32] transition-colors line-clamp-1">
                      {ex.name}
                    </h3>
                    {progression && (
                      <span className="text-[0.65rem] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded-full shrink-0">
                        ✓ Logged
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#2E6DA4] font-medium m-0 mt-0.5">
                    Target: {ex.targetMuscles[0] || ex.muscleGroups[0]}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-2.5 border-t border-[rgba(18,22,15,0.08)] flex items-center justify-between text-[0.68rem] text-[#586151]">
                  <span>{ex.equipment}</span>
                  <span className="text-[#2E7D32] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    {progression ? 'View Form & Stats →' : 'View Video & Guide →'}
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
