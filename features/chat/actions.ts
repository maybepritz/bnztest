"use server";

import { getServerUser } from "@/shared/lib/auth";

import { revalidatePath } from "next/cache";
import { chatEventEmitter } from "@/shared/lib/events";

export async function sendMessage(targetUsername: string, content: string, replyToId?: string, attachments: string[] = []) {
  if ((!content || !content.trim()) && attachments.length === 0) return { error: "Пустое сообщение" };

  const session = await getServerUser();
  if (!session?.user?.id) return { error: "Не авторизован" };
  
  // Отправляем запрос на Java-бэкенд для создания сообщения
  const response = await fetch(`${process.env.BACKEND_URL}/api/chats/${targetUsername}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ 
      content: content ? content.trim() : "",
      attachments: attachments,
      replyToId: replyToId || null
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Backend error (${response.status}):`, errorText);
    return { error: "Ошибка отправки сообщения: " + response.status };
  }

  const newMessage = await response.json();
  
  // Отправляем событие в SSE шину
  chatEventEmitter.emit(`chat:${newMessage.chatId}:message`, newMessage);

  // Обновляем страницу для fallback (если SSE отвалится или для других вкладок)
  // Удаляем revalidatePath для текущего чата, чтобы избежать гонки с локальным стейтом
  revalidatePath(`/messages`); // To update ChatList latest message
  
  return { success: true, message: newMessage };
}

export async function toggleReaction(messageId: string, emoji: string, targetUsername: string) {
  const session = await getServerUser();
  if (!session?.user?.id) return { error: "Не авторизован" };

  const response = await fetch(`${process.env.BACKEND_URL}/api/chats/messages/${messageId}/reactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ emoji })
  });

  if (!response.ok) {
    return { error: "Ошибка" };
  }

  // Optimistic update happens on the client. 
  // We don't fetch the updated message here because the client should update UI immediately.
  // We can just revalidate the path.
  revalidatePath(`/messages/${targetUsername}`);
  return { success: true };
}

export async function editMessage(messageId: string, content: string) {
  const session = await getServerUser();
  if (!session?.user?.id) return { error: "Не авторизован" };

  const response = await fetch(`${process.env.BACKEND_URL}/api/chats/messages/${messageId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ content: content.trim() })
  });

  if (!response.ok) return { error: "Ошибка редактирования" };
  return { success: true };
}

export async function deleteMessage(messageId: string) {
  const session = await getServerUser();
  if (!session?.user?.id) return { error: "Не авторизован" };

  const response = await fetch(`${process.env.BACKEND_URL}/api/chats/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!response.ok) return { error: "Ошибка удаления" };
  return { success: true };
}

export async function deleteChat(chatId: string) {
  const session = await getServerUser();
  if (!session?.user?.id) return { error: "Не авторизован" };

  const response = await fetch(`${process.env.BACKEND_URL}/api/chats/${chatId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!response.ok) return { error: "Ошибка удаления чата" };
  
  revalidatePath(`/messages`);
  revalidatePath(`/`);
  return { success: true };
}
