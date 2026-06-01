"use server";

import { getServerUser } from "@/shared/lib/auth";

export async function requestVerificationAction(videoUrl: string) {
  const session = await getServerUser();
  if (!session?.token) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/verification/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ videoUrl })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to request verification");
  }

  return await res.json();
}

export async function getVerificationStatusAction() {
  const session = await getServerUser();
  if (!session?.token) return { hasPendingRequest: false };

  const res = await fetch(`${process.env.BACKEND_URL}/api/verification/status`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${session.token}`
    },
    cache: "no-store"
  });

  if (!res.ok) return { hasPendingRequest: false };
  return await res.json();
}

export async function revokeVerificationAction() {
  const session = await getServerUser();
  if (!session?.token) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/api/verification/revoke`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${session.token}`
    },
  });

  if (!res.ok) throw new Error("Failed to revoke verification");
  return await res.json();
}
