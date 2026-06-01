"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button, RadioGroup, RadioItem } from "@/shared/ui";

const REASONS = [
  "Спам или нежелательный контент",
  "Насилие или опасные действия",
  "Ненависть или травля",
  "Контент для взрослых (18+)",
  "Дезинформация или обман",
  "Другое",
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    // Имитация отправки репорта на бэкенд
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    
    // Сбросить состояние
    setSelectedReason(null);
    setDescription("");
    onClose();
    
    // Можно показать тост-уведомление "Жалоба отправлена"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Пожаловаться" description="Выберите причину жалобы">
      <div className="flex flex-col gap-3 mt-4 overflow-y-auto max-h-[60vh] custom-scrollbar pb-2 px-1 -mx-1">
        <RadioGroup name="reportReason" value={selectedReason || ""} onChange={setSelectedReason} className="gap-3">
          {REASONS.map(reason => (
            <RadioItem
              key={reason}
              value={reason}
              label={reason}
              className={`p-4 rounded-xl border transition-colors w-full ${
                selectedReason === reason 
                  ? "border-primary bg-surface-hover" 
                  : "border-border/50 bg-surface hover:border-border hover:bg-surface-hover/50"
              }`}
            />
          ))}
        </RadioGroup>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите подробнее (необязательно)..."
          className="w-full bg-surface border border-border/50 rounded-xl p-4 text-[15px] text-primary placeholder:text-secondary/70 focus:outline-none focus:border-primary/50 resize-none mt-2 transition-colors min-h-[100px]"
        />

        <div className="flex justify-end items-center gap-3 mt-4 pt-2 border-t border-border/40">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!selectedReason}
            isLoading={isSubmitting}
          >
            Отправить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
