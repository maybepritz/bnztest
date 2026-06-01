"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Progress } from "../Progress";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";
export type ToastPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right";

export interface ToastProps {
  isVisible: boolean;
  children: ReactNode;
  position?: ToastPosition;
  variant?: ToastVariant;
  autoClose?: number;
  onClose?: () => void;
  className?: string;
  isStandalone?: boolean;
}

export function Toast({ 
  isVisible, 
  children, 
  position = "bottom-center", 
  variant = "default",
  autoClose,
  onClose,
  className,
  isStandalone = true
}: ToastProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Progress bar logic
  useEffect(() => {
    if (!autoClose || !isVisible || isHovered) return;
    
    const elapsedSoFar = autoClose * (progress / 100);
    const startTime = Date.now() - elapsedSoFar;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / autoClose) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        onClose?.();
      }
    }, 10);
    
    return () => clearInterval(interval);
  }, [autoClose, isVisible, isHovered, onClose, progress]);

  useEffect(() => {
    if (isVisible) setProgress(0);
  }, [isVisible]);

  // Swipe logic
  const [translateX, setTranslateX] = useState(0);
  const startX = useRef<number>(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX.current;
    
    // Allow swipe away relative to position
    if (position.includes('right') && diff < 0) return;
    if (position.includes('left') && diff > 0) return;
    
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (Math.abs(translateX) > 80) {
      onClose?.();
    } else {
      setTranslateX(0); // Snap back
    }
  };

  const variantStyles = {
    default: "border-border bg-surface/10 backdrop-blur-2xl",
    success: "border-success/30 bg-success/10 backdrop-blur-2xl",
    error: "border-danger/30 bg-danger/10",
    warning: "border-warning/30 bg-warning/10",
    info: "border-info/30 bg-info/10",
  };

  const Icon = {
    default: null,
    success: <CheckCircle className="text-success shrink-0" size={20} />,
    error: <AlertCircle className="text-danger shrink-0" size={20} />,
    warning: <AlertTriangle className="text-warning shrink-0" size={20} />,
    info: <Info className="text-info shrink-0" size={20} />,
  }[variant];

  const standalonePositionClasses = {
    "top-left": "top-6 left-6",
    "top-center": "top-6 left-1/2 -translate-x-1/2",
    "top-right": "top-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-10 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-6 right-6",
  };

  const hiddenClasses = {
    "top-left": "-translate-x-10 opacity-0 invisible",
    "top-center": "-translate-y-8 opacity-0 invisible",
    "top-right": "translate-x-10 opacity-0 invisible",
    "bottom-left": "-translate-x-10 opacity-0 invisible",
    "bottom-center": "translate-y-8 opacity-0 invisible",
    "bottom-right": "translate-x-10 opacity-0 invisible",
  };

  const visibleClasses = "translate-y-0 translate-x-0 opacity-100 visible";

  const waveColorStyles = {
    default: "text-primary/50",
    success: "text-success",
    error: "text-danger",
    warning: "text-warning",
    info: "text-info",
  };

  const borderColorStyles = {
    default: "bg-border",
    success: "bg-success/30",
    error: "bg-danger/30",
    warning: "bg-warning/30",
    info: "bg-info/30",
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 shadow-2xl transition-all duration-300 relative",
        "px-4 pt-3 backdrop-blur-md",
        (autoClose && isVisible) ? "rounded-t-lg border border-b-0 pb-[13px]" : "rounded-lg border pb-3",
        variantStyles[variant],
        isStandalone && "fixed z-50",
        isStandalone && standalonePositionClasses[position],
        isVisible ? visibleClasses : hiddenClasses[position],
        isDragging.current ? "transition-none" : "transition-transform",
        className
      )}
      style={{ transform: translateX ? `translateX(${translateX}px)` : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={(e) => {
        setIsHovered(false);
        handleTouchEnd();
      }}
    >
      <div className="relative z-10 flex items-center gap-3 w-full">
        {Icon}
        {typeof children === 'string' ? (
          <span className="flex-1 text-[14px] text-primary font-medium">{children}</span>
        ) : (
          <div className="flex-1 flex items-center">{children}</div>
        )}
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-secondary hover:text-primary transition-colors shrink-0 p-1 ml-2"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Unfilled straight bottom border */}
      {Boolean(autoClose) && isVisible && (
        <div 
          className={cn("absolute bottom-0 right-0 h-[1px] transition-all duration-75", borderColorStyles[variant])}
          style={{ width: `${100 - progress}%` }}
        />
      )}

      {/* Wavy Bottom Border Progress */}
      {Boolean(autoClose) && isVisible && (
        <div 
          className="absolute bottom-[-8px] left-0 overflow-hidden pointer-events-none"
          style={{ width: `${progress}%`, height: '16px' }}
        >
          <div className={cn("h-full w-max animate-wave flex items-center", waveColorStyles[variant])}>
            {Array.from({ length: 50 }).map((_, i) => (
              <svg key={i} width="24" height="16" viewBox="0 0 24 16" className="shrink-0">
                <path d="M 0 8 Q 6 5, 12 8 T 24 8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
