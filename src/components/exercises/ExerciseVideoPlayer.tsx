'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, Loader2, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface ExerciseVideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title: string;
  autoPlay?: boolean;
  onVideoError?: () => void;
  onRefreshUrl?: () => void;
  videoExpired?: boolean;
}

export default function ExerciseVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  autoPlay = false,
  onVideoError,
  onRefreshUrl,
  videoExpired = false,
}: ExerciseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(videoExpired);

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

  if (!videoUrl || hasError) {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-[#0B0D14] border border-[#1E2133] overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
          />
        )}
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mb-3 shadow-[0_0_16px_rgba(56,189,248,0.2)]">
            <AlertTriangle size={22} />
          </div>
          <h4 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">
            {hasError ? 'Stream Expired or Unavailable' : 'Demonstration Instructions Active'}
          </h4>
          <p className="text-xs text-[#8B91B0] m-0 mt-1.5 leading-relaxed">
            {hasError
              ? 'The temporary signed CDN video link expired or encountered a network interruption.'
              : 'Detailed biomechanical cues, steps, and breathing patterns are available below.'}
          </p>

          {onRefreshUrl && (
            <button
              onClick={onRefreshUrl}
              className="btn-primary mt-3.5 px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <RotateCcw size={13} />
              Fetch Fresh Stream
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl bg-[#0B0D14] border border-[#1E2133] overflow-hidden group shadow-2xl">
      {/* Video element streaming directly from provider CDN */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="text-[#10B981] animate-spin" />
            <span className="text-[0.65rem] text-[#E8EAF6] font-semibold tracking-wider uppercase">
              Streaming Video...
            </span>
          </div>
        </div>
      )}

      {/* Center Play Overlay when paused */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-2xl bg-[#10B981]/90 text-black flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform cursor-pointer"
          aria-label="Play video"
        >
          <Play size={22} fill="currentColor" className="ml-1" />
        </button>
      )}

      {/* Bottom Control Bar on Hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] text-[#8B91B0] font-medium hidden sm:inline">
            Direct CDN Stream
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
