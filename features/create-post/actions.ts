"use server";

import { getServerUser } from "@/shared/lib/auth";

import { revalidatePath } from "next/cache";

export async function createPostAction(content: string = "", imageUrl?: string, repostOfId?: string) {
  const session = await getServerUser();
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  const safeContent = content || "";
  if (!safeContent.trim() && !imageUrl) return { error: "Content or image is required" };

  const response = await fetch(`${process.env.BACKEND_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}` // Assuming session holds token or we use cookie
    },
    body: JSON.stringify({ content: content.trim(), image: imageUrl, repostOfId: repostOfId }) // repostOfId is null for original posts
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  // Revalidate the feeds so the new post appears
  revalidatePath("/");
  revalidatePath(`/[username]`, "page");
}
