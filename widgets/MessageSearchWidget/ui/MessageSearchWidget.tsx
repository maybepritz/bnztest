"use client";

import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/shared/ui";

export function MessageSearchWidget() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col gap-6 pb-12 pt-2 animate-fade-in">
      <div className="px-2">
        <Input
          placeholder="Поиск по сообщениям..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={18} />}
          className="bg-surface/50 border-border/40 backdrop-blur-md h-14 rounded-2xl text-lg cursor-not-allowed opacity-60"
          disabled
        />
      </div>

      <div className="px-2">
        <div className="text-center p-12 text-secondary bg-surface/40 backdrop-blur-md rounded-3xl border border-border/20 max-w-lg mx-auto mt-4 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <MessageSquare size={32} />
          </div>
          <p className="text-xl font-bold text-primary mb-2">Глобальный поиск сообщений</p>
          <p className="text-sm text-secondary leading-relaxed">
            Поиск сообщений по всем чатам временно недоступен на сервере.
          </p>
          <p className="text-xs text-secondary/70 mt-3 border-t border-border/20 pt-3">
            Вы можете искать сообщения внутри любого диалога с помощью кнопки поиска 🔍 в верхнем меню чата.
          </p>
        </div>
      </div>
    </div>
  );
}
