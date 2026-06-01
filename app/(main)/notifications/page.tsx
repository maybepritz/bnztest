"use client";

import { useEffect, useState } from "react";
import { Avatar, Button } from "@/shared/ui";
import { Heart, MessageCircle, User, Repeat, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    name: string;
    image: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Отмечаем все как прочитанные при входе на страницу
    fetch("/api/notifications/read-all", { method: "POST" })
      .then(() => window.dispatchEvent(new CustomEvent("notifications:read")));

  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_LIKE": return <Heart size={18} className="fill-current text-danger" />;
      case "NEW_COMMENT": return <MessageCircle size={18} className="text-primary" />;
      case "NEW_FOLLOWER": return <User size={18} className="text-success" />;
      case "NEW_REPOST": return <Repeat size={18} className="text-success" />;
      default: return <CheckCircle size={18} className="text-primary" />;
    }
  };

  const getBgClass = (type: string) => {
    switch (type) {
      case "NEW_LIKE": return "bg-danger/10";
      case "NEW_COMMENT": return "bg-primary/10";
      case "NEW_FOLLOWER": return "bg-success/10";
      case "NEW_REPOST": return "bg-success/10";
      default: return "bg-primary/10";
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Уведомления</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-surface h-20 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-4 border-b border-border/40">
        <h1 className="text-2xl font-bold">Уведомления</h1>
      </div>

      <div className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-secondary">
            У вас пока нет уведомлений
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={(e) => {
                 if ((e.target as HTMLElement).closest('a')) return;
                 if (notif.link) router.push(notif.link);
              }}
              className={cn(
                "p-4 rounded-3xl flex items-start gap-4 transition-all duration-200",
                notif.link ? "cursor-pointer hover:bg-surface-hover active:scale-[0.98]" : "",
                notif.isRead ? "bg-surface" : "bg-primary/5 border border-primary/20 shadow-sm"
              )}
            >
              <div className={cn("p-3 rounded-full flex-shrink-0 mt-1", getBgClass(notif.type))}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] leading-snug">
                  <Link href={`/@${notif.sender.username}`} className="font-bold hover:underline">
                    {notif.sender.name || notif.sender.username}
                  </Link>{" "}
                  <span className="text-primary/90">{notif.message}</span>
                </p>
                <span className="text-xs text-secondary mt-1 block">
                  {new Date(notif.createdAt).toLocaleString("ru-RU", { 
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                  })}
                </span>
              </div>
              <Link href={`/@${notif.sender.username}`} className="flex-shrink-0">
                <Avatar src={notif.sender.image} fallback={notif.sender.username[0].toUpperCase()} size="md" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
