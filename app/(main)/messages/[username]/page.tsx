import { getServerUser } from "@/shared/lib/auth";

import { ChatRoom } from "@/widgets/chat-room";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChatPage({ params, searchParams }: PageProps) {
  const session = await getServerUser();
  const { username } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="h-full overflow-hidden">
      <ChatRoom currentUserId={session.user.id} targetUsername={username} searchParams={searchParams} />
    </div>
  );
}
