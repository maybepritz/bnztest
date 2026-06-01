"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui";
import { PhoneCall } from "lucide-react";
import { useCallState } from "@/shared/hooks/useCallState";

export function ActiveCallBanner({ chatId }: { chatId: string }) {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const { isCalling, startCall } = useCallState();

  useEffect(() => {
    fetch("/api/voice/active")
      .then(res => res.json())
      .then(data => {
        if (data[chatId]) {
          setActiveUsers(data[chatId]);
        }
      })
      .catch(console.error);

    const handleCallUpdate = (e: CustomEvent) => {
      const data = e.detail;
      if (data.chatId === chatId) {
        setActiveUsers(data.activeParticipants || []);
      }
    };

    window.addEventListener("call:update" as any, handleCallUpdate);
    return () => window.removeEventListener("call:update" as any, handleCallUpdate);
  }, [chatId]);

  const uniqueUsersCount = new Set(activeUsers).size;

  if (uniqueUsersCount === 0 || isCalling) return null;

  const handleJoin = () => {
    startCall(`chat-${chatId}`);
  };

  return (
    <div className="mx-4 mt-4 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center before:absolute before:inset-0 before:rounded-full before:border-2 before:border-emerald-400/30 before:animate-ping">
          <div className="w-10 h-10 bg-success/20 text-success rounded-full flex items-center justify-center">
            <PhoneCall size={20} />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-primary text-sm">Идет голосовой звонок</h4>
          <p className="text-secondary text-xs">В звонке {uniqueUsersCount} участник(ов)</p>
        </div>
      </div>
      
      <Button variant="primary" size="sm" onClick={handleJoin} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-full px-6 w-full sm:w-auto">
        Присоединиться
      </Button>
    </div>
  );
}
