import { getServerUser } from "@/shared/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerUser();
  let stats = { users: 0, posts: 0, messages: 0, verifications: 0 };
  let error = null;

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/stats`, {
      headers: { "Authorization": `Bearer ${session?.token}` },
      cache: "no-store"
    });
    if (res.ok) {
      stats = await res.json();
    } else {
      error = "Не удалось загрузить статистику (Требуются права ADMIN)";
    }
  } catch (e) {
    error = "Сервер недоступен";
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Обзор</h1>
      </div>
      
      {error && (
        <div className="text-danger flex flex-col gap-2">
          <span>{error}</span>
          <span className="text-xs text-secondary">
            Если вы видите эту ошибку, вероятно, у вашей сессии в Next.js есть права ADMIN, но в базе данных ваша роль — USER. Пожалуйста, выйдите из аккаунта и зайдите заново.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-secondary font-medium">Пользователи</h3>
          <p className="text-4xl font-bold text-primary mt-2">{stats.users}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-secondary font-medium">Посты</h3>
          <p className="text-4xl font-bold text-primary mt-2">{stats.posts}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-secondary font-medium">Сообщения</h3>
          <p className="text-4xl font-bold text-primary mt-2">{stats.messages}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-secondary font-medium">Заявки</h3>
          <p className="text-4xl font-bold text-primary mt-2">{stats.verifications}</p>
        </div>
      </div>
    </div>
  );
}
