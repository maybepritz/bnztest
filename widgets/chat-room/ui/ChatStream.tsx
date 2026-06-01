"use client";

import { useEffect, useState, useRef, Fragment } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter, usePathname } from "next/navigation";
import { useTypingIndicator } from "@/shared/hooks/useTypingIndicator";
import { useChatMessages } from "../hooks/useChatMessages";
import { Spinner } from "@/shared/ui/Loader";
import { MessageBubble } from "./MessageBubble";
import { MessageContextMenu } from "@/features/chat/ui/MessageContextMenu";
import { Button } from "@/shared/ui/Button";
import { ArrowDown, Phone } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";

interface ChatStreamProps {
  chatId: string;
  initialMessages: any[];
  initialNextCursor?: string;
  initialPrevCursor?: string;
  highlightMessageId?: string;
  currentUserId: string;
  targetUsername: string;
}

const EMOJIS = ["👍", "❤️", "😂", "😢", "🔥"];

export function ChatStream({ chatId, initialMessages, initialNextCursor, initialPrevCursor, highlightMessageId, currentUserId, targetUsername }: ChatStreamProps) {
  const isTyping = useTypingIndicator(targetUsername);
  const [highlightedId, setHighlightedId] = useState(highlightMessageId);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, transformOrigin: string, msg: any } | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  const {
    messages,
    nextCursor,
    prevCursor,
    isFetchingOld,
    isFetchingNew,
    loadOlderMessages,
    loadNewerMessages
  } = useChatMessages({
    chatId,
    initialMessages,
    initialNextCursor,
    initialPrevCursor,
    currentUserId,
    bottomAnchorRef
  });

  const handleContextMenu = (e: React.MouseEvent, msg: any) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    
    const menuWidth = 224; 
    const menuHeight = 280; // safe max height for menu + emoji bar
    
    let renderX = x;
    let renderY = y;
    let originX = "left";
    let originY = "top";

    if (x + menuWidth > window.innerWidth) {
      renderX = x - menuWidth;
      originX = "right";
    } else {
      renderX = x + 8;
    }

    if (y + menuHeight > window.innerHeight) {
      renderY = y - menuHeight;
      originY = "bottom";
    } else {
      renderY = y + 8;
    }
    
    setContextMenu({ x: renderX, y: renderY, transformOrigin: `${originY} ${originX}`, msg });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 200;
    setShowScrollButton(isScrolledUp);
  };

  const jumpToBottom = () => {
    if (prevCursor) {
      router.push(pathname);
    } else {
      bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const initialScrollDone = useRef(false);

  useEffect(() => {
    if (highlightedId) {
      const el = document.getElementById(`msg-${highlightedId}`);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        setTimeout(() => setHighlightedId(undefined), 3000);
      }
      initialScrollDone.current = true;
    } else if (!initialScrollDone.current && !prevCursor) {
      setTimeout(() => {
        bottomAnchorRef.current?.scrollIntoView({ behavior: "auto" });
        initialScrollDone.current = true;
      }, 50);
    }
  }, [highlightedId, messages.length, prevCursor]);

  const { ref: topRef, inView: topInView } = useInView({ threshold: 0, rootMargin: "400px 0px 0px 0px" });
  const { ref: bottomRef, inView: bottomInView } = useInView({ threshold: 0, rootMargin: "0px 0px 400px 0px" });

  useEffect(() => {
    if (topInView && nextCursor && !isFetchingOld) loadOlderMessages();
  }, [topInView, nextCursor, isFetchingOld, loadOlderMessages]);

  useEffect(() => {
    if (bottomInView && prevCursor && !isFetchingNew) loadNewerMessages();
  }, [bottomInView, prevCursor, isFetchingNew, loadNewerMessages]);

  return (
    <div 
      id="chat-scroll-container" 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 relative overflow-y-auto pt-[88px] pb-[88px] px-4 flex flex-col gap-4 z-0 scroll-smooth"
    >
      {nextCursor && (
        <div ref={topRef} className="w-full flex justify-center py-2">
          <Spinner size={24} />
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-secondary h-full">
          <p className="font-medium text-primary">Здесь пока пусто</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const currentMsgDate = new Date(msg.createdAt);
          const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
          
          let showDateSeparator = false;
          let dateLabel = "";
          
          if (!prevMsgDate || currentMsgDate.toDateString() !== prevMsgDate.toDateString()) {
            showDateSeparator = true;
            
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (currentMsgDate.toDateString() === today.toDateString()) {
              dateLabel = "Сегодня";
            } else if (currentMsgDate.toDateString() === yesterday.toDateString()) {
              dateLabel = "Вчера";
            } else {
              dateLabel = currentMsgDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
            }
          }

          const isCallStartedMsg = msg.content?.includes("Звонок начался");
          const isCallEndedMsg = msg.content?.includes("Звонок завершен");

          if (isCallStartedMsg) return null;

          return (
            <Fragment key={`${msg.id}-${index}`}>
              {showDateSeparator && (
                <div className="flex w-full items-center justify-center my-4 relative pointer-events-none">
                  <div className="absolute w-full h-[1px] bg-border/40 left-0 top-1/2 -translate-y-1/2"></div>
                  <Badge 
                    className="relative z-10 bg-surface-hover text-primary backdrop-blur-md border-border/20 shadow-sm px-4 py-1"
                  >
                    {dateLabel}
                  </Badge>
                </div>
              )}
              {isCallEndedMsg ? (
                <div className="flex w-full items-center justify-center my-3 pointer-events-none">
                  <div className="bg-surface/50 text-secondary text-xs rounded-full px-4 py-1.5 border border-white/5 backdrop-blur-md shadow-sm flex items-center gap-2">
                    <Phone size={14} className="text-secondary opacity-70" />
                    <span>{msg.content.replace("📞 ", "")}</span>
                  </div>
                </div>
              ) : (
                <div 
                  id={`msg-${msg.id}`} 
                  className={`flex flex-col w-full transition-all duration-1000 rounded-xl px-2 py-1 -mx-2 ${highlightedId === msg.id ? 'bg-accent/20 shadow-md' : ''}`}
                >
                  <MessageBubble
                    message={{ ...msg, createdAt: currentMsgDate }}
                    isMe={msg.senderId === currentUserId}
                    targetUsername={targetUsername}
                    currentUserId={currentUserId}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                  />
                </div>
              )}
            </Fragment>
          );
        })
      )}

      <MessageContextMenu 
        contextMenu={contextMenu} 
        currentUserId={currentUserId} 
        onClose={() => setContextMenu(null)} 
      />

      {prevCursor && (
        <div ref={bottomRef} className="w-full flex justify-center py-4">
          <Spinner size={24} />
        </div>
      )}

      {!prevCursor && isTyping && (
        <div className="w-full flex items-center px-4 py-2 gap-2 animate-fade-in">
          <div className="flex gap-1 items-center bg-surface border border-border/50 rounded-full px-3 py-1.5 shadow-sm">
             <span className="text-xs text-secondary font-medium">@{targetUsername} печатает</span>
             <span className="flex gap-0.5 mt-1">
               <span className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1 h-1 bg-secondary rounded-full animate-bounce"></span>
             </span>
          </div>
        </div>
      )}

      <div ref={bottomAnchorRef} className="h-px w-full flex-shrink-0" />

      {(showScrollButton || prevCursor) && (
        <div className="fixed bottom-24 right-6 z-50 animate-fade-in">
          <Button 
            variant="secondary" 
            className="rounded-full shadow-elevated border border-border flex items-center justify-center p-3"
            onClick={jumpToBottom}
          >
            <ArrowDown size={20} className="text-primary" />
          </Button>
        </div>
      )}
    </div>
  );
}
