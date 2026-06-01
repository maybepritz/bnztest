"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Paperclip, Smile, Palette, BarChart2 } from "lucide-react";
import { Button, IconButton, Avatar, CircularProgress, useToast } from "@/shared/ui";
import { createPostAction } from "../actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface CreatePostProps {
  user: {
    email?: string | null;
    image?: string;
  };
  postToEdit?: {
    id: string;
    content: string;
  };
  onCancelEdit?: () => void;
  onSaveEdit?: (newContent: string) => Promise<void>;
  onSubmit?: (content: string) => Promise<void>;
  placeholder?: string;
  submitButtonText?: string;
  hideAvatar?: boolean;
}

export function CreatePost({ 
  postToEdit, 
  onCancelEdit, 
  onSaveEdit, 
  onSubmit,
  placeholder = "Что нового?",
  submitButtonText = "Опубликовать",
}: CreatePostProps) {
  const [content, setContent] = useState(postToEdit?.content || "");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { error } = useToast();

  useEffect(() => {
    if (textareaRef.current && activeTab === "write") {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content, activeTab]);

  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{fileName: string, percent: number, isVideo: boolean, isMedia: boolean, previewUrl: string | null} | null>(null);

  const insertTextAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(prev => prev + text);
    }
  };

  const uploadFileWithProgress = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => prev ? { ...prev, percent } : null);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.urls && data.urls.length > 0) {
              resolve(data.urls[0]);
            } else {
              reject(new Error("No URL returned"));
            }
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error("Upload failed"));
      
      const formData = new FormData();
      formData.append("files", file);
      xhr.send(formData);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      error("Файл слишком большой! Максимальный размер: 500 МБ.");
      e.target.value = '';
      return;
    }

    e.target.value = '';

    const textarea = textareaRef.current;
    const insertPos = textarea ? textarea.selectionStart : content.length;

    setIsUploading(true);
    const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/');
    const isFile = !isMedia;
    const previewUrl = isMedia ? URL.createObjectURL(file) : null;
    
    setUploadProgress({ 
      fileName: file.name, 
      percent: 0, 
      isVideo: file.type.startsWith('video/'),
      isMedia,
      previewUrl
    });

    try {
      const fileUrl = await uploadFileWithProgress(file);
      const newMarkup = isMedia ? `\n![${file.name}](${fileUrl})\n` : `\n[${file.name}](${fileUrl})\n`;
      
      if (isFile) {
        setContent(prev => prev + (prev.endsWith('\n') ? '' : '\n') + newMarkup);
      } else {
        setContent(prev => prev.substring(0, insertPos) + newMarkup + prev.substring(insertPos));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() || isPending || isUploading) return;
    
    startTransition(async () => {
      try {
        if (postToEdit && onSaveEdit) {
          await onSaveEdit(content);
          if (onCancelEdit) onCancelEdit();
        } else if (onSubmit) {
          await onSubmit(content);
          setContent(""); 
          setActiveTab("write");
        } else {
          const res = await createPostAction(content, "");
          if (res?.error) {
            error(res.error);
            return;
          }
          setContent(""); 
          setActiveTab("write");
        }
      } catch (e) {
        console.error("Failed to publish post", e);
        error("Не удалось опубликовать пост");
      }
    });
  };

  return (
    <div className={`flex gap-4`}>
        <div className="bg-surface rounded-2xl flex-1 min-w-0 flex flex-col shadow-sm border border-border/50 relative">

          {/* GitHub style Tabs */}
          <div className="bg-surface-hover/30 border-b border-border flex px-3 pt-3 gap-2 rounded-t-2xl relative z-10">
            <button 
              onClick={() => setActiveTab("write")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors relative ${
                activeTab === "write" 
                  ? "bg-surface border-border text-primary" 
                  : "border-transparent text-secondary hover:text-primary hover:bg-surface-hover/50 cursor-pointer"
              }`}
              style={activeTab === "write" ? { marginBottom: "-1px", paddingBottom: "9px" } : {}}
            >
              Писать
            </button>
            <button 
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors relative ${
                activeTab === "preview" 
                  ? "bg-surface border-border text-primary" 
                  : "border-transparent text-secondary hover:text-primary hover:bg-surface-hover/50 cursor-pointer"
              }`}
              style={activeTab === "preview" ? { marginBottom: "-1px", paddingBottom: "9px" } : {}}
            >
              Предпросмотр
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 min-h-[120px] bg-surface relative z-10 rounded-b-2xl flex flex-col">
            {activeTab === "write" ? (
              <textarea 
                ref={textareaRef}
                placeholder={placeholder} 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePublish();
                  }
                }}
                disabled={isPending || isUploading}
                className="bg-transparent border-none outline-none text-primary placeholder:text-secondary w-full text-[15px] leading-relaxed disabled:opacity-50 resize-none overflow-y-auto min-h-[80px] max-h-96"
              />
            ) : (
              <div className="text-primary text-[15px] font-normal leading-relaxed w-full overflow-hidden prose prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-img:max-w-full prose-img:rounded-xl prose-headings:text-lg prose-headings:font-bold prose-p:font-normal prose-p:my-1 prose-headings:my-2 prose-a:text-accent-like hover:prose-a:underline min-h-[80px]">
                {content.trim() ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      img: ({ node, ...props }) => {
                        if (typeof props.src === "string" && props.src.match(/\.(mp4|webm|ogg)$/i)) {
                          return <video src={props.src} controls className="max-w-full rounded-xl" />;
                        }
                        return <img {...props} />;
                      },
                      a: ({ node, ...props }) => {
                        const href = props.href || "";
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
                        return <a {...props} />;
                      }
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <span className="text-secondary italic">Ничего нет для предпросмотра</span>
                )}
              </div>
            )}
            
            {uploadProgress && (
              <div className="mt-4 animate-in fade-in zoom-in duration-300">
                {uploadProgress.isMedia && uploadProgress.previewUrl ? (
                  <div className="relative inline-block w-fit">
                    <img 
                      src={uploadProgress.previewUrl} 
                      alt="Uploading..." 
                      className="rounded-xl max-h-48 object-cover border border-border/50 opacity-60 blur-[2px]" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/40 rounded-full flex items-center justify-center p-1.5 shadow-xl backdrop-blur-sm">
                        <CircularProgress value={uploadProgress.percent} size={40} className="text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>
                ) : !uploadProgress.isMedia ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border/50 w-fit min-w-[200px] shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 relative">
                      <CircularProgress value={uploadProgress.percent} size={36} className="absolute text-primary" />
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-primary truncate max-w-[200px]">{uploadProgress.fileName}</span>
                      <span className="text-xs text-secondary font-medium">ЗАГРУЗКА... {uploadProgress.percent}%</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Footer */}
            <div className="flex-1" />
            <div className="pt-3 flex justify-between items-end">
              <div className="flex items-center gap-2 text-secondary">
                <label className="cursor-pointer flex items-center gap-1.5 p-2 rounded-md hover:bg-surface-hover/50 hover:text-primary transition-colors text-sm">
                  <input type="file" accept="*" className="hidden" onChange={handleFileSelect} disabled={isPending || isUploading} />
                  <Paperclip size={16} />
                  <span className="hidden sm:inline-block">Файлы</span>
                </label>
                <span className="text-border mx-1 hidden sm:inline-block">|</span>
                <span className="text-xs text-secondary/60 hidden sm:inline-block">
                  Поддерживается Markdown
                </span>
              </div>
              
              <div className="flex gap-2">
                {postToEdit && onCancelEdit && (
                  <Button 
                    size="sm"
                    variant="ghost"
                    disabled={isPending || isUploading} 
                    onClick={onCancelEdit}
                  >
                    Отмена
                  </Button>
                )}
                <Button 
                  size="sm"
                  variant="primary"
                  disabled={!content.trim() || isPending || isUploading} 
                  onClick={handlePublish}
                  isLoading={isPending || isUploading}
                  className="px-5 font-semibold"
                >
                  {postToEdit ? "Сохранить" : submitButtonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
