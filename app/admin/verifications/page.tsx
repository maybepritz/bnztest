import { getServerUser } from "@/shared/lib/auth";
import { Avatar } from "@/shared/ui";
import { Shield, ShieldOff, Trash2, Check, X, Video } from "lucide-react";
import { VerificationActions } from "./VerificationActions";

export default async function AdminVerificationsPage() {
  const session = await getServerUser();
  let requests: any[] = [];
  let error = null;

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/verifications`, {
      headers: { "Authorization": `Bearer ${session?.token}` },
      cache: "no-store"
    });
    if (res.ok) {
      requests = await res.json();
    } else {
      error = "Не удалось загрузить заявки (Требуются права ADMIN)";
    }
  } catch (e) {
    error = "Сервер недоступен";
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary">Заявки на верификацию</h1>
      
      {error && <div className="text-danger">{error}</div>}

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-hover/50 text-secondary border-b border-border text-sm">
            <tr>
              <th className="p-4 font-medium">Пользователь</th>
              <th className="p-4 font-medium">Ссылка на видео</th>
              <th className="p-4 font-medium">Дата заявки</th>
              <th className="p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-surface-hover/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" fallback={req.user.username?.[0]?.toUpperCase()} />
                    <div>
                      <div className="font-semibold text-primary">{req.user.username}</div>
                      <div className="text-xs text-secondary">{req.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <a href={req.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                    <Video size={16} />
                    Смотреть видео
                  </a>
                </td>
                <td className="p-4 text-sm text-secondary">
                  {new Date(req.createdAt).toLocaleString("ru-RU")}
                </td>
                <td className="p-4">
                  <VerificationActions requestId={req.id} />
                </td>
              </tr>
            ))}
            {requests.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-secondary">
                  Нет активных заявок на верификацию
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
