"use server";

import { getServerUser } from "@/shared/lib/auth";

export async function getMessagesAction(chatId: string, cursor?: string, limit = 20) {
  const session = await getServerUser();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const url = new URL(`${process.env.BACKEND_URL}/api/chats/${chatId}/messages`);
  if (cursor) url.searchParams.append("cursor", cursor);
  if (limit) url.searchParams.append("limit", limit.toString());

  const res = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!res.ok) {
    return { messages: [], nextCursor: undefined };
  }

  const data = await res.json();
  return {
    messages: data.messages || [],
    nextCursor: data.nextCursor
  };
}

export async function getMessagesContextAction(chatId: string, messageId: string, limit = 20) {
  const session = await getServerUser();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/chats/${chatId}/messages/context?msgId=${messageId}&limit=${limit}`, {
    headers: { "Authorization": `Bearer ${session.token}` }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch messages context");
  }

  return await res.json();
}

export async function getNewerMessagesAction(chatId: string, cursor: string, limit = 20) {
  const session = await getServerUser();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const url = new URL(`${process.env.BACKEND_URL}/api/chats/${chatId}/messages`);
  url.searchParams.append("cursor", cursor);
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("direction", "newer");

  const res = await fetch(url.toString(), {
    headers: { "Authorization": `Bearer ${session.token}` }
  });

  if (!res.ok) {
    return { messages: [], prevCursor: undefined };
  }

  return await res.json();
}

