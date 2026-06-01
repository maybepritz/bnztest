"use client";

import { Input, Button, Toast, useToast } from "@/shared/ui";
import { useState, useTransition, useEffect } from "react";
import { updateProfileAction } from "../actions";
import { createPortal } from "react-dom";
import { X, User, Palette, Shield, Lock, Bell, Hand, Camera, Loader2 } from "lucide-react";
import { useRef } from "react";
import { Avatar } from "@/shared/ui/Avatar";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username?: string | null;
    name?: string | null;
    bio?: string | null;
    image?: string | null;
    banner?: string | null;
  };
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "");
  const [close, setClose] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [image, setImage] = useState(user.image || null);
  const [banner, setBanner] = useState(user.banner || null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isShaking, setIsShaking] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasChanges = name !== (user.name || "") || bio !== (user.bio || "") || image !== (user.image || null);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfileAction({ name, bio, image: image || undefined, banner: banner || undefined });
        // Don't close automatically, just save
      } catch (e) {
        console.error(e);
      }
    });
  };

  const resetChanges = () => {
    setName(user.name || "");
    setBio(user.bio || "");
    setImage(user.image || null);
  };

  const { error } = useToast();

  const checkFileSize = (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      error("Файл слишком большой! Максимальный размер: 500 МБ.");
      return false;
    }
    return true;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!checkFileSize(file)) {
      e.target.value = '';
      return;
    }

    setIsAvatarUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        setImage(data.urls[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAvatarUploading(false);
    }
  };


  const handleClose = () => {
    if(!hasChanges){
      setClose(true);
      onClose();
      return;
    }

    setClose(false);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };  

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasChanges, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-200 h-[60vh] min-h-50 flex rounded-2xl overflow-hidden shadow-2xl animate-scale-in bg-surface/70 backdrop-blur-3xl border border-white/5">

        {/* Left Sidebar */}
        <div className="w-65 bg-white/5 flex-col pt-12 pb-6 shrink-0 z-10 border-r border-border hidden sm:flex">
          <h2 className="text-[12px] font-bold text-secondary uppercase px-6 mb-3 tracking-wider">Настройки</h2>
          <nav className="flex flex-col gap-1 px-3">
            <Button variant="ghost" className="justify-start text-primary bg-hover h-10 px-3">
              <User size={18} /> Аккаунт
            </Button>
            <Button variant="ghost" className="justify-start text-secondary hover:text-primary h-10 px-3 transition-colors">
              <Palette size={18} /> Оформление
            </Button>
            <Button variant="ghost" className="justify-start text-secondary hover:text-primary h-10 px-3 transition-colors">
              <Shield size={18} /> Безопасность
            </Button>
            <Button variant="ghost" className="justify-start text-secondary hover:text-primary h-10 px-3 transition-colors">
              <Hand size={18} /> Приватность
            </Button>
            <Button variant="ghost" className="justify-start text-secondary hover:text-primary h-10 px-3 transition-colors">
              <Bell size={18} /> Уведомления
            </Button>
          </nav>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col pt-12 px-6 sm:px-12 pb-12 overflow-y-auto relative custom-scrollbar">
          <h1 className="text-xl font-bold text-primary mb-8">Аккаунт</h1>

          <div className="flex flex-col gap-0">
            {/* Avatar Section */}
            <div className="flex flex-col py-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-primary text-base font-medium mb-1">Аватар</h3>
                  <p className="text-secondary text-sm">Загрузите квадратное изображение</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar src={image} fallback={user.name?.[0]?.toUpperCase() || "?"} size="xl" className="w-20 h-20 text-2xl border-2" />
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAvatarUploading ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </div>

            {/* Name Section */}
            <div className="flex flex-col py-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-primary font-medium mb-1">Имя</h3>
                  <p className="text-secondary text-sm">Ваше отображаемое имя</p>
                </div>
                <div className="w-full sm:w-70">
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Как вас зовут?"
                  />
                </div>
              </div>
            </div>

            {/* Username Section */}
            <div className="flex flex-col py-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-primary font-medium mb-1">Username</h3>
                  <p className="text-secondary text-sm">Ваш уникальный идентификатор (только латиница, цифры и _)</p>
                </div>
                <div className="w-full sm:w-70 opacity-70">
                  <Input
                    value={user.username || ""}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="flex flex-col py-5">
              <div className="mb-3">
                <h3 className="text-primary font-medium mb-1">О себе</h3>
                <p className="text-secondary text-sm">Расскажите немного о себе</p>
              </div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="bg-surface-hover text-primary rounded-lg px-4 py-3 w-full border border-border focus:border-primary outline-none text-[15px] resize-none min-h-[120px] placeholder:text-secondary/50 transition-colors"
                placeholder="Напиши что-нибудь о себе..."
                style={{ background: "color-mix(in srgb, var(--surface) 80%, transparent)" }}
              />
            </div>

            <div className="flex flex-col items-center pt-5">
              <Button
                variant="ghost"
                size="sm"
                className="w-max px-4"
                onClick={() => {
                  setName("");
                  setBio("");
                  setImage(null);
                }}
                disabled={isPending}
              >
                Удалить аккаунт
              </Button>
            </div>

          </div>

          {/* Floating Save/Cancel Bar */}
          <Toast
            isVisible={hasChanges && !close}
            position="bottom-center"
            className={`w-[90%] sm:w-125 sm:left-auto sm:right-[5%] lg:right-[15%] sm:translate-x-0 ${isShaking ? "animate-shake" : ""}`}
          >
            <span className="text-primary text-[14px] font-medium">Осторожно - у вас есть несохранённые изменения!</span>
            <div className="flex gap-2 items-center shrink-0 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetChanges}
                disabled={isPending}
              >
                Сбросить
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isPending}
              >
                Сохранить изменения
              </Button>
            </div>
          </Toast>

          {/* Close button outside content area */}
          <div className="hidden sm:flex absolute top-4 right-4 z-20">
            <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={handleClose}>
              <div className="bg-surface-secondary group-hover:bg-hover border border-border rounded-full p-2 text-secondary group-hover:text-primary transition-colors">
                <X size={20} />
              </div>
              <span className="text-[11px] font-bold text-secondary group-hover:text-primary">ESC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
