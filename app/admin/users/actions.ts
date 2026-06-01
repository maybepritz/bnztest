"use server";

import { getServerUser } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(userId: string) {
  try {
    const session = await getServerUser();
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return { success: false, error: "У вас нет прав администратора" };
    }

    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    if (!res.ok) {
      return { success: false, error: "Не удалось удалить пользователя" };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Ошибка соединения с сервером" };
  }
}

export async function toggleVerifyUserAction(userId: string) {
  try {
    const session = await getServerUser();
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return { success: false, error: "У вас нет прав администратора" };
    }

    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/users/${userId}/verify`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    if (!res.ok) {
      return { success: false, error: "Не удалось изменить статус верификации" };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Ошибка соединения с сервером" };
  }
}

export async function sendAdminCodeAction(userId: string) {
  try {
    const session = await getServerUser();
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return { success: false, error: "У вас нет прав администратора" };
    }

    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/users/${userId}/send-admin-code`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    if (!res.ok) {
      return { success: false, error: "Не удалось отправить код" };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: "Ошибка соединения с сервером" };
  }
}
