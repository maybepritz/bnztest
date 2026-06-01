import { getServerUser } from "@/shared/lib/auth";
import { Avatar } from "@/shared/ui";
import { User as UserIcon, Shield, ShieldOff, Trash2 } from "lucide-react";
import { UserActions } from "./UserActions";

export default async function AdminUsersPage() {
  const session = await getServerUser();
  let users: any[] = [];
  let error = null;

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/users`, {
      headers: { "Authorization": `Bearer ${session?.token}` },
      cache: "no-store"
    });
    if (res.ok) {
      users = await res.json();
    } else {
      error = "Не удалось загрузить пользователей (Требуются права ADMIN)";
    }
  } catch (e) {
    error = "Сервер недоступен";
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary">Пользователи</h1>
      
      {error && <div className="text-danger">{error}</div>}

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-hover/50 text-secondary border-b border-border text-sm">
            <tr>
              <th className="p-4 font-medium">Пользователь</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Роль</th>
              <th className="p-4 font-medium">Статус</th>
              <th className="p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-surface-hover/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" fallback={user.username?.[0]?.toUpperCase()} />
                    <div>
                      <div className="font-semibold text-primary">{user.username}</div>
                      <div className="text-xs text-secondary">{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-secondary">{user.email}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.role?.toUpperCase() === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-surface-hover text-secondary'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.isVerified ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {user.isVerified ? 'Верифицирован' : 'Не верифицирован'}
                  </span>
                </td>
                <td className="p-4">
                  <UserActions userId={user.id} isVerified={user.isVerified} />
                </td>
              </tr>
            ))}
            {users.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary">
                  Пользователи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
