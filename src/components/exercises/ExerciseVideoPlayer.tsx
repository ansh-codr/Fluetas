'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  VideoOff,
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';
import { ExerciseVideoAudience } from '@/lib/exercises/videoTypes';

interface ExerciseVideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title: string;
  audience?: ExerciseVideoAudience;
  instructor?: string;
  presentationType?: string;
  autoPlay?: boolean;
  onVideoError?: () => void;
  onRefreshUrl?: () => void;
  videoExpired?: boolean;
}

export default function ExerciseVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  audience,
  instructor,
  presentationType,
  autoPlay = false,
  onVideoError,
  onRefreshUrl,
  videoExpired = false,
}: ExerciseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(Boolean(videoUrl));
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [useFallbackLoop, setUseFallbackLoop] = useState(false);

  // Reset error states when videoUrl or title changes
  useEffect(() => {
    setHasError(false);
    setUseFallbackLoop(false);
    setRetryCount(0);
    setIsLoading(Boolean(videoUrl));
  }, [videoUrl, title]);

  // Load and play video when ready
  useEffect(() => {
    if (videoRef.current && videoUrl && !useFallbackLoop) {
      setIsLoading(true);
      videoRef.current.load();
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [videoUrl, autoPlay, useFallbackLoop]);

  const togglePlay = () => {
    if (useFallbackLoop) {
      setIsPlaying(p => !p);
      return;
    }
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Resilient Error Handling with Auto-Retry and Seamless Fallback
  const handleError = useCallback(() => {
    if (retryCount < 2 && videoRef.current && videoUrl) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load();
        }
      }, 1000 * (retryCount + 1));
      return;
    }

    // After retries, switch to resilient animated guidance mode instead of broken blank screen
    setIsLoading(false);
    setUseFallbackLoop(true);
    if (onVideoError) {
      onVideoError();
    }
  }, [retryCount, videoUrl, onVideoError]);

  return (
    <div
      className="relative w-full aspect-video rounded-2xl bg-[#0E120B] overflow-hidden group shadow-lg select-none border border-[rgba(255,255,255,0.08)]"
      onClick={() => setControlsVisible(prev => !prev)}
    >
      {/* 1. Real Video Playback Stream */}
      {videoUrl && !useFallbackLoop ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          playsInline
          loop
          muted={isMuted}
          preload="auto"
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onError={handleError}
          className="w-full h-full object-contain cursor-pointer"
        />
      ) : (
        /* 2. Resilient Biomechanical Guidance Stream (When video unavailable or network drops) */
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#182012] via-[#0E120B] to-[#080B06]">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isPlaying ? 'opacity-30 scale-105 filter blur-xs' : 'opacity-20 filter blur-xs'
              }`}
            />
          )}

          <div className="relative z-10 flex flex-col items-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/25 border border-[#2E7D32]/50 flex items-center justify-center text-[#4ADE80] mb-2.5 shadow-lg animate-pulse">
              <Dumbbell size={24} />
            </div>

            <span className="text-[0.65rem] font-bold tracking-widest text-[#4ADE80] uppercase mb-1 flex items-center gap-1">
              <Sparkles size={11} />
              BIOMECHANICAL FORM GUIDE
            </span>

            <h4 className="font-['Outfit'] text-sm sm:text-base font-bold text-white m-0 line-clamp-1">
              {title}
            </h4>

            <p className="text-[0.72rem] text-[#A1A89B] m-0 mt-1 max-w-xs leading-relaxed">
              {instructor || 'FLUETAS Sports Science Lab'} · Optimal joint stacking & tempo active
            </p>

            {useFallbackLoop && onRefreshUrl && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setUseFallbackLoop(false);
                  setRetryCount(0);
                  onRefreshUrl();
                }}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[0.72rem] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
              >
                <RotateCcw size={12} />
                <span>Reconnect Stream</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Presentation / Audience Badge Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold bg-black/70 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
          <Sparkles size={11} className="text-[#4ADE80]" />
          <span>
            {audience === 'FEMALE'
              ? 'Women’s Technique Demo'
              : audience === 'MALE'
              ? 'Men’s Technique Demo'
              : 'Form & Biomechanics Demo'}
          </span>
        </span>
        {presentationType && (
          <span className="hidden sm:inline-flex px-2 py-1 rounded-full text-[0.625rem] font-medium bg-black/50 backdrop-blur-md text-white/90 border border-white/10">
            {presentationType}
          </span>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && !useFallbackLoop && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10">
          <Loader2 size={32} className="text-[#2E7D32] animate-spin" />
        </div>
      )}

      {/* Center Play/Pause Indicator */}
      {!isPlaying && !isLoading && (
        <div
          onClick={e => {
            e.stopPropagation();
            togglePlay();
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer z-10 transition-all hover:bg-black/25"
        >
          <div className="w-13 h-13 rounded-full bg-[#2E7D32] hover:bg-[#256628] text-white flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110 pl-0.5">
            <Play size={22} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div
        onClick={e => e.stopPropagation()}
        className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between z-20 transition-opacity duration-200 ${
          controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer min-h-[32px]"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <span className="font-mono text-xs font-bold px-1">❚❚</span>
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </button>

          {!useFallbackLoop && (
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer min-h-[32px]"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          )}

          {instructor && (
            <span className="text-[0.6875rem] text-white/80 font-medium ml-1 hidden sm:inline truncate max-w-[220px]">
              {instructor}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!useFallbackLoop && (
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer min-h-[32px]"
              aria-label="Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
