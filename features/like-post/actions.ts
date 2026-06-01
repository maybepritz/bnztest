"use server";

import { getServerUser } from "@/shared/lib/auth";


export async function toggleLikeAction(postId: string) {
  const session = await getServerUser();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const response = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${session.token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to toggle like");
  }

  // The backend currently doesn't return { liked: boolean }, but rather { success: true }.
  // However, since the client optimistically updates it, we don't strictly need to return the exact new state.
  // We'll just assume it toggled. If we really wanted to know, we could fetch the post again or have the backend return the state.
  return { success: true };
}
