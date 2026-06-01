"use client";

import { useTracks, useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useState } from "react";
import { CustomParticipantTile } from "./CustomParticipantTile";
import { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { LayoutList, LayoutGrid, Video, ChevronDown, ChevronUp, ArrowLeft, Eye, ExternalLink, X } from "lucide-react";
import { IconButton } from "@/shared/ui";
import { useRouter } from "next/navigation";

interface CustomVideoGridProps {
  isPip?: boolean;
  onLeave?: () => void;
}

export function CustomVideoGrid({ isPip, onLeave }: CustomVideoGridProps) {
  const router = useRouter();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const participants = useParticipants();

  const [focusedTrackId, setFocusedTrackId] = useState<string | null>(null);
  const [videoOnly, setVideoOnly] = useState(false);
  const [isParticipantsHidden, setIsParticipantsHidden] = useState(false);

  // Filter tracks if videoOnly is enabled
  const visibleTracks = tracks.filter(t => {
    if (!videoOnly) return true;
    const hasVideo = t.publication && !t.publication.isMuted;
    return hasVideo || t.source === Track.Source.ScreenShare;
  });

  // Find the focused track, or auto-focus the first screen share if none is focused
  let focusedTrack = visibleTracks.find(t => `${t.participant.identity}-${t.source}` === focusedTrackId);
  if (!focusedTrack) {
    const screenShare = visibleTracks.find(t => t.source === Track.Source.ScreenShare);
    if (screenShare) focusedTrack = screenShare as TrackReferenceOrPlaceholder;
  }

  const handleFocus = (id: string) => {
    if (focusedTrackId === id) setFocusedTrackId(null);
    else setFocusedTrackId(id);
  };

  // --------------------------------------------------------
  // PiP LAYOUT (Discord-like)
  // --------------------------------------------------------
  if (isPip) {
    let pipTrack = focusedTrack || visibleTracks.find(t => t.source === Track.Source.ScreenShare) || visibleTracks[0];

    return (
      <div className="relative w-full h-full bg-black overflow-hidden group/pip">
        {pipTrack ? (
          <CustomParticipantTile trackRef={pipTrack as any} isFocused isPip={true} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
            Ожидание видео...
          </div>
        )}

        {/* Discord-like Overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/pip:opacity-100 transition-opacity duration-300" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 via-black/20 to-transparent opacity-0 group-hover/pip:opacity-100 transition-opacity duration-300" />

        {/* Top left */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-auto opacity-0 group-hover/pip:opacity-100 transition-opacity duration-300">
          <ArrowLeft size={16} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          <span className="text-white font-medium text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide">
            Голосовой канал
          </span>
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center pointer-events-auto opacity-0 group-hover/pip:opacity-100 transition-opacity duration-300">
           <span className="text-white font-medium text-[13px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
             {pipTrack ? pipTrack.participant.name || pipTrack.participant.identity : "Ожидание..."} 
           </span>
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2.5 pointer-events-auto opacity-0 group-hover/pip:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mr-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
            <Eye size={14} />
            <span className="text-xs font-bold">{participants.length}</span>
          </div>
          <button onClick={() => router.push("/messages")} title="Вернуться к чату" className="text-white hover:text-white transition-transform hover:scale-105 active:scale-95 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-xl shadow-lg">
            <ExternalLink size={14} className="ml-0.5" />
          </button>
          <button onClick={onLeave} title="Отключиться" className="text-white hover:text-white transition-transform hover:scale-105 active:scale-95 bg-danger/80 hover:bg-danger border border-danger/50 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-xl shadow-lg shadow-danger/20">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // GRID LAYOUT (Default)
  // --------------------------------------------------------
  if (!focusedTrack) {
    let gridClass = "grid gap-3 w-full h-full p-4 overflow-y-auto";
    if (visibleTracks.length === 1) gridClass += " grid-cols-1";
    else if (visibleTracks.length === 2) gridClass += " grid-cols-2";
    else if (visibleTracks.length <= 4) gridClass += " grid-cols-2 grid-rows-2";
    else gridClass += " grid-cols-3 grid-rows-2";

    return (
      <div className="relative w-full h-full">
        {/* Layout Controls */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-2xl rounded-full p-1 border border-white/10">
          <IconButton onClick={() => setVideoOnly(!videoOnly)} size="sm" className={`text-white rounded-full w-8 h-8 flex items-center justify-center ${videoOnly ? "bg-primary" : "hover:bg-white/15"}`}>
            <Video size={14} />
          </IconButton>
        </div>

        <div className={gridClass}>
          {visibleTracks.map((trackRef) => {
            const id = `${trackRef.participant.identity}-${trackRef.source}`;
            return (
              <div key={id} className="relative w-full h-full cursor-pointer" onClick={() => handleFocus(id)}>
                <CustomParticipantTile trackRef={trackRef as any} />
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-md rounded-full p-1.5 cursor-pointer">
                  <LayoutList size={14} className="text-white" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // FOCUS LAYOUT
  // --------------------------------------------------------
  const otherTracks = visibleTracks.filter(t => `${t.participant.identity}-${t.source}` !== `${focusedTrack?.participant.identity}-${focusedTrack?.source}`);

  return (
    <div className="relative w-full h-full flex flex-col p-4 gap-3 bg-black">
      {/* Layout Controls */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-2xl rounded-full p-1 border border-white/10">
        <IconButton onClick={() => setFocusedTrackId(null)} size="sm" className="text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/15">
          <LayoutGrid size={14} />
        </IconButton>
        <IconButton onClick={() => setVideoOnly(!videoOnly)} size="sm" className={`text-white rounded-full w-8 h-8 flex items-center justify-center ${videoOnly ? "bg-primary" : "hover:bg-white/15"}`}>
          <Video size={14} />
        </IconButton>
        {otherTracks.length > 0 && (
          <IconButton 
            onClick={() => setIsParticipantsHidden(!isParticipantsHidden)} 
            size="sm" 
            className={`text-white rounded-full w-8 h-8 flex items-center justify-center ${isParticipantsHidden ? "bg-white/20" : "hover:bg-white/15"}`}
          >
            {isParticipantsHidden ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </IconButton>
        )}
      </div>

      {/* Main Focused Video */}
      <div className={`w-full min-h-0 rounded-3xl overflow-hidden relative transition-all duration-300 ${isParticipantsHidden || otherTracks.length === 0 ? "flex-1" : "flex-1"}`} onClick={() => setFocusedTrackId(null)}>
        <CustomParticipantTile trackRef={focusedTrack as any} isFocused />
      </div>

      {/* Bottom Strip of other participants — collapsible like Discord */}
      {otherTracks.length > 0 && (
        <div className={`w-full flex-shrink-0 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 transition-all duration-300 ease-in-out ${
          isParticipantsHidden ? "h-0 opacity-0 pointer-events-none overflow-hidden" : "h-32 opacity-100"
        }`}>
          {otherTracks.map((trackRef) => {
            const id = `${trackRef.participant.identity}-${trackRef.source}`;
            return (
              <div key={id} className="h-full aspect-video flex-shrink-0 relative cursor-pointer" onClick={() => handleFocus(id)}>
                <CustomParticipantTile trackRef={trackRef as any} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
