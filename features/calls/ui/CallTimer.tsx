"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function CallTimer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const displayMins = mins % 60;

  const formatted = hrs > 0 
    ? `${hrs}:${String(displayMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(displayMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-2xl border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <Clock size={14} className="text-success" />
      <span className="text-white text-xs font-mono font-medium">{formatted}</span>
    </div>
  );
}
