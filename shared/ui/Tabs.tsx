"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./Button";

interface TabsProps {
  defaultValue: string;
  tabs: { value: string; label: ReactNode; content: ReactNode }[];
  className?: string;
}

export function Tabs({ defaultValue, tabs, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex p-1.5 bg-surface-hover/50 rounded-full border border-border/50 shadow-sm isolate">
        <div 
          className="absolute left-1.5 inset-y-1.5 rounded-full transition-all duration-300 ease-out -z-10"
          style={{
            width: `calc((100% - 12px) / ${tabs.length})`,
            transform: `translateX(calc(${tabs.findIndex(t => t.value === activeTab)} * 100%))`,
            background: "var(--primary)",
            boxShadow: "0 0 16px color-mix(in srgb, var(--primary) 10%, transparent)",
          }}
        />
        {tabs.map((tab) => (
          <Button
            variant="ghost"
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="w-full rounded-full border-none shadow-none relative z-10 hover:bg-transparent"
            style={{ 
              color: activeTab === tab.value ? "var(--inverse)" : "var(--secondary)",
              transition: "color 300ms ease-out"
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="mt-4 focus:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tabs.find((t) => t.value === activeTab)?.content}
      </div>
    </div>
  );
}
