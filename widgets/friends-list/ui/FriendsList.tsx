import { getServerUser } from "@/shared/lib/auth";

import { Avatar, Button } from "@/shared/ui";
import { UserName } from "@/entities/user";
import { MessageCircle, Users, Bookmark } from "lucide-react";
import { ChatListSkeleton } from "@/widgets/chat-list/ui/ChatListSkeleton";
import Link from "next/link";

export async function FriendsList() {
  const session = await getServerUser();
  
  if (!session?.user?.id) {
    return null;
  }

  let res;
  try {
    res = await fetch(`${process.env.BACKEND_URL}/api/users/me/friends`, {
      headers: {
        "Authorization": `Bearer ${session.token}`
      },
      cache: 'no-store'
    });
  } catch (e) {
    return <ChatListSkeleton />;
  }

  if (!res.ok) {
    return null;
  }

  const mutualFriends = await res.json();

  if (mutualFriends.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="bg-surface rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm border border-border/40">
          <div className="bg-surface-hover p-4 rounded-full mb-4">
            <Users size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-primary mb-2">Нет друзей для общения</h3>
          <p className="text-secondary max-w-sm mb-6">
            Чтобы начать переписку, подпишитесь на кого-нибудь взаимно. Найдите интересных людей в поиске!
          </p>
          <Link href="/search">
            <Button className="rounded-full">Найти друзей</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-border/40">
      <div className="p-4 border-b border-border/50 bg-surface-hover/30">
        <h2 className="font-bold text-primary px-2">Ваши друзья ({mutualFriends.length})</h2>
      </div>
      
      <div className="divide-y divide-border/30">
        {mutualFriends.map((friend: any) => {
          const lastSeen = friend.lastSeen ? new Date(friend.lastSeen) : null;
          const isOnline = lastSeen ? Math.abs(new Date().getTime() - lastSeen.getTime()) < 3 * 60 * 1000 : false;
          
          return (
            <div key={friend.id} className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors">
              <div className="flex items-center gap-3">
                <Avatar 
                  size="md" 
                  src={friend.image}
                  fallback={friend.email?.[0]?.toUpperCase()} 
                  isOnline={isOnline}
                />
                <div>
                  <UserName 
                    user={friend} 
                    showHandle={true}
                    href={`/@${friend.username}`}
                    nameClassName="text-[15px]"
                    iconClassName="w-4 h-4"
                    handleClassName="text-secondary text-sm truncate max-w-[120px]"
                  />
                  {isOnline ? (
                    <span className="text-xs text-success font-medium">В сети</span>
                  ) : (
                    <span className="text-xs text-secondary">
                      {lastSeen ? `Был(а) ${lastSeen.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}` : "Недавно"}
                    </span>
                  )}
                </div>
              </div>
              
              <Link href={`/messages/${friend.username || friend.id}`}>
                <Button variant="secondary" className="rounded-full flex items-center gap-2">
                  <MessageCircle size={18} />
                  <span className="hidden sm:inline">Написать</span>
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
