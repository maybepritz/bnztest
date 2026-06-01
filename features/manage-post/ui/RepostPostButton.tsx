"use client";

import { useState } from "react";
import { Repeat2 } from "lucide-react";
import { repostAction } from "../actions";

interface RepostPostButtonProps {
  postId: string;
  initialReposted?: boolean;
}

export function RepostPostButton({ postId, initialReposted = false }: RepostPostButtonProps) {
  const [isReposting, setIsReposting] = useState(false);
  const [hasReposted, setHasReposted] = useState(initialReposted);

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReposting) return;
    try {
      setIsReposting(true);
      const res = await repostAction(postId);
      setHasReposted(res.reposted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReposting(false);
    }
  };

  return (
    <button 
      onClick={handleRepost} 
      disabled={isReposting}
      className={`flex items-center gap-1.5 group transition-colors hover:text-accent-repost ${
        isReposting ? "opacity-50" : ""
      } ${hasReposted ? "text-accent-repost" : ""}`}
    >
      <Repeat2 size={18} />
    </button>
  );
}
