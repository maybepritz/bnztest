"use client";

import { useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Spinner, IconButton } from "@/shared/ui";
import { VoiceRoom, getVoiceTokenAction } from "@/features/voice-room";
import { useCallState } from "@/shared/hooks/useCallState";
import { CallTimer } from "./CallTimer";

interface ChatVoicePanelProps {
  roomName: string;
  isPip?: boolean;
}

export function ChatVoicePanel({ roomName, isPip }: ChatVoicePanelProps) {
  const { isCalling, endCall } = useCallState();
  
  const [token, setToken] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected">("idle");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLeft = useRef(false);

  useEffect(() => {
    if (isCalling && !token) {
      hasLeft.current = false;
      setConnectionState("connecting");
      getVoiceTokenAction(roomName)
        .then(t => {
          setToken(t);
          setConnectionState("connected");
          const chatId = roomName.replace("chat-", "");
          fetch("/api/voice/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId })
          }).catch(console.error);
        })
        .catch((e) => {
          console.error("Token error:", e);
          setConnectionState("idle");
          handleLeave();
        });
    }
    
    if (!isCalling && token) {
      if (!hasLeft.current) {
        hasLeft.current = true;
        const chatId = roomName.replace("chat-", "");
        fetch("/api/voice/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId })
        }).catch(console.error);
      }

      setToken(null);
      setConnectionState("idle");
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    }
  }, [isCalling, roomName, token]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleLeave = () => {
    endCall();
  };

  if (!isCalling) return null;

  return (
    <div 
      ref={containerRef}
      className={`group flex-shrink-0 w-full bg-black relative overflow-hidden transition-all duration-300 animate-scale-in origin-top ${
        isFullscreen ? "h-screen border-none" : isPip ? "h-[200px]" : "h-[300px] border-b border-white/5"
      }`}
    >
      {/* Show timer only when connected */}
      {connectionState === "connected" && <CallTimer />}
      
      <div className="absolute top-4 right-4 z-20">
        <IconButton 
          onClick={toggleFullscreen} 
          variant="glass" 
          size="sm"
          className="text-white hover:text-white bg-black/50 backdrop-blur-xl hover:bg-white/10 border border-white/10 rounded-full"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </IconButton>
      </div>

      {token ? (
        <VoiceRoom 
          roomName={roomName} 
          token={token} 
          onLeave={handleLeave} 
          isPip={isPip}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4">
          {/* Pulsing rings behind spinner */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full border border-white/10 animate-ping" />
            <div className="absolute w-14 h-14 rounded-full border border-white/5 animate-pulse" />
            <Spinner size={32} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/70 text-sm font-medium">Подключение...</span>
            <span className="text-white/30 text-xs">Устанавливаем соединение</span>
          </div>
        </div>
      )}
    </div>
  );
}
