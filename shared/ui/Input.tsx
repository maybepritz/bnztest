import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-base font-medium tracking-widest text-secondary"  
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg p-4 text-base transition-all duration-200",
              "focus:outline-none focus:ring-1",
              leftIcon    && "pl-10",
              rightElement && "pr-10",
              className
            )}
            style={{
              background:  "color-mix(in srgb, var(--surface) 80%, transparent)",
              border:      error
                ? "1px solid color-mix(in srgb, #EF4444 60%, transparent)"
                : "1px solid var(--border)",
              color:       "var(--primary)",
            } as React.CSSProperties}
            onFocus={e => {
              e.currentTarget.style.borderColor = error
                ? "#EF4444"
                : "color-mix(in srgb, var(--primary) 70%, transparent)";
              e.currentTarget.style.boxShadow = error
                ? "0 0 0 3px color-mix(in srgb, #EF4444 15%, transparent)"
                : "0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error
                ? "color-mix(in srgb, #EF4444 60%, transparent)"
                : "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
            placeholder={props.placeholder}
            {...props}
          />

          {rightElement && (
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary flex items-center justify-center"
            >
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs flex items-center gap-1 text-danger">
            <span>✕</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-secondary">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };