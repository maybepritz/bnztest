"use client";

import { cn } from "@/shared/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group select-none", className)}>
      <div className={cn(
        "relative w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center shrink-0",
        checked ? "border-primary bg-primary" : "border-border bg-surface-secondary group-hover:border-primary/50 group-hover:bg-surface-hover"
      )}>
        {checked && <Check size={14} strokeWidth={3} className="text-inverse animate-scale-in" />}
      </div>
      {label && <span className={cn("text-sm transition-colors duration-300", checked ? "text-primary font-medium" : "text-secondary font-medium group-hover:text-primary")}>{label}</span>}
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
    </label>
  );
}
