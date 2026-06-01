// entities/user/ui/user-card.tsx
import Link from "next/link";
import { Avatar } from "@/shared/ui";
import type { User } from "@/entities/user";
import { UserName } from "./UserName";

interface UserCardProps {
  user: User;
  renderActions?: React.ReactNode;
}

export function UserCard({ user, renderActions }: UserCardProps) {
  return (
    <Link
      href={`/@${user.username}`}
      className="flex items-center justify-between p-4 bg-surface rounded-3xl border border-border/40 hover:bg-surface-hover hover:border-border transition-all group"
    >
      <div className="flex items-center gap-4">
        <Avatar src={user.image} size="lg" fallback={"?"} />
        <div>
            <UserName user={user} nameClassName="text-lg" iconClassName="w-4 h-4" />
            <div className="text-secondary text-sm">@{user.username}</div>
        </div>
      </div>
      
      {renderActions && (
        <div onClick={(e) => e.preventDefault()}>
          {renderActions}
        </div>
      )}
    </Link>
  );
}