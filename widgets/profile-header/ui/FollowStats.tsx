"use client";

import { useState } from "react";
import { FollowListModal } from "./FollowListModal";

interface FollowStatsProps {
  followersCount: number;
  followingCount: number;
  username: string;
}

export function FollowStats({ followersCount, followingCount, username }: FollowStatsProps) {
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: "followers" | "following" }>({
    isOpen: false,
    type: "followers"
  });

  return (
    <>
      <div className="flex gap-2 -ml-2">
        <div 
          onClick={() => setModalState({ isOpen: true, type: "followers" })}
          className="rounded-lg px-2 py-1 flex gap-1.5 hover:text-primary transition cursor-pointer hover:bg-surface"
        >
          <span className="font-bold text-primary">{followersCount || 0}</span>
          <span className="text-secondary">подписчиков</span>
        </div>
        <div 
          onClick={() => setModalState({ isOpen: true, type: "following" })}
          className="rounded-lg px-2 py-1 flex gap-1.5 hover:text-primary transition cursor-pointer hover:bg-surface"
        >
          <span className="font-bold text-primary">{followingCount || 0}</span>
          <span className="text-secondary">подписок</span>
        </div>
      </div>

      <FollowListModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        username={username}
        type={modalState.type}
      />
    </>
  );
}
