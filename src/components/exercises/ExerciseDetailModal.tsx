'use client';

import React, { useEffect } from 'react';
import { useExerciseDetail } from '@/hooks/useExercises';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';
import {
  X,
  Dumbbell,
  Sparkles,
  AlertCircle,
  Wind,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface ExerciseDetailModalProps {
  exerciseId: string | null;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exerciseId, onClose }: ExerciseDetailModalProps) {
  const {
    exercise,
    loading,
    error,
    videoExpired,
    handleVideoError,
    refreshVideoUrl,
  } = useExerciseDetail(exerciseId);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!exerciseId) return null;

  const difficultyColorMap: Record<string, string> = {
    Beginner: '#10B981',
    Intermediate: '#38BDF8',
    Advanced: '#F59E0B',
  };

  const diffColor = (exercise && difficultyColorMap[exercise.difficulty]) || '#38BDF8';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#13161F] border border-[#1E2133] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-slide-up">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2133] flex items-center justify-between gap-3 bg-[#0D0F18] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
              <Dumbbell size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="font-['Outfit'] text-base sm:text-lg font-black text-[#E8EAF6] m-0 truncate uppercase tracking-wide">
                {exercise?.name || 'Loading Exercise...'}
              </h2>
              {exercise && (
                <p className="text-[0.68rem] text-[#8B91B0] m-0 truncate">
                  {exercise.exerciseType} · {exercise.equipment}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#13161F] border border-[#1E2133] text-[#8B91B0] hover:text-white hover:border-[#2A3050] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
          {loading && !exercise ? (
            <div className="flex flex-col gap-4 py-8 items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#8B91B0]">Fetching live demonstration video &amp; guide...</p>
            </div>
          ) : error && !exercise ? (
            <div className="p-6 text-center fluetas-card">
              <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#E8EAF6] m-0">Failed to load exercise</p>
              <p className="text-xs text-[#8B91B0] m-0 mt-1">{error}</p>
              <button onClick={() => refreshVideoUrl()} className="btn-primary mt-3 text-xs">
                Retry
              </button>
            </div>
          ) : exercise ? (
            <>
              {/* 1. Video Player Section */}
              <div className="w-full">
                <ExerciseVideoPlayer
                  videoUrl={exercise.videoUrl}
                  thumbnailUrl={exercise.thumbnailUrl}
                  title={exercise.name}
                  autoPlay={true}
                  onVideoError={handleVideoError}
                  onRefreshUrl={refreshVideoUrl}
                  videoExpired={videoExpired}
                />
              </div>

              {/* 2. Target Vitals & Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
                  <span className="text-[0.62rem] text-[#8B91B0] font-bold uppercase tracking-wider block mb-1">
                    Target Muscle
                  </span>
                  <p className="font-['Outfit'] text-xs font-bold text-[#10B981] m-0 truncate">
                    {exercise.targetMuscles[0] || exercise.muscleGroups[0] || 'Primary'}
                  </p>
                </div>

                <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
                  <span className="text-[0.62rem] text-[#8B91B0] font-bold uppercase tracking-wider block mb-1">
                    Secondary
                  </span>
                  <p className="font-['Outfit'] text-xs font-bold text-[#E8EAF6] m-0 truncate">
                    {exercise.secondaryMuscles.join(', ') || 'Synergists'}
                  </p>
                </div>

                <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
                  <span className="text-[0.62rem] text-[#8B91B0] font-bold uppercase tracking-wider block mb-1">
                    Equipment
                  </span>
                  <p className="font-['Outfit'] text-xs font-bold text-[#38BDF8] m-0 truncate">
                    {exercise.equipment}
                  </p>
                </div>

                <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
                  <span className="text-[0.62rem] text-[#8B91B0] font-bold uppercase tracking-wider block mb-1">
                    Difficulty
                  </span>
                  <p className="font-['Outfit'] text-xs font-bold m-0 truncate" style={{ color: diffColor }}>
                    {exercise.difficulty}
                  </p>
                </div>
              </div>

              {/* 3. How to Perform (Instructions) */}
              <div className="fluetas-card p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-[#10B981]" />
                  <span className="section-title">HOW TO PERFORM</span>
                </div>

                <div className="space-y-2.5 text-xs text-[#E8EAF6] leading-relaxed">
                  {(exercise.steps && exercise.steps.length > 0 ? exercise.steps : exercise.instructions).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#0B0D14] p-3 rounded-xl border border-[#1E2133]">
                      <span className="w-5 h-5 rounded-md bg-[#10B981]/20 text-[#10B981] font-bold text-[0.65rem] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="m-0 leading-normal">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Form Cues */}
              {exercise.formCues && exercise.formCues.length > 0 && (
                <div className="fluetas-card p-4 sm:p-5 border-[#38BDF8]/20 bg-gradient-to-br from-[#13161F] to-[#0B1726]">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-[#38BDF8]" />
                    <span className="section-title text-[#38BDF8]">KEY FORM CUES</span>
                  </div>

                  <ul className="space-y-2 m-0 p-0 list-none text-xs text-[#E8EAF6]">
                    {exercise.formCues.map((cue, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-[#38BDF8] font-bold text-sm">✓</span>
                        <span className="leading-normal">{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. Common Mistakes */}
              {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                <div className="fluetas-card p-4 sm:p-5 border-[#F59E0B]/20 bg-gradient-to-br from-[#13161F] to-[#1E160A]">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-[#F59E0B]" />
                    <span className="section-title text-[#F59E0B]">COMMON MISTAKES TO AVOID</span>
                  </div>

                  <ul className="space-y-2 m-0 p-0 list-none text-xs text-[#E8EAF6]">
                    {exercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-[#F59E0B] font-bold text-sm">✕</span>
                        <span className="leading-normal text-[#D1D5DB]">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6. Breathing Guidance */}
              {exercise.breathing && (
                <div className="fluetas-card p-4 sm:p-5 border-[#A78BFA]/20 bg-gradient-to-br from-[#13161F] to-[#18112A]">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind size={16} className="text-[#A78BFA]" />
                    <span className="section-title text-[#A78BFA]">BREATHING PATTERN &amp; BRACING</span>
                  </div>
                  <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed bg-[#0B0D14] p-3 rounded-xl border border-[#1E2133]">
                    {exercise.breathing}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
