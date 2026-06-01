"use server";

import { getServerUser } from "@/shared/lib/auth";

import { revalidatePath } from "next/cache";

export async function addCommentAction(formData: FormData) {
  const session = await getServerUser();
  if (!session?.user) {
    throw new Error("Не авторизован");
  }

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;

  if (!content || !content.trim()) {
    throw new Error("Комментарий не может быть пустым");
  }

  const response = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.token}` },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  revalidatePath(`/[username]/post/${postId}`, "page");
}
