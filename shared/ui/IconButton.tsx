import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "surface" | "glass";
  size?: "sm" | "md" | "lg";
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "ghost", size = "md", className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Sizes
          size === "sm" && "p-1.5",
          size === "md" && "p-2",
          size === "lg" && "p-4",
          // Variants
          variant === "ghost" && "text-secondary hover:text-primary hover:scale-110",
          variant === "surface" && "bg-surface text-primary border border-border shadow-elevated hover:bg-surface-hover active:scale-95",
          variant === "glass" && "bg-background/60 text-secondary hover:text-primary hover:bg-background/80 shadow-elevated border border-border",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
export { IconButton };
