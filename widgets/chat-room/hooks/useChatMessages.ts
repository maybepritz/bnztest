import { useState, useEffect } from "react";
import { getMessagesAction, getNewerMessagesAction } from "../actions";

export function useChatMessages({
  chatId,
  initialMessages,
  initialNextCursor,
  initialPrevCursor,
  currentUserId,
  bottomAnchorRef,
}: {
  chatId: string;
  initialMessages: any[];
  initialNextCursor?: string;
  initialPrevCursor?: string;
  currentUserId: string;
  bottomAnchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [prevCursor, setPrevCursor] = useState(initialPrevCursor);
  const [isFetchingOld, setIsFetchingOld] = useState(false);
  const [isFetchingNew, setIsFetchingNew] = useState(false);

  // Mark messages as read
  useEffect(() => {
    const unreadMessages = messages.filter(m => m.senderId !== currentUserId && !m.isRead);
    if (unreadMessages.length > 0) {
      fetch(`/api/chats/${chatId}/read`, { method: "POST" }).catch(console.error);
    }
  }, [messages, currentUserId, chatId]);

  // Optimistic UI updates
  useEffect(() => {
    const handleOptimistic = (e: CustomEvent) => {
      if (e.detail.chatId && e.detail.chatId !== chatId) return;
      setMessages((prev) => {
        if (prev.some(m => m.id === e.detail.id)) return prev;
        
        const isDuplicateOfTemp = prev.some(m => 
          typeof m.id === 'string' && 
          m.id.startsWith('temp-') && 
          m.content === e.detail.content && 
          m.senderId === e.detail.senderId
        );
        
        if (isDuplicateOfTemp) return prev;
        return [...prev, e.detail];
      });
      setTimeout(() => bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    };

    const handleSent = (e: CustomEvent) => {
      const { tempId, realMessage } = e.detail;
      setMessages((prev) => {
        const alreadyExists = prev.some(m => m.id === realMessage.id);
        const hasTemp = prev.some(m => m.id === tempId);
        
        if (alreadyExists) {
          return prev.filter(m => m.id !== tempId);
        } else {
          if (!hasTemp) {
            return [...prev, { ...realMessage, createdAt: new Date(realMessage.createdAt) }];
          }
          return prev.map(m => m.id === tempId ? { ...realMessage, createdAt: new Date(realMessage.createdAt) } : m);
        }
      });
    };

    const handleCancelled = (e: CustomEvent) => {
      setMessages((prev) => prev.filter(m => m.id !== e.detail.tempId));
    };

    const handleRead = (e: CustomEvent) => {
      setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
    };

    const handleUpdated = (e: CustomEvent) => {
      const data = e.detail;
      if (data.chatId && data.chatId !== chatId) return;
      setMessages((prev) => prev.map(m => m.id === data.messageId ? { ...m, content: data.content, isEdited: true } : m));
    };

    const handleOptimisticEdit = (e: CustomEvent) => {
      const data = e.detail;
      setMessages((prev) => prev.map(m => m.id === data.id ? { ...m, content: data.content, isEdited: true } : m));
    };

    const handleDeleted = (e: CustomEvent) => {
      const data = e.detail;
      if (data.chatId === chatId) {
        setMessages((prev) => prev.filter(m => m.id !== data.messageId));
      }
    };

    window.addEventListener("chat:optimistic_message" as any, handleOptimistic);
    window.addEventListener("chat:message_sent" as any, handleSent);
    window.addEventListener("chat:upload_cancelled" as any, handleCancelled);
    window.addEventListener("messages:read" as any, handleRead);
    window.addEventListener("chat:message_updated" as any, handleUpdated);
    window.addEventListener("chat:optimistic_edit" as any, handleOptimisticEdit);
    window.addEventListener("chat:message_deleted" as any, handleDeleted);
    
    return () => {
      window.removeEventListener("chat:optimistic_message" as any, handleOptimistic);
      window.removeEventListener("chat:message_sent" as any, handleSent);
      window.removeEventListener("chat:upload_cancelled" as any, handleCancelled);
      window.removeEventListener("messages:read" as any, handleRead);
      window.removeEventListener("chat:message_updated" as any, handleUpdated);
      window.removeEventListener("chat:optimistic_edit" as any, handleOptimisticEdit);
      window.removeEventListener("chat:message_deleted" as any, handleDeleted);
    };
  }, [chatId, bottomAnchorRef]);

  const loadOlderMessages = async () => {
    try {
      setIsFetchingOld(true);
      const res = await getMessagesAction(chatId, nextCursor, 20);
      const container = document.getElementById("chat-scroll-container");
      const oldHeight = container ? container.scrollHeight : 0;
      const oldTop = container ? container.scrollTop : 0;

      setMessages((prev) => {
        const newMsgs = res.messages.filter((m: any) => !prev.some(p => p.id === m.id));
        return [...newMsgs, ...prev];
      });
      setNextCursor(res.nextCursor);

      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - oldHeight + oldTop;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingOld(false);
    }
  };

  const loadNewerMessages = async () => {
    try {
      setIsFetchingNew(true);
      const res = await getNewerMessagesAction(chatId, prevCursor!, 20);
      setMessages((prev) => {
        const newMsgs = res.messages.filter((m: any) => !prev.some(p => p.id === m.id));
        return [...prev, ...newMsgs];
      });
      setPrevCursor(res.prevCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingNew(false);
    }
  };

  return {
    messages,
    nextCursor,
    prevCursor,
    isFetchingOld,
    isFetchingNew,
    loadOlderMessages,
    loadNewerMessages,
  };
}
