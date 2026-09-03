'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, VideoOff, Loader2, Volume2, VolumeX, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';
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
  const [hasError, setHasError] = useState(videoExpired);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    setHasError(videoExpired);
  }, [videoExpired]);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      setHasError(false);
      setIsLoading(true);
      videoRef.current.load();
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [videoUrl, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
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
      videoRef.current.requestFullscreen();
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onVideoError) {
      onVideoError();
    }
  };

  // Safe fallback state: Video in production or unavailable
  if (!videoUrl || hasError) {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-[#12160F] text-white overflow-hidden flex flex-col items-center justify-center p-5 sm:p-6 text-center shadow-md">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
          />
        )}
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="w-11 h-11 rounded-2xl bg-[#2E7D32]/20 border border-[#2E7D32]/40 flex items-center justify-center text-[#4ADE80] mb-3">
            {hasError ? <RotateCcw size={20} /> : <VideoOff size={20} />}
          </div>
          <span className="text-[0.625rem] font-bold tracking-widest text-[#4ADE80] uppercase mb-1">
            {hasError ? 'STREAM DISCONNECTED' : 'EXERCISE REPERTOIRE'}
          </span>
          <h4 className="font-['Outfit'] text-sm sm:text-base font-bold text-white m-0">
            {hasError ? 'Video Stream Interrupted' : 'Video Demonstration in Production'}
          </h4>
          <p className="text-xs text-[#A1A89B] m-0 mt-1.5 leading-relaxed">
            {hasError
              ? 'The temporary streaming link expired or encountered a network error. Tap below to refresh.'
              : 'Official biomechanical steps, joint alignment, and breathing cues are detailed below.'}
          </p>
          {hasError && onRefreshUrl && (
            <button
              onClick={onRefreshUrl}
              className="mt-3.5 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={13} /> Refresh Stream
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden group shadow-lg select-none"
      onClick={() => setControlsVisible(prev => !prev)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        playsInline
        loop
        muted={isMuted}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Presentation / Audience Badge Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
          <Sparkles size={11} className="text-[#4ADE80]" />
          <span>
            {audience === 'FEMALE'
              ? 'Women’s Technique Demo'
              : audience === 'MALE'
              ? 'Men’s Technique Demo'
              : 'Universal Form Guide'}
          </span>
        </span>
        {presentationType && (
          <span className="hidden sm:inline-flex px-2 py-1 rounded-full text-[0.625rem] font-medium bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
            {presentationType}
          </span>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10">
          <Loader2 size={32} className="text-[#2E7D32] animate-spin" />
        </div>
      )}

      {/* Center Play/Pause Touch Indicator */}
      {!isPlaying && !isLoading && (
        <div
          onClick={e => {
            e.stopPropagation();
            togglePlay();
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer z-10"
        >
          <div className="w-14 h-14 rounded-full bg-[#2E7D32] hover:bg-[#256628] text-white flex items-center justify-center shadow-xl transform transition-transform hover:scale-110 pl-0.5">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div
        onClick={e => e.stopPropagation()}
        className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-200 ${
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

          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer min-h-[32px]"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {instructor && (
            <span className="text-[0.6875rem] text-white/80 font-medium ml-1 hidden sm:inline truncate max-w-[200px]">
              {instructor}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer min-h-[32px]"
            aria-label="Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
