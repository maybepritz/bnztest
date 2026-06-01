import { Sidebar } from "@/widgets/sidebar";
import { RightFooter } from "@/widgets/right-footer";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { GlobalCallWrapper } from "@/widgets/chat-room/ui/GlobalCallWrapper";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  
  if (!userCookie || !userCookie.value) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg m-8">
        <h2>Ошибка авторизации (Куки не найдены)</h2>
        <p>Пожалуйста, вернитесь на <a href="/login" className="underline font-bold">страницу входа</a> и попробуйте еще раз.</p>
      </div>
    );
  }

  // Парсим данные пользователя, чтобы передать их дальше если нужно
  let user = null;
  try {
    user = JSON.parse(decodeURIComponent(userCookie.value));
  } catch (e: any) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg m-8">
        <h2>Ошибка авторизации (Неверный формат куки)</h2>
        <p>{e.message}</p>
        <p>Пожалуйста, вернитесь на <a href="/login" className="underline font-bold">страницу входа</a> и попробуйте еще раз.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary font-sans flex justify-center transition-colors duration-300">
      <div className="grid grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[1fr_minmax(0,672px)_1fr] w-full max-w-325 gap-4 lg:gap-8 relative px-4 mx-auto">
        
        {/* Левый сайдбар (выравниваем по правому краю своей колонки, чтобы он был ближе к контенту) */}
        <div className="flex lg:justify-end">
          <div className="w-28">
            <Sidebar initialUsername={user?.username} />
          </div>
        </div>

        {/* Центральный контент */}
        <main className="min-w-0 py-4">
          <div className="w-full h-full mx-auto">
            {children}
          </div>
        </main>
        
        {/* Правый сайдбар / футер */}
        <div className="hidden lg:block">
          <RightFooter />
        </div>

      </div>
      <GlobalCallWrapper />
    </div>
  );
}
