"use server";

import { getServerUser } from "@/shared/lib/auth";

import { revalidatePath } from "next/cache";

export async function toggleFollowAction(targetUserId: string) {
  const session = await getServerUser();
  if (!session?.token) {
    throw new Error("Не авторизован");
  }

  const res = await fetch(`${process.env.BACKEND_URL}/api/users/follow/${targetUserId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!res.ok) {
    throw new Error("Ошибка при подписке");
  }

  // Revalidate pages that might display follow state
  revalidatePath("/");
  revalidatePath("/[username]", "page");
}
