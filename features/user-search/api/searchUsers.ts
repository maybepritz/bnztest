"use server";

import { getServerUser } from "@/shared/lib/auth";

export async function searchUsersAction(query: string, page: number = 0) {
  const session = await getServerUser();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!query.trim()) throw new Error("Query is required");
  
  const response = await fetch(`${process.env.BACKEND_URL}/api/search`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${session.token}` 
    },
    body: JSON.stringify({
      query: query,
      page: page
    }),
  });

  const users = await response.json();
  console.log("SEARCH RESPONSE:", users);
  return users.results || users;
}
