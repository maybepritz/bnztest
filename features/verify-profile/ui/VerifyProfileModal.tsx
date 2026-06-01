"use client";

import { Modal, Button, Checkbox, IconButton, Spinner, Progress, useToast } from "@/shared/ui";
import { useState, useTransition, useRef, useEffect } from "react";
import { Video, Check, X, CheckCircle } from "lucide-react";
import { requestVerificationAction, getVerificationStatusAction, revokeVerificationAction } from "../actions";

interface VerifyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerifyProfileModal({ isOpen, onClose }: VerifyProfileModalProps) {
  const { error } = useToast();
  const [isPending, startTransition] = useTransition();
  const [modalState, setModalState] = useState<"loading" | "idle" | "uploading" | "success" | "pending">("loading");
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setModalState("loading");
      getVerificationStatusAction().then((status) => {
        if (status.hasPendingRequest) {
          setExistingVideoUrl(status.videoUrl);
          setModalState("pending");
        } else {
          setModalState("idle");
        }
      });
    } else {
      setTimeout(() => {
        setVideoFile(null);
        setIsAgreed(false);
        setUploadProgress(0);
        setCompressionProgress(0);
        setModalState("loading");
      }, 300);
    }
  }, [isOpen]);

  const handleRevoke = () => {
    startTransition(async () => {
      try {
        await revokeVerificationAction();
        setModalState("idle");
        setExistingVideoUrl(null);
      } catch (e) {
        error("Не удалось отозвать заявку");
      }
    });
  };

  const handleSave = () => {
    if (!videoFile || !isAgreed) return;

    setModalState("uploading");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("files", videoFile);
        const taskId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        
        const urls = await new Promise<string[]>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `/api/upload?taskId=${taskId}`, true);
          
          let pollInterval: NodeJS.Timeout;

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percent);
              
              if (percent === 100) {
                pollInterval = setInterval(async () => {
                  try {
                    const pRes = await fetch(`/api/upload/progress?taskId=${taskId}`);
                    if (pRes.ok) {
                      const data = await pRes.json();
                      setCompressionProgress(data.progress || 0);
                    }
                  } catch (e) {}
                }, 500);
              }
            }
          };
          
          xhr.onload = () => {
            clearInterval(pollInterval);
            setCompressionProgress(100);
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText);
                resolve(res.urls || res);
              } catch(err) {
                resolve([]);
              }
            } else {
              reject(new Error("Upload failed"));
            }
          };
          
          xhr.onerror = () => {
            clearInterval(pollInterval);
            reject(new Error("Network error"));
          };
          xhr.send(formData);
        });

        if (urls && urls.length > 0) {
          await requestVerificationAction(urls[0]);
          setExistingVideoUrl(urls[0]);
          setModalState("success");
          setTimeout(() => {
            setModalState("pending");
          }, 2500);
        }
      } catch (e) {
        setModalState("idle");
        error("Не удалось отправить заявку");
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024 * 1024) {
        error("Размер видео не должен превышать 500 МБ");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setVideoFile(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Верификация">
      <div className="flex flex-col relative min-h-75">
        
        {modalState === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size={48} />
          </div>
        )}

        {(modalState === "idle" || modalState === "uploading" || modalState === "success") && (
          <div className="flex flex-col animate-in fade-in duration-300 relative h-full">
            <p className="text-[15px] text-[#999999] text-center mb-6 px-4 leading-relaxed">
              Запишите видео, в котором объясните, почему вам нужна галочка и без неё никак.
            </p>

            <div 
              className="border-2 border-dashed border-secondary/50 hover:border-primary rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors mb-6 min-h-[200px]"
              onClick={() => {
                if (!videoFile && modalState === "idle") fileInputRef.current?.click();
              }}
            >
              <input 
                type="file" 
                accept="video/mp4,video/webm,video/quicktime" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {videoFile ? (
                <div className="w-full flex flex-col items-center relative">
                  <video 
                    src={URL.createObjectURL(videoFile)} 
                    className="max-h-55 w-auto rounded-xl object-contain mb-3 bg-black/20" 
                    controls={modalState === "idle"}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-[13px] text-secondary mt-1 text-center line-clamp-1 max-w-[90%] px-4">
                    {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} МБ)
                  </p>
                  {modalState === "idle" && (
                    <IconButton 
                      type="button"
                      className="absolute top-1 right-1 w-7 h-7 p-0 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-10"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setVideoFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X size={16} className="text-white" />
                    </IconButton>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Video size={42} className="text-secondary mb-4" strokeWidth={1.5} />
                  <p className="text-base text-primary font-medium text-center">
                    Нажмите, чтобы выбрать видео
                  </p>
                  <p className="text-sm text-secondary mt-2">
                    MP4, WebM или MOV, до 50 МБ
                  </p>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-8 px-1">
                <Checkbox checked={isAgreed} onChange={() => modalState === "idle" && setIsAgreed(!isAgreed)} label="Я соглашаюсь с тем, что моё видео могут увидеть все в дс" />
            </label>

            <div className="flex justify-center gap-4">
              <Button 
                variant="secondary"
                onClick={onClose}
                disabled={modalState !== "idle"} 
              >
                Отмена
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!isAgreed || !videoFile || modalState !== "idle"}
                variant="primary"
              >
                Отправить заявку
              </Button>
            </div>

            {/* Оверлей загрузки */}
            {modalState === "uploading" && (
              <div className="absolute -inset-4 md:-inset-6 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300 rounded-b-2xl">
                {uploadProgress < 100 ? (
                  <div className="w-48 flex flex-col items-center gap-4">
                    <Progress value={uploadProgress} />
                  </div>
                ) : (
                  <div className="w-48 flex flex-col items-center gap-4">
                    <Progress value={compressionProgress} />
                  </div>
                )}
                <p className="mt-6 text-primary font-medium text-lg animate-pulse text-center px-4">
                  {uploadProgress < 100 
                    ? `Загрузка видео... ${uploadProgress}%` 
                    : `Сжатие видео... ${compressionProgress}%`}
                </p>
                <p className="mt-2 text-secondary text-sm">
                  Пожалуйста, не закрывайте окно
                </p>
              </div>
            )}

            {/* Оверлей успеха */}
            {modalState === "success" && (
              <div className="absolute -inset-4 md:-inset-6 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300 rounded-b-2xl">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center relative z-10 animate-in zoom-in duration-500">
                    <CheckCircle className="w-12 h-12 text-green-500 animate-draw drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" strokeWidth={3} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                  Заявка отправлена!
                </h3>
                <p className="text-secondary text-center animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                  Она будет рассмотрена в ближайшее время
                </p>
              </div>
            )}
          </div>
        )}

        {modalState === "pending" && (
          <div className="flex flex-col items-center justify-center pt-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Заявка на рассмотрении</h3>
            <p className="text-secondary text-center mb-8 px-4 text-sm leading-relaxed">
              Вы уже подали заявку на верификацию. Ожидайте решения администратора.
            </p>
            
            {existingVideoUrl && (
              <div className="w-full max-w-[240px] mb-8">
                <p className="text-sm font-medium text-primary mb-3">Ваше видео:</p>
                <video 
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${existingVideoUrl}`}
                  className="w-full rounded-xl object-cover bg-black/20" 
                  controls
                />
              </div>
            )}

            <div className="w-full flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Закрыть
              </Button>
              <Button variant="primary" className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleRevoke} disabled={isPending}>
                {isPending ? "Отзыв..." : "Отозвать заявку"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
