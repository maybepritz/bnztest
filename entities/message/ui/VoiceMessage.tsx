"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Download } from "lucide-react";
import { CircularProgress } from "@/shared/ui/CircularProgress";
import { cn } from "@/shared/lib/utils";

interface VoiceMessageProps {
  src: string;
  isMe?: boolean;
  messageId?: string;
}

// Generate consistent waveform bars from audio data
function generateWaveformBars(count: number, seed: string): number[] {
  const bars: number[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < count; i++) {
    hash = ((hash << 5) - hash) + i;
    hash |= 0;
    const val = Math.abs(hash % 100);
    const normalizedVal = 0.2 + (val / 100) * 0.8;
    bars.push(normalizedVal);
  }
  return bars;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds === Infinity) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceMessage({ src, isMe = false, messageId }: VoiceMessageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "ready">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  
  const isDraggingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const wasPlayingRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  const BAR_COUNT = 40;
  const bars = generateWaveformBars(BAR_COUNT, src);

  const updateProgress = useCallback(() => {
    if (audioRef.current && !isDraggingRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    if (isPlayingRef.current) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      isPlayingRef.current = true;
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      isPlayingRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, updateProgress]);

  // Exclusive playback handler
  useEffect(() => {
    const handleGlobalPause = (e: any) => {
      if (e.detail !== src && isPlaying && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentTime(0);
      }
    };
    window.addEventListener('chat:pause_audio', handleGlobalPause);
    return () => window.removeEventListener('chat:pause_audio', handleGlobalPause);
  }, [isPlaying, src]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handlePlayPause = () => {
    if (downloadState === "idle") {
      setDownloadState("downloading");
      setDownloadProgress(0);

      const xhr = new XMLHttpRequest();
      xhr.open("GET", src, true);
      xhr.responseType = "arraybuffer";

      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          setDownloadProgress(Math.round((e.loaded / e.total) * 100));
        } else {
          setDownloadProgress((prev) => Math.min(prev + 10, 90));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 206) {
          setDownloadProgress(100);
          const arrayBuffer = xhr.response;
          const blob = new Blob([arrayBuffer], { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          
          try {
            // Highly reliable UI duration decoding
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
              if (decoded && decoded.duration && decoded.duration !== Infinity) {
                setDuration(decoded.duration);
              }
            }
          } catch (e) {
            console.warn("Audio duration decode failed", e);
          }

          setBlobUrl(url);
          setDownloadState("ready");
          setShouldAutoPlay(true);
        } else {
          setDownloadState("idle");
        }
      };

      xhr.onerror = () => {
        setDownloadState("idle");
      };

      xhr.send();
      return;
    }

    if (downloadState === "downloading") return;

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
      window.dispatchEvent(new CustomEvent('chat:pause_audio', { detail: src }));
    }
  };

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const toggleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIdx = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Drag and scrub logic
  const handleSeek = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (downloadState !== "ready" || !waveformRef.current || !audioRef.current || !duration || duration === Infinity) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = Math.max(0, Math.min(percentage * duration, duration - 0.01));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration, downloadState]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (downloadState !== "ready") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    wasPlayingRef.current = isPlaying;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setIsDragging(true);
    isDraggingRef.current = true;
    handleSeek(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    handleSeek(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    isDraggingRef.current = false;
    
    if (wasPlayingRef.current && audioRef.current && audioRef.current.currentTime < duration) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      window.dispatchEvent(new CustomEvent('chat:pause_audio', { detail: src }));
    }
  };

  const progress = duration && duration !== Infinity && !isNaN(duration) ? currentTime / duration : 0;
  const progressBarIndex = Math.floor(progress * BAR_COUNT);

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (messageId) {
      setPortalTarget(document.getElementById(`voice-speed-portal-${messageId}`));
    }
  }, [messageId]);

  const speedButton = downloadState === "ready" && (isPlaying || currentTime > 0) ? (
    <button
      onClick={toggleSpeed}
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
        isMe
          ? "bg-white/15 hover:bg-white/25 text-white/80"
          : "bg-primary/10 hover:bg-primary/20 text-primary/80"
      }`}
    >
      {playbackRate}×
    </button>
  ) : null;

  return (
    <div className={`flex items-center gap-3 p-2.5 min-w-[240px] max-w-[320px] select-none`}>
      {portalTarget && speedButton && createPortal(speedButton, portalTarget)}
      {blobUrl && (
        <audio
          ref={audioRef}
          src={blobUrl}
          onEnded={handleEnded}
          onLoadedMetadata={() => {
            const audio = audioRef.current;
            if (!audio) return;

            const handleReady = () => {
              if (shouldAutoPlay) {
                setShouldAutoPlay(false);
                audio.play().catch(() => {});
                setIsPlaying(true);
                window.dispatchEvent(new CustomEvent('chat:pause_audio', { detail: src }));
              }
            };

            if (audio.duration === Infinity || isNaN(audio.duration)) {
              const handleSeeked = () => {
                audio.removeEventListener('seeked', handleSeeked);
                audio.currentTime = 0;
                handleReady();
              };
              audio.addEventListener('seeked', handleSeeked);
              audio.currentTime = 1e8; // Force browser to calculate exact duration locally for scrubbing
            } else {
              handleReady();
            }
          }}
          preload="auto"
        />
      )}

      {/* Play/Pause/Download Button */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
        {downloadState === "downloading" ? (
          <CircularProgress 
            value={downloadProgress} 
            size={40} 
            className={isMe ? "text-white" : "text-primary"} 
          />
        ) : (
          <button
            onClick={handlePlayPause}
            className={`absolute inset-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              isMe
                ? "bg-white/20 hover:bg-white/30 text-white"
                : "bg-primary/15 hover:bg-primary/25 text-primary"
            }`}
          >
            {downloadState === "idle" ? (
              <Download size={18} strokeWidth={2.5} className="mr-0.5" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Waveform + Info */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {/* Waveform Bars */}
        <div 
          ref={waveformRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`flex items-end gap-[2px] h-[28px] touch-none relative ${downloadState === "ready" ? "cursor-pointer" : "opacity-50"}`}
        >
          {bars.map((height, i) => {
            const isActive = downloadState === "ready" && i < progressBarIndex;
            const barHeight = Math.max(3, height * 28);

            return (
              <div
                key={i}
                className="flex-1 flex items-end justify-center transition-colors duration-150 pointer-events-none"
                style={{ height: "28px" }}
              >
                <div
                  className={`w-[2.5px] rounded-full transition-all duration-150 ${
                    isActive
                      ? isMe
                        ? "bg-white"
                        : "bg-primary"
                      : isMe
                        ? "bg-white/30"
                        : "bg-primary/25"
                  }`}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
            );
          })}
        </div>

        {/* Time + Speed */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-mono tabular-nums ${isMe ? "text-white/70" : "text-secondary"}`}>
            {downloadState === "ready" 
              ? (isPlaying || currentTime > 0 ? formatDuration(currentTime) : formatDuration(duration))
              : "--:--"}
          </span>
          {!portalTarget && speedButton}
        </div>
      </div>
    </div>
  );
}
