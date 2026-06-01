import { useState, useEffect } from "react";
import { toggleReaction } from "@/features/chat/actions";

export function useMessageBubble(message: any, currentUserId: string, targetUsername: string) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || []);
  const decryptedContent = message.content || "";
  const [uploadProgress, setUploadProgress] = useState<number | null>(
    message.isPending && message.attachments && message.attachments.length > 0 ? 0 : null
  );

  useEffect(() => {
    setLocalReactions(message.reactions || []);
  }, [message.reactions]);

  useEffect(() => {
    if (!message.isPending || !message.id) return;
    
    const handleProgress = (e: any) => {
      if (e.detail.tempId === message.id) {
        setUploadProgress(e.detail.progress);
      }
    };
    
    window.addEventListener("chat:upload_progress", handleProgress);
    return () => window.removeEventListener("chat:upload_progress", handleProgress);
  }, [message.isPending, message.id]);

  const reactionCounts: Record<string, { count: number; iReacted: boolean }> = {};
  if (localReactions) {
    localReactions.forEach((r: any) => {
      if (!reactionCounts[r.emoji]) {
        reactionCounts[r.emoji] = { count: 0, iReacted: false };
      }
      reactionCounts[r.emoji].count++;
      if (r.userId === currentUserId) {
        reactionCounts[r.emoji].iReacted = true;
      }
    });
  }

  const handleReaction = async (emoji: string) => {
    setShowEmojis(false);
    
    const existingIndex = localReactions.findIndex((r: any) => r.emoji === emoji && r.userId === currentUserId);
    if (existingIndex !== -1) {
      setLocalReactions((prev: any) => prev.filter((_: any, i: number) => i !== existingIndex));
    } else {
      setLocalReactions((prev: any) => [...prev, { emoji, userId: currentUserId }]);
    }
    
    await toggleReaction(message.id, emoji, targetUsername);
  };
  
  const handleReply = () => {
    window.dispatchEvent(new CustomEvent("chat:reply", { detail: { ...message, content: decryptedContent } }));
  };

  useEffect(() => {
    const handleContextReaction = async (e: any) => {
      if (e.detail.messageId === message.id) {
        await handleReaction(e.detail.emoji);
      }
    };
    window.addEventListener("chat:context_reaction", handleContextReaction);
    return () => window.removeEventListener("chat:context_reaction", handleContextReaction);
  }, [message.id, localReactions, targetUsername, currentUserId]);

  const isMediaOnly = !decryptedContent && !message.replyTo && message.attachments && message.attachments.length > 0;

  return {
    showEmojis,
    setShowEmojis,
    localReactions,
    decryptedContent,
    uploadProgress,
    reactionCounts,
    handleReaction,
    handleReply,
    isMediaOnly
  };
}
