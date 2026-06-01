// widgets/sidebar/model/use-sidebar.ts
import { useEffect, useState } from "react";
import { usePathname, redirect } from "next/navigation";

export function useSidebar(initialUsername?: string) {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(initialUsername || null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);

  useEffect(() => {
    if (pathname === "/notifications") {
      setUnreadCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    fetch("/api/notifications/unread-count", { cache: "no-store" })
      .then(res => res.json())
      .then(data => { if (data.unreadCount > 0) setUnreadCount(data.unreadCount); })
      .catch(() => {});

    fetch("/api/chats/unread-count", { cache: "no-store" })
      .then(res => res.json())
      .then(data => { if (data.unreadCount > 0) setMessagesUnreadCount(data.unreadCount); })
      .catch(() => {});

    const handleUnreadNotif = () => setUnreadCount(prev => prev + 1);
    const handleReadNotif = () => setUnreadCount(0);
    const handleUnreadMsg = () => setMessagesUnreadCount(prev => prev + 1);
    const handleReadMsg = () => {
      fetch("/api/chats/unread-count", { cache: "no-store" })
        .then(res => res.json())
        .then(data => setMessagesUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    };

    window.addEventListener("notifications:unread", handleUnreadNotif);
    window.addEventListener("notifications:read", handleReadNotif);
    window.addEventListener("messages:unread", handleUnreadMsg);
    window.addEventListener("messages:read", handleReadMsg);

    return () => {
      window.removeEventListener("notifications:unread", handleUnreadNotif);
      window.removeEventListener("notifications:read", handleReadNotif);
      window.removeEventListener("messages:unread", handleUnreadMsg);
      window.removeEventListener("messages:read", handleReadMsg);
    };
  }, []);

  // Чтение профиля из localStorage
  useEffect(() => {
    if (!initialUsername) {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.username) setUsername(user.username);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [initialUsername]);

  const profileHref = username ? `/@${username}` : "/login";

  const handleLogout = async () => {
    localStorage.removeItem("user");
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" })
    });
    redirect("/login");
  };

  return {
    pathname,
    profileHref,
    unreadCount,
    messagesUnreadCount,
    handleLogout,
  };
}