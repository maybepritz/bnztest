"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Trash2, BellOff, Bell, User as UserIcon, Search, Phone, Eraser, Info, Users } from "lucide-react";
import { IconButton, DropdownMenu, DropdownItem, DropdownDivider } from "@/shared/ui";
import { deleteChat } from "@/features/chat/actions";
import { useRouter } from "next/navigation";

interface ChatSettingsProps {
  chatId: string;
  targetUsername: string;
}

export function ChatSettings({ chatId, targetUsername }: ChatSettingsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Basic local storage muting
    const mutedChats = JSON.parse(localStorage.getItem("mutedChats") || "[]");
    setIsMuted(mutedChats.includes(chatId));
  }, [chatId]);

  const toggleMute = () => {
    let mutedChats = JSON.parse(localStorage.getItem("mutedChats") || "[]");
    if (isMuted) {
      mutedChats = mutedChats.filter((id: string) => id !== chatId);
    } else {
      mutedChats.push(chatId);
    }
    localStorage.setItem("mutedChats", JSON.stringify(mutedChats));
    setIsMuted(!isMuted);
  };

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.")) {
      await deleteChat(chatId);
      router.push("/");
    }
  };

  const handleProfile = () => {
    router.push(`/@${targetUsername}`);
  };

  return (
    <DropdownMenu
      align="right"
      trigger={
        <IconButton variant="ghost" className="rounded-full hover:bg-background/50 transition-colors">
          <MoreVertical size={18} className="text-secondary" />
        </IconButton>
      }
    >
      <DropdownItem icon={<UserIcon size={18} />} onClick={handleProfile}>
        Посмотреть профиль
      </DropdownItem>
      <DropdownItem icon={<Info size={18} />} onClick={handleProfile}>
        Информация
      </DropdownItem>
      <DropdownItem icon={<Users size={18} />} onClick={handleProfile}>
        Создать группу
      </DropdownItem>

      <DropdownDivider />
      <DropdownItem
        icon={isMuted ? <Bell size={18} /> : <BellOff size={18} />}
        onClick={toggleMute}
      >
        {isMuted ? "Включить уведомления" : "Отключить уведомления"}
      </DropdownItem>
      <DropdownItem icon={<Eraser size={18} />}>Очистить историю</DropdownItem>
      <DropdownItem icon={<Trash2 size={18} />} onClick={handleDelete} danger>
        Удалить чат
      </DropdownItem>
    </DropdownMenu>
  );
}
