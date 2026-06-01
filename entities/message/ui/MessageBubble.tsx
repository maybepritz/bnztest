"use client";

import { Smile, Reply, Check, CheckCheck, X } from "lucide-react";
import { UserMention } from "@/entities/user";
import { useMessageBubble } from "../hooks/useMessageBubble";
import { createPortal } from "react-dom";
import { IconButton, HoverLinkPreview } from "@/shared/ui";
import { MediaCollage } from "./MediaCollage";

interface MessageBubbleProps {
  message: any; // Using any for simplicity here, ideally infer from Prisma
  isMe: boolean;
  targetUsername: string;
  currentUserId: string;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😢", "🔥"];

export function MessageBubble({ message, isMe, targetUsername, currentUserId, onContextMenu }: MessageBubbleProps) {
  const {
    showEmojis,
    setShowEmojis,
    localReactions,
    decryptedContent,
    uploadProgress,
    reactionCounts,
    handleReaction,
    handleReply,
    isMediaOnly
  } = useMessageBubble(message, currentUserId, targetUsername);

  return (
    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"} animate-fade-in group relative`}>
      <div 
        onDoubleClick={() => handleReaction("❤️")}
        onContextMenu={onContextMenu}
        className={`transition-transform flex flex-col relative max-w-full ${
          isMediaOnly ? "rounded-2xl" : "px-3 py-[6px] rounded-[18px] shadow-sm"
        } ${
          isMe 
            ? `rounded-br-sm ${!isMediaOnly ? "bg-primary text-inverse" : ""}`
            : `rounded-bl-sm ${!isMediaOnly ? "bg-surface-hover backdrop-blur-md text-primary" : ""}`
        }`}
      >
        {/* Reply Preview */}
        {message.replyTo && (
          <div 
            className={`mb-1 p-1.5 rounded-[10px] text-[13px] flex flex-col cursor-pointer hover:opacity-90 transition-opacity border-l-[3px] ${
              isMe 
                ? "bg-black/10 border-inverse/50 text-inverse" 
                : "bg-black/20 border-primary/50 text-primary"
            }`}
          >
            <span className="text-[12px] font-semibold mb-0.5 opacity-90">
              {message.replyTo.senderId === currentUserId ? "Вы" : message.replyTo.sender?.name || message.replyTo.sender?.username || targetUsername}
            </span>
            <span className="line-clamp-1 leading-snug opacity-90">{message.replyTo.content}</span>
          </div>
        )}
        
        {message.attachments && message.attachments.length > 0 && (
          <MediaCollage
            attachments={message.attachments}
            uploadProgress={uploadProgress}
            messageId={message.id}
            isMe={isMe}
          />
        )}
        
        {decryptedContent && (
          <div className="whitespace-pre-wrap break-words [word-break:break-word] text-[15px] leading-[1.35] relative max-w-full overflow-hidden">
            {decryptedContent.split(/(@[\w_]+|https?:\/\/[^\s]+)/g).map((part: string, i: number) => {
              if (part.startsWith('@')) {
                return <UserMention key={i} username={part.slice(1)}>{part}</UserMention>;
              }
              if (part.startsWith('http')) {
                return <HoverLinkPreview key={i} url={part}>{part}</HoverLinkPreview>;
              }
              return part;
            })}
            
            {/* Timestamp inline */}
            <span className={`float-right ml-3 mt-1.5 flex items-center gap-1 text-[11px] select-none ${isMe ? "text-inverse/70" : "text-secondary"} translate-y-0.5`}>
              <span id={`voice-speed-portal-${message.id}`} />
              {message.isEdited && <span>изм.</span>}
              <span>{message.createdAt.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}</span>
              {isMe && (
                message.isPending ? (
                  <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : message.isRead ? (
                  <CheckCheck size={14} className="text-inverse" />
                ) : (
                  <Check size={14} />
                )
              )}
            </span>
          </div>
        )}

        {isMediaOnly && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/40 backdrop-blur-md text-white px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] z-10 shadow-sm">
            <span id={`voice-speed-portal-${message.id}`} />
            {message.isEdited && <span>изм.</span>}
            <span>{message.createdAt.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}</span>
            {isMe && (
              message.isPending ? (
                <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : message.isRead ? (
                <CheckCheck size={13} />
              ) : (
                <Check size={13} />
              )
            )}
          </div>
        )}
      </div>

      {localReactions && localReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 z-10 relative">
          {Object.entries(
            localReactions.reduce((acc: any, r: any) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <button 
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`px-2 py-0.5 rounded-full border text-xs flex items-center gap-1 transition-colors ${
                localReactions.some((r: any) => r.emoji === emoji && r.userId === currentUserId)
                  ? "bg-primary/20 border-primary/30 text-primary"
                  : "bg-surface-hover border-white/5 hover:bg-white/10"
              }`}
            >
              <span>{emoji}</span>
              <span className="opacity-80 font-medium">{count as number}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
  }
