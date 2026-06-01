"use server";

import { getServerUser } from "@/shared/lib/auth";

export async function getUserByUsernameAction(username: string) {
  const session = await getServerUser();
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  const headers: HeadersInit = { "Authorization": `Bearer ${session.token}` };
  
  const response = await fetch(`${process.env.BACKEND_URL}/api/users/${username}`, {
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    return { error: "Failed to fetch user" };
  }

  return response.json();
}
