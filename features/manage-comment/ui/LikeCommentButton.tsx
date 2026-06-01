"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleCommentLikeAction } from "../actions";

interface LikeCommentButtonProps {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeCommentButton({ commentId, initialLiked, initialCount }: LikeCommentButtonProps) {
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
      await toggleCommentLikeAction(commentId);
    } catch (err) {
      console.error("Failed to like comment", err);
      setIsLiked(prevLiked);
      setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={`flex items-center gap-1.5 group/btn transition-colors ${isLiked ? 'text-accent-like' : 'hover:text-accent-like'}`}
    >
      <Heart 
        size={15} 
        className={`transition-all ${isLiked ? 'fill-accent-like text-accent-like animate-heart-burst' : 'group-hover/btn:fill-accent-like/20'}`} 
      />
      <span className="text-xs font-medium">{likesCount > 0 ? likesCount : ""}</span>
    </button>
  );
}
