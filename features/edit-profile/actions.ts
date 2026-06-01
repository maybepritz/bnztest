"use server";

import { getServerUser } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(data: { name?: string; bio?: string; image?: string; banner?: string; publicKey?: string }) {
  const session = await getServerUser();
  if (!session?.token) throw new Error("Не авторизован");

  const res = await fetch(`${process.env.BACKEND_URL}/api/users/me`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${session.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: data.name,
      bio: data.bio,
      image: data.image,
      banner: data.banner,
      publicKey: data.publicKey
    })
  });

  if (!res.ok) throw new Error("Ошибка при обновлении профиля");

  // Revalidate profile pages
  revalidatePath("/[username]", "page");
  revalidatePath("/");
}
