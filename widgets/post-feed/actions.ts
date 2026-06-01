"use server";

import { getServerUser } from "@/shared/lib/auth";


export async function getPostsAction(cursor?: string, limit = 10, targetUserId?: string, likedByUserId?: string) {
  const session = await getServerUser();
  
  const url = new URL(`${process.env.BACKEND_URL}/api/posts`);
  if (targetUserId) url.searchParams.append("targetUserId", targetUserId);
  if (likedByUserId) url.searchParams.append("likedByUserId", likedByUserId);
  if (cursor) url.searchParams.append("cursor", cursor);
  if (limit) url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": session?.token ? `Bearer ${session.token}` : ""
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("GET /api/posts failed:", response.status, errorText);
    return { posts: [], nextCursor: undefined, followingIds: [] };
  }

  const data = await response.json();

  return {
    posts: data.posts.map((post: any) => ({
      ...post,
      createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date()
    })),
    nextCursor: data.nextCursor,
    followingIds: data.followingIds
  };
}
