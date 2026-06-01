"use client";

import { useState, useEffect } from "react";
import { Avatar, Input } from "@/shared/ui";
import { UserName } from "@/entities/user";
import { Search, BellOff, Bookmark } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChatListClientProps {
  currentUserId: string;
  initialChats: any[];
}

export function ChatListClient({ currentUserId, initialChats }: ChatListClientProps) {
  const [query, setQuery] = useState("");
  const [mutedChats, setMutedChats] = useState<string[]>([]);

  useEffect(() => {
    setMutedChats(JSON.parse(localStorage.getItem("mutedChats") || "[]"));

    // Optional: listen for storage changes if multiple tabs are open
    const handleStorage = () => {
      setMutedChats(JSON.parse(localStorage.getItem("mutedChats") || "[]"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const router = useRouter();

  useEffect(() => {
    const handleRefresh = () => {
      router.refresh();
    };

    window.addEventListener("chat:optimistic_message", handleRefresh);
    window.addEventListener("messages:read", handleRefresh);
    window.addEventListener("chat:message_updated", handleRefresh);
    window.addEventListener("chat:message_deleted", handleRefresh);

    return () => {
      window.removeEventListener("chat:optimistic_message", handleRefresh);
      window.removeEventListener("messages:read", handleRefresh);
      window.removeEventListener("chat:message_updated", handleRefresh);
      window.removeEventListener("chat:message_deleted", handleRefresh);
    };
  }, [router]);

  const filteredChats = initialChats.filter(chat => {
    const otherUser = chat.participants[0];
    if (!otherUser) return false;
    if (otherUser.id === currentUserId) return false; // Убираем Избранное

    if (!query.trim()) return true;

    const search = query.toLowerCase();
    const nameMatch = otherUser.name?.toLowerCase().includes(search);
    const usernameMatch = otherUser.username?.toLowerCase().includes(search);
    return nameMatch || usernameMatch;
  });

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Поиск по перепискам..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={<Search size={18} />}
        className="bg-surface/50 border-border/40 backdrop-blur-md h-12 py-0 rounded-2xl"
      />

      <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-border/40">
        <div className="divide-y divide-border/30">
          {filteredChats.map(chat => {
            const otherUser = chat.participants[0];
            const lastMessage = chat.messages[0];
            const isSavedMessages = otherUser?.id === currentUserId;
            const isOnline = isSavedMessages ? false : (otherUser?.lastSeen ? Math.abs(new Date().getTime() - new Date(otherUser.lastSeen).getTime()) < 3 * 60 * 1000 : false);

            if (!otherUser) return null;

            return (
              <Link
                href={`/messages/${otherUser.username || otherUser.id}`}
                key={chat.id}
                className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isSavedMessages ? (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Bookmark size={24} />
                    </div>
                  ) : (
                    <Avatar
                      size="md"
                      src={otherUser.image || undefined}
                      fallback={otherUser.email?.[0]?.toUpperCase()}
                      isOnline={isOnline}
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {isSavedMessages ? (
                          <span className="text-[15px] font-semibold truncate text-primary">Избранное</span>
                        ) : (
                          <UserName
                            user={otherUser}
                            showHandle={false}
                            nameClassName="text-[15px] font-semibold truncate"
                            iconClassName="w-4 h-4"
                            hoverUnderline={false}
                          />
                        )}
                        {mutedChats.includes(chat.id) && (
                          <BellOff size={14} className="text-secondary/70 flex-shrink-0" />
                        )}
                      </div>
                      {lastMessage && (
                        <span className="text-xs text-secondary whitespace-nowrap ml-2 flex-shrink-0">
                          {new Date(lastMessage.createdAt).toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center gap-4 mt-0.5">
                      <p className="text-sm text-secondary truncate min-w-0 pr-4">
                        {lastMessage ? (
                          <span className={lastMessage.senderId === currentUserId ? "text-secondary" : "text-primary"}>
                            {lastMessage.senderId === currentUserId && "Вы: "}
                            {lastMessage.content ? lastMessage.content : (lastMessage.attachments && lastMessage.attachments.length > 0 ? "📷 Фотография" : "📞 Звонок")}
                          </span>
                        ) : (
                          <span className="italic">Нет сообщений</span>
                        )}
                      </p>
                      
                      {chat.unreadCount > 0 && (
                        <div className="min-w-5 h-5 bg-accent text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5 shrink-0 shadow-sm leading-none tabular-nums mt-0.5">
                          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-secondary text-sm">
              По вашему запросу ничего не найдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
