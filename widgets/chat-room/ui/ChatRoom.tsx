import { getServerUser } from "@/shared/lib/auth";
import { Avatar, IconButton } from "@/shared/ui";
import { UserName } from "@/entities/user";
import { ArrowLeft, Phone, MoreVertical, Bookmark } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatInput } from "./ChatInput";
import { ChatStream } from "./ChatStream";
import { ChatSearch } from "@/features/message-search";
import { CallButton } from "./CallButton";
import { ChatVoicePanel } from "./ChatVoicePanel";
import { ActiveCallBanner } from "./ActiveCallBanner";
import { ChatSettings } from "./ChatSettings";

interface ChatRoomProps {
  currentUserId: string;
  targetUsername: string;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function ChatRoom({ currentUserId, targetUsername, searchParams }: ChatRoomProps) {
  const session = await getServerUser();
  if (!session?.token) return notFound();

  let targetUser = null;
  try {
    const userRes = await fetch(`${process.env.BACKEND_URL}/api/users/${encodeURIComponent(targetUsername)}`, {
      headers: { "Authorization": `Bearer ${session.token}` }
    });
    if (!userRes.ok) return notFound();
    targetUser = await userRes.json();
  } catch (err) {
    console.error("Failed to fetch target user:", err);
    return notFound();
  }

  // Find the chat between these two users
  let chat = null;
  try {
    const chatRes = await fetch(`${process.env.BACKEND_URL}/api/chats/direct/${encodeURIComponent(targetUsername)}`, {
      headers: { "Authorization": `Bearer ${session.token}` }
    });
    if (chatRes.ok) {
      const data = await chatRes.json();
      if (data.exists) chat = data;
    }
  } catch (err) {
    console.error("Failed to fetch direct chat:", err);
  }

  let messages: any[] = [];
  let initialNextCursor: string | undefined = undefined;
  let initialPrevCursor: string | undefined = undefined;

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const msgId = resolvedSearchParams?.msgId as string | undefined;

  if (chat) {
    if (msgId) {
      const { getMessagesContextAction } = await import('../actions');
      try {
        const res = await getMessagesContextAction(chat.id, msgId, 20);
        messages = res.messages;
        initialNextCursor = res.nextCursor;
        initialPrevCursor = res.prevCursor;
      } catch (e) {
        // If message not found, fallback to latest
        const { getMessagesAction } = await import('../actions');
        const res = await getMessagesAction(chat.id, undefined, 20);
        messages = res.messages;
        initialNextCursor = res.nextCursor;
      }
    } else {
      const { getMessagesAction } = await import('../actions');
      const res = await getMessagesAction(chat.id, undefined, 20);
      messages = res.messages;
      initialNextCursor = res.nextCursor;
    }
  }

  const lastSeenDate = targetUser.lastSeen ? new Date(targetUser.lastSeen) : null;
  const isOnline = lastSeenDate ? Math.abs(new Date().getTime() - lastSeenDate.getTime()) < 3 * 60 * 1000 : false;
  const isSavedMessages = targetUser.id === currentUserId;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-background rounded-3xl overflow-hidden shadow-sm border border-border/40 relative">
      
      {/* Subtle Dot Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 border-b border-border/30 bg-surface/50 backdrop-blur-2xl flex items-center justify-between z-30 shadow-sm">
        
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/">
            <IconButton variant="ghost" className="rounded-full hover:bg-background/50 transition-colors">
              <ArrowLeft size={20} className="text-secondary" />
            </IconButton>
          </Link>
          
          <Link href={`/@${targetUser.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
            {isSavedMessages ? (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Bookmark size={20} />
              </div>
            ) : (
              <Avatar 
                size="md" 
                src={targetUser.image}
                fallback={targetUser.email?.[0]?.toUpperCase()} 
                isOnline={isOnline}
              />
            )}
            <div className="flex flex-col min-w-0 pr-4">
              {isSavedMessages ? (
                <span className="text-[15px] font-semibold text-primary">Избранное</span>
              ) : (
                <UserName 
                  user={targetUser} 
                  showHandle={false}
                  nameClassName="text-[15px] font-semibold"
                  iconClassName="w-4 h-4"
                  hoverUnderline={false}
                />
              )}
              {isSavedMessages ? (
                <span className="text-xs text-secondary truncate">Ваши сохраненные сообщения</span>
              ) : isOnline ? (
                <span className="text-xs text-blue-500 font-medium tracking-wide">В сети</span>
              ) : (
                <span className="text-xs text-secondary truncate">
                  {lastSeenDate ? `Был(а) ${lastSeenDate.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}` : "Недавно"}
                </span>
              )}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {chat && targetUser?.id !== currentUserId && <CallButton roomName={`chat-${chat.id}`} />}
          {chat && <ChatSearch chatId={chat.id} />}
          {chat && <ChatSettings chatId={chat.id} targetUsername={targetUsername} />}
        </div>

      </div>

      <div className="absolute top-[72px] left-0 right-0 z-20">
        {chat && <div id={`call-anchor-chat-${chat.id}`} className="w-full flex-shrink-0 relative z-20" />}
        {chat && <ActiveCallBanner chatId={chat.id} />}
      </div>
      
      {/* Messages Area (Real-time Stream) */}
      <ChatStream 
        key={msgId || "default"}
        chatId={chat?.id || ""} 
        initialMessages={messages} 
        initialNextCursor={initialNextCursor}
        initialPrevCursor={initialPrevCursor}
        highlightMessageId={msgId}
        currentUserId={currentUserId} 
        targetUsername={targetUsername} 
      />

      {/* Input Area (Client Component) */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <ChatInput targetUsername={targetUsername} currentUserId={currentUserId} />
      </div>

    </div>
  );
}
