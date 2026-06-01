"use client";

import { useEffect } from 'react';
import { useSession } from '@/shared/lib/session';

export function useOnlinePresence() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const pingBackend = () => {
      fetch("/api/ping", { 
        method: "POST"
      }).catch(console.error);
    };

    pingBackend();

    const interval = setInterval(pingBackend, 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);
}
