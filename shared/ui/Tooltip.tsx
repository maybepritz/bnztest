"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className="relative flex items-center justify-center group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={cn(
            "absolute z-50 px-3 py-1.5 text-xs font-medium bg-surface/50 backdrop-blur-2xl text-primary rounded-2xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 shadow-elevated",
            positions[position],
            className
          )}
        >
          {content}
          <div className={cn(
            "absolute w-2 h-2 bg-surface/50 backdrop-blur-2xl rotate-45",
            position === "top" && "-bottom-1 left-1/2 -translate-x-1/2",
            position === "bottom" && "-top-1 left-1/2 -translate-x-1/2",
            position === "left" && "-right-1 top-1/2 -translate-y-1/2",
            position === "right" && "-left-1 top-1/2 -translate-y-1/2"
          )} />
        </div>
      )}
    </div>
  );
}
