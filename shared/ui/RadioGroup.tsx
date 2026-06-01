"use client";

import { cn } from "@/shared/lib/utils";
import { createContext, useContext } from "react";

const RadioGroupContext = createContext<{
  name: string;
  value: string;
  onChange: (value: string) => void;
} | null>(null);

export function RadioGroup({ 
  name, 
  value, 
  onChange, 
  children, 
  className 
}: { 
  name: string; 
  value: string; 
  onChange: (v: string) => void; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange }}>
      <div className={cn("flex flex-col gap-3", className)} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioItem({ value, label, className }: { value: string; label: string; className?: string }) {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioItem must be used within RadioGroup");

  const checked = ctx.value === value;

  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group select-none", className)}>
      <div className={cn(
        "relative w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
        checked ? "border-primary bg-transparent" : "border-border bg-surface-secondary group-hover:border-primary/50 group-hover:bg-surface-hover"
      )}>
        {checked && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-scale-in" />}
      </div>
      <span className={cn("text-sm transition-colors", checked ? "text-primary font-medium" : "text-secondary font-medium group-hover:text-primary")}>{label}</span>
      <input 
        type="radio" 
        name={ctx.name} 
        value={value} 
        checked={checked} 
        onChange={() => ctx.onChange(value)}
        className="hidden"
      />
    </label>
  );
}
