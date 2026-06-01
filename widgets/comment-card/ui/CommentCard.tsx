"use client";

import { useState } from "react";
import { Avatar, Button, IconButton, HoverLinkPreview } from "@/shared/ui";
import { MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { UserMention } from "@/entities/user";

export interface CommentCardProps {
  currentUserId?: string;
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name?: string | null;
      username?: string | null;
      email?: string | null;
    };
    _count: {
      likes: number;
    };
  };
  likeButtonSlot?: React.ReactNode;
  renderDropdown?: (onEdit: () => void) => React.ReactNode;
  onSaveEdit?: (content: string) => Promise<void>;
}

export function CommentCard({ 
  comment, 
  currentUserId,
  likeButtonSlot,
  renderDropdown,
  onSaveEdit
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      setIsSaving(true);
      if (onSaveEdit) {
        await onSaveEdit(editContent);
      }
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="flex gap-3 px-2 py-3 transition-colors hover:bg-surface/50 rounded-2xl group">
      <div className="shrink-0 pt-1">
        <Avatar 
          size="sm" 
          fallback={comment.author.name?.[0]?.toUpperCase() || comment.author.email?.[0]?.toUpperCase() || "?"} 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-primary hover:underline text-sm cursor-pointer">
              {comment.author.name || comment.author.username || "Пользователь"}
            </span>
            <span className="text-secondary text-xs truncate">
              @{comment.author.username || comment.author.id.slice(0, 8)}
            </span>
            <span className="text-secondary text-xs">·</span>
            <span className="text-secondary text-xs hover:underline cursor-pointer">
              {new Intl.DateTimeFormat('ru-RU', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(new Date(comment.createdAt))}
            </span>
          </div>
          
          {currentUserId === comment.author.id && !isEditing && renderDropdown ? (
            renderDropdown(() => setIsEditing(true))
          ) : (
            !isEditing && (
              <IconButton variant="ghost" className="opacity-0 group-hover:opacity-100 -mt-1 -mr-1 w-6 h-6 p-0 text-secondary hover:text-primary">
                <MoreHorizontal size={16} />
              </IconButton>
            )
          )}
        </div>
        
        {isEditing ? (
          <div className="flex flex-col gap-2 mt-2" onClick={e => e.stopPropagation()}>
            <textarea
              className="bg-transparent border border-border rounded-xl outline-none text-primary placeholder:text-secondary w-full text-sm p-3 min-h-[80px] resize-none focus:ring-1 focus:ring-primary/50"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              autoFocus
              placeholder="Ваш комментарий..."
              disabled={isSaving}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving || !editContent.trim()}
                isLoading={isSaving}
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-primary text-sm font-normal leading-relaxed mt-0.5 w-full prose prose-sm prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-img:max-w-full prose-img:rounded-xl prose-headings:text-lg prose-headings:font-bold prose-p:font-normal prose-p:my-1 prose-headings:my-2 prose-a:text-link hover:prose-a:underline">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                p: ({ node, ...props }) => <div className="mb-2 last:mb-0" {...props} />,
                img: ({ node, ...props }) => {
                  if (typeof props.src === "string" && props.src.match(/\.(mp4|webm|ogg)$/i)) {
                    return <video src={props.src} controls className="max-w-full rounded-xl mt-2 mb-2" />;
                  }
                  return <img {...props} />;
                },
                a: ({ node, ...props }) => {
                  const href = props.href || "";
                  if (href.endsWith("#audio")) {
                    return (
                      <div className="mt-2 mb-2">
                         <audio controls src={href.replace("#audio", "")} className="w-full max-w-sm h-12" />
                      </div>
                    );
                  }
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
                  return <HoverLinkPreview url={href}>{props.children}</HoverLinkPreview>;
                }
              }}
            >
              {comment.content.replace(/(^|\s)@([\w_]+)/g, '$1[@$2](/$2)')}
            </ReactMarkdown>
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-2 text-secondary">
          {likeButtonSlot}
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('comment:reply', { detail: { username: comment.author.username || comment.author.id.slice(0, 8) } }))}
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <span className="text-xs font-medium">Ответить</span>
          </button>
        </div>
      </div>
    </article>
  );
}
