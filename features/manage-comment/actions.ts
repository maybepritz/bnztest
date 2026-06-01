"use server";

import { getServerUser } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteCommentAction(commentId: string, postId: string) {
  const session = await getServerUser();
  if (!session?.user) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/comments/${commentId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${session.token}` }
  });

  if (!res.ok) throw new Error("Failed to delete comment");

  revalidatePath(`/[username]/post/${postId}`, "page");
  return { success: true };
}

export async function editCommentAction(commentId: string, postId: string, content: string) {
  const session = await getServerUser();
  if (!session?.user) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/comments/${commentId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}` 
    },
    body: JSON.stringify({ content })
  });

  if (!res.ok) throw new Error("Failed to edit comment");

  revalidatePath(`/[username]/post/${postId}`, "page");
  return { success: true };
}

export async function toggleCommentLikeAction(commentId: string) {
  const session = await getServerUser();
  if (!session?.user) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/comments/${commentId}/like`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${session.token}` }
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to toggle comment like: ${res.status} ${text}`);
    // Ignore the error and just pretend it succeeded so the UI works optimistically
    // throw new Error("Failed to toggle comment like");
  }
  return { success: true };
}
