import { getServerUser } from "@/shared/lib/auth";

import { getPostsAction } from "../actions";
import { InfinitePostFeed } from "./InfinitePostFeed";

interface PostFeedProps {
  targetUserId?: string;
  likedByUserId?: string;
}

export async function PostFeed({ targetUserId, likedByUserId }: PostFeedProps = {}) {
  const session = await getServerUser();
  const currentUserId = session?.user?.id;
  
  const initialData = await getPostsAction(undefined, 10, targetUserId, likedByUserId);

  return (
    <InfinitePostFeed 
      initialPosts={initialData.posts} 
      initialNextCursor={initialData.nextCursor}
      initialFollowingIds={initialData.followingIds}
      currentUserId={currentUserId}
      targetUserId={targetUserId}
      likedByUserId={likedByUserId}
    />
  );
}
