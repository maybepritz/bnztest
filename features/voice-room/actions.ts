"use server";

import { getServerUser } from "@/shared/lib/auth";

export async function getVoiceTokenAction(roomName: string) {
  const session = await getServerUser();
  if (!session?.token) throw new Error("Unauthorized");

  const backendUrl = process.env.BACKEND_URL;
  const res = await fetch(`${backendUrl}/api/voice/token?room=${roomName}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${session.token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get voice token");
  }

  const data = await res.json();
  return data.token as string;
}
