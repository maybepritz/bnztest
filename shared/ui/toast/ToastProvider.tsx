"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Toast, ToastProps, ToastVariant } from "./Toast";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

interface ToastData extends Omit<ToastProps, "isVisible" | "isStandalone" | "onClose"> {
  id: string;
  isClosing?: boolean;
  isClosable?: boolean;
  onClose?: () => void;
}

interface ToastContextType {
  toast: (props: Omit<ToastData, "id">) => string;
  success: (message: ReactNode, options?: Partial<ToastData>) => string;
  error: (message: ReactNode, options?: Partial<ToastData>) => string;
  info: (message: ReactNode, options?: Partial<ToastData>) => string;
  warning: (message: ReactNode, options?: Partial<ToastData>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

function ToastContainer({ 
  pos, 
  toasts, 
  removeToast 
}: { 
  pos: ToastData['position']; 
  toasts: ToastData[]; 
  removeToast: (id: string) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isTop = pos?.includes("top");
  const isCenter = pos?.includes("center");
  const sign = isTop ? 1 : -1;

  const visibleToasts = toasts.slice(-5);

  return (
    <div 
      className={cn(
        "fixed z-[100] pointer-events-none flex flex-col",
        pos?.includes("top") ? "top-6" : "bottom-6",
        pos?.includes("left") ? "left-6" : pos?.includes("right") ? "right-6" : "left-1/2"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {visibleToasts.map((t, index) => {
        const frontIndex = visibleToasts.length - 1 - index;
        const isClosing = t.isClosing;

        const baseTransform = isCenter ? "translateX(-50%) " : "";
        const translateY = isExpanded ? frontIndex * sign * 72 : frontIndex * sign * 14;
        const scale = isExpanded ? 1 : 1 - frontIndex * 0.05;
        const opacity = isExpanded ? 1 : (frontIndex >= 3 ? 0 : 1 - frontIndex * 0.1);

        return (
          <div 
            key={t.id} 
            className="absolute pointer-events-auto transition-all duration-400 ease-out w-max"
            style={{
              zIndex: 100 - frontIndex,
              transform: `${baseTransform}translateY(${translateY}px) scale(${scale})`,
              opacity,
              bottom: isTop ? 'auto' : 0,
              top: isTop ? 0 : 'auto',
              right: pos?.includes("right") ? 0 : 'auto',
              left: (pos?.includes("left") || isCenter) ? 0 : 'auto',
              transformOrigin: isTop ? (isCenter ? "top center" : "top") : (isCenter ? "bottom center" : "bottom"),
            }}
          >
            <Toast 
              {...t} 
              isVisible={!isClosing} 
              isStandalone={false}
              onClose={t.isClosable === false ? undefined : () => {
                t.onClose?.();
                removeToast(t.id);
              }} 
            />
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((props: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Add isClosing: true initially, then immediately set it to false so it animates in!
    setToasts(prev => [...prev, { ...props, id, isClosing: true }]);
    
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, isClosing: false } : t));
    }, 10);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, isClosing: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 400);
  }, []);

  const createVariant = useCallback((variant: ToastVariant, defaultTime: number) => {
    return (message: ReactNode, options?: Partial<ToastData>) => {
      return addToast({ children: message, variant, autoClose: defaultTime, ...options });
    };
  }, [addToast]);

  const success = createVariant("success", 3000);
  const error = createVariant("error", 4000);
  const info = createVariant("info", 3000);
  const warning = createVariant("warning", 4000);

  const positions: ToastData['position'][] = [
    "top-left", "top-center", "top-right", 
    "bottom-left", "bottom-center", "bottom-right"
  ];

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning, removeToast }}>
      {children}
      {typeof document !== "undefined" && createPortal(
        <>
          {positions.map(pos => {
            const posToasts = toasts.filter(t => (t.position || "bottom-right") === pos);
            if (posToasts.length === 0) return null;
            return <ToastContainer key={pos} pos={pos} toasts={posToasts} removeToast={removeToast} />;
          })}
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
