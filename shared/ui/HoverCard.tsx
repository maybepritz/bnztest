"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { createPortal } from "react-dom";

interface HoverCardProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export function HoverCard({ trigger, children, className, side = "bottom" }: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, transformOrigin: 'center top' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (containerRef.current && popupRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      
      let renderLeft = rect.left + (rect.width / 2) - (popupRect.width / 2);
      let originX = "center";
      
      if (renderLeft < 16) {
        renderLeft = 16;
        originX = "left";
      } else if (renderLeft + popupRect.width > window.innerWidth - 16) {
        renderLeft = window.innerWidth - popupRect.width - 16;
        originX = "right";
      }

      let actualSide = side;
      if (side === "bottom" && rect.bottom + 8 + popupRect.height > window.innerHeight - 16) {
        if (rect.top - 8 - popupRect.height >= 16) actualSide = "top";
      } else if (side === "top" && rect.top - 8 - popupRect.height < 16) {
        if (rect.bottom + 8 + popupRect.height <= window.innerHeight - 16) actualSide = "bottom";
      }
      
      let renderTop = actualSide === "bottom" ? rect.bottom + 8 : rect.top - popupRect.height - 8;
      
      setCoords({
        top: renderTop + window.scrollY,
        left: renderLeft + window.scrollX,
        transformOrigin: `${actualSide === "bottom" ? "top" : "bottom"} ${originX}`
      });
    }
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      // Need a tiny delay for popupRef to be populated and rendered
      requestAnimationFrame(() => {
        updatePosition();
        setIsVisible(true);
      });
    }
  }, [isOpen]);

  const handleMouseLeave = () => {
    setIsVisible(false);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {trigger}
      {isOpen && mounted && createPortal(
        <div 
          id="hovercard-portal-root"
          className="absolute z-[9999]"
          style={{ top: coords.top, left: coords.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            ref={popupRef}
            style={{ transformOrigin: coords.transformOrigin }}
            className={cn(
              "w-64 p-4 bg-surface/70 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 transition-all duration-200 ease-out",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
              className
            )}
          >
            {children}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
