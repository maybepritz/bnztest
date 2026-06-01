"use client";

import { useState, useEffect } from "react";
import { HoverCard, Avatar, Spinner } from "@/shared/ui";
import { getUserByUsernameAction } from "../api/actions";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import type { User } from "@/entities/user";

export function UserMention({ username, children }: { username: string, children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !user && !loading) {
      setLoading(true);
      getUserByUsernameAction(username)
        .then(data => {
          if (data?.error) {
            console.error(data.error);
          } else {
            setUser(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username, user, loading]);

  return (
    <HoverCard 
      trigger={
        <Link 
          href={`/@${username}`} 
          className="text-link hover:underline font-semibold relative z-10"
          onMouseEnter={() => setIsOpen(true)}
        >
          {children}
        </Link>
      }
      side="bottom"
    >
      <div className="flex flex-col gap-3 min-w-[200px]">
        {loading ? (
          <div className="flex justify-center p-4"><Spinner size={24} /></div>
        ) : user ? (
          <>
            <div className="flex items-start gap-3">
              <Avatar src={user.image} fallback={user.name?.[0] || user.username?.[0] || "?"} size="lg" />
              <div className="flex flex-col min-w-0 flex-1">
                <Link href={`/@${username}`} className="font-bold text-primary hover:underline truncate">
                  {user.name || user.username}
                </Link>
                <span className="text-xs text-secondary truncate">@{user.username}</span>
              </div>
            </div>
            {user.bio && (
              <p className="text-sm text-primary mt-1 line-clamp-3">{user.bio}</p>
            )}
            <div className="flex gap-4 mt-1 text-xs text-secondary font-medium">
              <div className="flex gap-1.5 items-center">
                <span className="text-primary font-bold">{user.followersCount ?? user._count?.followers ?? 0}</span> читателей
              </div>
              <div className="flex gap-1.5 items-center">
                <span className="text-primary font-bold">{user.followingCount ?? user._count?.following ?? 0}</span> подписок
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-secondary text-sm p-2">
            <UserIcon size={16} /> Пользователь не найден
          </div>
        )}
      </div>
    </HoverCard>
  );
}
