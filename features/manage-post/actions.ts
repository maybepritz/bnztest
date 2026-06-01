"use server";

import { getServerUser } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function deletePostAction(postId: string) {
  const session = await getServerUser();
  if (!session?.user) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${session.token}` }
  });

  if (!res.ok) throw new Error("Failed to delete post");

  revalidatePath("/");
  revalidatePath(`/@${session.user.username}`);
  return { success: true };
}

export async function editPostAction(postId: string, content: string) {
  const session = await getServerUser();
  if (!session?.user) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}` 
    },
    body: JSON.stringify({ content })
  });

  if (!res.ok) throw new Error("Failed to edit post");

  revalidatePath("/");
  revalidatePath(`/@${session.user.username}`);
  revalidatePath(`/[username]/post/${postId}`, "page");
  return { success: true };
}

export async function viewPostAction(postId: string) {
  const session = await getServerUser();
  if (!session?.user) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}/view`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${session.token}` }
  });

  if (!res.ok) throw new Error("Failed to register view");
  
  return { success: true };
}

export async function repostAction(postId: string) {
  const session = await getServerUser();
  if (!session?.user) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}/repost`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${session.token}` 
    }
  });

  if (!res.ok) throw new Error("Failed to repost");
  
  const data = await res.json();

  revalidatePath("/");
  revalidatePath(`/@${session.user.username}`);
  return { success: true, reposted: data.reposted };
}
