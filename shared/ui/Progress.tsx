"use client";

import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: { value?: number; className?: string }) {
  const isIndeterminate = value === undefined;
  const percentage = isIndeterminate ? 100 : Math.min(100, Math.max(0, value));
  const isCompleted = !isIndeterminate && percentage === 100;
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
    <div className={cn("relative w-full h-4 flex items-center", className)}>
      
      {/* Заполненная часть (волна или прямая) */}
      <div 
        className="absolute top-0 h-full overflow-hidden transition-all duration-500 ease-in-out"
        style={{ 
          width: isShrinking ? '0%' : (percentage === 0 ? '0%' : `calc(${percentage}% - 2px)`),
          left: isShrinking ? '50%' : '0%',
          opacity: percentage === 0 && !isCompleted ? 0 : 1
        }}
      >
        {/* Прямая линия (показывается при 100%) */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.75 bg-primary rounded-full transition-opacity duration-300"
          style={{ opacity: isCompleted ? 1 : 0 }}
        />

        {/* Волнистая линия (скрывается при 100%) */}
        <div 
          className="absolute inset-0 h-full flex items-center transition-opacity duration-300"
          style={{ opacity: isCompleted ? 0 : 1 }}
        >
          <svg width="calc(100% + 24px)" height="16" className="animate-wave text-primary shrink-0">
            <defs>
              <pattern id="wave-pattern" x="0" y="0" width="24" height="16" patternUnits="userSpaceOnUse">
                <path d="M 0 8 Q 6 5, 12 8 T 24 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#wave-pattern)" />
          </svg>
        </div>
      </div>

      {/* Фоновая прямая линия (незаполненная часть) */}
      <div 
        className="absolute h-0.75 bg-surface-secondary rounded-full overflow-hidden shadow-inner transition-all duration-500 ease-out"
        style={{ 
          left: isCompleted ? '50%' : (percentage === 0 ? '0%' : `calc(${percentage}% + 2px)`),
          width: isCompleted ? '0%' : (percentage === 0 ? '100%' : `calc(${100 - percentage}% - 2px)`),
          opacity: isCompleted ? 0 : 1
        }}
      />
    </div>
  );
}
