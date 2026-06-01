"use client";

import { useTransition, useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/shared/ui";
import { toggleFollowAction } from "../actions";

interface ProfileFollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function ProfileFollowButton({ targetUserId, initialIsFollowing }: ProfileFollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const handleFollow = () => {
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

  return (
    <Button 
      variant={isFollowing ? "secondary" : "primary"} 
      className="rounded-full flex items-center gap-2"
      onClick={handleFollow}
      disabled={isPending}
    >
      {isFollowing ? (
        <>
          <UserMinus size={18} />
          Отписаться
        </>
      ) : (
        <>
          <UserPlus size={18} />
          Подписаться
        </>
      )}
    </Button>
  );
}
