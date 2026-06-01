"use client";

import { useEffect, useRef } from "react";
import { useToast, Avatar, Button } from "@/shared/ui";
import { User, Heart, Phone } from "lucide-react";
import { useAudio } from "@/shared/hooks/useAudio";

export function IncomingCallToastContent({ data }: { data: any }) {
  const { playLoop, stop } = useAudio();

  useEffect(() => {
    playLoop("ringtone");
    return () => {
      stop("ringtone");
    };
  }, [playLoop, stop]);

  return (
    <div className="flex items-center gap-3 py-1 pr-2 w-full">
      <Avatar src={data.callerAvatar} fallback={data.callerName?.[0] || "?"} size="sm" />
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="font-bold text-primary text-sm truncate">{data.callerName}</span>
        <span className="text-xs text-success animate-pulse truncate">Входящий звонок...</span>
      </div>
      <button 
        onClick={() => window.location.href = `/@${data.callerUsername}?call=true`}
        className="bg-success hover:bg-success/90 text-white py-1.5 px-3 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
      >
         <Phone size={12} /> Принять
      </button>
    </div>
  );
}

export function NotificationsWebSocket() {
  const { toast, removeToast } = useToast();
  const { play } = useAudio();
  const ws = useRef<WebSocket | null>(null);
  const connectingToastId = useRef<string | null>(null);

  useEffect(() => {
    // Use current window hostname instead of hardcoded localhost to support LAN
    const wsHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const wsUrlBase = process.env.NEXT_PUBLIC_WS_URL;
    
    let isMounted = true;

    const showOfflineToast = () => {
      if (!connectingToastId.current && isMounted) {
        connectingToastId.current = toast({
          position: "top-center",
          variant: "warning",
          autoClose: 0,
          isClosable: false,
          children: (
            <div className="flex items-center gap-2 font-medium">
              <span className="animate-pulse">Ожидание сети...</span>
            </div>
          )
        });
      }
    };

    const hideOfflineToast = () => {
      if (connectingToastId.current) {
        removeToast(connectingToastId.current);
        connectingToastId.current = null;
      }
    };

    const connect = async () => {
      try {
        let token = "";
        try {
          const res = await fetch("/api/auth/token");
          if (res.ok) {
            const data = await res.json();
            token = data.token;
          } else if (res.status === 401) {
            // Explicitly unauthorized (no cookie), so user is not logged in.
            // Do not show offline toast, just return silently.
            return;
          } else {
            // Other server errors from Next.js (e.g. proxy down) -> network offline
            throw new Error("API not reachable");
          }
        } catch (fetchErr) {
          // If fetch fails (network offline completely), show toast and retry
          if (isMounted) {
            showOfflineToast();
            setTimeout(connect, 3000);
          }
          return;
        }

        if (!isMounted) return;

        const wsUrl = wsUrlBase || "ws://localhost:8081/ws";
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log("WebSocket connected to", wsUrlBase);
          ws.current?.send(JSON.stringify({ type: "auth", token }));
          hideOfflineToast();
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case "NEW_MESSAGE":
                if (data.message) {
                  window.dispatchEvent(new CustomEvent("chat:optimistic_message", { detail: data.message }));
                }

                if (data.text?.includes("Звонок начался") || data.text?.includes("Звонок завершен")) {
                  break; // Игнорируем уведомления для системных сообщений звонка
                }
                
                // Check if chat is muted
                const mutedChats = JSON.parse(localStorage.getItem("mutedChats") || "[]");
                if (data.chatId && mutedChats.includes(data.chatId)) {
                  break;
                }

                // Do not show toast if we are in this exact chat
                if (window.location.pathname.includes(data.senderName) || (data.chatId && window.location.pathname.includes(data.chatId))) {
                  // Only play sound if it's NOT our own message
                  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                  if (currentUser.username !== data.senderName) {
                    play("notification");
                  }
                  break;
                }

                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                if (currentUser.username === data.senderName) {
                  break; // Don't show toast/badge for our own messages (e.g. sent from another device or saved messages)
                }

                window.dispatchEvent(new CustomEvent("messages:unread"));
                play("notification");
                toast({
                  autoClose: 5000,
                  children: (
                    <div className="flex items-start gap-3 py-1 pr-4">
                      <Avatar fallback={data.senderName?.[0] || "U"} size="sm" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-primary text-sm">{data.senderName}</span>
                        <span className="text-sm text-secondary line-clamp-1">{data.text}</span>
                      </div>
                    </div>
                  )
                });
                break;
                
              case "NEW_LIKE":
                window.dispatchEvent(new CustomEvent("notifications:unread"));
                play("notification");
                toast({
                  autoClose: 4000,
                  children: (
                    <div className="flex items-center gap-3 pr-2">
                      <div className="p-2 bg-danger/10 text-danger rounded-full">
                        <Heart size={16} className="fill-current" />
                      </div>
                      <span className="text-sm text-primary">
                        <span className="font-bold">{data.senderName}</span> оценил вашу публикацию
                      </span>
                    </div>
                  )
                });
                break;
                
              case "NEW_REPOST":
                window.dispatchEvent(new CustomEvent("notifications:unread"));
                play("notification");
                toast({
                  autoClose: 5000,
                  children: (
                    <div className="flex items-center gap-3 pr-2">
                      <div className="p-2 bg-success/10 text-success rounded-full">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
                      </div>
                      <span className="text-sm text-primary">
                        <span className="font-bold">{data.senderName}</span> репостнул вашу запись
                      </span>
                    </div>
                  )
                });
                break;

              case "NEW_COMMENT":
                window.dispatchEvent(new CustomEvent("notifications:unread"));
                play("notification");
                toast({
                  autoClose: 5000,
                  children: (
                    <div className="flex items-start gap-3 py-1 pr-4">
                      <Avatar fallback={data.senderName?.[0] || "U"} size="sm" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-primary">
                          <span className="font-bold">{data.senderName}</span> оставил комментарий
                        </span>
                        <span className="text-sm text-secondary line-clamp-1">{data.text}</span>
                      </div>
                    </div>
                  )
                });
                break;

              case "TYPING":
                window.dispatchEvent(new CustomEvent("typing:indicator", { detail: data }));
                break;

              case "MESSAGES_READ":
                window.dispatchEvent(new CustomEvent("messages:read", { detail: data }));
                break;

              case "MESSAGE_UPDATED":
                window.dispatchEvent(new CustomEvent("chat:message_updated", { detail: data }));
                break;

              case "MESSAGE_DELETED":
                window.dispatchEvent(new CustomEvent("chat:message_deleted", { detail: data }));
                break;

              case "NEW_FOLLOWER":
                window.dispatchEvent(new CustomEvent("notifications:unread"));
                play("notification");
                toast({
                  autoClose: 5000,
                  children: (
                    <div className="flex items-center gap-3 pr-2">
                      <div className="p-2 bg-success/10 text-success rounded-full">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-primary font-medium">Новый подписчик</span>
                        <span className="text-xs text-secondary">@{data.username} теперь читает вас</span>
                      </div>
                    </div>
                  )
                });
                break;

              case "INCOMING_CALL":
                toast({
                  autoClose: 15000,
                  children: <IncomingCallToastContent data={data} />
                });
                break;
                
              case "CALL_UPDATE":
                window.dispatchEvent(new CustomEvent("call:update", { detail: data }));
                break;
            }
          } catch (e) {
            console.error("Failed to parse websocket message", e);
          }
        };

        ws.current.onclose = (event) => {
          console.log("WebSocket disconnected, code:", event.code);
          if (event.code === 4006) {
            // Auth failed, don't try to reconnect or show offline toast
            return;
          }
          if (isMounted) {
            showOfflineToast();
            setTimeout(connect, 3000);
          }
        };
        
        ws.current.onerror = (error) => {
          // Use console.warn instead of console.error to prevent Next.js dev overlay
          // from aggressively popping up when the server is intentionally offline
          console.warn("WebSocket error (server likely offline)");
          ws.current?.close();
        };
      } catch (e) {
        console.warn("Failed to connect to WebSocket (server likely offline)");
        if (isMounted) {
          showOfflineToast();
          setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      hideOfflineToast();
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [toast, removeToast]);

  return null;
}
