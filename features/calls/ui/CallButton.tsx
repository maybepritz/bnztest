"use client";

import { Phone } from "lucide-react";
import { IconButton } from "@/shared/ui";
import { useCallState } from "@/shared/hooks/useCallState";

interface CallButtonProps {
  roomName: string;
}

export function CallButton({ roomName }: CallButtonProps) {
  const { isCalling, toggleCall } = useCallState();

  const handleStartCall = () => {
    if (!isCalling) {
      // Notify other participants (non-blocking)
      const chatId = roomName.replace("chat-", "");
      fetch("/api/voice/ring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId })
      }).catch(console.error);
    }
    toggleCall(roomName);
  };

  return (
    <IconButton 
      variant="ghost" 
      className={`rounded-full transition-colors ${isCalling ? "bg-accent/20 text-accent" : "hover:bg-background/50 text-secondary"}`}
      onClick={handleStartCall}
    >
      <Phone size={18} className={isCalling ? "text-accent" : "text-secondary"} />
    </IconButton>
  );
}
