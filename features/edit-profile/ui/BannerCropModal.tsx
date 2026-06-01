"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Modal } from "@/shared/ui/Modal";
import { Button, Progress } from "@/shared/ui";
import { CheckCircle, Image as ImageIcon } from "lucide-react";

interface BannerCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  fileName: string;
  onUploadSuccess: (url: string) => void;
  onFileSelect: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = (rotation * Math.PI) / 180;

  const { width: bBoxWidth, height: bBoxHeight } = {
    width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
    height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
  };

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg", 0.95);
  });
}

export function BannerCropModal({ isOpen, onClose, imageSrc, fileName, onUploadSuccess, onFileSelect }: BannerCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  const [modalState, setModalState] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setModalState("uploading");
      setUploadProgress(0);
      setCompressionProgress(0);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");

      const fileToUpload = new File([croppedBlob], fileName || "banner.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("files", fileToUpload);

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
        setModalState("success");
        setTimeout(() => {
          onUploadSuccess(urls[0]);
        }, 1500);
      } else {
        setModalState("idle");
      }
    } catch (e) {
      console.error(e);
      setModalState("idle");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Обрезать баннер">
      <div className="flex flex-col gap-4 mt-4 relative" onClick={(e) => e.stopPropagation()}>
        
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
                ? `Загрузка баннера... ${uploadProgress}%` 
                : `Сжатие баннера... ${compressionProgress}%`}
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
              Баннер загружен!
            </h3>
            <p className="text-secondary text-center animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
              Профиль обновлен
            </p>
          </div>
        )}

        <div className="relative w-full h-[400px] bg-black/10 rounded-xl overflow-hidden flex flex-col items-center justify-center">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={3} // Banner typical aspect ratio (e.g. 3:1)
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
            />
          ) : (
            <div 
              className="border-2 border-dashed border-secondary/50 hover:border-primary rounded-3xl w-[90%] h-[90%] flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={onFileSelect}
            >
              <ImageIcon size={42} className="text-secondary mb-4" strokeWidth={1.5} />
              <p className="text-base text-primary font-medium text-center">
                Нажмите, чтобы выбрать изображение
              </p>
              <p className="text-sm text-secondary mt-2">
                JPEG, PNG или WebP, до 500 МБ
              </p>
            </div>
          )}
        </div>
        
        {imageSrc && (
          <div className="flex justify-between items-center mt-2 gap-4 animate-in fade-in">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onClose} disabled={modalState !== "idle"}>Отмена</Button>
          {imageSrc && (
            <Button variant="primary" onClick={handleApply} disabled={modalState !== "idle"}>Применить</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
