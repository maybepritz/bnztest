"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Mic, X } from "lucide-react";
import { IconButton, Spinner, EmojiPicker, useToast } from "@/shared/ui";
import { addCommentAction } from "../actions";
import { useAudioRecorder } from "@/shared/hooks/useAudioRecorder";

export interface CreateCommentProps {
  postId: string;
  user: {
    email?: string | null;
    image?: string;
  };
}

export function CreateComment({ postId, user }: CreateCommentProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<{file: File, url: string}[]>([]);
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error } = useToast();

  useEffect(() => {
    const handleReply = (e: CustomEvent) => {
      const username = e.detail?.username;
      if (username) {
        setContent(prev => {
          const mention = `@${username} `;
          if (prev.includes(mention)) return prev;
          return prev ? `${prev} ${mention}` : mention;
        });
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    
    window.addEventListener("comment:reply" as any, handleReply);
    return () => window.removeEventListener("comment:reply" as any, handleReply);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 100 * 1024 * 1024) {
        error(`Файл ${file.name} слишком большой! Макс. размер: 100 МБ.`);
        return;
      }
      setAttachments(prev => [...prev, { file, url: URL.createObjectURL(file) }]);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (attachments.length === 0) return [];
    setIsUploading(true);
    
    const formData = new FormData();
    attachments.forEach(item => formData.append("files", item.file));
    
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      return data.urls || [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;
    if (isSending || isUploading) return;
    
    setIsSending(true);
    try {
      const uploadedUrls = await uploadFiles();
      let finalContent = content.trim();
      
      // Append attachments as markdown so CommentCard renders them
      uploadedUrls.forEach((url, i) => {
        const file = attachments[i].file;
        const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/');
        if (file.type.startsWith('audio/')) {
          finalContent += `\n[audio_message](${url}#audio)`;
        } else if (isMedia) {
          finalContent += `\n![${file.name}](${url})`;
        } else {
          finalContent += `\n[${file.name}](${url})`;
        }
      });

      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", finalContent);
      await addCommentAction(formData);
      
      setContent("");
      setAttachments([]);
      if (inputRef.current) inputRef.current.style.height = 'auto';
    } catch (err) {
      console.error(err);
      error("Не удалось отправить комментарий");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pt-4 border-t border-border/30 relative">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-2 mb-2 bg-surface/50 rounded-2xl animate-fade-in">
          {attachments.map(item => {
            const isMedia = item.file.type.startsWith('image/') || item.file.type.startsWith('video/');
            const isAudio = item.file.type.startsWith('audio/');
            return (
              <div key={item.url} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-background/50 flex items-center justify-center">
                {isAudio ? (
                  <Mic size={24} className="text-secondary" />
                ) : isMedia ? (
                  item.file.type.startsWith('video/') ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt="attachment" className="w-full h-full object-cover" />
                  )
                ) : (
                  <Paperclip size={24} className="text-secondary" />
                )}
                <IconButton 
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter(u => u.url !== item.url))} 
                  className="absolute top-1 right-1 w-5 h-5 p-0 bg-black/60 hover:bg-danger text-white rounded-full backdrop-blur-sm"
                >
                  <X size={12} />
                </IconButton>
              </div>
            );
          })}
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-surface/80 backdrop-blur-xl border border-border/50 rounded-[24px] p-1.5 pl-3 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all"
      >
        <input 
          type="file" 
          multiple 
          accept="image/*,video/*,audio/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <IconButton 
          type="button" 
          variant="ghost" 
          className="rounded-full flex-shrink-0 text-secondary hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
        >
          {isUploading ? <Spinner size={20} /> : <Paperclip size={20} />}
        </IconButton>

        {isRecording ? (
          <div className="flex-1 flex items-center gap-2 px-2 h-10 animate-fade-in">
            <div className="w-2.5 h-2.5 bg-danger rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-sm font-mono text-danger font-medium tracking-wider">
              {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
            </span>
            <div className="flex-1" />
            <button type="button" onClick={cancelRecording} className="text-secondary text-xs hover:text-primary font-bold uppercase">
              Отмена
            </button>
          </div>
        ) : (
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Написать комментарий..."
              rows={1}
              className="w-full bg-transparent border-none outline-none px-2 py-2 text-[15px] placeholder:text-secondary/70 min-h-[40px] max-h-[150px] resize-none overflow-y-auto text-primary"
              disabled={isUploading || isSending}
            />
          </div>
        )}

        {isRecording ? (
          <IconButton 
            type="button"
            onClick={async () => {
              const file = await stopRecording();
              if (file) {
                setAttachments(prev => [...prev, { file, url: URL.createObjectURL(file) }]);
              }
            }}
            className="w-10 h-10 rounded-full bg-danger hover:bg-danger/90 text-white flex justify-center items-center flex-shrink-0 shadow-md animate-scale-in"
          >
            <Send size={18} className="ml-0.5" />
          </IconButton>
        ) : content.trim() || attachments.length > 0 ? (
          <IconButton 
            type="submit" 
            disabled={isSending || isUploading}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-inverse flex items-center justify-center transition-all flex-shrink-0"
          >
            {isSending ? <Spinner size={18} /> : <Send size={18} />}
          </IconButton>
        ) : (
          <div className="relative flex items-center">
            <IconButton 
              type="button" 
              variant="ghost" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="rounded-full text-secondary hover:text-primary flex-shrink-0"
            >
              <Smile size={20} />
            </IconButton>
            <IconButton 
              type="button" 
              variant="ghost" 
              onClick={startRecording}
              className="rounded-full text-secondary hover:text-primary flex-shrink-0"
            >
              <Mic size={20} />
            </IconButton>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-4 z-50">
                <EmojiPicker 
                  onSelect={(emoji) => {
                    setContent(prev => prev + emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }} 
                />
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
