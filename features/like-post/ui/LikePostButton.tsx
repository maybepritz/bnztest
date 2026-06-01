"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "../actions";

interface LikePostButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikePostButton({ postId, initialLiked, initialCount }: LikePostButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);
    setIsLiking(true);

    try {
      const res = await toggleLikeAction(postId);
      // We rely on optimistic update since the backend might just return { success: true }
    } catch (err) {
      console.error("Failed to like", err);
      setIsLiked(prevLiked);
      setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={`flex items-center gap-1.5 group transition-colors ${isLiked ? 'text-accent-like' : 'hover:text-accent-like'}`}
    >
      <Heart 
        size={18} 
        className={`transition-all ${isLiked ? 'fill-accent-like animate-heart-burst' : 'group-hover:fill-accent-like/20'}`} 
      />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
}
