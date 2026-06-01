import { getServerUser } from "@/shared/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Users, LayoutDashboard, Settings, Shield } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerUser();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role?.toUpperCase() !== "ADMIN") {
    // If not admin, show the special code entry page instead of the admin panel
    const { AdminAuth } = await import("./AdminAuth");
    return <AdminAuth />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-surface border-r border-border flex flex-col p-4 gap-2">
        <h2 className="text-xl font-bold text-primary px-4 py-4 mb-4">Панель Управления</h2>
        
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-primary hover:bg-surface-hover rounded-xl transition-colors">
          <LayoutDashboard size={20} />
          <span className="font-medium">Обзор</span>
        </Link>
        <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-primary hover:bg-surface-hover rounded-xl transition-colors">
          <Users size={20} />
          <span className="font-medium">Пользователи</span>
        </Link>
        <Link href="/admin/verifications" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-primary hover:bg-surface-hover rounded-xl transition-colors">
          <Shield size={20} />
          <span className="font-medium">Верификации</span>
        </Link>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-primary hover:bg-surface-hover rounded-xl transition-colors mt-auto">
          <span className="font-medium">&larr; В приложение</span>
        </Link>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
