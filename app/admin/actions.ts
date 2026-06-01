"use server";

import { getServerUser } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function makeMeAdminAction() {
  const session = await getServerUser();
  if (!session?.token) return { error: "Not logged in" };

  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/make-me-admin`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!res.ok) {
    return { error: "Failed to become admin" };
  }

  // We need to re-login to update the cookie, but for testing just returning success is fine,
  // The user might have to re-login to see ADMIN role in Next.js session.
  revalidatePath("/");
  return { success: true };
}

export async function sendAdminCodeAction(userId: string) {
  const session = await getServerUser();
  if (!session?.token) return { error: "Not logged in" };

  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/users/${userId}/send-admin-code`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!res.ok) {
    return { error: "Failed to send code" };
  }
  return { success: true };
}

export async function verifyAdminCodeAction(code: string) {
  const session = await getServerUser();
  if (!session?.token) return { error: "Not logged in" };

  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/verify-admin-code`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.error || "Failed to verify code" };
  }

  // Need to update local session or simply instruct user to relogin
  return { success: true };
}
