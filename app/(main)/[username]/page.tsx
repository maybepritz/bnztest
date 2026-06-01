import { getServerUser } from "@/shared/lib/auth";

import { Button, Tabs } from "@/shared/ui";

import { notFound } from "next/navigation";
import { ProfileHeader } from "@/widgets/profile-header";
import { PostFeed } from "@/widgets/post-feed";
import { CreatePost } from "@/features/create-post";

import { ProfileSkeleton } from "./ProfileSkeleton";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getServerUser();
  const rawParam = decodeURIComponent(username);
  const targetUsername = rawParam.startsWith('@') ? rawParam.slice(1) : rawParam;

  const headers: HeadersInit = {};
  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  let res;
  try {
    res = await fetch(`${process.env.BACKEND_URL}/api/users/${targetUsername}`, {
      headers,
      cache: 'no-store'
    });
  } catch (e) {
    return <ProfileSkeleton />;
  }

  if (!res.ok) {
    if (res.status === 401) {
      // If unauthorized, redirect to login or show error
      return (
        <div className="p-8 text-center bg-red-50 text-danger rounded-lg m-8">
          <h2>Сессия истекла</h2>
          <p>Пожалуйста, войдите снова.</p>
        </div>
      );
    }
    notFound();
  }

  const user = await res.json();
  if (user.createdAt) user.createdAt = new Date(user.createdAt);
  if (user.lastSeen) user.lastSeen = new Date(user.lastSeen);

  const isOwnProfile = session?.user?.id === user.id;
  const isFollowing = user.isFollowing || false;

  return (
    <div className="pt-10 transition-colors duration-300 flex flex-col gap-6 min-w-0">
      <ProfileHeader 
        user={user} 
        isOwnProfile={isOwnProfile} 
        isFollowing={isFollowing} 
      />

      {/* Tabs */}
      <div className="px-6 pt-2 pb-20">
        <Tabs 
          defaultValue="posts" 
          tabs={[
            {
              value: "posts",
              label: "Посты",
              content: (
                <div className="flex flex-col gap-6 mt-4">
                  {isOwnProfile && <CreatePost user={user} />}
                  <PostFeed targetUserId={user.id} />
                </div>
              )
            },
            {
              value: "likes",
              label: "Лайки",
              content: (
                <div className="flex flex-col gap-6 mt-4">
                  <PostFeed likedByUserId={user.id} />
                </div>
              )
            }
          ]} 
        />
      </div>
    </div>
  );
}
