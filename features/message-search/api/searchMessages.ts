"use server";

import { getServerUser } from "@/shared/lib/auth";

export async function searchChatMessagesAction(chatId: string, query: string) {
  const session = await getServerUser();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/chats/${chatId}/messages/all?limit=100`, {
    headers: { "Authorization": `Bearer ${session.token}` }
  });
  
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
}
