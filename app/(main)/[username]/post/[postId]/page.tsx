import { PostDetails } from "@/widgets/post-details";
import { CommentsList } from "@/widgets/comments-list";
import { CreateComment } from "@/features/create-comment";
import { getServerUser } from "@/shared/lib/auth";


export default async function PostPage(props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;
  const session = await getServerUser();

  return (
    <div className="flex flex-col gap-4 pb-12 min-w-0">
      <PostDetails postId={params.postId} />
      {session?.user && (
        <div className="flex flex-col gap-4">
          <CreateComment postId={params.postId} user={session.user} />
          <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-border/40">
            <CommentsList postId={params.postId} />
          </div>
        </div>
      )}
    </div>
  );
}
