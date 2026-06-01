"use client";

import { useOnlinePresence } from "@/shared/hooks/useOnlinePresence";
import { SessionProvider } from "@/shared/lib/session";
import { ToastProvider } from "@/shared/ui";
import { NotificationsWebSocket } from "@/shared/hooks/useNotificationsWebSocket";
import { AudioProvider } from "@/shared/hooks/useAudio";

function OnlinePresenceTracker({ children }: { children: React.ReactNode }) {
  useOnlinePresence();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AudioProvider>
        <ToastProvider>
          <NotificationsWebSocket />
          <OnlinePresenceTracker>{children}</OnlinePresenceTracker>
        </ToastProvider>
      </AudioProvider>
    </SessionProvider>
  );
}
