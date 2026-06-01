"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/shared/lib/session";

export function useTypingIndicator(targetUsername: string) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for typing events from WebSocket
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      // e.detail contains the typing payload
      // We check if the person typing is our target user
      if (e.detail?.username === targetUsername) {
        setIsTyping(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };
    window.addEventListener("typing:indicator" as any, handler);
    return () => {
      window.removeEventListener("typing:indicator" as any, handler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [targetUsername]);

  return isTyping;
}

export function useSendTyping(targetUsername: string) {
  const lastSent = useRef(0);
  const { data: session } = useSession();
  
  const sendTyping = useCallback(() => {
    if (!session) return;
    
    const now = Date.now();
    // throttle to send max once every 2 seconds
    if (now - lastSent.current < 2000) return; 
    lastSent.current = now;
    
    // Send to Next.js API route that proxies to Java backend
    fetch(`/api/chat/${targetUsername}/typing`, { 
      method: "POST" 
    }).catch(() => {});
  }, [targetUsername, session]);

  return sendTyping;
}
