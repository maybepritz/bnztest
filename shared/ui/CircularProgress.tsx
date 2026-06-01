"use client";

import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";

export interface CircularProgressProps {
  value: number;
  size?: number;
  className?: string;
}



const WAVY_PATH = (() => {
  let d = "";
  const R = 20; 
  const A = 1.2;  
  const N = 12; 
  for (let i = 0; i <= 360; i += 2) {
    const theta = (i * Math.PI) / 180;
    const r = R + A * Math.sin(N * theta);
    const x = 24 + r * Math.cos(theta);
    const y = 24 + r * Math.sin(theta);
    if (i === 0) d += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
    else d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d;
})();

export function CircularProgress({ 
  value, 
  size = 48, 
  className 
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));
  const isCompleted = percentage === 100;
  const [isShrinking, setIsShrinking] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => setIsShrinking(true), 600);
      return () => clearTimeout(timer);
    } else {
      setIsShrinking(false);
    }
  }, [isCompleted]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("transform -rotate-90", className)}
    >
      {/* Фоновый круг (прямой) */}
      <circle
        cx="24" cy="24" r="20"
        fill="none" stroke="currentColor" strokeWidth="3"
        className="text-surface-secondary transition-opacity duration-300"
        style={{ opacity: isCompleted ? 0 : 1 }}
      />

      {/* Заполненный прогресс (волнистый) */}
      <path
        d={WAVY_PATH}
        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
        pathLength="100" strokeDasharray="100" strokeDashoffset={100 - percentage}
        className="text-primary transition-all duration-300 ease-out"
        style={{ opacity: isCompleted ? 0 : 1 }}
      />

      {/* Ровный заполненный круг (для всасывания) */}
      <circle
        cx="24" cy="24" r="20"
        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
        pathLength="100" strokeDasharray="100"
        className="text-primary transition-all duration-500 ease-out"
        style={{ 
          opacity: isCompleted ? 1 : 0,
          strokeDashoffset: isShrinking ? -100 : 0 
        }}
      />
    </svg>
  );
}
