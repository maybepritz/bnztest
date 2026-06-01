"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";

interface DropdownMenuProps {
  /** Элемент, по клику на который открывается меню */
  trigger: ReactNode;
  /** Содержимое меню (DropdownItem, DropdownDivider) */
  children: ReactNode;
  /** Выравнивание выпадающего окна относительно триггера */
  align?: "left" | "right" | "center";
  /** Дополнительные классы для контейнера меню */
  className?: string;
}

import { createPortal } from "react-dom";

export function DropdownMenu({ trigger, children, align = "right", className = "" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Обработка клика вне меню и нажатия Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // We also need to check if they clicked inside the portal
        const portal = document.getElementById("dropdown-portal-root");
        if (portal && portal.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      
      // Update coords
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: "left-0 origin-top-left",
    right: "right-0 origin-top-right",
    center: "left-1/2 -translate-x-1/2 origin-top",
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="cursor-pointer inline-block">
        {trigger}
      </div>

      {isOpen && mounted && createPortal(
        <div id="dropdown-portal-root" style={{ position: 'absolute', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}>
          <div
            className={`absolute mt-2 w-fit min-w-50 max-w-[320px] bg-surface/70 backdrop-blur-2xl border-white/5 shadow-2xl rounded-xl border animate-scale-in flex flex-col ${alignmentClasses[align]} ${className}`}
          >
            <div className="p-1 flex flex-col" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  danger?: boolean;
}

export function DropdownItem({ children, icon, danger, className = "", ...props }: DropdownItemProps) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm rounded-xl flex items-center gap-3 transition-colors outline-none
        ${danger ? "text-danger hover:bg-danger/10" : "text-primary hover:bg-surface-hover"} 
        ${className}`}
      {...props}
    >
      {icon && <span className={`${danger ? "text-danger" : "text-secondary"} shrink-0`}>{icon}</span>}
      <span className="truncate font-medium">{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="h-px w-full bg-border/40 my-1" />;
}
