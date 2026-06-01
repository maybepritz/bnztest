import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  src?: string | null;
  fallback?: string;
  isOnline?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = "md", src, fallback, isOnline, className, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-2xl",
      xl: "w-32 h-32 text-6xl border-4 border-background",
    };

    const onlineIndicatorClasses = {
      sm: "w-2.5 h-2.5 border-2 bottom-1 right-1",
      md: "w-3.5 h-3.5 border-2 bottom-0 right-0",
      lg: "w-3.5 h-3.5 border-2",
      xl: "w-6 h-6 border-4",
    };

    return (
      <div className="relative inline-block" ref={ref} {...props}>
        <div
          className={cn(
            "bg-background/40 backdrop-blur-xl rounded-full flex items-center justify-center text-primary shrink-0 shadow-inner border border-border overflow-hidden",
            sizeClasses[size],
            className
          )}
        >
          {src ? (
            <img src={src} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{fallback || "?"}</span>
          )}
        </div>
        
        {isOnline && (
          <div
            className={cn(
              "absolute bottom-2 right-2 bg-success rounded-full border-background",
              onlineIndicatorClasses[size]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
export { Avatar };
