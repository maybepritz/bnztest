"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, Button, LinkPreview, HoverLinkPreview } from "@/shared/ui";
import { Heart, MessageCircle, Repeat2, MoreHorizontal, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserName } from "@/entities/user";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { UserMention } from "@/entities/user";

export interface PostCardProps {
  post: {
    id: string;
    content: string;
    image?: string | null;
    createdAt: Date;
    views: number;
    author: {
      id: string;
      name?: string | null;
      image?: string;
      username?: string | null;
      email?: string | null;
      isVerified?: boolean;
    };
    _count: {
      likes: number;
      comments: number;
    };
    likes?: { id: string }[];
    repostOf?: any;
    isEdited?: boolean;
    updatedAt?: Date;
    hasReposted?: boolean;
  };
  isClickable?: boolean;
  avatarBadgeSlot?: React.ReactNode;
  likeButtonSlot?: React.ReactNode;
  repostButtonSlot?: React.ReactNode;
  renderDropdown?: (onEdit: () => void) => React.ReactNode;
  renderEditForm?: (onCancel: () => void) => React.ReactNode;
  currentUserId?: string;
}

export function PostCard({ 
  post, 
  isClickable = true, 
  likeButtonSlot, 
  repostButtonSlot,
  renderDropdown,
  renderEditForm,
  currentUserId 
}: PostCardProps) {
  const router = useRouter();
  
  const isRepost = !!post.repostOf;
  const displayPost = isRepost ? post.repostOf : post;

  const [isEditing, setIsEditing] = useState(false);
  const [viewsCount, setViewsCount] = useState<number>(displayPost.views || 0);
  const [hasViewed, setHasViewed] = useState(false);
  const postRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!postRef.current || hasViewed) return;
    
    // Do not count your own views
    if (currentUserId && post.author.id === currentUserId) {
      setHasViewed(true);
      return;
    }

    // Check if already viewed in this session to prevent inflation on refresh
    try {
      const viewed = sessionStorage.getItem("viewedPosts") || "";
      if (viewed.includes(post.id)) {
        setHasViewed(true);
        return;
      }
    } catch (e) {}

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setHasViewed(true);
        setViewsCount(prev => prev + 1);
        
        try {
          const viewed = sessionStorage.getItem("viewedPosts") || "";
          sessionStorage.setItem("viewedPosts", viewed + displayPost.id + ",");
        } catch (e) {}

        import("@/features/manage-post/actions").then(({ viewPostAction }) => {
          viewPostAction(displayPost.id).catch(console.error);
        });
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    observer.observe(postRef.current);
    return () => observer.disconnect();
  }, [hasViewed, post.id, currentUserId, post.author.id, displayPost.id]);

  const handlePostClick = () => {
    if (!isClickable || isEditing) return;
    const username = post.author.username || post.author.id.slice(0, 8);
    router.push(`/@${username}/post/${post.id}`);
  };

  return (
    <article 
      ref={postRef}
      onClick={handlePostClick}
      className={`bg-surface rounded-3xl p-5 md:p-6 shadow-sm border border-border/40 transition-colors ${
        isClickable && !isEditing ? "cursor-pointer hover:bg-surface-hover/30" : ""
      }`}
    >
      {isRepost && (
        <div className="flex items-center gap-2 mb-3 text-secondary text-[13px] font-medium sm:ml-14">
          <Repeat2 size={14} />
          <UserName user={post.author} showHandle={false} nameClassName="font-semibold hover:underline" />
          <span className="opacity-80">репостнул(а)</span>
        </div>
      )}
      <div className="flex gap-4">
        <div className="relative flex shrink-0 h-fit">
          <Avatar 
            size="md" 
            src={displayPost.author?.image}
            fallback={displayPost.author?.name?.[0]?.toUpperCase() || "?"} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <UserName 
                user={displayPost.author} 
                showHandle={true}
                href={`/@${displayPost.author.username}`}
                onClick={(e) => e.stopPropagation()}
                nameClassName="text-sm"
                iconClassName="w-4 h-4"
                handleClassName="text-secondary text-sm truncate"
              />
              <span className="text-secondary text-sm">·</span>
              <span className="text-secondary text-sm hover:underline cursor-pointer">
                {new Intl.DateTimeFormat('ru-RU', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(new Date(displayPost.createdAt))}
                {displayPost.isEdited && (
                  <span className="text-secondary/70 ml-1">
                    (изменено {displayPost.updatedAt ? new Intl.DateTimeFormat('ru-RU', { hour: 'numeric', minute: 'numeric' }).format(new Date(displayPost.updatedAt)) : ""})
                  </span>
                )}
              </span>
            </div>
            
            {!isEditing && renderDropdown ? (
              renderDropdown(() => setIsEditing(true))
            ) : null}
          </div>
          
          {isEditing && renderEditForm ? (
            <div className="mb-4 mt-2" onClick={e => e.stopPropagation()}>
              {renderEditForm(() => setIsEditing(false))}
            </div>
          ) : (
            <>
              <div className="text-primary text-base font-normal leading-relaxed mb-4 w-full prose prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-img:max-w-full prose-img:rounded-xl prose-headings:text-xl prose-headings:font-bold prose-p:font-normal prose-p:my-1 prose-headings:my-2 prose-a:text-link hover:prose-a:underline">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    p: ({ node, ...props }) => <div className="mb-4 last:mb-0" {...props} />,
                    img: ({ node, ...props }) => {
                      if (typeof props.src === "string" && props.src.match(/\.(mp4|webm|ogg)$/i)) {
                        return <video src={props.src} controls className="max-w-full rounded-xl" />;
                      }
                      return <img {...props} />;
                    },
                    a: ({ node, ...props }) => {
                      const href = props.href || "";
                      if (href.startsWith("/")) {
                        return <UserMention username={href.slice(1)}>{props.children}</UserMention>;
                      }
                      const match = href.match(/\.(pdf|zip|rar|doc|docx|xls|xlsx|ppt|pptx|txt|csv|tar|gz)$/i);
                      if (match) {
                        const ext = match[1].toUpperCase();
                        return (
                          <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border/50 hover:bg-surface-hover/50 transition-colors no-underline not-prose mt-2 w-fit min-w-[200px] max-w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </span>
                            <span className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-primary truncate max-w-[200px]">{props.children}</span>
                              <span className="text-xs text-secondary font-medium">{ext} ФАЙЛ</span>
                            </span>
                          </a>
                        );
                      }
                      return (
                        <HoverLinkPreview url={href}>{props.children}</HoverLinkPreview>
                      );
                    }
                  }}
                >
                  {displayPost.content.replace(/(^|\s)@([\w_]+)/g, '$1[@$2](/$2)')}
                </ReactMarkdown>
              </div>
            </>
          )}

          {/* Post Image Placeholder */}
          {displayPost.image && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-border/50 max-h-96">
              <img src={displayPost.image} alt="Вложение" className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* Footer Actions */}
          <div className="flex items-center justify-between text-secondary">
            <div className="flex items-center gap-6">
              {likeButtonSlot}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick();
                }} 
                className="flex items-center gap-1.5 group transition-colors hover:text-accent-secondary"
              >
                <MessageCircle size={18} className="group-hover:fill-accent-secondary/20 transition-all" />
                <span className="text-sm font-medium">{displayPost._count?.comments || 0}</span>
              </button>
              
              {repostButtonSlot}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-secondary/70">
                <Eye size={18} />
                <span className="text-sm font-medium">{viewsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
