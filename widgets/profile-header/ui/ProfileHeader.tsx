import { BadgeCheck, Calendar, Palette, MessageCircle, Verified } from "lucide-react";
import { Button, IconButton, Avatar } from "@/shared/ui";
import { ProfileFollowButton } from "@/features/follow-user";
import { UserName } from "@/entities/user";
import Link from "next/link";
import { EditProfileButton, BannerUploadButton } from "@/features/edit-profile";
import { VerifyProfileButton } from "@/features/verify-profile";
import { FollowStats } from "./FollowStats";

interface ProfileHeaderProps {
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    bio?: string | null;
    email?: string | null;
    image?: string | null;
    banner?: string | null;
    
    isVerified?: boolean;
    createdAt: Date;
    lastSeen?: Date | null;
    _count: {
      followers: number;
      following: number;
    };
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
}

export function ProfileHeader({ user, isOwnProfile, isFollowing }: ProfileHeaderProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString("ru-RU", { month: 'long', year: 'numeric' });
  const isOnline = user.lastSeen ? Math.abs(new Date().getTime() - new Date(user.lastSeen).getTime()) < 3 * 60 * 1000 : false;
  const lastSeenText = user.lastSeen ? `Был(а) в сети: ${new Date(user.lastSeen).toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}` : "Не в сети";

  return (
    <div>
      {/* Banner */}
      <div className="h-64 rounded-3xl relative mx-1 overflow-hidden group bg-surface">
        {user.banner ? (
          <img src={user.banner} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <>
            {/* Красивый дефолтный градиентный баннер */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/80 via-accent-hover/40 to-surface/80" />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] pointer-events-none" />
          </>
        )}

        {isOwnProfile && (
          <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <BannerUploadButton currentBanner={user.banner} />
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="px-6 relative -mt-16 grid gap-4">
        <div className="flex justify-between items-end">
          <div className="relative">
            <Avatar 
              size="xl" 
              src={user.image || undefined}
              fallback={user.email?.[0].toUpperCase()} 
              isOnline={isOnline} 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <div className="flex gap-2 items-center">
                {!user.isVerified && (
                  <VerifyProfileButton />
                )}
                <EditProfileButton user={user} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={`/messages/${user.username}`}>
                  <Button variant="secondary" className="rounded-full border border-border px-2.5 py-2.5">
                    <MessageCircle size={20} />
                  </Button>
                </Link>
                <ProfileFollowButton targetUserId={user.id} initialIsFollowing={isFollowing} />
              </div>
            )}
          </div>
        </div>

        <UserName
          user={user}
          showHandle={true}
          className="mb-1"
          nameClassName="text-2xl"
          iconClassName="w-6 h-6"
          handleClassName="text-base"
          hoverUnderline={false}
        />

        {/* bio */}
        {user.bio && (
          <div className="flex items-center gap-1.5 text-primary">
            <span>{user.bio}</span>
          </div>
        )}

        {/* Stats */}
        <FollowStats 
          followersCount={user._count?.followers || 0} 
          followingCount={user._count?.following || 0} 
          username={user.username || ""} 
        />

        {/* Additional Info */}
        <div className="flex items-center gap-4 text-secondary text-">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span>Регистрация: {joinDate}</span>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1.5 text-secondary/70">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
              <span>{lastSeenText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
