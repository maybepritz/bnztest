import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/entities/user";

interface UserNameProps {
  user: Omit<Partial<User>, 'username'> & { username?: string | null };
  className?: string;
  nameClassName?: string;
  iconClassName?: string;
  showHandle?: boolean;
  handleClassName?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  hoverUnderline?: boolean;
  iconSize?: number;
}

export function UserName({ 
  user, 
  className, 
  nameClassName, 
  iconClassName,
  showHandle,
  handleClassName,
  href,
  onClick,
  hoverUnderline = true,
  iconSize
}: UserNameProps) {
  const displayName = user.name || user.username || "Пользователь";
  
  const content = (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={cn("font-bold text-primary truncate", hoverUnderline && "hover:underline", nameClassName)}>
        {displayName}
      </span>

      {user.isVerified && (
        <BadgeCheck 
          size={iconSize}
          className={cn("text-background fill-blue-500 shrink-0", iconClassName)} 
        />
      )}
      
      {showHandle && user.username && (
        <span className={cn("text-secondary text-sm truncate ml-0.5", handleClassName)}>
          @{user.username}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        onClick={onClick}
        className="flex min-w-0"
      >
        {content}
      </Link>
    );
  }

  return content;
}
