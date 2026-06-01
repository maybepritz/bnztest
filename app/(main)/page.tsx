import { getServerUser } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { ChatList } from "@/widgets/chat-list";
import { FriendsList } from "@/widgets/friends-list";
import { Button } from "@/shared/ui/Button";
import { Bookmark, MessageCircle, MessageCirclePlus } from "lucide-react";
import Link from "next/link";
import { IconButton } from "@/shared/ui";

export default async function Home() {
  const session = await getServerUser();

  if (!session) return null;

  return (
    <div className="flex flex-col gap-4 pb-12 pt-2">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-8 hidden md:block">Чаты</h1>
        <Link href="/search">
          <Button variant="secondary" className="rounded-full border border-border px-2.5 py-2.5" title="Найти пользователя">
            <MessageCirclePlus size={20} />
          </Button>
        </Link>
      </div>
      <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-border/40 mb-4 hover:border-primary/40 transition-colors">
      <Link href={`/messages/${session.user.username}`} className="flex items-center p-4 hover:bg-surface-hover transition-colors group">
        <div className="flex items-center gap-4">
          <IconButton variant="ghost" className="group-hover:text-primary">
            <Bookmark size={24} />
          </IconButton>
          <div>
            <h3 className="font-bold text-[15px] text-primary">Избранное</h3>
            <p className="text-sm text-secondary">Ваши сохраненные сообщения</p>
          </div>
        </div>
      </Link>
    </div>
      <ChatList emptyFallback={<FriendsList />} />
    </div>
  );
}
