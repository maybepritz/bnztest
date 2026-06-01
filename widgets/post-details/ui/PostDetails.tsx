import { notFound } from "next/navigation";
import { PostCard } from "@/widgets/post-card/ui/PostCard";
import { getServerUser } from "@/shared/lib/auth";
import { LikePostButton } from "@/features/like-post";
import { PostDropdown, RepostPostButton, editPostAction } from "@/features/manage-post";
import { CreatePost } from "@/features/create-post/ui/CreatePost";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function PostDetails({ postId }: { postId: string }) {
  const currentUser = await getServerUser();

  const response = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}`, {
    headers: currentUser ? { "Authorization": `Bearer ${currentUser.token}` } : {},
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load post details: ${response.status} ${response.statusText} - ${text}`);
  }
  
  const post = await response.json();

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col pb-12 pt-2 min-w-0">
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href={currentUser?.user?.username ? `/${currentUser.user.username}` : "/"} 
          className="p-2 rounded-full hover:bg-surface-hover text-secondary transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-primary">Пост</h1>
      </div>

      <div className="flex flex-col gap-4">
        {(() => {
          const displayPost = post.repostOf ? post.repostOf : post;
          return (
            <PostCard 
              post={post} 
              isClickable={false} 
              currentUserId={currentUser?.user?.id}
              likeButtonSlot={
                <LikePostButton 
                  postId={displayPost.id} 
                  initialLiked={Array.isArray(displayPost.likes) && displayPost.likes.length > 0} 
                  initialCount={displayPost._count.likes} 
                />
              }
              repostButtonSlot={
                currentUser?.user?.id !== displayPost.author.id ? (
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
                  isOwn={currentUser?.user?.id === post.author.id}
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
            />
          );
        })()}
      </div>
    </div>
  );
}
