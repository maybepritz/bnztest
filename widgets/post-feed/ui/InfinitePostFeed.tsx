"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PostCard } from "@/widgets/post-card/ui/PostCard";
import { AvatarFollowButton } from "@/features/follow-user";
import { LikePostButton } from "@/features/like-post";
import { PostDropdown, RepostPostButton, editPostAction } from "@/features/manage-post";
import { CreatePost } from "@/features/create-post/ui/CreatePost";
import { getPostsAction } from "../actions";
import { Spinner } from "@/shared/ui";

type PostPayload = Awaited<ReturnType<typeof getPostsAction>>["posts"][0];

interface InfinitePostFeedProps {
  initialPosts: PostPayload[];
  initialNextCursor?: string;
  initialFollowingIds: string[];
  currentUserId?: string;
  targetUserId?: string;
  likedByUserId?: string;
}

export function InfinitePostFeed({ 
  initialPosts, 
  initialNextCursor, 
  initialFollowingIds,
  currentUserId,
  targetUserId,
  likedByUserId
}: InfinitePostFeedProps) {
  const [fetchedPosts, setFetchedPosts] = useState<PostPayload[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialNextCursor);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set(initialFollowingIds));
  const [isFetching, setIsFetching] = useState(false);

  // Когда сервер присылает новые посты (например, после создания нового поста и revalidatePath),
  // мы сбрасываем локально загруженные посты, чтобы лента обновилась
  useEffect(() => {
    setFetchedPosts([]);
    setNextCursor(initialNextCursor);
  }, [initialPosts, initialNextCursor]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && nextCursor && !isFetching) {
      loadMore();
    }
  }, [inView, nextCursor, isFetching]);

  const loadMore = async () => {
    if (isFetching || !nextCursor) return;
    try {
      setIsFetching(true);
      const res = await getPostsAction(nextCursor, 10, targetUserId, likedByUserId);
      setFetchedPosts(prev => [...prev, ...res.posts]);
      setNextCursor(res.nextCursor);
    } catch (e) {
      console.error("Failed to load more posts:", e);
    } finally {
      setIsFetching(false);
    }
  };

  const allPosts = [...initialPosts, ...fetchedPosts];

  if (allPosts.length === 0) {
    return (
      <div className="bg-surface rounded-3xl py-24 flex justify-center text-secondary text-sm font-medium border border-border/40">
        Нет постов
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allPosts.map(post => {
        const displayPost = post.repostOf ? post.repostOf : post;
        const isOwnPost = currentUserId === displayPost.author.id;
        const isFollowing = followingIds.has(displayPost.author.id);
        
        return (
          <PostCard 
            key={post.id} 
            post={post} 
            avatarBadgeSlot={
              !isOwnPost ? (
                <AvatarFollowButton 
                  targetUserId={displayPost.author.id} 
                  initialIsFollowing={isFollowing} 
                />
              ) : undefined
            }
            likeButtonSlot={
              <LikePostButton 
                postId={displayPost.id} 
                initialLiked={displayPost.likes && displayPost.likes.length > 0} 
                initialCount={displayPost._count?.likes || 0} 
              />
            }
            repostButtonSlot={
              currentUserId !== displayPost.author.id ? (
                <RepostPostButton 
                  postId={displayPost.id}
                  initialReposted={post.hasReposted || false}
                />
              ) : undefined
            }
            renderDropdown={(onEdit) => (
              <PostDropdown 
                postId={post.id} 
                onEditClick={post.repostOf ? undefined : onEdit} 
                isOwn={currentUserId === post.author.id}
              />
            )}
            renderEditForm={(onCancel) => (
              <CreatePost 
                user={post.author}
                postToEdit={displayPost}
                hideAvatar={true}
                onCancelEdit={onCancel}
                onSaveEdit={async (newContent) => {
                  await editPostAction(post.id, newContent);
                  onCancel();
                }}
              />
            )}
            currentUserId={currentUserId}
          />
        );
      })}

      {nextCursor && (
        <div ref={ref} className="py-4 flex justify-center">
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
}
