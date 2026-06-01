"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { Avatar, Button } from "@/shared/ui";
import Link from "next/link";
import { UserName } from "@/entities/user";

import { toggleFollowAction } from "@/features/follow-user/actions";
import { useTransition } from "react";

interface FollowUser {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  isVerified?: boolean;
  isFollowing?: boolean;
  isMe?: boolean;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  type: "followers" | "following";
}

function OptimisticFollowButton({ user }: { user: FollowUser }) {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);

  if (user.isMe) return null;

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    startTransition(async () => {
      try {
        await toggleFollowAction(user.id);
      } catch (err) {
        setIsFollowing((prev) => !prev);
        console.error("Failed to toggle follow state", err);
      }
    });
  };

  return (
    <Button 
      variant={isFollowing ? "secondary" : "primary"} 
      size="sm" 
      className="px-4 py-1.5 min-w-[120px] font-semibold" 
      onClick={handleFollow}
      disabled={isPending}
    >
      {isFollowing ? "Отписаться" : "Подписаться"}
    </Button>
  );
}

export function FollowListModal({ isOpen, onClose, username, type }: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setLoading(true);
      fetch(`/api/users/${username}/${type}`)
        .then(res => res.json())
        .then(data => {
          setUsers(Array.isArray(data) ? data : []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      document.body.style.overflow = "";
      setUsers([]);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, username, type]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-primary">{type === "followers" ? "Подписчики" : "Подписки"}</h2>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary transition-colors bg-surface-hover rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={32} className="animate-spin text-accent" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              Список пуст
            </div>
          ) : (
            users.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <Link href={`/@${user.username}`} onClick={onClose} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0">
                  <Avatar src={user.image} fallback={user.name?.[0] || user.username[0]} size="md" />
                  <div className="flex flex-col truncate pr-2">
                    <UserName 
                      user={{ name: user.name, username: user.username, isVerified: user.isVerified }} 
                      className="font-bold text-primary text-[15px]" 
                      iconSize={14}
                    />
                    <span className="text-secondary text-[14px] truncate">@{user.username}</span>
                  </div>
                </Link>
                <OptimisticFollowButton user={user} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
