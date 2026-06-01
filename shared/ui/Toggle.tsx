"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "glass";
}

export function Toggle({ 
  checked, 
  onChange, 
  className = "", 
  disabled = false, 
  variant = "default" 
}: ToggleProps) {
  const inactiveBg = variant === "glass" ? "bg-white/20" : "bg-border";
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all duration-300 ease-in-out relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-primary" : inactiveBg} ${className}`}
    >
      <span 
        className={`block w-5 h-5 bg-surface rounded-full shadow-md absolute top-0.5 transition-all duration-300 ease-in-out ${checked ? "translate-x-5" : "translate-x-0.5"}`} 
      />
    </button>
  );
}
