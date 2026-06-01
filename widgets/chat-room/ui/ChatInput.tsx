"use client";

import { Send, Paperclip, Smile, Mic, X, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { sendMessage } from "@/features/chat/actions";
import { playMessageSendSound } from "@/shared/lib/audio";
import { IconButton, Spinner, EmojiPicker, useToast } from "@/shared/ui";
import { useSession } from "@/shared/lib/session";
import { useSendTyping } from "@/shared/hooks/useTypingIndicator";
import { useAudioRecorder } from "@/shared/hooks/useAudioRecorder";

interface ChatInputProps {
  targetUsername: string;
  currentUserId: string;
}

type AttachmentItem = {
  file: File;
  url: string;
};

export function ChatInput({ targetUsername, currentUserId }: ChatInputProps) {
  const { data: session } = useSession();
  const sendTyping = useSendTyping(targetUsername);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMessage, setReplyMessage] = useState<any | null>(null);
  const [editMessageData, setEditMessageData] = useState<any | null>(null);
  const { isRecording, recordingTime, audioLevel, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const { error } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const validFiles: File[] = [];
    Array.from(e.target.files).forEach(file => {
      if (file.size > 500 * 1024 * 1024) {
        error(`Файл ${file.name} слишком большой! Максимальный размер: 500 МБ.`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (validFiles.length > 0) {
      const newItems: AttachmentItem[] = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      
      setAttachments(prev => [...prev, ...newItems]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const handleReply = (e: CustomEvent) => {
      setReplyMessage(e.detail);
      setEditMessageData(null);
      inputRef.current?.focus();
    };
    const handleEdit = (e: CustomEvent) => {
      setEditMessageData(e.detail);
      setReplyMessage(null);
      setMessage(e.detail.content || "");
      inputRef.current?.focus();
    };
    window.addEventListener("chat:reply" as any, handleReply);
    window.addEventListener("chat:edit" as any, handleEdit);
    return () => {
      window.removeEventListener("chat:reply" as any, handleReply);
      window.removeEventListener("chat:edit" as any, handleEdit);
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;
    
    setIsSending(true);
    const replyId = replyMessage?.id;
    const currentAttachments = [...attachments];
    const localUrls = currentAttachments.map(a => {
      const isVideo = a.file.type.startsWith('video/');
      const isAudio = a.file.type.startsWith('audio/');
      return a.url + (isAudio ? '#audio' : (isVideo ? '#video' : '#image'));
    });
    
    let encryptedContent = trimmed;
    
    if (editMessageData) {
      if (trimmed === editMessageData.content && attachments.length === 0) {
        setEditMessageData(null);
        setMessage("");
        return;
      }
      
      const msgId = editMessageData.id;
      window.dispatchEvent(new CustomEvent("chat:optimistic_edit", { 
        detail: { id: msgId, content: trimmed } 
      }));
      
      setMessage("");
      setEditMessageData(null);
      
      try {
        const { editMessage } = await import('@/features/chat/actions');
        await editMessage(msgId, trimmed);
      } catch (err) {
        console.error("Failed to edit", err);
      }
      setIsSending(false);
      return;
    }
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg = {
      id: tempId,
      content: trimmed,
      senderId: currentUserId,
      createdAt: new Date(),
      isPending: true,
      attachments: localUrls,
      replyTo: replyMessage
    };
    window.dispatchEvent(new CustomEvent("chat:optimistic_message", { detail: optimisticMsg }));

    // Reset input immediately
    setMessage("");
    setReplyMessage(null);
    setAttachments([]);
    
    try {
      playMessageSendSound();
      
      let finalUrls: string[] = [];
      if (currentAttachments.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);
        
        const formData = new FormData();
        currentAttachments.forEach(item => {
          formData.append("files", item.file);
        });

        finalUrls = await new Promise<string[]>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload", true);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              // Upload phase: 0% → 80% (actual bytes sent)
              const progress = Math.round((event.loaded * 80) / event.total);
              setUploadProgress(progress);
              window.dispatchEvent(new CustomEvent("chat:upload_progress", { detail: { tempId, progress } }));
            }
          };

          // When upload finishes but server is still processing → animate 80% → 95%
          xhr.upload.onload = () => {
            let processingProgress = 80;
            const processingInterval = setInterval(() => {
              processingProgress = Math.min(processingProgress + 1, 95);
              setUploadProgress(processingProgress);
              window.dispatchEvent(new CustomEvent("chat:upload_progress", { detail: { tempId, progress: processingProgress } }));
              if (processingProgress >= 95) clearInterval(processingInterval);
            }, 300);
            
            // Store interval ID on xhr for cleanup
            (xhr as any)._processingInterval = processingInterval;
          };

          const handleCancelRequest = (e: any) => {
            if (e.detail.tempId === tempId) {
              xhr.abort();
              window.dispatchEvent(new CustomEvent("chat:upload_cancelled", { detail: { tempId } }));
            }
          };
          window.addEventListener("chat:cancel_upload", handleCancelRequest);

          const cleanup = () => {
            window.removeEventListener("chat:cancel_upload", handleCancelRequest);
            if ((xhr as any)._processingInterval) clearInterval((xhr as any)._processingInterval);
          };

          xhr.onload = () => {
            cleanup();
            // Server responded → jump to 100%
            setUploadProgress(100);
            window.dispatchEvent(new CustomEvent("chat:upload_progress", { detail: { tempId, progress: 100 } }));
            if (xhr.status === 200) {
              try {
                const parsed = JSON.parse(xhr.responseText);
                const urls: string[] = Array.isArray(parsed) ? parsed : (parsed.urls || [parsed.url]);
                
                // Tag each URL with its media type so voice messages persist correctly
                const taggedUrls = urls.map((url: string, i: number) => {
                  const file = currentAttachments[i]?.file;
                  if (file?.type.startsWith('audio/')) return url + '#audio';
                  if (file?.type.startsWith('video/')) return url + '#video';
                  return url;
                });
                resolve(taggedUrls);
              } catch (e) {
                reject(e);
              }
            } else {
              reject(new Error("Upload failed"));
            }
          };

          xhr.onerror = () => {
            cleanup();
            reject(new Error("Network error"));
          };
          
          xhr.onabort = () => {
            cleanup();
            reject(new Error("Upload aborted"));
          };

          xhr.send(formData);
        });
        
        setIsUploading(false);
        setUploadProgress(0);
      }

      const res = await sendMessage(targetUsername, encryptedContent, replyId, finalUrls);
      if (res?.error) {
        console.error("Failed to send:", res.error);
        // Fallback for failed message
        window.dispatchEvent(new CustomEvent("chat:upload_cancelled", { detail: { tempId } }));
      } else if (res && res.message) {
        window.dispatchEvent(new CustomEvent("chat:message_sent", { detail: { tempId, realMessage: res.message } }));
      }
    } catch (err: any) {
      console.error(err);
      if (err.message !== "Upload aborted") {
        window.dispatchEvent(new CustomEvent("chat:upload_cancelled", { detail: { tempId } }));
      }
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative pt-2">
      {/* Reply or Edit Preview */}
      {(replyMessage || editMessageData) && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-3 flex items-center justify-between shadow-elevated animate-fade-in">
          <div className="flex flex-col min-w-0 pr-4">
            <span className="text-xs font-semibold text-accent mb-0.5">
              {editMessageData ? "Редактирование сообщения" : `В ответ: ${replyMessage?.senderId === currentUserId ? "Вам" : replyMessage?.sender?.name || replyMessage?.sender?.username || targetUsername}`}
            </span>
            <span className="text-sm text-secondary truncate">
              {editMessageData ? editMessageData.content : replyMessage?.content}
            </span>
          </div>
          <IconButton variant="ghost" className="rounded-full w-8 h-8 flex-shrink-0" onClick={() => {
            setReplyMessage(null);
            if (editMessageData) {
              setEditMessageData(null);
              setMessage("");
            }
          }}>
            <X size={16} />
          </IconButton>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2 flex gap-2 overflow-x-auto p-2 bg-surface/80 backdrop-blur-md border border-border/50 rounded-2xl animate-fade-in">
          {attachments.map(item => {
            const isVideo = item.file.type.startsWith('video/');
            return (
              <div key={item.url} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                {isVideo ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="attachment" className="w-full h-full object-cover" />
                )}
                <IconButton 
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter(u => u.url !== item.url))} 
                  className="absolute top-1 right-1 w-6 h-6 p-0 bg-black/60 hover:bg-danger text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X size={12} />
                </IconButton>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-4 pb-4">
        <form 
          onSubmit={handleSubmit}
          className={`flex items-center gap-2 bg-surface/80 backdrop-blur-xl border rounded-[24px] p-1.5 pl-3 shadow-sm transition-colors relative ${
            message.length >= 2000 
              ? 'border-danger/80 ring-1 ring-danger/50 animate-shake' 
              : 'border-border/50 hover:border-border focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10'
          }`}
        >
          <input 
            type="file" 
            multiple 
            accept="image/*,video/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <IconButton 
            type="button" 
            variant="ghost" 
            className={`rounded-full flex-shrink-0 transition-colors ${isUploading ? 'text-accent' : 'text-secondary hover:text-primary'}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="relative flex items-center justify-center w-5 h-5">
                <Spinner size={20} className="absolute" />
                {uploadProgress > 0 && <span className="text-[8px] absolute font-bold">{uploadProgress}%</span>}
              </div>
            ) : <Paperclip size={20} strokeWidth={1.5} />}
          </IconButton>

          {isRecording ? (
            <div className="flex-1 flex items-center gap-3 px-2 h-10 animate-fade-in">
              <div className="w-2.5 h-2.5 bg-danger rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-sm font-mono text-danger font-medium tracking-wider min-w-[40px]">
                {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </span>
              {/* Live waveform bars */}
              <div className="flex-1 flex items-center justify-center gap-[2px] h-7 overflow-hidden">
                {Array.from({ length: 28 }).map((_, i) => {
                  // Create a wave effect using audioLevel + position-based offset
                  const wave = Math.sin((Date.now() / 150) + i * 0.5) * 0.3;
                  const base = 0.15;
                  const level = Math.min(1, base + audioLevel * (0.6 + wave));
                  const height = Math.max(3, level * 28);
                  return (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-danger/70 transition-[height] duration-75"
                      style={{ height: `${height}px` }}
                    />
                  );
                })}
              </div>
              <button type="button" onClick={cancelRecording} className="text-secondary text-xs hover:text-danger transition-colors font-semibold tracking-wider px-2">
                Отмена
              </button>
            </div>
          ) : (
            <div className="flex-1 relative flex items-center">
              <textarea
                ref={inputRef as any}
                value={message}
                maxLength={2000}
                onChange={(e) => {
                  setMessage(e.target.value);
                  sendTyping();
                  
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  const newFiles: File[] = [];
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                      const file = items[i].getAsFile();
                      if (file) newFiles.push(file);
                    }
                  }
                  if (newFiles.length > 0) {
                    e.preventDefault();
                    const newItems = newFiles.map(file => ({
                      file,
                      url: URL.createObjectURL(file)
                    }));
                    setAttachments(prev => [...prev, ...newItems]);
                  }
                }}
                placeholder="Написать сообщение..."
                rows={1}
                className="w-full bg-transparent border-none outline-none px-2 py-2 text-[15px] placeholder:text-secondary/70 min-h-[40px] max-h-[150px] resize-none overflow-y-auto text-primary leading-relaxed"
                style={{ minHeight: '40px' }}
              />
              {message.length > 1800 && (
                <div className="absolute right-2 bottom-full mb-2 bg-background/90 backdrop-blur-md border border-border/50 shadow-md rounded-xl px-2.5 py-1 text-xs font-mono font-bold animate-fade-in transition-colors flex items-center gap-1 z-10">
                  <span className={message.length >= 2000 ? "text-danger animate-pulse" : "text-primary"}>
                    {message.length}
                  </span>
                  <span className="text-secondary/60">/ 2000</span>
                </div>
              )}
            </div>
          )}

          {isRecording ? (
            <IconButton 
              type="button"
              onClick={async () => {
                const file = await stopRecording();
                if (file) {
                  // Put file into attachments and trigger submit directly
                  setAttachments(prev => [...prev, { file, url: URL.createObjectURL(file) }]);
                  // We need to wait for state to update, or better just use a direct submit logic.
                  // For simplicity, we just trigger submit on the form
                  setTimeout(() => {
                    const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                    inputRef.current?.form?.dispatchEvent(submitEvent);
                  }, 50);
                }
              }}
              className="w-10 h-10 rounded-full bg-danger hover:bg-danger/90 text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md shadow-danger/20 animate-scale-in"
            >
              <Send size={18} className="ml-0.5" />
            </IconButton>
          ) : message.trim() || attachments.length > 0 ? (
            <IconButton 
              type="submit" 
              disabled={message.length >= 2000}
              className={`w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-inverse flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 flex-shrink-0 shadow-md shadow-primary/20`}
            >
              <Send size={18} className="" />
            </IconButton>
          ) : (
            <div className="relative flex items-center">
              <IconButton 
                type="button" 
                variant="ghost" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-full text-secondary hover:text-primary transition-colors flex-shrink-0"
              >
                <Smile size={20} strokeWidth={1.5} />
              </IconButton>
              <IconButton 
                type="button" 
                variant="ghost" 
                onClick={startRecording}
                className="rounded-full text-secondary hover:text-primary transition-colors flex-shrink-0"
              >
                <Mic size={20} strokeWidth={1.5} />
              </IconButton>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-4 z-50">
                  <EmojiPicker 
                    onSelect={(emoji) => {
                      setMessage(prev => prev + emoji);
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
    </div>
  );
}
