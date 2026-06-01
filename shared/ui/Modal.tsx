"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { IconButton } from "./IconButton";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = "md" }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
      />

      {/* Modal Box */}
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-surface rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col animate-scale-in`}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          {description && <p className="text-[15px] text-secondary mt-1 text-center">{description}</p>}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-0 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );

  // Use createPortal to mount the modal directly into the document body
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
