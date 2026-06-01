"use client";

import { useTransition, useState } from "react";
import { Plus, Check } from "lucide-react";
import { toggleFollowAction } from "../actions";

interface AvatarFollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function AvatarFollowButton({ targetUserId, initialIsFollowing }: AvatarFollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic update
    setIsFollowing((prev) => !prev);
    
    startTransition(async () => {
      try {
        await toggleFollowAction(targetUserId);
      } catch (err) {
        // Revert on error
        setIsFollowing((prev) => !prev);
        console.error("Failed to toggle follow state", err);
      }
    });
  };

  if (isFollowing) {
    return null; // Don't show the plus icon if already following
  }

  return (
    <div 
      onClick={handleFollow} 
      className={`absolute -bottom-1 -right-1 bg-surface text-primary rounded-full p-0.5 border-2 border-surface cursor-pointer hover:scale-110 transition-transform ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Plus size={12} strokeWidth={3} />
    </div>
  );
}
