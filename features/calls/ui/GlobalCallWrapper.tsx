"use client";

import { useCallState } from "@/shared/hooks/useCallState";
import { ChatVoicePanel } from "./ChatVoicePanel";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";
import { IconButton } from "@/shared/ui";
import { useRouter } from "next/navigation";

export function GlobalCallWrapper() {
  const { isCalling, activeRoom } = useCallState();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  const router = useRouter();

  useEffect(() => {
    if (!activeRoom) {
      setAnchor(null);
      return;
    }
    
    const check = () => {
      const el = document.getElementById(`call-anchor-${activeRoom}`);
      setAnchor(prev => prev !== el ? el : prev);
    };
    
    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, [activeRoom]);

  useEffect(() => {
    if (typeof window !== "undefined" && !position) {
      setPosition({
        x: window.innerWidth - 320 - 24,
        y: window.innerHeight - 200 - 24
      });
    }
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !pipRef.current) return;
      e.preventDefault();
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      // Direct DOM update for 60fps dragging
      pipRef.current.style.left = `${newX}px`;
      pipRef.current.style.top = `${newY}px`;
    };

    const handleMouseUp = () => {
      if (!isDragging.current || !pipRef.current) return;
      isDragging.current = false;
      
      // Jelly bounce transition
      pipRef.current.style.transition = "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
      
      const padding = 24;
      const width = 320;
      const height = pipRef.current.offsetHeight || 200;
      
      const currentX = parseFloat(pipRef.current.style.left);
      let currentY = parseFloat(pipRef.current.style.top);
      
      let targetX = currentX;
      let targetY = currentY;
      
      // Horizontal snap
      const distLeft = currentX;
      const distRight = window.innerWidth - (currentX + width);
      
      if (distLeft < distRight) {
        targetX = padding;
      } else {
        targetX = window.innerWidth - width - padding;
      }
      
      // Vertical bounds
      if (targetY < padding + 72) targetY = padding + 72;
      if (targetY + height > window.innerHeight - padding) targetY = window.innerHeight - height - padding;
      
      pipRef.current.style.left = `${targetX}px`;
      pipRef.current.style.top = `${targetY}px`;
      
      setPosition({ x: targetX, y: targetY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!isCalling || !activeRoom) return null;

  const content = <ChatVoicePanel roomName={activeRoom} isPip={!anchor} />;

  if (anchor) {
    return createPortal(content, anchor);
  }

  const chatId = activeRoom.replace("chat-", "");

  if (!position) return null; // Wait for client hydration for positioning

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!pipRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    isDragging.current = true;
    pipRef.current.style.transition = "none"; // Disable transition while dragging

    const rect = pipRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  return (
    <div 
      ref={pipRef}
      onMouseDown={handleMouseDown}
      style={{ left: position.x, top: position.y }}
      className="fixed z-[9999] w-[320px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-white/10 bg-black animate-scale-in group touch-none select-none"
    >
       {content}
    </div>
  );
}
