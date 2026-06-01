import { CommentCard } from "@/widgets/comment-card/ui/CommentCard";
import { LikeCommentButton } from "@/features/manage-comment/ui/LikeCommentButton";
import { CommentDropdown } from "@/features/manage-comment/ui/CommentDropdown";

export async function CommentsList({ postId }: { postId: string }) {
  const response = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}/comments`, {
    cache: "no-store",
  });
  
  const comments = response.ok ? await response.json() : [];

  if (comments.length === 0) {
    return (
      <div className="py-12 flex justify-center text-secondary text-sm font-medium">
        Пока нет ответов
      </div>
    );
  }

  const { getServerUser } = await import("@/shared/lib/auth");
  const session = await getServerUser();
  const currentUserId = session?.user?.id;

  return (
    <div className="flex flex-col relative pt-4 gap-2">
      <h3 className="px-4 text-sm font-semibold text-primary mb-2">Ответы ({comments.length})</h3>
      {comments.map((comment: any, index: number) => (
        <div key={comment.id} className="relative">
          {/* Timeline connecting line */}
          {index !== comments.length - 1 && (
            <div className="absolute left-[24px] top-12 bottom-[-16px] w-[2px] bg-border/40 z-0" />
          )}
          <div className="relative z-10">
            <CommentCard 
              comment={comment} 
              currentUserId={currentUserId} 
              likeButtonSlot={
                <LikeCommentButton 
                  commentId={comment.id} 
                  initialCount={comment._count.likes} 
                  initialLiked={false}
                />
              }
              renderDropdown={(onEdit) => (
                <CommentDropdown 
                  commentId={comment.id} 
                  postId={postId} 
                  onEditClick={onEdit} 
                />
              )}
              onSaveEdit={async (newContent) => {
                "use server";
                const { editCommentAction } = await import("@/features/manage-comment/actions");
                await editCommentAction(comment.id, postId, newContent);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
