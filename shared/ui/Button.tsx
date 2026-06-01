import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";
import { Spinner } from "./Loader";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, className, children, disabled, style, ...props }, ref) => {

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background:  "var(--primary)",
        color:       "var(--inverse)",
        boxShadow:   "0 0 16px color-mix(in srgb, var(--primary) 10%, transparent)",
      },
      secondary: {
        background:  "var(--surface)",
        color:       "var(--primary)",
        border:      "1px solid var(--border)",
      },
      ghost: {
        background:  "transparent",
        color:       "var(--secondary)",
      },
      danger: {
        background:  "var(--accent-like)",
        color:       "#ffffff",
        boxShadow:   "0 0 16px color-mix(in srgb, var(--danger) 20%, transparent)",
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{ ...variantStyles[variant], ...style }}
        className={cn(
          "cursor-pointer relative inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 hover:opacity-90",
          "focus:outline-none focus-visible:ring-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          size === "sm" && "text-xs px-3 py-2 gap-1.5",
          size === "md" && "text-sm px-4 py-3 gap-2",
          size === "lg" && "text-base px-6 py-3.5 gap-2",
          className
        )}
        {...props}
      >
        {isLoading && (
          <Spinner size={16} className="mr-2 -ml-1 text-current" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };