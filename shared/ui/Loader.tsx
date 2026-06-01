"use client";

import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";

// const CIRCLE = "M 24 4 C 35.04 4 44 12.96 44 24 C 44 35.04 35.04 44 24 44 C 12.96 44 4 35.04 4 24 C 4 12.96 12.96 4 24 4 Z";
const SQUIRCLE = "M 24 4 C 42 4 44 6 44 24 C 44 42 42 44 24 44 C 6 44 4 42 4 24 C 4 6 6 4 24 4 Z";
const STAR_SHARP = "M 24 4 C 24 16 32 24 44 24 C 32 24 24 32 24 44 C 24 32 16 24 4 24 C 16 24 24 16 24 4 Z";
const CLOVER = "M 24 4 C 40 -5 53 8 44 24 C 53 40 40 53 24 44 C 8 53 -5 40 4 24 C -5 8 8 -5 24 4 Z";
const DIAMOND = "M 24 4 C 24 4 44 24 44 24 C 44 24 24 44 24 44 C 24 44 4 24 4 24 C 4 24 24 4 24 4 Z";
const SQUARE = "M 24 4 C 44 4 44 4 44 24 C 44 44 44 44 24 44 C 4 44 4 44 4 24 C 4 4 4 4 24 4 Z";

const ALL_SHAPES = [SQUIRCLE, STAR_SHARP, CLOVER, DIAMOND, SQUARE];
const DEFAULT_SEQUENCE = `${STAR_SHARP}; ${SQUARE}; ${CLOVER}; ${DIAMOND}; ${SQUIRCLE}; ${STAR_SHARP}`;

export function Spinner({ className, size = 48 }: { className?: string; size?: number }) {
  const [sequence, setSequence] = useState(DEFAULT_SEQUENCE);

  useEffect(() => {
    const shuffled = [...ALL_SHAPES].sort(() => Math.random() - 0.5);
    shuffled.push(shuffled[0]); // замыкаем цикл, чтобы не было дерганий в конце анимации
    setSequence(shuffled.join("; "));
  }, []);

  const count = ALL_SHAPES.length;
  const keyTimes = Array.from({ length: count + 1 }).map((_, i) => (i / count).toFixed(3)).join("; ");
  const keySplines = Array.from({ length: count }).map(() => "0.85 0 0.15 1").join("; ");

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      className={cn("text-primary", className)}
      style={{ animation: 'm3-circular-rotate 5s linear infinite' }}
    >
      <path fill="currentColor">
        <animate 
          attributeName="d" 
          dur="5s" 
          repeatCount="indefinite" 
          calcMode="spline"
          keyTimes={keyTimes}
          keySplines={keySplines}
          values={sequence}
        />
      </path>
    </svg>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-surface-hover/80", className)}
      {...props}
    />
  );
}
