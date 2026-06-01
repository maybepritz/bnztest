"use client";

import { useState, useRef, useTransition } from "react";
import { IconButton } from "@/shared/ui";
import { Palette, Loader2 } from "lucide-react";
import { updateProfileAction } from "../actions";
import { BannerCropModal } from "./BannerCropModal";

interface BannerUploadButtonProps {
  currentBanner?: string | null;
}

export function BannerUploadButton({ currentBanner }: BannerUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      alert("Файл слишком большой! Максимальный размер: 500 МБ.");
      e.target.value = '';
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.addEventListener("load", () => setSelectedImageSrc(reader.result?.toString() || null));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUploadSuccess = (url: string) => {
    setSelectedImageSrc(null);
    setIsModalOpen(false);
    startTransition(async () => {
      await updateProfileAction({ banner: url });
    });
  };

  return (
    <>
      <IconButton 
        variant="glass" 
        title="Изменить баннер"
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        disabled={isUploading || isPending}
      >
        {isUploading || isPending ? (
          <Loader2 size={20} className="text-white animate-spin" />
        ) : (
          <Palette size={20} className="text-white" />
        )}
      </IconButton>
      
      <BannerCropModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImageSrc(null);
        }}
        imageSrc={selectedImageSrc}
        fileName={selectedFileName}
        onUploadSuccess={handleUploadSuccess}
        onFileSelect={() => fileInputRef.current?.click()}
      />
      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleBannerChange}
      />
    </>
  );
}
