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
      <div className="relative w-full aspect-video rounded-2xl bg-[#12160F] text-white overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
          />
        )}
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#2E6DA4]/20 border border-[#2E6DA4]/40 flex items-center justify-center text-[#38BDF8] mb-3">
            <AlertTriangle size={22} />
          </div>
          <h4 className="font-['Outfit'] text-sm font-bold text-white m-0">
            {hasError ? 'Stream Expired or Unavailable' : 'Demonstration Instructions Active'}
          </h4>
          <p className="text-xs text-neutral-300 m-0 mt-1.5 leading-relaxed">
            {hasError
              ? 'The temporary signed CDN video link expired or encountered a network interruption.'
              : 'Detailed biomechanical cues, steps, and breathing patterns are available below.'}
          </p>
          {onRefreshUrl && (
            <button
              onClick={onRefreshUrl}
              className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={13} /> Refresh Stream
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden group shadow-lg">
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
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <Loader2 size={32} className="text-[#2E7D32] animate-spin" />
        </div>
      )}

      {/* Center Play/Pause Indicator (when paused) */}
      {!isPlaying && !isLoading && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 pl-0.5">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Floating Mini Controls Bar (Visible on Hover) */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
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
            className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] text-white/90 font-semibold tracking-wider uppercase">
            HD Technique Loop
          </span>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
            aria-label="Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
