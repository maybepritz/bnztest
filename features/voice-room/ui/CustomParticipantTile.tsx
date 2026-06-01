"use client";

import { useIsSpeaking, useParticipantInfo, VideoTrack, useTrackVolume } from "@livekit/components-react";
import { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { Avatar } from "@/shared/ui";
import { MicOff, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { RemoteParticipant, LocalParticipant, Track } from "livekit-client";
import { getUserByUsernameAction } from "@/entities/user/api/actions";

interface CustomParticipantTileProps {
  trackRef: TrackReferenceOrPlaceholder;
  isFocused?: boolean;
  isPip?: boolean;
}

export function CustomParticipantTile({ trackRef, isFocused = false, isPip = false }: CustomParticipantTileProps) {
  const participant = trackRef.participant;
  const { identity, name } = useParticipantInfo({ participant });
  const isServerSpeaking = useIsSpeaking(participant);
  const isLocal = participant instanceof LocalParticipant;
  
  const micPub = participant.getTrackPublication(Track.Source.Microphone);
  const micVolume = useTrackVolume(micPub?.track as any);
  
  const isLocalSpeaking = typeof micVolume === "number" && micVolume > 0.005;
  const isSpeaking = isLocal ? (isLocalSpeaking || isServerSpeaking) : isServerSpeaking;

  const [volume, setVolume] = useState(100);
  const [userInfo, setUserInfo] = useState<{ name?: string, image?: string } | null>(null);

  useEffect(() => {
    if (!identity) return;
    let mounted = true;
    getUserByUsernameAction(identity)
      .then(data => {
         if (mounted && data && !data.error) {
           setUserInfo(data);
         }
      })
      .catch(console.error);
    return () => { mounted = false; };
  }, [identity]);

  let avatarUrl = userInfo?.image || undefined;
  if (!avatarUrl) {
    try {
      const meta = JSON.parse(participant.metadata || "{}");
      avatarUrl = meta.avatar || meta.avatarUrl || meta.image || meta.picture;
    } catch (e) {}
  }
  
  const displayName = userInfo?.name || name || identity;

  const hasVideo = trackRef.publication && !trackRef.publication.isMuted && trackRef.source !== 'screen_share';
  const isScreenShare = trackRef.source === 'screen_share';
  const isMicMuted = !participant.isMicrophoneEnabled;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (participant instanceof RemoteParticipant) {
      participant.setVolume(val / 100);
    }
  };

  return (
    <div
      className={`group relative w-full h-full rounded-2xl overflow-hidden bg-surface-secondary flex items-center justify-center transition-all duration-300 ${
        isSpeaking && !isScreenShare
          ? "ring-2 ring-primary/60 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]"
          : "ring-1 ring-white/5"
      }`}
    >
      {/* Avatar placeholder (no video) */}
      <div className={`w-full h-full flex items-center justify-center ${hasVideo || isScreenShare ? "hidden" : "block"}`}>
        <div className="relative flex flex-col items-center gap-3">
          <div className={`rounded-full transition-all duration-300 ${isSpeaking ? "ring-4 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "ring-0 ring-transparent"}`}>
            <Avatar
              size={isFocused ? "xl" : "lg"}
              src={avatarUrl}
              fallback={displayName?.[0]?.toUpperCase() || "?"}
            />
          </div>
        </div>
      </div>

      {/* Video track */}
      <div className={`w-full h-full ${hasVideo || isScreenShare ? "block" : "hidden"}`}>
        <VideoTrack
          trackRef={trackRef as any}
          className={`w-full h-full ${isScreenShare ? 'object-contain' : 'object-cover'}`}
        />
      </div>

      {/* Bottom gradient overlay for readability */}
      {!isPip && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-transparent to-transparent" />}

      {/* Participant Info Overlay */}
      {!isPip && (
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2">
          <span className="text-white text-xs font-medium truncate max-w-[100px]">
            {displayName}
            {isScreenShare && " (Экран)"}
          </span>
          <div className={`bg-danger/80 rounded-full p-0.5 ${isMicMuted && !isScreenShare ? "block" : "hidden"}`}>
            <MicOff size={12} className="text-white" />
          </div>
        </div>
      )}

      {/* Volume Control (only for remote participants, visible on hover) */}
      {!isLocal && !isPip && (
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <Volume2 size={14} className="text-white/80" />
          <input
            type="range"
            min="0" max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          />
        </div>
      )}
    </div>
  );
}
