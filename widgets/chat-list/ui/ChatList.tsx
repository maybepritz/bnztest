import { getServerUser } from "@/shared/lib/auth";

import { ChatListClient } from "./ChatListClient";
import { ChatListSkeleton } from "./ChatListSkeleton";

export async function ChatList({ emptyFallback }: { emptyFallback?: React.ReactNode }) {
  const session = await getServerUser();
  
  if (!session?.user?.id) {
    return null;
  }

  const currentUserId = session.user.id;

  let res;
  try {
    res = await fetch(`${process.env.BACKEND_URL}/api/chats`, {
      headers: {
        "Authorization": `Bearer ${session.token}`
      },
      cache: "no-store"
    });
  } catch (e) {
    // Backend offline
    return <ChatListSkeleton />;
  }

  let chats = [];
  if (res.ok) {
    chats = await res.json();
  }

  const isOnlySavedMessages = chats.length === 1 && chats[0].participants?.length > 0 && chats[0].participants[0].id === currentUserId;

  if (chats.length === 0 || isOnlySavedMessages) {
    return emptyFallback || null;
  }

  return <ChatListClient currentUserId={currentUserId} initialChats={chats} />;
}
