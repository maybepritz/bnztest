"use server";

import { getServerUser } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveVerificationAction(id: string) {
  try {
    const session = await getServerUser();
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return { success: false, error: "У вас нет прав администратора" };
    }

    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/verifications/${id}/approve`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    if (!res.ok) {
      return { success: false, error: "Не удалось одобрить" };
    }

    revalidatePath("/admin/verifications");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Ошибка соединения с сервером" };
  }
}

export async function rejectVerificationAction(id: string) {
  try {
    const session = await getServerUser();
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return { success: false, error: "У вас нет прав администратора" };
    }

    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/verifications/${id}/reject`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    if (!res.ok) {
      return { success: false, error: "Не удалось отклонить" };
    }

    revalidatePath("/admin/verifications");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Ошибка соединения с сервером" };
  }
}
